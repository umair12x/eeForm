"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Upload,
  FileCheck,
  Shield,
  Smartphone,
  Clock,
  ArrowRight,
  CheckCircle2,
  Play,
  Users,
  Zap,
  Lock,
  ChevronRight,
  Building2,
  BookOpen,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-advance steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const procedureSteps = [
    {
      id: 1,
      icon: GraduationCap,
      title: "Secure Login",
      description:
        "Access your academic profile with institutional authentication",
      details: [
        "Student ID verification",
        "Secure password protection",
        "Role-based access control",
      ],
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      icon: FileCheck,
      title: "Fee Processing",
      description:
        "Generate, pay, and verify fees through secure banking channels",
      details: [
        "Online voucher generation",
        "Multiple payment options",
        "Automatic verification",
      ],
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: 3,
      icon: Upload,
      title: "Document Upload",
      description: "Submit enrollment forms with digital signature capture",
      details: [
        "UG-1/GS-10 forms",
        "Digital signature pad",
        "Real-time validation",
      ],
      color: "violet",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      id: 4,
      icon: Shield,
      title: "Approval Workflow",
      description: "Multi-stage verification by tutors and administrators",
      details: [
        "Tutor review & sign",
        "Manager authorization",
        "PDF generation",
      ],
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const features = [
    {
      icon: Smartphone,
      title: "Responsive Design",
      description:
        "Seamless experience across desktop, tablet, and mobile devices",
      stat: "99.9%",
      statLabel: "Uptime",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description:
        "Submit applications anytime with automated queue processing",
      stat: "2min",
      statLabel: "Avg. Load Time",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "AES-256 encryption with multi-factor authentication",
      stat: "100%",
      statLabel: "Secure",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Instant notifications at every approval stage",
      stat: "50ms",
      statLabel: "Response",
    },
  ];

  const stats = [
    { value: "15K+", label: "Active Students", icon: Users, color: "blue" },
    {
      value: "98%",
      label: "Satisfaction Rate",
      icon: CheckCircle2,
      color: "emerald",
    },
    { value: "24h", label: "Processing Time", icon: Clock, color: "violet" },
    { value: "0", label: "Paper Waste", icon: Building2, color: "amber" },
  ];

  const colorMap = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      glow: "shadow-blue-200 dark:shadow-blue-900/30",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      glow: "shadow-emerald-200 dark:shadow-emerald-900/30",
    },
    violet: {
      bg: "bg-violet-50 dark:bg-violet-900/20",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-200 dark:border-violet-800",
      glow: "shadow-violet-200 dark:shadow-violet-900/30",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      glow: "shadow-amber-200 dark:shadow-amber-900/30",
    },
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-18   overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent dark:from-blue-900/10 dark:to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>Now Open for {currentYear} Enrollment</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                University of Agriculture
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 mt-2">
                  Digital Enrollment
                </span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg">
                Experience the future of academic enrollment. Secure, paperless,
                and efficient processing for all undergraduate and postgraduate
                programs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/student/fee"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-2xl hover:shadow-blue-300 dark:hover:shadow-blue-900/50 transition-all duration-300 hover:-translate-y-1"
                >
                  Start Enrollment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Interactive Steps Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-3xl transform rotate-3" />
              <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-slate-900/50 p-8 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Enrollment Process
                  </h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Step {activeStep + 1} of 4
                  </span>
                </div>

                <div className="space-y-4">
                  {procedureSteps.map((step, index) => {
                    const isActive = index === activeStep;
                    const isPast = index < activeStep;
                    const colors = colorMap[step.color];

                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 cursor-pointer ${
                          isActive
                            ? `${colors.bg} ${colors.border} border shadow-md`
                            : isPast
                              ? "opacity-50"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                        onClick={() => setActiveStep(index)}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? `bg-gradient-to-br ${step.gradient} text-white shadow-lg`
                              : isPast
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {isPast ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <step.icon className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-semibold ${isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
                          >
                            {step.title}
                          </h4>
                          {isActive && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 animate-in fade-in slide-in-from-top-1">
                              {step.description}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <ChevronRight className="w-5 h-5 text-slate-400 animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-2">
                    {procedureSteps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === activeStep
                            ? "w-8 bg-blue-600 dark:bg-blue-400"
                            : "w-2 bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const colors = colorMap[stat.color];
              return (
                <div key={index} className="text-center group">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Process Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              How It Works
            </span>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Streamlined 4-Step Process
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From login to final approval, experience a seamless digital
              journey designed for efficiency.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {procedureSteps.map((step, index) => {
              const colors = colorMap[step.color];
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.id}
                  className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-transparent dark:hover:border-transparent hover:shadow-2xl transition-all duration-500 ${colors.glow} overflow-hidden`}
                >
                  {/* Gradient Background on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  <div className="relative flex gap-6">
                    <div
                      className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      <step.icon className="w-8 h-8" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}
                        >
                          STEP {step.id}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${step.gradient} transition-all duration-300">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        {step.description}
                      </p>

                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500"
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${colors.text.replace("text-", "bg-")}`}
                            />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Enterprise-Grade Platform
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Built for scale, security, and seamless user experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {feature.description}
                </p>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {feature.stat}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500 ml-2">
                    {feature.statLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6 backdrop-blur-sm">
            <HelpCircle className="w-4 h-4" />
            <span>Need Assistance?</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Enrollment?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of students who have streamlined their academic
            journey through our digital portal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/student/fee"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-slate-900 bg-white rounded-2xl hover:bg-slate-100 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:-translate-y-1"
            >
              Begin Enrollment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
