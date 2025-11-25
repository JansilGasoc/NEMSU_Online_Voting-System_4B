
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, Fragment, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';

export default function UpdateProfile() {
    const [preview, setPreview] = useState(null);
    const [showDuplicates, setShowDuplicates] = useState(false);
    const user = usePage().props.auth.user;
    const { flash } = usePage().props;

    const {
        data: pictureData,
        setData: setPictureData,
        post,
        errors: pictureErrors,
        processing: processingPicture,
        recentlySuccessful: picSaved,
        reset: resetForm
    } = useForm({
        profile_picture: null,
    });

    // Profile Avatar Component with SVG fallback
    const ProfileAvatar = ({ src, alt, className = "" }) => {
        if (src) {
            return (
                <img
                    src={src}
                    alt={alt}
                    className={`rounded-full object-cover border-4 border-gray-200 shadow-lg ${className}`}
                    onError={(e) => {
                        // If image fails to load, show the SVG fallback
                        e.target.style.display = 'none';
                        const fallbackDiv = e.target.nextElementSibling;
                        if (fallbackDiv) {
                            fallbackDiv.style.display = 'flex';
                        }
                    }}
                />
            );
        }

        return null; // Will show fallback div below
    };

    const ProfileFallback = ({ className = "", style = {} }) => (
        <div
            className={`rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white border-4 border-gray-200 shadow-lg ${className}`}
            style={style}
        >
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

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }

            // Validate file size (e.g., max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setPictureData('profile_picture', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submitPicture = (e) => {
        e.preventDefault();

        console.log('Submit triggered');
        console.log('Picture data:', pictureData);
        console.log('Processing state:', processingPicture);

        if (!pictureData.profile_picture) {
            toast.error('Please select an image first');
            return;
        }

        // Create FormData manually to ensure proper file handling
        const formData = new FormData();
        formData.append('profile_picture', pictureData.profile_picture);
        formData.append('_method', 'POST'); // Laravel method spoofing

        // Use the patch method with proper configuration
        post(route('profile.picture.update', user.id), {
            forceFormData: true,
            preserveState: false, // Allow page refresh to get updated user data
            preserveScroll: true,
            onStart: () => {
                console.log('Request started');
            },
            onSuccess: (page) => {
                console.log('Success response:', page);
                setPreview(null);
                resetForm(); // Clear the form
                // Clear the file input
                const fileInput = document.getElementById('profile_picture');
                if (fileInput) {
                    fileInput.value = '';
                }
                // Don't show toast here since flash message will handle it
            },
            onError: (errors) => {
                console.log('Errors:', errors);

                // Handle specific error messages
                if (errors.profile_picture) {
                    toast.error(errors.profile_picture);
                } else if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to update profile picture. Please try again.');
                }
            },
            onFinish: () => {
                console.log('Request finished');
            }
        });
    };

    // Clean up preview URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    // Determine what image source to use
    const getImageSource = () => {
        return preview || user.profile_picture;
    };

    const imageSource = getImageSource();

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <form
                onSubmit={submitPicture}
                className="flex flex-col items-center space-y-6"
            >
                {/* Profile Image Preview */}
                <div className="relative w-32 h-32">
                    {imageSource ? (
                        <>
                            <ProfileAvatar
                                src={imageSource}
                                alt="Profile"
                                className="w-32 h-32"
                            />
                            {/* Fallback div - initially hidden */}
                            <ProfileFallback
                                className="w-32 h-32 absolute top-0 left-0"
                                style={{ display: 'none' }}
                            />
                        </>
                    ) : (
                        <ProfileFallback className="w-32 h-32" />
                    )}

                    {/* Camera/Edit Icon */}
                    <label
                        htmlFor="profile_picture"
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition border border-gray-200"
                        title="Change profile picture"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M4 3a2 2 0 00-2 2v2h2V5h2V3H4zM2 9v8a2 2 0 002 2h8a2 2 0 002-2v-2h-2v2H4V9H2zm16-6h-4v2h2v2h2V5a2 2 0 00-2-2zM14 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                            type="file"
                            id="profile_picture"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={handleProfilePictureChange}
                        />
                    </label>
                </div>

                {/* Status Messages */}
                {preview && (
                    <p className="text-sm text-blue-600 flex items-center space-x-2">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Image selected and ready to upload</span>
                    </p>
                )}

                {/* Update Button and Status */}
                <div className="flex flex-col items-center space-y-2">
                    <PrimaryButton
                        type="submit"
                        disabled={processingPicture || !pictureData.profile_picture}
                        className={`${!pictureData.profile_picture ? 'opacity-50 cursor-not-allowed' : ''} transition-all duration-200`}
                    >
                        {processingPicture ? (
                            <span className="flex items-center space-x-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Updating...</span>
                            </span>
                        ) : (
                            'Update Picture'
                        )}
                    </PrimaryButton>

                    {/* Show when no file is selected */}
                    {!pictureData.profile_picture && (
                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Select an image first</span>
                        </p>
                    )}

                    <InputError
                        message={pictureErrors.profile_picture}
                        className="text-sm text-center"
                    />
                    {picSaved && (
                        <p className="text-sm text-green-600 text-center flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Picture updated successfully!</span>
                        </p>
                    )}
                </div>
            </form>

            <Toaster position="top-right" />
        </div>
    );
}