"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import StatusBanner from "@/app/components/StatusBanner";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:gap-10">
        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <h1 className="text-4xl font-semibold">找回密码</h1>
          <p className="mt-3 text-lg text-zinc-600">
            输入邮箱，我们会发送重置链接。
          </p>

          <ul className="mt-6 space-y-3 text-zinc-700">
            <li>输入注册邮箱</li>
            <li>查收邮件里的重置链接</li>
            <li>设置新密码后即可登录</li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <h2 className="text-2xl font-medium">发送重置链接</h2>
          <p className="mt-2 text-sm text-zinc-500">
            请填写注册时的邮箱
          </p>

          <div className="mt-6 space-y-4">
            <Input
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button
              className="w-full"
              onClick={async () => {
                setError(null);
                setMessage(null);
                if (!isSupabaseConfigured) {
                  setError("未配置 Supabase 环境变量");
                  return;
                }
                const supabase = getSupabase();
                if (!supabase) {
                  setError("未配置 Supabase 环境变量");
                  return;
                }
                if (!email) {
                  alert("请先输入邮箱");
                  return;
                }
                setLoading(true);
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                  email,
                  {
                    redirectTo: `${window.location.origin}/login`,
                  }
                );
                setLoading(false);
                if (resetError) {
                  setError(resetError.message);
                  return;
                }
                setMessage(`已发送重置链接至：${email}`);
              }}
              disabled={loading}
            >
              {loading ? "发送中..." : "发送重置链接"}
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <span>想起密码了？</span>
            <Link className="hover:text-zinc-700" href="/login">
              返回登录
            </Link>
          </div>
          {error ? <StatusBanner tone="error" message={error} /> : null}
          {message ? <StatusBanner tone="success" message={message} /> : null}
        </section>
      </div>
    </main>
  );
}
