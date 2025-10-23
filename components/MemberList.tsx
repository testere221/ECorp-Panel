"use client";

import { useEffect, useState } from "react";
import { Network } from "lucide-react";

interface Member {
  id: number;
  email: string;
  balance: number;
  vipLevel: number;
  action: string;
}

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);

  // Email maskeleme fonksiyonu
  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    const visibleChars = Math.min(3, Math.floor(localPart.length * 0.3));
    const hiddenLength = localPart.length - visibleChars;
    const maskedLocal = localPart.substring(0, visibleChars) + '*'.repeat(Math.min(hiddenLength, 6));
    return `${maskedLocal}@${domain}`;
  };

  // Rastgele üye verisi oluştur
  const generateRandomMembers = () => {
    const firstNames = [
      // Türk isimleri
      'ahmet', 'mehmet', 'ayse', 'fatma', 'emre', 'can', 'zeynep', 'elif',
      'ali', 'veli', 'murat', 'deniz', 'selin', 'burak', 'ebru', 'kerem',
      'yusuf', 'cem', 'mine', 'berk', 'ege', 'defne', 'gizem', 'eren',
      // Yabancı isimler
      'john', 'michael', 'david', 'james', 'robert', 'william', 'richard', 'thomas',
      'mary', 'jennifer', 'linda', 'patricia', 'sarah', 'jessica', 'emily', 'emma',
      'mohammed', 'ali', 'omar', 'ahmed', 'fatima', 'aisha', 'zainab', 'maria',
      'antonio', 'jose', 'carlos', 'luis', 'juan', 'ana', 'carmen', 'sofia',
      'wang', 'li', 'zhang', 'chen', 'yang', 'liu', 'huang', 'zhao',
      'kumar', 'singh', 'patel', 'sharma', 'khan', 'raj', 'priya', 'anjali'
    ];

    const lastNames = [
      // Türk soyisimleri
      'yilmaz', 'demir', 'kaya', 'sahin', 'celik', 'yildiz', 'arslan', 'dogan',
      'ozturk', 'kara', 'aydin', 'ozkan', 'erdogan', 'aksoy', 'yildirim', 'tas',
      // Yabancı soyisimler
      'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis',
      'rodriguez', 'martinez', 'hernandez', 'lopez', 'gonzalez', 'wilson', 'anderson',
      'thomas', 'taylor', 'moore', 'jackson', 'martin', 'lee', 'thompson', 'white',
      'kumar', 'patel', 'singh', 'cohen', 'nguyen', 'kim', 'park', 'chen'
    ];

    const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'protonmail.com', 'mail.com'];
    
    const actions = [
      'Katkı Yaptı', 'Katıldı', 'Seviye Yükseltti', 'Ağa Katıldı', 'Para Yatırdı', 
      'Aktif', 'Çekim Yaptı', 'Görev Tamamladı'
    ];
    
    const newMembers: Member[] = [];
    for (let i = 0; i < 5; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const randomNum = Math.floor(Math.random() * 99) + 1;
      
      const rawEmail = `${firstName}.${lastName}${randomNum}@${domain}`;
      const maskedEmail = maskEmail(rawEmail);
      
      // E-Corp'a uygun daha büyük rakamlar (500$ - 25000$)
      const balance = Math.floor(Math.random() * 24500) + 500;
      // VIP 1-7 arası (daha dengeli dağılım)
      const vipLevel = Math.floor(Math.random() * 7) + 1;
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      newMembers.push({
        id: i + 1,
        email: maskedEmail,
        balance: balance,
        vipLevel: vipLevel,
        action: action,
      });
    }
    
    setMembers(newMembers);
  };

  useEffect(() => {
    // İlk yüklemede üretıç
    generateRandomMembers();

    // Her 3 saniyede bir yenile
    const interval = setInterval(() => {
      generateRandomMembers();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getVipColor = (level: number) => {
    const colors = [
      'from-slate-500 to-slate-600',     // VIP 1
      'from-blue-500 to-blue-600',       // VIP 2
      'from-purple-500 to-purple-600',   // VIP 3
      'from-pink-500 to-pink-600',       // VIP 4
      'from-orange-500 to-orange-600',   // VIP 5
      'from-yellow-500 to-yellow-600',   // VIP 6
      'from-red-500 to-red-600',         // VIP 7
    ];
    return colors[level - 1] || colors[0];
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 shadow-xl border border-purple-500/30">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Network className="text-purple-400" />
        Canlı Ağ Aktivitesi
      </h2>
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600 rounded-xl p-3 flex flex-col gap-2 hover:border-purple-500/50 transition-all animate-slide-in"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`bg-gradient-to-r ${getVipColor(member.vipLevel)} text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex-shrink-0`}>
                  S{member.vipLevel}
                </div>
                <span className="text-slate-300 text-xs truncate">{member.email}</span>
              </div>
              <div className="text-green-400 font-bold text-sm flex-shrink-0">
                +${member.balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{member.action}</span>
              <span className="text-slate-500">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400">
          🌐 Her 3 saniyede güncellenir • Gerçek zamanlı ağ aktivitesi
        </p>
      </div>
    </div>
  );
}

