import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FolderOpen, 
  Package, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const [healthStatus, setHealthStatus] = useState('checking');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeProjects: 0,
    totalComponents: 0,
    pendingQuotes: 0
  });

  useEffect(() => {
    // Check backend health
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/health`);
        if (response.ok) {
          setHealthStatus('healthy');
        } else {
          setHealthStatus('unhealthy');
        }
      } catch (error) {
        setHealthStatus('unhealthy');
      }
    };

    checkBackendHealth();
  }, []);

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: FolderOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Components',
      value: stats.totalComponents,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Quotes',
      value: stats.pendingQuotes,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const getHealthIcon = () => {
    switch (healthStatus) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'unhealthy':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="hausa-title">Dashboard</h1>
          <p className="hausa-text">Welcome to HAÜSA ERP - Your construction management system</p>
        </div>
        <div className="flex items-center space-x-2">
          {getHealthIcon()}
          <span className="text-sm text-gray-600">
            System Status: {healthStatus === 'healthy' ? 'Healthy' : healthStatus === 'unhealthy' ? 'Unhealthy' : 'Checking...'}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="hausa-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="hausa-card p-6">
        <h2 className="hausa-subtitle mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="hausa-btn-primary flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
          <button className="hausa-btn-primary flex items-center space-x-2">
            <FolderOpen className="w-4 h-4" />
            <span>Create Project</span>
          </button>
          <button className="hausa-btn-primary flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Import BOM</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="hausa-card p-6">
        <h2 className="hausa-subtitle mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">System initialized successfully</p>
              <p className="text-xs text-gray-500">Welcome to HAÜSA ERP</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Ready for component catalog import</p>
              <p className="text-xs text-gray-500">Upload your CSV files when ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;