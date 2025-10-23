import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  balance: number;
  withdrawableBalance: number;
  vipLevel: number;
  vipExpiry?: Date;
  referralCode: string;
  referredBy?: string;
  totalReferrals: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalEarnings: number;
  dailyTasksCompleted: number;
  dailyTasksLimit: number;
  dailyWithdrawLimit: number;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    phone: {
      type: String,
      default: null,
    },
    balance: {
      type: Number,
      default: 0,
    },
    withdrawableBalance: {
      type: Number,
      default: 0,
    },
    vipLevel: {
      type: Number,
      default: 0,
    },
    vipExpiry: {
      type: Date,
      default: null,
    },
    referralCode: {
      type: String,
      unique: true,
      required: true,
    },
    referredBy: {
      type: String,
      default: null,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
    totalDeposit: {
      type: Number,
      default: 0,
    },
    totalWithdraw: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    dailyTasksCompleted: {
      type: Number,
      default: 0,
    },
    dailyTasksLimit: {
      type: Number,
      default: 1, // VIP'e göre değişir
    },
    dailyWithdrawLimit: {
      type: Number,
      default: 3, // VIP'e göre değişir
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Model'i export et, eğer varsa mevcut modeli kullan
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

