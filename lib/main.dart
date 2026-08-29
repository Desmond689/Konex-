import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';
import 'core/config/app_config.dart';
import 'core/config/environment_config.dart';
import 'core/security/certificate_pinning.dart';
import 'core/config/dependency_injection.dart';
import 'core/services/crash_reporting_service.dart';
import 'core/storage/local_storage_service.dart';
import 'core/storage/secure_supabase_local_storage.dart';

Future<void> main() async {
  await runGuardedApp(() async {
    WidgetsFlutterBinding.ensureInitialized();

    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    // Firebase initialization intentionally disabled in this sandbox.
    // Production: Firebase.initializeApp() then enable Crashlytics.

    final config = await AppConfig.initialize();

    final behavior = EnvironmentBehavior.resolve(
      config.environment,
    );

    await initializeCertificatePinning(
      enabled: behavior.enableCertificatePinning && !kDebugMode,
      supabaseUrl: config.supabaseUrl,
    );

    final secureLocalStorage = SecureSupabaseLocalStorage();

    await Supabase.initialize(
      url: config.supabaseUrl,
      publishableKey: config.supabaseAnonKey,
      authOptions: FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
        localStorage: secureLocalStorage,
      ),
    );

    final localStorage = LocalStorageService();
    await localStorage.init();

    runApp(
      ProviderScope(
        overrides: [
          appConfigProvider.overrideWithValue(config),
          localStorageProvider.overrideWithValue(localStorage),
        ],
        child: const KonexApp(),
      ),
    );
  });
}
