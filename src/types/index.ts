export interface Task {
  id: string;
  title: string;
  notes: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low' | string; // AI might return other strings
  createdAt: number; // timestamp
}

export interface SmartSortTaskInput {
  id: string;
  title:string;
  notes: string;
}
