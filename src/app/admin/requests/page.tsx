import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { RequestsManager, SerializedPoojaRequest } from "@/components/admin/RequestsManager";

export const metadata = {
  title: "Pooja Requests Manager | Shri Vinayaka Temple",
};

export default async function AdminRequestsPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/admin/login");
  }

  // Fetch all requests ordered newest first
  const rawRequests = await db.poojaRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = rawRequests.filter((r) => r.status === "PENDING").length;

  const serializedRequests: SerializedPoojaRequest[] = rawRequests.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    poojaType: r.poojaType,
    dateRequested: r.dateRequested.toISOString(),
    notes: r.notes,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-temple-ivory/60 flex flex-col w-full overflow-x-hidden">
      <AdminNav pendingCount={pendingCount} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 overflow-hidden">
        {/* Page Title & Priest Guidance */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-temple-charcoal tracking-tight">
              Devotee Pooja Requests
            </h1>
            <p className="text-xs sm:text-sm text-temple-warmGrey mt-0.5">
              Review and manage incoming pooja bookings from devotees. Tap call or message to reach out.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-lg border border-temple-stoneBorder shadow-sm text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingCount} Pending Requests</span>
          </div>
        </div>

        <RequestsManager initialRequests={serializedRequests} />
      </main>
    </div>
  );
}
