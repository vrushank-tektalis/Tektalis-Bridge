import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../api/projects';
import { developersAPI } from '../../api/developers';
import { tasksAPI } from '../../api/tasks';
import { bugsAPI } from '../../api/bugs';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import ChatRoom from '../../components/chat/ChatRoom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  History,
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit,
  Code
} from 'lucide-react';
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

const AdminProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [availableDevs, setAvailableDevs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Assign dev modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDevId, setSelectedDevId] = useState('');

  // Stage update modal
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [stageForm, setStageForm] = useState({ stage: '', progress: 0, notes: '' });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, devsRes, tasksRes, bugsRes, actRes] = await Promise.all([
        projectsAPI.get(id),
        developersAPI.list(),
        tasksAPI.listByProject(id),
        bugsAPI.listByProject(id),
        projectsAPI.getActivity(id)
      ]);
      setProject(projRes.data);
      setAvailableDevs(devsRes.data || []);
      setTasks(tasksRes.data || []);
      setBugs(bugsRes.data || []);
      setActivity(actRes.data || []);
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDeveloper = async () => {
    if (!selectedDevId) return;
    try {
      await projectsAPI.assignDeveloper(id, { developer_user_id: selectedDevId });
      toast.success('Developer assigned to project team');
      setIsAssignModalOpen(false);
      setSelectedDevId('');
      fetchProjectData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign developer');
    }
  };

  const handleRemoveDeveloper = async (devUserId) => {
    if (!window.confirm('Remove developer from this project?')) return;
    try {
      await projectsAPI.removeDeveloper(id, devUserId);
      toast.success('Developer removed from project');
      fetchProjectData();
    } catch (err) {
      toast.error('Failed to remove developer');
    }
  };

  const handleUpdateStage = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.changeStage(id, {
        stage: stageForm.stage,
        progress_percentage: Number(stageForm.progress),
        notes: stageForm.notes
      });
      toast.success('Stage and progress updated');
      setIsStageModalOpen(false);
      fetchProjectData();
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!project) return <div className="text-center py-12">Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/projects')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {project.project_id}
              </span>
              <StatusBadge status={project.current_stage} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{project.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setStageForm({
                stage: project.current_stage,
                progress: project.progress_percentage || 0,
                notes: ''
              });
              setIsStageModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4 mr-1.5" />
            Update Stage
          </Button>
          <Button variant="primary" onClick={() => setIsAssignModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-1.5" />
            Assign Developer
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-6 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'team', label: `Staffing (${project.assigned_developers?.length || 0})`, icon: Users },
            { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckCircle2 },
            { id: 'bugs', label: `Bugs (${bugs.length})`, icon: Clock },
            { id: 'client_chat', label: 'Client Chat', icon: MessageSquare },
            { id: 'dev_chat', label: 'Dev-Only Chat', icon: ShieldCheck },
            { id: 'timeline', label: 'Audit Timeline', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Description">
              <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
            </Card>
            <Card title="Progress & Status">
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>Completion Rate</span>
                  <span>{Math.round(project.progress_percentage || 0)}%</span>
                </div>
                <ProgressBar progress={project.progress_percentage || 0} />
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card title="Project Metadata">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Client User ID:</span>
                  <p className="font-semibold text-gray-900">{project.client_id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Lifecycle Stage:</span>
                  <p className="font-semibold text-gray-900">{project.current_stage}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-semibold text-gray-900">{project.status}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <Card title="Assigned Engineers">
          {project.assigned_developers?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No developers assigned yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {project.assigned_developers.map((devUserId, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      D{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Developer User: {devUserId}</p>
                      <span className="text-xs text-gray-500">Project Contributor</span>
                    </div>
                  </div>
                  <Button size="sm" variant="danger" onClick={() => handleRemoveDeveloper(devUserId)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'tasks' && (
        <Card title="All Project Tasks">
          <div className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <div key={task.id || task.task_id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                  <p className="text-xs text-gray-500">{task.description}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'bugs' && (
        <Card title="All Project Bugs">
          <div className="divide-y divide-gray-100">
            {bugs.map((bug) => (
              <div key={bug.id || bug.bug_id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{bug.title}</h4>
                  <p className="text-xs text-gray-500">{bug.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 font-bold">{bug.severity}</span>
                  <StatusBadge status={bug.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'client_chat' && (
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-xs text-gray-500 font-medium">Administrator observing Client Project Chat</p>
          <ChatRoom roomId={project.id || project.project_id} currentUser={user || { id: 'admin-1' }} />
        </div>
      )}

      {activeTab === 'dev_chat' && (
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-xs text-gray-500 font-medium">Administrator observing Dev-Only Technical Chat</p>
          <ChatRoom
            roomId={`dev-${project.id || project.project_id}`}
            currentUser={user || { id: 'admin-1' }}
          />
        </div>
      )}

      {activeTab === 'timeline' && (
        <Card title="Audit Activity Log">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {activity.map((item, idx) => (
              <div key={idx} className="relative text-sm">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                <span className="font-semibold text-gray-900">{item.action}</span>
                <p className="text-gray-600 mt-0.5">{item.description}</p>
                <span className="text-xs text-gray-400 mt-1 block">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Assign Developer Modal */}
      {isAssignModalOpen && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Assign Developer to Project"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select an engineer from the talent pool to add to this team:</p>
            <select
              value={selectedDevId}
              onChange={(e) => setSelectedDevId(e.target.value)}
              className="w-full text-sm rounded border border-gray-300 px-3 py-2 bg-white"
            >
              <option value="">-- Choose Developer --</option>
              {availableDevs
                .filter((d) => !project.assigned_developers?.includes(d.user_id || d.id))
                .map((dev) => (
                  <option key={dev.id || dev.user_id} value={dev.user_id || dev.id}>
                    {dev.developer_id} - {dev.full_name} ({dev.designation})
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={!selectedDevId} onClick={handleAssignDeveloper}>
                Confirm Assignment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Stage Modal */}
      {isStageModalOpen && (
        <Modal
          isOpen={isStageModalOpen}
          onClose={() => setIsStageModalOpen(false)}
          title="Update Project Lifecycle Stage"
        >
          <form onSubmit={handleUpdateStage} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">New Stage</label>
              <select
                value={stageForm.stage}
                onChange={(e) => setStageForm({ ...stageForm, stage: e.target.value })}
                className="w-full text-sm rounded border border-gray-300 px-3 py-2 bg-white"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Progress Percentage ({stageForm.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={stageForm.progress}
                onChange={(e) => setStageForm({ ...stageForm, progress: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setIsStageModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Stage Update
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminProjectDetail;
