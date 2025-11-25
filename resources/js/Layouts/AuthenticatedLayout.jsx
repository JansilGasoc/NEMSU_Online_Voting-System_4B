import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { DocumentTextIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop sidebar collapse toggle

    const toggleSidebarCollapse = () => setIsCollapsed(!isCollapsed);

    // Profile Avatar Component
    const ProfileAvatar = ({ className = "" }) => {
        if (user.profile_picture) {
            return (
                <img
                    src={user.profile_picture}
                    alt="Profile"
                    className={`rounded-full object-cover border border-gray-300 shadow-sm ${className}`}
                />
            );
        }

        return (
            <div className={`rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white border-2 border-gray-200 shadow-sm ${className}`}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-2/3 h-2/3"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                </svg>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-x-hidden">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-20 sm:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed sm:relative top-0 left-0 z-30 bg-gradient-to-b from-indigo-900 to-indigo-800 shadow-xl min-h-screen transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
                aria-expanded={!isCollapsed}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-700">
                    {!isCollapsed && (
                        <div className="text-white font-bold text-lg">

                        </div>
                    )}

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="sm:hidden text-indigo-200 hover:text-white focus:outline-none transition-all duration-200 hover:scale-110"
                        aria-label="Close mobile sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="mt-6 px-4 space-y-3">
                    <NavLink
                        href={route('dashboard')}
                        active={route().current('dashboard')}
                        className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg group ${route().current('dashboard')
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-indigo-200 hover:text-white'
                            }`}
                    >
                        <DocumentTextIcon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`} />
                        {!isCollapsed && <span className="font-medium">USG voting form</span>}
                    </NavLink>


                    <NavLink
                        href={route('profile.edit')}
                        active={route().current('profile.edit')}
                        className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg group ${route().current('profile.edit')
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-indigo-200 hover:text-white'
                            }`}
                    >
                        <UserCircleIcon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`} />
                        {!isCollapsed && <span className="font-medium">Profile</span>}
                    </NavLink>
                    <br />
                    <hr />

                    {/* BSCS voting form - Only show if user is BSCS */}
                    {auth.user?.course_program === 'BSCS' && (
                        <NavLink
                            href={route('getbscsview')}
                            active={route().current('getbscsview')}
                            className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg group ${route().current('getbscsview')
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-indigo-200 hover:text-white'
                                }`}
                        >
                            <img
                                src="/storage/logo/comscie.jpg"
                                className={`h-9 w-9 rounded-full ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}
                            />
                            {!isCollapsed && <span className="font-medium">BSCS voting form</span>}
                        </NavLink>
                    )}

                    {/* BSBA voting form - Only show if user is BSBA */}
                    {auth.user?.course_program === 'BSBA' && (
                        <NavLink
                            href={route('getbsbaview')}
                            active={route().current('getbsbaview')}
                            className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg group ${route().current('getbsbaview')
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-indigo-200 hover:text-white'
                                }`}
                        >
                            <img
                                src="/storage/logo/bsba.png"
                                className={`h-9 w-9 rounded-full ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}
                            />
                            {!isCollapsed && <span className="font-medium">BSBA voting form</span>}
                        </NavLink>
                    )}

                    {/* BSHM voting form - Only show if user is BSHM */}
                    {auth.user?.course_program === 'BSHM' && (
                        <NavLink
                            href={route('getbshmview')}
                            active={route().current('getbshmview')}
                            className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg group ${route().current('getbshmview')
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-indigo-200 hover:text-white'
                                }`}
                        >
                            <img
                                src="/storage/logo/hms.png"
                                className={`h-9 w-9 rounded-full ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}
                            />
                            {!isCollapsed && <span className="font-medium">BSHM voting form</span>}
                        </NavLink>
                    )}

                    {/* BSA voting form - Only show if user is BSA */}
                    {auth.user?.course_program === 'BSA' && (
                        <NavLink
                            href={route('getbsaview')}
                            active={route().current('getbsaview')}
                            className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg group ${route().current('getbsaview')
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-indigo-200 hover:text-white'
                                }`}
                        >
                            <img
                                src="/storage/logo/bsa.jpg"
                                className={`h-9 w-9 rounded-full ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}
                            />
                            {!isCollapsed && <span className="font-medium">BSA voting form</span>}
                        </NavLink>
                    )}

                    {/* BSCTE voting form - Only show if user is BSCTE */}
                    {['BSED', 'BEED'].includes(auth.user?.course_program) && (
                        <NavLink
                            href={route('getbscteview')}
                            active={route().current('getbscteview')}
                            className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg group ${route().current('getbscteview')
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-indigo-200 hover:text-white'
                                }`}
                        >
                            <img
                                src="/storage/logo/educs.png"
                                className={`h-9 w-9 rounded-full ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}
                            />
                            {!isCollapsed && <span className="font-medium">CTE voting form</span>}
                        </NavLink>
                    )}

                    <hr />
                    <Link href={route('logout')} method="post" as="button"
                        active={route().current('logout')}
                        className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg group ${route().current('user.livetally')
                            ? 'text-white shadow-md'
                            : 'text-indigo-200 hover:text-white'
                            }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}>
                            <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
                        </svg>
                        {!isCollapsed && <span className="font-medium">Log out</span>}
                    </Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Nav */}
                <nav className="bg-white border-b border-gray-100 sticky top-0 z-0">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between items-center">
                            <div className="flex items-center">
                                {/* Mobile sidebar toggle */}
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="sm:hidden text-gray-600 hover:text-gray-800 mr-4 focus:outline-none"
                                    aria-label="Toggle mobile sidebar"
                                >
                                    ☰
                                </button>

                                {/* Desktop collapse toggle */}
                                <button
                                    onClick={toggleSidebarCollapse}
                                    className="hidden sm:block text-gray-600 hover:text-gray-800 mr-4 focus:outline-none"
                                    aria-label="Collapse sidebar"
                                >
                                    ☰
                                </button>
                            </div>

                            {/* User dropdown */}
                            <div className="hidden sm:flex sm:items-center">
                                {/* Profile Avatar with fallback */}
                                <div className="mr-2">
                                    <ProfileAvatar className="w-8 h-8" />
                                </div>

                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                            >
                                                <span>{user.name}</span>

                                                <svg
                                                    className="ml-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Optional header section */}
                {header && (
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Page content */}
                <main className="flex-1 p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}