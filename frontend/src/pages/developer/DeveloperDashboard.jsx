import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectsAPI } from '../../api/projects';
import { developerRequestsAPI } from '../../api/developer_requests';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  GitPullRequest,
  ListTodo,
  Bug,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    active: 0,
    completed: 0,
    pendingRequests: 0,
    openTasks: 0,
    openBugs: 0,
    unreadMessages: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projRes, reqRes] = await Promise.all([
        projectsAPI.list(),
        developerRequestsAPI.list()
      ]);

      const projects = projRes.data || [];
      const requests = reqRes.data || [];

      const assigned = projects.length;
      const active = projects.filter((p) => p.status === 'ACTIVE').length;
      const completed = projects.filter((p) => p.status === 'COMPLETED').length;
      const pending = requests.filter((r) => r.status === 'PENDING').length;

      setStats({
        assigned,
        active,
        completed,
        pendingRequests: pending,
        openTasks: 3, // Initialized
        openBugs: 1,
        unreadMessages: 0
      });
      setRecentProjects(projects.slice(0, 4));
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const statCards = [
    { label: 'Assigned Projects', value: stats.assigned, icon: FolderKanban, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Active Projects', value: stats.active, icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { label: 'Completed Projects', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: GitPullRequest, color: 'text-amber-600 bg-amber-50' },
    { label: 'Open Tasks', value: stats.openTasks, icon: ListTodo, color: 'text-purple-600 bg-purple-50' },
    { label: 'Open Bugs', value: stats.openBugs, icon: Bug, color: 'text-rose-600 bg-rose-50' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: MessageSquare, color: 'text-cyan-600 bg-cyan-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Developer Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.full_name || 'Developer'}! Here is your development summary.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Assigned Projects"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/developer/projects/live')}>
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          {recentProjects.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              You are not currently assigned to any projects.
              <div className="mt-3">
                <Button size="sm" onClick={() => navigate('/developer/projects/available')}>
                  Browse Available Projects
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((p) => (
                <div
                  key={p.id || p.project_id}
                  onClick={() => navigate(`/developer/projects/${p.id || p.project_id}`)}
                  className="p-3 border border-gray-100 hover:border-gray-200 rounded-lg cursor-pointer transition-colors bg-gray-50/50"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-gray-900">{p.title}</span>
                    <StatusBadge status={p.current_stage} />
                  </div>
                  <ProgressBar progress={p.progress_percentage || 0} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Quick Actions & Organization">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => navigate('/developer/projects/available')}
              className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition-colors"
            >
              <FolderKanban className="w-6 h-6 text-indigo-600 mb-2" />
              <h4 className="font-semibold text-sm text-gray-900">Explore Projects</h4>
              <p className="text-xs text-gray-500 mt-1">Discover new projects and request assignments</p>
            </div>

            <div
              onClick={() => navigate('/developer/chat')}
              className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition-colors"
            >
              <MessageSquare className="w-6 h-6 text-indigo-600 mb-2" />
              <h4 className="font-semibold text-sm text-gray-900">Organization Chat</h4>
              <p className="text-xs text-gray-500 mt-1">Collaborate with fellow developers across company</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
