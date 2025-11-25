import React, { useState, useEffect } from "react";
import { useForm, usePage, Head, router } from "@inertiajs/react";
import AuthenticatedLayoutAdmin from "../../Layouts/AuthenticatedLayoutAdmin";
import BsbaResults from "@/Components/BsbaResults";
import { toast, Toaster } from 'react-hot-toast';
import { X, Upload, User, Award, Users, BookOpen, Calendar, Hash, Image, Edit, Trash2, Plus, Filter } from 'lucide-react';

export default function Bsba() {
    const { flash, candidates = [], election } = usePage().props;
    const [editingCandidate, setEditingCandidate] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [candidateList, setCandidateList] = useState(candidates || []);
    const [animateModal, setAnimateModal] = useState(false);

    const candidatesPerPage = 5;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        position: "",
        course_program: "BSBA",
        party_list: "",
        date_of_filling: "",
        year_level: "",
        age: "",
        image: null,
    });

    const positions = [
        'All',
        'Governor',
        'VP Finance',
        'P R O',
        'Auditor'
    ];

    // Update candidateList when props.candidates changes
    useEffect(() => {
        setCandidateList(candidates || []);
    }, [candidates]);

    // Modal animation
    useEffect(() => {
        if (isModalOpen) {
            setTimeout(() => setAnimateModal(true), 10);
        } else {
            setAnimateModal(false);
        }
    }, [isModalOpen]);

    // Filter candidates safely
    const filteredCandidates = candidateList.filter(c =>
        selectedPosition === "All" || c.position === selectedPosition
    );

    // Pagination calculations
    const indexOfLastCandidate = currentPage * candidatesPerPage;
    const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
    const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);
    const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("storebsba"), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: (page) => {
                toast.success("Candidate added successfully!");
                reset();
                setPreview(null);
                setIsModalOpen(false);
                setEditingCandidate(null);

                if (page.props.candidates) {
                    setCandidateList(page.props.candidates);
                }
            },
            onError: () => toast.error("Failed to add candidate!"),
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setData("image", file);
        }
    };

    const removeImage = () => {
        setPreview(null);
        setData("image", null);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this candidate?')) {
            router.delete(route('destroybsba', id), {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast.success('Candidate deleted successfully', { duration: 3000 });
                    if (page.props.candidates) {
                        setCandidateList(page.props.candidates);
                    }
                },
                onError: () => {
                    toast.error('Failed to delete candidate', { duration: 3000 });
                }
            });
        }
    };

    const handleEdit = (id) => {
        if (editingCandidate) {
            router.post(route('updatebsba', id), {
                _method: 'put',
                ...data,
            }, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: (page) => {
                    toast.success('Candidate updated successfully', { duration: 3000 });
                    setIsModalOpen(false);
                    setEditingCandidate(null);
                    reset();
                    setPreview(null);
                    if (page.props.candidates) {
                        setCandidateList(page.props.candidates);
                    }
                },
                onError: () => {
                    toast.error('Failed to update candidate', { duration: 3000 });
                },
            });
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editingCandidate) {
            handleEdit(editingCandidate.id);
        } else {
            handleSubmit(e);
        }
    };

    const openAddModal = () => {
        setEditingCandidate(null);
        reset();
        setPreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (candidate) => {
        setEditingCandidate(candidate);
        setData({
            name: candidate.name,
            position: candidate.position,
            course_program: candidate.course_program,
            party_list: candidate.party_list,
            date_of_filling: candidate.date_of_filling,
            year_level: candidate.year_level,
            age: candidate.age,
            image: null,
        });
        setPreview(candidate.image ? `/storage/${candidate.image}` : null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setPreview(null);
        setEditingCandidate(null);
    };

    return (
        <AuthenticatedLayoutAdmin>
            <Head title="BSBA" />
            <div className="min-h-screen bg-gray-50">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: { background: '#333', color: '#fff' },
                    }}
                />

                {/* Main Content */}
                <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                            BSBA Candidates Management
                        </h1>
                        <p className="text-gray-600">Manage and monitor BSBA department candidates</p>
                    </div>

                    {/* Results Section */}
                    <div className="mb-8">
                        <BsbaResults candidates={candidateList} election={election} />
                    </div>

                    {/* Controls Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Filter Section */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-64">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Filter className="w-4 h-4 text-blue-600" />
                                        Filter by Position
                                    </label>
                                    <select
                                        value={selectedPosition}
                                        onChange={(e) => { setSelectedPosition(e.target.value); setCurrentPage(1); }}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none bg-white text-gray-700"
                                    >
                                        {positions.map(pos => (
                                            <option key={pos} value={pos}>{pos}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Add Candidate Button */}
                            <button
                                onClick={openAddModal}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center"
                            >
                                <Plus className="w-5 h-5" />
                                Add Candidate
                            </button>
                        </div>

                        {/* Results Counter */}
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {filteredCandidates.length} of {candidateList.length} candidates
                                {selectedPosition !== "All" && (
                                    <span className="ml-2 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        {selectedPosition}
                                    </span>
                                )}
                            </p>
                            {totalPages > 1 && (
                                <p className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Candidate</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Position</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Party List</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Course</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Year Level</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Age</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date Filed</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Votes</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentCandidates.length > 0 ? (
                                            currentCandidates.map(candidate => (
                                                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={
                                                                    candidate.image
                                                                        ? `/storage/${candidate.image}`
                                                                        : '/images/default-avatar.png'
                                                                }
                                                                alt={candidate.name}
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900">{candidate.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                            {candidate.position}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {candidate.party_list}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 font-medium">{candidate.course_program}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            {candidate.year_level}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 text-center">{candidate.age || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-gray-700">
                                                        {candidate.date_of_filling ? new Date(candidate.date_of_filling).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                                                            {candidate.bsba_votes_count || 0} votes
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => openEditModal(candidate)}
                                                                className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
                                                                title="Edit candidate"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(candidate.id)}
                                                                className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                                                                title="Delete candidate"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                                        <User className="w-12 h-12 mb-3" />
                                                        <p className="text-lg font-medium">No candidates found</p>
                                                        <p className="text-sm mt-1">
                                                            {selectedPosition !== "All"
                                                                ? `No candidates for ${selectedPosition} position`
                                                                : "Get started by adding your first candidate"
                                                            }
                                                        </p>
                                                        {selectedPosition !== "All" && (
                                                            <button
                                                                onClick={() => setSelectedPosition("All")}
                                                                className="mt-3 px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 rounded-lg transition"
                                                            >
                                                                Show all candidates
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4 p-4">
                            {currentCandidates.length > 0 ? (
                                currentCandidates.map(candidate => (
                                    <div key={candidate.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <div className="flex items-start space-x-4">
                                            <img
                                                src={
                                                    candidate.image
                                                        ? `/storage/${candidate.image}`
                                                        : '/images/default-avatar.png'
                                                }
                                                alt={candidate.name}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-base font-semibold text-gray-900 truncate">
                                                        {candidate.name}
                                                    </h3>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 ml-2">
                                                        {candidate.bsba_votes_count || 0} votes
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 w-20">Position:</span>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                            {candidate.position}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 w-20">Party List:</span>
                                                        <span className="text-sm text-gray-800">{candidate.party_list}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 w-20">Course:</span>
                                                        <span className="text-sm text-gray-800">{candidate.course_program}</span>
                                                    </div>
                                                    {candidate.year_level && (
                                                        <div className="flex items-center">
                                                            <span className="text-xs font-medium text-gray-500 w-20">Year Level:</span>
                                                            <span className="text-sm text-gray-800">{candidate.year_level}</span>
                                                        </div>
                                                    )}
                                                    {candidate.age && (
                                                        <div className="flex items-center">
                                                            <span className="text-xs font-medium text-gray-500 w-20">Age:</span>
                                                            <span className="text-sm text-gray-800">{candidate.age}</span>
                                                        </div>
                                                    )}
                                                    {candidate.date_of_filling && (
                                                        <div className="flex items-center">
                                                            <span className="text-xs font-medium text-gray-500 w-20">Date Filed:</span>
                                                            <span className="text-sm text-gray-800">
                                                                {new Date(candidate.date_of_filling).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Mobile Actions */}
                                                <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                                                    <button
                                                        onClick={() => openEditModal(candidate)}
                                                        className="flex-1 px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-1 font-medium"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(candidate.id)}
                                                        className="flex-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-1 font-medium"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-white rounded-lg border">
                                    <div className="flex flex-col items-center">
                                        <User className="w-16 h-16 text-gray-400 mb-4" />
                                        <p className="text-gray-500 text-lg font-medium mb-2">No candidates found</p>
                                        <p className="text-gray-400 text-sm mb-4">
                                            {selectedPosition !== "All"
                                                ? `No candidates for ${selectedPosition} position`
                                                : "Get started by adding your first candidate"
                                            }
                                        </p>
                                        {selectedPosition !== "All" ? (
                                            <button
                                                onClick={() => setSelectedPosition("All")}
                                                className="px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 rounded-lg transition"
                                            >
                                                Show all candidates
                                            </button>
                                        ) : (
                                            <button
                                                onClick={openAddModal}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                            >
                                                Add First Candidate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex justify-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === i + 1
                                                ? "bg-blue-600 text-white shadow-lg"
                                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                        <div
                            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out ${animateModal ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                                }`}
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Award className="w-8 h-8" />
                                    {editingCandidate ? "Edit BSBA Candidate" : "Add New BSBA Candidate"}
                                </h2>
                                <p className="text-blue-100 mt-1 text-sm">
                                    {editingCandidate ? "Update the candidate information below" : "Fill in the candidate information below"}
                                </p>
                            </div>

                            {/* Form Content */}
                            <div className="p-8 space-y-6">
                                {/* Image Upload Section */}
                                <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
                                    <div className="relative">
                                        {preview ? (
                                            <div className="relative group">
                                                <img
                                                    src={preview}
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
                                            <span className="text-sm font-medium">
                                                {preview ? "Change Photo" : "Upload Photo"}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            name="image"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            required={!editingCandidate}
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500">Max file size: 10MB (JPG, PNG, GIF)</p>
                                    {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <User className="w-4 h-4 text-blue-600" />
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            placeholder="Enter candidate name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    {/* Position */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <Award className="w-4 h-4 text-blue-600" />
                                            Position <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.position}
                                            onChange={(e) => setData("position", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none bg-white"
                                            required
                                        >
                                            <option value="">Select Position</option>
                                            {positions.slice(1).map(pos => (
                                                <option key={pos} value={pos}>{pos}</option>
                                            ))}
                                        </select>
                                        {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                                    </div>

                                    {/* Party List */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            Party List <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.party_list}
                                            onChange={(e) => setData("party_list", e.target.value)}
                                            placeholder="Enter party list"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                                            required
                                        />
                                        {errors.party_list && <p className="text-red-500 text-sm mt-1">{errors.party_list}</p>}
                                    </div>

                                    {/* Course Program */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                            Course Program <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.course_program}
                                            onChange={(e) => setData("course_program", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none bg-gray-50"
                                            readOnly
                                        />
                                        {errors.course_program && <p className="text-red-500 text-sm mt-1">{errors.course_program}</p>}
                                    </div>

                                    {/* Year Level */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                            Year Level
                                        </label>
                                        <select
                                            value={data.year_level}
                                            onChange={(e) => setData("year_level", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none bg-white"
                                        >
                                            <option value="">Select Year Level</option>
                                            <option value="1st">1st Year</option>
                                            <option value="2nd">2nd Year</option>
                                            <option value="3rd">3rd Year</option>
                                            <option value="4th">4th Year</option>
                                        </select>
                                        {errors.year_level && <p className="text-red-500 text-sm mt-1">{errors.year_level}</p>}
                                    </div>

                                    {/* Date of Filing */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            Date of Filing <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_of_filling}
                                            onChange={(e) => setData("date_of_filling", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                                            required
                                        />
                                        {errors.date_of_filling && <p className="text-red-500 text-sm mt-1">{errors.date_of_filling}</p>}
                                    </div>

                                    {/* Age */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <Hash className="w-4 h-4 text-blue-600" />
                                            Age <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.age}
                                            onChange={(e) => setData("age", e.target.value)}
                                            placeholder="Enter age"
                                            min="18"
                                            max="100"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                                            required
                                        />
                                        {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFormSubmit}
                                        disabled={processing}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {editingCandidate ? "Updating..." : "Submitting..."}
                                            </>
                                        ) : (
                                            <>
                                                {editingCandidate ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                                {editingCandidate ? "Update Candidate" : "Add Candidate"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayoutAdmin>
    );
}