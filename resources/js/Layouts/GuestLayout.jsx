import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-black">
            <div className="w-full max-w-md">


                <div className="w-full overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}
