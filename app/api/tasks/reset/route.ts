import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Bu API günlük görev sayaçlarını sıfırlar (CRON job veya manuel çağrı için)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Tüm kullanıcıların dailyTasksCompleted'ını sıfırla
    await User.updateMany(
      {},
      {
        $set: {
          dailyTasksCompleted: 0,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Günlük görev sayaçları sıfırlandı',
    });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

