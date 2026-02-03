import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";

export default function StaffStatusUpdate() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();

    // ✅ Real-time updates for status changes or new requests
    const channel = supabase
      .channel("access-requests-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "access_requests" },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Fetch data + generate signed URLs
  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("access_requests")
      .select("*");

    if (error) {
      console.error("Error fetching requests:", error);
      setLoading(false);
      return;
    }

    const requestsWithUrls = await Promise.all(
      (data || []).map(async (req) => {
        const normalizedStatus = (req.status || "pending").toLowerCase();
        if (req.file_path) {
          try {
            const { data: signedData } = await supabase.storage
              .from("ihcs-files")
              .createSignedUrl(req.file_path.trim(), 60 * 60);

            return {
              ...req,
              status: normalizedStatus,
              signed_url: signedData?.signedUrl || null,
            };
          } catch {
            return { ...req, status: normalizedStatus, signed_url: null };
          }
        }
        return { ...req, status: normalizedStatus, signed_url: null };
      })
    );

    setRequests(requestsWithUrls);
    setLoading(false);
  };

  // ✅ Update status (approve / reject)
  const handleStatusChange = async (requestId, newStatus) => {
    const { error } = await supabase
      .from("access_requests")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (error) {
      showToast("❌ Failed to update status.", "error");
      return;
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );

    showToast(
      newStatus === "approved"
        ? "✅ Request approved successfully!"
        : "❌ Request rejected.",
      newStatus === "approved" ? "success" : "error"
    );
  };

  // ✅ EXTRA FUNCTION (the one you asked for)
  const isActionDisabled = (status, action) => {
    return status === action;
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredRequests = requests.filter((req) =>
    req.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const approved = requests.filter((r) => r.status === "approved");
  const rejected = requests.filter((r) => r.status === "rejected");
  const pending = requests.filter(
    (r) => !r.status || r.status === "pending"
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading access requests...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-[#16192c] relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-1/2 translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <img src={IhcsHeader} alt="IHCS Header" className="w-full shadow-md" />

      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white px-6 py-4 border-b shadow-sm">
        <h1 className="text-xl font-bold text-blue-700">
          IHCS Staff Dashboard
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 font-semibold"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </nav>

      {/* Search */}
      <div className="flex justify-center mt-8 mb-10">
        <div className="relative w-full max-w-md">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-4 border rounded-full"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-6">
        <div className="bg-green-100 border-l-4 border-green-600 rounded-xl p-6">
          <h2 className="text-xl font-bold text-green-700">
            Approved ({approved.length})
          </h2>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-xl p-6">
          <h2 className="text-xl font-bold text-yellow-600">
            Pending ({pending.length})
          </h2>
        </div>

        <div className="bg-red-100 border-l-4 border-red-600 rounded-xl p-6">
          <h2 className="text-xl font-bold text-red-700">
            Rejected ({rejected.length})
          </h2>
        </div>
      </div>

      {/* Cards */}
      <div className="mx-6 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-blue-700">
            Access Requests
          </h2>
          <div className="text-sm text-gray-500">
            {filteredRequests.length} request{filteredRequests.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-700">
              Records Table
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Company Name</th>
                  <th className="p-4 text-left">Contact No.</th>
                  <th className="p-4 text-left">Reason</th>
                  <th className="p-4 text-left">Uploaded File</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, index) => (
                  <tr
                    key={req.id}
                    className={index % 2 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="p-4 font-semibold">{req.company_name}</td>
                    <td className="p-4">{req.contact_number}</td>
                    <td className="p-4">{req.reason || "—"}</td>
                    <td className="p-4">
                      {req.signed_url ? (
                        <a
                          href={req.signed_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          {req.file_path?.split("/").pop()}
                        </a>
                      ) : (
                        "No file"
                      )}
                    </td>
                    <td className="p-4 capitalize">{req.status || "pending"}</td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={5}>
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`border rounded-2xl shadow-sm hover:shadow-lg transition-shadow ${
                req.status === "approved"
                  ? "bg-green-50 border-green-200"
                  : req.status === "rejected"
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {req.company_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {req.contact_number || "No contact number"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      req.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : req.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {req.status || "pending"}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Reason:</span>{" "}
                  {req.reason || "—"}
                </div>

                <div className="text-sm">
                  <span className="font-semibold text-gray-900">File:</span>{" "}
                  {req.signed_url ? (
                    <a
                      href={req.signed_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {req.file_path?.split("/").pop()}
                    </a>
                  ) : (
                    <span className="text-gray-500">No file</span>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    disabled={isActionDisabled(req.status, "approved")}
                    onClick={() => handleStatusChange(req.id, "approved")}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white ${
                      req.status === "approved"
                        ? "bg-green-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <CheckCircle size={16} /> Approve
                  </button>

                  <button
                    disabled={isActionDisabled(req.status, "rejected")}
                    onClick={() => handleStatusChange(req.id, "rejected")}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white ${
                      req.status === "rejected"
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <img src={IhcsFooter} alt="IHCS Footer" className="w-full mt-auto" />
    </div>
  );
}
