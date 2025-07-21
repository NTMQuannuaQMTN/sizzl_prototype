
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { useUserStore } from '../../../store/userStore';
import EventCard from '../eventcard';

type DraftEvent = {
  id: string;
  title?: string;
  location_name?: string;
  bio?: string;
};

export default function Planning() {
  const { user } = useUserStore();
  const [drafts, setDrafts] = useState<DraftEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDrafts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', user.id)
        .eq('done', false)
        .order('created_at', { ascending: false });
      if (!error) setDrafts((data as DraftEvent[]) || []);
      setLoading(false);
    }
    fetchDrafts();
  }, [user.id]);

  if (loading) return <Text style={tw`text-white p-4`}>Loading drafts...</Text>;

  if (!drafts.length) return <Text style={tw`text-white p-4`}>No drafts found.</Text>;

  return (
    <View style={tw`flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {drafts.map(item => (
          <TouchableOpacity key={item.id} activeOpacity={0.85} onPress={() => router.push({ pathname: '/(create)/create', params: { id: item.id } })}>
            <EventCard event={item} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
