import mongoose from 'mongoose';

export interface IVipPackage {
  level: number;
  name: string;
  price: number;
  dailyWithdrawLimit: number;
  dailyTasksLimit: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VipPackageSchema = new mongoose.Schema<IVipPackage>({
  level: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  dailyWithdrawLimit: {
    type: Number,
    required: true,
  },
  dailyTasksLimit: {
    type: Number,
    required: true,
  },
  features: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.VipPackage || mongoose.model<IVipPackage>('VipPackage', VipPackageSchema);

