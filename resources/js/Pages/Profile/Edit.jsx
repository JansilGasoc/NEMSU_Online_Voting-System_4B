import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateProfile from '@/Components/UpdateProfile';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-4">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">

                        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                            <h3 className="text-md font-medium text-gray-800 mb-4 text-center">Profile Picture</h3>

                            <UpdateProfile />
                        </div>
                        <header className="mb-8">
                            <h2 className="text-lg font-medium text-gray-900">
                                Profile Information
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Update your account information in sections.
                            </p>
                        </header>
                        <div>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                canResetPassword={true}
                                className="max-w-xl"
                            />
                        </div>

                    </div>

                    {/* <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div> */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
