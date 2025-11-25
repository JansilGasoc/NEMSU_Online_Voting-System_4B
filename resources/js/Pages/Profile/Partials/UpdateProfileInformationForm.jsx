import InputError from '@/Components/InputError';
import { Dialog, Transition } from '@headlessui/react';
import Label from '@/Components/Label';
import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, Fragment, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = usePage().props.auth.user;
    const { flash } = usePage().props;

    // Basic Information Form
    const {
        data: basicData,
        setData: setBasicData,
        patch: patchBasic,
        errors: basicErrors,
        processing: processingBasic,
        recentlySuccessful: basicSaved,
    } = useForm({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
    });

    // Course and Year Form
    const {
        data: schoolData,
        setData: setSchoolData,
        patch: patchSchool,
        errors: schoolErrors,
        processing: processingSchool,
        recentlySuccessful: schoolSaved,
        reset: resetSchool,
    } = useForm({
        course_program: user.course_program || '',
        year: user.year || '',
    });

    const submitBasic = (e) => {
        e.preventDefault();
        patchBasic(route('profile.basic.update'));
    };

    const submitSchool = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const confirmSchoolUpdate = () => {
        patchSchool(route('profile.school.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
            },
            onError: (errors) => {
                setIsModalOpen(false);
                // Reset form to original values if there's an error
                resetSchool({
                    course_program: user.course_program || '',
                    year: user.year || '',
                });
            },
        });
    };

    useEffect(() => {
        if (flash?.success) {
            toast.custom((t) => (
                <div className="relative bg-green-500 text-white px-4 py-3 rounded shadow-md w-72 transition-all duration-300">
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
        }

        if (flash?.error) {
            toast.custom((t) => (
                <div className="relative bg-red-500 text-white px-4 py-3 rounded shadow-md w-72 transition-all duration-300">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="absolute top-1 right-2 text-white hover:text-gray-200 text-lg font-bold"
                    >
                        &times;
                    </button>
                    <div>{flash.error}</div>
                    <div className="mt-2 h-1 w-full bg-red-700 overflow-hidden rounded">
                        <div className="bg-white h-full animate-progressBar" />
                    </div>
                </div>
            ), {
                duration: 3000,
            });
        }
    }, [flash]);

    // Reset form when user data changes (after page reload)
    useEffect(() => {
        resetSchool({
            course_program: user.course_program || '',
            year: user.year || '',
        });
    }, [user.course_program, user.year]);

    return (
        <section className=" space-y-6 grid grid-cols-1 md:grid-cols-2 gap-20 justify-center mx-auto p-4">
            <Toaster position="top-right" reverseOrder={false} />

            {/* ================================ */}
            {/* BASIC INFORMATION SECTION */}
            {/* ================================ */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-md font-medium text-gray-800 mb-4">Basic Information</h3>

                <form onSubmit={submitBasic} className="space-y-4">
                    <div>
                        <Label htmlFor="student_id" value="Student ID #" />
                        <Input
                            className="block w-full mt-1"
                            value={user?.student_id || ''}
                            disabled
                        />
                    </div>
                    <div>
                        <Label htmlFor="name" value="FirstName" />
                        <Input
                            id="name"
                            className="block w-full mt-1"
                            value={user?.name || ''}
                            disabled
                        />
                    </div>
                    <div>
                        <Label htmlFor="lastname" value="LastName" />
                        <Input
                            id="lastname"
                            className="block w-full mt-1"
                            value={user?.lastname || ''}
                            disabled
                        />
                    </div>
                    <div>
                        <Label htmlFor="email" value="Email Address" />
                        <Input
                            id="email"
                            type="email"
                            disabled
                            className="block w-full mt-1"
                            value={user?.email || ''}
                            placeholder="Enter your email address"
                        />
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                Your email address is unverified.
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="ml-2 underline font-medium hover:text-yellow-900"
                                >
                                    Resend Verification Email
                                </Link>
                            </p>
                            {status === 'verification-link-sent' && (
                                <p className="text-green-600 text-sm mt-1">
                                    ✓ A verification link has been sent to your email!
                                </p>
                            )}
                        </div>
                    )}
                </form>
                <br />
                <Link href={route('verification.notice')} className="mt-6 text-center bg-green-500 px-4 p-1 rounded-lg text-blue-100 hover:underline">
                    Verify Email
                </Link>
            </div>

            {/* ================================ */}
            {/* ACADEMIC INFORMATION SECTION */}
            {/* ================================ */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-md font-medium text-gray-800 mb-4">Academic Information</h3>

                <form onSubmit={submitSchool} className="space-y-4">
                    <div>
                        <Label htmlFor="course_program" value="Course Program" />
                        <select
                            id="course_program"
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={schoolData.course_program}
                            onChange={(e) => setSchoolData('course_program', e.target.value)}
                            required
                        >
                            <option value="">-- Select Your Course --</option>
                            <option value="BSCS">Bachelor of Science in Computer Science</option>
                            <option value="BSBA">Bachelor of Science in Business Administration</option>
                            <option value="BSHM">Bachelor of Science in Hospitality Management</option>
                            <option value="BSA">Bachelor of Science in Agriculture</option>
                            <option value="BEED">Bachelor of Elementary Education</option>
                            <option value="BSED">Bachelor of Secondary Education</option>

                        </select>
                        <InputError message={schoolErrors.course_program} className="mt-1" />
                    </div>

                    <div>
                        <Label htmlFor="year" value="Year Level" />
                        <select
                            id="year"
                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={schoolData.year}
                            onChange={(e) => setSchoolData('year', e.target.value)}
                            required
                        >
                            <option value="">-- Select Your Year Level --</option>
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                        </select>
                        <InputError message={schoolErrors.year} className="mt-1" />
                    </div>

                    <div className="flex items-center space-x-3">
                        <PrimaryButton disabled={processingSchool}>
                            {processingSchool ? 'Updating...' : 'Update Academic Info'}
                        </PrimaryButton>
                        {/* Remove the local success message since we're using flash messages */}
                    </div>
                </form>
            </div>

            {/* ================================ */}
            {/* CONFIRMATION MODAL */}
            {/* ================================ */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Confirm Academic Information Update
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to update your academic information?
                                        </p>

                                        <div className="mt-4 border-t pt-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">Course:</span>
                                                <span className="flex items-center">
                                                    {user.course_program || 'Not set'}
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                    {schoolData.course_program || 'No change'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium">Year Level:</span>
                                                <span className="flex items-center">
                                                    {user.year || 'Not set'}
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                    {schoolData.year || 'No change'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            onClick={confirmSchoolUpdate}
                                            disabled={processingSchool}
                                        >
                                            {processingSchool ? 'Updating...' : 'Confirm Update'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </section>
    );
}