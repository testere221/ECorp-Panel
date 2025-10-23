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

// Tüm çekim taleplerini listele
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

    let query: any = { type: 'withdraw' };
    
    if (status !== 'all') {
      query.status = status;
    }

    const withdrawals = await Transaction.find(query)
      .populate('userId', 'email firstName lastName vipLevel balance')
      .sort({ createdAt: -1 });

    // İstatistikler
    const stats = {
      pending: await Transaction.countDocuments({ type: 'withdraw', status: 'pending' }),
      completed: await Transaction.countDocuments({ type: 'withdraw', status: 'completed' }),
      rejected: await Transaction.countDocuments({ type: 'withdraw', status: 'rejected' }),
      totalAmount: withdrawals.reduce((sum, w) => w.status === 'completed' ? sum + w.amount : sum, 0),
    };

    return NextResponse.json({
      success: true,
      withdrawals,
      stats,
    });
  } catch (error: any) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

// Çekim talebini onayla/reddet
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

    const { withdrawalId, action, txHash, rejectReason } = await req.json();

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: 'Eksik parametreler' },
        { status: 400 }
      );
    }

    await connectDB();

    const withdrawal = await Transaction.findById(withdrawalId);

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Çekim talebi bulunamadı' },
        { status: 404 }
      );
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Bu talep zaten işleme alınmış' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      withdrawal.status = 'completed';
      withdrawal.txHash = txHash || null;
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      return NextResponse.json({
        success: true,
        message: 'Çekim talebi onaylandı',
        withdrawal,
      });
    } else if (action === 'reject') {
      withdrawal.status = 'rejected';
      withdrawal.description += ` - Red Nedeni: ${rejectReason || 'Belirtilmedi'}`;
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      // Kullanıcıya parayı geri ver
      const user = await User.findById(withdrawal.userId);
      if (user) {
        user.balance += withdrawal.amount;
        user.withdrawableBalance += withdrawal.amount;
        user.totalWithdraw -= withdrawal.amount;
        await user.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Çekim talebi reddedildi, bakiye iade edildi',
        withdrawal,
      });
    } else {
      return NextResponse.json(
        { error: 'Geçersiz işlem' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Update withdrawal error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

