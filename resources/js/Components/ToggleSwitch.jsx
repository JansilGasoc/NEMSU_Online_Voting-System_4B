import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ToggleSwitch({ electionId, currentStatus }) {
    const [checked, setChecked] = useState(currentStatus === 'Started=');
    const [processing, setProcessing] = useState(false);

    const handleChange = () => {
        const newStatus = checked ? 'Paused' : 'Started';

        setProcessing(true);

        router.put(route('election.updateStatus', electionId), {
            status: newStatus,
        }, {
            onSuccess: () => {
                setChecked(!checked);
                setProcessing(false);
            },
            onError: () => {
                alert('Failed to update election status.');
                setProcessing(false);
            }
        });
    };

    return (
        <div className="relative w-16 h-8 mt-4">
            <input
                type="checkbox"
                id={`toggle-${electionId}`}
                className="sr-only"
                checked={checked}
                onChange={handleChange}
                disabled={processing}
            />
            <label
                htmlFor={`toggle-${electionId}`}
                className={`block w-full h-full rounded-full shadow-inner cursor-pointer transition-colors duration-300
                    ${checked ? 'bg-green-600' : 'bg-red-600'}
                `}
            >
                <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300
                        ${checked ? 'translate-x-8' : 'translate-x-0'}
                    `}
                />
            </label>
        </div>
    );
}