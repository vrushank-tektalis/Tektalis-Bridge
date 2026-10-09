import React, { useState, useEffect } from 'react';
import { developersAPI } from '../../api/developers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Code, Plus, Edit2, Ban, UserPlus, Phone, Briefcase, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const DeveloperManagement = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    designation: 'Software Engineer',
    skills: '',
    experience_years: 2,
    availability: 'AVAILABLE'
  });

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDev, setSelectedDev] = useState(null);
  const [editForm, setEditForm] = useState({
    designation: '',
    skills: '',
    experience_years: 0,
    availability: 'AVAILABLE',
    phone: ''
  });

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const res = await developersAPI.list();
      setDevelopers(res.data || []);
    } catch (err) {
      toast.error('Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDev = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = createForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await developersAPI.create({
        ...createForm,
        experience_years: Number(createForm.experience_years),
        skills: skillsArray
      });

      toast.success('Developer onboarded successfully!');
      setIsCreateModalOpen(false);
      setCreateForm({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        designation: 'Software Engineer',
        skills: '',
        experience_years: 2,
        availability: 'AVAILABLE'
      });
      fetchDevelopers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create developer');
    }
  };

  const handleOpenEdit = (dev) => {
    setSelectedDev(dev);
    setEditForm({
      designation: dev.designation || '',
      skills: Array.isArray(dev.skills) ? dev.skills.join(', ') : '',
      experience_years: dev.experience_years || 0,
      availability: dev.availability || 'AVAILABLE',
      phone: dev.phone || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedDev) return;
    try {
      const skillsArray = editForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await developersAPI.update(selectedDev.user_id || selectedDev.id, {
        ...editForm,
        experience_years: Number(editForm.experience_years),
        skills: skillsArray
      });

      toast.success('Developer updated successfully');
      setIsEditModalOpen(false);
      fetchDevelopers();
    } catch (err) {
      toast.error('Failed to update developer profile');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to change this developer status?')) return;
    try {
      await developersAPI.delete(userId);
      toast.success('Developer status updated');
      fetchDevelopers();
    } catch (err) {
      toast.error('Failed to update developer');
    }
  };

  const filteredDevs = developers.filter(
    (d) =>
      d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.developer_id?.toLowerCase().includes(search.toLowerCase()) ||
      d.designation?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer Talent Pool</h1>
          <p className="text-sm text-gray-500">
            Invite and manage professional engineering staff (Developers cannot register themselves)
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Onboard Developer
        </Button>
      </div>

      <div className="max-w-md">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, ID, skills, or designation..."
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Dev ID</th>
                <th className="px-4 py-3">Developer</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Skills</th>
                <th className="px-4 py-3">Exp</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevs.map((dev) => (
                <tr key={dev.id || dev.user_id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {dev.developer_id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{dev.full_name}</div>
                    <div className="text-xs text-gray-500">{dev.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{dev.designation}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {dev.skills?.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                      {dev.skills?.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{dev.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{dev.experience_years} yrs</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={dev.availability} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(dev)}>
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={dev.status === 'ACTIVE' ? 'danger' : 'secondary'}
                      onClick={() => handleDeactivate(dev.user_id || dev.id)}
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      {dev.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Onboard Developer Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Onboard New Developer"
        >
          <form onSubmit={handleCreateDev} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Temporary Password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Designation / Role"
                value={createForm.designation}
                onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                required
              />
              <Input
                label="Experience (Years)"
                type="number"
                value={createForm.experience_years}
                onChange={(e) => setCreateForm({ ...createForm, experience_years: e.target.value })}
                required
              />
            </div>
            <Input
              label="Skills (Comma-separated, e.g. React, Python, Docker)"
              value={createForm.skills}
              onChange={(e) => setCreateForm({ ...createForm, skills: e.target.value })}
              required
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Developer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Developer Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${selectedDev?.full_name}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Designation"
                value={editForm.designation}
                onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                required
              />
              <Input
                label="Experience (Years)"
                type="number"
                value={editForm.experience_years}
                onChange={(e) => setEditForm({ ...editForm, experience_years: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Availability Status</label>
              <select
                value={editForm.availability}
                onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                className="w-full text-sm rounded border border-gray-300 px-3 py-2 bg-white"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BUSY">BUSY</option>
                <option value="UNAVAILABLE">UNAVAILABLE</option>
              </select>
            </div>
            <Input
              label="Skills (Comma-separated)"
              value={editForm.skills}
              onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DeveloperManagement;
