import SeedData from "@/scripts/seed-data";

export default function SeedDataPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Tools</h1>
      <SeedData />
    </div>
  );
}
