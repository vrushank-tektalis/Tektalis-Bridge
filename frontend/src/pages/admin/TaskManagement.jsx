import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../api/projects';
import { tasksAPI } from '../../api/tasks';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ListTodo, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TaskManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.list();
      const projs = res.data || [];
      setProjects(projs);
      if (projs.length > 0) {
        setSelectedProjectId(projs[0].id || projs[0].project_id);
        const taskRes = await tasksAPI.listByProject(projs[0].id || projs[0].project_id);
        setTasks(taskRes.data || []);
      }
    } catch (err) {
      toast.error('Failed to load project tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (projectId) => {
    setSelectedProjectId(projectId);
    try {
      setLoading(true);
      const res = await tasksAPI.listByProject(projectId);
      setTasks(res.data || []);
    } catch (err) {
      toast.error('Failed to load tasks for selected project');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) =>
    t.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && projects.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Task Oversight</h1>
        <p className="text-sm text-gray-500">Global overview and supervision of tasks across all client projects</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-72">
          <label className="block text-xs font-medium text-gray-700 mb-1">Select Project</label>
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500"
          >
            {projects.map((p) => (
              <option key={p.id || p.project_id} value={p.id || p.project_id}>
                {p.project_id} - {p.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 self-end">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search tasks..."
          />
        </div>
      </div>

      <Card>
        {filteredTasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No tasks recorded for this project.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Task ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id || task.task_id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-indigo-600">{task.task_id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TaskManagement;
