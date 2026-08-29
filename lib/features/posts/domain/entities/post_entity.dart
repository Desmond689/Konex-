import 'package:equatable/equatable.dart';

class PostEntity extends Equatable {
  const PostEntity({
    required this.id,
    required this.authorId,
    required this.authorUsername,
    this.authorGamerName,
    this.authorAvatarUrl,
    this.communityId,
    this.communityName,
    this.squadId,
    this.squadName,
    required this.postType,
    this.body,
    this.mediaUrls = const [],
    this.visibility = 'public',
    this.likeCount = 0,
    this.commentCount = 0,
    this.shareCount = 0,
    this.likedByMe = false,
    this.savedByMe = false,
    required this.createdAt,
  });

  final String id;
  final String authorId;
  final String authorUsername;
  final String? authorGamerName;
  final String? authorAvatarUrl;
  final String? communityId;
  final String? communityName;
  final String? squadId;
  final String? squadName;
  final String postType;
  final String? body;
  final List<String> mediaUrls;
  final String visibility;
  final int likeCount;
  final int commentCount;
  final int shareCount;
  final bool likedByMe;
  final bool savedByMe;
  final DateTime createdAt;

  String get authorDisplay =>
      (authorGamerName?.isNotEmpty == true) ? authorGamerName! : authorUsername;

  /// Where the post belongs (Home destination line).
  String get destinationLabel {
    if (squadName != null && squadName!.isNotEmpty) return '🔥 $squadName';
    if (communityName != null && communityName!.isNotEmpty) {
      return '🎮 $communityName';
    }
    return '👤 Profile';
  }

  PostEntity copyWith({
    int? likeCount,
    int? commentCount,
    bool? likedByMe,
    bool? savedByMe,
  }) {
    return PostEntity(
      id: id,
      authorId: authorId,
      authorUsername: authorUsername,
      authorGamerName: authorGamerName,
      authorAvatarUrl: authorAvatarUrl,
      communityId: communityId,
      communityName: communityName,
      squadId: squadId,
      squadName: squadName,
      postType: postType,
      body: body,
      mediaUrls: mediaUrls,
      visibility: visibility,
      likeCount: likeCount ?? this.likeCount,
      commentCount: commentCount ?? this.commentCount,
      shareCount: shareCount,
      likedByMe: likedByMe ?? this.likedByMe,
      savedByMe: savedByMe ?? this.savedByMe,
      createdAt: createdAt,
    );
  }

  @override
  List<Object?> get props => [id, likeCount, likedByMe, savedByMe, commentCount];
}

class CommentEntity extends Equatable {
  const CommentEntity({
    required this.id,
    required this.postId,
    required this.authorId,
    required this.authorUsername,
    this.authorAvatarUrl,
    this.parentId,
    this.body = '',
    this.mediaUrl,
    required this.createdAt,
    this.likeCount = 0,
    this.likedByMe = false,
    this.likedByCreator = false,
    this.creatorAvatarUrl,
    this.isCreator = false,
  });

  final String id;
  final String postId;
  final String authorId;
  final String authorUsername;
  final String? authorAvatarUrl;
  final String? parentId;
  final String body;
  final String? mediaUrl;
  final DateTime createdAt;
  final int likeCount;
  final bool likedByMe;
  final bool likedByCreator;
  final String? creatorAvatarUrl;
  final bool isCreator;

  CommentEntity copyWith({
    int? likeCount,
    bool? likedByMe,
    bool? likedByCreator,
  }) =>
      CommentEntity(
        id: id,
        postId: postId,
        authorId: authorId,
        authorUsername: authorUsername,
        authorAvatarUrl: authorAvatarUrl,
        parentId: parentId,
        body: body,
        mediaUrl: mediaUrl,
        createdAt: createdAt,
        likeCount: likeCount ?? this.likeCount,
        likedByMe: likedByMe ?? this.likedByMe,
        likedByCreator: likedByCreator ?? this.likedByCreator,
        creatorAvatarUrl: creatorAvatarUrl,
        isCreator: isCreator,
      );

  @override
  List<Object?> get props => [id, body, likeCount, likedByMe, likedByCreator];
}
