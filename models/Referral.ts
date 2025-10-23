import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  status: string; // 'active', 'inactive'
  totalEarnings: number;
  lastEarningDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema: Schema = new Schema(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    lastEarningDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Referral: Model<IReferral> = 
  mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);

export default Referral;

