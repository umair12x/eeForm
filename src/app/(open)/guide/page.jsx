'use client';

import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState('student');

  const tabs = [
    { id: 'student', label: 'Student Guide' },
    { id: 'tutor', label: 'Tutor Guide' },
    { id: 'manager', label: 'Manager Guide' },
    { id: 'fee', label: 'Fee Office Guide' },
    { id: 'admin', label: 'Admin Guide' },
  ];

  const guides = {
    student: [
      {
        step: 1,
        title: 'Login to Your Account',
        description: 'Use your registration number and password to login.',
        details: [
          'Your registration number is provided by the university',
          'Default password is your CNIC number (change after first login)',
          'Contact IT support if you cannot login',
        ],
      },
      {
        step: 2,
        title: 'Submit Fee Verification',
        description: 'Upload your fee voucher for verification.',
        details: [
          'Go to Fee Submission page',
          'Fill in the fee details accurately',
          'Upload clear image of paid voucher',
          'Wait for fee office verification',
        ],
      },
      {
        step: 3,
        title: 'Fill UG-1 Form',
        description: 'Complete your enrollment form after fee approval.',
        details: [
          'Select your department and degree',
          'Choose your semester and section',
          'Select subjects (max 24 credit hours)',
          'Assign your academic tutor',
          'Review and submit the form',
        ],
      },
      {
        step: 4,
        title: 'Track Progress',
        description: 'Monitor your form status in real-time.',
        details: [
          'Pending Tutor Approval',
          'Signed by Tutor',
          'Pending Manager Approval',
          'Approved - Final PDF available',
        ],
      },
      {
        step: 5,
        title: 'Download Form',
        description: 'Get your approved form PDF.',
        details: [
          'Four copies (Student, Advisor, Controller, Director)',
          'Print and keep for records',
          'Submit to relevant offices if required',
        ],
      },
    ],
    tutor: [
      {
        step: 1,
        title: 'Login to Tutor Portal',
        description: 'Use your email and password.',
      },
      {
        step: 2,
        title: 'View Pending Forms',
        description: 'See all forms assigned to you.',
        details: [
          'Filter by status',
          'Search by student name or registration',
          'View form details before signing',
        ],
      },
      {
        step: 3,
        title: 'Review Student Form',
        description: 'Check student information and subject selection.',
        details: [
          'Verify student details',
          'Check credit hours (max 24)',
          'Ensure subjects are appropriate',
        ],
      },
      {
        step: 4,
        title: 'Sign or Reject',
        description: 'Approve with digital signature or reject with reason.',
        details: [
          'Use digital signature pad',
          'Add remarks if needed',
          'Provide rejection reason if rejecting',
        ],
      },
    ],
    manager: [
      {
        step: 1,
        title: 'Login to Manager Portal',
        description: 'Access your department dashboard.',
      },
      {
        step: 2,
        title: 'View Forms for Approval',
        description: 'See all tutor-signed forms from your department.',
        details: [
          'Sort by submission date',
          'Filter by student or program',
          'Bulk approval option available',
        ],
      },
      {
        step: 3,
        title: 'Final Review',
        description: 'Verify all information is correct.',
        details: [
          'Check student eligibility',
          'Verify tutor signature',
          'Confirm fee payment status',
        ],
      },
      {
        step: 4,
        title: 'Approve Enrollment',
        description: 'Approve with digital signature.',
        details: [
          'PDF generation starts automatically',
          'Student can download final form',
          'Records are updated in system',
        ],
      },
    ],
    fee: [
      {
        step: 1,
        title: 'Login to Fee Office',
        description: 'Access the verification dashboard.',
      },
      {
        step: 2,
        title: 'View Pending Verifications',
        description: 'See all pending fee submissions.',
        details: [
          'Filter by date, amount, or student',
          'View uploaded voucher image',
          'Check student details',
        ],
      },
      {
        step: 3,
        title: 'Verify Payment',
        description: 'Check voucher authenticity.',
        details: [
          'Verify bank and voucher number',
          'Confirm payment amount',
          'Check payment date',
        ],
      },
      {
        step: 4,
        title: 'Approve or Reject',
        description: 'Update verification status.',
        details: [
          'Approve - student can proceed to form',
          'Reject - provide reason for rejection',
          'Bulk operations available',
        ],
      },
    ],
    admin: [
      {
        step: 1,
        title: 'System Overview',
        description: 'Monitor entire system from admin dashboard.',
        details: [
          'View statistics',
          'Monitor user activities',
          'Track system performance',
        ],
      },
      {
        step: 2,
        title: 'User Management',
        description: 'Create and manage all user accounts.',
        details: [
          'Add students, tutors, managers',
          'Manage department assignments',
          'Activate/deactivate accounts',
        ],
      },
      {
        step: 3,
        title: 'Department Management',
        description: 'Configure departments and degrees.',
        details: [
          'Add/edit departments',
          'Assign HOD and managers',
          'Manage degree programs',
        ],
      },
      {
        step: 4,
        title: 'Degree Scheme Setup',
        description: 'Create and manage study schemes.',
        details: [
          'Add subjects per semester',
          'Set credit hours',
          'Configure electives',
        ],
      },
    ],
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">User Guide</h1>
          <p className="mt-4 text-xl text-gray-500">
            Complete documentation for all system users
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Guide Content */}
        <div className="mt-8">
          <div className="space-y-6">
            {guides[activeTab].map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center">
                    <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {item.step}
                    </span>
                    <CardTitle className="ml-3">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                  {item.details && (
                    <ul className="mt-4 list-disc list-inside space-y-2">
                      {item.details.map((detail, i) => (
                        <li key={i} className="text-sm text-gray-500">{detail}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-900">Need more help?</h2>
          <p className="mt-2 text-blue-700">
            Contact our support team at support@enrollment.edu or visit the help desk in person.
          </p>
          <div className="mt-4">
            <Badge variant="info">FAQs</Badge>
            <Badge variant="info" className="ml-2">Video Tutorials</Badge>
            <Badge variant="info" className="ml-2">Download Manual</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}