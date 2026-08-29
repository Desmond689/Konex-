import 'package:equatable/equatable.dart';

class ConversationEntity extends Equatable {
  const ConversationEntity({
    required this.id,
    required this.type,
    this.squadId,
    this.title,
    this.avatarUrl,
    this.lastMessage,
    this.lastMessageAt,
    this.otherUserId,
    this.unread = false,
    this.unreadCount = 0,
    this.pinned = false,
    this.muted = false,
    this.archived = false,
    this.isRequest = false,
  });

  final String id;
  final String type; // dm | squad
  final String? squadId;
  final String? title;
  final String? avatarUrl;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final String? otherUserId;
  final bool unread;
  final int unreadCount;
  final bool pinned;
  final bool muted;
  final bool archived;
  final bool isRequest;

  @override
  List<Object?> get props => [id, lastMessage, lastMessageAt, unreadCount, pinned];
}

class MessageEntity extends Equatable {
  const MessageEntity({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    required this.body,
    required this.createdAt,
    this.isMine = false,
    this.replyToId,
    this.replyPreview,
    this.editedAt,
    this.mediaUrl,
    this.mediaType,
    this.deletedForEveryone = false,
    this.sendStatus = 'sent',
    this.reactions = const {},
    this.pinned = false,
  });

  final String id;
  final String conversationId;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final String body;
  final DateTime createdAt;
  final bool isMine;
  final String? replyToId;
  final String? replyPreview;
  final DateTime? editedAt;
  final String? mediaUrl;
  final String? mediaType; // image | video
  final bool deletedForEveryone;
  final String sendStatus; // sending | sent | failed
  /// emoji -> count
  final Map<String, int> reactions;
  final bool pinned;

  @override
  List<Object?> get props => [id, body, sendStatus, reactions, pinned];
}
