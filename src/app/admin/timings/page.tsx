import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { TimingsManager } from "@/components/admin/TimingsManager";
import { getDarshanTimings } from "@/lib/darshan-timings";

export const metadata = {
  title: "Darshan Timings | Shri Vinayaka Temple Admin",
};

export default async function AdminTimingsPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/admin/login");
  }

  let pendingCount = 0;
  try {
    pendingCount = await db.poojaRequest.count({
      where: { status: "PENDING" },
    });
  } catch (err) {
    console.error("[Admin Timings Count Error]", err);
  }

  const initialTimings = await getDarshanTimings();

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminNav pendingCount={pendingCount} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <TimingsManager initialTimings={initialTimings} />
      </main>
    </div>
  );
}
