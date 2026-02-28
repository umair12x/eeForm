"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import { FaCheckCircle, FaClock, FaFileAlt, FaShieldAlt, FaArrowRight, FaCalendar, FaMoneyBillWave, FaBank } from 'react-icons/fa';

export default function StudentDashboard() {
  const router = useRouter();
  const [feeRequest, setFeeRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserAndRequest();
  }, []);

  // Auto-redirect when approved
  useEffect(() => {
    if (feeRequest?.status === "approved") {
      const redirectTimeout = setTimeout(() => {
        const formPath = feeRequest.studentType === "undergraduate" 
          ? "/student/form/ug1"
          : "/student/form/gs10";
        router.push(formPath);
      }, 2000);
      return () => clearTimeout(redirectTimeout);
    }
  }, [feeRequest?.status, feeRequest?.studentType, router]);

  async function fetchUserAndRequest() {
    try {
      setLoading(true);
      
      // Fetch user info
      const userRes = await fetch("/api/auth/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      // Fetch fee request
      const feeRes = await fetch("/api/student/fee");
      if (feeRes.ok) {
        const feeData = await feeRes.json();
        if (feeData.data) {
          setFeeRequest(feeData.data);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "pending":
        return "Awaiting processing...";
      case "processing":
        return "Under review by fee section";
      case "approved":
        return "Approved! Redirecting to form...";
      case "rejected":
        return "Request rejected. Please contact fee section.";
      default:
        return "Status unknown";
    }
  };

  const StatusTimeline = () => {
    const stages = [
      { key: "pending", label: "Fee Submitted", icon: FaCheckCircle },
      { key: "processing", label: "Processing", icon: FaClock },
      { key: "tutor", label: "Tutor Review", icon: FaFileAlt },
      { key: "manager", label: "Manager Approval", icon: FaShieldAlt },
      { key: "approved", label: "Approved", icon: FaCheckCircle },
    ];

    const statusOrder = ["pending", "processing", "tutor", "manager", "approved"];
    const currentIndex = statusOrder.indexOf(feeRequest?.status);

    return (
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Workflow Progress
        </h3>
        <div className="space-y-4">
          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const IconComponent = stage.icon;

            return (
              <div key={stage.key} className="flex items-start">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                  isCompleted
                    ? isCurrent
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${
                    isCurrent
                      ? "text-blue-600 dark:text-blue-400"
                      : isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}>
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {getStatusMessage(feeRequest?.status)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Loader fullScreen={false} size="lg" />
        </div>
      </main>
    );
  }

  if (feeRequest) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name || "Student"}
            </p>
          </div>

          {/* Approval Alert */}
          {feeRequest.status === "approved" && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-green-800 dark:text-green-300 text-sm">
                ✓ Your fee verification has been approved! Redirecting to your form...
              </p>
            </div>
          )}

          {/* Main Status Card */}
          <Card className="mb-6 border-l-4 border-l-blue-600 dark:border-l-blue-400">
            <CardHeader className="border-0 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Current Application Status</CardTitle>
                <Badge variant={getStatusBadgeVariant(feeRequest.status)}>
                  {feeRequest.status.charAt(0).toUpperCase() + feeRequest.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Request ID */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Request ID
                  </p>
                  <p className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {feeRequest.requestId}
                  </p>
                </div>

                {/* Submission Date */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Submitted On
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(feeRequest.submittedAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <StatusTimeline />
            </CardContent>
          </Card>

          {/* Application Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Student Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Name</p>
                  <p className="text-sm font-medium">{feeRequest.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Registration #</p>
                  <p className="text-sm font-medium">{feeRequest.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Student Type</p>
                  <p className="text-sm font-medium capitalize">
                    {feeRequest.studentType === 'undergraduate' ? 'Undergraduate' : 'Postgraduate'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Degree Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Degree Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Program</p>
                  <p className="text-sm font-medium">{feeRequest.degreeProgram}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Semester</p>
                  <p className="text-sm font-medium">
                    {feeRequest.semesterSeason} - Sem {feeRequest.semesterPaid}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Academic Year</p>
                  <p className="text-sm font-medium">{feeRequest.semesterYear}</p>
                </div>
              </CardContent>
            </Card>

            {/* Fee Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Fee Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Amount Paid</p>
                  <p className="text-sm font-medium">Rs. {feeRequest.feeAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Bank</p>
                  <p className="text-sm font-medium">{feeRequest.bankName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Voucher #</p>
                  <p className="text-sm font-medium">{feeRequest.voucherNumber}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => router.push('/student/fee')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              Submit Another Request
              <FaArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Estimated Processing Time:</strong> 3-5 working days
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              For assistance: feesection@uaf.edu.pk | +92-41-9200161 Ext: 3303
            </p>
          </div>
        </div>
      </main>
    );
  }

  // No request exists - show welcome screen
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your fee verification and enrollment applications
          </p>
        </div>

        {/* Empty State Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 - Fee Verification */}
          <Card className="hover:shadow-lg dark:hover:shadow-2xl transition-shadow">
            <CardHeader className="border-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <FaMoneyBillWave className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Fee Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Submit your bank voucher for fee verification. Track your application status in real-time.
              </p>
            </CardContent>
          </Card>

          {/* Card 2 - Track Status */}
          <Card className="hover:shadow-lg dark:hover:shadow-2xl transition-shadow">
            <CardHeader className="border-0">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <FaClock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Track Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Easily monitor your application through each approval stage.
              </p>
            </CardContent>
          </Card>

          {/* Card 3 - Fast Processing */}
          <Card className="hover:shadow-lg dark:hover:shadow-2xl transition-shadow">
            <CardHeader className="border-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <FaCheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Quick Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get your application processed within 3-5 working days.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg p-8 md:p-12 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Submit your fee verification documents to proceed with your enrollment
          </p>
          <button
            onClick={() => router.push('/student/fee')}
            className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 mx-auto"
          >
            <FaArrowRight className="w-5 h-5" />
            Start Fee Verification
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaFileAlt className="text-blue-600 dark:text-blue-400" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Bank fee voucher (JPEG/PNG)</li>
                <li>✓ Original CNIC</li>
                <li>✓ Registration number</li>
                <li>✓ Valid contact number</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaShieldAlt className="text-green-600 dark:text-green-400" />
                Process Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>1. Submit fee verification form</li>
                <li>2. Fee section reviews documents</li>
                <li>3. Tutor approves submission</li>
                <li>4. Manager final approval</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Contact Footer */}
        <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Contact Fee Section: <strong>feesection@uaf.edu.pk</strong> | <strong>+92-41-9200161 Ext: 3303</strong>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Hours: 9:00 AM - 4:00 PM (Monday to Friday)
          </p>
        </div>
      </div>
    </main>
  );
}
