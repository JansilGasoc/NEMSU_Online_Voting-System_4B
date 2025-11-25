import AuthenticatedLayoutAdmin from '@/Layouts/AuthenticatedLayoutAdmin';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import React from 'react';
import InputError from "@/Components/InputError";
import { toast, Toaster } from 'react-hot-toast';
import { X, Upload, User, Award, Users, BookOpen, Calendar, Hash, Image, Edit } from 'lucide-react';

export default function Candidate({ candidates }) {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [animateModal, setAnimateModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [filterPosition, setFilterPosition] = useState('all');

  // Bulk delete state
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { flash } = usePage().props;


  // File upload state
  const { data: uploadData, setData: setUploadData, post: uploadPost, processing: uploadProcessing, errors: uploadErrors, reset: uploadReset } = useForm({ file: null });
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      setUploadData('file', e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setUploadData('file', e.target.files[0]);
    }
  };

  const submitUpload = (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toast.error("Please select a file to upload");
      return;
    }
    uploadPost(route('candidates.import'), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Excel file imported successfully!");
        setUploadData('file', null);
        uploadReset();
        router.reload({ only: ['candidates'] });
      },
      onError: () => {
        toast.error("Failed to import Excel file");
      }
    });
  };

  // Candidate form state
  const { data, setData, post, errors, processing, reset } = useForm({
    name: '',
    position: '',
    course_program: '',
    party_list: '',
    date_of_filling: '',
    year_level: '',
    age: '',
    image: null,
  });

  const editForm = useForm({
    name: '',
    position: '',
    course_program: '',
    party_list: '',
    date_of_filling: '',
    year_level: '',
    age: '',
    image: null,
  });

  // Sort candidates by votes (highest first)
  const filteredCandidates = candidates
    .filter(candidate => filterPosition === 'all' || candidate.position === filterPosition)
    .sort((a, b) => b.votes - a.votes);

  // Get unique positions for filter dropdown
  const uniquePositions = [...new Set(candidates.map(candidate => candidate.position))];

  // Bulk selection handlers
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedCandidates(filteredCandidates.map(candidate => candidate.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelectCandidate = (candidateId, checked) => {
    if (checked) {
      setSelectedCandidates(prev => [...prev, candidateId]);
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
      setSelectAll(false);
    }
  };

  // Update selectAll state when individual selections change
  useEffect(() => {
    if (selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedCandidates, filteredCandidates]);

  // Clear selections when filter changes
  useEffect(() => {
    setSelectedCandidates([]);
    setSelectAll(false);
  }, [filterPosition]);

  const submit = (e) => {
    e.preventDefault();
    post(route('candidate.store'), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setSubmissionSuccess(true);
        setData({
          name: '',
          position: '',
          party_list: '',
          course_program: '',
          party_list: '',
          date_of_filling: '',
          year_level: '',
          age: '',
          image: null,
        });
        setImagePreview(null);
        setShowModal(false);
        router.reload({ only: ['candidates'] });
      },
    });
  };

  const submitEdit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append all fields
    formData.append('name', editForm.data.name);
    formData.append('position', editForm.data.position);
    formData.append('course_program', editForm.data.course_program);
    formData.append('party_list', editForm.data.party_list);
    formData.append('date_of_filling', editForm.data.date_of_filling);
    formData.append('year_level', editForm.data.year_level);
    formData.append('age', editForm.data.age);

    // Append image if it exists
    if (editForm.data.image) {
      formData.append('image', editForm.data.image);
    }

    // Use _method for PUT
    formData.append('_method', 'put');

    // Use axios directly to send FormData
    axios.post(route('candidate.update', editingCandidate.id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        setEditModal(false);
        setEditingCandidate(null);
        setEditImagePreview(null);
        toast.success('Candidate updated successfully');
        router.reload({ only: ['candidates'] });
      })
      .catch(error => {
        toast.error('Failed to update candidate');
        console.error('Update error:', error);
      });
  };
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setData({ ...data, image: e.target.files[0] });
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleEditImageChange = (e) => {
    if (e.target.files[0]) {
      editForm.setData({ ...editForm.data, image: e.target.files[0] });
      setEditImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setData({ ...data, image: null });
  };

  const removeEditImage = () => {
    setEditImagePreview(null);
    editForm.setData({ ...editForm.data, image: null });
  };

  const openEditModal = (candidate) => {
    setEditingCandidate(candidate);
    editForm.setData({
      name: candidate.name,
      position: candidate.position,
      course_program: candidate.course_program,
      party_list: candidate.party_list,
      date_of_filling: candidate.date_of_filling,
      year_level: candidate.year_level,
      age: candidate.age,
      image: null,
    });

    if (candidate.image) {
      setEditImagePreview(`/storage/${candidate.image}`);
    } else {
      setEditImagePreview(null);
    }

    setEditModal(true);
  };

  const bulkDeleteCandidates = () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select candidates to delete');
      return;
    }

    const count = selectedCandidates.length;
    if (confirm(`Are you sure you want to delete ${count} candidate${count > 1 ? 's' : ''}?`)) {
      setIsDeleting(true);

      router.post(route('candidate.bulk-destroy'), {
        candidate_ids: selectedCandidates
      }, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(`${count} candidate${count > 1 ? 's' : ''} deleted successfully`);
          setSelectedCandidates([]);
          setSelectAll(false);
        },
        onError: () => {
          toast.error('Failed to delete candidates');
        },
        onFinish: () => {
          setIsDeleting(false);
        }
      });
    }
  };

  useEffect(() => {
    if (flash?.success && submissionSuccess) {
      toast.custom((t) => (
        <div
          className={`relative bg-green-500 text-white px-4 py-3 rounded shadow-md w-72 transition-all duration-300 ${t.visible ? 'opacity-100' : 'opacity-0'}`}
        >
          <button
            onClick={() => toast.dismiss(t.id)}
            className="absolute top-1 right-2 text-white hover:text-gray-200 text-lg font-bold"
          >
            &times;
          </button>
          <div>{flash.success}</div>
          <div className="mt-2 h-1 w-full bg-green-700 overflow-hidden rounded">
            <div className="bg-white h-full animate-progressBar" />
          </div>
        </div>
      ), {
        duration: 3000,
      });
      setSubmissionSuccess(false);
    }

    if (showModal || editModal) {
      setTimeout(() => setAnimateModal(true), 10);
    } else {
      setAnimateModal(false);
    }
  }, [flash, showModal, editModal, submissionSuccess]);

  return (
    <AuthenticatedLayoutAdmin
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Candidates Management
        </h2>
      }
    >
      <Head title="Candidates" />
      <Toaster position="top-right mt-4 p-4" reverseOrder={false} />

      <div className="py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-2 lg:px-2">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

            {/* Add Candidate Modal */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                <div
                  className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out ${animateModal ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                    }`}
                >
                  {/* Header */}
                  <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Award className="w-8 h-8" />
                      Add New Candidate
                    </h2>
                    <p className="text-blue-100 mt-1 text-sm">Fill in the candidate information below</p>
                  </div>

                  {/* Form Content */}
                  <div className="p-8 space-y-6">
                    {/* Image Upload Section */}
                    <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
                      <div className="relative">
                        {imagePreview ? (
                          <div className="relative group">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-full border-4 border-blue-500 shadow-lg"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                            <Image className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 border border-blue-200">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm font-medium">Upload Photo</span>
                        </div>
                        <input
                          type="file"
                          name="image"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                          required
                        />
                      </label>
                      <p className="text-xs text-gray-500">Max file size: 10MB (JPG, PNG, GIF)</p>
                      <InputError message={errors.image} className="mt-2 text-red-400" />
                    </div>

                    {/* Two Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={data.name}
                          onChange={(e) => setData({ ...data, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                          placeholder="Enter candidate name"
                          required
                        />
                        <InputError message={errors.name} className="mt-2 text-red-400" />
                      </div>

                      {/* Position */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          Position <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="position"
                          value={data.position}
                          onChange={(e) => setData({ ...data, position: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none bg-white"
                          required
                        >
                          <option value="" disabled>--Select position--</option>
                          <option value="president">President</option>
                          <option value="external_vice_president">External Vice President</option>
                          <option value="internal_vice_president">Internal Vice President</option>
                          <option value="secretary">Secretary</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="auditor">Auditor</option>
                          <option value="senator">Senator</option>
                        </select>
                        <InputError message={errors.course_program} className="mt-2 text-red-400" />
                      </div>

                      {/* Party List */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Party List <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="party_list"
                          value={data.party_list}
                          onChange={(e) => setData({ ...data, party_list: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                          placeholder="Enter party list"
                          required
                        />
                        <InputError message={errors.party_list} className="mt-2 text-red-400" />
                      </div>

                      {/* Course Program */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          Course Program <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="course_program"
                          value={data.course_program}
                          onChange={(e) => setData({ ...data, course_program: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none bg-white"
                          required
                        >
                          <option value="" disabled>--Select a program--</option>
                          <option value="BSCS">BSCS</option>
                          <option value="BSBA">BSBA</option>
                          <option value="BSHM">BSHM</option>
                          <option value="BSA">BSA</option>
                          <option value="BSED">BSED</option>
                          <option value="BEED">BEED</option>
                        </select>
                        <InputError message={errors.course_program} className="mt-2 text-red-400" />
                      </div>

                      {/* Year Level */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          Year Level
                        </label>
                        <select
                          name="year_level"
                          value={data.year_level}
                          onChange={(e) => setData({ ...data, year_level: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none bg-white"
                        >
                          <option value="" disabled>--Select year level--</option>
                          <option value="1st">1st Year</option>
                          <option value="2nd">2nd Year</option>
                          <option value="3rd">3rd Year</option>
                          <option value="4th">4th Year</option>
                        </select>
                        <InputError message={errors.year_level} className="mt-2 text-red-400" />
                      </div>

                      {/* Date of Filing */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          Date of Filing <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="date_of_filling"
                          value={data.date_of_filling}
                          onChange={(e) => setData({ ...data, date_of_filling: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                          required
                        />
                        <InputError message={errors.date_of_filling} className="mt-2 text-red-400" />
                      </div>

                      {/* Age */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <Hash className="w-4 h-4 text-blue-600" />
                          Age <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={data.age}
                          onChange={(e) => setData({ ...data, age: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                          placeholder="Enter age"
                          min="18"
                          max="100"
                          required
                        />
                        <InputError message={errors.age} className="mt-2 text-red-400" />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={submit}
                        disabled={processing}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Submit Candidate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Candidate Modal */}
            {editModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                <div
                  className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out ${animateModal ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                    }`}
                >
                  {/* Header */}
                  <form onSubmit={submitEdit} encType="multipart/form-data">
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 rounded-t-2xl">
                      <button
                        type="button"
                        onClick={() => setEditModal(false)}
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Edit className="w-8 h-8" />
                        Edit Candidate
                      </h2>
                      <p className="text-emerald-100 mt-1 text-sm">Update the candidate information below</p>
                    </div>

                    {/* Form Content */}
                    <div className="p-8 space-y-6">
                      {/* Image Upload Section */}
                      <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
                        <div className="relative">
                          {editImagePreview ? (
                            <div className="relative group">
                              <img
                                src={editImagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-full border-4 border-green-500 shadow-lg"
                              />
                              <button
                                type="button"
                                onClick={removeEditImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                              <Image className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-200 border border-green-200">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm font-medium">Change Photo</span>
                          </div>
                          <input
                            type="file"
                            name="image"
                            className="hidden"
                            accept="image/*"
                            onChange={handleEditImageChange}
                          />
                        </label>
                        <p className="text-xs text-gray-500">Max file size: 10MB (JPG, PNG, GIF)</p>
                        <InputError message={editForm.errors.image} className="mt-2 text-red-400" />
                      </div>

                      {/* Two Column Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <User className="w-4 h-4 text-green-600" />
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData({ ...editForm.data, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
                            placeholder="Enter candidate name"

                          />
                          <InputError message={editForm.errors.name} className="mt-2 text-red-400" />
                        </div>

                        {/* Position */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Award className="w-4 h-4 text-green-600" />
                            Position <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="position"
                            value={editForm.data.position}
                            onChange={(e) => editForm.setData({ ...editForm.data, position: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none bg-white"

                          >
                            <option value="" disabled>--Select position--</option>
                            <option value="president">President</option>
                            <option value="external_vice_president">External Vice President</option>
                            <option value="internal_vice_president">Internal Vice President</option>
                            <option value="secretary">Secretary</option>
                            <option value="treasurer">Treasurer</option>
                            <option value="auditor">Auditor</option>
                            <option value="senator">Senator</option>
                          </select>
                          <InputError message={editForm.errors.position} className="mt-2 text-red-400" />
                        </div>

                        {/* Party List */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Users className="w-4 h-4 text-green-600" />
                            Party List <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="party_list"
                            value={editForm.data.party_list}
                            onChange={(e) => editForm.setData({ ...editForm.data, party_list: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
                            placeholder="Enter party list"

                          />
                          <InputError message={editForm.errors.party_list} className="mt-2 text-red-400" />
                        </div>

                        {/* Course Program */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <BookOpen className="w-4 h-4 text-green-600" />
                            Course Program <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="course_program"
                            value={editForm.data.course_program}
                            onChange={(e) => editForm.setData({ ...editForm.data, course_program: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none bg-white"

                          >
                            <option value="" disabled>--Select a program--</option>
                            <option value="BSCS">BSCS</option>
                            <option value="BSBA">BSBA</option>
                            <option value="BSHM">BSHM</option>
                            <option value="BSA">BSA</option>
                            <option value="BEED">BEED</option>
                            <option value="BSED">BSED</option>
                          </select>
                          <InputError message={editForm.errors.course_program} className="mt-2 text-red-400" />
                        </div>

                        {/* Year Level */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <BookOpen className="w-4 h-4 text-green-600" />
                            Year Level
                          </label>
                          <select
                            name="year_level"
                            value={editForm.data.year_level}
                            onChange={(e) => editForm.setData({ ...editForm.data, year_level: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none bg-white"
                          >
                            <option value="" disabled>--Select year level--</option>
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                          </select>
                          <InputError message={editForm.errors.year_level} className="mt-2 text-red-400" />
                        </div>

                        {/* Date of Filing */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            Date of Filing <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="date_of_filling"
                            value={editForm.data.date_of_filling}
                            onChange={(e) => editForm.setData({ ...editForm.data, date_of_filling: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"

                          />
                          <InputError message={editForm.errors.date_of_filling} className="mt-2 text-red-400" />
                        </div>

                        {/* Age */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Hash className="w-4 h-4 text-green-600" />
                            Age <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="age"
                            value={editForm.data.age}
                            onChange={(e) => editForm.setData({ ...editForm.data, age: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none"
                            placeholder="Enter age"
                            min="18"
                            max="100"
                          />
                          <InputError message={editForm.errors.age} className="mt-2 text-red-400" />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setEditModal(false)}
                          className="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={submitEdit}
                          disabled={editForm.processing}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                          {editForm.processing ? (
                            <>
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Edit className="w-5 h-5" />
                              Update Candidate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div className="p-2 sm:p-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                <h2 className="text-lg font-bold text-gray-800">All Candidates</h2>
                {/* <form onSubmit={submitUpload} encType="multipart/form-data">
                  <div className={`rounded-lg text-center cursor-pointer transition-colors border-2 p-4 ${dragActive ?
                    'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`} onDragEnter={handleDrag}
                    onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()} >
                    <input id="file-input" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                    <div className="flex flex-col items-center">
                      <Upload className="mb-2 text-blue-600" size={32} />
                      <span className="text-sm text-blue-600 font-medium">Click or drag file to upload</span>
                      {uploadData.file &&
                        <p className="mt-2 text-sm font-medium text-gray-900">Selected file: {uploadData.file.name}</p>}
                      {uploadErrors.file && <p className="mt-2 text-sm text-red-600">{uploadErrors.file}</p>}
                    </div> </div> <div className="mt-4 flex justify-end">
                    <button type="submit" disabled={uploadProcessing || !uploadData.file}
                      className={`px-4 py-2 rounded-md text-sm font-medium 
                      ${uploadProcessing || !uploadData.file ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`} >
                      {uploadProcessing ? 'Uploading...' : 'Import Excel'} </button>
                  </div>
                </form> */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="position-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Filter by Position:
                    </label>
                    <select
                      id="position-filter"
                      value={filterPosition}
                      onChange={(e) => setFilterPosition(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Positions</option>
                      {uniquePositions.map(position => (
                        <option key={position} value={position}>
                          {position.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-500 text-white px-4 flex py-2 rounded hover:bg-blue-600 transition transform transition-all duration-300 scale-95 hover:scale-100 w-full sm:w-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    </svg>
                    New Candidate
                  </button>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedCandidates.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-800 font-medium">
                    {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCandidates([]);
                        setSelectAll(false);
                      }}
                      className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                    >
                      Clear Selection
                    </button>
                    <button
                      onClick={bulkDeleteCandidates}
                      disabled={isDeleting}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                          </svg>
                          Delete Selected
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Results Counter */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredCandidates.length} of {candidates.length} candidates
                  {filterPosition !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {filterPosition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  )}
                </p>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full bg-white shadow rounded-lg">
                    <thead>
                      <tr className="bg-gray-200 text-left text-sm text-gray-700">
                        <th className="py-3 px-4 w-12">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="py-3 px-4">Image</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Position</th>
                        <th className="py-3 px-4">Party List</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Year Level</th>
                        <th className="py-3 px-4">Age</th>
                        <th className="py-3 px-4">Date Filed</th>
                        <th className="py-3 px-4">Votes</th>
                        <th className="py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((candidate, index) => (
                          <tr
                            key={candidate.id}
                            className={`border-t hover:bg-gray-50 text-sm text-gray-800 transition-colors ${selectedCandidates.includes(candidate.id) ? 'bg-blue-50' : ''
                              }`}
                          >
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selectedCandidates.includes(candidate.id)}
                                onChange={(e) => handleSelectCandidate(candidate.id, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-3 px-4">
                              {candidate.image ? (
                                <img
                                  src={`/storage/${candidate.image}`}
                                  alt={candidate.name}
                                  className="w-12 h-12 object-cover rounded-full border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 font-medium">{candidate.name}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {candidate.position.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4">{candidate.party_list}</td>
                            <td className="py-3 px-4">{candidate.course_program}</td>
                            <td className="py-3 px-4">{candidate.year_level || 'N/A'}</td>
                            <td className="py-3 px-4">{candidate.age || 'N/A'}</td>
                            <td className="py-3 px-4">
                              {candidate.date_of_filling
                                ? new Date(candidate.date_of_filling).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                                : 'N/A'
                              }
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                {candidate.votes_count || 0} votes
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openEditModal(candidate)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                                  title="Edit candidate"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="11" className="py-8 text-center text-gray-500">
                            No candidates found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`bg-white rounded-lg shadow border p-4 transition-all duration-200 ${selectedCandidates.includes(candidate.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={(e) => handleSelectCandidate(candidate.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          {candidate.image ? (
                            <img
                              src={`/storage/${candidate.image}`}
                              alt={candidate.name}
                              className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {candidate.name}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 ml-2">
                              {candidate.votes_count || 0} votes
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center">
                              <span className="text-xs font-medium text-gray-500 w-24">Position:</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {candidate.position.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs font-medium text-gray-500 w-24">Party List:</span>
                              <span className="text-sm text-gray-800">{candidate.party_list}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs font-medium text-gray-500 w-24">Course:</span>
                              <span className="text-sm text-gray-800">{candidate.course_program}</span>
                            </div>
                            {candidate.year_level && (
                              <div className="flex items-center">
                                <span className="text-xs font-medium text-gray-500 w-24">Year Level:</span>
                                <span className="text-sm text-gray-800">{candidate.year_level}</span>
                              </div>
                            )}
                            {candidate.age && (
                              <div className="flex items-center">
                                <span className="text-xs font-medium text-gray-500 w-24">Age:</span>
                                <span className="text-sm text-gray-800">{candidate.age}</span>
                              </div>
                            )}
                            {candidate.date_of_filling && (
                              <div className="flex items-center">
                                <span className="text-xs font-medium text-gray-500 w-24">Date Filed:</span>
                                <span className="text-sm text-gray-800">
                                  {new Date(candidate.date_of_filling).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Mobile Actions */}
                          <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => openEditModal(candidate)}
                              className="flex-1 px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg border">
                    <p className="text-gray-500">No candidates found</p>
                  </div>
                )}
              </div>

              {/* Mobile Bulk Actions */}
              {selectedCandidates.length > 0 && (
                <div className="md:hidden fixed bottom-4 left-4 right-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between shadow-lg z-50">
                  <span className="text-sm text-blue-800 font-medium">
                    {selectedCandidates.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCandidates([]);
                        setSelectAll(false);
                      }}
                      className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition font-medium"
                    >
                      Clear
                    </button>
                    <button
                      onClick={bulkDeleteCandidates}
                      disabled={isDeleting}
                      className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                          </svg>
                          Delete ({selectedCandidates.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Empty States */}
              {filteredCandidates.length === 0 && candidates.length > 0 && (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <div className="flex flex-col items-center">
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium mb-2">No candidates found for the selected position</p>
                    <button
                      onClick={() => setFilterPosition('all')}
                      className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 rounded transition"
                    >
                      Show all candidates
                    </button>
                  </div>
                </div>
              )}

              {candidates.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <div className="flex flex-col items-center">
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium mb-2">No candidates yet</p>
                    <p className="text-gray-400 text-sm mb-4">Get started by adding your first candidate</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Add First Candidate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayoutAdmin>
  )
}

// Styled Components (keep your existing styled components)
const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  
    background-color: #fff;
    padding: 20px;
    border-radius: 20px;
    position: relative;
  }

  .title {
    font-size: 28px;
    color: royalblue;
    font-weight: 600;
    letter-spacing: -1px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
  }

  .title::before,.title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background-color: royalblue;
  }

  .title::before {
    width: 18px;
    height: 18px;
    background-color: royalblue;
  }

  .title::after {
    width: 18px;
    height: 18px;
    animation: pulse 1s linear infinite;
  }

  .message, .signin {
    color: rgba(88, 87, 87, 0.822);
    font-size: 14px;
  }

  .signin {
    text-align: center;
  }

  .signin a {
    color: royalblue;
  }

  .signin a:hover {
    text-decoration: underline royalblue;
  }

  .flex {
    display: flex;
    width: 100%;
    gap: 6px;
  }

  .form label {
    position: relative;
  }

  .form label .input {
    width: 100%;
    padding: 5px 5px 5px 5px;
    outline: 0;
    border: 1px solid rgba(105, 105, 105, 0.397);
    border-radius: 10px;
  }

  .form label .input + span {
    position: absolute;
    left: 10px;
    top: 15px;
    color: grey;
    font-size: 0.9em;
    cursor: text;
    transition: 0.3s ease;
  }

  .form label .input:placeholder-shown + span {
    top: 15px;
    font-size: 0.9em;
  }

  .form label .input:focus + span,.form label .input:valid + span {
    top: 30px;
    font-size: 0.7em;
    font-weight: 600;
  }

  .form label .input:valid + span {
    color: green;
  }

  .submit {
    border: none;
    outline: none;
    background-color: royalblue;
    padding: 10px;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    transform: .3s ease;
  }

  .submit:hover {
    background-color: rgb(56, 90, 194);
  }

  @keyframes pulse {
    from {
      transform: scale(0.9);
      opacity: 1;
    }

    to {
      transform: scale(1.8);
      opacity: 0;
    }
  }
`;