
import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  code: string;
  ownerId: Schema.Types.ObjectId;
  members: Schema.Types.ObjectId[];
}

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Team = models.Team || model<ITeam>('Team', TeamSchema);
export default Team;
