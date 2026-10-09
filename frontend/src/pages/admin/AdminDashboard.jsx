import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { developerRequestsAPI } from '../../api/developer_requests';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  GitPullRequest,
  Bug,
  Code,
  ShieldCheck,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load admin metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (requestId, status) => {
    try {
      await developerRequestsAPI.update(requestId, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to update request');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const stats = data?.stats || {};
  const recentProjects = data?.recent_projects || [];
  const pendingRequests = data?.pending_requests || [];

  const statCards = [
    { label: 'Total Clients', value: stats.total_clients || 0, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Total Developers', value: stats.total_developers || 0, icon: Code, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Projects', value: stats.total_projects || 0, icon: FolderKanban, color: 'text-purple-600 bg-purple-50' },
    { label: 'Active Projects', value: stats.active_projects || 0, icon: Clock, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Completed Projects', value: stats.completed_projects || 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'In Development', value: stats.in_development || 0, icon: Code, color: 'text-amber-600 bg-amber-50' },
    { label: 'In Testing', value: stats.in_testing || 0, icon: ShieldCheck, color: 'text-teal-600 bg-teal-50' },
    { label: 'In Deployment', value: stats.in_deployment || 0, icon: ArrowRight, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Open Bugs', value: stats.open_bugs || 0, icon: Bug, color: 'text-rose-600 bg-rose-50' },
    { label: 'Pending Requests', value: stats.pending_requests || 0, icon: GitPullRequest, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administrator Command Center</h1>
        <p className="text-sm text-gray-500">Comprehensive overview of the entire Tektalis Bridge platform</p>
      </div>

      {/* 10 Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
        {/* Pending Requests */}
        <Card
          title="Pending Developer Requests"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/developers')}>
              Manage Team <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No pending join requests.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingRequests.map((req) => (
                <div key={req.id || req.request_id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {req.request_id}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Project: {req.project_id}</p>
                    {req.message && <p className="text-xs text-gray-500 italic mt-0.5">"{req.message}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleReviewRequest(req.id || req.request_id, 'APPROVED')}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleReviewRequest(req.id || req.request_id, 'REJECTED')}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Projects */}
        <Card
          title="Recently Created Projects"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/projects')}>
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          {recentProjects.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No projects recorded yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentProjects.map((p) => (
                <div
                  key={p.id || p.project_id}
                  onClick={() => navigate(`/admin/projects/${p.id || p.project_id}`)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 px-2 rounded transition-colors"
                >
                  <div>
                    <span className="text-xs font-semibold text-indigo-600">{p.project_id}</span>
                    <h4 className="text-sm font-semibold text-gray-900">{p.title}</h4>
                    <span className="text-xs text-gray-500">
                      {p.assigned_developers?.length || 0} developers assigned
                    </span>
                  </div>
                  <StatusBadge status={p.current_stage} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
