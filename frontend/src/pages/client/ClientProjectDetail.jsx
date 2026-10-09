import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../api/projects';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import Avatar from '../../components/common/Avatar';
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
  FolderOpen,
  Layers,
  Code,
  Shield,
  Server
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

const ClientProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.get(id);
      setProject(res.data);
      const actRes = await projectsAPI.getActivity(id);
      setActivity(actRes.data || []);
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Project Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/client/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const currentStageIndex = STAGES.indexOf(project.current_stage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/client/projects')}
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

      {/* Stage Flow Indicator */}
      <Card className="overflow-x-auto">
        <div className="min-w-[800px] py-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100)}%`
              }}
            />
            {STAGES.map((stg, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stg} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      isCompleted
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : isCurrent
                        ? 'bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-50'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                      isCurrent ? 'text-indigo-600 font-bold' : 'text-gray-500'
                    }`}
                  >
                    {stg.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: FolderOpen },
            { id: 'requirements', label: 'Requirements', icon: FileText },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'chat', label: 'Project Chat', icon: MessageSquare },
            { id: 'timeline', label: 'Timeline', icon: History },
            { id: 'files', label: 'Files', icon: Layers }
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

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Project Description">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{project.description}</p>
            </Card>

            <Card title="Key Progress Metrics">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Overall Completion</span>
                    <span>{Math.round(project.progress_percentage || 0)}%</span>
                  </div>
                  <ProgressBar progress={project.progress_percentage || 0} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
                  <div>
                    <span className="text-gray-500">Current Stage:</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{project.current_stage?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{project.status}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Schedule & Dates">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Target Completion:
                  </span>
                  <span className="font-medium text-gray-900">
                    {project.expected_completion_date
                      ? new Date(project.expected_completion_date).toLocaleDateString()
                      : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Started:
                  </span>
                  <span className="font-medium text-gray-900">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Pending'}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Assigned Team">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>{project.assigned_developers?.length || 0} Developers on Project</span>
                </div>
                <Button variant="secondary" className="w-full text-xs" onClick={() => setActiveTab('team')}>
                  View Team Members
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'requirements' && (
        <div className="space-y-6">
          {project.requirements ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Functional Requirements" className="md:col-span-2">
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  {project.requirements.functional_requirements?.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </Card>

              <Card title="Recommended Tech Stack">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Frontend:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {project.requirements.frontend_technologies?.map((tech, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Backend:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {project.requirements.backend_technologies?.map((tech, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Database:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {project.requirements.database?.map((db, idx) => (
                        <span key={idx} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">
                          {db}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Security & Architecture">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Authentication:</span>
                    <p className="text-gray-800 mt-1">
                      {project.requirements.authentication?.join(', ') || 'Standard JWT'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Security Measures:</span>
                    <p className="text-gray-800 mt-1">{project.requirements.security?.join(', ') || 'HTTPS, RBAC'}</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <p className="text-gray-500 text-sm text-center py-6">
                No formal AI requirements have been approved for this project yet.
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'team' && (
        <Card title="Assigned Development Team">
          {project.assigned_developers && project.assigned_developers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.assigned_developers.map((devId, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                  <Avatar name={`Developer ${idx + 1}`} size="md" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Developer {idx + 1}</h4>
                    <span className="text-xs text-gray-500">Software Engineer</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">
              Developers have not yet been assigned to this project by the administrator.
            </p>
          )}
        </Card>
      )}

      {activeTab === 'chat' && (
        <div className="max-w-4xl mx-auto">
          <ChatRoom roomId={project.id || project.project_id} currentUser={user || { id: 'client-1' }} />
        </div>
      )}

      {activeTab === 'timeline' && (
        <Card title="Project Activity Log">
          {activity.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No activity recorded yet.</p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {activity.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">{item.action?.replace(/_/g, ' ')}</span>
                    <p className="text-gray-600 mt-0.5">{item.description}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'files' && (
        <Card title="Project Documents & Files">
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No project files uploaded</h3>
            <p className="text-xs text-gray-500 mt-1">File attachments and documentation sharing are enabled.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClientProjectDetail;
