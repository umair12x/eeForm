// ContactPage - Enhanced with modern office design
'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle2,
  MessageSquare,
  Building2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: Building2,
      title: "Office Location",
      content: "Main Campus, University Office",
      subContent: "City, State 12345",
      color: "blue"
    },
    {
      icon: Mail,
      title: "Email",
      content: "support@enrollment.edu",
      subContent: "admissions@enrollment.edu",
      color: "emerald"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+1 (555) 123-4567",
      subContent: "Support: +1 (555) 987-6543",
      color: "violet"
    },
    {
      icon: Clock,
      title: "Office Hours",
      content: "Mon - Fri: 8:00 AM - 5:00 PM",
      subContent: "Sat: 9:00 AM - 1:00 PM",
      color: "amber"
    }
  ];

  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Have questions about the enrollment system? Our dedicated support team is here to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Information - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {contactInfo.map((info, index) => (
                <Card 
                  key={index} 
                  className="p-6 hover:shadow-lg transition-all duration-300 group border-l-4 border-l-transparent hover:border-l-current dark:hover:border-l-current"
                  style={{ borderLeftColor: 'inherit' }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${colorClasses[info.color]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <info.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {info.title}
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {info.content}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {info.subContent}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Support Card */}
            <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
              <h3 className="font-bold text-lg mb-2">Emergency Support</h3>
              <p className="text-blue-100 mb-4 text-sm">
                For urgent enrollment issues during peak periods, use our priority hotline.
              </p>
              <div className="flex items-center gap-3 text-lg font-bold">
                <Phone className="w-5 h-5" />
                +1 (555) 999-HELP
              </div>
            </Card>
          </div>

          {/* Contact Form - Right Side */}
          <div className="lg:col-span-3">
            <Card className="p-8 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Send className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Send us a Message
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    We'll respond within 24 hours
                  </p>
                </div>
              </div>

              {submitted && (
                <Alert 
                  type="success" 
                  className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                  onClose={() => setSubmitted(false)}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Thank you! Your message has been sent successfully.</span>
                  </div>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative">
                    <Input
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`transition-all duration-200 ${focusedField === 'name' ? 'ring-2 ring-blue-500/20' : ''}`}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`transition-all duration-200 ${focusedField === 'email' ? 'ring-2 ring-blue-500/20' : ''}`}
                    />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`transition-all duration-200 ${focusedField === 'subject' ? 'ring-2 ring-blue-500/20' : ''}`}
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="Describe your issue or question in detail..."
                    className={`w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none`}
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl transition-all duration-300"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 