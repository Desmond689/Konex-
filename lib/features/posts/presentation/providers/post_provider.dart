import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/config/constants.dart';
import '../../../../core/config/dependency_injection.dart';
import '../../../../core/errors/result.dart';
import '../../data/datasources/post_remote_data_source.dart';
import '../../data/repositories/post_repository_impl.dart';
import '../../domain/entities/post_entity.dart';
import '../../domain/repositories/post_repository.dart';

final postRemoteProvider = Provider<PostRemoteDataSource>((ref) {
  return PostRemoteDataSource(ref.watch(supabaseClientProvider));
});

final postRepositoryProvider = Provider<PostRepository>((ref) {
  return PostRepositoryImpl(ref.watch(postRemoteProvider));
});

class FeedState {
  const FeedState({
    this.posts = const [],
    this.page = 0,
    this.loading = false,
    this.loadingMore = false,
    this.hasMore = true,
    this.error,
    this.mode = 'forYou',
    this.communityFilter,
  });

  final List<PostEntity> posts;
  final int page;
  final bool loading;
  final bool loadingMore;
  final bool hasMore;
  final String? error;
  /// forYou | following | latest
  final String mode;
  final String? communityFilter;

  FeedState copyWith({
    List<PostEntity>? posts,
    int? page,
    bool? loading,
    bool? loadingMore,
    bool? hasMore,
    String? error,
    String? mode,
    String? communityFilter,
    bool clearError = false,
    bool clearFilter = false,
  }) {
    return FeedState(
      posts: posts ?? this.posts,
      page: page ?? this.page,
      loading: loading ?? this.loading,
      loadingMore: loadingMore ?? this.loadingMore,
      hasMore: hasMore ?? this.hasMore,
      error: clearError ? null : (error ?? this.error),
      mode: mode ?? this.mode,
      communityFilter:
          clearFilter ? null : (communityFilter ?? this.communityFilter),
    );
  }
}

class FeedController extends StateNotifier<FeedState> {
  FeedController(this._repo) : super(const FeedState());

  final PostRepository _repo;

  Future<void> setMode(String mode) async {
    if (state.mode == mode) return;
    state = state.copyWith(mode: mode);
    await loadInitial();
  }

  Future<void> setCommunityFilter(String? communityId) async {
    state = state.copyWith(
      communityFilter: communityId,
      clearFilter: communityId == null,
    );
    await loadInitial();
  }

  Future<void> loadInitial() async {
    state = state.copyWith(loading: true, clearError: true);
    final result = await _fetch(page: 0);
    result.when(
      success: (posts) {
        state = state.copyWith(
          posts: posts,
          page: 0,
          loading: false,
          hasMore: posts.length >= AppConstants.feedPageSize,
        );
      },
      failure: (e, _) =>
          state = state.copyWith(loading: false, error: e.toString()),
    );
  }

  Future<void> loadMore() async {
    if (state.loadingMore || !state.hasMore) return;
    state = state.copyWith(loadingMore: true);
    final next = state.page + 1;
    final result = await _fetch(page: next);
    result.when(
      success: (posts) {
        state = state.copyWith(
          posts: [...state.posts, ...posts],
          page: next,
          loadingMore: false,
          hasMore: posts.length >= AppConstants.feedPageSize,
        );
      },
      failure: (e, _) =>
          state = state.copyWith(loadingMore: false, error: e.toString()),
    );
  }

  Future<Result<List<PostEntity>>> _fetch({required int page}) {
    switch (state.mode) {
      case 'following':
        return _repo.getFollowingFeed(page: page);
      case 'latest':
        return _repo.getLatestFeed(page: page);
      default:
        return _repo.getForYouFeed(
          page: page,
          communityFilter: state.communityFilter,
        );
    }
  }

  Future<void> toggleLike(PostEntity post) async {
    final idx = state.posts.indexWhere((p) => p.id == post.id);
    if (idx < 0) return;
    final liked = post.likedByMe;
    final updated = post.copyWith(
      likedByMe: !liked,
      likeCount: liked ? post.likeCount - 1 : post.likeCount + 1,
    );
    final list = [...state.posts];
    list[idx] = updated;
    state = state.copyWith(posts: list);

    final result =
        liked ? await _repo.unlikePost(post.id) : await _repo.likePost(post.id);
    if (result.isFailure) {
      list[idx] = post;
      state = state.copyWith(posts: list);
    }
  }

  Future<void> toggleSave(PostEntity post) async {
    final idx = state.posts.indexWhere((p) => p.id == post.id);
    if (idx < 0) return;
    final saved = post.savedByMe;
    final updated = post.copyWith(savedByMe: !saved);
    final list = [...state.posts];
    list[idx] = updated;
    state = state.copyWith(posts: list);

    final result =
        saved ? await _repo.unsavePost(post.id) : await _repo.savePost(post.id);
    if (result.isFailure) {
      list[idx] = post;
      state = state.copyWith(posts: list);
    }
  }

  Future<void> deletePost(String postId) async {
    final original = [...state.posts];
    final filtered = state.posts.where((p) => p.id != postId).toList();
    if (filtered.length == state.posts.length) return;
    state = state.copyWith(posts: filtered);

    final result = await _repo.deletePost(postId);
    if (result.isFailure) {
      state = state.copyWith(posts: original);
    }
  }

  Future<bool> createText(String body) async {
    final result = await _repo.createTextPost(body: body);
    return result.when(
      success: (post) {
        state = state.copyWith(posts: [post, ...state.posts]);
        return true;
      },
      failure: (_, __) => false,
    );
  }
}

final feedControllerProvider =
    StateNotifierProvider<FeedController, FeedState>((ref) {
  return FeedController(ref.watch(postRepositoryProvider));
});
