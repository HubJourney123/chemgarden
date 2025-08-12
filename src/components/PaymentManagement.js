// ============================================
// src/components/PaymentManagement.js
// ============================================
'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Search, DollarSign, Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentManagement({ onUpdate }) {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [searchId, setSearchId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [paymentData, setPaymentData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('1500');

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch || searchId) {
      fetchStudents();
    }
  }, [selectedBatch, searchId, selectedMonth]);

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

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBatch) params.append('batchId', selectedBatch);
      if (searchId) params.append('search', searchId);

      const response = await fetch(`/api/students?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        
        // Check payment status for each student
        const paymentStatus = {};
        data.forEach(student => {
          const paid = student.payments?.some(p => p.month === selectedMonth);
          paymentStatus[student.id] = paid;
        });
        setPaymentData(paymentStatus);
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const handlePaymentUpdate = async () => {
    if (!selectedStudent || !paymentAmount) {
      toast.error('Please enter payment amount');
      return;
    }

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          month: selectedMonth,
          amount: parseFloat(paymentAmount),
        }),
      });

      if (response.ok) {
        toast.success('Payment updated successfully');
        setIsModalOpen(false);
        setSelectedStudent(null);
        setPaymentAmount('1500');
        fetchStudents();
        if (onUpdate) onUpdate();
      } else {
        toast.error('Failed to update payment');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const openPaymentModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const getMonthName = (monthStr) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
            <p className="text-gray-600 mt-1">Track and update student payments</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span className="text-lg font-medium text-gray-700">
              {getMonthName(selectedMonth)}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Month
            </label>
            <input
              type="month"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Batch
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setSearchId('');
              }}
            >
              <option value="">Select a batch</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Student ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="STU2024001"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchId}
                onChange={(e) => {
                  setSearchId(e.target.value);
                  setSelectedBatch('');
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Students Payment Status */}
      {(selectedBatch || searchId) && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500">
            <h3 className="text-white font-bold text-lg">
              Payment Status for {getMonthName(selectedMonth)}
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => {
                const isPaid = paymentData[student.id];
                const payment = student.payments?.find(p => p.month === selectedMonth);
                
                return (
                  <div
                    key={student.id}
                    className={`border rounded-lg p-4 ${
                      isPaid ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.studentId}</p>
                        <p className="text-xs text-gray-500">{student.batch?.fullName}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    
                    {isPaid && payment ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium">৳{payment.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid on:</span>
                          <span className="text-gray-700">
                            {new Date(payment.paidAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => openPaymentModal(student)}
                        className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center space-x-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Update Payment</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {students.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {selectedBatch || searchId 
                    ? 'No students found' 
                    : 'Select a batch or search by student ID'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Summary */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
              </div>
              <DollarSign className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Paid</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {Object.values(paymentData).filter(Boolean).length}
                </p>
              </div>
              <Check className="h-10 w-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {Object.values(paymentData).filter(v => !v).length}
                </p>
              </div>
              <X className="h-10 w-10 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Update Payment</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">{selectedStudent.name}</h4>
                <p className="text-sm text-gray-600">ID: {selectedStudent.studentId}</p>
                <p className="text-sm text-gray-600">Batch: {selectedStudent.batch?.fullName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Month
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  value={getMonthName(selectedMonth)}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (৳)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0"
                  step="100"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentUpdate}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center space-x-2"
                >
                  <Check className="h-5 w-5" />
                  <span>Confirm Payment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}