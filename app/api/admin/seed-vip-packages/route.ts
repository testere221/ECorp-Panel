import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VipPackage from '@/models/VipPackage';

// Seed fonksiyonu
async function seedVipPackages() {
  try {
    await dbConnect();

    // Check if packages already exist
    const existingCount = await VipPackage.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json(
        { message: 'VIP paketleri zaten mevcut', count: existingCount },
        { status: 200 }
      );
    }

    const defaultPackages = [
      {
        level: 1,
        name: 'VIP 1',
        price: 12,
        dailyWithdrawLimit: 3,
        dailyTasksLimit: 1,
        features: ['Günlük 1 görev hakkı', '7/24 destek', 'Hızlı çekim'],
        isActive: true,
      },
      {
        level: 2,
        name: 'VIP 2',
        price: 25,
        dailyWithdrawLimit: 6,
        dailyTasksLimit: 2,
        features: ['Günlük 2 görev hakkı', '7/24 destek', 'Hızlı çekim'],
        isActive: true,
      },
      {
        level: 3,
        name: 'VIP 3',
        price: 50,
        dailyWithdrawLimit: 12,
        dailyTasksLimit: 3,
        features: ['Günlük 3 görev hakkı', '7/24 destek', 'Hızlı çekim'],
        isActive: true,
      },
      {
        level: 4,
        name: 'VIP 4',
        price: 100,
        dailyWithdrawLimit: 25,
        dailyTasksLimit: 4,
        features: ['Günlük 4 görev hakkı', '7/24 destek', 'Hızlı çekim'],
        isActive: true,
      },
      {
        level: 5,
        name: 'VIP 5',
        price: 250,
        dailyWithdrawLimit: 62,
        dailyTasksLimit: 5,
        features: ['Günlük 5 görev hakkı', '7/24 destek', 'Hızlı çekim'],
        isActive: true,
      },
      {
        level: 6,
        name: 'VIP 6',
        price: 500,
        dailyWithdrawLimit: 125,
        dailyTasksLimit: 6,
        features: ['Günlük 6 görev hakkı', '7/24 destek', 'Hızlı çekim'],
        isActive: true,
      },
      {
        level: 7,
        name: 'VIP 7',
        price: 1000,
        dailyWithdrawLimit: 250,
        dailyTasksLimit: 7,
        features: ['Günlük 7 görev hakkı', '7/24 destek', 'Hızlı çekim'],
        isActive: true,
      },
    ];

    await VipPackage.insertMany(defaultPackages);

    console.log('✅ E-Corp: 7 adet varsayılan VIP paketi oluşturuldu!');

    return NextResponse.json({ 
      message: 'VIP paketleri başarıyla oluşturuldu',
      count: defaultPackages.length
    });
  } catch (error) {
    console.error('VIP paketleri seed hatası:', error);
    return NextResponse.json(
      { error: 'VIP paketleri oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

// GET - Tarayıcıdan direkt erişim için
export async function GET() {
  return seedVipPackages();
}

// POST - API çağrısı için
export async function POST() {
  return seedVipPackages();
}

