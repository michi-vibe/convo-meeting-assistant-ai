
-- 创建通知表
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 启用通知表的行级安全
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 创建通知表的RLS策略
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 创建会议材料表
CREATE TABLE public.meeting_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES public.meeting_arrangements(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'pending',
  assigned_to text,
  due_date timestamp with time zone,
  description text,
  ai_generated boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 启用会议材料表的行级安全
ALTER TABLE public.meeting_materials ENABLE ROW LEVEL SECURITY;

-- 创建会议材料表的RLS策略
CREATE POLICY "Users can view materials for their meetings" 
  ON public.meeting_materials 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.meeting_arrangements 
      WHERE id = meeting_materials.meeting_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create materials for their meetings" 
  ON public.meeting_materials 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meeting_arrangements 
      WHERE id = meeting_materials.meeting_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update materials for their meetings" 
  ON public.meeting_materials 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.meeting_arrangements 
      WHERE id = meeting_materials.meeting_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete materials for their meetings" 
  ON public.meeting_materials 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.meeting_arrangements 
      WHERE id = meeting_materials.meeting_id AND user_id = auth.uid()
    )
  );

-- 创建同步oa_user和profiles的函数
CREATE OR REPLACE FUNCTION public.sync_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 如果是oa_user表更新，同步到profiles表
  IF TG_TABLE_NAME = 'oa_user' THEN
    -- 查找对应的profiles记录并更新
    UPDATE public.profiles 
    SET 
      username = NEW.username,
      display_name = COALESCE(NEW.real_name, NEW.username),
      email = NEW.email,
      updated_at = now()
    WHERE email = NEW.email OR username = NEW.username;
    
    -- 如果profiles中没有对应记录，创建一个
    IF NOT FOUND THEN
      INSERT INTO public.profiles (id, user_id, username, display_name, email)
      SELECT 
        gen_random_uuid(),
        auth.uid(),
        NEW.username,
        COALESCE(NEW.real_name, NEW.username),
        NEW.email
      WHERE auth.uid() IS NOT NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 为oa_user表创建触发器
CREATE TRIGGER sync_oa_user_to_profiles
  AFTER INSERT OR UPDATE ON public.oa_user
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_data();

-- 创建自动生成会议材料的函数
CREATE OR REPLACE FUNCTION public.auto_generate_meeting_materials()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 为新创建的会议自动生成材料
  INSERT INTO public.meeting_materials (meeting_id, name, type, status, assigned_to, due_date, description, ai_generated)
  VALUES 
    (NEW.id, '会议议程', 'PDF文档', 'completed', '会议组织者', NEW.start_time - INTERVAL '1 day', '详细的会议议程安排', true),
    (NEW.id, '参会人员名单', 'Excel表格', 'completed', '会议组织者', NEW.start_time - INTERVAL '1 day', '所有参会人员的联系信息', true),
    (NEW.id, '会议材料汇总', 'Word文档', 'processing', '会议组织者', NEW.start_time - INTERVAL '2 hours', '会议相关的所有材料汇总', true),
    (NEW.id, '会议纪要模板', 'Word文档', 'pending', '会议记录员', NEW.start_time, '用于记录会议内容的模板', false);
  
  RETURN NEW;
END;
$$;

-- 为meeting_arrangements表创建触发器
CREATE TRIGGER auto_generate_materials_on_meeting_create
  AFTER INSERT ON public.meeting_arrangements
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_meeting_materials();
