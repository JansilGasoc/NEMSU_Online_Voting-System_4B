import GuestLayout from '@/Layouts/GuestLayout';
import { Link, Head, useForm, usePage } from '@inertiajs/react';



export default function Login() {

  const { url } = usePage();

  return (


    <div className="flex px-4 lg:px-4">
      <div className="rounded-lg">
        {/* Header */}

        <div className="form">
          {/* Google Sign Up */}
          <span className="px-2 mt-4 rounded-md text-2xl text-gray-100"> Join our student community</span>
          <h1 className='text-emerald-500'>continue with</h1>

          <a
            href={route("google.redirect")}
            className="w-full flex items-center justify-center px-4 py-3 hover:bg-green-600 hover:text-green-100 border border-gray-600 rounded-lg shadow-sm text-gray-400 hover:bg-gray-50 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.97 1.15 8.2 3.04l6.1-6.1C34.3 3.34 29.41 1 24 1 14.61 1 6.85 6.71 3.9 14.07l7.45 5.78C12.5 13.86 17.7 9.5 24 9.5z" />
              <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.2C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Google
          </a>
          <p className='text-white'>or</p>
          <h1 className='text-white mb-4'></h1>
          <Link
            href={route('register')}
            className="rounded-md px-3 py-2 text-black hover:bg-green-600 bg-green-100 text-emerald-900 transition hover:bg-white"
          >
            Register
          </Link>
          <Link
            href={route('login')}
            className="rounded-md px-3 py-2 text-black dark:text-white border ml-4 hover:bg-indigo-500 hover:text-white text-emerald-100 transition hover:text-black/70 dark:hover:text-white/80"
          >
            Login
          </Link>
          {/* {canResetPassword && (
              <Link
                href={route('password.request')}
                className="rounded-md text-sm text-gray-400 underline hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Forgot your password?
              </Link>
            )} */}
        </div>
      </div>
    </div>


  );

}
