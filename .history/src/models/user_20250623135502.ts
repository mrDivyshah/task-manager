
import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select: false, // Prevent password from being returned by default
  },
  image: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say',
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
>>>>>>> master
  // User settings
  notificationSoundEnabled: { type: Boolean, default: false },
  notificationStyle: { type: String, enum: ['dock', 'float'], default: 'dock' },
  advancedFeaturesEnabled: { type: Boolean, default: false },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
export default User;
