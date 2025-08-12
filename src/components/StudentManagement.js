// src/components/StudentManagement.js (FIXED VERSION)
'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, User, Phone, Home, School, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentManagement({ onUpdate }) {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [colleges, setColleges] = useState([]); // NEW: Dynamic colleges list
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    personalNumber: '',
    guardianNumber: '',
    college: '',
    address: '',
    batchId: '',
  });

  useEffect(() => {
    fetchStudents();
    fetchBatches();
    fetchColleges(); // NEW: Fetch colleges
  }, [searchTerm, filterBatch]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterBatch) params.append('batchId', filterBatch);

      const response = await fetch(`/api/students?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        
        // Update colleges list when students are fetched
        updateCollegesList(data);
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      }
    } catch (error) {
      toast.error('Failed to fetch batches');
    }
  };

  // NEW: Fetch all unique colleges
  const fetchColleges = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        updateCollegesList(data);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  // NEW: Update colleges list from students data
  const updateCollegesList = (studentsData) => {
    const uniqueColleges = [...new Set(studentsData
      .filter(student => student.college)
      .map(student => student.college)
    )].sort();
    setColleges(uniqueColleges);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingStudent 
        ? `/api/students/${editingStudent.id}` 
        : '/api/students';
      
      const method = editingStudent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (!editingStudent) {
          toast.success(`Student created with ID: ${data.studentId}`);
        } else {
          toast.success('Student updated successfully');
        }
        resetForm();
        fetchStudents();
        fetchColleges(); // Refresh colleges after adding/updating
        if (onUpdate) onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student? This will also delete all payment records.')) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Student deleted successfully');
        fetchStudents();
        fetchColleges(); // Refresh colleges after deletion
        if (onUpdate) onUpdate();
      } else {
        toast.error('Failed to delete student');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      personalNumber: student.personalNumber,
      guardianNumber: student.guardianNumber,
      college: student.college || '',
      address: student.address || '',
      batchId: student.batchId,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      personalNumber: '',
      guardianNumber: '',
      college: '',
      address: '',
      batchId: '',
    });
    setEditingStudent(null);
    setIsModalOpen(false);
  };

  const getPaymentStatus = (payments) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const paid = payments?.some(p => p.month === currentMonth);
    return paid ? 'Paid' : 'Pending';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
            <p className="text-gray-600 mt-1">Manage student records and information</p>
          </div>
          <button
            onClick={() => {
              setFormData({ ...formData, batchId: batches[0]?.id || '' });
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Student</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-64 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.fullName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                const paymentStatus = getPaymentStatus(student.payments);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-purple-600">{student.studentId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {student.batch?.fullName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {student.personalNumber}
                        </div>
                        <div className="flex items-center text-xs">
                          <Phone className="h-3 w-3 mr-1" />
                          {student.guardianNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.college || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        paymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No students found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{11}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="01712345678"
                  value={formData.personalNumber}
                  onChange={(e) => setFormData({ ...formData, personalNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{11}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="01812345678"
                  value={formData.guardianNumber}
                  onChange={(e) => setFormData({ ...formData, guardianNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                >
                  <option value="">Select a batch</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>{batch.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter college name"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  list="colleges-list"
                />
                {/* Datalist for college suggestions */}
                <datalist id="colleges-list">
                  {colleges.map(college => (
                    <option key={college} value={college} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="2"
                  placeholder="House no, Road, Area, City"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center space-x-2"
                >
                  <Check className="h-5 w-5" />
                  <span>{editingStudent ? 'Update' : 'Add'} Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}