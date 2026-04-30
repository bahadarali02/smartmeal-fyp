import React, { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import DashboardTopbar from "../../components/layout/DashboardTopbar";
import api from "../../services/api";

function formatStatus(status) {
  if (!status) {
    return "Pending";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getRoleBadgeStyle(role) {
  if (role === "admin") {
    return "badge-soft";
  }

  if (role === "chef") {
    return "badge-warning";
  }

  return "badge-success";
}

function getApprovalBadgeStyle(status) {
  if (status === "approved") {
    return "badge-success";
  }

  if (status === "rejected") {
    return "badge-danger";
  }

  return "badge-warning";
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("pending-chefs");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("smartmealToken");

      if (!token) {
        setErrorMessage("Please login first.");
        setLoading(false);
        return;
      }

      const response = await api.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.users || []);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to fetch users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const counts = useMemo(() => {
    const chefs = users.filter((user) => user.role === "chef");
    const customers = users.filter((user) => user.role === "customer");
    const admins = users.filter((user) => user.role === "admin");

    return {
      all: users.length,
      chefs: chefs.length,
      customers: customers.length,
      admins: admins.length,
      pendingChefs: chefs.filter((user) => user.approvalStatus === "pending")
        .length,
      approvedChefs: chefs.filter((user) => user.approvalStatus === "approved")
        .length,
      rejectedChefs: chefs.filter((user) => user.approvalStatus === "rejected")
        .length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (activeFilter === "all") {
      return users;
    }

    if (activeFilter === "customers") {
      return users.filter((user) => user.role === "customer");
    }

    if (activeFilter === "admins") {
      return users.filter((user) => user.role === "admin");
    }

    if (activeFilter === "all-chefs") {
      return users.filter((user) => user.role === "chef");
    }

    if (activeFilter === "pending-chefs") {
      return users.filter(
        (user) => user.role === "chef" && user.approvalStatus === "pending"
      );
    }

    if (activeFilter === "approved-chefs") {
      return users.filter(
        (user) => user.role === "chef" && user.approvalStatus === "approved"
      );
    }

    if (activeFilter === "rejected-chefs") {
      return users.filter(
        (user) => user.role === "chef" && user.approvalStatus === "rejected"
      );
    }

    return users;
  }, [users, activeFilter]);

  const handleUpdateChefStatus = async ({
    userId,
    approvalStatus,
    reason = "",
  }) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (approvalStatus === "rejected" && !reason.trim()) {
        setErrorMessage("Please write a rejection reason before rejecting.");
        setSelectedUserId(userId);
        return;
      }

      setActionLoadingId(userId);

      const token = localStorage.getItem("smartmealToken");

      await api.put(
        `/admin/users/${userId}/approval`,
        {
          approvalStatus,
          rejectionReason: approvalStatus === "rejected" ? reason.trim() : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(
        approvalStatus === "approved"
          ? "Chef approved successfully."
          : "Chef rejected successfully."
      );

      setSelectedUserId(null);
      setRejectionReason("");

      await fetchUsers();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2200);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to update chef status."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const filterTabs = [
    {
      key: "pending-chefs",
      label: "Pending Chefs",
      count: counts.pendingChefs,
    },
    {
      key: "approved-chefs",
      label: "Approved Chefs",
      count: counts.approvedChefs,
    },
    {
      key: "rejected-chefs",
      label: "Rejected Chefs",
      count: counts.rejectedChefs,
    },
    {
      key: "all-chefs",
      label: "All Chefs",
      count: counts.chefs,
    },
    {
      key: "customers",
      label: "Customers",
      count: counts.customers,
    },
    {
      key: "admins",
      label: "Admins",
      count: counts.admins,
    },
    {
      key: "all",
      label: "All Users",
      count: counts.all,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar role="admin" />

      <div className="flex-1">
        <DashboardTopbar
          title="User Management"
          subtitle="Review customer accounts, approve chef onboarding, reject incomplete chef profiles, and keep marketplace trust clear."
          actionLabel="Back to Admin"
          actionPath="/admin/dashboard"
        />

        <main className="p-6 sm:p-8">
          {successMessage ? (
            <div className="mb-6 rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-emerald-700">
                {successMessage}
              </p>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-6 rounded-[28px] border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            </div>
          ) : null}

          {loading ? (
            <div className="loading-shell">
              <p className="text-sm font-semibold text-slate-500">
                Loading users...
              </p>
            </div>
          ) : null}

          {!loading ? (
            <>
              <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Total Users
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(counts.all).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    All registered SmartMeal users.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Pending Chefs
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(counts.pendingChefs).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Chef profiles waiting for admin approval.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Approved Chefs
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(counts.approvedChefs).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Chef accounts with active marketplace access.
                  </p>
                </div>

                <div className="dashboard-card">
                  <p className="text-sm font-medium text-slate-500">
                    Customers
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                    {String(counts.customers).padStart(2, "0")}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Customer accounts using SmartMeal.
                  </p>
                </div>
              </section>

              <section className="mt-8 panel-soft">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      User Review Board
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Approved chefs should move out of the pending queue after
                      approval. This page always re-fetches fresh user data after
                      every approval or rejection.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {filterTabs.map((tab) => {
                      const active = activeFilter === tab.key;

                      return (
                        <button
                          key={tab.key}
                          onClick={() => {
                            setActiveFilter(tab.key);
                            setSelectedUserId(null);
                            setRejectionReason("");
                          }}
                          className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-300 ${
                            active
                              ? "bg-slate-900 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="mt-8">
                {filteredUsers.length === 0 ? (
                  <div className="empty-state">
                    <p className="text-lg font-semibold text-slate-900">
                      No users found
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      There are no users in this category right now.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-2">
                    {filteredUsers.map((user) => {
                      const isChef = user.role === "chef";
                      const approvalStatus =
                        user.approvalStatus || "pending";

                      return (
                        <div
                          key={user.id}
                          className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70"
                        >
                          <div className="p-6">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm font-semibold text-slate-500 shadow-sm">
                                  {user.profileImageUrl ? (
                                    <img
                                      src={user.profileImageUrl}
                                      alt={user.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    (user.name || "SM")
                                      .slice(0, 2)
                                      .toUpperCase()
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h3 className="truncate text-xl font-semibold text-slate-900">
                                    {user.name || "Unnamed User"}
                                  </h3>
                                  <p className="mt-1 truncate text-sm text-slate-500">
                                    {user.email}
                                  </p>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <span className={getRoleBadgeStyle(user.role)}>
                                      {formatStatus(user.role)}
                                    </span>

                                    {isChef ? (
                                      <span
                                        className={getApprovalBadgeStyle(
                                          approvalStatus
                                        )}
                                      >
                                        {approvalStatus === "approved"
                                          ? "Approved / Verified"
                                          : formatStatus(approvalStatus)}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              {isChef && approvalStatus !== "pending" ? (
                                <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
                                  Not pending anymore
                                </p>
                              ) : null}
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                  Phone
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {user.phone || "Not provided"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                  Service Area
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {user.serviceArea || "Not provided"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                  Specialty
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {user.specialty || "Not provided"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                  CNIC / ID
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {user.cnicImageUrl ? "Uploaded" : "Not uploaded"}
                                </p>
                              </div>
                            </div>

                            {isChef && approvalStatus === "rejected" && user.rejectionReason ? (
                              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm font-semibold text-red-700">
                                  Rejection reason
                                </p>
                                <p className="mt-2 text-sm leading-6 text-red-600">
                                  {user.rejectionReason}
                                </p>
                              </div>
                            ) : null}

                            {selectedUserId === user.id ? (
                              <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                                <label
                                  htmlFor={`rejection-reason-${user.id}`}
                                  className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                  Rejection Reason
                                </label>

                                <textarea
                                  id={`rejection-reason-${user.id}`}
                                  rows="4"
                                  value={rejectionReason}
                                  onChange={(event) =>
                                    setRejectionReason(event.target.value)
                                  }
                                  placeholder="Explain why this chef profile is being rejected..."
                                  className="textarea-soft bg-white"
                                />

                                <div className="mt-4 flex flex-wrap gap-3">
                                  <button
                                    onClick={() =>
                                      handleUpdateChefStatus({
                                        userId: user.id,
                                        approvalStatus: "rejected",
                                        reason: rejectionReason,
                                      })
                                    }
                                    disabled={actionLoadingId === user.id}
                                    className="btn-danger"
                                  >
                                    {actionLoadingId === user.id
                                      ? "Rejecting..."
                                      : "Confirm Reject"}
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedUserId(null);
                                      setRejectionReason("");
                                    }}
                                    className="btn-secondary"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : null}

                            {isChef ? (
                              <div className="mt-6 flex flex-wrap gap-3">
                                {approvalStatus !== "approved" ? (
                                  <button
                                    onClick={() =>
                                      handleUpdateChefStatus({
                                        userId: user.id,
                                        approvalStatus: "approved",
                                      })
                                    }
                                    disabled={actionLoadingId === user.id}
                                    className="btn-primary"
                                  >
                                    {actionLoadingId === user.id
                                      ? "Approving..."
                                      : approvalStatus === "rejected"
                                      ? "Approve Again"
                                      : "Approve Chef"}
                                  </button>
                                ) : null}

                                {approvalStatus !== "rejected" ? (
                                  <button
                                    onClick={() => {
                                      setSelectedUserId(user.id);
                                      setRejectionReason(
                                        user.rejectionReason || ""
                                      );
                                    }}
                                    disabled={actionLoadingId === user.id}
                                    className="btn-danger"
                                  >
                                    {approvalStatus === "approved"
                                      ? "Reject / Remove Approval"
                                      : "Reject Chef"}
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default AdminUsersPage;