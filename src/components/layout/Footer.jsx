import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              About
            </h3>
            <p className="mt-4 text-sm text-gray-500">
              Online Enrollment System for undergraduate and postgraduate programs. 
              Streamlining the admission and enrollment process.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-gray-500 hover:text-gray-900">
                  User Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              For Students
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">
                  Student Login
                </Link>
              </li>
              <li>
                <Link href="/student/fee" className="text-sm text-gray-500 hover:text-gray-900">
                  Fee Submission
                </Link>
              </li>
              <li>
                <Link href="/student/form/ug1" className="text-sm text-gray-500 hover:text-gray-900">
                  UG-1 Form
                </Link>
              </li>
              <li>
                <Link href="/guide#student" className="text-sm text-gray-500 hover:text-gray-900">
                  Student Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-gray-500">
                <span className="font-medium">Email:</span> support@enrollment.edu
              </li>
              <li className="text-sm text-gray-500">
                <span className="font-medium">Phone:</span> +1 (555) 123-4567
              </li>
              <li className="text-sm text-gray-500">
                <span className="font-medium">Hours:</span> Mon-Fri 8:00 AM - 5:00 PM
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 text-center">
            © {currentYear} Online Enrollment System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}