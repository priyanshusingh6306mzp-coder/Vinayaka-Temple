export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-sm flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 ${
            t.type === "success"
              ? "bg-green-50 border-green-200 text-green-900"
              : t.type === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-white border-temple-stoneBorder text-temple-charcoal"
          }`}
        >
          <p className="leading-snug">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-xs font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
