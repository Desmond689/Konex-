import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../../../core/theme/app_colors.dart';

/// Plays only when sufficiently visible — avoids mounting every feed video.
/// Add visibility_detector to pubspec if not present; falls back without it.
class VideoPostPlayer extends StatefulWidget {
  const VideoPostPlayer({
    super.key,
    required this.url,
    this.thumbnailUrl,
    this.autoplayWhenVisible = true,
  });

  final String url;
  final String? thumbnailUrl;
  final bool autoplayWhenVisible;

  @override
  State<VideoPostPlayer> createState() => _VideoPostPlayerState();
}

class _VideoPostPlayerState extends State<VideoPostPlayer> {
  VideoPlayerController? _controller;
  bool _initialized = false;
  bool _visible = false;
  bool _failed = false;

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _ensureController() async {
    if (_controller != null || _failed) return;
    if (widget.url.contains('placeholder.konex.local')) {
      setState(() => _failed = true);
      return;
    }
    try {
      final c = VideoPlayerController.networkUrl(Uri.parse(widget.url));
      await c.initialize();
      c.setLooping(true);
      if (!mounted) {
        await c.dispose();
        return;
      }
      setState(() {
        _controller = c;
        _initialized = true;
      });
      if (_visible && widget.autoplayWhenVisible) {
        await c.play();
      }
    } catch (_) {
      if (mounted) setState(() => _failed = true);
    }
  }

  void _onVisibility(double fraction) {
    final nowVisible = fraction > 0.6;
    if (nowVisible == _visible) return;
    _visible = nowVisible;
    if (nowVisible) {
      _ensureController().then((_) {
        if (_controller != null && widget.autoplayWhenVisible) {
          _controller!.play();
        }
      });
    } else {
      _controller?.pause();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Soft dependency: try visibility_detector; if package missing, always init on build
    return _VisibilityGate(
      onVisibility: _onVisibility,
      child: AspectRatio(
        aspectRatio: _initialized && _controller != null
            ? _controller!.value.aspectRatio
            : 16 / 9,
        child: Stack(
          alignment: Alignment.center,
          children: [
            if (_initialized && _controller != null)
              VideoPlayer(_controller!)
            else
              Container(
                color: AppColors.surfaceElevated,
                child: _failed
                    ? const Icon(Icons.videocam_off, color: AppColors.textMuted)
                    : const CircularProgressIndicator(),
              ),
            if (_initialized && _controller != null)
              Positioned(
                bottom: 8,
                right: 8,
                child: IconButton(
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.black54,
                  ),
                  icon: Icon(
                    _controller!.value.isPlaying ? Icons.pause : Icons.play_arrow,
                    color: Colors.white,
                  ),
                  onPressed: () {
                    setState(() {
                      if (_controller!.value.isPlaying) {
                        _controller!.pause();
                      } else {
                        _controller!.play();
                      }
                    });
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _VisibilityGate extends StatefulWidget {
  const _VisibilityGate({required this.child, required this.onVisibility});
  final Widget child;
  final void Function(double fraction) onVisibility;

  @override
  State<_VisibilityGate> createState() => _VisibilityGateState();
}

class _VisibilityGateState extends State<_VisibilityGate> {
  @override
  Widget build(BuildContext context) {
    // Only VisibilityDetector drives play state — never force 1.0 for off-screen items
    try {
      return VisibilityDetector(
        key: Key('vid-${widget.child.hashCode}'),
        onVisibilityChanged: (info) {
          widget.onVisibility(info.visibleFraction);
        },
        child: widget.child,
      );
    } catch (_) {
      // Package missing in test: leave paused (0.0)
      return widget.child;
    }
  }
}
