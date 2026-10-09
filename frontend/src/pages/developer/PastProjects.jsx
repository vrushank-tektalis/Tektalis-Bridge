import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../api/projects';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Archive, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DeveloperPastProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastProjects();
  }, []);

  const fetchPastProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.list();
      const past = (res.data || []).filter(
        (p) => p.status === 'COMPLETED' || p.current_stage === 'COMPLETED' || p.status === 'ARCHIVED'
      );
      setProjects(past);
    } catch (err) {
      toast.error('Failed to load past projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Past Projects & Deliveries</h1>
        <p className="text-sm text-gray-500">History of completed software projects you contributed to</p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No completed projects"
          message="You don't have any completed projects in your history yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Card
              key={p.id || p.project_id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/developer/projects/${p.id || p.project_id}`)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Delivered: {p.actual_completion_date ? new Date(p.actual_completion_date).toLocaleDateString() : 'Finished'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeveloperPastProjects;
