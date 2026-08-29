import 'squad_invite_screen.dart';
import '../../../../core/deep_links/share_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/kx_button.dart';
import '../../../../core/widgets/kx_error_view.dart';
import '../../../chat/presentation/providers/chat_provider.dart';
import '../providers/squad_provider.dart';
import '../../domain/entities/squad_entity.dart';

class SquadDetailScreen extends ConsumerStatefulWidget {
  const SquadDetailScreen({super.key, required this.squadId});
  final String squadId;

  @override
  ConsumerState<SquadDetailScreen> createState() => _SquadDetailScreenState();
}

class _SquadDetailScreenState extends ConsumerState<SquadDetailScreen>
    with SingleTickerProviderStateMixin {
  TabController? _tabs;

  @override
  void dispose() {
    _tabs?.dispose();
    super.dispose();
  }

  Future<void> _openChat() async {
    final r =
        await ref.read(chatRepositoryProvider).getOrCreateSquadChat(widget.squadId);
    r.when(
      success: (id) {
        if (mounted) context.push('/chat/$id');
      },
      failure: (e, _) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      },
    );
  }

  Future<void> _confirmLeave(SquadEntity squad) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Leave squad?'),
        content: Text(
          'Leave ${squad.name}? You’ll lose chat and feed access.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Leave')),
        ],
      ),
    );
    if (ok != true) return;
    final r = await ref.read(squadRepositoryProvider).leave(widget.squadId);
    if (!mounted) return;
    r.when(
      success: (_) {
        ref.invalidate(myActiveSquadProvider);
        ref.invalidate(squadByIdProvider(widget.squadId));
        context.go('/squads');
      },
      failure: (e, _) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      },
    );
  }

  Future<void> _join(SquadEntity squad) async {
    final r = await ref.read(squadRepositoryProvider).requestJoin(widget.squadId);
    if (!mounted) return;
    r.when(
      success: (_) {
        ref.invalidate(myActiveSquadProvider);
        ref.invalidate(squadByIdProvider(widget.squadId));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              squad.requireApproval || !squad.isPublic
                  ? 'Request sent'
                  : 'Joined ${squad.name}',
            ),
          ),
        );
      },
      failure: (e, _) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(squadByIdProvider(widget.squadId));

    return async.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: KxErrorView(message: e.toString()),
      ),
      data: (squad) {
        if (squad == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const Center(child: Text('Squad not found')),
          );
        }

        final isMember = squad.isMember;

        // Member: tabs Home | Posts | Members | About
        // Non-member: single scroll About-style + join
        if (isMember) {
          _tabs ??= TabController(length: 5, vsync: this);
          return Scaffold(
            body: NestedScrollView(
              headerSliverBuilder: (context, _) => [
                SliverAppBar(
                  expandedHeight: 180,
                  pinned: true,
                  leading: BackButton(onPressed: () => context.pop()),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.share_outlined),
                      onPressed: () => ShareService.shareSquad(
                        context,
                        id: widget.squadId,
                        slug: squad.slug,
                      ),
                    ),
                    PopupMenuButton<String>(
                      onSelected: (v) async {
                        if (v == 'leave') {
                          await _confirmLeave(squad);
                          return;
                        }
                        if (v == 'invite') {
                          if (!context.mounted) return;
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => SquadInviteScreen(
                                squadId: widget.squadId,
                                squadName: squad.name,
                              ),
                            ),
                          );
                        } else if (v == 'invite_legacy') {
                          await Clipboard.setData(
                            ClipboardData(text: 'https://konex-app-rho.vercel.app/squad/${squad.id}'),
                          );
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Invite link copied')),
                          );
                        }
                      },
                      itemBuilder: (_) => [
                        const PopupMenuItem(value: 'invite', child: Text('Copy invite link')),
                        if (!squad.isOwner)
                          const PopupMenuItem(value: 'leave', child: Text('Leave squad')),
                        if (squad.isOwner)
                          const PopupMenuItem(
                            value: 'transfer',
                            child: Text('Transfer ownership (Members tab)'),
                          ),
                      ],
                    ),
                  ],
                  flexibleSpace: FlexibleSpaceBar(
                    background: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppColors.primary.withValues(alpha: 0.35),
                            AppColors.surfaceElevated,
                          ],
                        ),
                      ),
                      alignment: Alignment.bottomCenter,
                      padding: const EdgeInsets.only(bottom: 52),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          CircleAvatar(
                            radius: 40,
                            backgroundColor: AppColors.primary,
                            backgroundImage:
                                squad.logoUrl != null ? NetworkImage(squad.logoUrl!) : null,
                            child: squad.logoUrl == null
                                ? Text(
                                    squad.name.isNotEmpty ? squad.name[0].toUpperCase() : 'S',
                                    style: AppTextStyles.headline.copyWith(
                                      color: Colors.white,
                                      fontSize: 28,
                                    ),
                                  )
                                : null,
                          ),
                          const SizedBox(height: 10),
                          Text(squad.name, style: AppTextStyles.title.copyWith(fontSize: 20)),
                          const SizedBox(height: 2),
                          Text(
                            '${squad.memberCount} members · ${squad.isPublic ? 'Public' : 'Private'}',
                            style: AppTextStyles.caption,
                          ),
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
                      Tab(text: 'Chat'),
                      Tab(text: 'Members'),
                      Tab(text: 'About'),
                    ],
                  ),
                ),
              ],
              body: TabBarView(
                controller: _tabs,
                children: [
                  _HomeTab(squad: squad, squadId: widget.squadId),
                  _PostsTab(squad: squad, squadId: widget.squadId, memberMode: true),
                  _ChatTab(squadId: widget.squadId, onOpenChat: _openChat),
                  _MembersTab(squad: squad, squadId: widget.squadId),
                  _AboutTab(squad: squad, nonMember: false),
                ],
              ),
            ),
          );
        }

        // Non-member view
        return Scaffold(
          appBar: AppBar(
            title: Text(squad.name),
            leading: BackButton(onPressed: () => context.pop()),
          ),
          body: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Center(
                child: CircleAvatar(
                  radius: 40,
                  backgroundColor: AppColors.surfaceElevated,
                  backgroundImage:
                      squad.logoUrl != null ? NetworkImage(squad.logoUrl!) : null,
                  child: squad.logoUrl == null
                      ? Text(
                          squad.name.isNotEmpty ? squad.name[0].toUpperCase() : '?',
                          style: AppTextStyles.display,
                        )
                      : null,
                ),
              ),
              const SizedBox(height: 12),
              Text(squad.name, style: AppTextStyles.headline, textAlign: TextAlign.center),
              Text(
                [
                  '${squad.memberCount} members',
                  squad.isPublic ? 'Public' : 'Private',
                  if (squad.primaryGame != null) squad.primaryGame!,
                  if (squad.category != null) squad.category!,
                ].join(' · '),
                style: AppTextStyles.bodySecondary,
                textAlign: TextAlign.center,
              ),
              Text(
                'Owner: ${squad.ownerDisplayName}',
                style: AppTextStyles.caption,
                textAlign: TextAlign.center,
              ),
              if (squad.description != null) ...[
                const SizedBox(height: 16),
                Text(squad.description!, textAlign: TextAlign.center),
              ],
              if (squad.rules != null && squad.rules!.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text('Rules', style: AppTextStyles.title),
                Text(squad.rules!, style: AppTextStyles.bodySecondary),
              ],
              const SizedBox(height: 20),
              if (squad.isBanned)
                const Text(
                  'You are banned from this squad',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.redAccent),
                )
              else if (squad.isPending)
                const KxButton(label: 'Request pending', onPressed: null)
              else
                KxButton(
                  label: !squad.isPublic || squad.requireApproval
                      ? 'Request to join'
                      : 'Join squad',
                  onPressed: () => _join(squad),
                ),
              const SizedBox(height: 8),
              Text(
                'You can only be in one squad at a time.',
                style: AppTextStyles.caption,
                textAlign: TextAlign.center,
              ),
              // Public squad: show read-only feed
              if (squad.isPublic) ...[
                const SizedBox(height: 24),
                Text('Squad posts', style: AppTextStyles.title),
                const SizedBox(height: 8),
                _PostsTab(
                  squad: squad,
                  squadId: widget.squadId,
                  memberMode: false,
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _HomeTab extends ConsumerWidget {
  const _HomeTab({required this.squad, required this.squadId});
  final SquadEntity squad;
  final String squadId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(squadPostsProvider(squadId));
    return postsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => KxErrorView(message: e.toString()),
      data: (posts) {
        final announcements =
            posts.where((p) => p['is_announcement'] == true).toList();
        final rest = posts.where((p) => p['is_announcement'] != true).take(10);

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (announcements.isNotEmpty) ...[
              Text('📢 Announcements', style: AppTextStyles.title),
              ...announcements.map((p) => _PostTile(map: p)),
              const Divider(),
            ],
            Text('Latest', style: AppTextStyles.title),
            if (rest.isEmpty)
              Text('No posts yet', style: AppTextStyles.caption)
            else
              ...rest.map((p) => _PostTile(map: p)),
          ],
        );
      },
    );
  }
}

