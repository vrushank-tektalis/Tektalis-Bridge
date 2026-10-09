import React from 'react';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';

const TopNav = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              <span className="text-xs text-gray-500">{user?.role}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {getInitials(user?.name)}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
