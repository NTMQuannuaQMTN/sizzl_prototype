import { supabase } from '@/utils/supabase';

export async function fetchFriendRequestNotifications(userId: string) {
  // Fetch friend requests, include created_at and profile_image
  const { data: requests, error: reqError } = await supabase
    .from('requests')
    .select('user_id, user:users!requests_user_id_fkey(username,profile_image), created_at')
    .eq('requestee', userId);

  if (reqError) {
    console.error('Error fetching notifications:', reqError);
    return [];
  }

  // Fetch friends for current user
  const { data: friends, error: friendError } = await supabase
    .from('friends')
    .select('user_id, friend')
    .or(`user_id.eq.${userId},friend.eq.${userId}`);

  if (friendError) {
    console.error('Error fetching friends:', friendError);
    return [];
  }

  // Build notification list
  const notifs = (requests || []).map((req) => {
    // Check if friendship exists
    const isFriend = (friends || []).some(f =>
      (f.user_id === userId && f.friend === req.user_id) ||
      (f.user_id === req.user_id && f.friend === userId)
    );
    return {
      ...req,
      isFriend,
    };
  });
  return notifs;
}
