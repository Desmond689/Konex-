import '../../../calls/presentation/providers/call_controller.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/config/dependency_injection.dart';
import '../../../../core/router/routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/kx_button.dart';
import '../../../../core/widgets/kx_error_view.dart';
import '../../../chat/presentation/providers/chat_provider.dart';
import '../../../posts/domain/entities/post_entity.dart';
import '../../../posts/presentation/providers/post_provider.dart';
import '../../../posts/presentation/widgets/post_card.dart';
import '../../../social/presentation/social_provider.dart';
import '../../domain/entities/profile_entity.dart';
import '../providers/profile_provider.dart';
import 'follow_list_screen.dart';
import '../../../social/presentation/report_dialog.dart';
import '../../../../core/deep_links/share_service.dart';
import '../../../stories/presentation/providers/story_provider.dart';
import '../../../stories/presentation/screens/create_story_screen.dart';
import '../../../stories/presentation/screens/story_viewer_screen.dart';
import '../../../stories/domain/entities/story_entity.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key, this.userId});

  final String? userId;

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen>
    with SingleTickerProviderStateMixin {
  TabController? _tabs;
  List<PostEntity> _posts = [];
  bool _postsLoading = true;

  @override
  void dispose() {
    _tabs?.dispose();
    super.dispose();
  }

  Future<void> _loadPosts(String userId) async {
    setState(() => _postsLoading = true);
    final r = await ref.read(postRepositoryProvider).getUserPosts(userId);
    if (!mounted) return;
    setState(() {
      _posts = r.valueOrNull ?? [];
      _postsLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final me = ref.watch(supabaseClientProvider).auth.currentUser?.id;
    final id = widget.userId ?? me;
    if (id == null) {
      return const Scaffold(body: Center(child: Text('Not signed in')));
    }
    final isMe = id == me;
    final asyncProfile =
        isMe ? ref.watch(myProfileProvider) : ref.watch(profileByIdProvider(id));

    return asyncProfile.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: KxErrorView(message: e.toString()),
      ),
      data: (profile) {
        if (profile == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const Center(child: Text('Profile not found')),
          );
        }


        if (!isMe && profile.isPrivate && !profile.isFollowing) {
          return Scaffold(
            appBar: AppBar(title: Text(profile.displayName)),
            body: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundImage: profile.avatarUrl != null
                        ? NetworkImage(profile.avatarUrl!)
                        : null,
                    child: profile.avatarUrl == null
                        ? Text(profile.displayName.isNotEmpty ? profile.displayName[0] : '?')
                        : null,
                  ),
                  const SizedBox(height: 12),
                  Text(profile.displayName, style: AppTextStyles.headline),
                  Text('@${profile.username}', style: AppTextStyles.bodySecondary),
                  const SizedBox(height: 16),
                  const Text('This account is private.'),
                  const SizedBox(height: 16),
                  if (profile.canFollow(false))
                    KxButton(
                      label: profile.isFollowing ? 'Following' : 'Follow',
                      onPressed: () async {
                        final social = ref.read(socialRepositoryProvider);
                        if (profile.isFollowing) {
                          await social.unfollow(profile.id);
                        } else {
                          await social.follow(profile.id);
                        }
                        ref.invalidate(profileByIdProvider(profile.id));
                      },
                    ),
                ],
              ),
            ),
          );
        }

        _tabs ??= TabController(length: 4, vsync: this);
        // Load posts once when profile arrives
        if (_postsLoading && _posts.isEmpty) {
          WidgetsBinding.instance.addPostFrameCallback((_) => _loadPosts(profile.id));
        }

        return Scaffold(
          body: NestedScrollView(
            headerSliverBuilder: (context, inner) => [
              SliverAppBar(
                expandedHeight: 220,
                pinned: true,
                clipBehavior: Clip.none,
                actions: [
                  if (isMe)
                    IconButton(
                      icon: const Icon(Icons.settings_outlined),
                      onPressed: () => context.push(Routes.settings),
                    )
                  else
                    PopupMenuButton<String>(
                      onSelected: (v) async {
                        if (v == 'report') {
                          await showReportDialog(
                            context,
                            targetType: 'profile',
                            targetId: profile.id,
                          );
                        }
                        if (v == 'block') {
                          final social = ref.read(socialRepositoryProvider);
                          if (profile.isBlocked) {
                            await social.unblock(profile.id);
                          } else {
                            await social.block(profile.id);
                          }
                          ref.invalidate(profileByIdProvider(profile.id));
                        }
                        if (v == 'copy') {
                          await Clipboard.setData(
                            ClipboardData(text: '@${profile.username}'),
                          );
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Username copied')),
                            );
                          }
                        }
                      },
                      itemBuilder: (_) => [
                        const PopupMenuItem(value: 'copy', child: Text('Copy username')),
                        PopupMenuItem(
                          value: 'block',
                          child: Text(profile.isBlocked ? 'Unblock' : 'Block'),
                        ),
                        const PopupMenuItem(value: 'report', child: Text('Report')),
                      ],
                    ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (profile.bannerUrl != null)
                        CachedNetworkImage(
                          imageUrl: profile.bannerUrl!,
                          fit: BoxFit.cover,
                        )
                      else
                        Container(color: AppColors.surfaceElevated),
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              AppColors.background.withValues(alpha: 0.85),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: -42,
                        left: 0,
                        right: 0,
                        child: Center(
                          child: GestureDetector(
                            onTap: () {
                              final avatarUrl = profile.avatarUrl;
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => Scaffold(
                                    backgroundColor: Colors.black,
                                    appBar: AppBar(
                                      backgroundColor: Colors.transparent,
                                      foregroundColor: Colors.white,
                                      elevation: 0,
                                    ),
                                    body: Center(
                                      child: avatarUrl != null
                                          ? InteractiveViewer(
                                              child: CachedNetworkImage(
                                                imageUrl: avatarUrl,
                                                fit: BoxFit.contain,
                                                width: double.infinity,
                                                height: double.infinity,
                                              ),
                                            )
                                          : Container(
                                              width: 220,
                                              height: 220,
                                              decoration: const BoxDecoration(
                                                color: AppColors.surfaceElevated,
                                                shape: BoxShape.circle,
                                              ),
                                              child: Center(
                                                child: Text(
                                                  profile.displayName.isNotEmpty
                                                      ? profile.displayName[0].toUpperCase()
                                                      : '?',
                                                  style: AppTextStyles.headline.copyWith(fontSize: 52),
                                                ),
                                              ),
                                            ),
                                    ),
                                  ),
                                ),
                              );
                            },
                            child: CircleAvatar(
                              radius: 46,
                              backgroundColor: AppColors.surfaceElevated,
                              backgroundImage: profile.avatarUrl != null
                                  ? CachedNetworkImageProvider(profile.avatarUrl!)
                                  : null,
                              child: profile.avatarUrl == null
                                  ? Text(
                                      profile.displayName.isNotEmpty
                                          ? profile.displayName[0].toUpperCase()
                                          : '?',
                                      style: AppTextStyles.headline,
                                    )
                                  : null,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(child: _Header(profile: profile, isMe: isMe)),
              SliverToBoxAdapter(
                child: _ProfileStoriesSection(userId: profile.id, isMe: isMe),
              ),
              if (profile.games.isNotEmpty && profile.showGames(isMe, profile.isFollowing))
                ProfileGamesSliver(profile: profile),
              SliverPersistentHeader(
                pinned: true,
                delegate: _TabBarDelegate(
                  TabBar(
                    controller: _tabs,
                    tabs: const [
                      Tab(text: 'Posts'),
                      Tab(text: 'Media'),
                      Tab(text: 'Squads'),
                      Tab(text: 'About'),
                    ],
                  ),
                ),
              ),
            ],
            body: TabBarView(
              controller: _tabs,
              children: [
                _PostsTab(posts: _posts, loading: _postsLoading, onRefresh: () => _loadPosts(profile.id)),
                _MediaTab(posts: _posts),
                _SquadsTab(profile: profile),
                _AboutTab(profile: profile),
              ],
            ),
          ),
        );
      },
    );
  }
}

