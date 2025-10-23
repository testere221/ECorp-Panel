"use client";

import { useRouter } from "next/navigation";
import { Users, ArrowRight } from "lucide-react";

export default function TeamPage() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-full mb-4">
          <Users className="text-purple-600" size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Takımınızı Büyütün</h2>
        <p className="text-gray-600 text-lg">
          Arkadaşlarınızı davet ederek takımınızı büyütün ve kazanın!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">%5</div>
          <p className="text-gray-700 font-semibold">Seviye 1 Komisyon</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="text-4xl font-bold text-purple-600 mb-2">%3</div>
          <p className="text-gray-700 font-semibold">Seviye 2 Komisyon</p>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6">
          <div className="text-4xl font-bold text-pink-600 mb-2">%2</div>
          <p className="text-gray-700 font-semibold">Seviye 3 Komisyon</p>
        </div>
      </div>

      <button
        onClick={() => router.push("/referral")}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg inline-flex items-center gap-2"
      >
        Arkadaş Davet Et
        <ArrowRight size={24} />
      </button>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          💡 <strong>İpucu:</strong> Davet ettiğiniz her arkadaşın yatırımlarından komisyon kazanırsınız!
        </p>
      </div>
    </div>
  );
}

