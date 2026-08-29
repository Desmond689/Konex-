import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class KxButton extends StatelessWidget {
  const KxButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.outlined = false,
    this.expanded = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool outlined;
  final bool expanded;

  @override
  Widget build(BuildContext context) {
    final child = loading
        ? const SizedBox(
            height: 22,
            width: 22,
            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
          )
        : Text(label, style: AppTextStyles.button);

    final button = outlined
        ? OutlinedButton(
            onPressed: loading ? null : onPressed,
            child: child,
          )
        : ElevatedButton(
            onPressed: loading ? null : onPressed,
            child: child,
          );

    if (!expanded) return button;
    return SizedBox(width: double.infinity, child: button);
  }
}

class KxTextButton extends StatelessWidget {
  const KxTextButton({
    super.key,
    required this.label,
    required this.onPressed,
  });

  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      child: Text(
        label,
        style: AppTextStyles.body.copyWith(color: AppColors.primary),
      ),
    );
  }
}
