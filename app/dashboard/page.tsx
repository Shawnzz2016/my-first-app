"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FilterBar from "./components/FilterBar";
import TaskItem from "./components/TaskItem";
import CalendarView from "./components/CalendarView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import StatusBanner from "@/app/components/StatusBanner";

const features = [
  { title: "任务管理", desc: "创建、查看、完成任务。" },
  { title: "日历视图", desc: "查看一周计划与安排。" },
  { title: "数据统计", desc: "查看完成率和趋势。" },
];

function FeatureCard(props: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h3 className="text-xl font-medium">{props.title}</h3>
      <p className="mt-2 text-zinc-600">{props.desc}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<
    { id: string; text: string; done: boolean }[]
  >([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const router = useRouter();

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.done;
    if (filter === "done") return task.done;
    return true;
  });

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured) {
        setError("未配置 Supabase 环境变量");
        return;
      }
      setLoading(true);
      setError(null);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setLoading(false);
        router.replace("/login");
        return;
      }
      setUserId(userData.user.id);
      setUserEmail(userData.user.email ?? null);
      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select("id,title,done")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTasks(
          (data ?? []).map((task) => ({
            id: task.id,
            text: task.title,
            done: task.done,
          }))
        );
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-zinc-500">
            已登录：{userEmail || "未知邮箱"}
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
          >
            退出登录
          </Button>
        </div>
        <h1 className="text-4xl font-semibold">主页面</h1>
        <p className="mt-3 text-lg text-zinc-600">
          这里是登录后的核心内容。
        </p>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              desc={item.desc}
            />
          ))}
        </section>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-2xl font-medium">日历视图</h2>
          <p className="mt-2 text-sm text-zinc-500">
            点击某一天，会把日期填入输入框。
          </p>
          <div className="mt-4 overflow-x-auto">
            <CalendarView
              onDateClick={(dateStr) => {
                setInput(dateStr);
              }}
            />
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow">
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              className="flex-1"
              placeholder="输入一个任务"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              onClick={async () => {
                if (!input.trim()) return;
                if (!userId) {
                  setError("请先登录");
                  return;
                }
                setLoading(true);
                const { data, error: insertError } = await supabase
                  .from("tasks")
                  .insert({
                    user_id: userId,
                    title: input.trim(),
                    done: false,
                  })
                  .select("id,title,done")
                  .single();
                if (insertError) {
                  setError(insertError.message);
                } else if (data) {
                  setTasks([
                    { id: data.id, text: data.title, done: data.done },
                    ...tasks,
                  ]);
                  setInput("");
                }
                setLoading(false);
              }}
              disabled={loading}
            >
              添加
            </Button>
          </div>

          <FilterBar filter={filter} onChange={setFilter} />

          <h2 className="text-2xl font-medium">待办列表</h2>
          {error ? <StatusBanner tone="error" message={error} /> : null}
          {loading && !tasks.length ? (
            <p className="mt-3 text-sm text-zinc-500">加载中...</p>
          ) : null}
          {!loading && tasks.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">暂无任务，先添加一个吧。</p>
          ) : null}
          <ul className="mt-4 space-y-2 text-zinc-700">
            {visibleTasks.map((task) => (
              editingId === task.id ? (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2"
                >
                  <Input
                    className="flex-1"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      if (!editingText.trim()) return;
                      setLoading(true);
                      const { error: updateError } = await supabase
                        .from("tasks")
                        .update({ title: editingText.trim() })
                        .eq("id", task.id);
                      if (updateError) {
                        setError(updateError.message);
                      } else {
                        setTasks(
                          tasks.map((t) =>
                            t.id === task.id
                              ? { ...t, text: editingText.trim() }
                              : t
                          )
                        );
                        setEditingId(null);
                        setEditingText("");
                      }
                      setLoading(false);
                    }}
                    disabled={loading}
                  >
                    保存
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setEditingText("");
                    }}
                  >
                    取消
                  </Button>
                </li>
              ) : (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={async (id) => {
                    const current = tasks.find((t) => t.id === id);
                    if (!current) return;
                    const nextDone = !current.done;
                    setLoading(true);
                    const { error: updateError } = await supabase
                      .from("tasks")
                      .update({ done: nextDone })
                      .eq("id", id);
                    if (updateError) {
                      setError(updateError.message);
                    } else {
                      setTasks(
                        tasks.map((t) =>
                          t.id === id ? { ...t, done: nextDone } : t
                        )
                      );
                    }
                    setLoading(false);
                  }}
                  onEdit={(currentTask) => {
                    setEditingId(currentTask.id);
                    setEditingText(currentTask.text);
                  }}
                  onDelete={async (id) => {
                    setLoading(true);
                    const { error: deleteError } = await supabase
                      .from("tasks")
                      .delete()
                      .eq("id", id);
                    if (deleteError) {
                      setError(deleteError.message);
                    } else {
                      setTasks(tasks.filter((t) => t.id !== id));
                    }
                    setLoading(false);
                  }}
                />
              )
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
