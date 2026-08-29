import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/kx_empty_state.dart';
import '../../../../core/widgets/kx_error_view.dart';
import '../providers/community_provider.dart';

/// Games & Communities (same entity). My games + Discover.
class CommunitiesScreen extends ConsumerWidget {
  const CommunitiesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mine = ref.watch(myCommunitiesProvider);
    final discover = ref.watch(communitiesDiscoverProvider(null));

    return Scaffold(
      appBar: AppBar(title: const Text('Games')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myCommunitiesProvider);
          ref.invalidate(communitiesDiscoverProvider(null));
        },
        child: ListView(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Text('My games', style: AppTextStyles.title),
            ),
            mine.when(
              loading: () => const LinearProgressIndicator(),
              error: (e, _) => Padding(
                padding: const EdgeInsets.all(16),
                child: Text('$e'),
              ),
              data: (list) {
                if (list.isEmpty) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'No games yet. Join from Discover or during signup.',
                      style: AppTextStyles.caption,
                    ),
                  );
                }
                return Column(
                  children: list
                      .map(
                        (c) => ListTile(
                          leading: _logo(c.avatarUrl, c.name),
                          title: Text(c.name),
                          subtitle: Text(
                            '${c.memberCount} members',
                            style: AppTextStyles.caption,
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => context.push('/community/${c.id}'),
                        ),
                      )
                      .toList(),
                );
              },
            ),
            const Divider(height: 32),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Text('Discover games', style: AppTextStyles.title),
            ),
            discover.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => KxErrorView(message: e.toString()),
              data: (list) {
                if (list.isEmpty) {
                  return const KxEmptyState(
                    title: 'No games yet',
                    subtitle: 'Platform admins add official games from Admin.',
                    icon: Icons.sports_esports_outlined,
                  );
                }
                return Column(
                  children: list
                      .map(
                        (c) => ListTile(
                          leading: _logo(c.avatarUrl, c.name),
                          title: Text(c.name),
                          subtitle: Text(
                            [
                              if (c.isOfficial) 'Official',
                              '${c.memberCount} members',
                              if (c.category != null) c.category!,
                            ].join(' · '),
                            style: AppTextStyles.caption,
                          ),
                          trailing: c.isMember
                              ? const Chip(label: Text('Joined'))
                              : const Icon(Icons.chevron_right),
                          onTap: () => context.push('/community/${c.id}'),
                        ),
                      )
                      .toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _logo(String? url, String name) {
    return CircleAvatar(
      backgroundColor: AppColors.surfaceElevated,
      backgroundImage: url != null ? NetworkImage(url) : null,
      child: url == null
          ? Text(name.isNotEmpty ? name[0].toUpperCase() : '?')
          : null,
    );
  }
}
