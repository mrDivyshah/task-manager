
import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface ITask extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  notes: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low' | string;
  teamId?: Schema.Types.ObjectId;
}

const TaskSchema = new Schema<ITask>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  notes: { type: String, default: "" },
  category: { type: String },
  priority: { type: String, enum: ['high', 'medium', 'low', 'none', ''] },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
}, { timestamps: true });

const Task = models.Task || model<ITask>('Task', TaskSchema);
export default Task;
