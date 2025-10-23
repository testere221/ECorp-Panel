import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

// GET - Tarayıcıdan direkt erişim için
export async function GET() {
  try {
    await connectDB();

    // İlk admin var mı kontrol et
    const adminCount = await Admin.countDocuments();
    
    if (adminCount > 0) {
      return NextResponse.json(
        { 
          message: 'Admin kullanıcısı zaten mevcut',
          info: 'Admin paneline giriş yapmak için: /admin/login'
        },
        { status: 200 }
      );
    }

    // Varsayılan admin oluştur
    const admin = await Admin.create({
      email: 'admin@yesstyle.com',
      password: 'admin123',
      name: 'E-Corp Admin',
      role: 'super_admin',
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'İlk admin kullanıcısı oluşturuldu',
      credentials: {
        email: 'admin@yesstyle.com',
        password: 'admin123'
      },
      info: 'Lütfen admin paneline giriş yapın ve şifrenizi değiştirin: /admin/login'
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tüm alanlar gerekli' },
        { status: 400 }
      );
    }

    await connectDB();

    // İlk admin var mı kontrol et
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Bu email ile admin zaten var' },
        { status: 400 }
      );
    }

    // Yeni admin oluştur
    const admin = await Admin.create({
      email,
      password, // Plain text
      name,
      role: 'super_admin',
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'İlk admin başarıyla oluşturuldu!',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

