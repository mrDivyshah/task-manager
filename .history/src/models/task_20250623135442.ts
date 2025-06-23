
import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface ITask extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  notes: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low' | string;
  status: 'todo' | 'in-progress' | 'done';

  dueDate?: Date;
  teamIds: Schema.Types.ObjectId[];
  assignedTo: Schema.Types.ObjectId[];
>>>>>>> master
}

const TaskSchema = new Schema<ITask>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  notes: { type: String, default: "" },
  category: { type: String },
  priority: { type: String, enum: ['high', 'medium', 'low', 'none', ''] },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
<<<<<<< HEAD
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
=======
  dueDate: { type: Date },
  teamIds: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
>>>>>>> master
}, { timestamps: true });

const Task = models.Task || model<ITask>('Task', TaskSchema);
export default Task;

    
