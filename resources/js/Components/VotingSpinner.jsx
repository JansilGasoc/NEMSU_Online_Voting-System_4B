
import React from 'react';

export default function VotingSpinner({
    message = "Processing your vote...",
    type = "submit" // "submit", "loading", "counting"
}) {
    const getSpinnerContent = () => {
        switch (type) {
            case "submit":
                return {
                    message: "Submitting your vote...",
                    icon: "🗳️",
                    color: "border-blue-600"
                };
            case "counting":
                return {
                    message: "Counting votes...",
                    icon: "📊",
                    color: "border-green-600"
                };
            default:
                return {
                    message: message,
                    icon: "⏳",
                    color: "border-gray-600"
                };
        }
    };

    const spinnerConfig = getSpinnerContent();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300">
                {/* Animated Icon */}
                <div className="text-center mb-6">
                    <div className="text-4xl mb-4 animate-bounce">
                        {spinnerConfig.icon}
                    </div>
                </div>

                {/* Main Spinner */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        {/* Outer ring */}
                        <div className={`animate-spin rounded-full h-16 w-16 border-4 border-gray-200`}>
                            <div className={`absolute inset-0 rounded-full border-4 border-transparent ${spinnerConfig.color} border-t-4 animate-spin`}></div>
                        </div>

                        {/* Inner pulse */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-6 h-6 ${spinnerConfig.color.replace('border-', 'bg-').replace('-600', '-100')} rounded-full animate-pulse`}></div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="text-center">
                    <p className="text-gray-700 text-lg font-medium mb-2">
                        {spinnerConfig.message}
                    </p>
                    <p className="text-gray-500 text-sm">
                        Please wait while we process your request
                    </p>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center mt-4 space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}