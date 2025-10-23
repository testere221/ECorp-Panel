"use client";

import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import { useToast } from "./ToastContainer";

interface Task {
  id: number;
  amount: number;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/user/profile", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);

          // VIP seviyesine göre görev oluştur
          if (data.user.vipLevel === 0) {
            setTasks([]); // VIP değilse görev yok
          } else {
            // Bugünkü tamamlanmış görev sayısına bak
            const hasCompletedToday = data.user.dailyTasksCompleted >= data.user.dailyTasksLimit;
            
            if (hasCompletedToday) {
              setTasks([]); // Görevler tamamlandı, boş liste
            } else {
              // Her görev = Günlük Çekim / Görev Sayısı (VIP5: 62/5 = 12.4$)
              const taskAmount = data.user.dailyWithdrawLimit / data.user.dailyTasksLimit;
              const newTasks: Task[] = [];
              
              // Tamamlanmamış görev sayısı kadar göster
              const remainingTasks = data.user.dailyTasksLimit - data.user.dailyTasksCompleted;
              
              for (let i = 1; i <= remainingTasks; i++) {
                newTasks.push({
                  id: i,
                  amount: taskAmount,
                });
              }
              setTasks(newTasks);
            }
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchUserAndTasks();
  }, []);

  const handleCompleteTask = async (taskAmount: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ taskAmount }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Görev tamamlanamadı!");
        return;
      }

      toast.success(data.message);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error("Bağlantı hatası! Lütfen tekrar deneyin.");
      console.error("Task complete error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xl mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <DollarSign className="text-green-600" />
        Görevler
      </h2>
      
      {user && user.vipLevel === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Görevlere erişmek için VIP üye olmalısınız!</p>
          <p className="text-sm text-gray-500">VIP sayfasından paket satın alabilirsiniz.</p>
        </div>
      ) : user && user.dailyTasksCompleted >= user.dailyTasksLimit ? (
        <div className="text-center py-8">
          <div className="inline-block mb-4">
            <div className="bg-green-100 text-green-600 p-4 rounded-full">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-green-600 mb-2">Görevleri Tamamladınız!</h3>
          <p className="text-gray-600 mb-4">Bugünkü görevlerinizi başarıyla tamamladınız.</p>
          <p className="text-sm text-gray-500">24 saat sonra yeni görevler alabileceksiniz.</p>
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                    {task.id}
                  </div>
                  <span className="font-semibold text-gray-700">Görev #{task.id}</span>
                </div>
                <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                  ${task.amount.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => handleCompleteTask(task.amount)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition disabled:opacity-50"
              >
                {loading ? "İşleniyor..." : "Görevi Tamamla"}
              </button>
            </div>
          ))}
        </div>
      ) : user ? (
        <div className="text-center py-8">
          <div className="inline-block mb-4">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-blue-600 mb-2">Görev Bekleniyor</h3>
          <p className="text-gray-600">Görevleriniz yükleniyor...</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      )}
    </div>
  );
}

