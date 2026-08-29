import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/utils/debounce.dart';
import '../providers/admin_provider.dart';

class AdminUsersScreen extends ConsumerStatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  ConsumerState<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends ConsumerState<AdminUsersScreen> {
  final _query = TextEditingController();
  final _debouncer = Debouncer(milliseconds: 400);
  List<Map<String, dynamic>> _users = [];
  bool _loading = false;

  @override
  void dispose() {
    _query.dispose();
    _debouncer.dispose();
    super.dispose();
  }

  Future<void> _search(String q) async {
    if (q.trim().length < 2) {
      setState(() => _users = []);
      return;
    }
    setState(() => _loading = true);
    final r = await ref.read(adminRepositoryProvider).searchUsers(q.trim());
    if (!mounted) return;
    setState(() {
      _users = r.valueOrNull ?? [];
      _loading = false;
    });
  }

  Future<void> _userActions(Map<String, dynamic> u) async {
    final id = u['id'] as String;
    final action = await showModalBottomSheet<String>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Make moderator'),
              onTap: () => Navigator.pop(ctx, 'role:moderator'),
            ),
            ListTile(
              title: const Text('Make admin'),
              onTap: () => Navigator.pop(ctx, 'role:admin'),
            ),
            ListTile(
              title: const Text('Set user'),
              onTap: () => Navigator.pop(ctx, 'role:user'),
            ),
            ListTile(
              title: const Text('Ban'),
              onTap: () => Navigator.pop(ctx, 'ban'),
            ),
            ListTile(
              title: const Text('Restore'),
              onTap: () => Navigator.pop(ctx, 'restore'),
            ),
          ],
        ),
      ),
    );
    if (action == null) return;
    final repo = ref.read(adminRepositoryProvider);
    if (action.startsWith('role:')) {
      await repo.setUserRole(id, action.split(':')[1]);
    } else if (action == 'ban' || action == 'restore') {
      await repo.resolveReport(
        reportId: '00000000-0000-0000-0000-000000000000',
        action: action,
        targetUserId: id,
        targetType: 'profile',
        targetId: id,
        reason: 'Admin $action',
      );
    }
    await _search(_query.text);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _query,
          decoration: const InputDecoration(
            hintText: 'Search users...',
            border: InputBorder.none,
          ),
          onChanged: (v) => _debouncer.run(() => _search(v)),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _users.length,
              itemBuilder: (_, i) {
                final u = _users[i];
                final name = (u['gamer_name'] as String?)?.isNotEmpty == true
                    ? u['gamer_name']
                    : u['username'];
                final flags = [
                  if (u['is_banned'] == true) 'banned',
                  if (u['is_restricted'] == true) 'restricted',
                  u['app_role'] ?? 'user',
                ].join(' · ');
                return ListTile(
                  title: Text('$name'),
                  subtitle: Text('@${u['username']} · $flags', style: AppTextStyles.caption),
                  onTap: () => _userActions(u),
                );
              },
            ),
    );
  }
}
