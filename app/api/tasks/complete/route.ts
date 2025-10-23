import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserTask from '@/models/UserTask';
import Transaction from '@/models/Transaction';

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
    
    const { taskAmount } = await req.json();

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
        { error: 'Görev tamamlamak için VIP üye olmalısınız!' },
        { status: 400 }
      );
    }

    // Bugünkü tamamlanmış görev kontrolü
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedTasksToday = await UserTask.countDocuments({
      userId: user._id,
      status: 'completed',
      completedAt: { $gte: today }
    });

    // Eğer bugün hiç görev tamamlanmamışsa ve dailyTasksCompleted > 0 ise sıfırla
    // (Yeni gün başlamış demektir)
    if (completedTasksToday === 0 && user.dailyTasksCompleted > 0) {
      user.dailyTasksCompleted = 0;
      user.withdrawableBalance = 0; // Günlük çekilebilir bakiye sıfırla
      await user.save();
    }

    if (completedTasksToday >= user.dailyTasksLimit) {
      return NextResponse.json(
        { 
          error: `Günlük görev limitinize ulaştınız! (${user.dailyTasksLimit} görev)`,
          limit: user.dailyTasksLimit,
          completed: completedTasksToday
        },
        { status: 400 }
      );
    }

    // Gerçek Task oluştur veya mevcut task kullan
    const mongoose = require('mongoose');
    const taskObjectId = new mongoose.Types.ObjectId();
    
    // Görev kaydı oluştur
    const userTask = await UserTask.create({
      userId: user._id,
      taskId: taskObjectId,
      taskName: `Görev ${completedTasksToday + 1}`,
      amount: taskAmount,
      status: 'completed',
      completedAt: new Date(),
    });

    // Kullanıcıya ödül ekle (hem ana bakiye hem çekilebilir bakiye)
    user.balance += taskAmount; // ANA BAKİYE
    
    // Çekilebilir bakiye günlük limit ile sınırlı
    const newWithdrawable = user.withdrawableBalance + taskAmount;
    user.withdrawableBalance = Math.min(newWithdrawable, user.dailyWithdrawLimit);
    
    user.totalEarnings += taskAmount;
    user.dailyTasksCompleted = completedTasksToday + 1;
    await user.save();

    // Transaction kaydı
    await Transaction.create({
      userId: user._id,
      type: 'task_reward',
      amount: taskAmount,
      currency: 'USD',
      status: 'completed',
      description: `Görev tamamlandı - ${taskAmount}$ kazanıldı`,
      balanceAfter: user.balance, // İşlem sonrası bakiye
    });

    return NextResponse.json({
      success: true,
      message: `Tebrikler! Görev tamamlandı, ${taskAmount}$ kazandınız!`,
      task: {
        id: userTask._id,
        amount: userTask.amount,
        completedAt: userTask.completedAt,
      },
      withdrawableBalance: user.withdrawableBalance,
      tasksCompleted: user.dailyTasksCompleted,
      tasksLimit: user.dailyTasksLimit,
    });
  } catch (error: any) {
    console.error('Task complete error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

