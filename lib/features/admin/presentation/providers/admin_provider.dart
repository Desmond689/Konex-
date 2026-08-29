import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/config/dependency_injection.dart';
import '../../data/admin_repository.dart';
import '../../domain/admin_entities.dart';

final adminRepositoryProvider = Provider((ref) {
  return AdminRepository(ref.watch(supabaseClientProvider));
});

final isStaffProvider = FutureProvider<bool>((ref) async {
  final r = await ref.watch(adminRepositoryProvider).isStaff();
  return r.valueOrNull ?? false;
});

final adminStatsProvider = FutureProvider<AdminStats>((ref) async {
  final r = await ref.watch(adminRepositoryProvider).stats();
  return r.valueOrNull ?? const AdminStats();
});

final openReportsProvider = FutureProvider<List<ReportEntity>>((ref) async {
  final r = await ref.watch(adminRepositoryProvider).openReports();
  return r.valueOrNull ?? [];
});

final auditLogsProvider = FutureProvider<List<AuditLogEntity>>((ref) async {
  final r = await ref.watch(adminRepositoryProvider).recentAudit();
  return r.valueOrNull ?? [];
});
