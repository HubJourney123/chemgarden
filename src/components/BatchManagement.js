// src/components/BatchManagement.js
'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Clock, Tag, Users } from 'lucide-react';

export default function BatchManagement({ onUpdate }) {
  const [batches, setBatches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    days: 'sat-mon-wed',
    time: '9:00-10:00',
    batchCode: '',
  });

  useEffect(() => {
    fetchBatches();
  }, []);

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

  const generateFullName = (data) => {
    const dayShort = data.days.split('-')[0];
    const timeShort = data.time.split(':')[0];
    const batchShort = data.batchCode.split('-')[1];
    return `${data.name}-${dayShort}-${timeShort}-${batchShort}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const batchData = {
      ...formData,
      fullName: generateFullName(formData),
    };

    try {
      const url = editingBatch 
        ? `/api/batches/${editingBatch.id}` 
        : '/api/batches';
      
      const method = editingBatch ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData),
      });

      if (response.ok) {
        toast.success(editingBatch ? 'Batch updated!' : 'Batch created!');
        resetForm();
        fetchBatches();
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
    if (!confirm('Are you sure? This will also delete all students in this batch.')) {
      return;
    }

    try {
      const response = await fetch(`/api/batches/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Batch deleted successfully');
        fetchBatches();
        if (onUpdate) onUpdate();
      } else {
        toast.error('Failed to delete batch');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      days: batch.days,
      time: batch.time,
      batchCode: batch.batchCode,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      days: 'sat-mon-wed',
      time: '9:00-10:00',
      batchCode: '',
    });
    setEditingBatch(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
            <p className="text-gray-600 mt-1">Manage your coaching center batches</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Batch</span>
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <div key={batch.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
              <h3 className="text-white font-bold text-lg">{batch.fullName}</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center space-x-2 text-gray-700">
                <Calendar className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Schedule:</span>
                <span className="text-gray-600">{batch.days}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Time:</span>
                <span className="text-gray-600">{batch.time}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Tag className="h-5 w-5 text-green-500" />
                <span className="font-medium">Code:</span>
                <span className="text-gray-600">{batch.batchCode}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Users className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Students:</span>
                <span className="text-gray-600">{batch._count?.students || 0}</span>
              </div>
              
              <div className="flex space-x-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(batch)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center space-x-1"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(batch.id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingBatch ? 'Edit Batch' : 'Create New Batch'}
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
                  Batch Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Physics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Days
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                >
                  <option value="sat-mon-wed">Saturday-Monday-Wednesday</option>
                  <option value="sun-tues-thurs">Sunday-Tuesday-Thursday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Slot
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                >
                  <option value="9:00-10:00">9:00 AM - 10:00 AM</option>
                  <option value="9:00-10:30">9:00 AM - 10:30 AM</option>
                  <option value="10:00-11:00">10:00 AM - 11:00 AM</option>
                  <option value="10:00-11:30">10:00 AM - 11:30 AM</option>
                  <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
                  <option value="11:00-12:30">11:00 AM - 12:30 PM</option>
                  <option value="2:00-3:00">2:00 PM - 3:00 PM</option>
                  <option value="2:00-3:30">2:00 PM - 3:30 PM</option>
                  <option value="3:00-4:00">3:00 PM - 4:00 PM</option>
                  <option value="3:00-4:30">3:00 PM - 4:30 PM</option>
                  <option value="4:00-5:00">4:00 PM - 5:00 PM</option>
                  <option value="4:00-5:30">4:00 PM - 5:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Code
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="SSC-24"
                  value={formData.batchCode}
                  onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                />
              </div>

              {formData.name && formData.batchCode && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">
                    <strong>Generated Batch Name:</strong> {generateFullName(formData)}
                  </p>
                </div>
              )}

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
                  <span>{editingBatch ? 'Update' : 'Create'} Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}