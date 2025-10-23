import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Referral from '@/models/Referral';

const JWT_SECRET = process.env.JWT_SECRET || 'yesstyle_super_secret_key_2024';

export async function POST(req: NextRequest) {
  try {
    // Token'ı al
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Token'ı doğrula
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const { amount, crypto, txHash } = await req.json();

    // Validasyon
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Geçersiz miktar' },
        { status: 400 }
      );
    }

    // Database bağlantısı
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının bakiyesini artır
    user.balance += amount;
    user.totalDeposit += amount;
    await user.save();

    // Transaction kaydı oluştur
    await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount: amount,
      currency: crypto || 'USDT',
      status: 'completed',
      description: `${amount}$ yatırıldı`,
      txHash: txHash || null,
      balanceAfter: user.balance, // İşlem sonrası bakiye
    });

    // Referans komisyonu kontrolü (Eğer bu kullanıcıyı davet eden varsa)
    if (user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      
      // ÖNEMLI: Davet eden kişi VIP üye olmalı!
      if (referrer && referrer.vipLevel > 0) {
        const commissionAmount = amount * 0.05; // %5 komisyon
        
        // Davet edenin hem ana bakiyesini hem çekilebilir bakiyesini artır
        referrer.balance += commissionAmount; // ANA BAKİYE
        
        // Çekilebilir bakiye günlük limit ile sınırlı
        const newWithdrawable = referrer.withdrawableBalance + commissionAmount;
        referrer.withdrawableBalance = Math.min(newWithdrawable, referrer.dailyWithdrawLimit);
        
        await referrer.save();

        // Referral kaydını güncelle
        await Referral.findOneAndUpdate(
          { referrerId: referrer._id, referredUserId: user._id },
          { 
            $inc: { totalEarnings: commissionAmount },
            $set: { lastEarningDate: new Date() }
          }
        );

        // Komisyon transaction kaydı oluştur
        await Transaction.create({
          userId: referrer._id,
          type: 'referral_commission',
          amount: commissionAmount,
          currency: 'USD',
          status: 'completed',
          description: `Referans komisyonu - ${user.email} tarafından ${amount}$ yatırım`,
          balanceAfter: referrer.balance, // İşlem sonrası bakiye
        });
      }
      // Eğer davet eden VIP değilse komisyon verilmez
    }

    return NextResponse.json({
      success: true,
      message: `${amount}$ başarıyla yatırıldı!`,
      newBalance: user.balance,
    });
  } catch (error: any) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

