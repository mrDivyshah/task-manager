
import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface IActivity extends Document {
  taskId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  type: 'CREATE' | 'STATUS_CHANGE' | 'ASSIGNMENT_CHANGE' | 'COMMENT' | 'UPDATE';
  details: {
    field?: string;
    from?: string | null;
    to?: string | null;
    comment?: string;
    userName: string;
  };
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['CREATE', 'STATUS_CHANGE', 'ASSIGNMENT_CHANGE', 'COMMENT', 'UPDATE'] },
  details: {
    field: { type: String },
    from: { type: String },
    to: { type: String },
    comment: { type: String },
    userName: { type: String, required: true },
  },
}, { timestamps: true });

const Activity = models.Activity || model<IActivity>('Activity', ActivitySchema);
export default Activity;
