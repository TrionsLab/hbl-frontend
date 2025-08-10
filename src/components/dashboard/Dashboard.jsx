import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { clearBillDue, deleteBill, fetchBillsByDate } from "../../api/billApi";
import BillsTable from "../billsTable/BillsTable";
import PrintableBill from "../printreceipt/PrintableBill";
import ReferralModal from "../referralModal/ReferralModal";

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("id");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [selectedBillType, setSelectedBillType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: "", contentData: {} });
  const [selectedTests, setSelectedTests] = useState([]);
  const [showOnlyDue, setShowOnlyDue] = useState(false);

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
    if (selectedBillType !== "all" && bill.billType !== selectedBillType) {
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
        (acc[bill.referralDoctorName] || 0) + Number(bill.referralDoctorFee || 0);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      await deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert("Error deleting bill: " + err.message);
    }
  };

  const handleClearDue = async (bill) => {
    if (!window.confirm(`Are you sure you want to clear due of ${bill.due} Tk?`))
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

  const formatToDDMMYY = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  };

  const printBill = (bill) => {
    const printWindow = window.open(
      "",
      "_blank",
      `width=${window.screen.availWidth},height=${window.screen.availHeight},left=0,top=0,scrollbars=yes,resizable=yes`
    );

    printWindow.document.write(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Hospital Bill Receipt</title>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>`
    );

    ReactDOM.render(
      <PrintableBill bill={bill} selectedTests={selectedTests} />,
      printWindow.document.getElementById("root")
    );

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
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
    <div className="max-w mx-10 mt-10 space-y-8">
      {showModal && (
        <ReferralModal
          title={modalData.title}
          contentData={modalData.contentData}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="flex justify-between items-center">
            <div style={{ backgroundColor: "#abc3e6ff" }} className="glass stats shadow">
              <div className="stat place-items-center">
                <div className="stat-title">Total Bills</div>
                <div className="stat-value">{filteredBills.length}</div>
                <div className="stat-desc font-bold">All time</div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-title">Total Sales</div>
                <div className="stat-value">৳{totalBillsAmount.toFixed(0)}</div>
                <div className="stat-desc font-bold">Excludes due</div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-title">Total Due</div>
                <div className="stat-value">৳{totalDueAmount.toFixed(0)}</div>
                <div className="stat-desc font-bold">Unpaid bills</div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-title">Current Balance</div>
                <div className="stat-value">
                  ৳{(totalBillsAmount - totalDueAmount).toFixed(0)}
                </div>
                <div className="stat-desc font-bold">Available in accounts</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mb-6">
          <button onClick={openDoctorModal} className="btn btn-outline btn-primary">
            Doctor Referrals
          </button>
          <button onClick={openPcModal} className="btn btn-outline btn-primary">
            PC Referrals
          </button>
        </div>
      </div>

      <div className="divider"></div>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center">
          <label className="mr-2 font-semibold">Date:</label>
          <input
            type="date"
            className="input input-bordered"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
            }}
            max={new Date().toLocaleDateString("en-CA")}
          />
        </div>

        <select
          className="select select-bordered"
          value={selectedBillType}
          onChange={(e) => {
            setSelectedBillType(e.target.value);
          }}
        >
          <option value="all">All</option>
          <option value="Test">Test</option>
          <option value="Doctor Visit">Doctor Visit</option>
        </select>

        <select
          className="select select-bordered"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        >
          <option value="id">Bill ID</option>
          <option value="name">Patient Name</option>
          <option value="phone">Phone</option>
        </select>

        <input
          type="text"
          placeholder={`Search by ${searchField}`}
          className="input input-bordered flex-1 max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <label className="label cursor-pointer gap-2">
          <span className="label-text">Due Only</span>
          <input
            type="checkbox"
            checked={showOnlyDue}
            onChange={() => setShowOnlyDue(!showOnlyDue)}
            className="checkbox checkbox-primary"
          />
        </label>

        <button
          className="btn btn-outline"
          onClick={() => {
            setSearchTerm("");
            setSelectedBillType("all");
            setShowOnlyDue(false);
          }}
        >
          Reset
        </button>
      </div>

      <BillsTable
        bills={filteredBills}
        formatToDDMMYY={formatToDDMMYY}
        handleClearDue={handleClearDue}
        handleDelete={handleDelete}
        printBill={printBill}
      />
    </div>
  );
};

export default Dashboard;
