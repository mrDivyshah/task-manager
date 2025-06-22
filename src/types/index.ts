
export interface Task {
  id: string;
  title: string;
  notes: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low' | string;
  createdAt: number; // timestamp
  teamId?: string;
  team?: { name: string }; // For populated team data on task
}

export interface SmartSortTaskInput {
  id: string;
  title:string;
  notes: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  members: string[]; // Array of user emails for display
  createdAt: number; // timestamp
  ownerId: string;
}

export type NotificationStyle = "dock" | "float";
