import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/kx_button.dart';
import '../../../../core/widgets/kx_text_field.dart';
import '../../../communities/presentation/providers/community_provider.dart';

/// Staff: Create Game = create official Community in one step.
class AdminCreateGameScreen extends ConsumerStatefulWidget {
  const AdminCreateGameScreen({super.key});

  @override
  ConsumerState<AdminCreateGameScreen> createState() =>
      _AdminCreateGameScreenState();
}

class _AdminCreateGameScreenState extends ConsumerState<AdminCreateGameScreen> {
  final _name = TextEditingController();
  final _desc = TextEditingController();
  final _rules = TextEditingController();
  String? _category;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _desc.dispose();
    _rules.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_name.text.trim().isEmpty) {
      setState(() => _error = 'Name required');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    final r = await ref.read(communityRepositoryProvider).adminCreateGame(
          name: _name.text.trim(),
          description: _desc.text.trim().isEmpty ? null : _desc.text.trim(),
          rules: _rules.text.trim().isEmpty ? null : _rules.text.trim(),
          category: _category,
        );
    if (!mounted) return;
    setState(() => _loading = false);
    r.when(
      success: (_) {
        ref.invalidate(officialGamesProvider);
        ref.invalidate(communitiesDiscoverProvider(null));
        Navigator.of(context).pop(true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Game community created')),
        );
      },
      failure: (e, _) => setState(() => _error = e.toString()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create game')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'Creates the official Game = Community page in one step. '
            'No separate community to create.',
            style: AppTextStyles.caption,
          ),
          const SizedBox(height: 16),
          KxTextField(
            controller: _name,
            label: 'Game name',
            validator: (v) => Validators.required(v, 'Name'),
          ),
          const SizedBox(height: 12),
          KxTextField(controller: _desc, label: 'Description', maxLines: 3),
          const SizedBox(height: 12),
          KxTextField(controller: _rules, label: 'Community rules', maxLines: 4),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _category,
            decoration: const InputDecoration(labelText: 'Category'),
            items: const [
              DropdownMenuItem(value: 'fps', child: Text('FPS')),
              DropdownMenuItem(value: 'battle_royale', child: Text('Battle Royale')),
              DropdownMenuItem(value: 'sports', child: Text('Sports')),
              DropdownMenuItem(value: 'moba', child: Text('MOBA')),
              DropdownMenuItem(value: 'sandbox', child: Text('Sandbox')),
              DropdownMenuItem(value: 'other', child: Text('Other')),
            ],
            onChanged: (v) => setState(() => _category = v),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: AppTextStyles.caption.copyWith(color: Colors.redAccent)),
          ],
          const SizedBox(height: 20),
          KxButton(label: 'Create game community', onPressed: _submit, loading: _loading),
        ],
      ),
    );
  }
}