class _PostsTab extends ConsumerStatefulWidget {
  const _PostsTab({
    required this.squad,
    required this.squadId,
    required this.memberMode,
  });
  final SquadEntity squad;
  final String squadId;
  final bool memberMode;

  @override
  ConsumerState<_PostsTab> createState() => _PostsTabState();
}

class _PostsTabState extends ConsumerState<_PostsTab> {
  List<Map<String, dynamic>> _posts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final r = await ref.read(squadRepositoryProvider).squadPosts(widget.squadId);
    if (!mounted) return;
    setState(() {
      _posts = r.valueOrNull ?? [];
      _loading = false;
    });
  }

  Future<void> _compose({bool announcement = false}) async {
    final controller = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(announcement ? 'Announcement' : 'Squad post'),
        content: TextField(
          controller: controller,
          maxLines: 4,
          decoration: const InputDecoration(hintText: 'Write something...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Post')),
        ],
      ),
    );
    if (ok != true || controller.text.trim().isEmpty) return;
    final r = await ref.read(squadRepositoryProvider).createSquadPost(
          squadId: widget.squadId,
          body: controller.text.trim(),
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
        if (widget.memberMode)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () => _compose(announcement: false),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.surfaceElevated,
                      foregroundColor: AppColors.textPrimary,
                    ),
                    icon: const Icon(Icons.edit_outlined, size: 18),
                    label: const Text('Create Post'),
                  ),
                ),
                if (widget.squad.isModerator) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () => _compose(announcement: true),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                      ),
                      icon: const Icon(Icons.campaign_outlined, size: 18),
                      label: const Text('Announcement'),
                    ),
                  ),
                ],
              ],
            ),
          ),
        Expanded(
          child: _posts.isEmpty
              ? Center(child: Text('No posts', style: AppTextStyles.caption))
              : ListView.builder(
                  itemCount: _posts.length,
                  itemBuilder: (_, i) => _PostTile(map: _posts[i]),
                ),
        ),
      ],
    );
  }
}

