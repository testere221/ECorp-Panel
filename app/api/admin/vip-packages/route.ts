import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VipPackage from '@/models/VipPackage';
import jwt from 'jsonwebtoken';

// Force dynamic - Cache'i kapat
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JWT_SECRET = process.env.JWT_SECRET || 'yesstyle_super_secret_key_2024';

// Verify admin token
function verifyAdminToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ VIP Packages: Authorization header eksik');
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('🔓 VIP Packages: Token decoded:', { role: decoded.role, type: decoded.type });
    
    // Admin veya super_admin rolüne sahip olmalı
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      console.log('❌ VIP Packages: Geçersiz role:', decoded.role);
      return null;
    }
    return decoded;
  } catch (error) {
    console.log('❌ VIP Packages: Token doğrulama hatası:', error);
    return null;
  }
}

// GET - Tüm VIP paketlerini getir
export async function GET(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await dbConnect();
    const packages = await VipPackage.find().sort({ level: 1 });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('VIP paketleri getirme hatası:', error);
    return NextResponse.json(
      { error: 'VIP paketleri getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni VIP paketi oluştur
export async function POST(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { level, name, price, dailyWithdrawLimit, dailyTasksLimit, features, isActive } = body;

    if (!level || !name || !price || !dailyWithdrawLimit || !dailyTasksLimit) {
      return NextResponse.json(
        { error: 'Tüm alanları doldurun' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if level already exists
    const existingPackage = await VipPackage.findOne({ level });
    if (existingPackage) {
      return NextResponse.json(
        { error: 'Bu seviye zaten mevcut' },
        { status: 400 }
      );
    }

    const newPackage = await VipPackage.create({
      level,
      name,
      price,
      dailyWithdrawLimit,
      dailyTasksLimit,
      features: features || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    console.log(`✅ E-Corp Admin: Yeni VIP paketi oluşturuldu - ${name} (Seviye ${level})`);

    return NextResponse.json({ 
      message: 'VIP paketi başarıyla oluşturuldu',
      package: newPackage
    });
  } catch (error) {
    console.error('VIP paketi oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'VIP paketi oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

// PATCH - VIP paketini güncelle
export async function PATCH(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { _id, name, price, dailyWithdrawLimit, dailyTasksLimit, features, isActive } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Paket ID gerekli' },
        { status: 400 }
      );
    }

    await dbConnect();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (dailyWithdrawLimit !== undefined) updateData.dailyWithdrawLimit = dailyWithdrawLimit;
    if (dailyTasksLimit !== undefined) updateData.dailyTasksLimit = dailyTasksLimit;
    if (features !== undefined) updateData.features = features;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPackage = await VipPackage.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    if (!updatedPackage) {
      return NextResponse.json(
        { error: 'VIP paketi bulunamadı' },
        { status: 404 }
      );
    }

    console.log(`✅ E-Corp Admin: VIP paketi güncellendi - ${updatedPackage.name} (Seviye ${updatedPackage.level})`);

    return NextResponse.json({ 
      message: 'VIP paketi başarıyla güncellendi',
      package: updatedPackage
    });
  } catch (error) {
    console.error('VIP paketi güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'VIP paketi güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - VIP paketini sil
export async function DELETE(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('id');

    if (!packageId) {
      return NextResponse.json(
        { error: 'Paket ID gerekli' },
        { status: 400 }
      );
    }

    await dbConnect();

    const deletedPackage = await VipPackage.findByIdAndDelete(packageId);

    if (!deletedPackage) {
      return NextResponse.json(
        { error: 'VIP paketi bulunamadı' },
        { status: 404 }
      );
    }

    console.log(`🗑️ E-Corp Admin: VIP paketi silindi - ${deletedPackage.name} (Seviye ${deletedPackage.level})`);

    return NextResponse.json({ 
      message: 'VIP paketi başarıyla silindi'
    });
  } catch (error) {
    console.error('VIP paketi silme hatası:', error);
    return NextResponse.json(
      { error: 'VIP paketi silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

