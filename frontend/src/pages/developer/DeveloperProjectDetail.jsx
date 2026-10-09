import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../api/projects';
import { tasksAPI } from '../../api/tasks';
import { bugsAPI } from '../../api/bugs';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import ChatRoom from '../../components/chat/ChatRoom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  History,
  Layers,
  ListTodo,
  Bug,
  Plus,
  ShieldCheck,
  Code
} from 'lucide-react';
import toast from 'react-hot-toast';

const DeveloperProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    due_date: ''
  });

  // Bug Modal state
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [bugForm, setBugForm] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes, bugsRes, actRes] = await Promise.all([
        projectsAPI.get(id),
        tasksAPI.listByProject(id),
        bugsAPI.listByProject(id),
        projectsAPI.getActivity(id)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data || []);
      setBugs(bugsRes.data || []);
      setActivity(actRes.data || []);
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.create(id, {
        ...taskForm,
        due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null
      });
      toast.success('Task created successfully');
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', due_date: '' });
      const res = await tasksAPI.listByProject(id);
      setTasks(res.data || []);
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleCreateBug = async (e) => {
    e.preventDefault();
    try {
      await bugsAPI.create(id, bugForm);
      toast.success('Bug reported successfully');
      setIsBugModalOpen(false);
      setBugForm({ title: '', description: '', severity: 'MEDIUM', priority: 'MEDIUM' });
      const res = await bugsAPI.listByProject(id);
      setBugs(res.data || []);
    } catch (err) {
      toast.error('Failed to report bug');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      toast.success('Task status updated');
      const res = await tasksAPI.listByProject(id);
      setTasks(res.data || []);
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleUpdateBugStatus = async (bugId, newStatus) => {
    try {
      await bugsAPI.update(bugId, { status: newStatus });
      toast.success('Bug status updated');
      const res = await bugsAPI.listByProject(id);
      setBugs(res.data || []);
    } catch (err) {
      toast.error('Failed to update bug');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!project) return <div className="text-center py-12">Project not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/developer/projects/live')}
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
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-6 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'requirements', label: 'Requirements', icon: Code },
            { id: 'tasks', label: `Tasks (${tasks.length})`, icon: ListTodo },
            { id: 'bugs', label: `Bugs (${bugs.length})`, icon: Bug },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'client_chat', label: 'Client Chat', icon: MessageSquare },
            { id: 'dev_chat', label: 'Dev-Only Chat', icon: ShieldCheck },
            { id: 'files', label: 'Files', icon: Layers },
            { id: 'timeline', label: 'Timeline', icon: History }
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

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Project Summary">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{project.description}</p>
            </Card>

            <Card title="Development Progress">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Progress to Completion</span>
                    <span>{Math.round(project.progress_percentage || 0)}%</span>
                  </div>
                  <ProgressBar progress={project.progress_percentage || 0} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
                  <div>
                    <span className="text-gray-500">Current Phase:</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{project.current_stage?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Project Status:</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{project.status}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Timeline Milestones">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Target Delivery:</span>
                  <span className="font-medium text-gray-900">
                    {project.expected_completion_date
                      ? new Date(project.expected_completion_date).toLocaleDateString()
                      : 'Unscheduled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Started:</span>
                  <span className="font-medium text-gray-900">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Pending'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'requirements' && (
        <div className="space-y-6">
          {project.requirements ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Functional Specs" className="md:col-span-2">
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  {project.requirements.functional_requirements?.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </Card>
              <Card title="Frontend Architecture">
                <div className="flex flex-wrap gap-2">
                  {project.requirements.frontend_technologies?.map((tech, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-semibold">
                      {tech}
                    </span>
                  ))}
                </div>
              </Card>
              <Card title="Backend & Database">
                <div className="flex flex-wrap gap-2">
                  {project.requirements.backend_technologies?.map((tech, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded text-xs font-semibold">
                      {tech}
                    </span>
                  ))}
                  {project.requirements.database?.map((db, i) => (
                    <span key={i} className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded text-xs font-semibold">
                      {db}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <p className="text-sm text-gray-500 text-center py-6">Requirements not published yet.</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <Card
          title="Project Tasks"
          action={
            <Button size="sm" variant="primary" onClick={() => setIsTaskModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Task
            </Button>
          }
        >
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No tasks created yet for this project.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <div key={task.id || task.task_id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-gray-400">
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id || task.task_id, e.target.value)}
                      aria-label="Update task status"
                      className="text-xs rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="IN_REVIEW">IN REVIEW</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'bugs' && (
        <Card
          title="Bugs & Issues"
          action={
            <Button size="sm" variant="danger" onClick={() => setIsBugModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Report Bug
            </Button>
          }
        >
          {bugs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No bugs reported! Great work.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {bugs.map((bug) => (
                <div key={bug.id || bug.bug_id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{bug.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{bug.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-700">
                        {bug.severity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={bug.status}
                      onChange={(e) => handleUpdateBugStatus(bug.id || bug.bug_id, e.target.value)}
                      aria-label="Update bug status"
                      className="text-xs rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="FIXED">FIXED</option>
                      <option value="TESTING">TESTING</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                    <StatusBadge status={bug.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'team' && (
        <Card title="Project Team">
          <p className="text-sm text-gray-600 mb-4">
            Total of {project.assigned_developers?.length || 0} developers assigned to this project.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {project.assigned_developers?.map((devId, i) => (
              <div key={i} className="p-3 border border-gray-200 rounded-lg flex items-center gap-3 bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  D{i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Developer {i + 1}</p>
                  <span className="text-xs text-gray-500">Software Engineer</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'client_chat' && (
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-xs text-gray-500">
            Visible to: Client, assigned developers, and admins.
          </p>
          <ChatRoom roomId={project.id || project.project_id} currentUser={user || { id: 'dev-1' }} />
        </div>
      )}

      {activeTab === 'dev_chat' && (
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>
              <strong>Developer-Only Chat:</strong> Client cannot see this room. Use for code, architecture, and API discussions.
            </span>
          </div>
          <ChatRoom
            roomId={`dev-${project.id || project.project_id}`}
            currentUser={user || { id: 'dev-1' }}
          />
        </div>
      )}

      {activeTab === 'files' && (
        <Card title="Code Repositories & Artifacts">
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <Layers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No project files uploaded yet.</p>
          </div>
        </Card>
      )}

      {activeTab === 'timeline' && (
        <Card title="Activity Timeline">
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

      {/* Task Modal */}
      {isTaskModalOpen && (
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title="Create Project Task"
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <Input
              label="Task Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full text-sm rounded border border-gray-300 px-3 py-2 bg-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <Input
                label="Due Date"
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setIsTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Task
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bug Modal */}
      {isBugModalOpen && (
        <Modal
          isOpen={isBugModalOpen}
          onClose={() => setIsBugModalOpen(false)}
          title="Report Bug / Issue"
        >
          <form onSubmit={handleCreateBug} className="space-y-4">
            <Input
              label="Bug Title"
              value={bugForm.title}
              onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
              required
            />
            <Textarea
              label="Bug Description & Reproduction Steps"
              value={bugForm.description}
              onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
              rows={3}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={bugForm.severity}
                  onChange={(e) => setBugForm({ ...bugForm, severity: e.target.value })}
                  className="w-full text-sm rounded border border-gray-300 px-3 py-2 bg-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={bugForm.priority}
                  onChange={(e) => setBugForm({ ...bugForm, priority: e.target.value })}
                  className="w-full text-sm rounded border border-gray-300 px-3 py-2 bg-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setIsBugModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger">
                Report Bug
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DeveloperProjectDetail;
