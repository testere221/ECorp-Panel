import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

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

// Tüm para yatırma taleplerini listele
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';

    await connectDB();

    let query: any = { type: 'deposit' };
    
    if (status !== 'all') {
      query.status = status;
    }

    const deposits = await Transaction.find(query)
      .populate('userId', 'email firstName lastName vipLevel balance')
      .sort({ createdAt: -1 });

    // İstatistikler
    const stats = {
      pending: await Transaction.countDocuments({ type: 'deposit', status: 'pending' }),
      completed: await Transaction.countDocuments({ type: 'deposit', status: 'completed' }),
      rejected: await Transaction.countDocuments({ type: 'deposit', status: 'rejected' }),
      totalAmount: deposits.reduce((sum, d) => d.status === 'completed' ? sum + d.amount : sum, 0),
    };

    return NextResponse.json({
      success: true,
      deposits,
      stats,
    });
  } catch (error: any) {
    console.error('Get deposits error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

// Para yatırma talebini onayla/reddet
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

    const { depositId, action, txHash } = await req.json();

    if (!depositId || !action) {
      return NextResponse.json(
        { error: 'Eksik parametreler' },
        { status: 400 }
      );
    }

    await connectDB();

    const deposit = await Transaction.findById(depositId);

    if (!deposit) {
      return NextResponse.json(
        { error: 'Para yatırma talebi bulunamadı' },
        { status: 404 }
      );
    }

    if (deposit.status !== 'pending') {
      return NextResponse.json(
        { error: 'Bu talep zaten işleme alınmış' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Kullanıcıya bakiye ekle
      const user = await User.findById(deposit.userId);
      if (user) {
        user.balance += deposit.amount;
        user.totalDeposit += deposit.amount;
        await user.save();
        
        // İşlem sonrası bakiyeyi kaydet
        deposit.balanceAfter = user.balance;
      }

      deposit.status = 'completed';
      deposit.txHash = txHash || null;
      deposit.processedAt = new Date();
      await deposit.save();

      return NextResponse.json({
        success: true,
        message: 'Para yatırma talebi onaylandı, kullanıcı bakiyesi güncellendi',
        deposit,
      });
    } else if (action === 'reject') {
      deposit.status = 'rejected';
      deposit.description += ' - Admin tarafından reddedildi';
      deposit.processedAt = new Date();
      await deposit.save();

      return NextResponse.json({
        success: true,
        message: 'Para yatırma talebi reddedildi',
        deposit,
      });
    } else {
      return NextResponse.json(
        { error: 'Geçersiz işlem' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Update deposit error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

