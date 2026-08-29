import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/story_entity.dart';
import '../providers/story_provider.dart';

class StoryViewerScreen extends ConsumerStatefulWidget {
  const StoryViewerScreen({
    super.key,
    required this.rings,
    this.initialRingIndex = 0,
  });

  final List<StoryRing> rings;
  final int initialRingIndex;

  @override
  ConsumerState<StoryViewerScreen> createState() => _StoryViewerScreenState();
}

class _StoryViewerScreenState extends ConsumerState<StoryViewerScreen>
    with SingleTickerProviderStateMixin {
  late int _ringIndex;
  late int _storyIndex;
  late AnimationController _progress;
  bool _paused = false;

  StoryRing get _ring => widget.rings[_ringIndex];
  StoryEntity get _story => _ring.stories[_storyIndex];

  @override
  void initState() {
    super.initState();
    _ringIndex = widget.initialRingIndex.clamp(0, widget.rings.length - 1);
    _storyIndex = 0;
    _progress = AnimationController(vsync: this, duration: const Duration(seconds: 5))
      ..addStatusListener((s) {
        if (s == AnimationStatus.completed) _next();
      });
    _start();
  }

  void _start() {
    _progress
      ..reset()
      ..forward();
    ref.read(storyRepositoryProvider).markViewed(_story.id);
  }

  void _next() {
    if (_storyIndex < _ring.stories.length - 1) {
      setState(() => _storyIndex++);
      _start();
    } else if (_ringIndex < widget.rings.length - 1) {
      setState(() {
        _ringIndex++;
        _storyIndex = 0;
      });
      _start();
    } else {
      Navigator.of(context).pop();
    }
  }

  void _prev() {
    if (_storyIndex > 0) {
      setState(() => _storyIndex--);
      _start();
    } else if (_ringIndex > 0) {
      setState(() {
        _ringIndex--;
        _storyIndex = widget.rings[_ringIndex].stories.length - 1;
      });
      _start();
    }
  }

  void _togglePause() {
    setState(() {
      _paused = !_paused;
      if (_paused) {
        _progress.stop();
      } else {
        _progress.forward();
      }
    });
  }

  @override
  void dispose() {
    _progress.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final story = _story;
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTapDown: (d) {
          final w = MediaQuery.of(context).size.width;
          if (d.localPosition.dx < w * 0.3) {
            _prev();
          } else if (d.localPosition.dx > w * 0.7) {
            _next();
          } else {
            _togglePause();
          }
        },
        onLongPressStart: (_) {
          _progress.stop();
          setState(() => _paused = true);
        },
        onLongPressEnd: (_) {
          _progress.forward();
          setState(() => _paused = false);
        },
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Content
            if (story.mediaType == 'photo' && story.mediaUrl != null)
              Image.network(
                story.mediaUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const Center(
                  child: Icon(Icons.broken_image, color: Colors.white54, size: 64),
                ),
              )
            else if (story.mediaType == 'video' && story.mediaUrl != null)
              Container(
                color: Colors.black,
                child: const Center(
                  child: Icon(Icons.play_circle_outline, color: Colors.white, size: 72),
                ),
              )
            else
              Container(
                color: Color(
                  int.parse((story.backgroundColor ?? '#7C3AED').replaceFirst('#', '0xFF')),
                ),
                alignment: Alignment.center,
                padding: const EdgeInsets.all(32),
                child: Text(
                  story.textContent ?? '',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    height: 1.3,
                  ),
                ),
              ),

            // Top gradient + progress + header
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: SafeArea(
                child: Column(
                  children: [
                    // Progress bars
                    Padding(
                      padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
                      child: Row(
                        children: List.generate(_ring.stories.length, (i) {
                          return Expanded(
                            child: Container(
                              height: 2.5,
                              margin: const EdgeInsets.symmetric(horizontal: 2),
                              decoration: BoxDecoration(
                                color: Colors.white24,
                                borderRadius: BorderRadius.circular(2),
                              ),
                              child: i == _storyIndex
                                  ? AnimatedBuilder(
                                      animation: _progress,
                                      builder: (_, __) => FractionallySizedBox(
                                        alignment: Alignment.centerLeft,
                                        widthFactor: _progress.value,
                                        child: Container(
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(2),
                                          ),
                                        ),
                                      ),
                                    )
                                  : i < _storyIndex
                                      ? Container(
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(2),
                                          ),
                                        )
                                      : null,
                            ),
                          );
                        }),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 12, 8, 0),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 16,
                            backgroundImage: _ring.avatarUrl != null
                                ? NetworkImage(_ring.avatarUrl!)
                                : null,
                            child: _ring.avatarUrl == null
                                ? Text(_ring.displayName[0])
                                : null,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _ring.displayName,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  story.timeAgo,
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.white),
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom actions
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _action(Icons.favorite_border, 'Like'),
                      _action(Icons.chat_bubble_outline, 'Reply'),
                      _action(Icons.send_outlined, 'Share'),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _action(IconData icon, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white, size: 28),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }
}
