import type { Metadata } from "next";
import "./globals.css";
import {
  ArrowDownUp,
  BarChart3,
  History,
  Package,
  Settings,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { AuthProvider } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/protected-route";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProtectedRoute>
            <ClientLayout>{children}</ClientLayout>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
