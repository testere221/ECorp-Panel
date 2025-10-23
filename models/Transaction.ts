import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdraw' | 'referral_bonus' | 'referral_commission' | 'task_reward' | 'vip_purchase' | 'transfer';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
  description: string;
  balanceAfter?: number; // İşlem sonrası bakiye
  walletAddress?: string;
  network?: string;
  txHash?: string;
  screenshot?: string;
  adminNote?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'referral_bonus', 'referral_commission', 'task_reward', 'vip_purchase', 'transfer'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USDT',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
    },
    description: {
      type: String,
      required: true,
    },
    balanceAfter: {
      type: Number,
      default: null,
    },
    walletAddress: {
      type: String,
      default: null,
    },
    network: {
      type: String,
      default: null,
    },
    txHash: {
      type: String,
      default: null,
    },
    screenshot: {
      type: String,
      default: null,
    },
    adminNote: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction: Model<ITransaction> = 
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;