class _PostTile extends StatelessWidget {
  const _PostTile({required this.map});
  final Map<String, dynamic> map;

  @override
  Widget build(BuildContext context) {
    final profile = map['profiles'] as Map<String, dynamic>?;
    final name = (profile?['gamer_name'] as String?)?.isNotEmpty == true
        ? profile!['gamer_name'] as String
        : profile?['username'] as String? ?? 'User';
    final isAnn = map['is_announcement'] == true;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: ListTile(
        title: Text(
          isAnn ? '📢 $name' : name,
          style: AppTextStyles.title.copyWith(fontSize: 14),
        ),
        subtitle: Text(map['body'] as String? ?? ''),
      ),
    );
  }
}

class _MembersTab extends ConsumerWidget {
  const _MembersTab({required this.squad, required this.squadId});
  final SquadEntity squad;
  final String squadId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final membersAsync = ref.watch(squadMembersProvider(squadId));
    final pendingAsync = ref.watch(squadPendingRequestsProvider(squadId));

    return membersAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => KxErrorView(message: e.toString()),
      data: (allMembers) {
        final members = allMembers.where((m) => m.status == 'active').toList();

        return ListView(
          children: [
            if (squad.isModerator)
              pendingAsync.when(
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
                data: (rows) {
                  if (rows.isEmpty) return const SizedBox.shrink();
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Text('Join requests', style: AppTextStyles.title),
                      ),
                      ...rows.map((r) {
                        final profile = r['profiles'] as Map<String, dynamic>?;
                        final username = profile?['username'] as String? ?? 'user';
                        final userId = r['user_id'] as String;
                        return ListTile(
                          title: Text(username),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.check, color: AppColors.success),
                                onPressed: () async {
                                  final res = await ref
                                      .read(squadRepositoryProvider)
                                      .approveRequest(squadId, userId);
                                  res.when(
                                    success: (_) {
                                      ref.invalidate(squadByIdProvider(squadId));
                                      ref.invalidate(squadMembersProvider(squadId));
                                      ref.invalidate(squadPendingRequestsProvider(squadId));
                                    },
                                    failure: (e, _) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('$e')),
                                      );
                                    },
                                  );
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.close, color: AppColors.error),
                                onPressed: () async {
                                  await ref
                                      .read(squadRepositoryProvider)
                                      .rejectRequest(squadId, userId);
                                  ref.invalidate(squadByIdProvider(squadId));
                                  ref.invalidate(squadPendingRequestsProvider(squadId));
                                },
                              ),
                            ],
                          ),
                        );
                      }),
                      const Divider(),
                    ],
                  );
                },
              ),
            ...members.map((m) {
              final roleIcon = switch (m.role) {
                'owner' => '👑',
                'moderator' => '🛡️',
                _ => '🎮',
              };
              return ListTile(
                leading: CircleAvatar(
                  radius: 18,
                  backgroundImage:
                      m.avatarUrl != null ? NetworkImage(m.avatarUrl!) : null,
                  child: m.avatarUrl == null
                      ? Text(m.displayName.isNotEmpty ? m.displayName[0] : '?')
                      : null,
                ),
                title: Text('$roleIcon ${m.displayName}'),
                subtitle: Text('@${m.username} · ${m.role}'),
                onTap: () => context.push('/user/${m.userId}'),
                onLongPress: squad.isModerator && m.role != 'owner'
                    ? () async {
                        final action = await showModalBottomSheet<String>(
                          context: context,
                          builder: (ctx) => SafeArea(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (squad.isOwner)
                                  ListTile(
                                    title: const Text('Transfer ownership'),
                                    onTap: () => Navigator.pop(ctx, 'transfer'),
                                  ),
                                ListTile(
                                  title: const Text('Remove'),
                                  onTap: () => Navigator.pop(ctx, 'remove'),
                                ),
                                ListTile(
                                  title: const Text('Ban'),
                                  onTap: () => Navigator.pop(ctx, 'ban'),
                                ),
                              ],
                            ),
                          ),
                        );
                        if (action == 'transfer') {
                          await ref
                              .read(squadRepositoryProvider)
                              .transferOwnership(squadId, m.userId);
                          ref.invalidate(squadByIdProvider(squadId));
                          ref.invalidate(myActiveSquadProvider);
                        } else if (action == 'remove' || action == 'ban') {
                          await ref.read(squadRepositoryProvider).removeMember(
                                squadId,
                                m.userId,
                                ban: action == 'ban',
                              );
                          ref.invalidate(squadByIdProvider(squadId));
                        }
                      }
                    : null,
              );
            }),
          ],
        );
      },
    );
  }
}

