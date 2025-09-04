import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { fetchMonthlyStats } from "../../api/billApi";

const Stats = () => {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7);
  });

  const [totalMonthlyAmount, setTotalMonthlyAmount] = useState(0);
  const [totalByType, setTotalByType] = useState([]);
  const [dailyTotals, setDailyTotals] = useState([]);
  const [dailyTotalsByType, setDailyTotalsByType] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!month) return;

    setLoading(true);
    // console.log("Fetching stats for month:", month);

    fetchMonthlyStats(month)
      .then((res) => {
        setTotalMonthlyAmount(res.totalMonthlyAmount || 0);
        setTotalByType(res.totalByType || []);
        setDailyTotals(res.dailyTotals || []);
        setDailyTotalsByType(res.dailyTotalsByType || []);
      })
      .catch((err) => {
        console.error("Failed to fetch stats", err);
      })
      .finally(() => setLoading(false));
  }, [month]);

  // Group dailyTotalsByType by day for easier rendering
  const dailyByTypeMap = dailyTotalsByType.reduce((acc, curr) => {
    const day = curr.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(curr);
    return acc;
  }, {});

  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Monthly Report - ${month}`, 14, 15);

    // Summary Section
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    // Total Monthly Amount
    doc.setFontSize(14);
    doc.text(
      `Total Monthly Amount: ${totalMonthlyAmount.toLocaleString()}Tk`,
      14,
      35
    );

    // Total by Type Table
    doc.setFontSize(12);
    doc.text("Total by Bill Type:", 14, 45);

    const typeData = totalByType.map(({ billType, totalByType }) => [
      billType || "Unknown",
      `${totalByType.toLocaleString()}Tk`,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["Bill Type", "Amount"]],
      body: typeData,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        1: { halign: "right" },
      },
    });

    // Daily Totals Section
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Daily Breakdown", 14, 15);

    const dailyData = dailyTotals.map(({ day, totalPerDay }) => {
      const date = new Date(day).toLocaleDateString();
      const dailyTypes = (dailyByTypeMap[day] || [])
        .map(
          ({ billType, totalPerDayByType }) =>
            `${billType || "Unknown"}: ${totalPerDayByType.toLocaleString()}Tk`
        )
        .join("\n");

      return [
        date,
        `${totalPerDay.toLocaleString()}Tk`,
        { content: dailyTypes, styles: { fontSize: 8, cellPadding: 2 } },
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: [["Date", "Total", "Breakdown by Type"]],
      body: dailyData,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        1: { halign: "right" },
        2: { cellWidth: 80 },
      },
      bodyStyles: {
        minCellHeight: 20,
      },
    });

    // Save the PDF
    doc.save(`Monthly_Report_${month}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto pt-6 space-y-8">
      {/* Month Picker and Download Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <label htmlFor="monthPicker" className="font-semibold text-gray-700">
            Select Month:
          </label>
          <input
            id="monthPicker"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          />
        </div>
        <button
          onClick={generatePDF}
          disabled={loading || dailyTotals.length === 0}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            loading || dailyTotals.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Download PDF Report
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-center text-lg font-semibold text-blue-600">
          Loading stats...
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Left: Daily Totals Table with nested daily by type */}
          <div className="flex-1 overflow-x-auto max-w-full md:max-w-3xl">
            <h3 className="text-2xl font-bold mb-4 px-6 pt-6"> {new Date().toLocaleString("default", { month: "long" })} - Daily Totals</h3>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-800">
                    Total Amount (৳)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyTotals.length === 0 && (
                  <tr>
                    <td
                      colSpan="2"
                      className="px-6 py-4 text-center text-gray-500 italic"
                    >
                      No daily data available.
                    </td>
                  </tr>
                )}
                {dailyTotals.map(({ day, totalPerDay }, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                      {new Date(day).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {/* Nested daily totals by bill type */}
                      <div className="mt-3 ml-4 border-l-2 border-indigo-300 pl-4 space-y-1 text-sm text-gray-700">
                        {(dailyByTypeMap[day] || []).map(
                          ({ billType, totalPerDayByType }, i) => (
                            <div
                              key={i}
                              className="flex justify-between border-b border-gray-200 pb-1 last:border-b-0"
                            >
                              <span className="font-semibold">
                                {billType || "Unknown"}
                              </span>
                              <span className="font-mono">
                                ৳{totalPerDayByType.toLocaleString()}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-indigo-700 text-right">
                      ৳{totalPerDay.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Total Monthly and By Type - Sticky */}
          <div
            className="w-full md:w-96 mt-8 md:mt-0 flex flex-col space-y-6"
            style={{ position: "sticky", top: "1rem", alignSelf: "start" }}
          >
            {/* Total Monthly Amount */}
            <div className="bg-blue-100 text-blue-900 rounded-xl p-6 shadow-lg border border-blue-300">
              <h3 className="text-xl mb-2">
                <span className="font-semibold">Total Sales for </span> 
                <span className="font-bold">
                  {new Date().toLocaleString("default", { month: "long" })}
                </span>
              </h3>
              <p className="text-3xl font-extrabold">
                ৳{totalMonthlyAmount.toLocaleString()}
              </p>
            </div>

            {/* Total By Type */}
            <div className="space-y-2">
              {totalByType.map(({ billType, totalByType }, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition duration-200"
                >
                  <div>
                    <p className="text-sm text-gray-500">Bill Type</p>
                    <p className="text-lg font-medium text-gray-800">
                      {billType || "Unknown Type"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-semibold text-indigo-600">
                      ৳{totalByType.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
