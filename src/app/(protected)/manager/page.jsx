"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ManagerDashboard() {
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    fetchForms();
  }, [statusFilter]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredForms(forms);
    } else {
      const filtered = forms.filter(
        (form) =>
          form.studentName?.toLowerCase().includes(search.toLowerCase()) ||
          form.registeredNo?.toLowerCase().includes(search.toLowerCase()) ||
          form.formNumber?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredForms(filtered);
    }
  }, [search, forms]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/manager/approval?status=${statusFilter}`
      );
      if (response.data.success) {
        setForms(response.data.data);
        setFilteredForms(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      alert("Failed to load forms. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveForm = (form) => {
    setSelectedForm(form);
    setVerificationNotes("");
    setShowApproveModal(true);
  };

  const handleRejectForm = (form) => {
    setSelectedForm(form);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
    setVerificationNotes("");
  };

  const closeModal = () => {
    setSelectedForm(null);
    setShowApproveModal(false);
    setShowRejectModal(false);
    setVerificationNotes("");
    setRejectionReason("");
  };

  const processApproval = async () => {
    setActionLoading(true);
    try {
      const response = await axios.put("/api/manager/approval", {
        formId: selectedForm._id,
        action: "approve",
        verificationNotes: verificationNotes,
      });

      if (response.data.success) {
        alert("✅ Form approved! Student is now enrolled.");
        closeModal();
        fetchForms();
      }
    } catch (error) {
      console.error("Error approving form:", error);
      alert("Failed to approve form. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const processRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.put("/api/manager/approval", {
        formId: selectedForm._id,
        action: "reject",
        rejectionReason: rejectionReason,
      });

      if (response.data.success) {
        alert("Form rejected");
        closeModal();
        fetchForms();
      }
    } catch (error) {
      console.error("Error rejecting form:", error);
      alert("Failed to reject form. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const generateCompletePDF = async (formId) => {
    setDownloadingPdf(true);
    try {
      const response = await axios.get(
        `/api/form/generate-pdf?formId=${formId}`,
        { responseType: 'blob' }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `UG1-COMPLETE-${formId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "tutor_approved":
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-sm">
            ⏳ PENDING VERIFICATION
          </span>
        );
      case "manager_approved":
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-sm">
            ✓ APPROVED & ENROLLED
          </span>
        );
      case "collector_rejected":
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700 shadow-sm">
            ✗ REJECTED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-PK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-l-8 border-indigo-600 dark:border-indigo-500 rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Manager Approval Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                Verify tutor-signed forms and approve student enrollment
              </p>
            </div>
            <button
              onClick={fetchForms}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-semibold rounded-md shadow-sm transition-all flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-5 border-t-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pending Verification
                </p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-5 border-t-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Approved & Enrolled
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.approved}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-5 border-t-4 border-rose-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rejected
                </p>
                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {stats.rejected}
                </p>
              </div>
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-5 border-t-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Forms
                </p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, registration or form number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="pending">⏳ Pending Verification</option>
                <option value="approved">✓ Approved & Enrolled</option>
                <option value="rejected">✗ Rejected</option>
                <option value="all">📋 All Forms</option>
              </select>
            </div>
          </div>
        </div>

        {/* Forms Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Form No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Registration</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Program</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Sem</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tutor</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent dark:border-indigo-400"></div>
                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading forms...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No forms found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredForms.map((form, index) => (
                    <tr 
                      key={form._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 dark:text-gray-300">{form.formNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{form.studentName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-400">{form.registeredNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-400">{form.degreeShortName || form.degreeName}</td>
                      <td className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">{form.semester}</td>
                      <td className="px-4 py-3 text-center font-semibold text-indigo-700 dark:text-indigo-400">{form.totalCreditHours}</td>
                      <td className="px-4 py-3 text-center">
                        {form.tutorSignature ? (
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            ✓ Signed
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(form.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewForm(form)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium rounded-md text-xs transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Review
                          </button>
                          
                          {form.status === "tutor_approved" && (
                            <>
                              <button
                                onClick={() => handleApproveForm(form)}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium rounded-md text-xs transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectForm(form)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-medium rounded-md text-xs transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </>
                          )}

                          {form.status === "manager_approved" && (
                            <button
                              onClick={() => generateCompletePDF(form._id)}
                              disabled={downloadingPdf}
                              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium rounded-md text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {downloadingPdf ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-purple-600 border-t-transparent"></div>
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  Download All 4 Copies
                                </>
                              )}
                            </button>
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

        {/* Form View Modal */}
        {selectedForm && !showApproveModal && !showRejectModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Review Form: {selectedForm.formNumber}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-medium"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Form Preview */}
                <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
                  {/* University Header */}
                  <div className="text-center mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                      UNIVERSITY OF AGRICULTURE, FAISALABAD, PAKISTAN
                    </h1>
                    <h2 className="text-base font-semibold mt-2 text-indigo-700 dark:text-indigo-400">
                      Form for listing courses to be taken in {selectedForm.semester}
                      {selectedForm.semester === 1 ? "st" : 
                       selectedForm.semester === 2 ? "nd" : 
                       selectedForm.semester === 3 ? "rd" : "th"} Semester
                    </h2>
                    <h3 className="text-sm font-medium mt-1 text-gray-700 dark:text-gray-400">
                      {selectedForm.departmentName}
                    </h3>
                  </div>

                  {/* Student Information Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-400">Degree:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedForm.degreeName}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-400">Admission To:</span>
                      <p className="text-gray-900 dark:text-white">{selectedForm.admissionTo}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-400">Registration No.:</span>
                      <p className="font-mono font-medium text-indigo-700 dark:text-indigo-400">{selectedForm.registeredNo}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-400">Section:</span>
                      <p className="font-medium text-rose-700 dark:text-rose-400">Section {selectedForm.section}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-400">Date of Commencement:</span>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedForm.dateOfCommencement)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-400">Date of First Enrolment:</span>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedForm.dateOfFirstEnrollment)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-400">Name of the Student:</span>
                    <p className="text-base font-medium text-gray-900 dark:text-white mt-1">{selectedForm.studentName}</p>
                  </div>

                  <div className="mt-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-400">Father's Name:</span>
                    <p className="text-base font-medium text-gray-900 dark:text-white mt-1">{selectedForm.fatherName}</p>
                  </div>

                  <div className="mt-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-400">Permanent Address:</span>
                    <p className="text-gray-900 dark:text-white mt-1">{selectedForm.permanentAddress || "—"}</p>
                  </div>

                  <div className="mt-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-400">Phone/Cell No.:</span>
                    <p className="text-gray-900 dark:text-white mt-1">{selectedForm.phoneCell || "—"}</p>
                  </div>

                  {/* Subjects Table */}
                  <div className="mt-6">
                    <p className="font-semibold text-gray-700 dark:text-gray-400 mb-2">Courses to be taken during the Semester:</p>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300 dark:border-gray-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-400">Course Number</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-400">Title of the Course</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-400">Credit Hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedForm.selectedSubjects?.map((subject, idx) => (
                            <tr key={idx}>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-mono text-indigo-700 dark:text-indigo-400">{subject.code}</td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white">{subject.name}</td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center font-mono text-emerald-700 dark:text-emerald-400">{subject.creditHours}</td>
                            </tr>
                          ))}
                          {selectedForm.extraSubjects?.map((subject, idx) => (
                            <tr key={idx} className="bg-amber-50 dark:bg-amber-900/10">
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 font-mono text-amber-700 dark:text-amber-400">{subject.code}</td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                                <span className="text-gray-900 dark:text-white">{subject.name}</span>
                                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 font-medium">(Extra)</span>
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center font-mono text-amber-700 dark:text-amber-400">{subject.creditHours}</td>
                            </tr>
                          ))}
                          <tr className="bg-gray-100 dark:bg-gray-800 font-medium">
                            <td colSpan="2" className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-right text-gray-700 dark:text-gray-400">Total Credit Hours:</td>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-indigo-700 dark:text-indigo-400">{selectedForm.totalCreditHours}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-6 mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">Tutor's Signature:</p>
                      {selectedForm.tutorSignature ? (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                          <p className="font-medium text-emerald-800 dark:text-emerald-300">{selectedForm.tutorSignature}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Signed: {formatDateTime(selectedForm.tutorSignedAt)}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">Not signed</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">Student's Signature:</p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="font-medium text-blue-800 dark:text-blue-300">{selectedForm.studentSignature || selectedForm.studentName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Manager Approval Section */}
                  {selectedForm.status === "manager_approved" && (
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">Manager Verification:</p>
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
                        <p className="font-medium text-indigo-800 dark:text-indigo-300">✓ Approved</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Verified: {formatDateTime(selectedForm.managerApprovedAt)}</p>
                        {selectedForm.verificationNotes && (
                          <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">Notes: {selectedForm.verificationNotes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejection Info */}
                  {selectedForm.status === "collector_rejected" && (
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">Rejection Reason:</p>
                      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
                        <p className="font-medium text-rose-800 dark:text-rose-300">{selectedForm.rejectionReason}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Rejected: {formatDateTime(selectedForm.collectorRejectedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApproveModal && selectedForm && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg max-w-lg w-full shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-gray-200 dark:border-gray-800 p-4">
                <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Approve Enrollment
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  You are approving form: <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">{selectedForm.formNumber}</span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Student: <span className="font-medium text-gray-900 dark:text-white">{selectedForm.studentName}</span>
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verification Summary:
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-400">
                    <p>✓ Program: {selectedForm.degreeName}</p>
                    <p>✓ Semester: {selectedForm.semester}</p>
                    <p>✓ Total Credits: {selectedForm.totalCreditHours}</p>
                    <p>✓ Subjects: {selectedForm.selectedSubjects?.length || 0} regular + {selectedForm.extraSubjects?.length || 0} extra</p>
                    <p>✓ Tutor: {selectedForm.tutorSignature ? 'Signed' : 'Pending'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Verification Notes (Optional)
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows="3"
                    placeholder="Add any verification notes..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processApproval}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white font-medium rounded-md text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Approve & Enroll
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && selectedForm && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg max-w-lg w-full shadow-xl border border-gray-200 dark:border-gray-800">
              <div className="bg-rose-50 dark:bg-rose-900/20 border-b border-gray-200 dark:border-gray-800 p-4">
                <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject Form
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  You are rejecting form: <span className="font-mono font-medium text-rose-700 dark:text-rose-400">{selectedForm.formNumber}</span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Student: <span className="font-medium text-gray-900 dark:text-white">{selectedForm.studentName}</span>
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="4"
                    placeholder="Specify what data is incorrect or missing..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processRejection}
                    disabled={actionLoading || !rejectionReason.trim()}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800 text-white font-medium rounded-md text-sm transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}