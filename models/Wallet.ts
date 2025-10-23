import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  name: string; // Örn: "USDT (TRC20)"
  crypto: string; // Örn: "USDT"
  network: string; // Örn: "TRC20"
  address: string;
  qrCode?: string; // QR kod URL'i (opsiyonel)
  isActive: boolean;
  minDeposit: number;
  order: number; // Sıralama için
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    crypto: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minDeposit: {
      type: Number,
      default: 10,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);

