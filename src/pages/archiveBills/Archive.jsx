import { useCallback, useEffect, useState } from "react";
import { Layout, Spin, Card } from "antd";
import { restoreBill, fetchArchivedBills } from "../../api/billApi";
import SideNavbar from "../../components/common/SideNavbar";
import ArchiveTable from "../../components/archiveTable/ArchiveTable";
import { formatToDDMMYY } from "../../helpers/commonHelpers";

const { Content } = Layout;

const Archive = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchArchivedBills();
      setBills(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching bills");
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

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
    <div className="flex h-screen bg-gray-50">
      <SideNavbar />

      <Layout>
        <Content style={{ padding: 24, overflow: "auto" }}>
          <Card title="Archived Bills" bordered>
            {loading ? (
              <div className="text-center py-12">
                <Spin size="large" />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 font-semibold">
                {error}
              </div>
            ) : bills.length === 0 ? (
              <div className="text-center text-gray-600">
                No archived bills found.
              </div>
            ) : (
              <ArchiveTable
                bills={bills}
                formatToDDMMYY={formatToDDMMYY}
                handleRestore={handleRestore}
              />
            )}
          </Card>
        </Content>
      </Layout>
    </div>
  );
};

export default Archive;
