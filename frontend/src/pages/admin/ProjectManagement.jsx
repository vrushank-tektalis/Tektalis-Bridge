import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../api/projects';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FolderKanban, Edit, Archive, Eye, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const STAGES = [
  'DRAFT',
  'REQUIREMENT_ANALYSIS',
  'PLANNING',
  'DEVELOPMENT',
  'CODE_REVIEW',
  'TESTING',
  'BUG_FIXING',
  'UAT',
  'DEPLOYMENT',
  'PRODUCTION',
  'MAINTENANCE',
  'COMPLETED'
];

const ProjectManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');

  // Change Stage Modal
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newStage, setNewStage] = useState('');
  const [newProgress, setNewProgress] = useState(0);

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

  const handleOpenStageModal = (project) => {
    setSelectedProject(project);
    setNewStage(project.current_stage);
    setNewProgress(project.progress_percentage || 0);
    setIsStageModalOpen(true);
  };

  const handleUpdateStage = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await projectsAPI.changeStage(selectedProject.id || selectedProject.project_id, {
        stage: newStage,
        progress_percentage: Number(newProgress)
      });
      toast.success('Project stage and progress updated');
      setIsStageModalOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  const handleArchiveProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to archive this project?')) return;
    try {
      await projectsAPI.delete(projectId);
      toast.success('Project archived successfully');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to archive project');
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.project_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStage = selectedStage === 'ALL' || p.current_stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Master Directory</h1>
          <p className="text-sm text-gray-500">Manage all platform client projects, stages, and allocations</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by project name or ID..."
          />
        </div>
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          aria-label="Filter by project stage"
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500"
        >
          <option value="ALL">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Project ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Devs</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => (
                <tr key={project.id || project.project_id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold text-indigo-600">{project.project_id}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900">{project.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.current_stage} />
                  </td>
                  <td className="px-4 py-3 w-36">
                    <div className="flex items-center gap-2">
                      <ProgressBar progress={project.progress_percentage || 0} />
                      <span className="text-xs text-gray-500">{Math.round(project.progress_percentage || 0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{project.assigned_developers?.length || 0}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/admin/projects/${project.id || project.project_id}`)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleOpenStageModal(project)}>
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Stage
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleArchiveProject(project.id || project.project_id)}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stage Change Modal */}
      {isStageModalOpen && (
        <Modal
          isOpen={isStageModalOpen}
          onClose={() => setIsStageModalOpen(false)}
          title={`Update Stage: ${selectedProject?.title}`}
        >
          <form onSubmit={handleUpdateStage} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Project Stage</label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full text-sm rounded border border-gray-300 px-3 py-2 bg-white"
              >
                {STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Progress Percentage ({newProgress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setIsStageModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Stage & Progress
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectManagement;
