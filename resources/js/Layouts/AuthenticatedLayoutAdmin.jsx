import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';

import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Square2StackIcon } from '@heroicons/react/24/outline';

export default function AuthenticatedLayoutAdmin({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop sidebar collapse toggle
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebarCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-orange-50 to-green-50 relative overflow-x-hidden">

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 sm:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`transform top-0 left-0 fixed sm:relative z-30 bg-gradient-to-b from-green-900 via-emerald-800 to-emerald-900 shadow-2xl min-h-screen transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
                aria-expanded={!isCollapsed}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-red-700">
                    {!isCollapsed && (
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-white font-bold text-lg">
                                Admin Panel
                            </div>
                        </div>
                    )}

                    {/* Mobile close button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="sm:hidden text-red-200 hover:text-white focus:outline-none transition-all duration-200 hover:scale-110"
                        aria-label="Close mobile sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    <NavLink
                        href={route('admin.dashboard')}
                        active={route().current('admin.dashboard')}
                        className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-green-700 hover:shadow-lg group ${route().current('admin.dashboard')
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-red-200 hover:text-white'
                            }`}
                    >
                        <Square2StackIcon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`} />
                        {!isCollapsed && <span className="font-medium">Dashboard</span>}
                    </NavLink>
                    <br />
                    <NavLink
                        href={route('candidate.dashboard')}
                        active={route().current('candidate.dashboard')}
                        className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-green-700 hover:shadow-lg group ${route().current('candidate.dashboard')
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-red-200 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                        {!isCollapsed && <span className="font-medium">USG Candidates</span>}
                    </NavLink>

                    <NavLink
                        href={route('admin.view.students')}
                        active={route().current('admin.view.students')}
                        className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-green-700 hover:shadow-lg group ${route().current('admin.validate')
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-red-200 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                        {!isCollapsed && <span className="font-medium">Students</span>}
                    </NavLink>

                    <NavLink
                        href={route('admin.view.verified.students')}
                        active={route().current('admin.view.verified.students')}
                        className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-green-700 hover:shadow-lg group ${route().current('admin.validate.dashboard')
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-red-200 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                        </svg>
                        {!isCollapsed && <span className="font-medium">Verified Voters</span>}
                    </NavLink>


                    <br />
                    <hr />
                    <div className="my-6">
                        {/* Dropdown Header */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center justify-between w-full p-2 bg-green-900 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                        >
                            {!isCollapsed && <span className="text-xl font-semibold">By Department</span>}
                            <span className="transform transition-transform duration-200">
                                {isOpen ? '▲' : '▼'}
                            </span>
                        </button>

                        {/* Dropdown Content */}
                        {isOpen && (
                            <div className="mt-2 space-y-2">
                                <NavLink
                                    href={route('getbscs')}
                                    active={route().current('getbscs')}
                                    className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-green-700 hover:shadow-lg group ${route().current('getbscs') ? 'bg-green-600 text-white shadow-md' : 'text-red-200 hover:text-white'}`}
                                >
                                    <img
                                        src="/storage/logo/comscie.jpg"
                                        className={`h-9 w-9 rounded-full ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}
                                    />
                                    {!isCollapsed && <span className="font-medium">BSCS</span>}
                                </NavLink>

                                <NavLink
                                    href={route('getbsa')}
                                    active={route().current('getbsa')}
                                    className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-green-700 hover:shadow-lg group ${route().current('getbsa') ? 'bg-green-600 text-white shadow-md' : 'text-red-200 hover:text-white'}`}
                                >
                                    <img
                                        src="/storage/logo/bsa.jpg"
                                        className={`h-9 w-9 rounded-full ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}
                                    />
                                    {!isCollapsed && <span className="font-medium">BSA</span>}
                                </NavLink>

                                <NavLink href={route('getbsba')} active={route().current('getbsba')} className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-green-700 hover:shadow-lg group ${route().current('getbsba') ? 'bg-green-600 text-white shadow-md' : 'text-red-200 hover:text-white'}`}>
                                    <img src="/storage/logo/bsba.png" className={`h-9 w-9 rounded-full ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`} />
                                    {!isCollapsed && <span className="font-medium">BSBA</span>}
                                </NavLink>

                                <NavLink href={route('getbshm')} active={route().current('getbshm')} className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-green-700 hover:shadow-lg group ${route().current('getbshm') ? 'bg-green-600 text-white shadow-md' : 'text-red-200 hover:text-white'}`}>
                                    <img src="/storage/logo/hms.png" className={`h-9 w-9 rounded-full ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`} />
                                    {!isCollapsed && <span className="font-medium">BSHM</span>}
                                </NavLink>

                                <NavLink href={route('getbscte')} active={route().current('getbscte')} className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-green-700 hover:shadow-lg group ${route().current('getbscte') ? 'bg-green-600 text-white shadow-md' : 'text-red-200 hover:text-white'}`}>
                                    <img src="/storage/logo/educs.png" className={`h-9 w-9 rounded-full ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`} />
                                    {!isCollapsed && <span className="font-medium">CTE</span>}
                                </NavLink>
                            </div>
                        )}
                    </div>
                    <br />
                    <div className="my-6">
                        <div className="border-t border-red-700 text-white"></div>
                    </div>
                    <NavLink as="button"
                        href={route('admin.logout')}
                        method="post"
                        active={route().current('admin.logout')}
                        className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 hover:bg-red-900 hover:shadow-lg group text-red-200 hover:text-white`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''} group-hover:scale-110 transition-transform duration-200`}>
                            <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
                        </svg>
                        {!isCollapsed && <span className="font-medium">Log out</span>}
                    </NavLink>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Nav */}
                <nav className="bg-white/80 backdrop-blur-md border-b border-orange-200 sticky top-0 z-20 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between items-center">
                            <div className="flex items-center">
                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="sm:hidden text-slate-600 hover:text-red-600 hover:bg-red-50 mr-4 p-2 rounded-lg focus:outline-none transition-all duration-200"
                                    aria-label="Toggle mobile sidebar"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>

                                {/* Desktop Sidebar Collapse Toggle */}
                                <button
                                    onClick={toggleSidebarCollapse}
                                    className="hidden sm:block text-slate-600 hover:text-red-600 hover:bg-red-50 mr-4 p-2 rounded-lg focus:outline-none transition-all duration-200"
                                    aria-label="Toggle sidebar collapse"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>

                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 01.479-.425 11.947 11.947 0 007.078-2.75zM10 6a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 0110 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="font-bold text-xl text-slate-800">
                                        Welcome, <span className="text-red-600">{user.name}</span>
                                    </span>
                                </div>
                            </div>

                            {/* User Dropdown */}
                            <div className="hidden sm:flex sm:items-center">


                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-lg bg-white/70 hover:bg-red-50 px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-semibold">{user.name}</span>
                                                <svg
                                                    className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('admin.logout')}
                                            method="post"
                                            as="button"
                                            className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Optional Header */}
                {header && (
                    <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-orange-100">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            <div className="text-slate-800">
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}