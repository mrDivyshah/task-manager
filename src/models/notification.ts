
import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface INotification extends Document {
  userId: Schema.Types.ObjectId; // The user to notify (e.g., team owner, or invited user)
  type: 'JOIN_REQUEST' | 'TEAM_INVITE' | 'TASK_ASSIGNED'; // Notification type
  message: string;
  data: {
    teamId?: Schema.Types.ObjectId;
    teamName?: string;
    requestingUserId?: Schema.Types.ObjectId; // for JOIN_REQUEST
    invitingUserId?: Schema.Types.ObjectId; // for TEAM_INVITE
<<<<<<< HEAD
=======
    taskId?: Schema.Types.ObjectId; // for TASK_ASSIGNED
>>>>>>> master
    // User names are populated on the fly
  };
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, enum: ['JOIN_REQUEST', 'TEAM_INVITE', 'TASK_ASSIGNED'] },
  message: { type: String, required: true },
  data: {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    teamName: { type: String },
    requestingUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    invitingUserId: { type: Schema.Types.ObjectId, ref: 'User' },
<<<<<<< HEAD
=======
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
>>>>>>> master
  },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = models.Notification || model<INotification>('Notification', NotificationSchema);
export default Notification;
