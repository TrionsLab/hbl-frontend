import { useEffect, useState } from "react";
import { Layout, DatePicker, Button, Table, Card, Spin } from "antd";
import SideNavbar from "../../components/common/SideNavbar";
import { fetchMonthlyStats } from "../../api/billApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const { Content } = Layout;

const Stats = () => {
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [totalMonthlyAmount, setTotalMonthlyAmount] = useState(0);
  const [totalByType, setTotalByType] = useState([]);
  const [dailyTotals, setDailyTotals] = useState([]);
  const [dailyTotalsByType, setDailyTotalsByType] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    fetchMonthlyStats(month)
      .then((res) => {
        setTotalMonthlyAmount(res.totalMonthlyAmount || 0);
        setTotalByType(res.totalByType || []);
        setDailyTotals(res.dailyTotals || []);
        setDailyTotalsByType(res.dailyTotalsByType || []);
      })
      .catch((err) => console.error("Failed to fetch stats", err))
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
    doc.setFontSize(18);
    doc.text(`Monthly Report - ${month}`, 14, 15);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    doc.setFontSize(14);
    doc.text(
      `Total Monthly Amount: ${totalMonthlyAmount.toLocaleString()}Tk`,
      14,
      35
    );

    const typeData = totalByType.map(({ billType, totalByType }) => [
      billType || "Unknown",
      `${totalByType.toLocaleString()}Tk`,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["Bill Type", "Amount"]],
      body: typeData,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: { 1: { halign: "right" } },
    });

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
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: { 1: { halign: "right" }, 2: { cellWidth: 80 } },
      bodyStyles: { minCellHeight: 20 },
    });

    doc.save(`Monthly_Report_${month}.pdf`);
  };

  const dailyColumns = [
    {
      title: "Date",
      dataIndex: "day",
      key: "day",
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Total Amount (৳)",
      dataIndex: "totalPerDay",
      key: "totalPerDay",
      align: "right",
      render: (val) => val.toLocaleString(),
    },
  ];

  const dailyDataWithKey = dailyTotals.map((d, i) => ({ ...d, key: i }));

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavbar />

      <Layout>
        <Content style={{ padding: "16px", overflow: "auto" }}>
          <div className="space-y-6">
            {/* Month Picker and Download PDF */}
            <div className="flex justify-between items-center mb-4">
              <DatePicker.MonthPicker
                value={month ? dayjs(month, "YYYY-MM") : null} // ✅ use dayjs
                onChange={(date, dateString) => setMonth(dateString)}
                format="YYYY-MM"
                disabled={loading}
              />
              <Button
                type="primary"
                onClick={generatePDF}
                disabled={loading || dailyTotals.length === 0}
              >
                Download PDF Report
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Spin size="large" tip="Loading stats..." />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:space-x-8">
                {/* Left: Daily Totals Table */}
                <div className="flex-1">
                  <Card title="Daily Totals" bordered className="mb-4">
                    <Table
                      columns={dailyColumns}
                      dataSource={dailyDataWithKey}
                      pagination={false}
                      expandable={{
                        expandedRowRender: (record) => {
                          const rows = (dailyByTypeMap[record.day] || []).map(
                            ({ billType, totalPerDayByType }, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between py-1 border-b last:border-0"
                              >
                                <span>{billType || "Unknown"}</span>
                                <span>
                                  ৳{totalPerDayByType.toLocaleString()}
                                </span>
                              </div>
                            )
                          );
                          return <div className="pl-4">{rows}</div>;
                        },
                      }}
                    />
                  </Card>
                </div>

                {/* Right: Summary Cards */}
                <div className="md:w-80 flex flex-col space-y-4">
                  <Card>
                    <h3 className="text-lg font-bold mb-2">
                      Total Sales for {month}
                    </h3>
                    <p className="text-2xl font-extrabold">
                      ৳{totalMonthlyAmount.toLocaleString()}
                    </p>
                  </Card>

                  {totalByType.map(({ billType, totalByType }, idx) => (
                    <Card key={idx}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Bill Type</p>
                          <p className="font-medium">{billType || "Unknown"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-semibold text-indigo-600">
                            ৳{totalByType.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default Stats;
