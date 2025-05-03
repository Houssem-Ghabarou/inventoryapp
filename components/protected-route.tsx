"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      !isLoading &&
      !user &&
      pathname !== "/login" &&
      pathname !== "/register"
    ) {
      router.push("/login");
    }
  }, [user, isLoading, router, pathname]);

  useEffect(() => {
    if (pathname === "/login" && user) {
      router.push("/");
    }
  }, [pathname, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
