import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { classNames } from '../../utils/helpers';
import { 
  LayoutDashboard, 
  FolderOpen, 
  PlusCircle, 
  History, 
  Bell, 
  User, 
  Users, 
  MessageSquare,
  Briefcase,
  BarChart3
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();

  const clientLinks = [
    { name: 'Dashboard', to: '/client/dashboard', icon: LayoutDashboard },
    { name: 'Live Projects', to: '/client/projects', icon: FolderOpen },
    { name: 'Add New Project', to: '/client/projects/new', icon: PlusCircle },
    { name: 'Past Projects', to: '/client/projects/past', icon: History },
    { name: 'Notifications', to: '/client/notifications', icon: Bell },
  ];

  const developerLinks = [
    { name: 'Dashboard', to: '/developer/dashboard', icon: LayoutDashboard },
    { name: 'Available Projects', to: '/developer/projects/available', icon: Briefcase },
    { name: 'Live Projects', to: '/developer/projects/live', icon: FolderOpen },
    { name: 'Project Requests', to: '/developer/requests', icon: User },
    { name: 'Organization Chat', to: '/developer/chat', icon: MessageSquare },
    { name: 'Past Projects', to: '/developer/projects/past', icon: History },
    { name: 'Notifications', to: '/developer/notifications', icon: Bell },
  ];

  const adminLinks = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Clients', to: '/admin/clients', icon: Users },
    { name: 'Developers', to: '/admin/developers', icon: Users },
    { name: 'Projects', to: '/admin/projects', icon: FolderOpen },
    { name: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { name: 'Notifications', to: '/admin/notifications', icon: Bell },
  ];

  let links = [];
  if (user?.role === 'CLIENT') links = clientLinks;
  else if (user?.role === 'DEVELOPER') links = developerLinks;
  else if (user?.role === 'ADMIN') links = adminLinks;

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
        <span className="text-xl font-bold text-white tracking-tight">Tektalis Bridge</span>
        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
          <span className="sr-only">Close sidebar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {links.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              classNames(
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
              )
            }
          >
            <item.icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
