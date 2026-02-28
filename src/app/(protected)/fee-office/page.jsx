"use client";
import React, { useState, useEffect } from "react";

export default function FeeSectionDashboard() {
  const [search, setSearch] = useState("");
  const [verifications, setVerifications] = useState([]);
  const [filteredVerifications, setFilteredVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch verifications from backend
  useEffect(() => {
    fetchVerifications();
  }, []);

  useEffect(() => {
    const filtered = verifications.filter(verification =>
      verification.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      verification.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      verification.voucherNumber?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredVerifications(filtered);
  }, [search, verifications]);

  const fetchVerifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/fee/fee-section");
      const data = await response.json();
      if (response.ok) {
        setVerifications(data);
      }
    } catch (error) {
      console.error("Error fetching verifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewVoucher = (verification) => {
    setSelectedVerification(verification);
    setIsModalOpen(true);
  };

  const handleVerify = async (id) => {
    if (!confirm("Are you sure you want to verify this payment?")) return;
    
    try {
      const response = await fetch(`/api/fee/fee-section`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: "approved",
          statusMessage: "Payment verified successfully"
        }),
      });

      if (response.ok) {
        alert("Payment verified successfully!");
        fetchVerifications();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to verify payment");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Please enter reason for rejection:");
    if (!reason) return;
    
    try {
      const response = await fetch(`/api/fee/fee-section`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: "rejected",
          statusMessage: reason
        }),
      });

      if (response.ok) {
        alert("Payment rejected successfully!");
        fetchVerifications();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to reject payment");
      }
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert("Network error. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        bg: "bg-yellow-50", 
        text: "text-yellow-800", 
        border: "border-yellow-200",
        darkBg: "dark:bg-yellow-900", 
        darkText: "dark:text-yellow-300",
        darkBorder: "dark:border-yellow-800",
        label: "Pending" 
      },
      processing: { 
        bg: "bg-blue-50", 
        text: "text-blue-800", 
        border: "border-blue-200",
        darkBg: "dark:bg-blue-900", 
        darkText: "dark:text-blue-300",
        darkBorder: "dark:border-blue-800",
        label: "Processing" 
      },
      approved: { 
        bg: "bg-green-50", 
        text: "text-green-800", 
        border: "border-green-200",
        darkBg: "dark:bg-green-900", 
        darkText: "dark:text-green-300",
        darkBorder: "dark:border-green-800",
        label: "Verified" 
      },
      rejected: { 
        bg: "bg-red-50", 
        text: "text-red-800", 
        border: "border-red-200",
        darkBg: "dark:bg-red-900", 
        darkText: "dark:text-red-300",
        darkBorder: "dark:border-red-800",
        label: "Rejected" 
      },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${config.darkBg} ${config.darkText} ${config.darkBorder}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Create a separate component for each row to fix the event handler issue
  const VerificationRow = ({ verification }) => {
    return (
      <tr key={verification._id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {verification.studentName}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
              {verification.registrationNumber}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {verification.degreeProgram}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span className="font-medium">CNIC:</span> {verification.cnic}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Semester:</span> {verification.semesterPaid}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Season:</span> {verification.semesterSeason} {verification.semesterYear}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Type:</span> {verification.feeType}
            </div>
            <div className="text-lg font-bold text-green-700 dark:text-green-400 mt-1">
              Rs. {verification.feeAmount?.toLocaleString()}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Bank:</span> {verification.bankName}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Branch:</span> {verification.bankBranch}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Voucher:</span> {verification.voucherNumber}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Date:</span> {formatDate(verification.paymentDate)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Submitted: {formatDate(verification.submittedAt)}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="space-y-2">
            {getStatusBadge(verification.status)}
            {verification.statusMessage && (
              <div className="text-xs text-gray-600 dark:text-gray-400 max-w-xs mt-1 bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                {verification.statusMessage}
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col space-y-2 min-w-[180px]">
            <button
              onClick={() => handleViewVoucher(verification)}
              className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
            
            {verification.status === 'pending' && (
              <>
                <button
                  onClick={() => handleVerify(verification._id)}
                  className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Verify Payment
                </button>
                <button
                  onClick={() => handleReject(verification._id)}
                  className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </>
            )}
            
            {(verification.status === 'approved' || verification.status === 'rejected') && (
              <button
                onClick={() => fetchVerifications()}
                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Section Dashboard</h1>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                University of Agriculture, Faisalabad
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, registration, or voucher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm">
                Total: {verifications.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-100 dark:border-yellow-800">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {verifications.filter(v => v.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg border border-green-100 dark:border-green-800">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {verifications.filter(v => v.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-red-50 dark:bg-red-900 rounded-lg border border-red-100 dark:border-red-800">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {verifications.filter(v => v.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-100 dark:border-blue-800">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {verifications.filter(v => v.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verifications Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Verification Requests</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              Review and verify student fee payments
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Loading verifications...</p>
            </div>
          ) : filteredVerifications.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-gray-700 dark:text-gray-300">No fee verification requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      Student Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      Fee Information
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      Payment Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredVerifications.map((verification) => (
                    <VerificationRow key={verification._id} verification={verification} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal for viewing voucher details */}
      {isModalOpen && selectedVerification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Voucher Details - {selectedVerification.studentName}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">Student Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">Name:</span> <span className="text-gray-900 dark:text-white">{selectedVerification.studentName}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">Registration:</span> <span className="text-gray-900 dark:text-white">{selectedVerification.registrationNumber}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">CNIC:</span> <span className="text-gray-900 dark:text-white">{selectedVerification.cnic}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">Degree:</span> <span className="text-gray-900 dark:text-white">{selectedVerification.degreeProgram}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">Campus:</span> <span className="text-gray-900 dark:text-white">{selectedVerification.campus}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">Mode:</span> <span className="text-gray-900 dark:text-white">{selectedVerification.degreeMode}</span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">Bank:</span> <span className="text-gray-900 dark:text-white">{selectedVerification.bankName}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">Branch:</span> <span className="text-gray-900 dark:text-white">{selectedVerification.bankBranch}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">Voucher No:</span> <span className="text-gray-900 dark:text-white">{selectedVerification.voucherNumber}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">Amount:</span> <span className="text-green-700 dark:text-green-400 font-semibold">Rs. {selectedVerification.feeAmount?.toLocaleString()}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-400">Payment Date:</span> <span className="text-gray-900 dark:text-white">{formatDate(selectedVerification.paymentDate)}</span></p>
                </div>
              </div>
            </div>
            
            {selectedVerification.voucherImageUrl && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">Voucher Image</h4>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                  <img
                    src={selectedVerification.voucherImageUrl}
                    alt="Voucher"
                    className="max-w-full h-auto rounded shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/400/300";
                    }}
                  />
                </div>
              </div>
            )}
            
            {selectedVerification.remarks && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">Remarks</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
                  {selectedVerification.remarks}
                </p>
              </div>
            )}
            
            <div className="mt-8 flex justify-end border-t pt-4 border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}