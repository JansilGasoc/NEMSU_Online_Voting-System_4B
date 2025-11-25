import HomeLayout from '@/Layouts/HomeLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import CandidateChart from '@/Components/CandidateChart';
import CountdownToEnd from '@/Components/CountdownToEnd';
import axios from 'axios';

export default function LiveTally({ candidates: initialCandidates = [], positions = [], election = null, auth = {} }) {
    const [candidates, setCandidates] = useState(initialCandidates);
    const [electionStarted, setElectionStarted] = useState(election && election.status === 'Started');
    const [isClosed, setIsClosed] = useState(election?.status === 'Closed');

    // --- 🗳 Listen for vote updates ---
    useEffect(() => {
        if (!window?.Echo) return;

        const voteChannel = window.Echo.channel('votes');
        voteChannel.listen('.vote.casted', (e) => {
            setCandidates((prev) =>
                prev.map((c) =>
                    c.id === e.candidate.id ? { ...c, votes_count: e.candidate.votes_count } : c
                )
            );
        });

        return () => window.Echo.leave('votes');
    }, []);

    // --- 🔄 Listen for election status changes ---
    useEffect(() => {
        if (!window?.Echo) return;

        const electionChannel = window.Echo.channel('election-channel');
        electionChannel.listen('ElectionStatusUpdated', (e) => {
            const started = Array.isArray(e?.elections)
                ? e.elections.some((el) => el.status === 'Started')
                : e?.status === 'Started';

            setElectionStarted(started);

            if (started) {
                setIsClosed(false);
                toast.success('🗳️ Election has started! Live tally active.');
            } else if (e?.status === 'Paused') {
                toast.error('⏸️ Election paused.');
            } else if (e?.status === 'Closed') {
                setIsClosed(true);
                toast.success('✅ Election has ended. Final results locked.');
            }
        });

        return () => window.Echo.leave('election-channel');
    }, []);

    // ---  Fetch latest election status ---
    useEffect(() => {
        async function fetchElectionStatus() {
            try {
                const res = await axios.get('/api/election/status');
                setElectionStarted(res.data.status === 'Started');
                setIsClosed(res.data.status === 'Closed');
            } catch (err) {
                console.error('Failed to fetch election status', err);
            }
        }
        fetchElectionStatus();
    }, []);

    // --- Handle countdown end ---
    const handleCountdownEnd = async () => {
        toast.error(' Voting has ended!');
        setIsClosed(true);

        try {
            await router.post(route('election.close'), { id: election?.id });
        } catch (err) {
            console.error('Failed to close election automatically', err);
        }
    };

    const hasPositions = positions?.length > 0;
    const hasCandidates = candidates?.length > 0;

    return (
        <HomeLayout auth={auth}>
            <Head title="Live Tally" />
            <div className="p-6 max-w-7xl mx-auto">
                <Toaster position="top-right" />

                <div className="mb-6 text-center md:text-left">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        🔄 Refresh

                    </button>&nbsp; &nbsp; &nbsp;
                    <span>if something went wrong</span>
                </div>

                {/*  Countdown Timer */}

                {!electionStarted ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 dark:from-zinc-900 dark:to-black">
                        <div className="text-center max-w-md mx-auto p-8">
                            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                Waiting for Election to Start
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                The live tally will appear automatically once the election begins.
                            </p>
                        </div>
                    </div>
                ) : isClosed ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 border border-red-300 rounded-xl">
                        <h2 className="text-2xl font-bold text-red-700 mb-2">🛑 Election has been ended</h2>

                    </div>
                ) : !hasPositions || !hasCandidates ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Election Data Unavailable</h2>
                        <p className="text-gray-500">No positions or candidates found.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-3">{election.election_name}</h2>

                        {election && election.status === 'Started' && !isClosed && (
                            <div className="my-4">
                                <CountdownToEnd
                                    startTime={election.start_time}
                                    endTime={election.end_time}
                                    onEnd={handleCountdownEnd}
                                />
                            </div>
                        )}
                        {/*  Candidate Charts */}
                        <div className="grid gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {positions.map((position) => {
                                    const filteredCandidates = candidates.filter(
                                        (c) => c.position === position
                                    );
                                    return (
                                        <CandidateChart
                                            key={position}
                                            position={position}
                                            candidates={filteredCandidates}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/*  Status Footer */}
                        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <div className="ml-3">
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        Results update in real-time as votes are cast.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </HomeLayout>
    );
}