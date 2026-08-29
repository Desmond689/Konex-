import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../notifications/presentation/providers/notification_provider.dart';
import '../../../chat/presentation/providers/chat_provider.dart';

import '../../../../core/router/routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/kx_empty_state.dart';
import '../../../../core/widgets/kx_error_view.dart';
import '../../../communities/presentation/providers/community_provider.dart';
import '../../../posts/presentation/providers/post_provider.dart';
import '../../../posts/presentation/widgets/post_card.dart';
import '../../../posts/presentation/screens/create_post_screen.dart';
import '../../../stories/presentation/widgets/stories_row.dart';

/// Home — extend existing feed UI (not a from-scratch rebuild).
class HomeFeedScreen extends ConsumerStatefulWidget {
  const HomeFeedScreen({super.key});

  @override
  ConsumerState<HomeFeedScreen> createState() => _HomeFeedScreenState();
}

class _HomeFeedScreenState extends ConsumerState<HomeFeedScreen>
    with SingleTickerProviderStateMixin {
  final _scroll = ScrollController();
  late TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    _tabs.addListener(() {
      if (_tabs.indexIsChanging) return;
      final mode = switch (_tabs.index) {
        1 => 'following',
        2 => 'latest',
        _ => 'forYou',
      };
      ref.read(feedControllerProvider.notifier).setMode(mode);
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(feedControllerProvider.notifier).loadInitial();
    });
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 400) {
        ref.read(feedControllerProvider.notifier).loadMore();
      }
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final feed = ref.watch(feedControllerProvider);
    final myGames = ref.watch(myCommunitiesProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('KONEX', style: AppTextStyles.brand.copyWith(fontSize: 18, letterSpacing: 1.5)),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push(Routes.search),
          ),
          IconButton(
            tooltip: 'Inbox',
            onPressed: () => context.go(Routes.inbox),
            icon: Badge(
              isLabelVisible: (ref.watch(inboxProvider).valueOrNull ?? [])
                  .fold<int>(0, (s, c) => s + c.unreadCount) > 0,
              label: Text(
                () {
                  final n = (ref.watch(inboxProvider).valueOrNull ?? [])
                      .fold<int>(0, (s, c) => s + c.unreadCount);
                  return n > 99 ? '99+' : '$n';
                }(),
                style: const TextStyle(fontSize: 10),
              ),
              child: const Icon(Icons.chat_bubble_outline),
            ),
          ),
          IconButton(
            onPressed: () => context.push(Routes.notifications),
            icon: Badge(
              isLabelVisible: (ref.watch(unreadNotificationsProvider).valueOrNull ?? 0) > 0,
              label: Text(
                () {
                  final n = ref.watch(unreadNotificationsProvider).valueOrNull ?? 0;
                  return n > 99 ? '99+' : '$n';
                }(),
                style: const TextStyle(fontSize: 10),
              ),
              child: const Icon(Icons.notifications_outlined),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(text: 'For You'),
            Tab(text: 'Following'),
            Tab(text: 'Latest'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        onPressed: () async {
          final created = await Navigator.of(context).push<bool>(
            MaterialPageRoute(builder: (_) => const CreatePostScreen()),
          );
          if (created == true) {
            ref.read(feedControllerProvider.notifier).loadInitial();
          }
        },
        child: const Icon(Icons.add),
      ),
      body: Column(
        children: [
          const StoriesRow(),
          _MyGamesBar(
            asyncGames: myGames,
            selectedId: feed.communityFilter,
            onSelect: (id) {
              ref.read(feedControllerProvider.notifier).setCommunityFilter(id);
            },
            onManage: () => context.go(Routes.communities),
          ),
          Expanded(child: _buildBody(feed, myGames)),
        ],
      ),
    );
  }

  Widget _buildBody(FeedState feed, AsyncValue myGames) {
    final noGames = myGames.maybeWhen(
      data: (list) => list.isEmpty,
      orElse: () => false,
    );

    if (feed.loading && feed.posts.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }
    if (feed.error != null && feed.posts.isEmpty) {
      return KxErrorView(
        message: feed.error!,
        onRetry: () => ref.read(feedControllerProvider.notifier).loadInitial(),
      );
    }

    if (noGames && feed.mode == 'forYou' && feed.posts.isEmpty) {
      return KxEmptyState(
        title: 'Welcome to KONEX',
        subtitle: 'Choose the games you play to personalize your feed.',
        icon: Icons.sports_esports_outlined,
        action: TextButton(
          onPressed: () => context.go(Routes.communities),
          child: const Text('Choose Games'),
        ),
      );
    }

    if (feed.posts.isEmpty) {
      return KxEmptyState(
        title: feed.mode == 'following' ? 'No posts from people you follow' : 'No posts yet',
        subtitle: feed.mode == 'following'
            ? 'Follow gamers to see their posts here.'
            : 'Be the first to share a clip or thought.',
        icon: Icons.sports_esports_outlined,
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(feedControllerProvider.notifier).loadInitial(),
      color: AppColors.primary,
      child: ListView.builder(
        controller: _scroll,
        itemCount: feed.posts.length + (feed.loadingMore ? 1 : 0) + 1,
        itemBuilder: (context, i) {
          if (i == 0) return const _SquadSpotlightCard();
          final postIndex = i - 1;
          if (postIndex >= feed.posts.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator()),
            );
          }
          return PostCard(
            key: ValueKey(feed.posts[postIndex].id),
            post: feed.posts[postIndex],
          );
        },
      ),
    );
  }
}

class _SquadSpotlightCard extends StatelessWidget {
  const _SquadSpotlightCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withValues(alpha: 0.35),
            const Color(0xFF1A0A2E),
          ],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.25),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.emoji_events, color: AppColors.primary, size: 28),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SQUAD SPOTLIGHT',
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                    fontSize: 10,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Top ranked squads this week',
                  style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600),
                ),
                Text(
                  'Join or create a squad to compete',
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.textMuted),
        ],
      ),
    );
  }
}

class _MyGamesBar extends StatelessWidget {
  const _MyGamesBar({
    required this.asyncGames,
    required this.selectedId,
    required this.onSelect,
    required this.onManage,
  });

  final AsyncValue asyncGames;
  final String? selectedId;
  final void Function(String? id) onSelect;
  final VoidCallback onManage;

  @override
  Widget build(BuildContext context) {
    return asyncGames.when(
      loading: () => const SizedBox(height: 56),
      error: (_, __) => const SizedBox.shrink(),
      data: (games) {
        return SizedBox(
          height: 56,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            children: [
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: const Text('All'),
                  selected: selectedId == null,
                  selectedColor: AppColors.primary,
                  checkmarkColor: Colors.white,
                  labelStyle: TextStyle(
                    color: selectedId == null ? Colors.white : AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                  onSelected: (_) => onSelect(null),
                ),
              ),
              ...games.map(
                (g) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(g.name),
                    selected: selectedId == g.id,
                    selectedColor: AppColors.primary,
                    checkmarkColor: Colors.white,
                    labelStyle: TextStyle(
                      color: selectedId == g.id ? Colors.white : AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                    onSelected: (sel) {
                      if (sel) {
                        onSelect(g.id);
                      } else {
                        onSelect(null);
                      }
                    },
                    avatar: g.avatarUrl != null
                        ? CircleAvatar(backgroundImage: NetworkImage(g.avatarUrl!))
                        : null,
                  ),
                ),
              ),
              TextButton(
                onPressed: onManage,
                child: const Text('Manage'),
              ),
            ],
          ),
        );
      },
    );
  }
}
