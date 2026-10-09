import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import BarChartWidget from '../../components/charts/BarChartWidget';
import PieChartWidget from '../../components/charts/PieChartWidget';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { BarChart3, TrendingUp, Cpu, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  DRAFT: '#9CA3AF',
  ACTIVE: '#3B82F6',
  COMPLETED: '#10B981',
  ON_HOLD: '#F59E0B',
  CANCELLED: '#EF4444'
};

const SEVERITY_COLORS = {
  LOW: '#9CA3AF',
  MEDIUM: '#3B82F6',
  HIGH: '#F59E0B',
  CRITICAL: '#EF4444'
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const statusData = (analytics?.projects_by_status || []).map((item) => ({
    ...item,
    color: STATUS_COLORS[item.name] || '#6366F1'
  }));

  const stageData = (analytics?.projects_by_stage || []).map((item) => ({
    stage: item.stage?.replace(/_/g, ' '),
    count: item.count
  }));

  const devUtilData = analytics?.developer_utilization || [];
  const clientData = analytics?.projects_per_client || [];
  const bugSeverityData = (analytics?.bugs_by_severity || []).map((item) => ({
    ...item,
    color: SEVERITY_COLORS[item.name] || '#EF4444'
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics & Intelligence</h1>
        <p className="text-sm text-gray-500">Live operational reporting across projects, engineers, quality, and velocity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartWidget
          title="Projects by Status Distribution"
          data={statusData.length > 0 ? statusData : [{ name: 'Active', value: 1, color: '#3B82F6' }]}
        />

        <BarChartWidget
          title="Projects Across Lifecycle Stages"
          data={stageData.length > 0 ? stageData : [{ stage: 'DEVELOPMENT', count: 1 }]}
          dataKey="count"
          xKey="stage"
          color="#4F46E5"
        />

        <BarChartWidget
          title="Developer Utilization (Active Project Count)"
          data={devUtilData.length > 0 ? devUtilData : [{ name: 'Dev 1', projects: 2 }]}
          dataKey="projects"
          xKey="name"
          color="#06B6D4"
        />

        <PieChartWidget
          title="Bugs by Severity Breakdown"
          data={bugSeverityData.length > 0 ? bugSeverityData : [{ name: 'MEDIUM', value: 1, color: '#3B82F6' }]}
        />
      </div>
    </div>
  );
};

export default Analytics;
