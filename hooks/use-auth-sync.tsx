"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

// This hook syncs the auth state with cookies for the middleware
export function useAuthSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Set a cookie to indicate the user is logged in
      // This is used by the middleware
      document.cookie = `user=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 1 week
    } else {
      // Remove the cookie when the user logs out
      document.cookie = "user=; path=/; max-age=0";
    }
  }, [user]);

  return null;
}
