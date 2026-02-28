'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ navigation, role = 'admin' }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const roleColors = {
    admin: 'bg-blue-600',
    student: 'bg-green-600',
    'fee-office': 'bg-yellow-600',
    tutor: 'bg-purple-600',
    manager: 'bg-orange-600',
    'dg-office': 'bg-red-600',
  };

  const roleTitles = {
    admin: 'Admin Panel',
    student: 'Student Portal',
    'fee-office': 'Fee Office',
    tutor: 'Tutor Portal',
    manager: 'Manager Portal',
    'dg-office': 'DG Office',
  };

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex-shrink-0`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
        {/* Header */}
        <div className={`px-4 py-3 ${roleColors[role] || 'bg-gray-600'} flex items-center justify-between`}>
          {!collapsed && (
            <h2 className="text-sm font-medium text-white">{roleTitles[role]}</h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon || DefaultIcon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center ${collapsed ? 'justify-center' : 'justify-start'} 
                  px-4 py-2 rounded-md text-sm mb-1
                  ${isActive
                    ? `bg-${roleColors[role].replace('bg-', '')}-50 text-${roleColors[role].replace('bg-', '')}-700`
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info (collapsed) */}
        {collapsed && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">U</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Default icon component
const DefaultIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);