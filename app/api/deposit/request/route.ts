import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'yesstyle_super_secret_key_2024';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const { amount, crypto, network, txHash, screenshot } = await req.json();

    if (!amount || !crypto || !network || !txHash || !screenshot) {
      return NextResponse.json(
        { error: 'Lütfen tüm alanları doldurun (miktar, TX hash ve ekran görüntüsü gerekli)' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Geçersiz miktar' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Para yatırma talebi oluştur
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount: amount,
      currency: crypto,
      network: network,
      status: 'pending',
      description: `${amount}$ ${crypto} yatırma talebi`,
      txHash: txHash,
      screenshot: screenshot,
    });

    return NextResponse.json({
      success: true,
      message: 'Para yatırma talebiniz alındı! Admin onayından sonra bakiyenize yansıyacaktır.',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Deposit request error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

