'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudentLayout({ children }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/student' },
    { name: 'Fee Submission', href: '/student/fee' },
    { name: 'UG-1 Form', href: '/student/form/ug1' },
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-blue-600">
            <h2 className="text-sm font-medium text-white">Student Portal</h2>
          </div>
          <nav className="p-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    block px-4 py-2 rounded-md text-sm mb-1
                    ${isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}