"use client";

import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  UserPlus, 
  Building2, 
  Handshake, 
  Smartphone 
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionButtonsProps {
  setCurrentPage?: (page: string) => void;
}

export default function ActionButtons({ setCurrentPage }: ActionButtonsProps) {
  const router = useRouter();

  const buttons = [
    { id: 1, label: "Para Yatır", icon: ArrowDownCircle, color: "bg-green-500", path: "/deposit", external: true },
    { id: 2, label: "Para Çek", icon: ArrowUpCircle, color: "bg-red-500", path: "/withdraw", external: true },
    { id: 3, label: "Arkadaş Davet Et", icon: UserPlus, color: "bg-purple-500", path: "/referral", external: true },
    { id: 4, label: "Şirket Profili", icon: Building2, color: "bg-blue-500", page: "sirket-profili", external: false },
    { id: 5, label: "İşbirlik", icon: Handshake, color: "bg-orange-500", path: "/referral", external: true },
    { id: 6, label: "Uygulama", icon: Smartphone, color: "bg-pink-500", path: "/app", external: true },
  ];

  const handleButtonClick = (button: any) => {
    if (button.external && button.path) {
      router.push(button.path);
    } else if (!button.external && button.page && setCurrentPage) {
      setCurrentPage(button.page);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <button
            key={button.id}
            onClick={() => handleButtonClick(button)}
            className={`${button.color} text-white rounded-xl p-4 shadow-lg hover:scale-105 transition-transform duration-200 flex flex-col items-center gap-2`}
          >
            <Icon size={28} />
            <span className="text-xs font-semibold text-center leading-tight">
              {button.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

