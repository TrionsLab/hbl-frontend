import { Table, Button, Tag } from "antd";

const BillsTable = ({
  bills,
  formatToDDMMYY,
  handleClearDue,
  handleArchive,
  printBill,
}) => {
  const columns = [
    {
      title: "Bill ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => formatToDDMMYY(date),
    },
    {
      title: "Patient",
      key: "patient",
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.patient?.name || "N/A"}</strong>
          </div>
          <div>{record.patient?.phone || ""}</div>
        </div>
      ),
    },
    {
      title: "Receptionist",
      key: "receptionist",
      render: (_, record) => record.receptionist?.username || "N/A",
    },
    {
      title: "Visited Doctor",
      key: "visitedDoctor",
      render: (_, record) => record.visitedDoctor?.name || "—",
    },
    {
      title: "Referral Doctor",
      key: "doctorReferral",
      render: (_, record) => record.doctorReferral?.name || "—",
    },
    {
      title: "Referral PC",
      key: "pcReferral",
      render: (_, record) => record.pcReferral?.name || "—",
    },
    {
      title: "Total (৳)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amt) => <strong>{Number(amt).toFixed(2)}</strong>,
    },
    {
      title: "Due (৳)",
      dataIndex: "due",
      key: "due",
      render: (due) =>
        due > 0 ? (
          <Tag color="red">{Number(due).toFixed(2)}</Tag>
        ) : (
          <Tag color="green">Cleared</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <Button size="small" onClick={() => printBill(record)}>
            🖨️ Print
          </Button>
          {record.due > 0 && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleClearDue(record)}
            >
              Clear Due
            </Button>
          )}
          {!record.archive && (
            <Button
              size="small"
              danger
              onClick={() => handleArchive(record.id)}
            >
              Archive
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={bills}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default BillsTable;
