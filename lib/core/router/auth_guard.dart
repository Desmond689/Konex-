import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../config/dependency_injection.dart';
import 'routes.dart';

/// Redirect logic for go_router based on auth + onboarding state.
class AuthGuard {
  static Future<String?> redirect(BuildContext context, GoRouterState state, Ref ref) async {
    final sessionManager = ref.read(sessionManagerProvider);
    final local = ref.read(localStorageProvider);

    final loggedIn = sessionManager.isAuthenticated;
    final onboardingDone = await local.getOnboardingDone();

    final loc = state.matchedLocation;
    final isAuthRoute = loc == Routes.login ||
        loc == Routes.signup ||
        loc == Routes.emailVerification ||
        loc == Routes.splash ||
        loc == Routes.onboarding;

    if (!loggedIn) {
      if (isAuthRoute) return null;
      return Routes.login;
    }

    // Logged in but onboarding incomplete
    if (!onboardingDone && loc != Routes.onboarding) {
      return Routes.onboarding;
    }

    // Logged in + onboarding done → leave auth screens
    if (onboardingDone && isAuthRoute) {
      return Routes.home;
    }

    return null;
  }
}
