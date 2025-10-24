import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VipPackage from '@/models/VipPackage';

// Force dynamic - Cache'i kapat
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Aktif VIP paketlerini getir (Public endpoint - herkes erişebilir)
export async function GET() {
  try {
    await dbConnect();
    
    console.log('🔍 VIP Packages API: Bağlantı kuruldu');
    
    // Tüm paketleri getir (debug için)
    const allPackages = await VipPackage.find({});
    console.log('📦 Toplam paket sayısı:', allPackages.length);
    console.log('📦 Tüm paketler:', JSON.stringify(allPackages, null, 2));
    
    // Sadece aktif paketleri getir, seviyeye göre sırala
    const packages = await VipPackage.find({ isActive: true }).sort({ level: 1 });
    console.log('✅ Aktif paket sayısı:', packages.length);

    return NextResponse.json({ 
      packages,
      debug: {
        totalPackages: allPackages.length,
        activePackages: packages.length
      }
    });
  } catch (error) {
    console.error('❌ VIP paketleri getirme hatası:', error);
    return NextResponse.json(
      { error: 'VIP paketleri getirilirken hata oluştu', details: error },
      { status: 500 }
    );
  }
}

