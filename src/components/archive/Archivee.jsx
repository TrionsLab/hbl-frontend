import { useEffect, useState } from "react";

import { createBill } from "../../api/billApi";
import { deleteFromArchive, getDeletedBills } from "../../api/deletedBillApi";

const Archive = () => {
  const [deletedBills, setDeletedBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDeletedBills = async () => {
    try {
      const data = await getDeletedBills();
      setDeletedBills(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedBills();
  }, []);

  const handleRestore = async (bill) => {
    setRestoringId(bill.id);
    try {
      const cleanedBill = {
        ...bill,
        selectedTests:
          typeof bill.selectedTests === "string"
            ? JSON.parse(bill.selectedTests)
            : bill.selectedTests,
      };

      await createBill(cleanedBill);
      await deleteFromArchive(bill.id);
      await fetchDeletedBills();

      alert(`✅ Bill ${bill.idNo} restored successfully.`);
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this bill?")
    )
      return;

    setDeletingId(id);
    try {
      await deleteFromArchive(id);
      await fetchDeletedBills();
      alert("✅ Bill permanently deleted.");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return <p className="text-blue-500">Loading archived bills...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Archived (Deleted) Bills</h2>
      {deletedBills.length === 0 ? (
        <p>No deleted bills found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-24">
                  ID
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-28">
                  Date/Time
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-40">
                  Patient
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-32">
                  Doctor
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-40">
                  Referrals
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-32">
                  Bill Details
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-32">
                  Payment Status
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deletedBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-r border-gray-200">
                    <div
                      className="font-medium text-gray-900 truncate"
                      title={bill.id}
                    >
                      {bill.id}
                    </div>
                    <div className="text-gray-600 text-xs">{bill.billType}</div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <div className="font-medium text-gray-900">{bill.date}</div>
                    <div className="text-gray-600 text-xs">{bill.time}</div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <div
                      className="font-medium text-gray-900 truncate"
                      title={bill.name}
                    >
                      {bill.name}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {bill.age} yrs
                      {bill.ageMonths ? `, ${bill.ageMonths} mos` : ""} |{" "}
                      {bill.gender} <br />
                      <span className="font-medium">Phone:</span> {bill.phone}
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <div className="text-gray-900 truncate" title={bill.doctor}>
                      {bill.doctor && bill.doctor.length > 0
                        ? bill.doctor.length > 20
                          ? `${bill.doctor.substring(0, 20)}...`
                          : bill.doctor
                        : "-"}
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    {bill.referralDoctorName && (
                      <div className="mb-1">
                        <span className="font-medium text-gray-700 text-xs">
                          Dr:
                        </span>{" "}
                        <span
                          className="text-gray-900 truncate"
                          title={bill.referralDoctorName}
                        >
                          {bill.referralDoctorName.length > 20
                            ? `${bill.referralDoctorName.substring(0, 20)}...`
                            : bill.referralDoctorName}
                        </span>{" "}
                        <span className="text-gray-600 text-xs">
                          (৳{bill.referralDoctorFee})
                        </span>
                      </div>
                    )}
                    {bill.referralPcName && (
                      <div>
                        <span className="font-medium text-gray-700 text-xs">
                          PC:
                        </span>{" "}
                        <span
                          className="text-gray-900 truncate"
                          title={bill.referralPcName}
                        >
                          {bill.referralPcName.length > 20
                            ? `${bill.referralPcName.substring(0, 20)}...`
                            : bill.referralPcName}
                        </span>{" "}
                        <span className="text-gray-600 text-xs">
                          (৳{bill.referralPcFee})
                        </span>
                      </div>
                    )}
                    {!bill.referralDoctorName && !bill.referralPcName && "-"}
                  </td>

                  <td className="px-3 py-2 border-r border-gray-200">
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-gray-700">Gross:</span>{" "}
                        <span className="text-gray-900">
                          ৳{bill.grossAmount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-700">Total Discount:</span> ৳{" "}
                        {(
                          (Number(bill.grossAmount || 0) *
                            Number(bill.discount || 0)) /
                            100 +
                          Number(bill.extraDiscount || 0)
                        ).toFixed(2)}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Due: ৳{bill.due}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Total: ৳{bill.totalAmount}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-center">
                      {bill.due > 0 ? (
                        <>
                          <div className="badge font-medium badge-warning">
                            {bill.due} Tk
                          </div>
                          <br />
                          {/* <button
                            onClick={() => handleClearDue(bill)}
                            className="underline text-blue-600 hover:text-blue-800 text-xs font-medium mt-2"
                          >
                            Clear Due
                          </button> */}
                        </>
                      ) : (
                        <div className="badge badge-success text-white">
                          Paid
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-2 border space-y-1">
                    <button
                      onClick={() => handleRestore(bill)}
                      disabled={restoringId === bill.id}
                      className={`w-full px-3 py-1 rounded text-white text-sm ${
                        restoringId === bill.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {restoringId === bill.id ? "Restoring..." : "Restore"}
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(bill.id)}
                      disabled={deletingId === bill.id}
                      className={`w-full px-3 py-1 rounded text-white text-sm ${
                        deletingId === bill.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {deletingId === bill.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Archive;
