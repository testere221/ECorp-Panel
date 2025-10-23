"use client";

import { Home, CheckSquare, Users, Crown, User } from "lucide-react";

interface BottomNavProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function BottomNav({ currentPage, setCurrentPage }: BottomNavProps) {
  const navItems = [
    { id: "ana-sayfa", label: "AnaSayfa", icon: Home },
    { id: "gorevler", label: "Görevler", icon: CheckSquare },
    { id: "takim", label: "Takım", icon: Users },
    { id: "vip", label: "Vip", icon: Crown },
    { id: "profil", label: "Profil", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

