import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../api/projects';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Plus, FolderKanban, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.list();
      setProjects(res.data || []);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.project_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStage = selectedStage === 'ALL' || p.current_stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Projects</h1>
          <p className="text-sm text-gray-500">Track and manage all your active software projects</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/client/projects/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search projects by title or ID..."
          />
        </div>
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          aria-label="Filter by stage"
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All Stages</option>
          <option value="DRAFT">Draft</option>
          <option value="REQUIREMENT_ANALYSIS">Requirement Analysis</option>
          <option value="PLANNING">Planning</option>
          <option value="DEVELOPMENT">Development</option>
          <option value="TESTING">Testing</option>
          <option value="DEPLOYMENT">Deployment</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          message={search ? 'No projects match your filter criteria.' : "You haven't created any projects yet."}
          action={!search ? { label: 'Create Project', onClick: () => navigate('/client/projects/new') } : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id || project.project_id}
              className="hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
              onClick={() => navigate(`/client/projects/${project.id || project.project_id}`)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {project.project_id}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1 line-clamp-1">{project.title}</h3>
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
                  <span>{project.assigned_developers?.length || 0} Developers</span>
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

export default ClientProjects;