class ProfileGamesSliver extends StatelessWidget {
  const ProfileGamesSliver({super.key, required this.profile});
  final ProfileEntity profile;

  @override
  Widget build(BuildContext context) {
    return SliverToBoxAdapter(
      child: _GamesSection(profile: profile),
    );
  }
}

class _Header extends ConsumerWidget {
  const _Header({required this.profile, required this.isMe});
  final ProfileEntity profile;
  final bool isMe;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 42, 20, 12),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Column(
            children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(profile.displayName, style: AppTextStyles.headline),
                    if (profile.isVerified) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.verified, color: Colors.lightBlueAccent, size: 20),
                    ],
                  ],
                ),
                Text('@${profile.username}', style: AppTextStyles.bodySecondary),
                if (profile.playerType != null)
                  Text('🎮 ${profile.playerType}', style: AppTextStyles.caption),
                if (profile.showSquadTag(isMe, profile.isFollowing)) ...[
                  const SizedBox(height: 10),
                  _SquadTag(profile: profile),
                ],
                if (profile.bio != null && profile.bio!.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Text(profile.bio!, style: AppTextStyles.body, textAlign: TextAlign.center),
                ],
                if (profile.badges.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 6,
                    alignment: WrapAlignment.center,
                    children: profile.badges
                        .map((b) => Chip(
                              label: Text(b, style: AppTextStyles.caption),
                              visualDensity: VisualDensity.compact,
                            ))
                        .toList(),
                  ),
                ],
                if (profile.country != null) ...[
                  const SizedBox(height: 6),
                  Text(profile.country!, style: AppTextStyles.caption),
                ],
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    InkWell(
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => FollowListScreen(
                            userId: profile.id,
                            mode: FollowListMode.followers,
                          ),
                        ),
                      ),
                      child: _Stat(label: 'Followers', value: profile.followerCount),
                    ),
                    const SizedBox(width: 28),
                    InkWell(
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => FollowListScreen(
                            userId: profile.id,
                            mode: FollowListMode.following,
                          ),
                        ),
                      ),
                      child: _Stat(label: 'Following', value: profile.followingCount),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                if (isMe)
                  Row(
                    children: [
                      Expanded(
                        child: KxButton(
                          label: 'Edit profile',
                          outlined: true,
                          onPressed: () => context.push(Routes.editProfile),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: KxButton(
                          label: 'Share',
                          outlined: true,
                          onPressed: () => ShareService.shareProfile(context, profile.username),
                        ),
                      ),
                    ],
                  )
                else ...[
                  Row(
                    children: [
                      Expanded(
                        child: KxButton(
                          label: profile.isFollowing ? 'Following' : 'Follow',
                          onPressed: !profile.canFollow(false)
                              ? null
                              : () async {
                                  final social = ref.read(socialRepositoryProvider);
                                  if (profile.isFollowing) {
                                    await social.unfollow(profile.id);
                                  } else {
                                    await social.follow(profile.id);
                                  }
                                  ref.invalidate(profileByIdProvider(profile.id));
                                },
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filledTonal(
                        tooltip: 'Voice call',
                        icon: const Icon(Icons.call),
                        onPressed: !profile.canMessage(false, profile.isFollowing)
                            ? null
                            : () async {
                                final dm = await ref
                                    .read(chatRepositoryProvider)
                                    .getOrCreateDm(profile.id);
                                if (!context.mounted) return;
                                final convId = dm.valueOrNull;
                                if (convId == null) return;
                                await ref
                                    .read(callControllerProvider.notifier)
                                    .startDmCall(
                                      conversationId: convId,
                                      calleeId: profile.id,
                                      calleeName:
                                          profile.gamerName ?? profile.username,
                                      calleeAvatar: profile.avatarUrl,
                                    );
                              },
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: KxButton(
                          label: 'Message',
                          outlined: true,
                          onPressed: !profile.canMessage(false, profile.isFollowing)
                              ? null
                              : () async {
                                  final r = await ref
                                      .read(chatRepositoryProvider)
                                      .getOrCreateDm(profile.id);
                                  r.when(
                                    success: (cid) => context.push('/chat/$cid'),
                                    failure: (e, _) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('$e')),
                                      );
                                    },
                                  );
                                },
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SquadTag extends StatelessWidget {
  const _SquadTag({required this.profile});
  final ProfileEntity profile;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceElevated,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          if (profile.squadId != null) {
            context.push('/squad/${profile.squadId}');
          }
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Column(
            children: [
              Text(
                '🔥 ${profile.squadName}',
                style: AppTextStyles.title.copyWith(fontSize: 15),
              ),
              Text(
                [
                  if (profile.squadRole != null)
                    profile.squadRole![0].toUpperCase() +
                        profile.squadRole!.substring(1),
                  if (profile.squadMemberCount != null)
                    '${profile.squadMemberCount} members',
                ].join(' · '),
                style: AppTextStyles.caption,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GamesSection extends StatefulWidget {
  const _GamesSection({required this.profile});
  final ProfileEntity profile;

  @override
  State<_GamesSection> createState() => _GamesSectionState();
}

class _GamesSectionState extends State<_GamesSection> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final games = widget.profile.games;
    final show = _expanded ? games : games.take(3).toList();
    final hasMore = games.length > 3;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('My games', style: AppTextStyles.title.copyWith(fontSize: 14)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ...show.map((g) {
                final cid = widget.profile.gameCommunityIds[g];
                return ActionChip(
                  label: Text(g, style: AppTextStyles.caption),
                  backgroundColor: AppColors.surfaceElevated,
                  onPressed: cid != null
                      ? () => context.push('/community/$cid')
                      : null,
                );
              }),
              if (hasMore && !_expanded)
                ActionChip(
                  label: Text('+${games.length - 3} more', style: AppTextStyles.caption),
                  onPressed: () => setState(() => _expanded = true),
                ),
              if (_expanded && hasMore)
                ActionChip(
                  label: const Text('Show less'),
                  onPressed: () => setState(() => _expanded = false),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});
  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$value', style: AppTextStyles.title),
        Text(label, style: AppTextStyles.caption),
      ],
    );
  }
}

class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  _TabBarDelegate(this.tabBar);
  final TabBar tabBar;

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(context, shrinkOffset, overlapsContent) {
    return Material(color: AppColors.background, child: tabBar);
  }

  @override
  bool shouldRebuild(covariant _TabBarDelegate old) => false;
}

class _PostsTab extends StatelessWidget {
  const _PostsTab({
    required this.posts,
    required this.loading,
    required this.onRefresh,
  });
  final List<PostEntity> posts;
  final bool loading;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (posts.isEmpty) {
      return Center(child: Text('No posts yet', style: AppTextStyles.caption));
    }
    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: ListView.builder(
        padding: const EdgeInsets.only(bottom: 80),
        itemCount: posts.length,
        itemBuilder: (_, i) => PostCard(
          key: ValueKey(posts[i].id),
          post: posts[i],
          onDeleted: (_) => onRefresh(),
        ),
      ),
    );
  }
}

class _MediaTab extends StatelessWidget {
  const _MediaTab({required this.posts});
  final List<PostEntity> posts;

  @override
  Widget build(BuildContext context) {
    final media = posts.where((p) => p.mediaUrls.isNotEmpty).toList();
    if (media.isEmpty) {
      return Center(child: Text('No media yet', style: AppTextStyles.caption));
    }
    return GridView.builder(
      padding: const EdgeInsets.all(8),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 4,
        mainAxisSpacing: 4,
      ),
      itemCount: media.length,
      itemBuilder: (_, i) {
        final urls = media[i].mediaUrls;
        if (urls.isEmpty) return const SizedBox.shrink();
        final url = urls.first;
        return CachedNetworkImage(imageUrl: url, fit: BoxFit.cover);
      },
    );
  }
}

class _SquadsTab extends StatelessWidget {
  const _SquadsTab({required this.profile});
  final ProfileEntity profile;

  @override
  Widget build(BuildContext context) {
    if (!profile.hasSquadTag) {
      return Center(
        child: Text('Not in a squad', style: AppTextStyles.caption),
      );
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ListTile(
          leading: const Text('🔥', style: TextStyle(fontSize: 24)),
          title: Text(profile.squadName!),
          subtitle: Text(
            [
              if (profile.squadRole != null) profile.squadRole!,
              if (profile.squadMemberCount != null)
                '${profile.squadMemberCount} members',
            ].join(' · '),
          ),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => context.push('/squad/${profile.squadId}'),
        ),
      ],
    );
  }
}

