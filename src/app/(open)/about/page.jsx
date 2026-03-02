import { 
  Target, 
  Shield, 
  BarChart3, 
  Zap, 
  Users, 
  Award,
  ArrowRight
} from 'lucide-react';
import Card from '@/components/ui/Card';

export const metadata = {
  title: "About Us | UAF Digital Enrollment Portal",
  description: "Learn about the University of Agriculture Faisalabad's modern digital enrollment system designed to streamline fee verification and course registration.",
};

export default function AboutPage() {
  const values = [
    {
      icon: Zap,
      title: "Efficiency",
      description: "Reduce paperwork and processing time by 80% through digital automation",
      color: "amber"
    },
    {
      icon: Shield,
      title: "Security",
      description: "Bank-grade encryption and secure data handling for all academic records",
      color: "emerald"
    },
    {
      icon: BarChart3,
      title: "Transparency",
      description: "Real-time status tracking and audit trails at every approval stage",
      color: "blue"
    }
  ];

  const stats = [
    { value: "10K+", label: "Students Enrolled", icon: Users },
    { value: "50+", label: "Departments", icon: Award },
    { value: "99.9%", label: "Uptime", icon: Zap },
  ];

  const colorClasses = {
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-5 dark:opacity-10" />
          <div className="relative text-center py-16 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Target className="w-4 h-4" />
              About Our Platform
            </div>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Modernizing Academic
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Enrollment
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A comprehensive digital solution transforming how universities manage student enrollments, 
              fee processing, and academic workflows.
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Mission & What We Do */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 border-l-4 border-l-blue-500">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Our Mission
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              To streamline the academic enrollment process through a secure, efficient, 
              and user-friendly digital platform that serves students, faculty, and 
              administrative staff. We eliminate paperwork bottlenecks and create 
              transparent, auditable workflows.
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Platform Capabilities</h2>
            <ul className="space-y-4">
              {[
                "Undergraduate (UG-1) and Postgraduate (GS-10) enrollment forms",
                "Digital fee submission with automated verification workflows",
                "Multi-stage approval with digital signatures",
                "Automated PDF generation for official records",
                "Real-time status tracking and notifications"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Values Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className={`p-8 text-center border-2 ${colorClasses[value.color]} hover:scale-105 transition-transform duration-300`}
              >
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-white dark:bg-slate-800 shadow-md`}>
                  <value.icon className={`w-8 h-8 ${colorClasses[value.color].split(' ')[2]}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-12 text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Join thousands of students and staff already using our platform for seamless enrollment management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                View Guide
              </button>
              <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold backdrop-blur-sm transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}