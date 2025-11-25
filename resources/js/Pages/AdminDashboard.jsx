import AuthenticatedLayoutAdmin from '@/Layouts/AuthenticatedLayoutAdmin';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import React from 'react';
import styled from 'styled-components';
import { toast, Toaster } from 'react-hot-toast';
import DestroyElection from '@/Components/DestroyElection';
import ElectionModal from '@/Components/ElectionModal';
import USGWinners from '@/Components/USGWinners';
import CountdownToEnd from '@/Components/CountdownToEnd';
import { ExclamationTriangleIcon as ExclamationIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import USGDownloadResults from '../Components/USGDownloadResults';

export default function AdminDashboard({ validated = [], winners, candidates_count, election, warning, candidates, positions }) {
    const { flash } = usePage().props;
    const [dragActive, setDragActive] = useState(false);
    const [showDuplicates, setShowDuplicates] = useState(false);
    const isDisabled = !election || election.status === "Started" || candidates.length === 0;
    // File upload form
    const {
        data: uploadData,
        setData: setUploadData,
        post: uploadPost,
        processing: uploadProcessing,
        errors: uploadErrors,
        reset: uploadReset,
    } = useForm({
        file: null,
    });


    // File upload handlers
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
        uploadPost(route('import.validate'), {
            preserveScroll: true,
        });
    };

    const handleCountdownEnd = async () => {
        toast.error('Voting has ended!');

        try {
            await router.post(route('election.close'), { id: election?.id });
            router.reload({ preserveScroll: true });
        } catch (err) {
            console.error('Failed to close election automatically', err);
        }
    };
    // Flash message handling
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.duplicates) {
            setShowDuplicates(true);
            const timer = setTimeout(() => setShowDuplicates(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);
    return (
        <AuthenticatedLayoutAdmin
            header={
                <div className="flex items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>
                    {flash?.duplicates && showDuplicates && (
                        <div className="ml-4 bg-yellow-100 p-2 rounded text-yellow-800">
                            <p className="font-semibold">Duplicate student IDs:</p>
                            <ul className="text-xs">
                                {flash.duplicates.map((d, i) => (
                                    <li key={i}>{d.student_id} - {d.first_name} {d.last_name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard" />
            <div className="py-8">
                <Toaster position="top-right" />

                {/* Warning Message */}
                {warning && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex items-center">
                            <ExclamationIcon className="h-5 w-5 text-yellow-400 mr-3" />
                            <p className="text-sm text-yellow-700">
                                {warning}
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="ml-2 text-sm font-medium text-yellow-700 underline hover:text-yellow-600"
                                >
                                    Create one now
                                </button>
                            </p>
                        </div>
                    </div>
                )}
                {/* Statistics */}
                {validated.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600 mb-1">
                                        Total Verified Students
                                    </p>
                                    <p className="text-4xl font-bold text-slate-900">
                                        {validated.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600">Students Have Voted</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {validated.filter(s => (s.votes_count || 0) > 0).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <div className="flex items-center">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600">Pending</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {validated.filter(s => (s.votes_count || 0) === 0).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Download Card View */}
                        <div className="relative">
                            <div
                                className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col items-start justify-between h-full transition-all ${isDisabled ? "opacity-60" : "opacity-100"
                                    }`}
                                aria-disabled={isDisabled}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 mb-10 bg-slate-100 rounded-lg text-slate-600">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                                            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                                        </svg>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-slate-600">USG Download Results</h3>
                                        <div className="mt-2 flex items-center gap-2">
                                            <USGWinners winners={winners}
                                                election={election}
                                                candidates={candidates}
                                                className="text-md font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md px-3 transition disabled:cursor-not-allowed disabled:bg-slate-400"
                                                disabled={isDisabled} />
                                            <USGDownloadResults
                                                candidates={candidates}
                                                election={election}
                                                className="text-md font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md px-3 transition disabled:cursor-not-allowed disabled:bg-slate-400"
                                                disabled={isDisabled}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Disabled message */}
                                {isDisabled && (
                                    <p className="mt-3 text-xs font-medium text-yellow-500">
                                        {!election
                                            ? "No active election found."
                                            : election.status === "Started"
                                                ? "Election already started — results disabled."
                                                : candidates.length === 0
                                                    ? "No candidates available."
                                                    : ""}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <br />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Validate Students Card */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">

                        <div className=" flex items-center">

                            <div className="mx-auto">
                                <div className="mx-auto">
                                    <form onSubmit={submitUpload} encType="multipart/form-data">
                                        <div
                                            className={` rounded-lg  text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                                                }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('file-input')?.click()}
                                        >
                                            <input
                                                id="file-input"
                                                type="file"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <StyledWrapper>
                                                <div className="button">
                                                    <div className="container">
                                                        <div className="folder folder_one" />
                                                        <div className="folder folder_two" />
                                                        <div className="folder folder_three" />
                                                        <div className="folder folder_four" />
                                                    </div>
                                                    <div className="active_line" />
                                                    <span className="text">File Explorer</span>
                                                </div>
                                            </StyledWrapper>
                                            <p className="mt-2 text-sm text-gray-600">
                                                <span className="font-medium text-blue-600">Click to upload</span>
                                            </p>

                                            {uploadData.file && (
                                                <p className="mt-3 text-sm font-medium text-gray-900">
                                                    Selected file: {uploadData.file.name}
                                                </p>
                                            )}
                                        </div>

                                        {uploadErrors.file && (
                                            <p className="mt-2 text-sm text-red-600">{uploadErrors.file}</p>
                                        )}

                                        <div className="mt-4 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={uploadProcessing || !uploadData.file}
                                                className={`px-4 py-2 rounded-md text-sm font-medium ${uploadProcessing || !uploadData.file
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                {uploadProcessing ? 'Uploading...' : 'Import validated students'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Voted Users Card */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-green-100 rounded-full mb-3">
                            <UserGroupIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Total Current Candidates</p>
                        <p className="text-2xl font-semibold text-gray-900">
                            {candidates_count || 0}
                        </p>

                    </div>

                    {/* Election Status Card */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">

                        <h1 className='font-bold '>{election?.election_name || "Election not Set"}</h1>
                        <div className="flex justify-end mb-4">

                            <ElectionModal
                                disabled={Array.isArray(election) ? election.length > 0 : !!election}
                            />

                        </div>

                        {/* Election Items */}
                        <div className="space-y-4">
                            {Array.isArray(election) && election.length > 0 ? (
                                election.map((electionItem) => (
                                    <div
                                        key={electionItem.id}
                                        className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md"
                                    >
                                        <span className="font-medium">{electionItem.title}</span>
                                        <DestroyElection
                                            electionId={electionItem.id}
                                            onSuccess={() =>
                                                router.reload({ preserveScroll: true })
                                            }
                                        />
                                    </div>
                                ))
                            ) : election ? (
                                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md">
                                    <span className="font-medium"> Status <span className='bg-red-500 px-4 text-gray-100 rounded-sm'>{election.status}</span> </span>
                                    <DestroyElection
                                        electionId={election.id}
                                        onSuccess={() => router.reload({ preserveScroll: true })}
                                    />
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No elections found</p>
                            )}
                        </div>

                        {/* Countdown */}
                        {((Array.isArray(election) && election.length > 0 && election[0].status === 'Started') ||
                            (election && election.status === 'Started')) && (
                                <div className="mt-6">
                                    <CountdownToEnd
                                        startTime={Array.isArray(election) ? election[0].start_time : election.start_time}
                                        endTime={Array.isArray(election) ? election[0].end_time : election.end_time}
                                        onEnd={handleCountdownEnd}
                                    />
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayoutAdmin>
    );
}
const StyledWrapper = styled.div`
  .bauble_box .bauble_label {
    background: #2c2;
    background-position: 62px 5px;
    background-repeat: no-repeat;
    background-size: auto 5px;
    border: 0;
    border-radius: 50px;
    box-shadow: inset 0 10px 20px rgba(0,0,0,.4), 0 -1px 0px rgba(0,0,0,.2), inset 0 -1px 0px #fff;
    cursor: pointer;
    display: inline-block;
    font-size: 0;
    height: 40px;
    position: relative;
    -webkit-transition: all 500ms ease;
    transition: all 500ms ease;
    margin: auto;
    padding: 0;
  }

  .bauble_box .bauble_label:before {
    background-color: rgba(255,255,255,.2);
    background-position: 0 0;
    background-repeat: repeat;
    background-size: 30% auto;
    border-radius: 50%;
    box-shadow: inset 0 -5px 25px #050, 0 10px 20px rgba(0,0,0,.4);
    content: '';
    display: block;
    height: 30px;
    left: 5px;
    position: absolute;
    top: 6px;
    -webkit-transition: all 500ms ease;
    transition: all 500ms ease;
    width: 30px;
    z-index: 2;
  }

  .bauble_box input.bauble_input {
    opacity: 0;
    z-index: 0;
  }

  /* Checked */
  .bauble_box input.bauble_input:checked + .bauble_label {
    background-color: #c22;
  }

  .bauble_box input.bauble_input:checked + .bauble_label:before {
    background-position: 150% 0;
    box-shadow: inset 0 -5px 25px #500, 0 10px 20px rgba(0,0,0,.4);
    left: calc( 100% - 35px );
  }
     .button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
 
    height: 5.3em;
    border: none;
    cursor: pointer;
    border-radius: 0.4em;
    background: rgba(235, 252, 254, 0.8);
  }

  .container {
    position: relative;
    width: 4.5em;
    height: 3.1em;
    background: none;
  
  }

  .folder {
    content: "";
    position: absolute;
    /* box-shadow: 0 0 5px rgba(0, 0, 0, .3); */
  }

  .folder_one {
    bottom: 0;
    width: 100%;
    height: 88%;
    border-radius: 3px;
    border-top: 2px solid rgb(206, 167, 39);
    /* background-color: rgb(252, 212, 80); */
    background: linear-gradient(-35deg, rgb(238, 194, 47) 5%, rgb(255, 223, 118));
  }

  .folder_two {
    top: 5%;
    width: 38%;
    height: 19%;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    background-color: rgb(206, 167, 39);
    box-shadow: 0 1px 5px -2px rgba(0, 0, 0, 0.5);
  }

  .folder_two::before {
    content: "";
    position: absolute;
    display: inline;
    left: 88%;
    width: 0;
    height: 0;
    border-left: 7px solid rgb(206, 167, 39);
    border-top: 0.3em solid transparent;
    border-bottom: 0.3em solid transparent;
    /* background-color: rgb(206, 167, 39); */
  }

  .folder_three {
    display: flex;
    align-items: center;
    justify-content: center;
    left: 0.5em;
    bottom: 0;
    width: 2.5em;
    height: 0.9em;
    border-radius: 4px 4px 0 0;
    background: linear-gradient(-35deg, rgb(25, 102, 218), rgb(109, 165, 249));
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  }

  .folder_four {
    left: 1em;
    bottom: 0.3em;
    width: 1.5em;
    height: 0.18em;
    border-radius: 1em;
    background-color: rgb(20, 77, 163);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .active_line {
    content: "";
    position: absolute;
    bottom: 0;
    width: 0.9em;
    height: 0.4em;
    background-color: #999;
    border: none;
    border-radius: 1em;
    transition: all 0.15s linear;
  }

  .button:active .active_line,
  .button:focus .active_line {
    width: 2.3em;
    background-color: rgb(41, 126, 255);
  }

  .button:focus .container {
    animation: wow 1s forwards;
  }

  @keyframes wow {
    20% {
      scale: 0.8;
    }

    30% {
      scale: 1;
      transform: translateY(0);
    }

    50% {
      transform: translateY(-6px);
    }

    65% {
      transform: translateY(4px);
    }

    80% {
      transform: translateY(0);
    }

    100% {
      scale: 1;
    }
  }

  .text {
    content: "";
    position: absolute;
    top: -4.5em;
    width: 7.7em;
    height: 2.6em;
    background-color: #666;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: 5px;
    text-shadow: 0 0 10px rgb(0, 0, 0);
    opacity: 0;
    transition: all 0.25s linear;
  }

  .button:hover .text {
    opacity: 1;
  }`;

