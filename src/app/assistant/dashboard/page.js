// src/app/assistant/dashboard/page.js (FIXED VERSION - relevant parts)
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import BatchManagement from '@/components/BatchManagement';
import StudentManagement from '@/components/StudentManagement';
import PaymentManagement from '@/components/PaymentManagement';
import Navbar from '@/components/Navbar';
import { Users, Calendar, CreditCard, LayoutDashboard, TrendingUp } from 'lucide-react';

export default function AssistantDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBatches: 0,
    monthlyCollection: 0,
    pendingPayments: 0,
    paidStudentsCount: 0, // Add this
    collectionRate: 0, // Add this
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await fetch(`/api/stats?month=${currentMonth}`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalStudents: data.totalStudents,
          totalBatches: data.totalBatches,
          monthlyCollection: data.monthlyCollection,
          pendingPayments: data.pendingPayments,
          paidStudentsCount: data.paidStudentsCount || (data.totalStudents - data.pendingPayments),
          collectionRate: data.collectionRate || (
            data.totalStudents > 0 
              ? Math.round(((data.totalStudents - data.pendingPayments) / data.totalStudents) * 100)
              : 0
          ),
        });
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'batches', label: 'Batch Management', icon: Calendar },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'payments', label: 'Payment Management', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Navbar role="assistant" userName="Assistant" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Assistant Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg shadow p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors flex-1 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
                  </div>
                  <Users className="h-10 w-10 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Batches</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBatches}</p>
                  </div>
                  <Calendar className="h-10 w-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Monthly Collection</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">৳{stats.monthlyCollection}</p>
                  </div>
                  <CreditCard className="h-10 w-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending Payments</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingPayments}</p>
                  </div>
                  <CreditCard className="h-10 w-10 text-red-500" />
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-700 text-sm font-medium">Students Paid</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">{stats.paidStudentsCount}</p>
                    <p className="text-xs text-green-600 mt-1">This Month</p>
                  </div>
                  <Users className="h-10 w-10 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-700 text-sm font-medium">Students Pending</p>
                    <p className="text-3xl font-bold text-red-900 mt-1">{stats.pendingPayments}</p>
                    <p className="text-xs text-red-600 mt-1">Need Payment</p>
                  </div>
                  <Users className="h-10 w-10 text-red-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-700 text-sm font-medium">Collection Rate</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">{stats.collectionRate}%</p>
                    <p className="text-xs text-purple-600 mt-1">
                      {stats.paidStudentsCount}/{stats.totalStudents} paid
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Month Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.paidStudentsCount}</p>
                  <p className="text-sm text-gray-600">Paid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.pendingPayments}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.collectionRate}%</p>
                  <p className="text-sm text-gray-600">Collection Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batches' && <BatchManagement onUpdate={fetchStats} />}
        {activeTab === 'students' && <StudentManagement onUpdate={fetchStats} />}
        {activeTab === 'payments' && <PaymentManagement onUpdate={fetchStats} />}
      </div>
    </div>
  );
}