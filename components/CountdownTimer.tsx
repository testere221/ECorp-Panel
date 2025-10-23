"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xl mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="text-blue-600" size={24} />
          <span className="text-gray-700 font-semibold">Görev Sıfırlanma:</span>
        </div>
        <div className="flex gap-2">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-center min-w-[50px]">
            <div className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-xs">Saat</div>
          </div>
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-center min-w-[50px]">
            <div className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="text-xs">Dakika</div>
          </div>
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-center min-w-[50px]">
            <div className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="text-xs">Saniye</div>
          </div>
        </div>
      </div>
    </div>
  );
}

