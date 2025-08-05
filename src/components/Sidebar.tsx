import React from 'react';
import { BarChart3 } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  return (
    <div className={`bg-blue-600 text-white lg:w-64 w-20 min-h-screen p-4 transition-all duration-300 ease-in-out ${className}`}>
      <div className="flex items-center mb-8">
        <img src="assets/logo.png" alt="Dumroo.ai Logo" className="w-full h-auto max-w-[180px] object-contain" />
      </div>
      
      <nav className="overflow-hidden">
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className="flex items-center p-3 rounded-lg bg-yellow-500 text-blue-800 font-medium"
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              <span className="lg:block hidden">User Analytics</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};