import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Wallet from '@/models/Wallet';

const JWT_SECRET = process.env.JWT_SECRET || 'yesstyle_super_secret_key_2024';

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

// Tüm cüzdanları listele
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    // Token yoksa public cüzdanları döndür (deposit sayfası için)
    await connectDB();

    if (!token) {
      // Kullanıcılar için sadece aktif cüzdanlar
      const wallets = await Wallet.find({ isActive: true })
        .select('-__v')
        .sort({ order: 1 });
      
      return NextResponse.json({
        success: true,
        wallets,
      });
    }

    // Admin için tüm cüzdanlar
    verifyAdminToken(token);
    
    const wallets = await Wallet.find({})
      .select('-__v')
      .sort({ order: 1 });

    return NextResponse.json({
      success: true,
      wallets,
    });
  } catch (error: any) {
    console.error('Get wallets error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

// Yeni cüzdan ekle
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    verifyAdminToken(token);

    const walletData = await req.json();

    await connectDB();

    const wallet = await Wallet.create(walletData);

    return NextResponse.json({
      success: true,
      message: 'Cüzdan eklendi',
      wallet,
    });
  } catch (error: any) {
    console.error('Create wallet error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

// Cüzdan güncelle
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

    const { walletId, updates } = await req.json();

    await connectDB();

    const wallet = await Wallet.findByIdAndUpdate(
      walletId,
      { $set: updates },
      { new: true }
    );

    if (!wallet) {
      return NextResponse.json(
        { error: 'Cüzdan bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cüzdan güncellendi',
      wallet,
    });
  } catch (error: any) {
    console.error('Update wallet error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

// Cüzdan sil
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    verifyAdminToken(token);

    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get('id');

    if (!walletId) {
      return NextResponse.json(
        { error: 'Cüzdan ID gerekli' },
        { status: 400 }
      );
    }

    await connectDB();

    const wallet = await Wallet.findByIdAndDelete(walletId);

    if (!wallet) {
      return NextResponse.json(
        { error: 'Cüzdan bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cüzdan silindi',
    });
  } catch (error: any) {
    console.error('Delete wallet error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

