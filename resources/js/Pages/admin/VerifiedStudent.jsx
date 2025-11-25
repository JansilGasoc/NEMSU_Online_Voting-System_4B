import React, { Fragment, useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayoutAdmin from '@/Layouts/AuthenticatedLayoutAdmin';
import { Head } from '@inertiajs/react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Toaster } from 'react-hot-toast';
import { Menu, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

export default function VerifiedStudents({ validated = [], search = '' }) {

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [voteFilter, setVoteFilter] = useState('');

    const highlightMatch = (text, term) => {
        if (!term || !text) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.split(regex).map((part, i) =>
            part.toLowerCase() === term.toLowerCase() ? (
                <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
            ) : (
                part
            )
        );
    };

    const filteredStudents = validated.filter((student) => {
        const matchesSearch =
            (student.student_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.lastname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.year?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (student.course_program?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const isVoted = student.votes_count > 0;

        if (voteFilter === 'voted' && !isVoted) return false;
        if (voteFilter === 'not voted' && isVoted) return false;

        return matchesSearch;
    });

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredStudents.map(student => student.id));
        }
        setSelectAll(!selectAll);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) {
            toast.error("No students selected.");
            return;
        }

        if (confirm("Are you sure you want to delete the selected students?")) {
            router.post(route('admin.verified.students.bulkDelete'), {
                ids: selectedIds
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Students deleted successfully.");
                    setSelectedIds([]);
                    setSelectAll(false);
                },
                onError: (errors) => {
                    toast.error("Failed to delete students.");
                    console.error(errors);
                }
            });
        }
    };

    // Mobile Card Component
    const StudentCard = ({ student }) => (
        <div className={`bg-white border border-slate-200 rounded-lg p-4 mb-3 transition-colors duration-200 ${selectedIds.includes(student.id) ? 'bg-red-50 border-red-200' : 'hover:bg-slate-50'
            }`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(student.id)}
                        onChange={() => toggleSelect(student.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded mt-1"
                    />
                    <div>
                        <h3 className="font-semibold text-slate-900 text-sm">
                            {highlightMatch(student.lastname || '', searchTerm)}, {highlightMatch(student.name || '', searchTerm)}
                        </h3>
                        <p className="text-xs text-slate-600 font-mono">
                            {highlightMatch(student.student_id || '', searchTerm)}
                        </p>
                    </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(student.votes_count || 0) > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                    {(student.votes_count || 0) > 0 ? '✓ Voted' : '○ Not Voted'}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-600">Middle Name:</span>
                    <span className="text-slate-900">{highlightMatch(student.middle_name || '', searchTerm)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Email:</span>
                    <span className="text-slate-900 text-right">{highlightMatch(student.email || '', searchTerm)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Year Level:</span>
                    <span className="text-slate-900">{highlightMatch(student.year || '', searchTerm)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-600">Course/Program:</span>
                    <span className="text-slate-900 text-right">{highlightMatch(student.course_program || '', searchTerm)}</span>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayoutAdmin
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold leading-tight text-slate-800">
                        Verified Voters Dashboard
                    </h2>
                    <div className="text-sm text-slate-600">
                        Total: {validated.length} students
                    </div>
                </div>
            }
        >
            <Head title="Verified Voters" />
            <Toaster position="top-right" reverseOrder={false} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            {/* Search Bar */}
                            <div className="relative w-full md:w-96">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by ID, name, year, or course..."
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Filter Controls */}
                            <div className="flex items-center gap-3">
                                <Menu as="div" className="relative">
                                    <Menu.Button className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200">
                                        <FunnelIcon className="h-4 w-4 mr-2" />
                                        Filter: {voteFilter === '' ? 'All' : voteFilter === 'voted' ? 'Voted' : 'Unvoted'}
                                    </Menu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                                            {[
                                                { value: '', label: 'All Students' },
                                                { value: 'voted', label: 'Voted' },
                                                { value: 'not voted', label: 'Not Voted' }
                                            ].map(option => (
                                                <Menu.Item key={option.value}>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => setVoteFilter(option.value)}
                                                            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${voteFilter === option.value
                                                                ? 'text-red-600 font-semibold bg-red-50'
                                                                : 'text-slate-700'
                                                                } ${active ? 'bg-slate-100' : ''}`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                            <span>
                                Showing {filteredStudents.length} of {validated.length} students
                                {voteFilter && ` (${voteFilter})`}
                                {searchTerm && ` matching "${searchTerm}"`}
                            </span>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <Menu as="div" className="relative">
                                    <Menu.Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors duration-200">
                                        Bulk Actions
                                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </Menu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                            <div className="py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={handleDeleteSelected}
                                                            className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                                                } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-200`}
                                                        >
                                                            <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete Selected
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>

                                <span className="text-sm text-slate-600">
                                    {selectedIds.length} student{selectedIds.length !== 1 ? 's' : ''} selected
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Desktop Table - Hidden on mobile */}
                    <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="w-12 px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectAll && filteredStudents.length > 0}
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Student ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Last Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            First Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Middle Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Year Level
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Course/Program
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Voting Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <tr
                                                key={student.id}
                                                className={`hover:bg-slate-50 transition-colors duration-200 ${selectedIds.includes(student.id) ? 'bg-red-50' : ''
                                                    }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(student.id)}
                                                        onChange={() => toggleSelect(student.id)}
                                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                    {highlightMatch(student.student_id || '', searchTerm)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                    {highlightMatch(student.lastname || '', searchTerm)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                    {highlightMatch(student.name || '', searchTerm)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                    {highlightMatch(student.middle_name || '', searchTerm)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                    {highlightMatch(student.email || '', searchTerm)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                    {highlightMatch(student.year || '', searchTerm)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                    {highlightMatch(student.course_program || '', searchTerm)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(student.votes_count || 0) > 0
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {(student.votes_count || 0) > 0 ? '✓ Voted' : '○ Not Voted'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                    </svg>
                                                    <h3 className="text-lg font-medium text-slate-900 mb-1">No students found</h3>
                                                    <p className="text-slate-500">
                                                        {searchTerm || voteFilter
                                                            ? "Try adjusting your search or filter criteria."
                                                            : "No verified students in the system yet."
                                                        }
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards - Visible only on mobile */}
                    <div className="lg:hidden">
                        {/* Mobile Select All */}
                        {filteredStudents.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectAll && filteredStudents.length > 0}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-slate-700">
                                        Select all {filteredStudents.length} students
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Mobile Cards List */}
                        <div className="space-y-3">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <StudentCard key={student.id} student={student} />
                                ))
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                                    <svg className="h-12 w-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-slate-900 mb-1">No students found</h3>
                                    <p className="text-slate-500">
                                        {searchTerm || voteFilter
                                            ? "Try adjusting your search or filter criteria."
                                            : "No verified students in the system yet."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayoutAdmin>
    );
}