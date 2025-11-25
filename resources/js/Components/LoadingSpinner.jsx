import React, { useState, useEffect } from 'react';

export default function LoadingSpinner({
    message = "Loading...",
    show = true,
    progress = null, // If null, shows indeterminate animation
    color = "blue", // "blue", "green", "purple", "red", "orange"
    size = "medium" // "small", "medium", "large"
}) {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    // Color configurations
    const colorConfig = {
        blue: {
            primary: "from-blue-500 to-blue-600",
            secondary: "from-blue-400 to-blue-500",
            bg: "bg-blue-50",
            text: "text-blue-600"
        },
        green: {
            primary: "from-green-500 to-green-600",
            secondary: "from-green-400 to-green-500",
            bg: "bg-green-50",
            text: "text-green-600"
        },
        purple: {
            primary: "from-purple-500 to-purple-600",
            secondary: "from-purple-400 to-purple-500",
            bg: "bg-purple-50",
            text: "text-purple-600"
        },
        red: {
            primary: "from-red-500 to-red-600",
            secondary: "from-red-400 to-red-500",
            bg: "bg-red-50",
            text: "text-red-600"
        },
        orange: {
            primary: "from-orange-500 to-orange-600",
            secondary: "from-orange-400 to-orange-500",
            bg: "bg-orange-50",
            text: "text-orange-600"
        }
    };

    // Size configurations
    const sizeConfig = {
        small: {
            spinner: "w-8 h-8",
            modal: "max-w-xs p-6",
            text: "text-sm",
            dots: "w-1 h-1"
        },
        medium: {
            spinner: "w-12 h-12",
            modal: "max-w-sm p-8",
            text: "text-base",
            dots: "w-1.5 h-1.5"
        },
        large: {
            spinner: "w-16 h-16",
            modal: "max-w-md p-10",
            text: "text-lg",
            dots: "w-2 h-2"
        }
    };

    const colors = colorConfig[color];
    const sizes = sizeConfig[size];

    // Animate progress if provided
    useEffect(() => {
        if (progress !== null) {
            const timer = setTimeout(() => {
                setAnimatedProgress(progress);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className={`rounded-3xl shadow-2xl ${sizes.modal} transform transition-all duration-500 scale-100`}>

                {/* Main Spinner Container */}
                <div className="flex flex-col w-full items-center">
                    {/* Animated Spinner */}
                    <div className="relative mb-6">
                        {progress !== null ? (
                            // Determinate progress ring
                            <div className="relative">
                                <svg className={`${sizes.spinner} transform -rotate-90`} viewBox="0 0 100 100">
                                    {/* Background ring */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        fill="none"
                                        className="opacity-20"
                                    />
                                    {/* Progress ring */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="url(#progressGradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 - (animatedProgress / 100) * 251.2}
                                        className="transition-all duration-700 ease-out"
                                        strokeLinecap="round"
                                    />
                                    {/* Gradient definition */}
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" className={`stop-${color}-400`} />
                                            <stop offset="100%" className={`stop-${color}-600`} />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Percentage text */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`font-bold ${colors.text} ${sizes.text}`}>
                                        {Math.round(animatedProgress)}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            // Indeterminate spinner
                            <div className="relative">
                                {/* Outer rotating ring */}
                                <div className={`${sizes.spinner} border-4 border-gray-200 rounded-full animate-spin`}>
                                    <div className={`absolute inset-0 border-4 border-transparent rounded-full animate-spin bg-gradient-to-r ${colors.primary} mask-spinner`}></div>
                                </div>

                                {/* Inner pulsing dot */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`${sizes.dots} bg-gradient-to-r ${colors.secondary} rounded-full animate-pulse`}></div>
                                </div>

                                {/* Floating particles */}
                                <div className="absolute inset-0">
                                    <div className={`absolute top-0 left-1/2 w-1 h-1 bg-gradient-to-r ${colors.primary} rounded-full animate-ping`} style={{ animationDelay: '0s' }}></div>
                                    <div className={`absolute top-1/4 right-0 w-0.5 h-0.5 bg-gradient-to-r ${colors.secondary} rounded-full animate-ping`} style={{ animationDelay: '0.5s' }}></div>
                                    <div className={`absolute bottom-1/4 left-0 w-0.5 h-0.5 bg-gradient-to-r ${colors.primary} rounded-full animate-ping`} style={{ animationDelay: '1s' }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Message */}
                    <div className="text-center mb-4">
                        <p className={`font-medium text-gray-100 ${sizes.text} mb-2`}>
                            {message}
                        </p>
                        {progress !== null && (
                            <p className="text-gray-500 text-sm">
                                {animatedProgress < 100 ? 'Please wait...' : 'Complete!'}
                            </p>
                        )}
                    </div>

                    {/* Animated wave bars */}
                    <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={`${sizes.dots} bg-gradient-to-t ${colors.secondary} rounded-full animate-wave`}
                                style={{
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '1s'
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom styles for animations */}
            <style jsx>{`
                .mask-spinner {
                    -webkit-mask: linear-gradient(45deg, transparent 30%, white 50%, transparent 70%);
                    mask: linear-gradient(45deg, transparent 30%, white 50%, transparent 70%);
                }
                
                @keyframes wave {
                    0%, 100% { 
                        transform: scaleY(1);
                        opacity: 0.7;
                    }
                    50% { 
                        transform: scaleY(3);
                        opacity: 1;
                    }
                }
                
                .animate-wave {
                    animation: wave 1s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

