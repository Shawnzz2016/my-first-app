"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import StatusBanner from "@/app/components/StatusBanner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      if (!isSupabaseConfigured) {
        setError("未配置 Supabase 环境变量");
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace("/dashboard");
      }
    };
    check();
  }, [router]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:gap-10">
        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <h1 className="text-4xl font-semibold">欢迎回来</h1>
          <p className="mt-3 text-lg text-zinc-600">
            登录后继续管理你的任务与日程。
          </p>

          <ul className="mt-6 space-y-3 text-zinc-700">
            <li>清晰的任务列表</li>
            <li>一键完成与筛选</li>
            <li>数据自动保存</li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <h2 className="text-2xl font-medium">登录你的账号</h2>
          <p className="mt-2 text-sm text-zinc-500">
            请输入邮箱与密码继续
          </p>

          <div className="mt-6 space-y-4">
            <Input
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <div className="flex items-center justify-between text-sm text-zinc-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" />
                记住我
              </label>
              <Link className="hover:text-zinc-900" href="/forgot">
                忘记密码
              </Link>
            </div>
            <Button
              className="w-full"
              onClick={async () => {
                setError(null);
                if (!isSupabaseConfigured) {
                  setError("未配置 Supabase 环境变量");
                  return;
                }
                if (!email) {
                  alert("请先输入邮箱");
                  return;
                }
                if (!password) {
                  setError("请输入密码");
                  return;
                }
                setLoading(true);
                const { error: signInError } = await supabase.auth.signInWithPassword(
                  {
                    email,
                    password,
                  }
                );
                setLoading(false);
                if (signInError) {
                  setError(signInError.message);
                  return;
                }
                router.push("/dashboard");
              }}
              disabled={loading}
            >
              {loading ? "登录中..." : "登录"}
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <span>当前输入邮箱：{email || "（未填写）"}</span>
            <Link className="hover:text-zinc-700" href="/register">
              去注册
            </Link>
          </div>
          {error ? <StatusBanner tone="error" message={error} /> : null}
        </section>
      </div>
    </main>
  );
}
