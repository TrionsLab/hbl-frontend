import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { archiveBill, clearBillDue, fetchBillsByDate } from "../../api/billApi";
import BillsTable from "../billsTable/BillsTable";
import PrintableBill from "../printreceipt/PrintableBill";
import ReferralModal from "../referralModal/ReferralModal";
import { formatToDDMMYY } from "../../helpers/formatDate";

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [selectedBillType, setSelectedBillType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: "", contentData: {} });
  const [selectedTests, setSelectedTests] = useState([]);
  const [showOnlyDue, setShowOnlyDue] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const receptionists = [
    ...new Set(bills.map((bill) => bill.receptionist).filter(Boolean)),
  ];

  const fetchBills = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBillsByDate(date);
      setBills(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills(selectedDate);
  }, [searchTerm, searchField, selectedDate, selectedBillType, fetchBills]);

  const filteredBills = bills.filter((bill) => {
    if (bill.archive) {
      return false; // ignore archived bills
    }
    if (selectedBillType !== "all" && bill.billType !== selectedBillType) {
      return false;
    }
    if (
      selectedReceptionist !== "all" &&
      bill.receptionist !== selectedReceptionist
    ) {
      return false;
    }
    if (showOnlyDue && bill.due <= 0) {
      return false;
    }
    if (!searchTerm) return true;

    const fieldValue = String(bill[searchField] || "").toLowerCase();
    return fieldValue.includes(searchTerm.toLowerCase());
  });

  const doctorEarnings = filteredBills.reduce((acc, bill) => {
    if (bill.referralDoctorName) {
      acc[bill.referralDoctorName] =
        (acc[bill.referralDoctorName] || 0) +
        Number(bill.referralDoctorFee || 0);
    }
    return acc;
  }, {});

  const pcEarnings = filteredBills.reduce((acc, bill) => {
    if (bill.referralPcName) {
      acc[bill.referralPcName] =
        (acc[bill.referralPcName] || 0) + Number(bill.referralPcFee || 0);
    }
    return acc;
  }, {});

  const totalBillsAmount = filteredBills.reduce(
    (sum, bill) => sum + Number(bill.totalAmount || 0),
    0
  );

  const totalDueAmount = filteredBills.reduce(
    (sum, bill) => sum + Number(bill.due || 0),
    0
  );

  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this bill?")) return;
    try {
      await archiveBill(id);
      setBills((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, archive: true, archivedAt: new Date().toISOString() }
            : b
        )
      );
    } catch (err) {
      alert("Error archiving bill: " + err.message);
    }
  };

  const handleClearDue = async (bill) => {
    if (
      !window.confirm(`Are you sure you want to clear due of ${bill.due} Tk?`)
    )
      return;
    try {
      const updatedBill = await clearBillDue(bill.id, {
        ...bill,
        due: 0,
        paidAmount: bill.totalAmount,
      });
      setBills((prev) =>
        prev.map((b) => (b.id === updatedBill.id ? updatedBill : b))
      );
    } catch (err) {
      alert("Error clearing due: " + err.message);
    }
  };

  const printBill = (bill) => {
    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // Render PrintableBill into the iframe
    ReactDOM.render(
      <PrintableBill bill={bill} selectedTests={bill.selectedTests} />,
      doc.body
    );

    // Wait a little, then print and remove iframe
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 300); // small delay ensures rendering is done
  };

  const openDoctorModal = () => {
    setModalData({
      title: "Doctor Referrals",
      contentData: doctorEarnings,
    });
    setShowModal(true);
  };

  const openPcModal = () => {
    setModalData({
      title: "PC Referrals",
      contentData: pcEarnings,
    });
    setShowModal(true);
  };

  return (
    <div className="max-w mx-2 md:mx-10 mt-4 md:mt-10 space-y-6 md:space-y-8">
      {showModal && (
        <ReferralModal
          title={modalData.title}
          contentData={modalData.contentData}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="w-full md:w-auto">
          <div className="stats stats-vertical md:stats-horizontal bg-base-300 shadow">
            <div className="stat place-items-center py-2 md:py-4">
              <div className="stat-title text-xs md:text-sm">
                📋 Total Bills
              </div>
              <div className="stat-value text-lg md:text-2xl">
                {filteredBills.length}
              </div>
              <div className="stat-desc font-bold text-xs">⏳ All time</div>
            </div>

            <div className="stat place-items-center py-2 md:py-4">
              <div className="stat-title text-xs md:text-sm">
                💰 Total Sales
              </div>
              <div className="stat-value text-lg md:text-2xl">
                ৳{totalBillsAmount.toFixed(0)}
              </div>
              <div className="stat-desc font-bold text-xs">❌ Excludes due</div>
            </div>

            <div className="stat place-items-center py-2 md:py-4">
              <div className="stat-title text-xs md:text-sm">📉 Total Due</div>
              <div className="stat-value text-lg md:text-2xl">
                ৳{totalDueAmount.toFixed(0)}
              </div>
              <div className="stat-desc font-bold text-xs">⚠️ Unpaid bills</div>
            </div>

            <div className="stat place-items-center py-2 md:py-4">
              <div className="stat-title text-xs md:text-sm">
                🏦 Current Balance
              </div>
              <div className="stat-value text-lg md:text-2xl">
                ৳{(totalBillsAmount - totalDueAmount).toFixed(0)}
              </div>
              <div className="stat-desc font-bold text-xs">
                ✅ Available in accounts
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Link
            to="/newbill"
            className="btn btn-primary btn-sm md:btn-md w-full md:w-auto"
          >
            + New Bill
          </Link>
          <div className="flex gap-2">
            <button
              onClick={openDoctorModal}
              className="btn btn-outline btn-primary btn-sm md:btn-md flex-1"
            >
              <span className="hidden md:inline">Doctor Referrals</span>
              <span className="md:hidden">👨‍⚕️</span>
            </button>
            <button
              onClick={openPcModal}
              className="btn btn-outline btn-primary btn-sm md:btn-md flex-1"
            >
              <span className="hidden md:inline">PC Referrals</span>
              <span className="md:hidden">💻</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-base-100 p-3 border shadow-sm rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <button
            className="btn btn-sm md:hidden"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            {isFilterOpen ? "▲ Hide" : "▼ Show"} Filters
          </button>
        </div>

        <div className={`${isFilterOpen ? "block" : "hidden"} md:block`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex flex-col">
              <label className="font-semibold text-sm mb-1">📅 Date:</label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toLocaleDateString("en-CA")}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-sm mb-1">Bill Type:</label>
              <select
                className="select select-bordered select-sm"
                value={selectedBillType}
                onChange={(e) => setSelectedBillType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Test">🧪 Test</option>
                <option value="Doctor Visit">🩺 Doctor Visit</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-sm mb-1">
                Receptionist:
              </label>
              <select
                className="select select-bordered select-sm"
                value={selectedReceptionist}
                onChange={(e) => setSelectedReceptionist(e.target.value)}
              >
                <option value="all">👩‍💼 All</option>
                {receptionists.map((receptionist) => (
                  <option key={receptionist} value={receptionist}>
                    {receptionist}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-sm mb-1">Search By:</label>
              <select
                className="select select-bordered select-sm"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="all">🔍 All Fields</option>
                <option value="id">🆔 Bill ID</option>
                <option value="name">👤 Patient Name</option>
                <option value="phone">📞 Phone</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="flex flex-col md:col-span-2">
              <label className="font-semibold text-sm mb-1">Search Term:</label>
              <input
                type="text"
                placeholder={`Search by ${
                  searchField === "all" ? "any field" : searchField
                }`}
                className="input input-bordered input-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-3">
              <label className="label cursor-pointer gap-2 flex items-center select-none">
                <input
                  type="checkbox"
                  checked={showOnlyDue}
                  onChange={() => setShowOnlyDue(!showOnlyDue)}
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="label-text font-semibold text-sm">
                  Due Only
                </span>
              </label>

              <button
                className="btn btn-outline btn-sm hover:bg-base-300 transition-colors"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedBillType("all");
                  setSelectedReceptionist("all");
                  setShowOnlyDue(false);
                  setSearchField("all");
                  setSelectedDate(new Date().toLocaleDateString("en-CA"));
                }}
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
            <span className="ml-2">Loading bills...</span>
          </div>
        ) : error ? (
          <div className="alert alert-error m-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Error: {error}</span>
          </div>
        ) : (
          <BillsTable
            bills={filteredBills}
            formatToDDMMYY={formatToDDMMYY}
            handleClearDue={handleClearDue}
            handleArchive={handleArchive}
            printBill={printBill}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
