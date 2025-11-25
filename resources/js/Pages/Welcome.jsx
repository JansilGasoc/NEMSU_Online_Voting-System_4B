
import { Head } from '@inertiajs/react';
import HomeLayout from '@/Layouts/HomeLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Login from '@/Pages/Auth/Login';

export default function Welcome({ auth }) {
    return (
        <HomeLayout auth={auth}>
            <Head title="NEMSU Tagbina-campus" />

            {/* Main Section */}
            <main className="text-center p-4 lg:p-8 bg-gradient-to-br from-green-900 via-gray-900 to-black px-6">
                <div className="grid gap-10 mt-10 lg:grid-cols-2 lg:gap-8 items-center">
                    {/* Right Column - Login Component */}
                    <div className="flex justify-center">
                        <Login />
                    </div>

                    {/* Left Column - Logo + Title + Description */}
                    <div className="text-center lg:text-left space-y-6">
                        <div className="flex justify-center lg:justify-start">
                            <ApplicationLogo className="rounded-full shadow-lg w-[80px] h-[80px]" alt="NEMSU Logo" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#006400] dark:text-green-400">
                            NEMSU <strong className='text-indigo-400'>Tagbina</strong>USG Online Voting System
                        </h1>
                        <p className="mt-2 text-lg text-gray-400 dark:text-gray-300 max-w-xl mx-auto lg:mx-0">
                            A secure, transparent, and user-friendly online voting platform for the NEMSU community.
                        </p>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid gap-6 mt-10 lg:grid-cols-3 lg:gap-4">
                    <div className="rounded-lg dark:bg-zinc-900 p-6 shadow-md ring-1 ring-gray-200">
                        <h2 className="text-xl font-semibold text-emerald-500">Secure & Transparent</h2>
                        <p className="mt-3 text-sm text-gray-400">
                            Every vote is encrypted and validated, ensuring fair results for every election.
                        </p>
                    </div>

                    <div className="rounded-lg p-6 shadow-md ring-1 ring-gray-200">
                        <h2 className="text-xl font-semibold text-emerald-500">User Friendly</h2>
                        <p className="mt-3 text-sm text-gray-400">
                            Easy-to-use interface for students and administrator.
                        </p>
                    </div>

                    <div className="rounded-lg p-6 shadow-md ring-1 ring-gray-200">
                        <h2 className="text-xl font-semibold text-emerald-500">Real-Time Results</h2>
                        <p className="mt-3 text-sm text-gray-400">
                            See accurate, live results immediately after the voting period ends.
                        </p>
                    </div>
                </div>
            </main>
            <footer className="bg-gradient-to-r from-emerald-800 to-emerald-900 dark:from-zinc-900 dark:to-zinc-800 text-white py-8 border-t border-emerald-700/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-3 mb-4 md:mb-0">

                            <div className="text-left space-y-2 text-gray-400">
                                <p className="font-medium">Frameworks used:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <i className="fa-brands fa-laravel"></i>
                                        <span className="font-medium">Laravel</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-6 text-gray-400 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M11.782 5.72a4.773 4.773 0 0 0-4.8 4.173 3.43 3.43 0 0 1 2.741-1.687c1.689 0 2.974 1.972 3.758 2.587a5.733 5.733 0 0 0 5.382.935c2-.638 2.934-2.865 3.137-3.921-.969 1.379-2.44 2.207-4.259 1.231-1.253-.673-2.19-3.438-5.959-3.318ZM6.8 11.979A4.772 4.772 0 0 0 2 16.151a3.431 3.431 0 0 1 2.745-1.687c1.689 0 2.974 1.972 3.758 2.587a5.733 5.733 0 0 0 5.382.935c2-.638 2.933-2.865 3.137-3.921-.97 1.379-2.44 2.208-4.259 1.231-1.253-.673-2.19-3.443-5.963-3.317Z" />
                                        </svg>
                                        <span className="font-medium">Tailwind CSS</span>
                                    </li>
                                </ul>

                            </div>

                        </div>
                        <div className="flex items-center gap-2 text-emerald-100">
                            <div className="text-left space-y-2 text-gray-400">
                                <p className="font-medium">Languages used:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <i className="fa-brands fa-php"></i>
                                        <span className="font-medium">PHP</span>
                                    </li>
                                    <li className="flex items-center gap-2">


                                        <i class="fa-brands fa-square-js"></i>
                                        <span className="font-medium">Javascript</span>
                                    </li>
                                </ul>

                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-center text-emerald-200 text-sm">

                        © {new Date().getFullYear()} NEMSU Voting System. All rights reserved.
                    </div>
                </div>
            </footer>
        </HomeLayout>
    );
}