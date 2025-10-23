import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import VipPackage from '@/models/VipPackage';

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
    
    const { vipLevel } = await req.json();

    // VIP seviye kontrolü
    if (!vipLevel) {
      return NextResponse.json(
        { error: 'VIP seviyesi belirtilmedi' },
        { status: 400 }
      );
    }

    // Database bağlantısı
    await connectDB();

    // VIP paketini database'den çek
    const vipPackage = await VipPackage.findOne({ level: vipLevel, isActive: true });
    
    if (!vipPackage) {
      return NextResponse.json(
        { error: 'Geçersiz veya aktif olmayan VIP seviyesi' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Bakiye kontrolü
    if (user.balance < vipPackage.price) {
      return NextResponse.json(
        { 
          error: `Yetersiz bakiye! ${vipPackage.name} için ${vipPackage.price}$ gerekli, bakiyeniz: ${user.balance}$`,
          required: vipPackage.price,
          current: user.balance
        },
        { status: 400 }
      );
    }

    // VIP zaten alınmış mı kontrol et
    if (user.vipLevel >= vipLevel) {
      return NextResponse.json(
        { error: 'Bu VIP seviyesine zaten sahipsiniz veya daha yüksek bir seviyedesiniz' },
        { status: 400 }
      );
    }

    // Bakiyeden düş
    user.balance -= vipPackage.price;
    user.vipLevel = vipLevel;
    user.dailyTasksLimit = vipPackage.dailyTasksLimit;
    user.dailyWithdrawLimit = vipPackage.dailyWithdrawLimit;
    
    // VIP bitiş tarihi (30 gün)
    const vipExpiry = new Date();
    vipExpiry.setDate(vipExpiry.getDate() + 30);
    user.vipExpiry = vipExpiry;

    await user.save();

    // Transaction kaydı oluştur
    await Transaction.create({
      userId: user._id,
      type: 'vip_purchase',
      amount: vipPackage.price,
      currency: 'USD',
      status: 'completed',
      description: `${vipPackage.name} satın alındı`,
      balanceAfter: user.balance, // İşlem sonrası bakiye
    });

    return NextResponse.json({
      success: true,
      message: `${vipPackage.name} başarıyla satın alındı!`,
      user: {
        balance: user.balance,
        vipLevel: user.vipLevel,
        vipExpiry: user.vipExpiry,
        dailyTasksLimit: user.dailyTasksLimit,
        dailyWithdrawLimit: user.dailyWithdrawLimit,
      },
    });
  } catch (error: any) {
    console.error('VIP purchase error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

