import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import React from 'react';
import { toast, Toaster } from 'react-hot-toast';
import HomeLayout from '@/Layouts/HomeLayout';
import CountdownToEnd from '@/Components/CountdownToEnd';
import axios from 'axios';

export default function Result({ candidates, election = null, auth = {} }) {

    const [electionStarted, setElectionStarted] = useState(election && election.status === 'Started');
    const [isClosed, setIsClosed] = useState(election?.status === 'Closed');
    const [filterPosition, setFilterPosition] = useState('all');
    // Derived values AFTER state
    const filteredCandidates = candidates
        .filter(candidate => filterPosition === 'all' || candidate.position === filterPosition)
        .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));

    const uniquePositions = [...new Set(candidates.map(candidate => candidate.position))];
    const hasCandidates = candidates?.length > 0;

    // ---Listen for election status changes ---
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

            } else if (e?.status === 'Paused') {
                toast.error('⏸️ Election paused.');
            } else if (e?.status === 'Closed') {
                setIsClosed(true);
                toast.success(' Election has ended. Final results showed.');
            }
        });

        return () => window.Echo.leave('election-channel');
    }, []);


    // Fetch latest election status
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

    // Handle countdown end
    const handleCountdownEnd = async () => {
        toast.success('Voting has ended Results is now available!');
        setIsClosed(true);

        try {
            await router.post(route('election.close'), { id: election?.id });
        } catch (err) {
            console.error('Failed to close election automatically', err);
        }
    };

    return (
        <HomeLayout>
            <Head title="Candidates" />
            <Toaster position="top-right" reverseOrder={false} />

            <div className="py-4">

                <div className="mx-auto max-w-7xl px-4 sm:px-2 lg:px-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        🔄 Refresh
                    </button>&nbsp; &nbsp; &nbsp;
                    <span>if something went wrong</span>
                    <div className="overflow-hidden bg-white mt-8 shadow-sm sm:rounded-lg">
                        {!electionStarted ? (
                            <div className="text-center max-w-md mx-auto p-8">
                                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                    No Active Election
                                </h2>
                            </div>
                        ) : isClosed ? (
                            <div className="p-2 sm:p-2">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                                    <h2 className="text-lg font-bold text-gray-800">All Candidates</h2>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                        <div className="flex items-center gap-2">
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
                                    </div>
                                </div>
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
                                                    <th className="py-3 px-4">Name</th>
                                                    <th className="py-3 px-4">Position</th>
                                                    <th className="py-3 px-4">Party List</th>
                                                    <th className="py-3 px-4">Course</th>
                                                    <th className="py-3 px-4">Votes</th>
                                                    <th className="py-3 px-4">Image</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCandidates.map((candidate) => (
                                                    <tr key={candidate.id} className="border-t hover:bg-gray-50 text-sm text-gray-800">
                                                        <td className="py-3 px-4 font-medium">{candidate.name}</td>
                                                        <td className="py-3 px-4 capitalize">{candidate.position.replace(/_/g, ' ')}</td>
                                                        <td className="py-3 px-4">{candidate.party_list}</td>
                                                        <td className="py-3 px-4">{candidate.course_program}</td>
                                                        <td className="py-3 px-4 font-bold text-blue-600">{candidate.votes_count || 0}</td>
                                                        <td className="py-3 px-4">
                                                            {candidate.image ? (
                                                                <img
                                                                    src={`/storage/${candidate.image}`}
                                                                    alt={candidate.name}
                                                                    className="w-12 h-12 object-cover rounded-full border"
                                                                />
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">No image</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4">
                                    {filteredCandidates.map((candidate) => (
                                        <div key={candidate.id} className="bg-white rounded-lg shadow border p-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                                    {candidate.image ? (
                                                        <img
                                                            src={`/storage/${candidate.image}`}
                                                            alt={candidate.name}
                                                            className="w-16 h-16 object-cover rounded-full border"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs">No image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-base font-semibold text-gray-900 truncate">
                                                            {candidate.name}
                                                        </h3>
                                                        <span className="text-xs font-bold text-blue-600">
                                                            {candidate.votes_count || 0} votes
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center">
                                                            <span className="text-xs font-medium text-gray-500 w-20">Position:</span>
                                                            <span className="text-sm text-gray-800 capitalize">
                                                                {candidate.position.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-xs font-medium text-gray-500 w-20">Party:</span>
                                                            <span className="text-sm text-gray-800">{candidate.party_list}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-xs font-medium text-gray-500 w-20">Course:</span>
                                                            <span className="text-sm text-gray-800">{candidate.course_program}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredCandidates.length === 0 && candidates.length > 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No candidates found for the selected position.</p>
                                        <button
                                            onClick={() => setFilterPosition('all')}
                                            className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
                                        >
                                            Show all candidates
                                        </button>
                                    </div>
                                )}

                                {candidates.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No candidates found. Add your first candidate!</p>
                                    </div>
                                )}
                            </div>

                        ) : !hasCandidates ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                                <h2 className="text-2xl font-semibold text-gray-700 mb-3">Election Data Unavailable</h2>
                                <p className="text-gray-500">No candidates found.</p>
                            </div>
                        ) : (
                            <>
                                {election && election.status === 'Started' && !isClosed && (
                                    <div className="my-4">
                                        <CountdownToEnd
                                            startTime={election.start_time}
                                            endTime={election.end_time}
                                            onEnd={handleCountdownEnd}
                                        />
                                    </div>
                                )}
                                <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 border border-red-300 rounded-xl">
                                    <h2 className="text-2xl font-bold text-red-700 mb-2"> Results will Show when count down ends</h2>
                                    <p className="text-red-600">Voting has Started. Results are now locked.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </HomeLayout >
    );
}

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