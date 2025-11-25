import { useState } from "react";
import { useForm } from "@inertiajs/react";

export default function ElectionModal({ disabled = false }) {
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        election_name: "",
        start_time: "",
        end_time: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("election.store"), {
            onSuccess: () => {
                setShowModal(false);
                reset(); // Clear the form after success
            },
        });
    };

    return (
        <>
            {/* Start Button */}
            <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={disabled}
                className={`p-1 rounded-lg px-3 text-green-500 flex items-center gap-2 transition duration-300 ${disabled
                    ? "text-green-500 border cursor-not-allowed"
                    : "border hover:bg-green-50"
                    }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5"
                >
                    <path
                        fillRule="evenodd"
                        d="M14.5 1A4.5 4.5 0 0 0 10 5.5V9H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5V5.5a3 3 0 1 1 6 0v2.75a.75.75 0 0 0 1.5 0V5.5A4.5 4.5 0 0 0 14.5 1Z"
                        clipRule="evenodd"
                    />
                </svg>
                <span className="font-medium">
                    {disabled ? "Has been set" : "Set Election"}
                </span>
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            Set New Election
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Election Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Election Name
                                </label>
                                <input
                                    type="text"
                                    value={data.election_name}
                                    onChange={(e) =>
                                        setData("election_name", e.target.value)
                                    }
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
                                    placeholder="e.g., NEMSU Election 2025"
                                    required
                                />
                                {errors.election_name && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.election_name}
                                    </p>
                                )}
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.start_time}
                                    onChange={(e) =>
                                        setData("start_time", e.target.value)
                                    }
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
                                    required
                                />
                                {errors.start_time && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.start_time}
                                    </p>
                                )}
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.end_time}
                                    onChange={(e) =>
                                        setData("end_time", e.target.value)
                                    }
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
                                    required
                                />
                                {errors.end_time && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.end_time}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="mr-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {processing ? "Saving..." : "Save Election"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}