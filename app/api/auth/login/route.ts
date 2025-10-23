import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'yesstyle_super_secret_key_2024';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validasyon
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Database bağlantısı
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et (düz metin karşılaştırma)
    if (password !== user.password) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Son girişi güncelle
    user.lastLogin = new Date();
    await user.save();

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Giriş başarılı',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          balance: user.balance,
          withdrawableBalance: user.withdrawableBalance,
          vipLevel: user.vipLevel,
          referralCode: user.referralCode,
          totalReferrals: user.totalReferrals,
          totalDeposit: user.totalDeposit,
          totalWithdraw: user.totalWithdraw,
          totalEarnings: user.totalEarnings,
          dailyTasksCompleted: user.dailyTasksCompleted,
          dailyTasksLimit: user.dailyTasksLimit,
          dailyWithdrawLimit: user.dailyWithdrawLimit,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