class _AboutTab extends StatelessWidget {
  const _AboutTab({required this.profile});
  final ProfileEntity profile;

  @override
  Widget build(BuildContext context) {
    final joined = profile.createdAt != null
        ? DateFormat.yMMMM().format(profile.createdAt!)
        : null;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _row('Gamer name', profile.displayName),
        _row('Username', '@${profile.username}'),
        if (profile.country != null) _row('Country', profile.country!),
        if (profile.playerType != null) _row('Platform', profile.playerType!),
        if (joined != null) _row('Joined KONEX', joined),
        if (profile.bio != null) ...[
          const SizedBox(height: 12),
          Text('Bio', style: AppTextStyles.title),
          Text(profile.bio!),
        ],
        if (profile.games.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text('Games', style: AppTextStyles.title),
          Text(profile.games.join(', ')),
        ],
      ],
    );
  }

  Widget _row(String k, String v) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(width: 120, child: Text(k, style: AppTextStyles.caption)),
          Expanded(child: Text(v)),
        ],
      ),
    );
  }
}

class _ProfileStoriesSection extends ConsumerWidget {
  const _ProfileStoriesSection({required this.userId, required this.isMe});
  final String userId;
  final bool isMe;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(userStoriesProvider(userId));
    return async.when(
      loading: () => const SizedBox(height: 8),
      error: (_, __) => const SizedBox.shrink(),
      data: (stories) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Stories', style: AppTextStyles.title.copyWith(fontSize: 15)),
                  const Spacer(),
                  if (stories.isNotEmpty)
                    Text(
                      'Watch All',
                      style: AppTextStyles.caption.copyWith(color: AppColors.primary),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 96,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    if (isMe)
                      GestureDetector(
                        onTap: () async {
                          final ok = await Navigator.of(context).push<bool>(
                            MaterialPageRoute(builder: (_) => const CreateStoryScreen()),
                          );
                          if (ok == true) {
                            ref.invalidate(userStoriesProvider(userId));
                            ref.invalidate(homeStoryRingsProvider);
                          }
                        },
                        child: _storyTile(
                          label: 'Create Story',
                          icon: Icons.add,
                          isCreate: true,
                        ),
                      ),
                    ...stories.map((s) {
                      return Padding(
                        padding: const EdgeInsets.only(right: 10),
                        child: GestureDetector(
                          onTap: () {
                            final ring = StoryRing(
                              userId: userId,
                              displayName: s.displayName,
                              avatarUrl: s.avatarUrl,
                              stories: stories,
                              isMe: isMe,
                            );
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => StoryViewerScreen(
                                  rings: [ring],
                                  initialRingIndex: 0,
                                ),
                              ),
                            );
                          },
                          child: _storyTile(
                            label: s.timeAgo,
                            imageUrl: s.mediaType == 'photo' ? s.mediaUrl : null,
                            isText: s.mediaType == 'text',
                            bg: s.backgroundColor,
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _storyTile({
    required String label,
    String? imageUrl,
    IconData? icon,
    bool isCreate = false,
    bool isText = false,
    String? bg,
  }) {
    return SizedBox(
      width: 72,
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: isCreate
                  ? AppColors.surfaceElevated
                  : (isText
                      ? Color(int.parse((bg ?? '#7C3AED').replaceFirst('#', '0xFF')))
                      : AppColors.surfaceElevated),
              border: isCreate
                  ? Border.all(color: AppColors.primary.withValues(alpha: 0.5), width: 1.5)
                  : null,
              image: imageUrl != null
                  ? DecorationImage(image: NetworkImage(imageUrl), fit: BoxFit.cover)
                  : null,
            ),
            child: isCreate
                ? Icon(icon, color: AppColors.primary, size: 28)
                : (isText
                    ? const Icon(Icons.text_fields, color: Colors.white54, size: 22)
                    : null),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.caption.copyWith(fontSize: 10),
          ),
        ],
      ),
    );
  }
}
