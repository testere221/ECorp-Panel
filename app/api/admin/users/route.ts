import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'yesstyle_super_secret_key_2024';

// Admin token doğrulama
function verifyAdminToken(token: string) {
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'admin') {
      throw new Error('Yetkisiz erişim');
    }
    return decoded;
  } catch (error) {
    throw new Error('Geçersiz token');
  }
}

// Tüm kullanıcıları listele
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    verifyAdminToken(token);

    await connectDB();

    // Tüm kullanıcıları getir
    const users = await User.find({})
      .select('-__v')
      .sort({ createdAt: -1 });

    // İstatistikler
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
      totalDeposits: users.reduce((sum, u) => sum + u.totalDeposit, 0),
      totalWithdraws: users.reduce((sum, u) => sum + u.totalWithdraw, 0),
      vipUsers: users.filter(u => u.vipLevel > 0).length,
    };

    return NextResponse.json({
      success: true,
      users,
      stats,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

// Kullanıcı güncelle
export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    verifyAdminToken(token);

    const { userId, updates } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı güncellendi',
      user,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