class _ChatTab extends StatelessWidget {
  const _ChatTab({required this.squadId, required this.onOpenChat});
  final String squadId;
  final VoidCallback onOpenChat;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.chat_bubble_outline_rounded, size: 64, color: AppColors.primary.withValues(alpha: 0.7)),
            const SizedBox(height: 16),
            Text('Squad Chat', style: AppTextStyles.title),
            const SizedBox(height: 8),
            Text(
              'Real-time messages with your squad.\nImages, reactions & more coming soon.',
              textAlign: TextAlign.center,
              style: AppTextStyles.caption,
            ),
            const SizedBox(height: 24),
            KxButton(
              label: 'Open Chat',
              onPressed: onOpenChat,
            ),
          ],
        ),
      ),
    );
  }
}

class _AboutTab extends StatelessWidget {
  const _AboutTab({required this.squad, required this.nonMember});
  final SquadEntity squad;
  final bool nonMember;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        if (squad.description != null) ...[
          Text('About', style: AppTextStyles.title),
          Text(squad.description!),
          const SizedBox(height: 16),
        ],
        Text('Owner: ${squad.ownerDisplayName}'),
        Text(
          'Privacy: ${squad.isPublic ? 'Public' : 'Private'}'
          '${squad.isPublic ? (squad.requireApproval ? ' · Approval required' : ' · Instant join') : ''}',
        ),
        if (squad.primaryGame != null) Text('Game: ${squad.primaryGame}'),
        if (squad.category != null) Text('Type: ${squad.category}'),
        if (squad.rules != null && squad.rules!.isNotEmpty) ...[
          const SizedBox(height: 16),
          Text('Rules', style: AppTextStyles.title),
          Text(squad.rules!),
        ],
        const SizedBox(height: 16),
        Text(
          'Invite: https://konex-app-rho.vercel.app/squad/${squad.id}',
          style: AppTextStyles.caption,
        ),
      ],
    );
  }
}
