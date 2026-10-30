import { SessionWrapper } from "@/components/admin/SessionWrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionWrapper>
      <div className="min-h-screen bg-temple-ivory text-temple-charcoal">
        {children}
      </div>
    </SessionWrapper>
  );
}
