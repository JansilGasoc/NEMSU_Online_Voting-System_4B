import React from 'react';
import { router } from '@inertiajs/react';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function DestroyElection({ electionId, onSuccess }) {
    const handleDestroy = () => {
        if (confirm("Are you sure you want to destroy this election?")) {
            const password = prompt("Enter admin password to confirm:");

            if (!password) {
                alert("Password is required to delete the election.");
                return;
            }

            router.delete(route('election.destroy', electionId), {
                data: { password },
                preserveScroll: true,
                onSuccess: () => {
                    alert("Election deleted successfully.");
                    if (onSuccess) onSuccess();
                },
                onError: (errors) => {
                    alert(errors.password || "Failed to delete the election.");
                },
            });
        }
    };

    return (
        <button
            onClick={handleDestroy}
            className="bg-red-500 text-white p-1 mt-4 rounded hover:bg-red-600 transition"
        >
            <TrashIcon className="h-5 w-5" />
        </button>
    );
}