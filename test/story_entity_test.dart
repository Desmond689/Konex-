import 'package:flutter_test/flutter_test.dart';
import 'package:konex/features/stories/domain/entities/story_entity.dart';

void main() {
  group('StoryEntity', () {
    test('isExpired is false when expires_at is in the future', () {
      final s = StoryEntity(
        id: '1',
        userId: 'u1',
        mediaType: 'text',
        privacy: 'everyone',
        viewCount: 0,
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 12)),
      );
      expect(s.isExpired, isFalse);
      expect(s.timeLeft.inHours, greaterThanOrEqualTo(11));
    });

    test('isExpired is true when expires_at is in the past', () {
      final s = StoryEntity(
        id: '2',
        userId: 'u1',
        mediaType: 'photo',
        privacy: 'everyone',
        viewCount: 0,
        createdAt: DateTime.now().subtract(const Duration(hours: 25)),
        expiresAt: DateTime.now().subtract(const Duration(hours: 1)),
      );
      expect(s.isExpired, isTrue);
      expect(s.timeLeft, Duration.zero);
    });

    test('displayName prefers gamerName over username', () {
      final s = StoryEntity(
        id: '3',
        userId: 'u1',
        mediaType: 'text',
        privacy: 'everyone',
        viewCount: 0,
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        username: 'simon',
        gamerName: 'vortex',
      );
      expect(s.displayName, 'vortex');
    });
  });

  group('StoryRing', () {
    test('hasUnseen is true when any story is unviewed', () {
      final ring = StoryRing(
        userId: 'u1',
        displayName: 'vortex',
        stories: [
          StoryEntity(
            id: 'a',
            userId: 'u1',
            mediaType: 'text',
            privacy: 'everyone',
            viewCount: 0,
            createdAt: DateTime.now(),
            expiresAt: DateTime.now().add(const Duration(hours: 1)),
            viewedByMe: false,
          ),
        ],
      );
      expect(ring.hasUnseen, isTrue);
      expect(ring.hasStories, isTrue);
    });
  });
}
EOF
cat > /home/workdir/konex/test/chat_message_entity_test.dart << 'EOF'
import 'package:flutter_test/flutter_test.dart';
import 'package:konex/features/chat/domain/entities/chat_entity.dart';

void main() {
  group('MessageEntity', () {
    test('reactions map is empty by default', () {
      final m = MessageEntity(
        id: '1',
        conversationId: 'c1',
        senderId: 'u1',
        senderName: 'vortex',
        body: 'hello',
        createdAt: DateTime.now(),
      );
      expect(m.reactions, isEmpty);
      expect(m.pinned, isFalse);
      expect(m.mediaUrl, isNull);
    });

    test('props include reactions and pinned', () {
      final a = MessageEntity(
        id: '1',
        conversationId: 'c1',
        senderId: 'u1',
        senderName: 'vortex',
        body: 'hi',
        createdAt: DateTime.now(),
        reactions: const {'🔥': 2},
        pinned: true,
      );
      final b = MessageEntity(
        id: '1',
        conversationId: 'c1',
        senderId: 'u1',
        senderName: 'vortex',
        body: 'hi',
        createdAt: a.createdAt,
        reactions: const {'🔥': 2},
        pinned: true,
      );
      expect(a, equals(b));
    });
  });
}
EOF
ls konex/test/