"use client";

import { useState } from "react";
import { PoojaStatus } from "@prisma/client";
import {
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Edit2,
  Search,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePoojaStatus, updatePoojaNotes } from "@/actions/pooja.actions";
import { ToastContainer, ToastMessage } from "@/components/admin/Toast";

export interface SerializedPoojaRequest {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  poojaType: string;
  dateRequested: string;
  notes: string | null;
  status: PoojaStatus;
  createdAt: string;
}

export function RequestsManager({
  initialRequests,
}: {
  initialRequests: SerializedPoojaRequest[];
}) {
  const [requests, setRequests] = useState<SerializedPoojaRequest[]>(initialRequests);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pageSize = 15;

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Filter & Search
  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      req.name.toLowerCase().includes(query) ||
      req.phone.includes(query) ||
      req.poojaType.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Status transition handler with Optimistic UI
  const handleStatusChange = async (id: string, newStatus: PoojaStatus) => {
    const original = requests.find((r) => r.id === id);
    if (!original) return;

    // Optimistic update
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    try {
      const res = await updatePoojaStatus(id, newStatus);
      if (res.success) {
        addToast(
          "success",
          `Status updated to "${newStatus.toLowerCase()}" for devotee ${original.name}`
        );
      }
    } catch {
      // Revert optimistic update
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: original.status } : r))
      );
      addToast("error", "Failed to update status. Please try again.");
    }
  };

  // Notes update handler
  const handleSaveNotes = async (id: string) => {
    const original = requests.find((r) => r.id === id);
    if (!original) return;

    // Optimistic update
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, notes: notesDraft } : r))
    );
    setEditingNotesId(null);

    try {
      const res = await updatePoojaNotes(id, notesDraft);
      if (res.success) {
        addToast("success", "Priest notes saved successfully.");
      }
    } catch {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, notes: original.notes } : r))
      );
      addToast("error", "Failed to save notes. Please try again.");
    }
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  const getWhatsAppLink = (phone: string, devoteeName: string, poojaType: string) => {
    let clean = getCleanPhone(phone);
    if (clean.length === 10) clean = `91${clean}`;
    const msg = encodeURIComponent(
      `Namaste ${devoteeName} ji, with regards to your pooja request for "${poojaType}" at Shri Vinayaka Temple, Noida:`
    );
    return `https://wa.me/${clean}?text=${msg}`;
  };

  const getStatusBadge = (status: PoojaStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
            <CheckCircle className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200">
            <Check className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-temple-stoneBorder shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-temple-warmGrey absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by devotee name or phone number..."
            className="w-full h-11 pl-10 pr-4 text-sm rounded-lg border border-temple-stoneBorder bg-temple-ivory/30 focus:outline-none focus:ring-2 focus:ring-temple-gold text-temple-charcoal placeholder:text-temple-warmGrey"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 select-none">
          <Filter className="w-4 h-4 text-temple-warmGrey mr-1 shrink-0 hidden sm:inline" />
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`h-9 px-3 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-temple-charcoal text-white shadow-sm"
                  : "bg-temple-sandstone/40 text-temple-charcoal hover:bg-temple-sandstone/70 border border-temple-stoneBorder"
              }`}
            >
              {st === "ALL"
                ? `All (${requests.length})`
                : st === "PENDING"
                ? `Pending (${requests.filter((r) => r.status === "PENDING").length})`
                : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW (<768px): Mobile-First Cards */}
      <div className="block md:hidden space-y-4">
        {paginatedRequests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-temple-stoneBorder text-temple-warmGrey">
            No pooja requests found matching the selected filter.
          </div>
        ) : (
          paginatedRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-xl border border-temple-stoneBorder bg-white shadow-sm space-y-4"
            >
              {/* Header: Name & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-temple-charcoal leading-snug">
                    {req.name}
                  </h3>
                  <p className="text-xs text-temple-kumkum font-semibold mt-0.5">
                    {req.poojaType}
                  </p>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              {/* Date & Received Info */}
              <div className="text-xs text-temple-warmGrey space-y-1 bg-temple-sandstone/25 p-3 rounded-lg border border-temple-stoneBorder/60">
                <div className="flex items-center gap-1.5 text-temple-charcoal font-medium">
                  <Calendar className="w-3.5 h-3.5 text-temple-goldText" />
                  <span>Requested Date: {new Date(req.dateRequested).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <p>Submitted: {new Date(req.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</p>
              </div>

              {/* One-Tap Phone Quick Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 h-11 text-xs font-semibold border-temple-stoneBorder text-temple-charcoal hover:bg-green-50 hover:text-green-800 hover:border-green-300"
                >
                  <a href={`tel:${req.phone}`} className="inline-flex items-center justify-center gap-1.5">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>Call ({req.phone})</span>
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="flex-1 h-11 text-xs font-semibold border-green-300 bg-green-50 text-green-900 hover:bg-green-100"
                >
                  <a
                    href={getWhatsAppLink(req.phone, req.name, req.poojaType)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 text-green-700" />
                    <span>WhatsApp</span>
                  </a>
                </Button>
              </div>

              {/* Priest Notes Section */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-temple-warmGrey">
                    Priest Notes / Sankalpa
                  </span>
                  {editingNotesId !== req.id && (
                    <button
                      onClick={() => {
                        setEditingNotesId(req.id);
                        setNotesDraft(req.notes || "");
                      }}
                      className="text-xs text-temple-goldText hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{req.notes ? "Edit" : "Add Note"}</span>
                    </button>
                  )}
                </div>

                {editingNotesId === req.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Add priest notes (e.g. gotra, preferred morning slot, family names)..."
                      className="w-full p-2.5 text-xs rounded-lg border border-temple-stoneBorder focus:ring-2 focus:ring-temple-gold text-temple-charcoal"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingNotesId(null)}
                        className="h-8 px-3 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSaveNotes(req.id)}
                        className="h-8 px-3 text-xs bg-temple-charcoal text-white hover:bg-temple-charcoalCard"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-temple-charcoal italic bg-temple-ivory/50 p-2.5 rounded border border-temple-stoneBorder/50">
                    {req.notes || "No notes recorded yet."}
                  </p>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-temple-stoneBorder/60 flex flex-wrap gap-2">
                {req.status === "PENDING" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleStatusChange(req.id, "CONFIRMED")}
                    className="h-10 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    Confirm Pooja
                  </Button>
                )}
                {req.status === "CONFIRMED" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleStatusChange(req.id, "COMPLETED")}
                    className="h-10 px-4 text-xs font-semibold bg-green-700 hover:bg-green-800 text-white flex-1"
                  >
                    Mark as Completed
                  </Button>
                )}
                {req.status !== "CANCELLED" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(req.id, "CANCELLED")}
                    className="h-10 px-3 text-xs font-semibold text-red-700 border-red-200 hover:bg-red-50"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP VIEW (>=768px): Full Table */}
      <div className="hidden md:block bg-white rounded-xl border border-temple-stoneBorder shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-temple-sandstone/40 border-b border-temple-stoneBorder text-xs uppercase tracking-wider text-temple-warmGrey font-semibold">
              <tr>
                <th className="px-5 py-4">Devotee</th>
                <th className="px-5 py-4">Pooja Service</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Notes</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-temple-stoneBorder/60">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-temple-warmGrey">
                    No pooja requests found.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-temple-ivory/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-temple-charcoal">{req.name}</p>
                      {req.email && <p className="text-xs text-temple-warmGrey">{req.email}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-temple-charcoal text-xs">
                        {req.poojaType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-temple-charcoal">
                      <span className="font-medium">
                        {new Date(req.dateRequested).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <p className="text-[11px] text-temple-warmGrey">
                        {new Date(req.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs">
                          <a href={`tel:${req.phone}`} className="inline-flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-green-600" />
                            <span>{req.phone}</span>
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs border-green-200 bg-green-50 text-green-800 hover:bg-green-100">
                          <a
                            href={getWhatsAppLink(req.phone, req.name, req.poojaType)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-green-700" />
                          </a>
                        </Button>
                      </div>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-5 py-4 text-xs max-w-xs">
                      {editingNotesId === req.id ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            className="w-full p-1.5 text-xs rounded border border-temple-stoneBorder"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveNotes(req.id)}
                              className="px-2 py-0.5 text-[11px] bg-temple-charcoal text-white rounded font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-2 py-0.5 text-[11px] bg-gray-200 text-gray-700 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(req.id);
                            setNotesDraft(req.notes || "");
                          }}
                          className="cursor-pointer hover:bg-temple-sandstone/30 p-1 rounded group flex items-center justify-between"
                          title="Click to edit notes"
                        >
                          <span className="truncate italic text-temple-charcoal">
                            {req.notes || "Add notes..."}
                          </span>
                          <Edit2 className="w-3 h-3 text-temple-warmGrey opacity-0 group-hover:opacity-100 ml-1 shrink-0" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === "PENDING" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleStatusChange(req.id, "CONFIRMED")}
                            className="h-8 px-2.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
                          >
                            Confirm
                          </Button>
                        )}
                        {req.status === "CONFIRMED" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleStatusChange(req.id, "COMPLETED")}
                            className="h-8 px-2.5 text-xs bg-green-700 hover:bg-green-800 text-white font-medium"
                          >
                            Complete
                          </Button>
                        )}
                        {req.status !== "CANCELLED" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(req.id, "CANCELLED")}
                            className="h-8 px-2 text-xs text-red-600 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-temple-stoneBorder">
          <p className="text-xs text-temple-warmGrey">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredRequests.length)} of {filteredRequests.length} requests
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              <span>Previous</span>
            </Button>
            <span className="text-xs font-semibold px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Toast Notification Mount */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
