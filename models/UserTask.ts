import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserTask extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  taskName: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserTaskSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    taskName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const UserTask: Model<IUserTask> = 
  mongoose.models.UserTask || mongoose.model<IUserTask>('UserTask', UserTaskSchema);

export default UserTask;

