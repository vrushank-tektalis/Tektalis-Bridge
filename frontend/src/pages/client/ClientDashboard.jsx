import React from 'react';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Activity, CheckCircle, Clock } from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Projects', value: '12', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Active Projects', value: '4', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'In Review', value: '2', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Completed', value: '6', icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your projects today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.name} className="flex items-center p-4">
            <div className={`p-3 rounded-lg ${item.bg}`}>
              <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Recent Projects">
          <div className="text-center py-10">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent projects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
            <div className="mt-6">
              <a href="/client/projects/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                New Project
              </a>
            </div>
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="flex flex-col justify-center items-center py-10 text-gray-500 text-sm">
            <Activity className="h-8 w-8 mb-3 text-gray-400" />
            No recent activity to show
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
