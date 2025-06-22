
import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface INotification extends Document {
  userId: Schema.Types.ObjectId; // The user to notify (e.g., team owner)
  type: 'JOIN_REQUEST' | 'TASK_ASSIGNED'; // Notification type
  message: string;
  data: {
    teamId?: Schema.Types.ObjectId;
    teamName?: string;
    requestingUserId?: Schema.Types.ObjectId;
    // We don't store requestingUserName here, we populate it on the fly
  };
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, enum: ['JOIN_REQUEST', 'TASK_ASSIGNED'] },
  message: { type: String, required: true },
  data: {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    teamName: { type: String },
    requestingUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = models.Notification || model<INotification>('Notification', NotificationSchema);
export default Notification;
