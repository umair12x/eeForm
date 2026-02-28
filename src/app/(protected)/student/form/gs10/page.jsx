"use client";
import React, { useState, useEffect } from "react";

// Degree options
const graduateDegrees = [
  "M.Sc. Agriculture",
  "M.Sc. Horticulture",
  "M.Sc. Computer Science",
  "M.Sc. Information Technology",
  "M.A. Economics",
  "MBA",
  "MBA (Executive)",
  "M.Com",
  "M.Ed.",
  "Ph.D. Agriculture",
  "Ph.D. Computer Science",
  "Ph.D. Economics",
];

// Faculty options
const faculties = [
  "Faculty of Agriculture",
  "Faculty of Computer Science & IT",
  "Faculty of Sciences",
  "Faculty of Social Sciences",
  "Faculty of Engineering",
  "Faculty of Veterinary Sciences",
];

function PostGraduateForm() {
  // Initial form data
  const initialFormData = {
    // Header Information
    enrollmentSemester: "Winter",
    enrollmentYear: new Date().getFullYear().toString(),
    commencementDate: "",
    degree: "",
    studentName: "",
    fatherName: "",
    registeredNo: "",
    dateOfFirstAdmission: "",
    
    // Status Selection
    studentStatus: "regular",
    statusType: "",
    
    // Faculty/Department
    faculty: "",
    department: "",
    
    // Credits Completed
    semester1Credits: "",
    semester2Credits: "",
    semester3Credits: "",
    semester4Credits: "",
    semester5Credits: "",
    semester6Credits: "",
    semester7Credits: "",
    semester8Credits: "",
    
    // Course Details
    courses: [
      { id: 1, courseNumber: "", title: "", credits: "3", type: "Major", repeatStatus: "" },
      { id: 2, courseNumber: "", title: "", credits: "3", type: "Major", repeatStatus: "" },
      { id: 3, courseNumber: "", title: "", credits: "3", type: "Minor", repeatStatus: "" },
      { id: 4, courseNumber: "", title: "", credits: "3", type: "Compulsory", repeatStatus: "" },
    ],
    
    // Additional Information
    cgpa: "",
    studentSignature: "",
    feesPaid: "",
    feeAssistantSignature: "",
    directorSignature: "",
    chairmanSignature: "",
    submissionDate: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const maxCreditHours = 24;
  const minCreditHours = 6;

  // Calculate total credits
  const totalCredits = formData.courses.reduce((sum, course) => {
    return sum + (parseInt(course.credits) || 0);
  }, 0);

  const remainingCredits = maxCreditHours - totalCredits;

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle course changes
  const handleCourseChange = (id, field, value) => {
    setFormData(prev => {
      const updatedCourses = prev.courses.map(course =>
        course.id === id ? { ...course, [field]: value } : course
      );
      return { ...prev, courses: updatedCourses };
    });
  };

  // Add new course
  const addCourse = () => {
    if (totalCredits >= maxCreditHours) {
      alert(`Maximum ${maxCreditHours} credit hours reached.`);
      return;
    }
    
    const newCourse = {
      id: Date.now(),
      courseNumber: "",
      title: "",
      credits: "3",
      type: "Major",
      repeatStatus: "",
    };
    setFormData(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse]
    }));
  };

  // Remove course
  const removeCourse = (id) => {
    if (formData.courses.length <= 1) {
      alert("At least one course must be enrolled.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.filter(course => course.id !== id)
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.degree || !formData.studentName || !formData.registeredNo) {
      alert("Please fill in all required fields.");
      return;
    }
    
    if (totalCredits < minCreditHours) {
      alert(`Minimum enrollment must be at least ${minCreditHours} credit hours.`);
      return;
    }
    
    if (totalCredits > maxCreditHours) {
      alert(`Maximum enrollment is ${maxCreditHours} credit hours.`);
      return;
    }
    
    if (formData.cgpa && parseFloat(formData.cgpa) < 2.0) {
      if (!confirm("Your GPA is below 2.0. Continuing may lead to enrollment cancellation. Do you want to proceed?")) {
        return;
      }
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      alert("GS-10 Form submitted successfully!");
    }, 1500);
  };

  // Reset form
  const handleReset = () => {
    if (confirm("Are you sure you want to reset the form? All data will be lost.")) {
      setFormData(initialFormData);
      setIsSubmitted(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 md:p-6 shadow">
          {/* Header */}
          <div className="mb-6 border-b-2 border-gray-800 dark:border-green-500 pb-4">
            <div className="text-center">
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                UNIVERSITY OF AGRICULTURE, FAISALABAD
              </h1>
              <h2 className="text-base md:text-lg font-semibold mt-2 text-gray-700 dark:text-green-300">
                GS-10: POST GRADUATE ENROLLMENT FORM
              </h2>
              <div className="text-xs md:text-sm font-medium mt-2 text-gray-600 dark:text-gray-300">
                Graduate Studies Office
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Student Information Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-white border-b pb-2">
                Student Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    STUDENT'S NAME
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
                    FATHER'S NAME
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
                    REGISTERED NO.
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
                    DEGREE PROGRAM
                  </label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Degree</option>
                    {graduateDegrees.map(degree => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    ENROLLMENT SEMESTER
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="enrollmentSemester"
                      value={formData.enrollmentSemester}
                      onChange={handleChange}
                      className="w-1/2 px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="Winter">Winter</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                    </select>
                    <input
                      type="text"
                      name="enrollmentYear"
                      value={formData.enrollmentYear}
                      onChange={handleChange}
                      className="w-1/2 px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Year"
                    />
                  </div>
                </div>
              </div>

              {/* Student Status */}
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  STUDENT STATUS
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { value: "regular", label: "Regular Student" },
                    { value: "uniEmployee", label: "University Employee" },
                    { value: "govtEmployee", label: "Government Employee" },
                    { value: "hecNominee", label: "HEC Nominee" },
                    { value: "others", label: "Others" },
                  ].map((status) => (
                    <div key={status.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="studentStatus"
                        value={status.value}
                        checked={formData.studentStatus === status.value}
                        onChange={handleChange}
                        className="h-4 w-4"
                      />
                      <label className="text-sm">{status.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    FACULTY
                  </label>
                  <select
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map(faculty => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    DEPARTMENT/INSTITUTE
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Department Name"
                  />
                </div>
              </div>
            </div>

            {/* Credit Hours Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-white border-b pb-2">
                Credit Hours Summary (Minimum: {minCreditHours} hrs, Maximum: {maxCreditHours} hrs)
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-300 dark:border-gray-700 mb-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Selected Credits</div>
                    <div className={`text-lg font-bold ${
                      totalCredits < minCreditHours 
                        ? 'text-red-600 dark:text-red-400' 
                        : totalCredits <= maxCreditHours 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}>
                      {totalCredits}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {remainingCredits}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Minimum Required</div>
                    <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {minCreditHours}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Status</div>
                    <div className={`text-sm font-bold ${
                      totalCredits >= minCreditHours && totalCredits <= maxCreditHours
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {totalCredits >= minCreditHours && totalCredits <= maxCreditHours ? '✓ Eligible' : '⚠ Check'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Enrollment */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                  Course Enrollment
                </h3>
                <button
                  type="button"
                  onClick={addCourse}
                  disabled={totalCredits >= maxCreditHours}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-semibold rounded"
                >
                  + Add Course
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-800 dark:border-gray-600 text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="border border-gray-800 dark:border-gray-600 p-2">Course Code</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-2">Course Title</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-2 text-center w-20">Credits</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-2 text-center w-32">Type</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-2 text-center w-24">Repeat</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-2 text-center w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="border border-gray-800 dark:border-gray-600 p-2">
                          <input
                            type="text"
                            value={course.courseNumber}
                            onChange={(e) => handleCourseChange(course.id, 'courseNumber', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="CS-501"
                          />
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2">
                          <input
                            type="text"
                            value={course.title}
                            onChange={(e) => handleCourseChange(course.id, 'title', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Course Title"
                          />
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2">
                          <select
                            value={course.credits}
                            onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2">
                          <select
                            value={course.type}
                            onChange={(e) => handleCourseChange(course.id, 'type', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                          >
                            <option value="Major">Major</option>
                            <option value="Minor">Minor</option>
                            <option value="Compulsory">Compulsory</option>
                            <option value="Deficiency">Deficiency</option>
                            <option value="Audit">Audit</option>
                          </select>
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2">
                          <select
                            value={course.repeatStatus}
                            onChange={(e) => handleCourseChange(course.id, 'repeatStatus', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                          >
                            <option value="">None</option>
                            <option value="I">I</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                          </select>
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeCourse(course.id)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                            disabled={formData.courses.length <= 1}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Declaration Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-white border-b pb-2">
                Declaration & Information
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                      CURRENT CGPA (If Applicable)
                    </label>
                    <input
                      type="number"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="4"
                      className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., 3.25"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                      STUDENT'S SIGNATURE
                    </label>
                    <input
                      type="text"
                      name="studentSignature"
                      value={formData.studentSignature}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Type full name"
                    />
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
                  <p className="text-xs font-bold text-yellow-800 dark:text-yellow-300 mb-1">
                    IMPORTANT WARNING:
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    Admission will be cancelled if the GPA falls below 2.00 at the end of academic year 
                    (Winter, Spring and Summer). Students must maintain minimum CGPA requirements to remain enrolled.
                  </p>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="mb-2">
                    <strong>Declaration:</strong> I shall be responsible for any misreported information on this GS-10 form. 
                    I understand that it is subject to cancellation after scrutiny. I shall abide by all rules/regulations 
                    regarding GPA/CGPA. The information given above is correct to the best of my knowledge.
                  </p>
                </div>
              </div>
            </div>

            {/* Administrative Section */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-white border-b pb-2">
                Administrative Section
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    FEES PAID STATUS
                  </label>
                  <input
                    type="text"
                    name="feesPaid"
                    value={formData.feesPaid}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., Paid, Pending"
                  />
                  <div className="text-center mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Fee Assistant
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    APPROVING AUTHORITY
                  </label>
                  <input
                    type="text"
                    name="chairmanSignature"
                    value={formData.chairmanSignature}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-800 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="(Chairman/Director)"
                  />
                  <div className="text-center mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Director, Graduate Studies
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700 flex flex-wrap gap-3 justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded text-sm"
              >
                Reset Form
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-sm disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Submit GS-10 Form"}
              </button>
            </div>

            {/* Status Message */}
            {isSubmitted && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-bold text-green-800 dark:text-green-300">
                      GS-10 Form Submitted Successfully!
                    </p>
                    <p className="text-green-700 dark:text-green-400">
                      Your enrollment for {formData.degree} has been submitted for processing.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-gray-600 dark:text-gray-400">
            GS-10 Form - Graduate Studies Office, University of Agriculture, Faisalabad
          </div>
        </div>
      </div>
    </main>
  );
}

export default PostGraduateForm;