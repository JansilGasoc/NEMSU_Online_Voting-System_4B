import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function USGDownloadResultsButton({ candidates = [], election }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadExcel = async () => {
        if (!candidates.length) {
            alert("No candidates to export.");
            return;
        }

        setIsDownloading(true);

        try {
            // Group candidates by position
            const candidatesByPosition = candidates.reduce((acc, candidate) => {
                const position = candidate.position || "Other";
                if (!acc[position]) {
                    acc[position] = [];
                }
                acc[position].push(candidate);
                return acc;
            }, {});

            // Sort candidates within each position by votes (descending)
            Object.keys(candidatesByPosition).forEach(position => {
                candidatesByPosition[position].sort((a, b) => {
                    const votesA = typeof a.votes === 'number' ? a.votes : 0;
                    const votesB = typeof b.votes === 'number' ? b.votes : 0;
                    return votesB - votesA;
                });
            });

            // Create workbook
            const workbook = XLSX.utils.book_new();

            // Add metadata
            workbook.Props = {
                Title: `${election?.name || "Election"} Results`,
                Subject: "Election Results by Position",
                Author: "USG Election System",
                CreatedDate: new Date(),
            };

            // Create a sheet for each position
            const positionOrder = [
                "president",
                "internal_vice_president",
                "external_vice_president",
                "secretary",
                "treasurer",
                "auditor",
                "senator",
            ];

            const positionLabels = {
                president: "President",
                internal_vice_president: "Internal Vice President",
                external_vice_president: "External Vice President",
                secretary: "Secretary",
                treasurer: "Treasurer",
                auditor: "Auditor",
                senator: "Senator",
            };

            // Replace the sheet creation loop with ordered one
            positionOrder.forEach(position => {
                if (!candidatesByPosition[position]) return; // Skip if no candidates

                const positionCandidates = candidatesByPosition[position];

                const data = positionCandidates.map(c => ({
                    "Candidate Name": c.name || "N/A",
                    "Party List": c.party_list || c.partylist || "Independent",
                    "Course/Program": c.course_program || "N/A",
                    "Date of Filling": c.date_of_filling || "N/A",
                    "Year Level": c.year_level || "N/A",
                    "Age": c.age || "N/A",
                    "Votes": typeof c.votes === 'number' ? c.votes : 0,
                }));

                const worksheet = XLSX.utils.json_to_sheet(data);
                worksheet['!cols'] = [
                    { wch: 25 },
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 10 },
                ];

                const sheetName = positionLabels[position].substring(0, 31).replace(/[:\\\/\?\*\[\]]/g, '_');
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            });
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const safeName = (election?.election_name || "election")
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            const fileName = `${safeName}_results_${timestamp}.xlsx`;

            // Trigger download
            XLSX.writeFile(workbook, fileName);

            console.log(`Successfully exported ${candidates.length} candidates across ${Object.keys(candidatesByPosition).length} positions`);

        } catch (error) {
            console.error("Excel export failed:", error);
            alert("Failed to generate Excel file. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const isDisabled = !election || candidates.length === 0 || isDownloading;

    return (
        <button
            onClick={handleDownloadExcel}
            disabled={isDisabled}
            className={`px-4 py-1 rounded-md text-white font-medium transition-all flex items-center gap-2 ${isDisabled
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 cursor-pointer"
                }`}
        >
            {isDownloading ? (
                <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Generating...
                </>
            ) : (
                "(Excel)"
            )}
        </button>
    );
}