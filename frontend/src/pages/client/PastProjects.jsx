import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../api/projects';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Archive, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PastProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const fetchCompletedProjects = async () => {
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

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Past & Completed Projects</h1>
        <p className="text-sm text-gray-500">History of your successfully delivered and archived projects</p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No past projects"
          message="You have no completed or archived projects at this time."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id || project.project_id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/client/projects/${project.id || project.project_id}`)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                  <StatusBadge status={project.status} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Finished: {project.actual_completion_date ? new Date(project.actual_completion_date).toLocaleDateString() : 'Delivered'}
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

export default PastProjects;
