import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TruckReconciliation from "@/components/vehicles/truck-reconciliation";

interface ReconcileTruckPageProps {
  params: {
    reference: string;
  };
}

export default function ReconcileTruckPage({
  params,
}: ReconcileTruckPageProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - same as in dashboard */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-white border-r">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-primary">StockManager</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link
            href="/"
            className="flex items-center px-2 py-3 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <Package className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          {/* Other navigation links */}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/transactions">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h2 className="text-xl font-semibold">Truck Trip Reconciliation</h2>
          </div>
        </header>

        <main className="p-6">
          <TruckReconciliation referenceId={params.reference} />
        </main>
      </div>
    </div>
  );
}
