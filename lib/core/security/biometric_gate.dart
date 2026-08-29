import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';

import '../storage/secure_storage_service.dart';

/// Batch 11: Optional biometric lock before sensitive actions (payments, settings).
class BiometricGate {
  BiometricGate(this._secure, {LocalAuthentication? auth})
      : _auth = auth ?? LocalAuthentication();

  final SecureStorageService _secure;
  final LocalAuthentication _auth;

  Future<bool> isEnabled() => _secure.isBiometricEnabled();

  Future<void> setEnabled(bool value) => _secure.setBiometricEnabled(value);

  Future<bool> canCheck() async {
    try {
      return await _auth.canCheckBiometrics || await _auth.isDeviceSupported();
    } on PlatformException {
      return false;
    }
  }

  /// Returns true if unlocked or biometric not required.
  Future<bool> requireUnlock({String reason = 'Unlock KONEX'}) async {
    if (!await isEnabled()) return true;
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
        ),
      );
    } on PlatformException {
      return false;
    }
  }
}
