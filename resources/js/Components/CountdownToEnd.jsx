import { useEffect, useState } from "react";

export default function CountdownToEnd({ startTime, endTime, onEnd }) {
    const [timeLeft, setTimeLeft] = useState(null);
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        if (!endTime) return;

        const end = new Date(endTime).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = end - now;

            // ✅ When time is up
            if (distance <= 0) {
                clearInterval(interval);
                setIsEnded(true);
                setTimeLeft("00:00:00");
                if (onEnd) onEnd(); // 🔔 trigger callback to close election
                return;
            }

            // ✅ Calculate total hours, minutes, seconds remaining
            const totalHours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(
                `${totalHours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime, onEnd]);

    if (!timeLeft) return null;

    return (
        <div className="flex flex-col items-center justify-center bg-gray-800 text-white py-3 px-6 rounded-lg shadow-md">
            {!isEnded ? (
                <>
                    <h3 className="text-lg font-semibold tracking-wide">
                        Voting Ends In
                    </h3>
                    <div className="text-3xl font-bold mt-2 tracking-wider">
                        {timeLeft}
                    </div>
                </>
            ) : (
                <>
                    <h3 className="text-lg font-semibold text-red-400">🛑 Voting Closed</h3>
                    <div className="text-3xl font-bold mt-2 text-red-500">00:00:00</div>
                </>
            )}
        </div>
    );
}