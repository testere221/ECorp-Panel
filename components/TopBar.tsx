"use client";

import { MessageCircle, Globe } from "lucide-react";
import { useState } from "react";
import SupportModal from "./SupportModal";

export default function TopBar() {
  const [language, setLanguage] = useState("TR");
  const [showSupport, setShowSupport] = useState(false);

  return (
    <>
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center justify-between">
            {/* Sol: Müşteri Destek */}
            <button 
              onClick={() => setShowSupport(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium hidden sm:inline">Destek</span>
            </button>

            {/* Orta: Site İsmi */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">E-CORP</h1>

            {/* Sağ: Dil Seçeneği */}
            <button
              onClick={() => setLanguage(language === "TR" ? "EN" : "TR")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
            >
              <Globe size={20} />
              <span className="text-sm font-medium">{language}</span>
            </button>
          </div>
        </div>
      </div>

      <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
    </>
  );
}

