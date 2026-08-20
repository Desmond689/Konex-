export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Friendship {
  userId: string;
  friendId: string;
  createdAt: string;
}
