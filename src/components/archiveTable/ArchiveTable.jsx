import { Table, Tag, Button, Tooltip } from "antd";
import restoreIcon from "/assets/restore.png";

const ArchiveTable = ({ bills, formatToDDMMYY, handleRestore }) => {
  const columns = [
    {
      title: "ID",
      dataIndex: "idNo",
      key: "idNo",
      render: (idNo, bill) => (
        <div>
          <div className="font-medium text-gray-900">{idNo}</div>
          <div className="text-gray-600 text-xs">{bill.billType}</div>
        </div>
      ),
      width: 120,
    },
    {
      title: "Date/Time",
      dataIndex: "date",
      key: "date",
      render: (date, bill) => (
        <>
          {formatToDDMMYY(date)} <br /> {bill.time}
        </>
      ),
      width: 120,
    },
    {
      title: "Patient",
      dataIndex: "patient",
      key: "patient",
      render: (patient) =>
        patient ? (
          <>
            <div className="font-medium text-gray-900">{patient.name}</div>
            <div className="text-gray-600 text-xs">
              {patient.age} yrs
              {patient.ageMonths ? `, ${patient.ageMonths} mos` : ""} |{" "}
              {patient.gender}
              <br />
              <span className="font-medium">Phone:</span> {patient.phone}
            </div>
          </>
        ) : (
          "-"
        ),
      width: 200,
    },
    {
      title: "Doctor",
      dataIndex: "visitedDoctor",
      key: "visitedDoctor",
      render: (doctor) =>
        doctor ? (
          <div>
            {doctor.name}{" "}
            <span className="text-xs text-gray-600">
              ({doctor.specialization || "N/A"})
            </span>
          </div>
        ) : (
          "-"
        ),
      width: 150,
    },
    {
      title: "Referrals",
      key: "referrals",
      render: (_, bill) => (
        <>
          {bill.doctorReferral && (
            <div className="mb-1">
              <span className="font-medium text-gray-700 text-xs">Dr:</span>{" "}
              {bill.doctorReferral.name}{" "}
              <span className="text-gray-600 text-xs">
                (৳{bill.doctorReferralFee})
              </span>
            </div>
          )}
          {bill.pcReferral && (
            <div>
              <span className="font-medium text-gray-700 text-xs">PC:</span>{" "}
              {bill.pcReferral.name}{" "}
              <span className="text-gray-600 text-xs">
                (৳{bill.pcReferralFee})
              </span>
            </div>
          )}
          {!bill.doctorReferral && !bill.pcReferral && "-"}
        </>
      ),
      width: 200,
    },
    {
      title: "Bill Details",
      key: "billDetails",
      render: (_, bill) => {
        const totalDiscount = (
          (Number(bill.grossAmount || 0) * Number(bill.discount || 0)) / 100 +
          Number(bill.extraDiscount || 0)
        ).toFixed(2);
        return (
          <div className="space-y-1 text-xs">
            <div>
              <span className="text-gray-700">Gross:</span>{" "}
              <span className="text-gray-900">৳{bill.grossAmount}</span>
            </div>
            <div>
              <span className="text-gray-700">Total Discount:</span> ৳
              {totalDiscount}
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
        );
      },
      width: 180,
    },
    {
      title: "Payment Status",
      key: "paymentStatus",
      render: (_, bill) =>
        Number(bill.due) > 0 ? (
          <Tag color="orange">{bill.due} Tk Due</Tag>
        ) : (
          <Tag color="green">Paid</Tag>
        ),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          onClick={() => handleRestore(record.id)}
          title="Restore Bill"
        >
          <img src={restoreIcon} width={20} alt="Restore" />
        </Button>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={bills.filter((bill) => bill.archive)}
      pagination={{ pageSize: 10 }}
      scroll={{ x: "max-content" }}
      bordered
    />
  );
};

export default ArchiveTable;
