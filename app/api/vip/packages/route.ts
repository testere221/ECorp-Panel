import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VipPackage from '@/models/VipPackage';

// GET - Aktif VIP paketlerini getir (Public endpoint - herkes erişebilir)
export async function GET() {
  try {
    await dbConnect();
    
    // Sadece aktif paketleri getir, seviyeye göre sırala
    const packages = await VipPackage.find({ isActive: true }).sort({ level: 1 });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('VIP paketleri getirme hatası:', error);
    return NextResponse.json(
      { error: 'VIP paketleri getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

