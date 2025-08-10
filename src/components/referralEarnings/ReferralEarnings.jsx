import { useEffect, useState } from "react";

import { getReferralEarnings } from "../../api/referralEarningsApi";

const ReferralEarnings = () => {
  const [month, setMonth] = useState(() => {
    // Default to current year-month in YYYY-MM format
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch referral earnings data for the selected month
  const fetchData = async (monthParam) => {
    setLoading(true);
    setError("");
    try {
      const data = await getReferralEarnings(monthParam);
      setData(data);
    } catch (err) {
      setError(err.message || "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(month);
  }, [month]);

  const Card = ({ title, items }) => {
    // Calculate total earnings for the items in this card
    const total = items
      ? items
          .filter((item) => item.name && item.name.trim() !== "")
          .reduce((sum, item) => sum + parseFloat(item.totalEarnings || 0), 0)
      : 0;

    return (
      <div className="bg-white rounded-2xl shadow-md p-6 flex-1">
        <h2 className="text-xl font-semibold text-blue-700 mb-2">{title}</h2>

        {items && items.length > 0 ? (
          <ul className="space-y-2 max-h-96 overflow-auto">
            {items
              .filter((item) => item.name && item.name.trim() !== "")
              .map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between border-b border-gray-100 pb-1 text-gray-700"
                >
                  <span className="font-medium truncate">{item.name}</span>
                  <span className="font-semibold">
                    ৳ {parseFloat(item.totalEarnings || 0).toFixed(2)}
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500">No referrals available.</p>
        )}
        <p className="text-blue-600 text-right font-semibold mb-4">
          Total: ৳ {total.toFixed(2)}
        </p>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-gray-800">
            Referral Earnings Summary
          </h1>

          <label className="mt-4 inline-block text-gray-700 font-medium">
            Select Month:{" "}
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="ml-2 p-1 border border-gray-300 rounded"
              max={new Date().toISOString().slice(0, 7)} // max = current month
            />
          </label>
        </div>

        {loading && (
          <p className="text-center text-blue-500 text-lg font-medium">
            Loading referral earnings...
          </p>
        )}
        {error && (
          <p className="text-center text-red-500 font-semibold">{error}</p>
        )}

        {!loading && !error && data && (
          <>
            <p className="text-lg font-semibold mb-6">
              Total Distributed Amount: ৳{" "}
              {(data.totalDistributedAmount || 0).toFixed(2)}
            </p>
            <div className="flex flex-col md:flex-row gap-6">
              <Card title="Doctor Referrals" items={data.doctorReferrals} />
              <Card title="PC Referrals" items={data.pcReferrals} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReferralEarnings;
