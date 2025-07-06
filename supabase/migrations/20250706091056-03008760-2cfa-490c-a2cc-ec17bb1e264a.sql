-- 创建会议安排表
CREATE TABLE public.meeting_arrangements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_id uuid REFERENCES chat_sessions(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_room_id BIGINT REFERENCES oa_meetting(id),
  attendees JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用RLS
ALTER TABLE public.meeting_arrangements ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can view their own meeting arrangements" 
ON public.meeting_arrangements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meeting arrangements" 
ON public.meeting_arrangements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting arrangements" 
ON public.meeting_arrangements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting arrangements" 
ON public.meeting_arrangements 
FOR DELETE 
USING (auth.uid() = user_id);

-- 创建更新时间戳的触发器
CREATE TRIGGER update_meeting_arrangements_updated_at
BEFORE UPDATE ON public.meeting_arrangements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();