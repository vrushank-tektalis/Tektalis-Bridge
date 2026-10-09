import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../api/projects';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FolderKanban, Users, Calendar, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LiveProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveProjects();
  }, []);

  const fetchLiveProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.list();
      setProjects(res.data || []);
    } catch (err) {
      toast.error('Failed to load active projects');
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
        <h1 className="text-2xl font-bold text-gray-900">My Live Projects</h1>
        <p className="text-sm text-gray-500">All ongoing software projects you are actively contributing to</p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No live projects assigned"
          message="You are not currently assigned to any active projects."
          action={{
            label: 'Browse Available Projects',
            onClick: () => navigate('/developer/projects/available')
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id || project.project_id}
              className="hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
              onClick={() => navigate(`/developer/projects/${project.id || project.project_id}`)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {project.project_id}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1">{project.title}</h3>
                  </div>
                  <StatusBadge status={project.current_stage} />
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{Math.round(project.progress_percentage || 0)}%</span>
                  </div>
                  <ProgressBar progress={project.progress_percentage || 0} />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{project.assigned_developers?.length || 0} Devs</span>
                </div>
                {project.expected_completion_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(project.expected_completion_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveProjects;
