import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LabelList,
} from "recharts";

export default function CandidateChart({ position, candidates }) {
    if (!candidates || candidates.length === 0) return null;

    const data = candidates.map((c) => ({
        name: c.name,
        votes: c.votes_count || 0,
    }));

    // 🎨 Color mapping per position
    const colors = {
        president: "#3182CE",
        external_vice_president: "#E53E3E",
        internal_vice_president: "#38A169",
        secretary: "#D69E2E",
        treasurer: "#805AD5",
        auditor: "#DD6B20",
        senator: "#319795",
    };

    const barColor = colors[position] || "#4A5568";

    return (
        <div className="w-full bg-white p-4 rounded-xl shadow-md">
            <h2 className="text-base font-semibold capitalize mb-4 text-center text-gray-700">
                {position.replace(/_/g, " ")}
            </h2>

            {/* Responsive Chart */}
            <ResponsiveContainer width="100%" height={250}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                        top: 10,
                        right: 30,
                        left: 30,
                        bottom: 10,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(value) => [`${value} votes`, "Votes"]}
                        contentStyle={{
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                        }}
                    />
                    <Legend />
                    <Bar dataKey="votes" fill={barColor} radius={[0, 8, 8, 0]}>
                        <LabelList dataKey="votes" position="right" fontSize={12} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}