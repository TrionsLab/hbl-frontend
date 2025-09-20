import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { archiveBill, clearBillDue, fetchBillsByDate } from "../../api/billApi";
import BillsTable from "../../components/billsTable/BillsTable";
import PrintableBill from "../../components/printreceipt/PrintableBill";
import ReferralModal from "../../components/referral/ReferralModal";
import { formatToDDMMYY } from "../../helpers/commonHelpers";
import SideNavbar from "../../components/common/SideNavbar";

import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  Button,
  DatePicker,
  Select,
  Input,
  Checkbox,
  Modal,
  Spin,
  Alert,
  Empty,
} from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Content } = Layout;
const { Option } = Select;

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedBillType, setSelectedBillType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: "", contentData: {} });
  const [showOnlyDue, setShowOnlyDue] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState("all");

  const receptionists = [
    ...new Map(
      bills
        .filter((b) => b.receptionist)
        .map((b) => [b.receptionist.id, b.receptionist])
    ).values(),
  ];

  const fetchBills = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBillsByDate(date.format("YYYY-MM-DD"));
      setBills(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch bills");
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills(selectedDate);
  }, [selectedDate, fetchBills]);

  const filteredBills = bills.filter((bill) => {
    if (bill.archive) return false;
    if (selectedBillType !== "all" && bill.billType !== selectedBillType)
      return false;

    // receptionist filter
    if (
      selectedReceptionist !== "all" &&
      bill.receptionist?.id !== selectedReceptionist
    )
      return false;

    if (showOnlyDue && bill.due <= 0) return false;
    if (!searchTerm) return true;

    const lowerSearch = searchTerm.toLowerCase();

    if (searchField === "all") {
      // flatten relevant fields into one string
      const combinedFields = [
        bill.idNo,
        bill.billType,
        bill.date,
        bill.time,
        bill.totalAmount,
        bill.due,
        bill.patient?.name,
        bill.patient?.phone,
        bill.receptionist?.username,
        bill.receptionist?.email,
        bill.visitedDoctor?.name,
        bill.doctorReferral?.name,
        bill.pcReferral?.name,
      ]
        .filter(Boolean) // remove undefined/null
        .map((f) => f.toString().toLowerCase());

      return combinedFields.some((field) => field.includes(lowerSearch));
    } else if (searchField === "name") {
      return bill.patient?.name?.toLowerCase().includes(lowerSearch);
    } else if (searchField === "phone") {
      return bill.patient?.phone?.toLowerCase().includes(lowerSearch);
    } else {
      return String(bill[searchField] || "")
        .toLowerCase()
        .includes(lowerSearch);
    }
  });

  // Stats
  const doctorEarnings = filteredBills.reduce((acc, bill) => {
    if (bill.doctorReferral?.name) {
      acc[bill.doctorReferral.name] =
        (acc[bill.doctorReferral.name] || 0) +
        Number(bill.doctorReferralFee || 0);
    }
    return acc;
  }, {});

  const pcEarnings = filteredBills.reduce((acc, bill) => {
    if (bill.pcReferral?.name) {
      acc[bill.pcReferral.name] =
        (acc[bill.pcReferral.name] || 0) + Number(bill.pcReferralFee || 0);
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

  // Actions
  const handleArchive = async (id) => {
    Modal.confirm({
      title: "Archive Bill?",
      content: "Are you sure you want to archive this bill?",
      onOk: async () => {
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
          Modal.error({ title: "Error", content: err.message });
        }
      },
    });
  };

  const handleClearDue = async (bill) => {
    Modal.confirm({
      title: "Clear Due?",
      content: `Are you sure you want to clear due of ${bill.due} Tk?`,
      onOk: async () => {
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
          Modal.error({ title: "Error", content: err.message });
        }
      },
    });
  };

  const printBill = (bill) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    ReactDOM.render(
      <PrintableBill bill={bill} selectedTests={bill.selectedTests} />,
      doc.body
    );

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 300);
  };

  const openDoctorModal = () => {
    setModalData({ title: "Doctor Referrals", contentData: doctorEarnings });
    setShowModal(true);
  };
  const openPcModal = () => {
    setModalData({ title: "PC Referrals", contentData: pcEarnings });
    setShowModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavbar />
      <Layout>
        <Content style={{ margin: "20px", padding: "20px" }}>
          {showModal && (
            <ReferralModal
              title={modalData.title}
              contentData={modalData.contentData}
              onClose={() => setShowModal(false)}
            />
          )}

          {/* Stats */}
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="📋 Total Bills"
                  value={filteredBills.length}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="💰 Total Sales"
                  value={totalBillsAmount}
                  precision={0}
                  prefix="৳"
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="📉 Total Due"
                  value={totalDueAmount}
                  precision={0}
                  prefix="৳"
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="🏦 Current Balance"
                  value={totalBillsAmount - totalDueAmount}
                  precision={0}
                  prefix="৳"
                />
              </Card>
            </Col>
          </Row>

          {/* Actions */}
          <Row justify="space-between" style={{ marginBottom: 20 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => (window.location.href = "/newbill")}
            >
              New Bill
            </Button>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button onClick={openDoctorModal}>Doctor Referrals</Button>
              <Button onClick={openPcModal}>PC Referrals</Button>
            </div>
          </Row>

          {/* Filters */}
          <Card style={{ marginBottom: 20 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <label>Date</label>
                <DatePicker
                  value={selectedDate}
                  onChange={(val) => setSelectedDate(val)}
                  format="YYYY-MM-DD"
                  style={{ width: "100%" }}
                  disabledDate={(current) => current > dayjs()}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label>Bill Type</label>
                <Select
                  value={selectedBillType}
                  onChange={(val) => setSelectedBillType(val)}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All</Option>
                  <Option value="Test">🧪 Test</Option>
                  <Option value="Doctor Visit">🩺 Doctor Visit</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label>Receptionist</label>
                <Select
                  value={selectedReceptionist}
                  onChange={(val) => setSelectedReceptionist(val)}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All</Option>
                  {receptionists.map((r) => (
                    <Option key={r.id} value={r.id}>
                      {r.username}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label>Search By</label>
                <Select
                  value={searchField}
                  onChange={(val) => setSearchField(val)}
                  style={{ width: "100%" }}
                >
                  <Option value="all">All Fields</Option>
                  <Option value="idNo">Bill ID</Option>
                  <Option value="name">Patient Name</Option>
                  <Option value="phone">Phone</Option>
                </Select>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 10 }}>
              <Col xs={24} sm={12} md={16}>
                <Input
                  placeholder={`Search by ${
                    searchField === "all" ? "any field" : searchField
                  }`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Checkbox
                  checked={showOnlyDue}
                  onChange={(e) => setShowOnlyDue(e.target.checked)}
                >
                  Due Only
                </Checkbox>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedBillType("all");
                    setSelectedReceptionist("all");
                    setShowOnlyDue(false);
                    setSearchField("all");
                    setSelectedDate(dayjs());
                  }}
                  block
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Bills Table */}
          <Card>
            <Spin spinning={loading} tip="Loading bills...">
              {error ? (
                <Alert type="error" message="Error" description={error} />
              ) : filteredBills.length === 0 ? (
                <Empty description="No bills found" />
              ) : (
                <BillsTable
                  bills={filteredBills}
                  formatToDDMMYY={formatToDDMMYY}
                  handleClearDue={handleClearDue}
                  handleArchive={handleArchive}
                  printBill={printBill}
                />
              )}
            </Spin>
          </Card>
        </Content>
      </Layout>
    </div>
  );
};

export default Dashboard;
