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
  title: "Inventory Management",
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
