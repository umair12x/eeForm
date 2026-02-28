"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    setRequestId(
      `UAF-FV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    );
    const currentYear = new Date().getFullYear();
    setFormData((prev) => ({
      ...prev,
      semesterYear: `${currentYear}-${currentYear + 1}`,
      semesterSeason: currentYear % 2 === 0 ? "Spring" : "Winter",
    }));

    fetchDegrees();
  }, []);

  // Try to prefill student name & registration number from cached login info
  useEffect(() => {
    // only run on client
    if (!isClient) return;

    (async () => {
      try {
        // 1) try localStorage cache (if login stored a `user` object)
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
              return;
            }
          }
        } catch (e) {
          // ignore localStorage parse errors
        }

        // 2) fallback: call server endpoint which returns user based on auth cookie
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const json = await res.json();
            if (json.user) {
              const u = json.user;
              setFormData((prev) => ({
                ...prev,
                registrationNumber: u.registrationNumber || prev.registrationNumber,
                studentName: u.name || prev.studentName,
              }));
            }
          }
        } catch (err) {
          console.error("Error fetching /api/auth/me:", err);
        }
      } catch (err) {
        console.error("Prefill user info error:", err);
      }
    })();
  }, [isClient]);

  // restore any in-progress submission from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("feeRequest");
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.requestId) {
          setRequestId(obj.requestId);
          setRequestStatus("submitted");
          if (obj.studentType) {
            // prefill studentType so redirect target is known
            setFormData((prev) => ({ ...prev, studentType: obj.studentType }));
          }
        }
      }
    } catch (e) {
      // ignore JSON errors
    }
  }, []);

  async function fetchDegrees() {
    try {
      const res = await fetch("/api/student/fee/degrees");

      const data = await res.json();
      setDegrees(data);
    } catch (err) {
      console.error("Error fetching degrees:", err);
    }
  }

  // fetch the verification status from backend using request id
  const fetchVerificationStatus = async (rid) => {
    if (!rid) return;
    try {
      const res = await fetch(`/api/fee/status?requestId=${rid}`);
      const json = await res.json();
      if (res.ok && json.data) {
        const { status, statusMessage, studentType } = json.data;
        setVerificationStatus(status);
        setVerificationMessage(statusMessage || "");

        // redirect to appropriate form when approved
        if (status === "approved") {
          if (studentType === "undergraduate") {
            router.push("/student/form/ug1");
          } else if (studentType === "postgraduate") {
            router.push("/student/form/gs10");
          }
        }
      } else {
        if (res.status === 404) {
          alert("Request ID not found. Please check and try again.");
          setRequestStatus("new");
          setRequestId("");
          setVerificationStatus("");
        }
      }
    } catch (err) {
      console.error("Error fetching verification status:", err);
    }
  };

  // poll for status updates while a submission exists
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

  const handleNext = () => {
    if (step === 1) {
      if (!formData.registrationNumber.trim())
        return alert("Please enter your registration number");
      if (!formData.studentType) return alert("Please select student type");
      if (!formData.studentName.trim()) return alert("Please enter your name");
      if (!formData.cnic.trim()) return alert("Please enter your CNIC");
      if (!formData.degreeId) return alert("Please select degree program");
      if (!formData.campus) return alert("Please select campus");
      if (!formData.degreeMode) return alert("Please select degree mode");
    }
    if (step === 2) {
      if (!formData.semesterSeason)
        return alert("Please select semester season");
      if (!formData.semesterYear.trim())
        return alert("Please enter semester year");
      if (!formData.semesterPaid)
        return alert("Please select the semester for which fee is paid");
      if (!formData.feeAmount || parseFloat(formData.feeAmount) <= 0)
        return alert("Please enter a valid fee amount");
      if (!formData.isSelf) return alert("Please select if it's self");
      if (!formData.bankName) return alert("Please select bank");
      if (!formData.bankBranch.trim()) return alert("Please enter bank branch");
      if (!formData.voucherNumber.trim())
        return alert("Please enter voucher number");
      if (!formData.paymentDate)
        return alert("Please enter the fee payment date");
      if (!feePicFile)
        return alert("Please upload a picture of the paid voucher/receipt");
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      console.log("Submitting form...");

      const response = await fetch("/api/student/fee/upload", {
        method: "POST",
        body: submissionFormData,
      });

      const result = await response.json();

      if (response.ok) {
        setRequestStatus("submitted");
        setRequestId(result.requestId);
        setVerificationStatus(result.status || "pending");
        // persist pending request so page reloads still track it
        try {
          localStorage.setItem(
            "feeRequest",
            JSON.stringify({ requestId: result.requestId, studentType: formData.studentType })
          );
        } catch (e) {}
        try {
          sessionStorage.setItem(
            "feeRequest",
            JSON.stringify({ requestId: result.requestId, studentType: formData.studentType })
          );
        } catch (e) {}
        alert("✓ " + result.message);
        // return to dashboard after successful submit
        router.push("/student");
      } else {
        alert("✗ " + (result.error || "Submission failed"));
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("✗ Network error. Please try again.");
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
    try { localStorage.removeItem("feeRequest"); } catch (e) {}
    setRequestId(
      `UAF-FV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    );
    const currentYear = new Date().getFullYear();
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
      semesterYear: `${currentYear}-${currentYear + 1}`,
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
  };

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {["Student Info", "Fee Details", "Confirmation"].map((label, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {idx + 1}
            </div>
            <span className="text-xs mt-2">{label}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-4">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200"></div>
        <div
          className={`absolute top-3 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
            step === 2 ? "w-1/2" : step === 3 ? "w-full" : "w-0"
          }`}
        ></div>
      </div>
    </div>
  );

  if (!isClient) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 shadow">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const getMaxSemesters = () => {
    if (!formData.degreeId) return 8;
    const selectedDegree = degrees.find((d) => d.id === formData.degreeId);
    return selectedDegree ? selectedDegree.totalSemesters : 8;
  };

  const renderStepForm = () => {
    if (requestStatus === "submitted") {
      // helper component for timeline
      const StatusTimeline = () => {
        // three stages: submitted, under review, completed
        const stages = [
          { key: "pending", label: "Submitted" },
          { key: "processing", label: "Under Review" },
          {
            key: "final",
            label:
              verificationStatus === "rejected"
                ? "Rejected"
                : "Completed",
          },
        ];
        let activeIndex = 0;
        if (verificationStatus === "processing") activeIndex = 1;
        else if (verificationStatus === "approved" || verificationStatus === "rejected") activeIndex = 2;

        return (
          <div className="flex items-center justify-center mb-4">
            {stages.map((stage, i) => {
              const active = i <= activeIndex;
              return (
                <div key={stage.key} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      active
                        ? stage.key === "final" && verificationStatus === "rejected"
                          ? "bg-red-600 text-white"
                          : "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="ml-2 mr-4 text-sm">{stage.label}</span>
                  {i < stages.length - 1 && (
                    <div
                      className={`w-8 h-0.5 ${
                        active ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      };

      return (
        <div className="text-center py-8">
          {verificationStatus && <StatusTimeline />}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Verification Submitted!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your fee verification request has been submitted successfully.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <p className="text-sm font-mono font-bold text-blue-700 dark:text-blue-300">
              Request ID: {requestId}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Save this ID for future reference
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <p className="text-gray-600 dark:text-gray-400">Current Status</p>
                <p className={`font-semibold capitalize ${
                  verificationStatus === "pending"
                    ? "text-yellow-600"
                    : verificationStatus === "processing"
                    ? "text-blue-600"
                    : verificationStatus === "approved"
                    ? "text-green-600"
                    : verificationStatus === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}>
                  {verificationStatus || "Pending"}
                </p>
                {verificationMessage && (
                  <p className="text-xs text-gray-500 mt-1">
                    {verificationMessage}
                  </p>
                )}
              </div>
              <div className="text-left">
                <p className="text-gray-600 dark:text-gray-400">
                  Processing Time
                </p>
                <p className="font-semibold">3-5 working days</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleNewRequest}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-6">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Student Information
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enter your registration details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration Number */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Registration Number *
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2022-ag-1234"
                autoComplete="off"
              />
            </div>

            {/* Student Type */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Student Type *
              </label>
              <div className="flex gap-2">
                {["undergraduate", "postgraduate"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleToggle("studentType", type)}
                    className={`px-4 py-2 rounded text-sm w-full transition-colors ${
                      formData.studentType === type
                        ? "bg-blue-600 text-white ring-2 ring-blue-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Student Name *
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full Name"
                autoComplete="off"
              />
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Father's Name
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Father's Name"
                autoComplete="off"
              />
            </div>

            {/* CNIC */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                CNIC *
              </label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="XXXXX-XXXXXXX-X"
                autoComplete="off"
                maxLength="15"
              />
            </div>

            {/* Campus */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Campus *
              </label>
              <select
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Campus</option>
                <option value="main">Main Campus</option>
                <option value="paras">Paras Campus</option>
                <option value="toba">Toba Tek Singh</option>
                <option value="burewala">Burewala (Vehari)</option>
                <option value="depalpur">Depalpur (Okara)</option>
              </select>
            </div>

            {/* Degree Program */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Degree Program *
              </label>
              <select
                name="degreeId"
                value={formData.degreeId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Degree Program</option>
                {degrees.map((degree) => (
                  <option key={degree.id} value={degree.id}>
                    {degree.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Degree Mode */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Degree Mode *
              </label>
              <div className="flex gap-2">
                {["morning", "evening"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleToggle("degreeMode", mode)}
                    className={`px-4 py-2 rounded text-sm w-full transition-colors ${
                      formData.degreeMode === mode
                        ? "bg-blue-600 text-white ring-2 ring-blue-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="03XX-XXXXXXX"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              * Required fields must be filled
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Next: Fee Details
            </button>
          </div>
        </div>
      );
    }

    if (step === 2) {
      const maxSemesters = getMaxSemesters();

      return (
        <div className="space-y-6">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Fee Details
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Fill in the details for the paid semester fee
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Semester Season */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Semester Season *
              </label>
              <select
                name="semesterSeason"
                value={formData.semesterSeason}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Season</option>
                <option value="Spring">Spring</option>
                <option value="Winter">Winter</option>
              </select>
            </div>

            {/* Semester Year */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Semester Year *
              </label>
              <input
                type="text"
                name="semesterYear"
                value={formData.semesterYear}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2025-2026"
                autoComplete="off"
              />
            </div>

            {/* Semester Paid For */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Semester Paid For *
              </label>
              <select
                name="semesterPaid"
                value={formData.semesterPaid}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Semester</option>
                {Array.from({ length: maxSemesters }, (_, i) => i + 1).map(
                  (num) => (
                    <option key={num} value={String(num)}>
                      Semester {num}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Fee Amount */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Fee Amount (PKR) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                name="feeAmount"
                value={formData.feeAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                autoComplete="off"
              />
            </div>

            {/* Fee Type */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Fee Type
              </label>
              <select
                name="feeType"
                value={formData.feeType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="regular">Regular Fee</option>
                <option value="late">Late Fee</option>
                <option value="recheck">Re-checking Fee</option>
              </select>
            </div>

            {/* Boarder Status */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Boarder Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle("boarderStatus", "boarder")}
                  className={`px-4 py-2 rounded text-sm w-full transition-colors ${
                    formData.boarderStatus === "boarder"
                      ? "bg-green-600 text-white ring-2 ring-green-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Boarder
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle("boarderStatus", "non-boarder")}
                  className={`px-4 py-2 rounded text-sm w-full transition-colors ${
                    formData.boarderStatus === "non-boarder"
                      ? "bg-green-600 text-white ring-2 ring-green-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Non-Boarder
                </button>
              </div>
            </div>

            {/* Is Self */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Is it Self? *
              </label>
              <div className="flex gap-2">
                {["yes", "no"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleToggle("isSelf", option)}
                    className={`px-4 py-2 rounded text-sm w-full transition-colors ${
                      formData.isSelf === option
                        ? "bg-purple-600 text-white ring-2 ring-purple-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {option === "yes" ? "Yes (Self)" : "No (Other)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Bank Name *
              </label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Bank</option>
                <option value="ABL">ABL</option>
                <option value="HBL">HBL</option>
                <option value="MCB">MCB</option>
              </select>
            </div>

            {/* Bank Branch */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Bank Branch *
              </label>
              <input
                type="text"
                name="bankBranch"
                value={formData.bankBranch}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Branch Name & City"
                autoComplete="off"
              />
            </div>

            {/* Voucher Number */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Voucher Number *
              </label>
              <input
                type="text"
                name="voucherNumber"
                value={formData.voucherNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Voucher/Receipt Number"
                autoComplete="off"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Fee Payment Date *
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Fee Picture Upload */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Upload Picture of Paid Voucher/Receipt *
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
                <span>Select File</span>
                <input
                  type="file"
                  name="feePic"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-500">
                JPG, PNG allowed (Max 5MB)
              </span>
              {feePicUrl && (
                <div className="relative">
                  <img
                    src={feePicUrl}
                    alt="Fee Voucher Preview"
                    className="h-16 w-auto rounded border border-gray-300"
                  />
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    ✓
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Remarks (Optional)
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional info..."
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Next: Confirm
            </button>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Confirmation
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Please confirm your details before submission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Section */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border">
              <h3 className="text-sm font-bold mb-3 text-gray-900 dark:text-white">
                Student Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Registration No:
                  </span>
                  <span className="font-medium">
                    {formData.registrationNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Student Type:
                  </span>
                  <span className="font-medium capitalize">
                    {formData.studentType || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Name:
                  </span>
                  <span className="font-medium">
                    {formData.studentName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    CNIC:
                  </span>
                  <span className="font-medium">{formData.cnic || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Degree:
                  </span>
                  <span className="font-medium">
                    {formData.degreeProgram || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Campus:
                  </span>
                  <span className="font-medium capitalize">
                    {formData.campus === "main"
                      ? "Main Campus"
                      : formData.campus === "paras"
                        ? "Paras Campus"
                        : formData.campus === "toba"
                          ? "Toba Tek Singh"
                          : formData.campus === "burewala"
                            ? "Burewala (Vehari)"
                            : formData.campus === "depalpur"
                              ? "Depalpur (Okara)"
                              : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Degree Mode:
                  </span>
                  <span className="font-medium capitalize">
                    {formData.degreeMode || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Fee Info */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border">
              <h3 className="text-sm font-bold mb-3 text-gray-900 dark:text-white">
                Fee Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Semester Season:
                  </span>
                  <span className="font-medium">
                    {formData.semesterSeason || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Semester Year:
                  </span>
                  <span className="font-medium">
                    {formData.semesterYear || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Semester Paid:
                  </span>
                  <span className="font-medium">
                    {formData.semesterPaid
                      ? `Semester ${formData.semesterPaid}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Amount:
                  </span>
                  <span className="font-medium text-green-600">
                    Rs.{" "}
                    {formData.feeAmount
                      ? parseFloat(formData.feeAmount).toLocaleString()
                      : "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Boarder Status:
                  </span>
                  <span className="font-medium capitalize">
                    {formData.boarderStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Is Self:
                  </span>
                  <span className="font-medium capitalize">
                    {formData.isSelf === "yes" ? "Yes (Self)" : "No (Other)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border">
            <h3 className="text-sm font-bold mb-3 text-gray-900 dark:text-white">
              Bank & Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Bank:
                  </span>
                  <span className="font-medium">
                    {formData.bankName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Branch:
                  </span>
                  <span className="font-medium">
                    {formData.bankBranch || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Contact:
                  </span>
                  <span className="font-medium">
                    {formData.contactNumber || "--"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Voucher No:
                  </span>
                  <span className="font-medium">
                    {formData.voucherNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Payment Date:
                  </span>
                  <span className="font-medium">
                    {formData.paymentDate || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Fee Type:
                  </span>
                  <span className="font-medium capitalize">
                    {formData.feeType}
                  </span>
                </div>
              </div>
            </div>
            {feePicUrl && (
              <div className="mx-auto mt-5 flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">
                  Voucher/Receipt Image
                </span>
                <img
                  src={feePicUrl}
                  alt="Voucher preview"
                  className="max-h-36 rounded border"
                />
              </div>
            )}
          </div>

          {formData.remarks && (
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border text-sm">
              <b>Remarks:</b> <span>{formData.remarks}</span>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Note:</strong> Upon submission, verification takes 3-5
              working days. For queries, contact{" "}
              <a
                href="mailto:feesection@uaf.edu.pk"
                className="underline font-mono"
              >
                feesection@uaf.edu.pk
              </a>
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        </form>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Fee Verification System
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            University of Agriculture, Faisalabad
          </p>
        </div>
        {/* Track existing request */}
        {requestStatus === "new" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Have an existing Request ID?
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Request ID"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
              />
              <button
                onClick={() => {
                  if (trackId.trim()) {
                    fetchVerificationStatus(trackId.trim());
                    setRequestStatus("submitted");
                    setRequestId(trackId.trim());
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
              >
                Check Status
              </button>
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 md:p-6 shadow">
          {requestStatus === "new" && step <= 3 && <StepIndicator />}
          {renderStepForm()}
        </div>
        <div className="text-center mt-6 text-xs text-gray-600 dark:text-gray-400">
          <p>
            For assistance, contact Fee Section: feesection@uaf.edu.pk |
            +92-41-9200161 Ext: 3303
          </p>
          <p className="mt-1">Hours: 9:00 AM - 4:00 PM (Monday to Friday)</p>
        </div>
      </div>
    </main>
  );
}

export default FeeVerificationSystem;