import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Referral from '@/models/Referral';

export async function POST(req: NextRequest) {
  try {
    const { email, password, referralCode } = await req.json();

    // Validasyon
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalı' },
        { status: 400 }
      );
    }

    // Database bağlantısı
    await connectDB();

    // Kullanıcı var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kayıtlı' },
        { status: 400 }
      );
    }

    // Referans kodu kontrolü
    let referrerId = null;
    if (referralCode && referralCode.trim() !== '') {
      const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (referrer) {
        referrerId = referrer._id;
      }
    }

    // Yeni referans kodu oluştur
    const newReferralCode = 'YESS' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Yeni kullanıcı oluştur (şifre düz metin olarak kaydediliyor)
    const user = await User.create({
      email,
      password, // Düz metin şifre
      balance: 0,
      vipLevel: 0,
      referralCode: newReferralCode,
      referredBy: referrerId ? referralCode.trim().toUpperCase() : null,
    });

    // Referral kaydı oluştur (eğer referans kodu kullanıldıysa)
    if (referrerId) {
      await Referral.create({
        referrerId: referrerId,
        referredUserId: user._id,
        status: 'active',
        totalEarnings: 0,
      });

      // Davet eden kişinin toplam referral sayısını artır
      await User.findByIdAndUpdate(referrerId, {
        $inc: { totalReferrals: 1 }
      });
    }

    // JWT token oluştur (otomatik giriş için)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'yesstyle_super_secret_key_2024',
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Kayıt başarılı',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          balance: user.balance,
          vipLevel: user.vipLevel,
          referralCode: user.referralCode,
          totalReferrals: user.totalReferrals,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

