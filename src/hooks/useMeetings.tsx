import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MeetingArrangement {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: string;
  attendees: any[];
  created_at: string;
  updated_at: string;
  meeting_room?: {
    id: number;
    name: string;
    location: string;
    capacity: number;
    equipment: string;
  };
}

export const useMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<MeetingArrangement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('meeting_arrangements')
        .select(`
          *,
          oa_meetting (
            id,
            name,
            location,
            capacity,
            equipment
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedMeetings: MeetingArrangement[] = data.map(meeting => ({
        ...meeting,
        attendees: Array.isArray(meeting.attendees) ? meeting.attendees : [],
        meeting_room: meeting.oa_meetting
      }));

      setMeetings(formattedMeetings);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('加载会议数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [user]);

  const getStats = () => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const confirmedMeetings = meetings.filter(m => m.status === 'confirmed');
    const pendingMeetings = meetings.filter(m => m.status === 'pending');
    const thisWeekMeetings = meetings.filter(m => {
      const meetingDate = new Date(m.start_time);
      return meetingDate >= now && meetingDate <= oneWeekFromNow;
    });

    return {
      total: meetings.length,
      confirmed: confirmedMeetings.length,
      pending: pendingMeetings.length,
      thisWeek: thisWeekMeetings.length
    };
  };

  const getRecentMeetings = (limit = 5) => {
    return meetings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  };

  return {
    meetings,
    loading,
    error,
    stats: getStats(),
    recentMeetings: getRecentMeetings(),
    refreshMeetings: fetchMeetings
  };
};