import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const CreateExam = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    duration: 30,
    totalMarks: 100,
    passingMarks: 40,
    negativeMarking: false,
    negativeMarksPerQuestion: 0,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toUtcISOStringFromDateAndTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return '';
    return new Date(`${dateValue}T${timeValue}`).toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate global exam window and per-student duration
    if (!formData.name || !formData.subject || !formData.startDate ||
      !formData.startTime || !formData.endDate || !formData.endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.duration <= 0) {
      toast.error('Duration must be greater than 0');
      return;
    }

    if (formData.passingMarks > formData.totalMarks) {
      toast.error('Passing marks cannot exceed total marks');
      return;
    }

    // Combine local date + time for validation
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    // Validate endTime > startTime
    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        subject: formData.subject.toLowerCase(),
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        passingMarks: Number(formData.passingMarks),
        negativeMarking: formData.negativeMarking,
        negativeMarksPerQuestion: formData.negativeMarking
          ? Number(formData.negativeMarksPerQuestion)
          : 0,
        startTime: toUtcISOStringFromDateAndTime(formData.startDate, formData.startTime),
        endTime: toUtcISOStringFromDateAndTime(formData.endDate, formData.endTime),
        questions: []
      };

      const response = await api.post('/exams', payload);

      toast.success('Exam created successfully!');
      navigate(`/admin/exams/${response.data._id}/add-questions`);

    } catch (error) {
      console.error('Create exam error:', error);
      toast.error(error.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
          <p className="text-gray-600 mt-2">Set up exam details and scheduling</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

          {/* Basic Info Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              {/* Exam Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Midterm Examination"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Mathematics, Programming"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Marks Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam Scheduling</h2>

            <div className="space-y-4">
              {/* Duration per Student */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time per Student (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  placeholder="30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Each student gets this much time once they start the exam
                </p>
              </div>

              {/* Start Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Available From <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Students can start the exam from this date/time
                </p>
              </div>

              {/* End Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Available Until <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  No student can start after this date/time
                </p>
              </div>

              {/* Example Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Example:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Exam Window: 10:00 AM – 1:00 PM (3 hours)</li>
                      <li>Duration per Student: 30 minutes</li>
                      <li>Student A starts at 10:05 → ends at 10:35</li>
                      <li>Student B starts at 12:45 → ends at 1:00 PM (window override)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Negative Marking Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Grading Options</h2>

            <div className="space-y-4">
              {/* Negative Marking Checkbox */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="negativeMarking"
                  checked={formData.negativeMarking}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    Enable Negative Marking
                  </label>
                  <p className="text-xs text-gray-500">
                    Deduct marks for wrong answers
                  </p>
                </div>
              </div>

              {/* Negative Marks per Question */}
              {formData.negativeMarking && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks Deducted per Wrong Answer
                  </label>
                  <input
                    type="number"
                    name="negativeMarksPerQuestion"
                    value={formData.negativeMarksPerQuestion}
                    onChange={handleChange}
                    min="0"
                    step="0.25"
                    placeholder="0.25"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/exams')}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
