"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

function UgForm() {
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schemeInfo, setSchemeInfo] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState({
    departments: true,
    degrees: false,
    sessions: false,
    subjects: false,
    tutors: false,
    submit: false,
  });

  const [formData, setFormData] = useState({
    departmentId: "",
    degreeId: "",
    session: "",
    semester: "",
    section: "",
    admissionTo: "",
    dateOfCommencement: new Date().toISOString().split("T")[0],
    dateOfFirstEnrollment: "",
    registeredNo: "",
    studentName: "",
    fatherName: "",
    permanentAddress: "",
    phoneCell: "",
    email: "",
    feePaidUpto: "",
    feePaymentDate: "",
    studentSignature: "",
    tutorId: "",
    tutorName: "",
    tutorEmail: "",
    formDate: new Date().toISOString().split("T")[0],
  });

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [extraSubjects, setExtraSubjects] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedFormNumber, setSubmittedFormNumber] = useState(null);
  const [error, setError] = useState("");
  const [autoFillData, setAutoFillData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const MAX_CREDIT_HOURS = 24;

  // Helper function for ordinal suffixes
  const getOrdinalSuffix = useCallback((num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }, []);

  // Generate section options based on degree's total sections
  const sectionOptions = useMemo(() => {
    const selectedDegree = degrees.find((d) => d._id === formData.degreeId);
    const totalSections = selectedDegree?.totalSections || 8;
    return Array.from({ length: totalSections }, (_, i) =>
      String.fromCharCode(65 + i)
    );
  }, [degrees, formData.degreeId]);

  // Generate semester options based on degree's total semesters
  const semesterOptions = useMemo(() => {
    const selectedDegree = degrees.find((d) => d._id === formData.degreeId);
    const totalSemesters = selectedDegree?.totalSemesters || 8;
    return Array.from({ length: totalSemesters }, (_, i) => i + 1);
  }, [degrees, formData.degreeId]);

  // Calculate total credits
  const calculateCredits = useCallback((subjectsList) => {
    return subjectsList.reduce((sum, subject) => {
      return sum + (parseInt(subject.totalCredits) || 0);
    }, 0);
  }, []);

  const totalCredits = useMemo(
    () => calculateCredits(selectedSubjects) + calculateCredits(extraSubjects),
    [selectedSubjects, extraSubjects, calculateCredits]
  );

  const remainingCredits = MAX_CREDIT_HOURS - totalCredits;

  // Get department name
  const departmentName = useMemo(() => {
    const dept = departments.find((d) => d.id === formData.departmentId);
    return dept?.name || "";
  }, [departments, formData.departmentId]);

  // Get degree name
  const degreeName = useMemo(() => {
    const deg = degrees.find((d) => d.id === formData.degreeId);
    return deg?.name || "";
  }, [degrees, formData.degreeId]);

  // Check for auto-fill data from approved fee verification
  useEffect(() => {
    const checkAutoFill = async () => {
      try {
        const response = await fetch("/api/student/fee/approved-for-autofill");
        if (response.ok) {
          const data = await response.json();
          if (data.hasApprovedFee) {
            setAutoFillData(data.feeData);
          }
        }
      } catch (error) {
        console.error("Error checking auto-fill:", error);
      }
    };
    checkAutoFill();
  }, []);

  const handleAutoFill = () => {
    if (autoFillData) {
      // Format the fee payment date if it exists
      let formattedFeePaymentDate = autoFillData.feePaymentDate;
      if (autoFillData.feePaymentDate) {
        const date = new Date(autoFillData.feePaymentDate);
        formattedFeePaymentDate = date.toISOString().split("T")[0];
      }

      setFormData((prev) => ({
        ...prev,
        registeredNo: autoFillData.registrationNumber || prev.registeredNo,
        studentName: autoFillData.studentName || prev.studentName,
        fatherName: autoFillData.fatherName || prev.fatherName,
        phoneCell: autoFillData.contactNumber || prev.phoneCell,
        degreeId: autoFillData.degreeId || prev.degreeId,
        // Auto-fill fee information
        feePaidUpto: autoFillData.feePaidUpto ? autoFillData.feePaidUpto.toString() : prev.feePaidUpto,
        feePaymentDate: formattedFeePaymentDate || prev.feePaymentDate,
      }));
      
      // If degreeId is set, we need to fetch degrees first
      if (autoFillData.degreeId) {
        // We'll let the useEffect handle fetching
      }
      
      toast.success("Form auto-filled successfully!");
    }
  };

  // API Functions
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, departments: true }));
      const response = await axios.get(
        "/api/student/ugform/data?type=departments"
      );
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }));
    }
  }, []);

  const fetchTutors = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, tutors: true }));
      const response = await axios.get("/api/student/ugform/data?type=tutor");
      if (response.data.success) {
        setTutors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      toast.error("Failed to load tutors");
    } finally {
      setLoading((prev) => ({ ...prev, tutors: false }));
    }
  }, []);

  const fetchDegrees = useCallback(
    async (departmentId) => {
      try {
        setLoading((prev) => ({ ...prev, degrees: true }));
        const response = await axios.get(
          `/api/student/ugform/data?type=degrees&departmentId=${departmentId}`
        );
        if (response.data.success) {
          setDegrees(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching degrees:", error);
        toast.error("Failed to load degree programs");
      } finally {
        setLoading((prev) => ({ ...prev, degrees: false }));
      }
    },
    []
  );

  const fetchSessions = useCallback(
    async (degreeId) => {
      try {
        setLoading((prev) => ({ ...prev, sessions: true }));
        const response = await axios.get(
          `/api/student/ugform/data?type=sessions&degreeId=${degreeId}`
        );
        if (response.data.success) {
          setSessions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Failed to load sessions");
      } finally {
        setLoading((prev) => ({ ...prev, sessions: false }));
      }
    },
    []
  );

  const fetchSubjects = useCallback(
    async (degreeId, semester, session) => {
      try {
        setLoading((prev) => ({ ...prev, subjects: true }));
        setSubjects([]);

        const response = await axios.get(
          `/api/student/ugform/data?type=subjects&degreeId=${degreeId}&semester=${semester}&session=${session}`
        );

        if (response.data.success) {
          setSubjects(response.data.data);
          setSchemeInfo({
            schemeName: response.data.schemeName,
            session: response.data.session,
            totalCredits: response.data.totalSemesterCredits,
          });
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects");
      } finally {
        setLoading((prev) => ({ ...prev, subjects: false }));
      }
    },
    []
  );

  // Fetch departments & tutors on mount
  useEffect(() => {
    fetchDepartments();
    fetchTutors();
  }, [fetchDepartments, fetchTutors]);

  // Fetch degrees when department changes
  useEffect(() => {
    if (formData.departmentId) {
      fetchDegrees(formData.departmentId);
      setFormData((prev) => ({
        ...prev,
        degreeId: "",
        session: "",
        semester: "",
        section: "",
        tutorId: "",
        tutorName: "",
        tutorEmail: "",
      }));
      setSessions([]);
      setSubjects([]);
      setSelectedSubjects([]);
      setExtraSubjects([]);
      setSchemeInfo(null);
    }
  }, [formData.departmentId, fetchDegrees]);

  // Fetch sessions when degree changes
  useEffect(() => {
    if (formData.degreeId) {
      fetchSessions(formData.degreeId);
      setFormData((prev) => ({
        ...prev,
        session: "",
        semester: "",
        section: "",
        tutorId: "",
        tutorName: "",
        tutorEmail: "",
      }));
      setSubjects([]);
      setSelectedSubjects([]);
      setExtraSubjects([]);
      setSchemeInfo(null);
    }
  }, [formData.degreeId, fetchSessions]);

  // Fetch subjects when degree, session, and semester change
  useEffect(() => {
    if (formData.degreeId && formData.session && formData.semester) {
      fetchSubjects(formData.degreeId, formData.semester, formData.session);
      setSelectedSubjects([]);
      setExtraSubjects([]);
    }
  }, [formData.degreeId, formData.session, formData.semester, fetchSubjects]);

  // Auto-update tutor name and email when tutor is selected
  useEffect(() => {
    if (formData.tutorId && tutors.length > 0) {
      const tutor = tutors.find((t) => t.id === formData.tutorId);
      if (tutor) {
        setFormData((prev) => ({
          ...prev,
          tutorName: tutor.name || "",
          tutorEmail: tutor.email || "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        tutorName: "",
        tutorEmail: "",
      }));
    }
  }, [formData.tutorId, tutors]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  }, []);

  const handleSubjectSelection = useCallback(
    (subject) => {
      setSelectedSubjects((prev) => {
        const isSelected = prev.some((s) => s._id === subject._id);

        if (isSelected) {
          return prev.filter((s) => s._id !== subject._id);
        } else {
          const subjectCredits = parseInt(subject.totalCredits) || 0;
          const currentTotal =
            calculateCredits(prev) + calculateCredits(extraSubjects);

          if (currentTotal + subjectCredits > MAX_CREDIT_HOURS) {
            toast.error(
              `Cannot add subject. Maximum ${MAX_CREDIT_HOURS} credit hours exceeded.`
            );
            return prev;
          }
          return [...prev, subject];
        }
      });
    },
    [extraSubjects, calculateCredits]
  );

  const addExtraSubject = useCallback(() => {
    if (remainingCredits <= 0) {
      toast.error("No remaining credit hours available for extra subjects.");
      return;
    }

    const newSubject = {
      _id: `extra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: "",
      name: "",
      totalCredits: 3,
      theoryHours: 2,
      practicalHours: 1,
      hoursFormat: "3(2-1)",
      creditHours: "3(2-1)",
      isExtra: true,
    };
    setExtraSubjects((prev) => [...prev, newSubject]);
  }, [remainingCredits]);

  const updateExtraSubject = useCallback((id, field, value) => {
    setExtraSubjects((prev) =>
      prev.map((subject) => {
        if (subject._id === id) {
          const updated = { ...subject, [field]: value };

          if (
            field === "totalCredits" ||
            field === "theoryHours" ||
            field === "practicalHours"
          ) {
            const total =
              field === "totalCredits" ? value : subject.totalCredits;
            const theory =
              field === "theoryHours" ? value : subject.theoryHours;
            const practical =
              field === "practicalHours" ? value : subject.practicalHours;
            updated.hoursFormat = `${total}(${theory}-${practical})`;
            updated.creditHours = `${total}(${theory}-${practical})`;
          }

          return updated;
        }
        return subject;
      })
    );
  }, []);

  const removeExtraSubject = useCallback((id) => {
    setExtraSubjects((prev) => prev.filter((subject) => subject._id !== id));
  }, []);

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.departmentId) {
        toast.error("Please select a department");
        return false;
      }
      if (!formData.degreeId) {
        toast.error("Please select a degree program");
        return false;
      }
      if (!formData.session) {
        toast.error("Please select a session");
        return false;
      }
      if (!formData.semester) {
        toast.error("Please select a semester");
        return false;
      }
      if (!formData.section) {
        toast.error("Please select a section");
        return false;
      }
      if (!formData.admissionTo) {
        toast.error("Please enter admission term");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.registeredNo) {
        toast.error("Registration number is required");
        return false;
      }
      if (!formData.studentName) {
        toast.error("Student name is required");
        return false;
      }
      if (!formData.fatherName) {
        toast.error("Father's name is required");
        return false;
      }
    }
    if (step === 3) {
      if (selectedSubjects.length === 0) {
        toast.error("Please select at least one subject");
        return false;
      }
      if (totalCredits > MAX_CREDIT_HOURS) {
        toast.error(`Maximum enrollment is ${MAX_CREDIT_HOURS} credit hours`);
        return false;
      }
    }
    if (step === 4) {
      if (!formData.tutorId) {
        toast.error("Please select a tutor");
        return false;
      }
      if (!formData.studentSignature) {
        toast.error("Student signature is required");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0 });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0 });
  };

  const handleReset = useCallback(() => {
    setFormData({
      departmentId: "",
      degreeId: "",
      session: "",
      semester: "",
      section: "",
      admissionTo: "",
      dateOfCommencement: new Date().toISOString().split("T")[0],
      dateOfFirstEnrollment: "",
      registeredNo: "",
      studentName: "",
      fatherName: "",
      permanentAddress: "",
      phoneCell: "",
      email: "",
      feePaidUpto: "",
      feePaymentDate: "",
      studentSignature: "",
      tutorId: "",
      tutorName: "",
      tutorEmail: "",
      formDate: new Date().toISOString().split("T")[0],
    });
    setSelectedSubjects([]);
    setExtraSubjects([]);
    setSessions([]);
    setSubjects([]);
    setSchemeInfo(null);
    setIsSubmitted(false);
    setSubmittedFormNumber(null);
    setError("");
    setCurrentStep(1);
    toast.success("Form reset successfully");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading((prev) => ({ ...prev, submit: true }));
    setError("");

    try {
      const selectedDegree = degrees.find((d) => d.id === formData.degreeId);

      const formSubmission = {
        ...formData,
        degreeName: selectedDegree?.name,
        totalCredits,
        selectedSubjects: selectedSubjects.map((s) => ({
          subjectId: s._id,
          code: s.code,
          name: s.name,
          creditHours: s.hoursFormat || s.creditHours,
          totalCredits: s.totalCredits,
          theoryHours: s.theoryHours,
          practicalHours: s.practicalHours,
        })),
        extraSubjects: extraSubjects.map((s) => ({
          code: s.code,
          name: s.name,
          creditHours: s.hoursFormat,
          totalCredits: s.totalCredits,
          theoryHours: s.theoryHours,
          practicalHours: s.practicalHours,
        })),
      };

      const response = await axios.post(
        "/api/student/ugform/submit",
        formSubmission
      );

      if (response.data.success) {
        setIsSubmitted(true);
        setSubmittedFormNumber(response.data.formNumber);
        toast.success(`Form submitted! Number: ${response.data.formNumber}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
        if (error.response.data.existingFormNumber) {
          setError(`You already submitted form: ${error.response.data.existingFormNumber}`);
        }
      } else if (error.response?.data?.errors) {
        toast.error(error.response.data.errors[0]);
      } else {
        toast.error(error.response?.data?.message || "Failed to submit form");
      }
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // Step indicator component (simplified)
  const StepIndicator = () => {
    const steps = ["Program Details", "Personal Info", "Subject Selection", "Review & Submit"];
    
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((label, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${currentStep > idx + 1 ? 'bg-green-600 text-white' : 
                  currentStep === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}`}>
                {currentStep > idx + 1 ? '✓' : idx + 1}
              </div>
              <span className="text-xs mt-1 text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading.departments && departments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <Toaster position="top-right" />
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Form Submitted!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Form Number: {submittedFormNumber}
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6">
          {/* Header */}
          <div className="mb-4 text-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              UNIVERSITY OF AGRICULTURE, FAISALABAD
            </h1>
            <h2 className="text-md md:text-lg text-gray-700 dark:text-gray-300 mt-1">
              UG-1 Form - Course Registration
            </h2>
          </div>

          {/* Auto-fill Banner */}
          {autoFillData && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-800 dark:text-green-300">
                    Approved fee verification found
                  </span>
                </div>
                <button
                  onClick={handleAutoFill}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                >
                  Auto-fill
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <StepIndicator />

          <form onSubmit={handleSubmit}>
            {/* Step 1: Program Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Program Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Degree Program */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Degree Program <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="degreeId"
                      value={formData.degreeId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.departmentId}
                    >
                      <option value="">Select Degree</option>
                      {degrees.map((degree) => (
                        <option key={degree.id} value={degree.id}>
                          {degree.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Session */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Session <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="session"
                      value={formData.session}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.degreeId}
                    >
                      <option value="">Select Session</option>
                      {sessions.map((session, index) => (
                        <option key={`session-${index}`} value={session.session}>
                          {session.session}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.degreeId || !formData.session}
                    >
                      <option value="">Select Semester</option>
                      {semesterOptions.map((sem) => (
                        <option key={`semester-${sem}`} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Section</option>
                      {sectionOptions.map((section) => (
                        <option key={`section-${section}`} value={section}>
                          Section {section}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Admission To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Admission To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="admissionTo"
                      value={formData.admissionTo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Fall 2025"
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

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Registration Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Registration No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="registeredNo"
                      value={formData.registeredNo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2022-ag-1234"
                    />
                  </div>

                  {/* Student Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Full Name"
                    />
                  </div>

                  {/* Father's Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Father's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Father's Name"
                    />
                  </div>

                  {/* Phone/Cell */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone/Cell No.
                    </label>
                    <input
                      type="text"
                      name="phoneCell"
                      value={formData.phoneCell}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="student@uaf.edu.pk"
                    />
                  </div>

                  {/* Permanent Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Permanent Address
                    </label>
                    <textarea
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Complete Address"
                    />
                  </div>
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

            {/* Step 3: Subject Selection */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Subject Selection
                </h3>

                {/* Credit Hours Summary */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Selected</div>
                      <div className={`text-xl font-bold ${totalCredits > MAX_CREDIT_HOURS ? 'text-red-600' : 'text-green-600'}`}>
                        {totalCredits}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
                      <div className="text-xl font-bold text-blue-600">{remainingCredits}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Max</div>
                      <div className="text-xl font-bold text-purple-600">{MAX_CREDIT_HOURS}</div>
                    </div>
                  </div>
                </div>

                {/* Scheme Info */}
                {schemeInfo && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                    <p>
                      <span className="font-semibold">Scheme:</span> {schemeInfo.schemeName} | 
                      <span className="font-semibold ml-2">Session:</span> {schemeInfo.session} |
                      <span className="font-semibold ml-2">Credits:</span> {schemeInfo.totalCredits}
                    </p>
                  </div>
                )}

                {/* Available Subjects */}
                <div>
                  <h4 className="font-medium mb-2">Available Subjects</h4>
                  {loading.subjects ? (
                    <div className="text-center py-8">Loading subjects...</div>
                  ) : subjects.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400">
                        {!formData.degreeId || !formData.semester || !formData.session
                          ? "Please select degree, session, and semester"
                          : "No subjects found"}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                          <tr>
                            <th className="p-2 text-center w-12">Select</th>
                            <th className="p-2 text-left">Code</th>
                            <th className="p-2 text-left">Title</th>
                            <th className="p-2 text-center">Credits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjects.map((subject) => {
                            const isSelected = selectedSubjects.some(s => s._id === subject._id);
                            const isDisabled = !isSelected && totalCredits + subject.totalCredits > MAX_CREDIT_HOURS;

                            return (
                              <tr key={subject._id} className={`border-t ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <td className="p-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleSubjectSelection(subject)}
                                    className="h-4 w-4 text-blue-600 rounded"
                                    disabled={isDisabled && !isSelected}
                                  />
                                </td>
                                <td className="p-2 font-mono">{subject.code}</td>
                                <td className="p-2">{subject.name}</td>
                                <td className="p-2 text-center">{subject.totalCredits}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Extra Subjects */}
                {remainingCredits > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Extra Subjects</h4>
                      <button
                        type="button"
                        onClick={addExtraSubject}
                        disabled={remainingCredits <= 0}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded disabled:opacity-50"
                      >
                        Add Extra
                      </button>
                    </div>

                    {extraSubjects.length > 0 && (
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                              <th className="p-2 text-center w-16">Action</th>
                              <th className="p-2 text-left">Code</th>
                              <th className="p-2 text-left">Title</th>
                              <th className="p-2 text-center">Credits</th>
                            </tr>
                          </thead>
                          <tbody>
                            {extraSubjects.map((subject) => (
                              <tr key={subject._id} className="border-t">
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeExtraSubject(subject._id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    ✕
                                  </button>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={subject.code}
                                    onChange={(e) => updateExtraSubject(subject._id, "code", e.target.value.toUpperCase())}
                                    className="w-full px-2 py-1 border rounded"
                                    placeholder="CS-305"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={subject.name}
                                    onChange={(e) => updateExtraSubject(subject._id, "name", e.target.value)}
                                    className="w-full px-2 py-1 border rounded"
                                    placeholder="Subject Title"
                                  />
                                </td>
                                <td className="p-2">
                                  <select
                                    value={subject.totalCredits}
                                    onChange={(e) => {
                                      const credits = parseInt(e.target.value);
                                      updateExtraSubject(subject._id, "totalCredits", credits);
                                      if (credits === 1) {
                                        updateExtraSubject(subject._id, "theoryHours", 1);
                                        updateExtraSubject(subject._id, "practicalHours", 0);
                                      } else if (credits === 2) {
                                        updateExtraSubject(subject._id, "theoryHours", 2);
                                        updateExtraSubject(subject._id, "practicalHours", 0);
                                      } else if (credits === 3) {
                                        updateExtraSubject(subject._id, "theoryHours", 2);
                                        updateExtraSubject(subject._id, "practicalHours", 1);
                                      } else if (credits === 4) {
                                        updateExtraSubject(subject._id, "theoryHours", 3);
                                        updateExtraSubject(subject._id, "practicalHours", 1);
                                      }
                                    }}
                                    className="w-full px-2 py-1 border rounded"
                                  >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    disabled={selectedSubjects.length === 0}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Review & Submit
                </h3>

                {/* Program Summary */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Program Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Department:</div>
                    <div className="font-medium">{departmentName || "—"}</div>
                    <div>Degree:</div>
                    <div className="font-medium">{degreeName || "—"}</div>
                    <div>Session:</div>
                    <div className="font-medium">{formData.session || "—"}</div>
                    <div>Semester:</div>
                    <div className="font-medium">{formData.semester || "—"}</div>
                    <div>Section:</div>
                    <div className="font-medium">{formData.section || "—"}</div>
                  </div>
                </div>

                {/* Personal Summary */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Reg No:</div>
                    <div className="font-medium">{formData.registeredNo || "—"}</div>
                    <div>Name:</div>
                    <div className="font-medium">{formData.studentName || "—"}</div>
                    <div>Father's Name:</div>
                    <div className="font-medium">{formData.fatherName || "—"}</div>
                    <div>Phone:</div>
                    <div className="font-medium">{formData.phoneCell || "—"}</div>
                  </div>
                </div>

                {/* Fee Information - Auto-filled or Manual */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Fee Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fee Paid Upto
                      </label>
                      <input
                        type="text"
                        name="feePaidUpto"
                        value={formData.feePaidUpto}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        placeholder="e.g., 40000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fee Payment Date
                      </label>
                      <input
                        type="date"
                        name="feePaymentDate"
                        value={formData.feePaymentDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  {autoFillData && formData.feePaidUpto && formData.feePaymentDate && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Fee information auto-filled from approved verification
                    </p>
                  )}
                </div>

                {/* Subjects Summary */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Courses</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Code</th>
                          <th className="py-2 text-left">Title</th>
                          <th className="py-2 text-center">Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSubjects.map((s) => (
                          <tr key={s._id} className="border-b">
                            <td className="py-2">{s.code}</td>
                            <td className="py-2">{s.name}</td>
                            <td className="py-2 text-center">{s.totalCredits}</td>
                          </tr>
                        ))}
                        {extraSubjects.map((s) => (
                          <tr key={s._id} className="border-b">
                            <td className="py-2">{s.code || "—"}</td>
                            <td className="py-2">{s.name || "—"}</td>
                            <td className="py-2 text-center">{s.totalCredits}</td>
                          </tr>
                        ))}
                        <tr className="font-bold">
                          <td colSpan="2" className="py-2 text-right">Total:</td>
                          <td className="py-2 text-center">{totalCredits}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tutor Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Tutor <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tutorId"
                      value={formData.tutorId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="">Select Tutor</option>
                      {tutors.map((tutor) => (
                        <option key={tutor.id} value={tutor.id}>
                          {tutor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tutor's Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="tutorEmail"
                      value={formData.tutorEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      readOnly
                    />
                  </div>
                </div>

                {/* Student Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student's Signature <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentSignature"
                    value={formData.studentSignature}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Type your full name"
                  />
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
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={loading.submit || !formData.tutorId || !formData.studentSignature}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {loading.submit ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

export default UgForm;