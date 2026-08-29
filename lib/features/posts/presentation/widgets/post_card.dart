import '../../../../core/deep_links/share_service.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/config/dependency_injection.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../social/presentation/report_dialog.dart';
import '../../data/repost_helper.dart';
import '../../domain/entities/post_entity.dart';
import '../providers/post_provider.dart';
import '../screens/comments_sheet.dart';
import '../../../media/presentation/video_post_player.dart';
import '../../../../core/services/data_saver_service.dart';

class PostCard extends ConsumerWidget {
  const PostCard({
    super.key,
    required this.post,
    this.onDeleted,
  });
  final PostEntity post;
  final void Function(String postId)? onDeleted;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final feed = ref.read(feedControllerProvider.notifier);

    return _PostCardBody(post: post, feed: feed, onDeleted: onDeleted);
  }
}

class _PostCardBody extends ConsumerStatefulWidget {
  const _PostCardBody({required this.post, required this.feed, this.onDeleted});
  final PostEntity post;
  final dynamic feed;
  final void Function(String postId)? onDeleted;

  @override
  ConsumerState<_PostCardBody> createState() => _PostCardBodyState();
}

class _PostCardBodyState extends ConsumerState<_PostCardBody>
    with SingleTickerProviderStateMixin {
  late final AnimationController _heartCtrl;
  bool _showHeart = false;

  @override
  void initState() {
    super.initState();
    _heartCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
  }

  @override
  void dispose() {
    _heartCtrl.dispose();
    super.dispose();
  }

  Future<void> _doubleTapLike() async {
    final post = widget.post;
    if (!post.likedByMe) {
      await widget.feed.toggleLike(post);
    }
    setState(() => _showHeart = true);
    await _heartCtrl.forward(from: 0);
    if (mounted) setState(() => _showHeart = false);
  }

  @override
  Widget build(BuildContext context) {
    final post = widget.post;
    final feed = widget.feed;
    final currentUserId = ref.read(supabaseClientProvider).auth.currentUser?.id;
    final isAuthor = currentUserId != null && currentUserId == post.authorId;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: GestureDetector(
        onDoubleTap: _doubleTapLike,
        child: Stack(
          alignment: Alignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
            Row(
              children: [
                GestureDetector(
                  onTap: () => context.push('/user/${post.authorId}'),
                  child: CircleAvatar(
                    radius: 18,
                    backgroundColor: AppColors.surfaceElevated,
                    backgroundImage: post.authorAvatarUrl != null
                        ? CachedNetworkImageProvider(post.authorAvatarUrl!)
                        : null,
                    child: post.authorAvatarUrl == null
                        ? Text(
                            post.authorDisplay.isNotEmpty
                                ? post.authorDisplay[0].toUpperCase()
                                : '?',
                          )
                        : null,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(post.authorDisplay, style: AppTextStyles.title.copyWith(fontSize: 15)),
                      Text(
                        post.destinationLabel,
                        style: AppTextStyles.caption,
                      ),
                      Text(
                        DateFormat.MMMd().add_jm().format(post.createdAt.toLocal()),
                        style: AppTextStyles.caption,
                      ),
                    ],
                  ),
                ),
                if (post.communityName != null)
                  Chip(
                    label: Text(post.communityName!, style: AppTextStyles.caption),
                    visualDensity: VisualDensity.compact,
                    backgroundColor: AppColors.surfaceElevated,
                  ),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_horiz, size: 20),
                  onSelected: (v) async {
                    if (v == 'report') {
                      await showReportDialog(
                        context,
                        targetType: 'post',
                        targetId: post.id,
                      );
                    } else if (v == 'share') {
                      ShareService.sharePost(context, post.id);
                    } else if (v == 'repost') {
                      final helper = RepostHelper(ref.read(supabaseClientProvider));
                      await helper.repost(post.id);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Reposted')),
                        );
                      }
                    } else if (v == 'delete') {
                      final result = await ref.read(postRepositoryProvider).deletePost(post.id);
                      result.when(
                        success: (_) async {
                          await ref.read(feedControllerProvider.notifier).deletePost(post.id);
                          widget.onDeleted?.call(post.id);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Post deleted')),
                            );
                          }
                        },
                        failure: (e, _) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Could not delete post: $e')),
                            );
                          }
                        },
                      );
                    }
                  },
                  itemBuilder: (_) {
                    final items = <PopupMenuEntry<String>>[
                      const PopupMenuItem(value: 'repost', child: Text('Repost')),
                      const PopupMenuItem(value: 'share', child: Text('Share')),
                      const PopupMenuItem(value: 'report', child: Text('Report')),
                    ];
                    if (isAuthor) {
                      items.add(const PopupMenuItem(value: 'delete', child: Text('Delete post')));
                    }
                    return items;
                  },
                ),
              ],
            ),
            if (post.body != null && post.body!.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(post.body!, style: AppTextStyles.body),
            ],
            if (post.postType == 'video' && post.mediaUrls.isNotEmpty) ...[
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: VideoPostPlayer(url: post.mediaUrls.first),
              ),
            ] else if (post.mediaUrls.isNotEmpty) ...[
              const SizedBox(height: 10),
              _PostMediaCarousel(
                urls: post.mediaUrls,
                dataSaver: ref.watch(dataSaverEnabledProvider).valueOrNull == true,
              ),
            ],
            const SizedBox(height: 8),
            Row(
              children: [
                _Action(
                  icon: post.likedByMe ? Icons.favorite : Icons.favorite_border,
                  color: post.likedByMe ? AppColors.accent : AppColors.textSecondary,
                  label: '${post.likeCount}',
                  onTap: () => feed.toggleLike(post),
                ),
                const SizedBox(width: 16),
                _Action(
                  icon: Icons.chat_bubble_outline,
                  label: '${post.commentCount}',
                  onTap: () => showCommentsSheet(context, post.id, postAuthorId: post.authorId),
                ),
                const SizedBox(width: 16),
                _Action(
                  icon: post.savedByMe ? Icons.bookmark : Icons.bookmark_border,
                  color: post.savedByMe ? AppColors.secondary : AppColors.textSecondary,
                  label: 'Save',
                  onTap: () => feed.toggleSave(post),
                ),
              ],
            ),
          ],
        ),
      ),
            if (_showHeart)
              ScaleTransition(
                scale: Tween(begin: 0.6, end: 1.2).animate(
                  CurvedAnimation(parent: _heartCtrl, curve: Curves.easeOutBack),
                ),
                child: const Icon(
                  Icons.favorite,
                  size: 88,
                  color: Color(0xFFFF2D55),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _Action extends StatelessWidget {
  const _Action({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        child: Row(
          children: [
            Icon(icon, size: 20, color: color ?? AppColors.textSecondary),
            const SizedBox(width: 4),
            Text(label, style: AppTextStyles.caption),
          ],
        ),
      ),
    );
  }
}


class _PostMediaCarousel extends StatefulWidget {
  const _PostMediaCarousel({required this.urls, this.dataSaver = false});
  final List<String> urls;
  final bool dataSaver;

  @override
  State<_PostMediaCarousel> createState() => _PostMediaCarouselState();
}

class _PostMediaCarouselState extends State<_PostMediaCarousel> {
  final _page = PageController();
  int _index = 0;

  @override
  void dispose() {
    _page.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final urls = widget.urls;
    final cache = widget.dataSaver ? 720 : 1200;
    if (urls.length == 1) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: CachedNetworkImage(
          imageUrl: urls.first,
          fit: BoxFit.cover,
          width: double.infinity,
          height: 280,
          memCacheWidth: cache,
          memCacheHeight: cache,
          placeholder: (_, __) => Container(
            height: 280,
            color: AppColors.surfaceElevated,
            child: const Center(child: CircularProgressIndicator()),
          ),
          errorWidget: (_, __, ___) => Container(
            height: 120,
            color: AppColors.surfaceElevated,
            child: const Icon(Icons.broken_image),
          ),
        ),
      );
    }

    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: SizedBox(
            height: 280,
            child: PageView.builder(
              controller: _page,
              itemCount: urls.length,
              onPageChanged: (i) => setState(() => _index = i),
              itemBuilder: (_, i) {
                return CachedNetworkImage(
                  imageUrl: urls[i],
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: 280,
                  memCacheWidth: cache,
                  memCacheHeight: cache,
                  placeholder: (_, __) => Container(
                    color: AppColors.surfaceElevated,
                    child: const Center(child: CircularProgressIndicator()),
                  ),
                  errorWidget: (_, __, ___) => Container(
                    color: AppColors.surfaceElevated,
                    child: const Icon(Icons.broken_image),
                  ),
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(urls.length, (i) {
            final active = i == _index;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: active ? 8 : 6,
              height: active ? 8 : 6,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: active
                    ? AppColors.primary
                    : AppColors.textMuted.withValues(alpha: 0.4),
              ),
            );
          }),
        ),
        Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            '${_index + 1}/${urls.length}',
            style: AppTextStyles.caption.copyWith(fontSize: 11),
          ),
        ),
      ],
    );
  }
}
