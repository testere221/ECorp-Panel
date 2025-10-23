import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import UserTask from '@/models/UserTask';
import Referral from '@/models/Referral';

const JWT_SECRET = process.env.JWT_SECRET || 'yesstyle_super_secret_key_2024';

export async function GET(req: NextRequest) {
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
    
    // Database bağlantısı
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // İşlem geçmişi
    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Görev geçmişi
    const tasks = await UserTask.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Referans bilgileri
    const referrals = await Referral.find({ referrerId: user._id })
      .populate('referredUserId', 'email firstName lastName totalDeposit totalWithdraw')
      .sort({ createdAt: -1 });

    // Son girişi güncelle
    user.lastLogin = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        balance: user.balance,
        withdrawableBalance: user.withdrawableBalance || 0,
        vipLevel: user.vipLevel,
        vipExpiry: user.vipExpiry,
        referralCode: user.referralCode,
        totalReferrals: user.totalReferrals,
        totalDeposit: user.totalDeposit,
        totalWithdraw: user.totalWithdraw,
        totalEarnings: user.totalEarnings,
        dailyTasksCompleted: user.dailyTasksCompleted,
        dailyTasksLimit: user.dailyTasksLimit,
        dailyWithdrawLimit: user.dailyWithdrawLimit,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      transactions,
      tasks,
      referrals,
    });
  } catch (error: any) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

