import { Link, Head } from '@inertiajs/react';
import HomeLayout from '@/Layouts/HomeLayout';

export default function Terms({ auth }) {
    return (
        <HomeLayout auth={auth}>
            <Head title="Terms and Conditions" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 sm:p-12 space-y-6">
                        {/* Back Button */}
                        <Link
                            href='/'
                            className='inline-flex items-center gap-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors group'
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            <span className="font-semibold">Back to Home</span>
                        </Link>

                        {/* Header */}
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                            <h1 className="text-4xl font-bold text-green-700 dark:text-green-400 mb-3">
                                Terms and Conditions
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg">
                                Welcome to the <span className="font-semibold text-green-600 dark:text-green-400">NEMSU Voting System</span>.
                                By accessing or using this platform, you agree to the following terms and conditions.
                            </p>
                        </div>

                        {/* Content Sections */}
                        <section className="space-y-8 text-gray-700 dark:text-gray-300">
                            <div className="space-y-3">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold">1</span>
                                    Eligibility
                                </h2>
                                <p className="pl-10">
                                    Only registered students and the USG Admin of NEMSU are eligible to use this system
                                    for official voting purposes.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold">2</span>
                                    Account Security
                                </h2>
                                <p className="pl-10">
                                    Users are responsible for maintaining the confidentiality of their login credentials.
                                    Any unauthorized use of an account must be reported immediately.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold">3</span>
                                    Fair Use
                                </h2>
                                <p className="pl-10">
                                    Users must not attempt to manipulate, hack, or disrupt the voting process.
                                    Any violation may result in disciplinary action.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold">4</span>
                                    Data Privacy
                                </h2>
                                <p className="pl-10">
                                    All votes are confidential and secured. No personal voting data will be disclosed.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold">5</span>
                                    Changes to Terms
                                </h2>
                                <p className="pl-10">
                                    NEMSU reserves the right to update these terms and conditions at any time.
                                    Continued use of the system indicates acceptance of the changes.
                                </p>
                            </div>
                        </section>

                        {/* Footer Note */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                    </svg>
                                    <span>
                                        If you have questions about these terms, please contact the system administrator.
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Last Updated */}
                        <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-4">
                            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}