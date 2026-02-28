'use client';

import Card from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">About Us</h1>
          <p className="mt-4 text-xl text-gray-500">
            Modernizing academic enrollment through technology
          </p>
        </div>

        <div className="mt-12">
          <Card className="prose prose-blue max-w-none">
            <h2>Our Mission</h2>
            <p>
              To streamline the academic enrollment process through a secure, efficient, 
              and user-friendly digital platform that serves students, faculty, and 
              administrative staff.
            </p>

            <h2>What We Do</h2>
            <p>
              The Online Enrollment System provides a complete solution for managing 
              student enrollments, fee verifications, and form approvals. Our platform 
              supports:
            </p>
            <ul>
              <li>Undergraduate (UG-1) and Postgraduate (GS-10) enrollment forms</li>
              <li>Digital fee submission and verification</li>
              <li>Multi-stage approval workflow with tutors and department managers</li>
              <li>Automated PDF generation for official records</li>
              <li>Real-time status tracking for students</li>
            </ul>

            <h2>Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold">Efficiency</h3>
                <p className="text-sm text-gray-600">Reduce paperwork and processing time</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-semibold">Security</h3>
                <p className="text-sm text-gray-600">Secure data handling and verification</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold">Transparency</h3>
                <p className="text-sm text-gray-600">Clear status tracking at every step</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}