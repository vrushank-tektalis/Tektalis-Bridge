import React, { useState, useEffect } from 'react';
import { clientsAPI } from '../../api/clients';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, Plus, Edit2, Ban, CheckCircle, Mail, Phone, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editForm, setEditForm] = useState({
    company_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await clientsAPI.list();
      setClients(res.data || []);
    } catch (err) {
      toast.error('Failed to load clients list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (client) => {
    setSelectedClient(client);
    setEditForm({
      company_name: client.company_name || '',
      phone: client.phone || '',
      address: client.address || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      await clientsAPI.update(selectedClient.user_id || selectedClient.id, editForm);
      toast.success('Client updated successfully');
      setIsEditModalOpen(false);
      fetchClients();
    } catch (err) {
      toast.error('Failed to update client');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this client?')) return;
    try {
      await clientsAPI.delete(userId);
      toast.success('Client status updated');
      fetchClients();
    } catch (err) {
      toast.error('Failed to update client status');
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-sm text-gray-500">View and manage customer enterprise accounts and project owners</p>
        </div>
      </div>

      <div className="max-w-md">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or company..."
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Client Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id || client.user_id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{client.full_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{client.email}</td>
                  <td className="px-4 py-3 text-gray-600">{client.company_name || 'Individual'}</td>
                  <td className="px-4 py-3 text-gray-500">{client.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        client.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {client.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(client)}>
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={client.is_active ? 'danger' : 'secondary'}
                      onClick={() => handleDeactivate(client.user_id || client.id)}
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      {client.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${selectedClient?.full_name}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Company Name"
              value={editForm.company_name}
              onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
            />
            <Input
              label="Contact Phone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <Input
              label="Billing / Business Address"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
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

export default ClientManagement;
