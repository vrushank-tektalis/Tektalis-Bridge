import React, { useState, useEffect } from 'react';
import { developerRequestsAPI } from '../../api/developer_requests';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { GitPullRequest, X, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await developerRequestsAPI.list();
      setRequests(res.data || []);
    } catch (err) {
      toast.error('Failed to load project requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await developerRequestsAPI.update(requestId, { status: 'CANCELLED' });
      toast.success('Request cancelled');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to cancel request');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Project Join Requests</h1>
        <p className="text-sm text-gray-500">Track the status of your applications to join project teams</p>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={GitPullRequest}
          title="No requests submitted"
          message="You haven't requested to join any projects yet."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id || req.request_id} className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {req.request_id}
                  </span>
                  <StatusBadge status={req.status} />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Project ID: {req.project_id}</h4>
                {req.message && <p className="text-xs text-gray-600 italic">"{req.message}"</p>}
                <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Submitted: {new Date(req.created_at).toLocaleDateString()}
                </div>
              </div>

              {req.status === 'PENDING' && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleCancelRequest(req.id || req.request_id)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectRequests;
