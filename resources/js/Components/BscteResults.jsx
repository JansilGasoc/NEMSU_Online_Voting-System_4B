import React, { useRef } from "react";

export default function BscteResults({ candidates = [], election }) {
    const printRef = useRef();

    const getWinnersByPosition = (candidates) => {
        const positions = [
            { key: 'governor', label: 'Governor' },
            { key: 'vp_internal', label: 'Vice President for Internal' },
            { key: 'vp_external', label: 'Vice President for External' },
            { key: 'secretary', label: 'Secretary' },
            { key: 'asst_secretary', label: 'Assistant Secretary' },
            { key: 'treasurer', label: 'Treasurer' },
            { key: 'asst_treasurer', label: 'Assistant Treasurer' },
            { key: 'auditor', label: 'Auditor' },
            { key: 'layout_artist', label: 'Layout Artist' },
            { key: 'online_convener', label: 'Online Convener' },
            { key: 'ambassador', label: 'Ambassador' },
            { key: 'ambassadress', label: 'Ambassadress' }
        ];

        const winners = {};

        positions.forEach((pos) => {
            const candidatesForPos = candidates.filter(c => (c.position || "").toLowerCase().replace(/\s/g, "_") === pos.key);
            const sorted = [...candidatesForPos].sort((a, b) => (b.bscte_votes_count || 0) - (a.bscte_votes_count || 0));
            winners[pos.key] = { label: pos.label, candidates: sorted.length > 0 ? [sorted[0]] : [] };
        });

        return winners;
    };

    const winners = getWinnersByPosition(candidates);

    const handlePrint = () => {
        if (!printRef.current) return;
        const printContent = printRef.current.innerHTML;

        // Open in new tab
        const win = window.open("", "_blank");

        win.document.open();
        win.document.write(`
            <html>
            <head>
                <title>BSCTE Election Results</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        margin: 20px; 
                         padding: 0;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                    }
                    th, td { 
                        border: 1px solid #000; 
                        padding: 8px; 
                        text-align: center; 
                    }
                    th { 
                        background-color: #1e73cd; 
                        color: white; 
                    }
                    h2 { 
                        margin: 0;
                    }
                    p{
                      margin: 1px 0;
                    }
                    .header { 
                        display: flex; 
                         margin: 2px 0; /* controls all spacing */
                        flex-direction: column; 
                        align-items: center; 
                    }
                    .header img { 
                        height: 60px; 
                        margin-bottom: 10px; 
                    }
                    .no-data { 
                        text-align: center; 
                        color: #666; 
                        font-style: italic; 
                    }
                    .footer {
                        margin-top: 140px; /* space from table/content */
                        padding: 10px 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        width: 100%;
                        border-top: 1px solid black; /* optional */
                        box-sizing: border-box;
                        flex-wrap: wrap; /* prevents overflow if narrow page */
                    }

                    .footer-center {
                        flex: 1 1 50%;
                        text-align: left;
                        font-size: 12px;
                        line-height: 1.3;
                        color: #000;
                    }

                    .footer-right {
                        flex: 1 1 50%;
                        display: flex;
                        justify-content: flex-end;
                        gap: 10px; /* spacing between images */
                    }

                    .footer-image {
                        height: 50px;
                        object-fit: contain;
                    }
                    .print-wrapper {
                        min-height: 100%;
                        display: flex;
                    flex-direction: column;
                }
                    .content-area {
                        flex: 1; /* push footer to bottom */
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        win.document.close();
        win.onload = () => {
            win.focus();
            win.print();
        };
    };

    return (
        <div>
            <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mb-3"
            >
                Print Results
            </button>

            <div ref={printRef} style={{ display: "none" }}>
                <div className="header">
                    <img src="/storage/logo/image.jpg" alt="University Logo" />
                    <p className="text-sm text-gray-700">Republic of the Philippines</p>
                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide font-serif">
                        North Eastern Mindanao State University
                    </h2>
                    <p className="text-sm text-gray-700 italic">Tagbina Campus</p>
                    <p className="text-xs text-gray-600">Telefax No. 086-212-5132</p>
                    <p className="text-xs text-blue-600">
                        Website: <a href="http://www.nemsu.edu.ph" target="_blank" rel="noreferrer">www.nemsu.edu.ph</a>
                    </p>
                    <h1>BSCTE {election?.election_name} Winners</h1>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Winner</th>
                            <th>Votes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(winners).map(([positionKey, data], i) => (
                            <tr key={i}>
                                <td>{data.label}</td>
                                <td>{data.candidates.length > 0 ? data.candidates.map(c => c.name).join(", ") : "No votes"}</td>
                                <td>{data.candidates.length > 0 ? data.candidates.reduce((sum, c) => sum + (c.bscte_votes_count || 0), 0) : 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}