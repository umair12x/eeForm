"use client";
import Logo from "@/components/Logo";
import { FaUpload, FaUserGraduate, FaFileInvoice, FaShieldAlt, FaMobileAlt, FaClock } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  const procedureInfo = [
    {
      id: 1,
      icon: <FaUserGraduate className="text-4xl" />,
      title: "Student Login",
      text: "Access your academic profile with secure authentication",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      id: 2,
      icon: <FaFileInvoice className="text-4xl" />,
      title: "Fee Processing",
      text: "Generate and verify fee vouchers through secure channels",
      color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    },
    {
      id: 3,
      icon: <FaUpload className="text-4xl" />,
      title: "Document Submission",
      text: "Upload verified documents for enrollment processing",
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
    },
    {
      id: 4,
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Verification",
      text: "Secure verification by university administration",
      color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
    }
  ];

  const features = [
    {
      title: "Mobile Responsive",
      desc: "Access from any device with optimized experience",
      icon: <FaMobileAlt />
    },
    {
      title: "24/7 Access",
      desc: "Submit forms anytime with automated processing",
      icon: <FaClock />
    },
    {
      title: "Secure & Encrypted",
      desc: "Bank-level security for all your data",
      icon: <FaShieldAlt />
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 dark:from-blue-900/20 dark:to-emerald-900/20" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              University of Agriculture
              <span className="block text-blue-700 dark:text-blue-400 mt-2">Digital Enrollment Portal</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Streamlined digital enrollment system for undergraduate and postgraduate programs.
              Secure, efficient, and paperless processing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/student/fee"
                className="inline-flex items-center justify-center px-8 py-3.5 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Start Fee Verification
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              <Link
                href="/guide"
                className="inline-flex items-center justify-center px-8 py-3.5 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl shadow hover:shadow-md transition-all duration-300"
              >
                View Guidelines
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              ENROLLMENT PROCESS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple 4-Step Enrollment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Complete your enrollment with our streamlined digital process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {procedureInfo.map((item) => (
              <div 
                key={item.id} 
                className={`${item.color} p-6 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white dark:bg-gray-800 mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.text}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Step {item.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">5,000+</div>
              <div className="text-gray-600 dark:text-gray-400">Active Students</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">24h</div>
              <div className="text-gray-600 dark:text-gray-400">Verification Time</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-400">Secure Process</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">Online</div>
              <div className="text-gray-600 dark:text-gray-400">Paperless System</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Why Choose Our Digital Portal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Begin Your Enrollment?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have streamlined their enrollment process
          </p>
          <Link
            href="/student/fee"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-gray-100 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Verification Now
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}