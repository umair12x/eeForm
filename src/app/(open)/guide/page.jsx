// GuidePage - Enhanced with modern office design
'use client';

import { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  UserCog, 
  Banknote, 
  Shield,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  PlayCircle,
  Download,
  HelpCircle
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export const metadata = {
  title: "User Guide | UAF Digital Enrollment Portal",
  description: "Complete guide for students, tutors, managers, and administrators on using the enrollment portal.",
};

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState('student');
  const [completedSteps, setCompletedSteps] = useState({});

  const toggleStep = (tabId, stepIndex) => {
    const key = `${tabId}-${stepIndex}`;
    setCompletedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const tabs = [
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'blue', description: 'Enrollment process for students' },
    { id: 'tutor', label: 'Tutor', icon: Users, color: 'emerald', description: 'Form review and approval' },
    { id: 'manager', label: 'Manager', icon: UserCog, color: 'amber', description: 'Final authorization' },
    { id: 'fee', label: 'Fee Office', icon: Banknote, color: 'violet', description: 'Payment verification' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'rose', description: 'System management' },
  ];

  const guides = {
    student: [
      {
        step: 1,
        title: 'Account Access',
        description: 'Login using your university credentials to access the portal.',
        details: [
          'Use registration number provided by the university',
          'Default password is your CNIC/ID number',
          'Change password after first login for security',
         
        ],
        tip: 'Keep your login credentials secure and never share them.'
      },
      {
        step: 2,
        title: 'Fee Verification',
        description: 'Submit your fee voucher for digital verification.',
        details: [
          'Navigate to Fee Submission section',
          'Enter bank details and voucher number accurately',
          'Upload high-quality image of paid voucher',
          'Wait for Fee Office approval (usually 24-48 hours)'
        ],
        warning: 'Ensure voucher image is clear and all details are readable.'
      },
      {
        step: 3,
        title: 'Complete UG-1 Form',
        description: 'Fill out your enrollment form with academic details.',
        details: [
          'Select correct department and degree program',
          'Choose current semester and section',
          'Select subjects (maximum 24 credit hours allowed)',
          'Assign your academic tutor from the list',
          'Review all information before submission'
        ],
        tip: 'Double-check subject codes to avoid registration errors.'
      },
      {
        step: 4,
        title: 'Track Approval Status',
        description: 'Monitor your form through the approval workflow.',
        details: [
          'Pending Tutor Review',
          'Tutor Signed - Awaiting Manager',
          'Manager Approved',
          'Final PDF Generated - Ready for Download'
        ]
      },
      {
        step: 5,
        title: 'Download & Print',
        description: 'Get your official enrollment form copies.',
        details: [
          'Download PDF with digital signatures',
          'Print four copies for distribution',
          'Submit to Advisor, Controller, and Director offices',
          'Keep student copy for your records'
        ]
      }
    ],
    tutor: [
      {
        step: 1,
        title: 'Portal Login',
        description: 'Access tutor dashboard with your email credentials.',
        details: ['Secure login with university email', 'Dashboard shows assigned students']
      },
      {
        step: 2,
        title: 'Review Pending Forms',
        description: 'View all forms awaiting your signature.',
        details: ['Filter by submission date', 'Search by student name or ID', 'Bulk review options available']
      },
      {
        step: 3,
        title: 'Verify Student Details',
        description: 'Check academic information and subject selection.',
        details: ['Verify student eligibility', 'Check credit hour limits', 'Confirm prerequisite completion']
      },
      {
        step: 4,
        title: 'Digital Signature',
        description: 'Approve or reject with electronic signature.',
        details: ['Use signature pad for digital sign', 'Add remarks if necessary', 'Provide rejection reason if declining']
      }
    ],
    manager: [
      {
        step: 1,
        title: 'Department Dashboard',
        description: 'Access your department management interface.',
        details: ['View all pending approvals', 'Department-specific filters', 'Statistics and reports']
      },
      {
        step: 2,
        title: 'Final Review',
        description: 'Conduct comprehensive form verification.',
        details: ['Verify tutor signature presence', 'Check fee payment status', 'Confirm student standing']
      },
      {
        step: 3,
        title: 'Authorization',
        description: 'Provide final approval with digital signature.',
        details: ['Electronic signature required', 'Auto-generates official PDF', 'Updates student status immediately']
      }
    ],
    fee: [
      {
        step: 1,
        title: 'Verification Dashboard',
        description: 'Access all pending fee submissions.',
        details: ['Queue of pending verifications', 'Filter by date or amount', 'Bulk verification tools']
      },
      {
        step: 2,
        title: 'Voucher Validation',
        description: 'Verify bank voucher authenticity.',
        details: ['Cross-check with bank records', 'Verify amount and date', 'Confirm student details match']
      },
      {
        step: 3,
        title: 'Status Update',
        description: 'Approve or reject fee submissions.',
        details: ['Approve to unlock form submission', 'Reject with detailed reason', 'Bulk operations for efficiency']
      }
    ],
    admin: [
      {
        step: 1,
        title: 'System Overview',
        description: 'Monitor entire platform from admin console.',
        details: ['Real-time statistics', 'User activity logs', 'System health monitoring']
      },
      {
        step: 2,
        title: 'User Management',
        description: 'Create and manage all system accounts.',
        details: ['Add students, tutors, managers', 'Role assignment and permissions', 'Account activation/deactivation']
      },
      {
        step: 3,
        title: 'Academic Structure',
        description: 'Configure departments and programs.',
        details: ['Manage department list', 'Assign HODs and managers', 'Configure degree programs']
      },
      {
        step: 4,
        title: 'Curriculum Setup',
        description: 'Define subjects and study schemes.',
        details: ['Add subjects per semester', 'Set credit hours and prerequisites', 'Manage elective options']
      }
    ]
  };

  const colorSchemes = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800', badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' }
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const currentColors = colorSchemes[currentTab.color];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentColors.badge} text-sm font-medium mb-6 transition-colors duration-300`}>
            <currentTab.icon className="w-4 h-4" />
            User Documentation
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Platform Guide
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Step-by-step instructions for all users of the enrollment system.
          </p>
        </div>

        {/* Modern Tab Navigation */}
        <div className="mb-12">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const colors = colorSchemes[tab.color];
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300
                      ${isActive 
                        ? `${colors.bg} ${colors.text} shadow-sm` 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }
                    `}
                  >
                    <tab.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                    <div className="text-center">
                      <span className="block text-sm font-semibold">{tab.label}</span>
                      <span className="hidden sm:block text-[10px] opacity-80 mt-0.5">{tab.description}</span>
                    </div>
                    {isActive && (
                      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${currentColors.bg} ${currentColors.text} flex items-center justify-center`}>
              <currentTab.icon className="w-5 h-5" />
            </div>
            {currentTab.label} Guide
          </h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Watch Video</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>

        {/* Guide Steps */}
        <div className="space-y-6">
          {guides[activeTab].map((item, index) => {
            const isCompleted = completedSteps[`${activeTab}-${index}`];
            
            return (
              <Card 
                key={index} 
                className={`overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-75' : ''} ${currentColors.border} border-l-4`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Step Number / Checkbox */}
                    <button
                      onClick={() => toggleStep(activeTab, index)}
                      className={`
                        flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200
                        ${isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : `${currentColors.bg} ${currentColors.text}`
                        }
                      `}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : item.step}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`text-lg font-bold mb-1 ${isCompleted ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                            {item.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isCompleted ? 'rotate-90' : ''}`} />
                      </div>

                      {/* Details */}
                      {item.details && (
                        <ul className="mt-4 space-y-2">
                          {item.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                              <div className={`w-1.5 h-1.5 rounded-full mt-2 ${currentColors.bg.replace('bg-', 'bg-').replace('/20', '')} ${currentColors.text}`} />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Alerts */}
                      {item.tip && (
                        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm">
                          <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{item.tip}</span>
                        </div>
                      )}
                      {item.warning && (
                        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{item.warning}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Help Footer */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 text-center">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Our support team is available to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
              Contact Support
            </button>
            <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors">
              View FAQs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}