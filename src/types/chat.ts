
export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'confirmed';
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'outline';
  }>;
  suggestedRooms?: Array<{
    id: number;
    name: string;
    location: string;
    capacity: number;
    equipment: string;
  }>;
  suggestedUsers?: Array<{
    id: number;
    username: string;
    real_name: string;
    department: string;
    role: string;
    email: string;
  }>;
  userContext?: {
    userName: string;
    department?: string;
    role?: string;
  };
}
