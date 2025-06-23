
export interface UserSubset {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  status: 'todo' | 'in-progress' | 'done';
  category?: string;
  priority?: 'high' | 'medium' | 'low' | string;
  createdAt: number; // timestamp

  updatedAt: number; // timestamp
  dueDate?: string; // ISO date string
  teamIds?: string[];
  teams?: { id: string; name: string; }[];
  assignedTo?: UserSubset[];
  createdBy?: UserSubset;
}

export interface TeamMember extends UserSubset {}

export interface SmartSortTaskInput {
  id: string;
  title:string;
  notes: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  members: TeamMember[];
  createdAt: number; // timestamp
  ownerId: string;
  pendingRequests?: TeamMember[];
}

export type NotificationStyle = "dock" | "float";

export type NotificationType = "JOIN_REQUEST" | "TEAM_INVITE" | "TASK_ASSIGNED";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  data: {
    teamId?: string;
    teamName?: string;
    requestingUserId?: string;
    requestingUserName?: string;
    invitingUserId?: string;
    invitingUserName?: string;
    taskId?: string;
  };
  isRead: boolean;
  createdAt: string; // ISO date string
}
<<<<<<< HEAD
=======

export interface Activity {
  id: string;
  taskId?: string;
  taskTitle?: string;
  type: 'CREATE' | 'STATUS_CHANGE' | 'ASSIGNMENT_CHANGE' | 'COMMENT' | 'UPDATE';
  details: {
    field?: string;
    from?: string | null;
    to?: string | null;
    comment?: string;
    userName: string;
  };
  createdAt: string; // ISO date string
}
>>>>>>> master
