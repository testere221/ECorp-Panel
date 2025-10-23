"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import ActionButtons from "@/components/ActionButtons";
import CountdownTimer from "@/components/CountdownTimer";
import TaskList from "@/components/TaskList";
import MemberList from "@/components/MemberList";
import TasksPage from "@/components/TasksPage";
import TeamPage from "@/components/TeamPage";
import VipPage from "@/components/VipPage";
import ProfilePage from "@/components/ProfilePage";
import TransactionsPage from "@/components/TransactionsPage";
import AccountHistoryPage from "@/components/AccountHistoryPage";
import CompanyProfilePage from "@/components/CompanyProfilePage";

export default function Dashboard() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState("ana-sayfa");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 pb-20">
      <TopBar />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {currentPage === "ana-sayfa" && (
          <>
            <ActionButtons setCurrentPage={setCurrentPage} />
            <CountdownTimer />
            <TaskList />
            <MemberList />
          </>
        )}

        {currentPage === "gorevler" && (
          <TasksPage />
        )}

        {currentPage === "takim" && (
          <TeamPage />
        )}

        {currentPage === "vip" && (
          <VipPage />
        )}

        {currentPage === "profil" && (
          <ProfilePage setCurrentPage={setCurrentPage} />
        )}

        {currentPage === "hesap-hareketleri" && (
          <TransactionsPage />
        )}

        {currentPage === "hesap-kayitlari" && (
          <AccountHistoryPage />
        )}

        {currentPage === "sirket-profili" && (
          <CompanyProfilePage />
        )}
      </div>

      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}

