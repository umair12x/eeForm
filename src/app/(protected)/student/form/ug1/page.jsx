"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  const [submittedFormId, setSubmittedFormId] = useState(null);
  const [submittedFormNumber, setSubmittedFormNumber] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  // Parse credit hours from format like "3(2-1)" or "2(2-0)"
  const parseCreditHours = useCallback((creditHoursString) => {
    if (!creditHoursString) return { total: 0, theory: 0, practical: 0 };
    const match = creditHoursString.match(/^(\d+)\((\d+)-(\d+)\)$/);
    if (match) {
      return {
        total: parseInt(match[1]),
        theory: parseInt(match[2]),
        practical: parseInt(match[3]),
      };
    }
    return { total: 0, theory: 0, practical: 0 };
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

  // Get selected tutor details
  const selectedTutor = useMemo(() => {
    return tutors.find((t) => t.id === formData.tutorId) || {};
  }, [tutors, formData.tutorId]);

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
      setError("Failed to load departments. Please refresh the page.");
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }));
    }
  }, []);

  const fetchTutors = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, tutors: true }));
      const response = await axios.get(
        "/api/student/ugform/data?type=tutor"
      );
      if (response.data.success) {
        setTutors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      setError("Failed to load tutors. Please refresh the page.");
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
        setError("Failed to load degree programs.");
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
        setError("Failed to load sessions.");
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
        setError("Failed to load subjects.");
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
    setSuccessMessage("");
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
            alert(
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
      alert("No remaining credit hours available for extra subjects.");
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

          // Update hours format when credit hours change
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

  const validateForm = useCallback(() => {
    if (!formData.studentName.trim()) {
      setError("Student name is required");
      return false;
    }
    if (!formData.fatherName.trim()) {
      setError("Father's name is required");
      return false;
    }
    if (!formData.registeredNo.trim()) {
      setError("Registration number is required");
      return false;
    }
    if (!formData.departmentId) {
      setError("Please select a department");
      return false;
    }
    if (!formData.degreeId) {
      setError("Please select a degree program");
      return false;
    }
    if (!formData.session) {
      setError("Please select a session");
      return false;
    }
    if (!formData.semester) {
      setError("Please select a semester");
      return false;
    }
    if (!formData.section) {
      setError("Please select a section");
      return false;
    }
    if (!formData.tutorId) {
      setError("Please select a tutor");
      return false;
    }
    if (!formData.tutorName) {
      setError("Tutor name is required");
      return false;
    }
    if (!formData.tutorEmail) {
      setError("Tutor email is required");
      return false;
    }
    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject");
      return false;
    }
    if (totalCredits > MAX_CREDIT_HOURS) {
      setError(
        `Maximum enrollment is ${MAX_CREDIT_HOURS} credit hours. Current: ${totalCredits}`
      );
      return false;
    }
    return true;
  }, [formData, selectedSubjects, totalCredits]);

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
    setSubmittedFormId(null);
    setSubmittedFormNumber(null);
    setError("");
    setSuccessMessage("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));

    try {
      const selectedDegree = degrees.find((d) => d.id === formData.degreeId);
      
      console.log("Form data before submission:", {
        tutorName: formData.tutorName,
        tutorEmail: formData.tutorEmail,
        tutorId: formData.tutorId
      });

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

      console.log("Final submission payload:", {
        tutorName: formSubmission.tutorName,
        tutorEmail: formSubmission.tutorEmail
      });

      const response = await axios.post(
        "/api/student/ugform/submit",
        formSubmission
      );

      if (response.data.success) {
        console.log("Form saved successfully:", response.data);
        
        setIsSubmitted(true);
        setSubmittedFormId(response.data.formId);
        setSubmittedFormNumber(response.data.formNumber);
        setSuccessMessage(
          `Form submitted successfully! Form Number: ${response.data.formNumber}`
        );
        setError("");

        // Reset form after successful submission
        setTimeout(() => {
          handleReset();
        }, 5000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Handle duplicate form error
      if (error.response?.status === 409) {
        setError(error.response.data.message);
        // Optionally show the existing form number
        if (error.response.data.existingFormNumber) {
          setError(`You have already submitted a form. Form Number: ${error.response.data.existingFormNumber}`);
        }
      }
      // Show validation errors
      else if (error.response?.data?.errors) {
        setError(error.response.data.errors.join(", "));
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to submit form. Please try again."
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // Loading states for different sections
  if (loading.departments && departments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 md:p-6 shadow-lg">
          {/* Header */}
          <div className="mb-6 border-b-2 border-gray-800 dark:border-green-500 pb-4">
            <div className="text-center">
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                UNIVERSITY OF AGRICULTURE, FAISALABAD, PAKISTAN
              </h1>
              <h2 className="text-base md:text-lg font-semibold mt-2 text-gray-700 dark:text-green-300">
                Form for listing courses to be taken in{" "}
                {formData.semester
                  ? `${formData.semester}${getOrdinalSuffix(
                      formData.semester
                    )} Semester`
                  : "_________ Semester"}{" "}
                ({formData.admissionTo || "___________"})
              </h2>
              <h3 className="text-sm md:text-base font-bold mt-1 text-gray-800 dark:text-green-400">
                {departmentName || "____________________________________"}
              </h3>
              <div className="text-xs md:text-sm font-medium mt-2 text-gray-600 dark:text-gray-300">
                UG-1 Form
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded">
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold">
                ⚠ {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
              <p className="text-green-600 dark:text-green-400 text-sm font-semibold">
                ✓ {successMessage}
              </p>
            </div>
          )}

          {/* Submitted Success Message */}
          {isSubmitted && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-bold text-green-800 dark:text-green-300">
                    Form Submitted Successfully!
                  </p>
                  <p className="text-green-700 dark:text-green-400 text-sm">
                    Form Number: {submittedFormNumber}
                  </p>
                  <p className="text-green-600 dark:text-green-500 text-sm mt-1">
                    Your enrollment has been submitted for tutor review.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Student Information Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-white border-b pb-2">
                Student Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    DEPARTMENT <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                    disabled={loading.departments}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {loading.departments && (
                    <div className="text-xs text-gray-500 mt-1">
                      Loading departments...
                    </div>
                  )}
                </div>

                {/* Degree Program */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    DEGREE PROGRAM <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="degreeId"
                    value={formData.degreeId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                    disabled={loading.degrees || !formData.departmentId}
                  >
                    <option value="">Select Degree</option>
                    {degrees.map((degree) => (
                      <option key={degree.id} value={degree.id}>
                        {degree.name}{" "}
                        {degree.shortName ? `(${degree.shortName})` : ""}
                      </option>
                    ))}
                  </select>
                  {loading.degrees && (
                    <div className="text-xs text-gray-500 mt-1">
                      Loading degrees...
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Session */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    SESSION <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="session"
                    value={formData.session}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                    disabled={loading.sessions || !formData.degreeId}
                  >
                    <option value="">Select Session</option>
                    {sessions.map((session, index) => (
                      <option key={`session-${index}-${session.session}`} value={session.session}>
                        {session.session}{" "}
                        {session.schemeName ? `- ${session.schemeName}` : ""}
                      </option>
                    ))}
                  </select>
                  {loading.sessions && (
                    <div className="text-xs text-gray-500 mt-1">
                      Loading sessions...
                    </div>
                  )}
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    SEMESTER <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                    disabled={!formData.degreeId || !formData.session}
                  >
                    <option value="">Select Semester</option>
                    {semesterOptions.map((sem) => (
                      <option key={`semester-${sem}`} value={sem}>
                        Semester {sem}{" "}
                        {sem === 1
                          ? "(1st)"
                          : sem === 2
                          ? "(2nd)"
                          : sem === 3
                          ? "(3rd)"
                          : `(${sem}th)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    SECTION <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                    disabled={!formData.degreeId}
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
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    ADMISSION TO <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="admissionTo"
                    value={formData.admissionTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., Fall 2025"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    DATE OF COMMENCEMENT
                  </label>
                  <input
                    type="date"
                    name="dateOfCommencement"
                    value={formData.dateOfCommencement}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    DATE OF FIRST ENROLLMENT
                  </label>
                  <input
                    type="date"
                    name="dateOfFirstEnrollment"
                    value={formData.dateOfFirstEnrollment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    STUDENT'S NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    FATHER'S NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Father's Name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    REGISTERED NO. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registeredNo"
                    value={formData.registeredNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Registration Number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    PHONE/CELL NO.
                  </label>
                  <input
                    type="text"
                    name="phoneCell"
                    value={formData.phoneCell}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Email Address"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  PERMANENT ADDRESS
                </label>
                <textarea
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  placeholder="Complete Address"
                />
              </div>
            </div>

            {/* Credit Hours Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-white border-b pb-2">
                Credit Hours Summary
              </h3>

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-300 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Selected Credits
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        totalCredits > MAX_CREDIT_HOURS
                          ? "text-red-600 dark:text-red-400"
                          : totalCredits > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {totalCredits}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Remaining
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {remainingCredits}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Maximum Allowed
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {MAX_CREDIT_HOURS}
                    </div>
                  </div>
                </div>
                {totalCredits > MAX_CREDIT_HOURS && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                    ⚠ You have exceeded the maximum credit hours limit!
                  </p>
                )}
              </div>
            </div>

            {/* Scheme Info Display */}
            {schemeInfo && (
              <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-xs">
                    <span className="font-semibold text-blue-800 dark:text-blue-300">
                      Scheme:
                    </span>
                    <span className="text-blue-700 dark:text-blue-400 ml-1">
                      {schemeInfo.schemeName}
                    </span>
                    <span className="mx-2 text-blue-300 dark:text-blue-600">
                      |
                    </span>
                    <span className="font-semibold text-blue-800 dark:text-blue-300">
                      Session:
                    </span>
                    <span className="text-blue-700 dark:text-blue-400 ml-1">
                      {schemeInfo.session}
                    </span>
                    <span className="mx-2 text-blue-300 dark:text-blue-600">
                      |
                    </span>
                    <span className="font-semibold text-blue-800 dark:text-blue-300">
                      Semester Credits:
                    </span>
                    <span className="text-blue-700 dark:text-blue-400 ml-1">
                      {schemeInfo.totalCredits}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Subject Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                  Available Subjects for {degreeName} - Semester{" "}
                  {formData.semester}
                </h3>
                {formData.semester && subjects.length > 0 && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                    Total Available Credits: {calculateCredits(subjects)}
                  </span>
                )}
              </div>

              {loading.subjects ? (
                <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded border">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Loading subjects...
                  </p>
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded border">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">
                    {!formData.degreeId ||
                    !formData.semester ||
                    !formData.session
                      ? "Please select degree, session, and semester to view subjects"
                      : "No subjects found for this semester. Please contact your department."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-800 dark:border-gray-600 rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center w-12">
                          Select
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-left">
                          Course Number
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-left">
                          Title of the Courses
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                          Credit Hours
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                          Theory
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                          Practical
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                          Credits
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject) => {
                        const isSelected = selectedSubjects.some(
                          (s) => s._id === subject._id
                        );
                        const isDisabled =
                          !isSelected &&
                          totalCredits + (subject.totalCredits || 0) >
                            MAX_CREDIT_HOURS;

                        return (
                          <tr
                            key={subject._id}
                            className={
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : isDisabled
                                ? "opacity-50"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }
                          >
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSubjectSelection(subject)}
                                className="h-4 w-4 text-blue-600 rounded"
                                disabled={isDisabled && !isSelected}
                              />
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2 font-mono">
                              {subject.code}
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2">
                              {subject.name}
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center font-mono">
                              {subject.hoursFormat || subject.creditHours}
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                              {subject.theoryHours || 0}
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                              {subject.practicalHours || 0}
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center font-bold">
                              {subject.totalCredits || 0}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Extra Subjects Section */}
            {remainingCredits > 0 && formData.degreeId && formData.semester && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                    Extra Subjects (Remaining Credits: {remainingCredits})
                  </h3>
                  <button
                    type="button"
                    onClick={addExtraSubject}
                    disabled={remainingCredits <= 0}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add Extra Subject
                  </button>
                </div>

                {extraSubjects.length > 0 && (
                  <div className="overflow-x-auto border border-gray-800 dark:border-gray-600 rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center w-16">
                            Action
                          </th>
                          <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-left">
                            Course Number
                          </th>
                          <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-left">
                            Title of the Courses
                          </th>
                          <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                            Credit Hours
                          </th>
                          <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                            Theory
                          </th>
                          <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                            Practical
                          </th>
                          <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                            Credits
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {extraSubjects.map((subject) => (
                          <tr
                            key={subject._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeExtraSubject(subject._id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                              >
                                Remove
                              </button>
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2">
                              <input
                                type="text"
                                value={subject.code}
                                onChange={(e) =>
                                  updateExtraSubject(
                                    subject._id,
                                    "code",
                                    e.target.value.toUpperCase()
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="e.g., CS-305"
                              />
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2">
                              <input
                                type="text"
                                value={subject.name}
                                onChange={(e) =>
                                  updateExtraSubject(
                                    subject._id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Subject Title"
                              />
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2">
                              <select
                                value={subject.totalCredits}
                                onChange={(e) => {
                                  const credits = parseInt(e.target.value);
                                  updateExtraSubject(
                                    subject._id,
                                    "totalCredits",
                                    credits
                                  );
                                  // Auto-adjust theory/practical based on credit hours
                                  if (credits === 1) {
                                    updateExtraSubject(
                                      subject._id,
                                      "theoryHours",
                                      1
                                    );
                                    updateExtraSubject(
                                      subject._id,
                                      "practicalHours",
                                      0
                                    );
                                  } else if (credits === 2) {
                                    updateExtraSubject(
                                      subject._id,
                                      "theoryHours",
                                      2
                                    );
                                    updateExtraSubject(
                                      subject._id,
                                      "practicalHours",
                                      0
                                    );
                                  } else if (credits === 3) {
                                    updateExtraSubject(
                                      subject._id,
                                      "theoryHours",
                                      2
                                    );
                                    updateExtraSubject(
                                      subject._id,
                                      "practicalHours",
                                      1
                                    );
                                  } else if (credits === 4) {
                                    updateExtraSubject(
                                      subject._id,
                                      "theoryHours",
                                      3
                                    );
                                    updateExtraSubject(
                                      subject._id,
                                      "practicalHours",
                                      1
                                    );
                                  }
                                }}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option value="1">1 Credit</option>
                                <option value="2">2 Credits</option>
                                <option value="3">3 Credits</option>
                                <option value="4">4 Credits</option>
                              </select>
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2">
                              <select
                                value={subject.theoryHours}
                                onChange={(e) =>
                                  updateExtraSubject(
                                    subject._id,
                                    "theoryHours",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                {[0, 1, 2, 3, 4].map((hours) => (
                                  <option key={`theory-${hours}`} value={hours}>
                                    {hours}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2">
                              <select
                                value={subject.practicalHours}
                                onChange={(e) =>
                                  updateExtraSubject(
                                    subject._id,
                                    "practicalHours",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                {[0, 1, 2, 3].map((hours) => (
                                  <option key={`practical-${hours}`} value={hours}>
                                    {hours}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center font-bold">
                              {subject.totalCredits}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Selected Subjects Summary */}
            {(selectedSubjects.length > 0 || extraSubjects.length > 0) && (
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-white border-b pb-2">
                  Courses to be taken during the Semester
                </h3>

                <div className="overflow-x-auto border border-gray-800 dark:border-gray-600 rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center w-12">
                          Sr.
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-left">
                          Course Number
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-left">
                          Title of the Courses
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                          Credit Hours
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                          Credits
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                          Total Marks
                        </th>
                        <th className="border-b border-gray-800 dark:border-gray-600 p-2 text-center">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSubjects.map((subject, index) => (
                        <tr
                          key={subject._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                            {index + 1}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 font-mono">
                            {subject.code}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2">
                            {subject.name}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center font-mono">
                            {subject.hoursFormat || subject.creditHours}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center font-bold">
                            {subject.totalCredits}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                            {subject.totalCredits * 20}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Regular
                            </span>
                          </td>
                        </tr>
                      ))}

                      {extraSubjects.map((subject, index) => (
                        <tr
                          key={subject._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                            {selectedSubjects.length + index + 1}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 font-mono">
                            {subject.code || "__________"}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2">
                            {subject.name || "____________________"}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center font-mono">
                            {subject.hoursFormat}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center font-bold">
                            {subject.totalCredits}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                            {subject.totalCredits * 20}
                          </td>
                          <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              Extra
                            </span>
                          </td>
                        </tr>
                      ))}

                      <tr className="bg-gray-100 dark:bg-gray-800 font-semibold">
                        <td
                          colSpan="3"
                          className="border-t border-gray-800 dark:border-gray-600 p-2 text-right"
                        >
                          Total
                        </td>
                        <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                          {totalCredits}
                        </td>
                        <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                          {totalCredits}
                        </td>
                        <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                          {totalCredits * 20}
                        </td>
                        <td className="border-t border-gray-800 dark:border-gray-600 p-2 text-center">
                          &nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Fee Information */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-white border-b pb-2">
                Fee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    FEE PAID UPTO
                  </label>
                  <input
                    type="text"
                    name="feePaidUpto"
                    value={formData.feePaidUpto}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g. 40000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    FEE PAYMENT DATE
                  </label>
                  <input
                    type="date"
                    name="feePaymentDate"
                    value={formData.feePaymentDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-white border-b pb-2">
                Signatures
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    STUDENT'S SIGNATURE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentSignature"
                    value={formData.studentSignature}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Student's Full Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    FORM DATE
                  </label>
                  <input
                    type="date"
                    name="formDate"
                    value={formData.formDate}
                    disabled
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Tutor Selection with Auto-populated Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Select your Tutor <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tutorId"
                    value={formData.tutorId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                    disabled={loading.tutors}
                  >
                    <option value="">Select Tutor</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.name} - {tutor.designation || "Tutor"}
                      </option>
                    ))}
                  </select>
                  {loading.tutors && (
                    <div className="text-xs text-gray-500 mt-1">
                      Loading tutors...
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Tutor's Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="tutorEmail"
                    value={formData.tutorEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Tutor's email"
                    required
                  />
                  {formData.tutorId && !formData.tutorEmail && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠ Email not found for selected tutor
                    </p>
                  )}
                </div>
              </div>

              {/* Display selected tutor details */}
              {formData.tutorId && selectedTutor && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                  <p className="text-blue-800 dark:text-blue-300">
                    <span className="font-semibold">Selected Tutor:</span>{" "}
                    {selectedTutor.name}
                    {selectedTutor.designation &&
                      ` (${selectedTutor.designation})`}
                  </p>
                  {selectedTutor.department && (
                    <p className="text-blue-600 dark:text-blue-400 mt-1">
                      Department: {selectedTutor.department}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700 flex flex-wrap gap-3 justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded text-sm transition-colors duration-200"
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={
                  loading.submit ||
                  totalCredits > MAX_CREDIT_HOURS ||
                  totalCredits === 0 ||
                  !formData.tutorId ||
                  !formData.tutorName ||
                  !formData.tutorEmail
                }
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading.submit ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Form"
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-gray-600 dark:text-gray-400">
            UG-1 Form - University of Agriculture, Faisalabad | Generated on{" "}
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </main>
  );
}

export default UgForm;