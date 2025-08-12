// src/app/teacher/dashboard/page.js (FIXED VERSION)
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  Users, Calendar, CreditCard, TrendingUp, 
  Filter, Search, Download, Eye, ChevronDown,
  DollarSign, UserCheck, UserX, BookOpen
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function TeacherDashboard() {
  const router = useRouter();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCollege, setFilterCollege] = useState('');
  const [colleges, setColleges] = useState([]); // NEW: Dynamic colleges list
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBatches: 0,
    monthlyCollection: 0,
    paidStudents: 0,
    unpaidStudents: 0,
    collectionByBatch: {},
    collectionRate: 0, // NEW: Add collection rate to stats
  });
  const [viewMode, setViewMode] = useState('summary');

  useEffect(() => {
    fetchBatches();
    fetchOverallStats();
    fetchAllColleges(); // NEW: Fetch all unique colleges
  }, []);

  useEffect(() => {
    fetchOverallStats(); // Re-fetch stats when month changes
  }, [selectedMonth]);

  useEffect(() => {
    if (selectedBatch) {
      fetchBatchStats();
      fetchStudentsByBatch();
    }
  }, [selectedBatch, selectedMonth]);

  useEffect(() => {
    if (viewMode === 'students') {
      fetchAllStudents();
      fetchAllColleges(); // Refresh colleges when viewing students
    } else if (viewMode === 'payments') {
      fetchMonthlyPayments();
    }
  }, [viewMode, selectedMonth, searchTerm, filterCollege]);

  // NEW: Fetch all unique colleges from database
  const fetchAllColleges = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        // Extract unique college names
        const uniqueColleges = [...new Set(data
          .filter(student => student.college) // Filter out null/empty colleges
          .map(student => student.college)
        )].sort(); // Sort alphabetically
        setColleges(uniqueColleges);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  // FIXED: Calculate correct collection rate
  const fetchOverallStats = async () => {
    try {
      const response = await fetch(`/api/stats?month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        
        // Calculate actual collection rate
        const collectionRate = data.totalStudents > 0 
          ? Math.round(((data.totalStudents - data.pendingPayments) / data.totalStudents) * 100)
          : 0;
        
        setStats(prev => ({
          ...prev,
          totalStudents: data.totalStudents,
          totalBatches: data.totalBatches,
          monthlyCollection: data.monthlyCollection,
          paidStudents: data.totalStudents - data.pendingPayments,
          unpaidStudents: data.pendingPayments,
          collectionRate: collectionRate,
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBatchStats = async () => {
    try {
      const response = await fetch(`/api/payments?batchId=${selectedBatch}&month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        const batchStudentsResponse = await fetch(`/api/students?batchId=${selectedBatch}`);
        const batchStudents = await batchStudentsResponse.json();
        
        const paidStudentIds = new Set(data.map(p => p.studentId));
        const totalCollection = data.reduce((sum, p) => sum + p.amount, 0);
        
        setStats(prev => ({
          ...prev,
          paidStudents: paidStudentIds.size,
          unpaidStudents: batchStudents.length - paidStudentIds.size,
          collectionByBatch: {
            ...prev.collectionByBatch,
            [selectedBatch]: totalCollection,
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching batch stats:', error);
    }
  };

  const fetchStudentsByBatch = async () => {
    try {
      const response = await fetch(`/api/students?batchId=${selectedBatch}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCollege) params.append('college', filterCollege);
      
      const response = await fetch(`/api/students?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchMonthlyPayments = async () => {
    try {
      const response = await fetch(`/api/payments?month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const getMonthName = (monthStr) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getPaymentStatus = (student) => {
    const payment = student.payments?.find(p => p.month === selectedMonth);
    return payment ? 'Paid' : 'Pending';
  };

  const exportData = () => {
    let csvContent = '';
    
    if (viewMode === 'students') {
      csvContent = 'Student ID,Name,Batch,College,Personal Number,Guardian Number,Payment Status\n';
      students.forEach(student => {
        csvContent += `${student.studentId},${student.name},${student.batch?.fullName || ''},${student.college || ''},${student.personalNumber},${student.guardianNumber},${getPaymentStatus(student)}\n`;
      });
    } else if (viewMode === 'payments') {
      csvContent = 'Student ID,Name,Batch,Month,Amount,Status\n';
      payments.forEach(payment => {
        csvContent += `${payment.student.studentId},${payment.student.name},${payment.student.batch?.fullName || ''},${payment.month},${payment.amount},Paid\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coaching-center-${viewMode}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Navbar role="teacher" userName="Teacher" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview and analytics for your coaching center</p>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white rounded-xl shadow-md p-1 mb-8">
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('summary')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                viewMode === 'summary'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="inline h-5 w-5 mr-2" />
              Summary & Analytics
            </button>
            <button
              onClick={() => setViewMode('students')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                viewMode === 'students'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="inline h-5 w-5 mr-2" />
              Student Database
            </button>
            <button
              onClick={() => setViewMode('payments')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                viewMode === 'payments'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="inline h-5 w-5 mr-2" />
              Payment Overview
            </button>
          </div>
        </div>

        {/* Summary View */}
        {viewMode === 'summary' && (
          <>
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Students</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
                    </div>
                    <Users className="h-10 w-10 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-1"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Batches</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBatches}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-1"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Monthly Collection</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">৳{stats.monthlyCollection}</p>
                    </div>
                    <DollarSign className="h-10 w-10 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-1"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Collection Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats.collectionRate}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.paidStudents}/{stats.totalStudents} paid
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-pink-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Batch-wise Analysis - Rest of the code remains the same */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Batch-wise Analysis</h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value={new Date().toISOString().slice(0, 7)}>Current Month</option>
                    <option value={new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)}>Last Month</option>
                    <option value={new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString().slice(0, 7)}>2 Months Ago</option>
                  </select>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedBatch && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-700 text-sm font-medium">Students Paid</p>
                          <p className="text-2xl font-bold text-green-900 mt-1">{stats.paidStudents}</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-700 text-sm font-medium">Students Pending</p>
                          <p className="text-2xl font-bold text-red-900 mt-1">{stats.unpaidStudents}</p>
                        </div>
                        <UserX className="h-8 w-8 text-red-600" />
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-700 text-sm font-medium">Total Collection</p>
                          <p className="text-2xl font-bold text-blue-900 mt-1">
                            ৳{stats.collectionByBatch[selectedBatch] || 0}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {students.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Payment Status Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {students.map(student => {
                          const status = getPaymentStatus(student);
                          return (
                            <div
                              key={student.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                status === 'Paid'
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div>
                                <p className="font-medium text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-600">{student.studentId}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                status === 'Paid'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Student Database View */}
        {viewMode === 'students' && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">Student Database</h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by ID or name..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={filterCollege}
                    onChange={(e) => setFilterCollege(e.target.value)}
                  >
                    <option value="">All Colleges</option>
                    {/* FIXED: Dynamic college list */}
                    {colleges.map(college => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                  </select>
                  <button
                    onClick={exportData}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      College
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Numbers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Month
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => {
                    const status = getPaymentStatus(student);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {student.batch?.fullName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.college || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="text-xs">
                            <div>P: {student.personalNumber}</div>
                            <div>G: {student.guardianNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {students.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No students found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Overview - Remains the same */}
        {viewMode === 'payments' && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Payment Overview - {getMonthName(selectedMonth)}
                </h2>
                <div className="flex gap-4">
                  <input
                    type="month"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                  <button
                    onClick={exportData}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 font-medium">Total Collection</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">
                        ৳{payments.reduce((sum, p) => sum + p.amount, 0)}
                      </p>
                    </div>
                    <DollarSign className="h-10 w-10 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-700 font-medium">Students Paid</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">{payments.length}</p>
                    </div>
                    <UserCheck className="h-10 w-10 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-700 font-medium">Average Payment</p>
                      <p className="text-3xl font-bold text-purple-900 mt-2">
                        ৳{payments.length > 0 
                          ? Math.round(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length)
                          : 0}
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                          {payment.student?.studentId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.student?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {payment.student?.batch?.fullName || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ৳{payment.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.paidAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length === 0 && (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No payments found for this month</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}