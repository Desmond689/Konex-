import '../../../lfg/presentation/screens/lfg_screen.dart';
import '../../../../core/deep_links/share_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/kx_button.dart';
import '../../../../core/widgets/kx_error_view.dart';
import '../providers/community_provider.dart';
import '../../domain/community_entity.dart';

class CommunityDetailScreen extends ConsumerStatefulWidget {
  const CommunityDetailScreen({super.key, required this.communityId});
  final String communityId;

  @override
  ConsumerState<CommunityDetailScreen> createState() =>
      _CommunityDetailScreenState();
}

class _CommunityDetailScreenState extends ConsumerState<CommunityDetailScreen>
    with SingleTickerProviderStateMixin {
  TabController? _tabs;

  @override
  void dispose() {
    _tabs?.dispose();
    super.dispose();
  }

  Future<void> _join(CommunityEntity c) async {
    final r = await ref.read(communityRepositoryProvider).join(c.id);
    if (!mounted) return;
    r.when(
      success: (_) {
        ref.invalidate(communityByIdProvider(widget.communityId));
        ref.invalidate(myCommunitiesProvider);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Joined ${c.name}')),
        );
      },
      failure: (e, _) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      },
    );
  }

  Future<void> _leave(CommunityEntity c) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Leave community?'),
        content: Text('Leave ${c.name}? You can rejoin later.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Leave')),
        ],
      ),
    );
    if (ok != true) return;
    final r = await ref.read(communityRepositoryProvider).leave(c.id);
    if (!mounted) return;
    r.when(
      success: (_) {
        ref.invalidate(communityByIdProvider(widget.communityId));
        ref.invalidate(myCommunitiesProvider);
      },
      failure: (e, _) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(communityByIdProvider(widget.communityId));

    return async.when(
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(appBar: AppBar(), body: KxErrorView(message: e.toString())),
      data: (c) {
        if (c == null) {
          return Scaffold(appBar: AppBar(), body: const Center(child: Text('Not found')));
        }

        _tabs ??= TabController(length: 5, vsync: this);

        return Scaffold(
          body: NestedScrollView(
            headerSliverBuilder: (context, _) => [
              SliverAppBar(
                expandedHeight: 180,
                pinned: true,
                actions: [
                  IconButton(
                    icon: const Icon(Icons.share_outlined),
                    onPressed: () => ShareService.shareGame(context, c.slug),
                  ),
                  if (c.isMember)
                    PopupMenuButton<String>(
                      onSelected: (v) {
                        if (v == 'leave') _leave(c);
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'leave', child: Text('Leave community')),
                      ],
                    ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    color: AppColors.surfaceElevated,
                    padding: const EdgeInsets.only(bottom: 48),
                    alignment: Alignment.bottomCenter,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        CircleAvatar(
                          radius: 36,
                          backgroundColor: AppColors.primary.withValues(alpha: 0.25),
                          backgroundImage:
                              c.avatarUrl != null ? NetworkImage(c.avatarUrl!) : null,
                          child: c.avatarUrl == null
                              ? Text(
                                  c.name.isNotEmpty ? c.name[0].toUpperCase() : '?',
                                  style: AppTextStyles.headline,
                                )
                              : null,
                        ),
                        const SizedBox(height: 8),
                        Text(c.name, style: AppTextStyles.title),
                        Text(
                          '${c.memberCount} members'
                          '${c.isOfficial ? ' · Official' : ''}'
                          '${c.platforms.isNotEmpty ? ' · ${c.platforms.join(", ")}' : ''}',
                          style: AppTextStyles.caption,
                        ),
                        const SizedBox(height: 8),
                        if (!c.isMember && !c.isBanned)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 40),
                            child: KxButton(
                              label: c.isPrivate ? 'Request to join' : 'Join community',
                              onPressed: () => _join(c),
                            ),
                          )
                        else if (c.isMember)
                          Text('Joined ✓', style: AppTextStyles.caption),
                      ],
                    ),
                  ),
                ),
                bottom: TabBar(
                  controller: _tabs,
                  isScrollable: true,
                  tabs: const [
                    Tab(text: 'Home'),
                    Tab(text: 'Posts'),
                    Tab(text: 'LFG'),
                    Tab(text: 'Squads'),
                    Tab(text: 'About'),
                  ],
                ),
              ),
            ],
            body: TabBarView(
              controller: _tabs,
              children: [
                _HomeTab(communityId: c.id, community: c),
                _FeedTab(communityId: c.id, member: c.isMember, canAnnounce: c.isModerator),
                _LfgPlaceholder(gameName: c.gameName, member: c.isMember),
                _SquadsTab(communityId: c.id),
                _AboutTab(c: c),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _HomeTab extends ConsumerStatefulWidget {
  const _HomeTab({required this.communityId, required this.community});
  final String communityId;
  final CommunityEntity community;

  @override
  ConsumerState<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends ConsumerState<_HomeTab> {
  List<Map<String, dynamic>> _highlights = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final r = await ref.read(communityRepositoryProvider).posts(widget.communityId);
    if (!mounted) return;
    final posts = r.valueOrNull ?? <Map<String, dynamic>>[];
    final announcements = [
      for (final p in posts)
        if (p['is_announcement'] == true) p,
    ];
    setState(() {
      _highlights = announcements.isNotEmpty
          ? announcements
          : posts.take(5).toList();
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.community;
    if (_loading) return const Center(child: CircularProgressIndicator());
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(c.name, style: AppTextStyles.title),
        if (c.gameName.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(c.gameName, style: AppTextStyles.caption),
        ],
        if (c.description != null && c.description!.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text(c.description!, style: AppTextStyles.body),
        ],
        const SizedBox(height: 8),
        Text(
          '${c.memberCount} members · ${c.isOfficial ? "Official" : "Community"}',
          style: AppTextStyles.caption,
        ),
        const Divider(height: 32),
        Text('Highlights', style: AppTextStyles.title.copyWith(fontSize: 16)),
        const SizedBox(height: 8),
        if (_highlights.isEmpty)
          Text(
            'No posts yet. Switch to Posts to start the conversation.',
            style: AppTextStyles.caption,
          )
        else
          for (final p in _highlights)
            Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(
                  p['body'] as String? ?? '',
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(
                  p['is_announcement'] == true ? 'Announcement' : 'Recent',
                  style: AppTextStyles.caption,
                ),
              ),
            ),
      ],
    );
  }
}

class _FeedTab extends ConsumerStatefulWidget {
  const _FeedTab({
    required this.communityId,
    required this.member,
    required this.canAnnounce,
  });
  final String communityId;
  final bool member;
  final bool canAnnounce;

  @override
  ConsumerState<_FeedTab> createState() => _FeedTabState();
}

class _FeedTabState extends ConsumerState<_FeedTab> {
  List<Map<String, dynamic>> _posts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final r = await ref.read(communityRepositoryProvider).posts(widget.communityId);
    if (!mounted) return;
    setState(() {
      _posts = r.valueOrNull ?? [];
      _loading = false;
    });
  }

  Future<void> _compose({bool announcement = false}) async {
    if (!widget.member) return;
    final ctrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(announcement ? 'Community announcement' : 'Post'),
        content: TextField(controller: ctrl, maxLines: 4),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Post')),
        ],
      ),
    );
    if (ok != true || ctrl.text.trim().isEmpty) return;
    final r = await ref.read(communityRepositoryProvider).createPost(
          communityId: widget.communityId,
          body: ctrl.text.trim(),
          announcement: announcement,
        );
    r.when(
      success: (_) => _load(),
      failure: (e, _) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    return Column(
      children: [
        if (widget.member)
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _compose(announcement: false),
                    child: const Text('Post'),
                  ),
                ),
                if (widget.canAnnounce) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _compose(announcement: true),
                      child: const Text('Announce'),
                    ),
                  ),
                ],
              ],
            ),
          )
        else
          Padding(
            padding: const EdgeInsets.all(12),
            child: Text(
              'Join to post and interact. You can still read public posts.',
              style: AppTextStyles.caption,
              textAlign: TextAlign.center,
            ),
          ),
        Expanded(
          child: _posts.isEmpty
              ? Center(child: Text('No posts yet', style: AppTextStyles.caption))
              : ListView.builder(
                  itemCount: _posts.length,
                  itemBuilder: (_, i) {
                    final p = _posts[i];
                    final profile = p['profiles'] as Map<String, dynamic>?;
                    final name = (profile?['gamer_name'] as String?)?.isNotEmpty == true
                        ? profile!['gamer_name'] as String
                        : profile?['username'] as String? ?? 'User';
                    final ann = p['is_announcement'] == true;
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      child: ListTile(
                        title: Text(ann ? '📌 $name' : name),
                        subtitle: Text(p['body'] as String? ?? ''),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _LfgPlaceholder extends StatelessWidget {
  const _LfgPlaceholder({required this.gameName, required this.member});
  final String gameName;
  final bool member;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('LFG for $gameName', style: AppTextStyles.title),
            const SizedBox(height: 8),
            Text(
              'Browse open Looking-For-Group posts for this game and find teammates.',
              style: AppTextStyles.caption,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => LfgScreen(initialGame: gameName),
                  ),
                );
              },
              child: Text('Open $gameName LFG'),
            ),
            if (!member) ...[
              const SizedBox(height: 12),
              Text(
                'Join the community to post from the feed as well.',
                style: AppTextStyles.caption,
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SquadsTab extends ConsumerStatefulWidget {
  const _SquadsTab({required this.communityId});
  final String communityId;

  @override
  ConsumerState<_SquadsTab> createState() => _SquadsTabState();
}

class _SquadsTabState extends ConsumerState<_SquadsTab> {
  List<Map<String, dynamic>> _squads = [];
  Object? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final result =
        await ref.read(communityRepositoryProvider).squadsForGame(widget.communityId);
    if (!mounted) return;
    result.when(
      success: (squads) {
        setState(() {
          _squads = squads;
          _loading = false;
        });
      },
      failure: (error, _) {
        setState(() {
          _error = error;
          _loading = false;
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return KxErrorView(message: _error.toString(), onRetry: _load);
    }
    if (_squads.isEmpty) {
      return Center(
        child: Text('No public squads in this community yet.',
            style: AppTextStyles.caption),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        itemCount: _squads.length,
        itemBuilder: (_, index) {
          final squad = _squads[index];
          final name = squad['name'] as String? ?? 'Squad';
          final logoUrl = squad['logo_url'] as String?;
          final game = squad['primary_game'] as String?;
          final memberCount = squad['member_count'] as int? ?? 0;
          return ListTile(
            leading: CircleAvatar(
              backgroundColor: AppColors.surfaceElevated,
              backgroundImage: logoUrl != null ? NetworkImage(logoUrl) : null,
              child: logoUrl == null
                  ? Text(name.isNotEmpty ? name[0].toUpperCase() : '?')
                  : null,
            ),
            title: Text(name),
            subtitle: Text(
              [
                if (game != null && game.isNotEmpty) game,
                '$memberCount members',
              ].join(' · '),
              style: AppTextStyles.caption,
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/squad/${squad['id']}'),
          );
        },
      ),
    );
  }
}

class _AboutTab extends StatelessWidget {
  const _AboutTab({required this.c});
  final CommunityEntity c;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        if (c.description != null) ...[
          Text('About', style: AppTextStyles.title),
          Text(c.description!),
          const SizedBox(height: 16),
        ],
        if (c.rules != null && c.rules!.isNotEmpty) ...[
          Text('Rules', style: AppTextStyles.title),
          Text(c.rules!),
          const SizedBox(height: 16),
        ],
        Text('Game: ${c.gameName}'),
        if (c.category != null) Text('Category: ${c.category}'),
        if (c.platforms.isNotEmpty) Text('Platforms: ${c.platforms.join(", ")}'),
        if (c.primaryRegion != null) Text('Region: ${c.primaryRegion}'),
        Text(c.isOfficial ? 'Official KONEX game community' : 'Community'),
        const SizedBox(height: 12),
        Text(
          'KONEX is not the game developer. Content is community-driven.',
          style: AppTextStyles.caption,
        ),
      ],
    );
  }
}
