import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../api/projects';
import { bugsAPI } from '../../api/bugs';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Bug, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const BugManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [bugs, setBugs] = useState([]);
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
        const bugsRes = await bugsAPI.listByProject(projs[0].id || projs[0].project_id);
        setBugs(bugsRes.data || []);
      }
    } catch (err) {
      toast.error('Failed to load project bugs');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (projectId) => {
    setSelectedProjectId(projectId);
    try {
      setLoading(true);
      const res = await bugsAPI.listByProject(projectId);
      setBugs(res.data || []);
    } catch (err) {
      toast.error('Failed to load bugs for selected project');
    } finally {
      setLoading(false);
    }
  };

  const filteredBugs = bugs.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && projects.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Issue & Bug Tracker</h1>
        <p className="text-sm text-gray-500">Quality assurance and defect supervision across all software developments</p>
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
            placeholder="Search bugs..."
          />
        </div>
      </div>

      <Card>
        {filteredBugs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No bugs logged for this project.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Bug ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reported</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBugs.map((bug) => (
                  <tr key={bug.id || bug.bug_id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-rose-600">{bug.bug_id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{bug.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{bug.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-rose-50 text-rose-700">
                        {bug.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={bug.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={bug.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(bug.created_at).toLocaleDateString()}
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

export default BugManagement;
