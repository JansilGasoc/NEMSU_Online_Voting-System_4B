import { Link } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    HomeIcon,
    ChartBarIcon,
    DocumentTextIcon,
    PlayIcon,
    ArrowRightOnRectangleIcon,
    ComputerDesktopIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function HomeLayout({ auth, children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="bg-gray-50 text-black/70 dark:bg-black dark:text-white/70">
            <div className="relative flex min-h-screen flex-col selection:bg-emerald-600 selection:text-white">
                {/* Header */}
                <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-emerald-800 to-emerald-900 dark:from-zinc-900 dark:to-zinc-800 shadow-xl backdrop-blur-sm border-b border-emerald-700/20 dark:border-zinc-700/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            {/* Left - Logo */}
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="w-10 h-10 rounded-full shadow-lg ring-2 ring-white/20" />
                                <h1 className="text-lg font-bold text-white tracking-tight">
                                    NEMSU Tagbina-campus
                                </h1>
                            </div>

                            {/* Right - Nav Links */}
                            <nav className="hidden md:flex items-center gap-2">
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${route().current('dashboard')
                                            ? 'text-white bg-white/20 font-medium'
                                            : 'text-emerald-100 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        <ChartBarIcon className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('welcome')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${route().current('welcome')
                                                ? 'text-white bg-white/20 font-medium'
                                                : 'text-emerald-100 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <HomeIcon className="w-4 h-4" />
                                            Home
                                        </Link>
                                        <Link
                                            href={route('election.results')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${route().current('election.results')
                                                ? 'text-white bg-white/20 font-medium'
                                                : 'text-emerald-100 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <ChartBarIcon className="w-4 h-4" />
                                            Results
                                        </Link>
                                        <Link
                                            href={route('terms')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${route().current('terms')
                                                ? 'text-white bg-white/20 font-medium'
                                                : 'text-emerald-100 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <DocumentTextIcon className="w-4 h-4" />
                                            Terms & Conditions
                                        </Link>
                                        <Link
                                            href={route('liveTally')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${route().current('liveTally')
                                                ? 'text-white bg-white/20 font-medium'
                                                : 'text-emerald-100 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <PlayIcon className="w-4 h-4" />
                                            Live Tally
                                        </Link>
                                        <Link
                                            href={route('admin.login')}
                                            className="flex items-center gap-2 ml-2 px-4 py-2 text-white font-medium bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-emerald-900"
                                        >
                                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                            Login as Admin
                                        </Link>
                                    </>
                                )}
                            </nav>

                            {/* Mobile Menu Toggle */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    aria-label="Toggle menu"
                                >
                                    {mobileMenuOpen ? (
                                        <XMarkIcon className="h-6 w-6" />
                                    ) : (
                                        <Bars3Icon className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="px-4 py-4 space-y-2 bg-emerald-800/95 dark:bg-zinc-800/95 backdrop-blur-sm border-t border-emerald-700/20">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-3 px-4 py-3 text-white font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <ChartBarIcon className="w-5 h-5" />
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('welcome')}
                                        className="flex items-center gap-3 px-4 py-3 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <HomeIcon className="w-5 h-5" />
                                        Home
                                    </Link>

                                    <Link
                                        href={route('terms')}
                                        className="flex items-center gap-3 px-4 py-3 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <DocumentTextIcon className="w-5 h-5" />
                                        Terms & Conditions
                                    </Link>
                                    <Link
                                        href={route('election.results')}
                                        className="flex items-center gap-3 px-4 py-3 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <ChartBarIcon className="w-5 h-5" />
                                        Results
                                    </Link>
                                    <Link
                                        href={route('liveTally')}
                                        className="flex items-center gap-3 px-4 py-3 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <PlayIcon className="w-5 h-5" />
                                        Live Tally
                                    </Link>

                                    <Link
                                        href={route('admin.login')}
                                        className="flex items-center gap-3 px-4 py-3 text-center text-white font-medium bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 rounded-lg transition-all duration-200 shadow-md"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                        Login as Admin
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-grow">{children}</main>

            </div>
        </div>
    );
}
