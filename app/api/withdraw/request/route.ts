import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import UserTask from '@/models/UserTask';

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
    
    const { amount, address, network, crypto } = await req.json();

    // Validasyon
    if (!amount || !address || !network || !crypto) {
      return NextResponse.json(
        { error: 'Lütfen tüm alanları doldurun' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Geçersiz miktar' },
        { status: 400 }
      );
    }

    // Database bağlantısı
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // VIP kontrolü
    if (user.vipLevel === 0) {
      return NextResponse.json(
        { error: 'Para çekebilmek için VIP üye olmalısınız!' },
        { status: 400 }
      );
    }

    // Günlük çekim limiti kontrolü
    if (amount > user.dailyWithdrawLimit) {
      return NextResponse.json(
        { 
          error: `Günlük çekim limitiniz: ${user.dailyWithdrawLimit}$. Daha fazla çekmek için VIP seviyenizi yükseltin!`,
          limit: user.dailyWithdrawLimit
        },
        { status: 400 }
      );
    }

    // Görev tamamlama kontrolü
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedTasksToday = await UserTask.countDocuments({
      userId: user._id,
      status: 'completed',
      completedAt: { $gte: today }
    });

    if (completedTasksToday === 0) {
      return NextResponse.json(
        { 
          error: 'Para çekebilmek için bugünkü görevinizi tamamlamalısınız!',
          tasksCompleted: completedTasksToday,
          tasksRequired: 1
        },
        { status: 400 }
      );
    }

    // ANA Bakiye kontrolü
    if (user.balance < amount) {
      return NextResponse.json(
        { 
          error: `Yetersiz ana bakiye! Ana bakiyeniz: ${user.balance}$`,
          balance: user.balance
        },
        { status: 400 }
      );
    }

    // ÇEKİLEBİLİR Bakiye kontrolü
    if (user.withdrawableBalance < amount) {
      return NextResponse.json(
        { 
          error: `Yetersiz çekilebilir bakiye! Çekilebilir bakiyeniz: ${user.withdrawableBalance}$`,
          withdrawableBalance: user.withdrawableBalance
        },
        { status: 400 }
      );
    }

    // Bakiyeden düş (hem ana bakiye hem çekilebilir bakiye)
    user.balance -= amount; // ANA BAKİYEDEN DÜŞ
    user.withdrawableBalance -= amount; // ÇEKİLEBİLİR BAKİYEDEN DÜŞ
    user.totalWithdraw += amount;
    await user.save();

    // Transaction kaydı oluştur
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'withdraw',
      amount: amount,
      currency: crypto,
      status: 'pending',
      description: `${amount}$ ${crypto} çekim talebi`,
      walletAddress: address,
      network: network,
      balanceAfter: user.balance, // İşlem sonrası bakiye
    });

    return NextResponse.json({
      success: true,
      message: 'Çekim talebiniz alındı! 24 saat içinde işleme alınacaktır.',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      withdrawableBalance: user.withdrawableBalance,
    });
  } catch (error: any) {
    console.error('Withdraw error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

