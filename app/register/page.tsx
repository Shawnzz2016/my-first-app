"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import StatusBanner from "@/app/components/StatusBanner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:gap-10">
        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <h1 className="text-4xl font-semibold">创建新账号</h1>
          <p className="mt-3 text-lg text-zinc-600">
            只需 1 分钟，开始你的第一个产品旅程。
          </p>

          <ul className="mt-6 space-y-3 text-zinc-700">
            <li>轻量、清爽、易上手</li>
            <li>任务、日程、进度一体化</li>
            <li>随时扩展到完整产品</li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow sm:p-8">
          <h2 className="text-2xl font-medium">注册账号</h2>
          <p className="mt-2 text-sm text-zinc-500">
            请填写邮箱与密码完成注册
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
            <Input
              type="password"
              placeholder="确认密码"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
            />
            <Button
              className="w-full"
              onClick={async () => {
                setError(null);
                setMessage(null);
                if (!email) {
                  alert("请先输入邮箱");
                  return;
                }
                if (!password || password !== confirm) {
                  alert("两次密码不一致");
                  return;
                }
                setLoading(true);
                const { error: signUpError } = await supabase.auth.signUp({
                  email,
                  password,
                });
                setLoading(false);
                if (signUpError) {
                  setError(signUpError.message);
                  return;
                }
                setMessage("注册成功，请检查邮箱完成验证。");
              }}
              disabled={loading}
            >
              {loading ? "注册中..." : "注册"}
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <span>已有账号？</span>
            <Link className="hover:text-zinc-700" href="/login">
              去登录
            </Link>
          </div>
          {error ? <StatusBanner tone="error" message={error} /> : null}
          {message ? <StatusBanner tone="success" message={message} /> : null}
        </section>
      </div>
    </main>
  );
}
