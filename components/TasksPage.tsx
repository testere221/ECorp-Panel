"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, DollarSign } from "lucide-react";
import { useToast } from "./ToastContainer";

interface Task {
  _id: string;
  taskName: string;
  amount: number;
  status: string;
  completedAt?: Date;
  createdAt: Date;
}

export default function TasksPage() {
  const [filter, setFilter] = useState<"ongoing" | "completed">("ongoing");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<any>(null);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
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
          setTasks(data.tasks || []);

          // Tamamlanmamış görevleri oluştur
          if (data.user.vipLevel > 0) {
            const completedToday = data.user.dailyTasksCompleted || 0;
            const totalLimit = data.user.dailyTasksLimit || 0;
            const remainingTasks = totalLimit - completedToday;
            
            if (remainingTasks > 0) {
              // Her görev = Günlük Çekim / Görev Sayısı (VIP5: 62/5 = 12.4$)
              const taskAmount = data.user.dailyWithdrawLimit / data.user.dailyTasksLimit;
              const pending = [];
              for (let i = 1; i <= remainingTasks; i++) {
                pending.push({
                  _id: `pending-${i}`,
                  taskName: `Görev ${completedToday + i}`,
                  amount: taskAmount,
                  status: 'pending',
                  createdAt: new Date(),
                });
              }
              setPendingTasks(pending);
            }
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = filter === "ongoing" 
    ? pendingTasks 
    : tasks.filter(task => task.status === "completed");

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
    <div>
      {/* Filtre Butonları */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter("ongoing")}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
            filter === "ongoing"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Clock className="inline mr-2" size={20} />
          Devam Eden
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
            filter === "completed"
              ? "bg-green-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <CheckCircle className="inline mr-2" size={20} />
          Tamamlanmış
        </button>
      </div>

      {/* Görev Listesi */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className={`rounded-2xl p-5 shadow-xl ${
              task.status === "completed"
                ? "bg-green-50 border-2 border-green-200"
                : "bg-gradient-to-r from-green-50 to-blue-50 border border-green-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  task.status === "completed" ? "bg-green-500" : "bg-blue-500"
                }`}>
                  {task.status === "completed" ? (
                    <CheckCircle className="text-white" size={24} />
                  ) : (
                    <Clock className="text-white" size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{task.taskName}</h3>
                  <p className={`text-sm ${
                    task.status === "completed" ? "text-green-600" : "text-blue-600"
                  }`}>
                    {task.status === "completed" 
                      ? `Tamamlandı - ${new Date(task.completedAt!).toLocaleDateString('tr-TR')}` 
                      : "Tamamlanmayı Bekliyor"}
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold ${
                task.status === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-green-600 text-white"
              }`}>
                ${task.amount.toFixed(2)}
              </div>
            </div>

            {/* Görev Tamamlama Butonu (sadece pending için) */}
            {task.status === 'pending' && (
              <button
                onClick={() => handleCompleteTask(task.amount)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition disabled:opacity-50 mt-3"
              >
                {loading ? "İşleniyor..." : "Görevi Tamamla"}
              </button>
            )}
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-xl">
            {filter === "ongoing" && user && user.vipLevel === 0 ? (
              <div>
                <p className="text-gray-500 text-lg mb-4">
                  Görevlere erişmek için VIP üye olmalısınız!
                </p>
                <p className="text-sm text-gray-400">
                  VIP sayfasından paket satın alabilirsiniz.
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-lg">
                {filter === "ongoing" 
                  ? "Bugünkü tüm görevlerinizi tamamladınız! 🎉" 
                  : "Henüz tamamlanmış göreviniz yok"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

