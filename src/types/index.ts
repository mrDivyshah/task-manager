
export interface Task {
  id: string;
  title: string;
  notes: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low' | string; // AI might return other strings
  createdAt: number; // timestamp
  teamId?: string; 
}

export interface SmartSortTaskInput {
  id: string;
  title:string;
  notes: string;
}

export interface Team {
  id: string;
  name: string;
  code: string; // Team code (e.g., 6-digit OTP)
  members: string[]; // Array of user identifiers (e.g., email or ID)
  createdAt: number; // timestamp
}
