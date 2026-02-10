"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function TopNav() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    };
    load();
  }, []);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="text-base font-semibold">我的产品</span>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          <Link href="/" className="hover:text-black">
            首页
          </Link>
          {email ? (
            <>
              <Link href="/dashboard" className="hover:text-black">
                主页面
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setEmail(null);
                  router.push("/login");
                }}
              >
                退出
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-black">
                登录
              </Link>
              <Link href="/register" className="hover:text-black">
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
