import React, { Fragment, useState } from 'react';
import { router } from '@inertiajs/react';
import { Menu, Transition, Dialog } from '@headlessui/react';
import AuthenticatedLayoutAdmin from '@/Layouts/AuthenticatedLayoutAdmin';
import { Head } from '@inertiajs/react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export default function Student({ validated, search }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Student form state
    const [studentForm, setStudentForm] = useState({
        student_id: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        ext_name: '',
        sex: '',
        course: '',
        major: '',
        year_level: '',
        birth_date: ''
    });

    const handleAddStudent = (e) => {
        e.preventDefault();
        router.post(route('admin.validate.store'), studentForm, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Student added successfully.");
                setStudentForm({ student_id: '', first_name: '', last_name: '' }); // reset form
                setIsModalOpen(false); // close modal
            },
            onError: (errors) => {
                Object.values(errors).forEach((err) => toast.error(err));
            }
        });
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setStudentForm({ student_id: '', first_name: '', last_name: '' }); // reset form when closing
    };

    const highlightMatch = (text, term) => {
        const safeText = String(text ?? "");
        if (!term) return safeText;

        const regex = new RegExp(`(${term})`, "gi");
        return safeText.split(regex).map((part, i) =>
            part.toLowerCase() === term.toLowerCase() ? (
                <span key={i} className="bg-yellow-200">{part}</span>
            ) : (
                part
            )
        );
    };
    const filteredStudents = validated.filter((student) =>
        student.student_id?.toLowerCase() || ''.includes(searchTerm.toLowerCase()) ||
        student.first_name?.toLowerCase() || ''.includes(searchTerm.toLowerCase()) ||
        student.last_name?.toLowerCase() || ''.includes(searchTerm.toLowerCase()) ||
        String(student.used || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            router.post(route('admin.students.bulkDelete'), {
                ids: selectedIds
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Students deleted successfully.");
                    setSelectedIds([]);
                    setSelectAll(false);
                }
            });
        }
    };

    return (
        <AuthenticatedLayoutAdmin
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Student</h2>}
        >
            <Head title="Validated Students" />
            <Toaster position="top-right mt-4 p-4" reverseOrder={false} />

            <div className="py-4">
                <div className="mx-auto px-4 sm:px-2 lg:px-2">

                    {/* Add Student Button */}


                    {/* Search Box */}
                    <div className="mb-4 border max-w-xl flex items-center bg-white space-x-4 p-2 border rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="ID, first name, or last name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Bulk Actions */}
                    <Menu as="div" className="relative inline-block text-left mb-4">
                        <Menu.Button
                            disabled={selectedIds.length === 0}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
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

                    {/* Students Table */}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 float-right flex text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                        </svg>
                        New
                    </button>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                        <div className="p-2 sm:p-2">
                            <span className="text-sm text-slate-600">
                                {selectedIds.length > 0 && `${selectedIds.length} student${selectedIds.length !== 1 ? 's' : ''} selected`}
                            </span>
                            <div className="hidden md:block">
                                <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
                                    <table className="min-w-full text-sm text-gray-700">
                                        <thead className="bg-gray-100 border-b text-gray-500 uppercase text-xs">
                                            <tr>
                                                <th className="px-6 py-3 text-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectAll && filteredStudents.length > 0}
                                                        onChange={toggleSelectAll}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">Student ID</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">Last Name</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">First Name</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">Middle Name</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">Ext.</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">Sex</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">Course</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">Major</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">Year</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">Birthdate</th>
                                                <th className="px-6 py-3 text-left font-semibold text-gray-800">Used</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredStudents.length > 0 ? (
                                                filteredStudents.map((student) => (
                                                    <tr key={student.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(student.id)}
                                                                onChange={() => toggleSelect(student.id)}
                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-3 font-medium whitespace-nowrap">
                                                            {highlightMatch(student.student_id, searchTerm)}
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            {highlightMatch(student.last_name, searchTerm)}
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            {highlightMatch(student.first_name, searchTerm)}
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            {student.middle_name ? highlightMatch(student.middle_name, searchTerm) : '-'}
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            {student.ext_name ? highlightMatch(student.ext_name, searchTerm) : '-'}
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            {student.sex ? highlightMatch(student.sex, searchTerm) : '-'}
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            {student.course ? highlightMatch(student.course, searchTerm) : '-'}
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            {student.major ? highlightMatch(student.major, searchTerm) : '-'}
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            {student.year_level ? highlightMatch(student.year_level, searchTerm) : '-'}
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            {student.birth_date ? new Date(student.birth_date).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="px-6 py-3 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.used
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {student.used ? 'Yes' : 'No'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="12" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <svg className="h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                            </svg>
                                                            <h3 className="text-lg font-medium text-slate-900 mb-1">No students found</h3>
                                                            <p className="text-sm text-slate-500">Try adjusting your search criteria</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile view */}
                            <div className="md:hidden space-y-4 mt-4">
                                {filteredStudents.map((student) => (
                                    <div key={student.id} className="border rounded-lg shadow-sm bg-white p-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="text-base font-medium text-gray-700">
                                                {highlightMatch(student.student_id, searchTerm)}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(student.id)}
                                                onChange={() => toggleSelect(student.id)}
                                                className="form-checkbox"
                                            />
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <strong>First Name:</strong> {highlightMatch(student.first_name, searchTerm)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <strong>Last Name:</strong> {highlightMatch(student.last_name, searchTerm)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <strong>Used:</strong> {highlightMatch(student.used, searchTerm)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Student Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                            Add New Student
                                        </Dialog.Title>
                                        <button
                                            onClick={closeModal}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddStudent} className="space-y-4">
                                        {/* Student ID */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Student ID <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={studentForm.student_id}
                                                onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                placeholder="Enter student ID"
                                            />
                                        </div>

                                        {/* Two Column Layout */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Last Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Last Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={studentForm.last_name}
                                                    onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                    placeholder="Enter last name"
                                                />
                                            </div>

                                            {/* First Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    First Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={studentForm.first_name}
                                                    onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                    placeholder="Enter first name"
                                                />
                                            </div>

                                            {/* Middle Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Middle Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={studentForm.middle_name}
                                                    onChange={(e) => setStudentForm({ ...studentForm, middle_name: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter middle name"
                                                />
                                            </div>

                                            {/* Extension Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ext. Name
                                                </label>
                                                <select
                                                    value={studentForm.ext_name}
                                                    onChange={(e) => setStudentForm({ ...studentForm, ext_name: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="none">None</option>
                                                    <option value="Jr.">Jr.</option>
                                                    <option value="Sr.">Sr.</option>
                                                    <option value="II">II</option>
                                                    <option value="III">III</option>
                                                    <option value="IV">IV</option>
                                                    <option value="V">V</option>
                                                </select>
                                            </div>

                                            {/* Sex */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Sex
                                                </label>
                                                <select
                                                    value={studentForm.sex}
                                                    onChange={(e) => setStudentForm({ ...studentForm, sex: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select sex</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>

                                            {/* Birthdate */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Birthdate
                                                </label>
                                                <input
                                                    type="date"
                                                    value={studentForm.birth_date}
                                                    onChange={(e) => setStudentForm({ ...studentForm, birth_date: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            {/* Course */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Course
                                                </label>
                                                <select
                                                    value={studentForm.course}
                                                    onChange={(e) => {
                                                        setStudentForm({
                                                            ...studentForm,
                                                            course: e.target.value,
                                                            major: '' // Reset major when course changes
                                                        });
                                                    }}
                                                    required
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select a course</option>
                                                    <option value="BSCS">BSCS</option>
                                                    <option value="BSBA">BSBA</option>
                                                    <option value="BSHM">BSHM</option>
                                                    <option value="BSA">BSA</option>
                                                    <option value="BSCTE">BSCTE</option>
                                                </select>
                                            </div>

                                            {/* Major - Conditional based on Course */}
                                            {(studentForm.course === 'BSCTE' || studentForm.course === 'BSBA') && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Major
                                                    </label>
                                                    <select
                                                        value={studentForm.major}
                                                        onChange={(e) => setStudentForm({ ...studentForm, major: e.target.value })}
                                                        required
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                                                    >
                                                        <option value="">Select a major</option>
                                                        {studentForm.course === 'BSCTE' && (
                                                            <>
                                                                <option value="BEED">BEED</option>
                                                                <option value="BSED">BSED</option>
                                                            </>
                                                        )}
                                                        {studentForm.course === 'BSBA' && (
                                                            <>
                                                                <option value="Human Resource Management">Human Resource Management (HRM)</option>
                                                                <option value="Financial Management">Financial Management (FM)</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Year Level */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Year Level
                                                </label>
                                                <select
                                                    value={studentForm.year_level}
                                                    onChange={(e) => setStudentForm({ ...studentForm, year_level: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Select year level</option>
                                                    <option value="1st">1st Year</option>
                                                    <option value="2nd">2nd Year</option>
                                                    <option value="3rd">3rd Year</option>
                                                    <option value="4th">4th Year</option>
                                                    <option value="5th">5th Year</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end space-x-3 pt-4 border-t">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Add Student
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayoutAdmin>
    );
}