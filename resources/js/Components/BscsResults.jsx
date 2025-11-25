import React, { useRef } from "react";

export default function BscsResults({ candidates = [], election }) {
    const printRef = useRef();

    const getWinnersByPosition = (candidates) => {
        const positions = [
            { key: 'governor', label: 'Governor', limit: 1 },
            { key: 'vice_governor', label: 'Vice Governor', limit: 1 },
            { key: 'secretary', label: 'Secretary', limit: 1 },
            { key: 'treasurer', label: 'Treasurer', limit: 1 },
            { key: 'auditor', label: 'Auditor', limit: 1 },
            { key: 'p_r_o', label: 'Public Relations Officer', limit: 1 },
            { key: 'events_manager', label: 'Events Manager', limit: 1 },
        ];

        const winners = {};

        positions.forEach((pos) => {
            const candidatesForPos = candidates.filter(
                c => (c.position || "").toLowerCase().replace(/\s/g, "_") === pos.key
            );
            const sorted = [...candidatesForPos].sort(
                (a, b) => (b.bscs_votes_count || 0) - (a.bscs_votes_count || 0)
            );
            winners[pos.key] = {
                label: pos.label,
                candidates: sorted.slice(0, pos.limit)
            };
        });

        return winners;
    };

    const winners = getWinnersByPosition(candidates);

    const handlePrint = () => {
        if (!printRef.current) return;
        const printContent = printRef.current.innerHTML;

        const win = window.open("", "_blank");
        win.document.open();
        win.document.write(`
            <html>
            <head>
                <title>BSCS Election Winners</title>
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
                        margin-top: 180px; /* space from table/content */
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
            <body>${printContent}</body>
            </html>
        `);
        win.document.close();
        win.onload = () => {
            win.focus();
            win.print();
        };
    };

    const hasWinners = Object.values(winners).some(data => data.candidates.length > 0);
    const isDisabled = !candidates || candidates.length === 0 || !hasWinners;

    return (
        <div>
            <button
                onClick={handlePrint}
                disabled={isDisabled}
                className={`px-4 py-1 rounded-md text-white font-medium transition-all flex items-center gap-2 ${isDisabled ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-green-700 cursor-pointer"
                    }`}
            >
                PDF
            </button>

            <div className="print-wrapper" ref={printRef} style={{ display: "none" }}>
                <div className="content-area">
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
                        <h1>BSCS {election?.election_name || "Election"} Winners</h1>
                    </div>

                    {hasWinners ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>Winner</th>
                                    <th>Votes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(winners).map(([positionKey, data]) =>
                                    data.candidates.length > 0 ? (
                                        data.candidates.map((cand, idx) => (
                                            <tr key={`${positionKey}-${idx}`}>
                                                {idx === 0 ? <td rowSpan={data.candidates.length}>{data.label}</td> : null}
                                                <td>{cand.name}</td>
                                                <td>{cand.bscs_votes_count || 0}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr key={positionKey}>
                                            <td>{data.label}</td>
                                            <td colSpan="2">No winner</td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-data">
                            <h3>No Winners Data Available</h3>
                            <p>The election may still be in progress or no votes have been cast.</p>
                        </div>
                    )}
                </div>

                <div className="footer">
                    <div className="footer-center">
                        <p><strong>Tagbina, Surigao del Sur 8308</strong></p>
                        <p>086-628-0714</p>
                        <p>www.nemsu.edu.ph</p>
                    </div>
                    <div className="footer-right">
                        <img src="/storage/logo/footer-image2.png" alt="Logo 1" className="footer-image" />
                        <img src="/storage/logo/footer-image2.png" alt="Logo 2" className="footer-image" />
                        <img src="/storage/logo/footer-image2.png" alt="Logo 3" className="footer-image" />
                    </div>
                </div>
            </div>
        </div>
    );
}