import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

export default function Register() {
    const { url } = usePage();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: '',
        name: '',
        lastname: '',
        middle_name: '',
        course_program: '',
        year: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-4">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Create Account
                        </h2>
                        <p className="text-gray-300">
                            Join our student community
                        </p>
                    </div>
                    <br />
                    {/* Form Card */}
                    <div className=" backdrop-blur-sm rounded-2xl shadow-2xl p-4 border border-gray-700">
                        <Link href='/'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-400 hover:text-gray-200 transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m7.49 12-3.75 3.75m0 0 3.75 3.75m-3.75-3.75h16.5V4.499" />
                        </svg>
                        </Link>
                        <br />

                        <form onSubmit={submit} className="space-y-6">
                            {/* Student ID */}
                            <div>
                                <InputLabel
                                    htmlFor="student_id"
                                    value="Student ID (Portal)"
                                    className="text-gray-200 font-medium mb-2"
                                />
                                <TextInput
                                    name="student_id"
                                    value={data.student_id}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"

                                    onChange={(e) => setData('student_id', e.target.value)}
                                    required
                                />
                                <InputError message={errors.student_id} className="mt-2 text-red-400" />
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <InputLabel
                                        htmlFor="lastname"
                                        value="Last Name"
                                        className="text-gray-200 font-medium mb-2"
                                    />
                                    <TextInput
                                        name="lastname"
                                        value={data.lastname}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"

                                        autoComplete="lastname"
                                        onChange={(e) => setData('lastname', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.lastname} className="mt-2 text-red-400" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="name"
                                        value="First Name"
                                        className="text-gray-200 font-medium mb-2"
                                    />
                                    <TextInput
                                        name="name"
                                        value={data.name}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"

                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2 text-red-400" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="middle_name"
                                        value="Middle Name"
                                        className="text-gray-200 font-medium mb-2"
                                    />
                                    <TextInput
                                        name="middle_name"
                                        value={data.middle_name}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"

                                        onChange={(e) => setData('middle_name', e.target.value)}
                                    />
                                    <InputError message={errors.middle_name} className="mt-2 text-red-400" />
                                </div>

                            </div>

                            {/* Academic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel
                                        htmlFor="course_program"
                                        value="Course Program"
                                        className="text-gray-200 font-medium mb-2"
                                    />
                                    <select
                                        name="course_program"
                                        id="course_program"
                                        value={data.course_program}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                        onChange={(e) => setData('course_program', e.target.value)}
                                        required
                                    >
                                        <option value="" className="text-gray-400"></option>
                                        <option value="BSCS">BS in Computer Science</option>
                                        <option value="BSBA">BS in Business Administration</option>
                                        <option value="BSHM">BS in Hospitality Management</option>
                                        <option value="BSA">BS in Agriculture</option>
                                        <option value="BSCTE">BS in Teacher Education</option>
                                    </select>
                                    <InputError message={errors.course_program} className="mt-2 text-red-400" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="year"
                                        value="Year Level"
                                        className="text-gray-200 font-medium mb-2"
                                    />
                                    <select
                                        name="year"
                                        value={data.year}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                        onChange={(e) => setData('year', e.target.value)}
                                        required
                                    >
                                        <option value="" className="text-gray-400"></option>
                                        <option value="1st">1st Year</option>
                                        <option value="2nd">2nd Year</option>
                                        <option value="3rd">3rd Year</option>
                                        <option value="4th">4th Year</option>
                                    </select>
                                    <InputError message={errors.year} className="mt-2 text-red-400" />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <InputLabel
                                    htmlFor="email"
                                    value="Email Address"
                                    className="text-gray-200 font-medium mb-2"
                                />
                                <div className="relative mt-2">
                                    <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"

                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2 text-red-400" />
                            </div>

                            {/* Password */}
                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                    className="text-gray-200 font-medium mb-2"
                                />
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"

                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2 text-red-400" />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirm Password"
                                    className="text-gray-200 font-medium mb-2"
                                />
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                    <input
                                        id="password_confirmation"
                                        type={showPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                        required
                                        autoComplete="current-password"
                                    />


                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2 text-red-400"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}