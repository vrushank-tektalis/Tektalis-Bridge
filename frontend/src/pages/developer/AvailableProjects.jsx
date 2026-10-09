import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../api/projects';
import { developerRequestsAPI } from '../../api/developer_requests';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FolderKanban, Users, Code, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AvailableProjects = () => {
  const [projects, setProjects] = useState([]);
  const [existingRequests, setExistingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, reqRes] = await Promise.all([
        projectsAPI.listAvailable(),
        developerRequestsAPI.list()
      ]);
      setProjects(projRes.data || []);
      setExistingRequests(reqRes.data || []);
    } catch (err) {
      toast.error('Failed to load available projects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project) => {
    setSelectedProject(project);
    setRequestMessage('');
  };

  const handleSubmitRequest = async () => {
    if (!selectedProject) return;
    try {
      setIsSubmitting(true);
      await developerRequestsAPI.create(selectedProject.id || selectedProject.project_id, {
        message: requestMessage
      });
      toast.success('Join request sent to administrator for review!');
      setSelectedProject(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRequested = (projectId) => {
    return existingRequests.some(
      (r) => r.project_id === projectId && (r.status === 'PENDING' || r.status === 'APPROVED')
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Available Projects</h1>
        <p className="text-sm text-gray-500">
          Browse projects open for developer staffing and request to join the team
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No open projects available"
          message="There are currently no projects actively recruiting developers."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const requested = hasRequested(p.id || p.project_id);
            return (
              <Card key={p.id || p.project_id} className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {p.project_id}
                    </span>
                    <StatusBadge status={p.current_stage} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{p.description}</p>

                  {p.requirements && (
                    <div className="pt-2">
                      <span className="text-xs font-medium text-gray-500">Tech Stack:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.requirements.frontend_technologies?.slice(0, 2).map((t, i) => (
                          <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                        {p.requirements.backend_technologies?.slice(0, 2).map((t, i) => (
                          <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {p.assigned_developers?.length || 0} Devs Assigned
                  </span>

                  {requested ? (
                    <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Request Pending
                    </span>
                  ) : (
                    <Button size="sm" variant="primary" onClick={() => handleOpenModal(p)}>
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Request to Join
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={`Join ${selectedProject.title}`}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelectedProject(null)}>
                Cancel
              </Button>
              <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmitRequest}>
                Submit Request
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Submit your request to work on this project. The project admin will review your skills and availability.
            </p>
            <Textarea
              label="Note to Admin (Optional)"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Highlight relevant experience, tech stack familiarity, or schedule..."
              rows={4}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AvailableProjects;
