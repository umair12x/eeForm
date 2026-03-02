"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

function FeeVerificationSystem() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [requestStatus, setRequestStatus] = useState("new");
  const [requestId, setRequestId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [trackId, setTrackId] = useState("");
  const [feePicUrl, setFeePicUrl] = useState("");
  const [feePicFile, setFeePicFile] = useState(null);
  const [degrees, setDegrees] = useState([]);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [autoFillData, setAutoFillData] = useState(null);

  const [formData, setFormData] = useState({
    registrationNumber: "",
    studentType: "",
    studentName: "",
    fatherName: "",
    cnic: "",
    degreeProgram: "",
    degreeId: "",
    campus: "",
    degreeMode: "",
    semesterSeason: "",
    semesterYear: "",
    semesterPaid: "",
    feeAmount: "",
    feeType: "regular",
    boarderStatus: "non-boarder",
    isSelf: "no",
    bankName: "",
    bankBranch: "",
    voucherNumber: "",
    paymentDate: "",
    remarks: "",
    contactNumber: "",
  });

  useEffect(() => {
    setIsClient(true);
    generateRequestId();
    setCurrentYear();
    fetchDegrees();
    checkForAutoFill();
  }, []);

  const generateRequestId = () => {
    setRequestId(
      `UAF-FV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    );
  };

  const setCurrentYear = () => {
    const currentYear = new Date().getFullYear();
    setFormData((prev) => ({
      ...prev,
      semesterYear: `${currentYear}-${currentYear + 1}`,
      semesterSeason: currentYear % 2 === 0 ? "Spring" : "Winter",
    }));
  };

  const checkForAutoFill = async () => {
    try {
      const response = await fetch("/api/student/fee/approved-for-autofill");
      if (response.ok) {
        const data = await response.json();
        if (data.hasApprovedFee) {
          setAutoFillData(data.feeData);
          toast.success("Approved fee verification found! You can auto-fill the form.");
        }
      }
    } catch (error) {
      console.error("Error checking auto-fill:", error);
    }
  };

  const handleAutoFill = () => {
    if (autoFillData) {
      setFormData((prev) => ({
        ...prev,
        registrationNumber: autoFillData.registrationNumber || prev.registrationNumber,
        studentName: autoFillData.studentName || prev.studentName,
        fatherName: autoFillData.fatherName || prev.fatherName,
        cnic: autoFillData.cnic || prev.cnic,
        degreeProgram: autoFillData.degreeProgram || prev.degreeProgram,
        degreeId: autoFillData.degreeId || prev.degreeId,
        campus: autoFillData.campus || prev.campus,
        degreeMode: autoFillData.degreeMode || prev.degreeMode,
        contactNumber: autoFillData.contactNumber || prev.contactNumber,
      }));
      toast.success("Form auto-filled successfully!");
    }
  };

  // Prefill from login
  useEffect(() => {
    if (!isClient) return;

    (async () => {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          if (u) {
            setFormData((prev) => ({
              ...prev,
              registrationNumber: u.registrationNumber || prev.registrationNumber,
              studentName: u.name || prev.studentName,
            }));
          }
        }
      } catch (e) {}
    })();
  }, [isClient]);

  // Restore in-progress submission
  useEffect(() => {
    try {
      const raw = localStorage.getItem("feeRequest");
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.requestId) {
          setRequestId(obj.requestId);
          setRequestStatus("submitted");
          if (obj.studentType) {
            setFormData((prev) => ({ ...prev, studentType: obj.studentType }));
          }
        }
      }
    } catch (e) {}
  }, []);

  async function fetchDegrees() {
    try {
      const res = await fetch("/api/student/fee/degrees");
      const data = await res.json();
      setDegrees(data);
    } catch (err) {
      console.error("Error fetching degrees:", err);
      toast.error("Failed to load degree programs");
    }
  }

  const fetchVerificationStatus = async (rid) => {
    if (!rid) return;
    try {
      const res = await fetch(`/api/student/fee/status?requestId=${rid}`);
      const json = await res.json();
      
      if (res.ok && json.data) {
        const { status, statusMessage, studentType } = json.data;
        setVerificationStatus(status);
        setVerificationMessage(statusMessage || "");

        if (status === "approved") {
          toast.success("Your fee verification has been approved!");
          if (studentType === "undergraduate") {
            setTimeout(() => router.push("/student/form/ug1"), 2000);
          } else if (studentType === "postgraduate") {
            setTimeout(() => router.push("/student/form/gs10"), 2000);
          }
        } else if (status === "rejected") {
          toast.error(`Fee verification rejected: ${statusMessage || "Please contact support"}`);
        }
      } else {
        if (res.status === 404) {
          toast.error("Request ID not found");
          setRequestStatus("new");
          setRequestId("");
          setVerificationStatus("");
        }
      }
    } catch (err) {
      console.error("Error fetching verification status:", err);
      toast.error("Failed to fetch status");
    }
  };

  // Poll for status updates
  useEffect(() => {
    let interval;
    if (
      requestStatus === "submitted" &&
      requestId &&
      !["approved", "rejected"].includes(verificationStatus)
    ) {
      fetchVerificationStatus(requestId);
      interval = setInterval(() => {
        fetchVerificationStatus(requestId);
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [requestStatus, requestId, verificationStatus]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
          toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size must be less than 5MB");
          return;
        }
        setFeePicFile(file);
        setFeePicUrl(URL.createObjectURL(file));
      }
    } else if (name === "degreeId") {
      const selectedDegree = degrees.find((d) => d.id === value);
      setFormData((prev) => ({
        ...prev,
        degreeId: value,
        degreeProgram: selectedDegree ? selectedDegree.name : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleToggle = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.registrationNumber.trim()) {
        toast.error("Please enter your registration number");
        return false;
      }
      if (!formData.studentType) {
        toast.error("Please select student type");
        return false;
      }
      if (!formData.studentName.trim()) {
        toast.error("Please enter your name");
        return false;
      }
      if (!formData.cnic.trim()) {
        toast.error("Please enter your CNIC");
        return false;
      }
      if (!formData.degreeId) {
        toast.error("Please select degree program");
        return false;
      }
      if (!formData.campus) {
        toast.error("Please select campus");
        return false;
      }
      if (!formData.degreeMode) {
        toast.error("Please select degree mode");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.semesterSeason) {
        toast.error("Please select semester season");
        return false;
      }
      if (!formData.semesterYear.trim()) {
        toast.error("Please enter semester year");
        return false;
      }
      if (!formData.semesterPaid) {
        toast.error("Please select the semester for which fee is paid");
        return false;
      }
      if (!formData.feeAmount || parseFloat(formData.feeAmount) <= 0) {
        toast.error("Please enter a valid fee amount");
        return false;
      }
      if (!formData.isSelf) {
        toast.error("Please select if it's self");
        return false;
      }
      if (!formData.bankName) {
        toast.error("Please select bank");
        return false;
      }
      if (!formData.bankBranch.trim()) {
        toast.error("Please enter bank branch");
        return false;
      }
      if (!formData.voucherNumber.trim()) {
        toast.error("Please enter voucher number");
        return false;
      }
      if (!formData.paymentDate) {
        toast.error("Please enter the fee payment date");
        return false;
      }
      if (!feePicFile) {
        toast.error("Please upload a picture of the paid voucher/receipt");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);

    try {
      const submissionFormData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submissionFormData.append(key, formData[key].toString());
        }
      });

      if (feePicFile) {
        submissionFormData.append("voucherImage", feePicFile);
      }

      const response = await fetch("/api/student/fee/upload", {
        method: "POST",
        body: submissionFormData,
      });

      const result = await response.json();

      if (response.ok) {
        setRequestStatus("submitted");
        setRequestId(result.requestId);
        setVerificationStatus(result.status || "pending");
        
        localStorage.setItem(
          "feeRequest",
          JSON.stringify({ 
            requestId: result.requestId, 
            studentType: formData.studentType 
          })
        );

        toast.success(`Request submitted! ID: ${result.requestId}`);
        
        setTimeout(() => {
          router.push("/student");
        }, 2000);
      } else {
        toast.error(result.error || "Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRequest = () => {
    setStep(1);
    setRequestStatus("new");
    setTrackId("");
    setVerificationStatus("");
    setVerificationMessage("");
    setFeePicFile(null);
    setFeePicUrl("");
    localStorage.removeItem("feeRequest");
    generateRequestId();
    setCurrentYear();
    setFormData({
      registrationNumber: "",
      studentType: "",
      studentName: "",
      fatherName: "",
      cnic: "",
      degreeProgram: "",
      degreeId: "",
      campus: "",
      degreeMode: "",
      semesterSeason: "",
      semesterYear: "",
      semesterPaid: "",
      feeAmount: "",
      feeType: "regular",
      boarderStatus: "non-boarder",
      isSelf: "yes",
      bankName: "",
      bankBranch: "",
      voucherNumber: "",
      paymentDate: "",
      remarks: "",
      contactNumber: "",
    });
    window.scrollTo({ top: 0 });
  };

  const getMaxSemesters = () => {
    if (!formData.degreeId) return 8;
    const selectedDegree = degrees.find((d) => d.id === formData.degreeId);
    return selectedDegree ? selectedDegree.totalSemesters : 8;
  };

  // Status Timeline Component - Based on Fee Model Schema
  const StatusTimeline = () => {
    // Define all possible stages with their order
    const stages = [
      { 
        key: "pending", 
        label: "Submitted", 
        description: "Your request has been submitted",
        order: 1
      },
      { 
        key: "processing", 
        label: "Processing", 
        description: "Your request is being reviewed",
        order: 2
      },
      { 
        key: "approved", 
        label: "Approved", 
        description: "Fee verification approved",
        order: 3
      },
      { 
        key: "rejected", 
        label: "Rejected", 
        description: "Fee verification rejected",
        order: 3
      },
    ];

    // Get current status from props
    const currentStatus = verificationStatus || "pending";
    
    // Find the current stage object
    const currentStage = stages.find(s => s.key === currentStatus);
    
    // Calculate progress width based on status
    const getProgressWidth = () => {
      if (currentStatus === "rejected") return "100%";
      if (currentStatus === "approved") return "100%";
      if (currentStatus === "processing") return "66%";
      return "33%"; // pending
    };

    // Determine if a stage should be active
    const isStageActive = (stage) => {
      if (currentStatus === "rejected") {
        return stage.key === "rejected" || stage.order < 3;
      }
      if (currentStatus === "approved") {
        return stage.order <= 3;
      }
      return stage.order <= (currentStage?.order || 1);
    };

    // Get stage color
    const getStageColor = (stage) => {
      if (!isStageActive(stage)) return "bg-gray-300 dark:bg-gray-600";
      
      if (stage.key === "rejected" && currentStatus === "rejected") return "bg-red-600";
      if (stage.key === "approved" && currentStatus === "approved") return "bg-green-600";
      if (stage.key === "processing" && currentStatus === "processing") return "bg-blue-600";
      if (stage.key === "pending" && currentStatus === "pending") return "bg-yellow-600";
      
      // Completed stages
      if (stage.order < (currentStage?.order || 1)) {
        if (stage.key === "rejected") return "bg-red-400";
        if (stage.key === "approved") return "bg-green-400";
        if (stage.key === "processing") return "bg-blue-400";
        if (stage.key === "pending") return "bg-yellow-400";
      }
      
      return "bg-gray-300 dark:bg-gray-600";
    };

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {stages.map((stage) => (
            <div key={stage.key} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold
                ${getStageColor(stage)}`}>
                {stage.order}
              </div>
              <span className={`text-xs mt-2 font-medium ${
                stage.key === currentStatus 
                  ? 'text-gray-900 dark:text-white font-semibold' 
                  : isStageActive(stage) && stage.key !== currentStatus
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {stage.label}
              </span>
              {stage.key === currentStatus && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center max-w-[120px]">
                  {stage.description}
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="relative mt-4">
          <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
          <div 
            className={`absolute top-2 left-0 h-0.5 transition-all duration-300 ${
              currentStatus === "rejected" ? 'bg-red-600' :
              currentStatus === "approved" ? 'bg-green-600' :
              currentStatus === "processing" ? 'bg-blue-600' : 'bg-yellow-600'
            }`}
            style={{ width: getProgressWidth() }}
          ></div>
        </div>

        {/* Status Message */}
        {verificationMessage && currentStatus === "rejected" && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              <span className="font-semibold">Reason:</span> {verificationMessage}
            </p>
          </div>
        )}

        {verificationMessage && currentStatus === "approved" && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">
              <span className="font-semibold">Message:</span> {verificationMessage}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!isClient) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (requestStatus === "submitted") {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Toaster position="top-right" />
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="text-center py-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4
                ${verificationStatus === "approved" ? 'bg-green-100 dark:bg-green-900/30' :
                  verificationStatus === "rejected" ? 'bg-red-100 dark:bg-red-900/30' :
                  verificationStatus === "processing" ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                {verificationStatus === "approved" ? (
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : verificationStatus === "rejected" ? (
                  <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : verificationStatus === "processing" ? (
                  <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <StatusTimeline />

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {verificationStatus === "approved"
                  ? "Verification Approved!"
                  : verificationStatus === "rejected"
                  ? "Verification Rejected"
                  : verificationStatus === "processing"
                  ? "Request Being Processed"
                  : "Request Submitted!"}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {verificationStatus === "approved"
                  ? "Your fee has been verified successfully. You can now proceed with course registration."
                  : verificationStatus === "rejected"
                  ? verificationMessage || "Please contact the fee section for more information."
                  : verificationStatus === "processing"
                  ? "Your request is currently being reviewed by the fee section."
                  : "Your request has been submitted and is pending review."}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <p className="text-sm font-mono font-bold text-blue-700 dark:text-blue-300 mb-2">
                  Request ID: {requestId}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <p className="text-gray-600 dark:text-gray-400">Current Status</p>
                    <p className={`font-semibold capitalize ${
                      verificationStatus === "pending" ? "text-yellow-600 dark:text-yellow-400" :
                      verificationStatus === "processing" ? "text-blue-600 dark:text-blue-400" :
                      verificationStatus === "approved" ? "text-green-600 dark:text-green-400" :
                      verificationStatus === "rejected" ? "text-red-600 dark:text-red-400" : ""
                    }`}>
                      {verificationStatus === "pending" ? "Pending Review" :
                       verificationStatus === "processing" ? "Under Review" :
                       verificationStatus === "approved" ? "Approved ✓" :
                       verificationStatus === "rejected" ? "Rejected ✗" : 
                       verificationStatus || "Pending"}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-gray-600 dark:text-gray-400">Submitted</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleNewRequest}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  New Request
                </button>
                {verificationStatus === "approved" && (
                  <button
                    onClick={() => router.push("/student/form/ug1")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Register Courses
                  </button>
                )}
                {verificationStatus === "rejected" && (
                  <button
                    onClick={handleNewRequest}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    Submit Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Fee Verification System
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            University of Agriculture, Faisalabad
          </p>
        </div>

        {/* Auto-fill Banner */}
        {autoFillData && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm text-green-800 dark:text-green-300">
                Approved fee verification found
              </span>
              <button
                onClick={handleAutoFill}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                Auto-fill
              </button>
            </div>
          </div>
        )}

        {/* Track Existing Request */}
        {requestStatus === "new" && (
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Have an existing Request ID?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter Request ID"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
              />
              <button
                onClick={() => {
                  if (trackId.trim()) {
                    setShowTrackingModal(true);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Track
              </button>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          {requestStatus === "new" && step <= 3 && (
            <div className="mb-6">
              <div className="flex justify-between items-center">
                {["Student Info", "Fee Details", "Confirm"].map((label, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${step > idx + 1 ? 'bg-green-600 text-white' : 
                        step === idx + 1 ? 'bg-blue-600 text-white' : 
                        'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}`}>
                      {step > idx + 1 ? '✓' : idx + 1}
                    </div>
                    <span className="text-xs mt-1 text-center">{label}</span>
                  </div>
                ))}
              </div>
              <div className="relative mt-3">
                <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                <div 
                  className="absolute top-2 left-0 h-0.5 bg-blue-600 transition-all duration-300"
                  style={{ width: step === 2 ? '50%' : step === 3 ? '100%' : '0%' }}
                ></div>
              </div>
            </div>
          )}

          {/* Step 1: Student Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Student Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 2022-ag-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {["undergraduate", "postgraduate"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleToggle("studentType", type)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                          formData.studentType === type
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Father's Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CNIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="XXXXX-XXXXXXX-X"
                    maxLength="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Campus <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="campus"
                    value={formData.campus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="">Select Campus</option>
                    <option value="main">Main Campus</option>
                    <option value="paras">Paras Campus</option>
                    <option value="toba">Toba Tek Singh</option>
                    <option value="burewala">Burewala (Vehari)</option>
                    <option value="depalpur">Depalpur (Okara)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Degree Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="degreeId"
                    value={formData.degreeId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="">Select Degree Program</option>
                    {degrees.map((degree) => (
                      <option key={degree.id} value={degree.id}>
                        {degree.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Degree Mode <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {["morning", "evening"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleToggle("degreeMode", mode)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                          formData.degreeMode === mode
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Fee Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Fee Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Semester Season <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semesterSeason"
                    value={formData.semesterSeason}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="">Select Season</option>
                    <option value="Spring">Spring</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Semester Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="semesterYear"
                    value={formData.semesterYear}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="e.g., 2025-2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Semester Paid For <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semesterPaid"
                    value={formData.semesterPaid}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="">Select Semester</option>
                    {Array.from({ length: getMaxSemesters() }, (_, i) => i + 1).map(
                      (num) => (
                        <option key={num} value={String(num)}>
                          Semester {num}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fee Amount (PKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="feeAmount"
                    value={formData.feeAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fee Type
                  </label>
                  <select
                    name="feeType"
                    value={formData.feeType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="regular">Regular Fee</option>
                    <option value="late">Late Fee</option>
                    <option value="recheck">Re-checking Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Boarder Status
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle("boarderStatus", "boarder")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                        formData.boarderStatus === "boarder"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      Boarder
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle("boarderStatus", "non-boarder")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                        formData.boarderStatus === "non-boarder"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      Non-Boarder
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Is it Self? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {["yes", "no"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleToggle("isSelf", option)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                          formData.isSelf === option
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {option === "yes" ? "Yes (Self)" : "No (Other)"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="">Select Bank</option>
                    <option value="ABL">ABL</option>
                    <option value="HBL">HBL</option>
                    <option value="MCB">MCB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank Branch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankBranch"
                    value={formData.bankBranch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Branch Name & City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Voucher Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="voucherNumber"
                    value={formData.voucherNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Voucher/Receipt Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload Voucher/Receipt <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                    <span className="text-sm">{feePicFile ? feePicFile.name : "Choose File"}</span>
                    <input
                      type="file"
                      name="feePic"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-gray-500">Max 5MB</span>
                </div>
                {feePicUrl && (
                  <div className="mt-2">
                    <img src={feePicUrl} alt="Preview" className="h-20 rounded border" />
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="Any additional information..."
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Confirm Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                  <h3 className="font-medium mb-2">Student Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600 dark:text-gray-400">Reg No:</span> {formData.registrationNumber}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">Name:</span> {formData.studentName}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">CNIC:</span> {formData.cnic}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">Degree:</span> {formData.degreeProgram}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                  <h3 className="font-medium mb-2">Fee Details</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600 dark:text-gray-400">Semester:</span> {formData.semesterSeason} {formData.semesterYear}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">Paid For:</span> Semester {formData.semesterPaid}</p>
                    <p><span className="text-gray-600 dark:text-gray-400">Amount:</span> Rs. {formData.feeAmount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm">
                <p className="text-yellow-800 dark:text-yellow-300">
                  Verification takes 3-5 working days. For queries: feesection@uaf.edu.pk
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>Contact: feesection@uaf.edu.pk | +92-41-9200161 Ext: 3303</p>
        </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Track Request
            </h3>
            <input
              type="text"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="Enter Request ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTrackingModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (trackId.trim()) {
                    fetchVerificationStatus(trackId.trim());
                    setRequestStatus("submitted");
                    setRequestId(trackId.trim());
                    setShowTrackingModal(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Track
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default FeeVerificationSystem;