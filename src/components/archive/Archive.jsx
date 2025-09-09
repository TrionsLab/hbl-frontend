import { useCallback, useEffect, useState } from "react";
import { restoreBill, deleteBill, fetchArchivedBills } from "../../api/billApi";
import { formatToDDMMYY } from "../../helpers/commonHelpers";
import ArchiveTable from "../archiveTable/ArchiveTable";
import SideNavbar from "../common/SideNavbar";

const Archive = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArchivedBills();
      setBills(data);
    } catch (err) {
      setError(err.message || "Error fetching bills");
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this bill permanently?")
    )
      return;
    try {
      await deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert("Error deleting bill: " + err.message);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Are you sure you want to restore this bill?")) return;
    try {
      await restoreBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert("Error restoring bill: " + err.message);
    }
  };

  return (
    <div className="flex h-screen">
      <SideNavbar />
      <main className="flex-1 p-6 overflow-y-auto">
        {loading && (
          <div className="text-center mt-10">Loading archived bills...</div>
        )}
        {error && <div className="text-center mt-10 text-red-600">{error}</div>}
        {!loading && !error && bills.length === 0 && (
          <div className="text-center mt-10">No archived bills found.</div>
        )}
        {!loading && !error && bills.length > 0 && (
          <ArchiveTable
            bills={bills}
            formatToDDMMYY={formatToDDMMYY}
            handleDelete={handleDelete}
            handleRestore={handleRestore}
          />
        )}
      </main>
    </div>
  );
};

export default Archive;
