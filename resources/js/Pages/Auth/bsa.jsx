import React, { useState, useEffect } from "react";
import { useForm, usePage, Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import toast, { Toaster } from "react-hot-toast";
import Pusher from "pusher-js";
import Echo from "laravel-echo";
import Label from '@/Components/Label';
import Input from '@/Components/Input';
import InputError from '@/Components/InputError';
import CountdownToEnd from '@/Components/CountdownToEnd';

export default function Bsa() {
    const { auth, candidates = [] } = usePage().props;
    const { election, flash } = usePage().props;
    const [isVotingClosed, setIsVotingClosed] = useState(election?.status === "Ended");
    const [electionStarted, setElectionStarted] = useState(election && election.status === 'Started');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);

    // Check if profile completion is needed
    const needsProfileCompletion = !auth.user?.student_id;

    const voteForm = useForm({
        governor_id: '',
        vice_governor_id: '',
        secretary_id: '',
        treasurer_id: '',
        auditor_id: '',
        p_r_o_id: '',
        events_manager_id: '',
    });

    const completeForm = useForm({
        student_id: '',
        name: '',
        lastname: '',
        middle_name: '',
        course_program: '',
        year: '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        setIsLoading(true);

        completeForm.post(route('complete.registration'), {
            onFinish: () => setIsLoading(false),
        });
    };
    const positions = [
        { name: "Governor", key: "governor_id" },
        { name: "Vice Governor Internal", key: "vp_governor_int_id" },
        { name: "Vice Governor External", key: "vp_governor_ext_id" },
        { name: "Secretary", key: "secretary_id" },
        { name: "Assistant Secretary", key: "asst_secretary_id" },
        { name: "Treasurer", key: "treasurer_id" },
        { name: "Assistant Treasurer", key: "asst_treasurer_id" },
        { name: "Auditor", key: "auditor_id" },
        { name: "Assistant Auditor", key: "asst_auditor_id" },
        { name: "P.I.O", key: "p_I_o_id" },
        { name: "Assistant P.I.O", key: "p_i_o_id" },
        { name: "Photo Journalist", key: "photo_journalist_id" },
    ];

    const getCandidatesByPosition = (positionName) => {
        return candidates.filter(c => c.position === positionName);
    };

    // Filter out positions with no candidates
    const validPositions = positions.filter(pos => getCandidatesByPosition(pos.name).length > 0);

    const currentPosition = validPositions[currentPositionIndex]?.name;
    const currentPositionKey = validPositions[currentPositionIndex]?.key;

    const handleCountdownEnd = async () => {
        toast.error("Voting period has ended!");
        setIsVotingClosed(true);

        // Optional: notify backend to update election status
        try {
            await router.post(route("election.close"), { id: election.id });
        } catch (err) {
            console.error("Failed to close election automatically:", err);
        }
    };
    // Initialize Laravel Echo
    useEffect(() => {
        if (typeof window === "undefined") return;

        if (!window.Echo) {
            window.Pusher = Pusher;
            window.Echo = new Echo({
                broadcaster: "pusher",
                key: "30bdcedd3c7074253103",
                cluster: "ap1",
                forceTLS: true,
                namespace: "App.Events",
                auth: {
                    headers: {
                        Authorization: `Bearer ${auth.user?.api_token || ""}`,
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                },
            });
        }

        const echo = window.Echo;
        const electionChannel = echo.channel("election-channel");

        const handleElectionStatus = (e) => {
            let nextStarted = false;

            if (typeof e?.status === "string") {
                nextStarted = e.status === "Started";
            } else if (Array.isArray(e?.elections)) {
                nextStarted = e.elections.some((el) => el.status === "Started");
            }

            setElectionStarted(nextStarted);

            if (nextStarted) {
                toast.success("🗳️ Election has started! You can now vote.", { duration: 5000 });
            } else {
                const status = e?.status || "Paused";
                if (status === "Paused") {
                    toast.error("⏸️ Election has been paused.", { duration: 5000 });
                } else if (status === "Ended") {
                    toast.success("✅ Election has ended. Thank you for participating!", { duration: 8000 });
                }
            }
        };

        electionChannel.listen("ElectionStatusUpdated", handleElectionStatus);

        return () => {
            electionChannel.stopListening("ElectionStatusUpdated");
            echo.leave("election-channel");
        };
    }, [auth.user?.id, auth.user?.api_token]);

    // Handle connection status
    useEffect(() => {
        if (typeof window === 'undefined' || !window.Echo) return;
        const conn = window.Echo.connector?.pusher?.connection;
        if (!conn) return;

        const onConnected = () => toast.success('🔗 Connected to real-time updates', { duration: 2000 });
        const onDisconnected = () => toast.error('🔌 Lost connection to real-time updates', { duration: 3000 });
        const onError = (error) => {
            console.error('Pusher connection error:', error);
            toast.error('❌ Error connecting to real-time updates', { duration: 4000 });
        };

        conn.bind('connected', onConnected);
        conn.bind('disconnected', onDisconnected);
        conn.bind('error', onError);

        return () => {
            conn.unbind('connected', onConnected);
            conn.unbind('disconnected', onDisconnected);
            conn.unbind('error', onError);
        };
    }, []);

    const currentCandidates = getCandidatesByPosition(currentPosition);
    const hasCandidates = currentCandidates.length > 0;

    const isCurrentPositionValid = () => {
        if (!currentPosition) return false;
        if (currentCandidates.length === 0) return true; // Skip empty positions
        return !!voteForm.data[currentPositionKey];
    };

    // Navigation functions
    const goToNextPosition = () => {
        let nextIndex = currentPositionIndex + 1;
        while (nextIndex < validPositions.length && getCandidatesByPosition(validPositions[nextIndex].name).length === 0) {
            nextIndex++;
        }
        if (nextIndex < validPositions.length) setCurrentPositionIndex(nextIndex);
    };

    const goToPrevPosition = () => {
        let prevIndex = currentPositionIndex - 1;
        while (prevIndex >= 0 && getCandidatesByPosition(validPositions[prevIndex].name).length === 0) {
            prevIndex--;
        }
        if (prevIndex >= 0) setCurrentPositionIndex(prevIndex);
    };

    // Handle vote submission
    const submitVote = (e) => {
        e.preventDefault();
        setIsLoading(true);

        voteForm.post(route('bsa.vote'), {
            onFinish: () => setIsLoading(false),
        });
    };

    const handleExplicitSubmit = (e) => {
        e.preventDefault();
        if (currentPositionIndex === validPositions.length - 1 && isCurrentPositionValid()) {
            submitVote(e);
        }
    };

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.custom(t => (
                <div className="relative bg-green-500 text-white px-4 py-3 rounded shadow-md w-72 transition-all duration-300">
                    <button onClick={() => toast.dismiss(t.id)} className="absolute top-1 right-2 text-white hover:text-gray-200 text-lg font-bold">&times;</button>
                    <div>{flash.success}</div>
                    <div className="mt-2 h-1 w-full bg-green-700 overflow-hidden rounded">
                        <div className="bg-white h-full animate-progressBar" />
                    </div>
                </div>
            ), { duration: 2000 });
        }

        if (flash?.error) {
            toast.custom(t => (
                <div className="relative bg-red-500 text-white px-4 py-3 rounded shadow-md w-72 transition-all duration-300">
                    <button onClick={() => toast.dismiss(t.id)} className="absolute top-1 right-2 text-white hover:text-gray-200 text-lg font-bold">&times;</button>
                    <div>{flash.error}</div>
                    <div className="mt-2 h-1 w-full bg-red-700 overflow-hidden rounded">
                        <div className="bg-white h-full animate-progressBar" />
                    </div>
                </div>
            ), { duration: 3000 });
        }
    }, [flash]);

    const VotingSpinner = () => (
        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
    );

    if (needsProfileCompletion) {
        return (
            <AuthenticatedLayout
                header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Complete Profile</h2>}
            >
                <Head title="Complete Profile" />
                <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 relative overflow-hidden py-12">
                    <Toaster position="top-right" />

                    {/* Animated Background Elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
                    </div>

                    {/* Floating Icons */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-1/4 w-8 h-8 text-white/10 animate-bounce" style={{ animationDelay: '0s' }}>
                            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        </div>
                        <div className="absolute top-40 right-1/4 w-6 h-6 text-white/10 animate-bounce" style={{ animationDelay: '2s' }}>
                            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <div className="absolute bottom-40 left-1/5 w-7 h-7 text-white/10 animate-bounce" style={{ animationDelay: '1s' }}>
                            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2v-7.5c0-.83.67-1.5 1.5-1.5S12 9.67 12 10.5V15h2v3h3v-3h1v5H4z" />
                            </svg>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="max-w-md mx-auto px-4">
                            {/* Header Section */}
                            <div className="text-center mb-8">

                                <h1 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                                    Complete Your Profile so You Can Vote
                                </h1>
                                <p className="text-blue-200/80 text-sm leading-relaxed">
                                    Student ID, First name, and Last name should match your NEMSU portal account
                                </p>
                            </div>

                            {/* Form Container */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 transform transition-all duration-500 hover:scale-[1.01]">
                                <form onSubmit={submitProfile} className="space-y-6">
                                    {/* Student ID Field */}
                                    <div className="group">
                                        <Label
                                            htmlFor="student_id"
                                            value="Student ID"
                                            className="text-gray-700 font-semibold flex items-center mb-2"
                                        />
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                            <Input
                                                id="student_id"
                                                value={completeForm.data.student_id}
                                                onChange={(e) => completeForm.setData('student_id', e.target.value)}
                                                className="w-full pl-12 pr-4 border-2 border-gray-200 rounded-xl text-gray-900"
                                                placeholder="Enter your student ID #"
                                                required
                                            />
                                        </div>
                                        <InputError message={completeForm.errors.student_id} />
                                    </div>
                                    {/* Last Name Field */}
                                    <div className="group">
                                        <Label htmlFor="lastname" value="Last Name" className="text-gray-700 font-semibold mb-2" />
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                            <Input
                                                id="lastname"
                                                value={completeForm.data.lastname}
                                                onChange={(e) => completeForm.setData('lastname', e.target.value)}
                                                className="w-full pl-12 pr-4 border-2 border-gray-200 rounded-xl text-gray-900"
                                                placeholder="Enter your last name"
                                                required
                                            />
                                        </div>
                                        <InputError message={completeForm.errors.lastname} />
                                    </div>
                                    {/* First Name Field */}
                                    <div className="group">
                                        <Label htmlFor="name" value="First Name" className="text-gray-700 font-semibold mb-2" />
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                            <Input
                                                id="name"

                                                onChange={(e) => completeForm.setData('name', e.target.value)}
                                                className="w-full pl-12 pr-4 border-2 border-gray-200 rounded-xl text-gray-900"
                                                placeholder="Enter your first name"
                                                required
                                            />
                                        </div>
                                        <InputError message={completeForm.errors.name} />
                                    </div>


                                    {/* Last Name Field */}
                                    <div className="group">
                                        <Label htmlFor="middle_name" value="Middle Name" className="text-gray-700 font-semibold mb-2" />
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                            <Input
                                                id="middle_name"
                                                value={completeForm.data.middle_name}
                                                onChange={(e) => completeForm.setData('middle_name', e.target.value)}
                                                className="w-full pl-12 pr-4 border-2 border-gray-200 rounded-xl text-gray-900"
                                                placeholder="Enter your Middle name"
                                            />
                                        </div>
                                        <InputError message={completeForm.errors.middle_name} />
                                    </div>
                                    {/* Course Program Field */}
                                    <div className="group">
                                        <Label htmlFor="course_program" value="Course Program" className="text-gray-700 font-semibold mb-2" />
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                            </svg>
                                            <select
                                                id="course_program"
                                                value={completeForm.data.course_program}
                                                onChange={(e) => completeForm.setData('course_program', e.target.value)}
                                                className="w-full pl-12 pr-4 border-2 border-gray-200 rounded-xl text-gray-900"
                                                required
                                            >
                                                <option value="" className="text-gray-400"></option>
                                                <option value="BSCS">BS Computer Science</option>
                                                <option value="BSCTE">BS in Teachers Education</option>
                                                <option value="BSA">BS in Agriculture </option>
                                                <option value="BSHM">BS in Hospitality Management</option>
                                                <option value="BSBA">BS in Business Administration</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <InputError message={completeForm.errors.course_program} />
                                    </div>

                                    {/* Year Level Field */}
                                    <div className="group">
                                        <Label htmlFor="year" value="Year Level" className="text-gray-700 font-semibold mb-2" />
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                                            </svg>
                                            <select
                                                id="year"
                                                value={completeForm.data.year}
                                                onChange={(e) => completeForm.setData('year', e.target.value)}
                                                className="w-full pl-12 pr-4 border-2 border-gray-200 rounded-xl text-gray-900"
                                                required
                                            >
                                                <option value="">Select Year Level</option>
                                                <option value="1st">1st Year</option>
                                                <option value="2nd">2nd Year</option>
                                                <option value="3rd">3rd Year</option>
                                                <option value="4th">4th Year</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <InputError message={completeForm.errors.year} />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className={`w-full py-3 px-6 rounded-xl font-bold text-white text-lg shadow-xl transition-all duration-300 transform ${isLoading
                                            ? 'bg-gray-400 cursor-not-allowed scale-95'
                                            : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-purple-200'
                                            } flex items-center justify-center space-x-2`}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                                <span>Submit</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="text-center mt-8">
                                <p className="text-blue-200/60 text-xs">
                                    Secure • Fast • NEMSU Verified
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }
    if (auth.user?.course_program !== "BSA") {
        toast.error("Marokoy sab kaha! HAahahahh", { duration: 4000 });
        router.get(route('dashboard'));
        return null;
    }
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Choose Deserving BSA Candidates</h2>
                    <div className="flex items-center space-x-2">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${electionStarted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <div className={`w-2 h-2 rounded-full mr-1 ${electionStarted ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            {electionStarted ? 'Live' : 'Paused'}
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Vote - BSA" />
            <div className="py-12">
                <Toaster position="top-right" />

                {electionStarted && !isVotingClosed ? (
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            {hasCandidates ? (
                                <>
                                    {election && election.status === "Started" && (
                                        <div className="my-4">
                                            <CountdownToEnd
                                                startTime={election.start_time}
                                                endTime={election.end_time}
                                                onEnd={handleCountdownEnd}
                                            />
                                        </div>
                                    )}
                                    <h2 className="text-xl font-bold mb-6 capitalize">{currentPosition?.replace(/_/g, ' ')}</h2>
                                    <form onSubmit={handleExplicitSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentCandidates.map((candidate) => (
                                                <div key={candidate.id} className={`border rounded-lg p-4 transition-all ${voteForm.data[currentPositionKey] === candidate.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                    <div className="flex flex-col items-center space-x-4">
                                                        <img src={candidate.image ? `/storage/${candidate.image}` : '/images/default-avatar.png'} alt={candidate.name} className="h-16 w-16 rounded-full object-cover border-2 border-white shadow" />
                                                        <div className="flex-1 min-w-0 w-full text-center">
                                                            <div className="flex items-center justify-center">
                                                                <h4 className="text-lg font-medium text-gray-900 truncate mr-2">{candidate.name}</h4>
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{candidate.course_program}</span>
                                                            </div>
                                                            <div className="mt-3">
                                                                <input type="radio" id={`${currentPositionKey}-${candidate.id}`} name={currentPositionKey} checked={voteForm.data[currentPositionKey] === candidate.id} onChange={() => voteForm.setData(currentPositionKey, candidate.id)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                                                <label htmlFor={`${currentPositionKey}-${candidate.id}`} className="ml-2 text-sm font-medium text-gray-700">Select</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between pt-4 border-t">
                                            <button type="button" onClick={goToPrevPosition} disabled={currentPositionIndex === 0} className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${currentPositionIndex === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'}`}>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Previous
                                            </button>

                                            {currentPositionIndex < validPositions.length - 1 ? (
                                                <button type="button" onClick={goToNextPosition} disabled={!isCurrentPositionValid()} className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${!isCurrentPositionValid() ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}>
                                                    Next
                                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button type="submit" disabled={!isCurrentPositionValid() || isLoading} className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${!isCurrentPositionValid() || isLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}>
                                                    {isLoading ? <VotingSpinner /> : 'Submit Vote'}
                                                    {!isLoading && (
                                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">No candidates available yet</h3>
                                    <p className="text-gray-500">Please check back later when candidates have been added.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-yellow-800 mb-2">Election is currently paused</h3>
                            <p className="text-yellow-700">Voting will be available when the election starts.</p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}