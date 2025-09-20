import { useEffect, useState } from "react";
import { Layout, DatePicker, Button, Card, Spin, Row, Col } from "antd";
import { Column } from "@ant-design/plots"; // Ant Design charts
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
        const data = res.data.data;
        setTotalMonthlyAmount(Number(data.totalMonthlyAmount) || 0);
        setTotalByType(
          data.totalByType.map((t) => ({
            ...t,
            totalByType: Number(t.totalByType),
          })) || []
        );
        setDailyTotals(
          data.dailyTotals.map((d) => ({
            ...d,
            totalPerDay: Number(d.totalPerDay),
          })) || []
        );
        setDailyTotalsByType(
          data.dailyTotalsByType.map((d) => ({
            ...d,
            totalPerDayByType: Number(d.totalPerDayByType),
          })) || []
        );
      })
      .catch((err) => console.error("Failed to fetch stats", err))
      .finally(() => setLoading(false));
  }, [month]);

  // Group dailyTotalsByType by day for charts if needed
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

  // Chart configs
  const dailyChartConfig = {
    data: dailyTotals.map((d) => ({
      date: new Date(d.day).toLocaleDateString(),
      total: d.totalPerDay,
    })),
    xField: "date",
    yField: "total",
    label: { position: "middle", style: { fill: "#FFFFFF" } },
    meta: { total: { alias: "Total Amount (৳)" } },
    color: "#1890ff",
  };

  const typeChartConfig = {
    data: totalByType.map((t) => ({ type: t.billType, total: t.totalByType })),
    xField: "type",
    yField: "total",
    label: { position: "middle", style: { fill: "#FFFFFF" } },
    meta: { total: { alias: "Total Amount (৳)" } },
    color: "#52c41a",
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavbar />
      <Layout>
        <Content style={{ padding: "16px", overflow: "auto" }}>
          <div className="space-y-6">
            {/* Month Picker and Download PDF */}
            <div className="flex justify-between items-center mb-4">
              <DatePicker.MonthPicker
                value={month ? dayjs(month, "YYYY-MM") : null}
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
              <div className="space-y-8">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Card title={`Daily Sales for ${month}`}>
                      {dailyTotals.length > 0 ? (
                        <Column {...dailyChartConfig} />
                      ) : (
                        <p className="text-center text-gray-400 py-12">
                          No daily sales data found.
                        </p>
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title={`Sales by Bill Type for ${month}`}>
                      {totalByType.length > 0 ? (
                        <Column {...typeChartConfig} />
                      ) : (
                        <p className="text-center text-gray-400 py-12">
                          No sales by type data found.
                        </p>
                      )}
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16} className="mt-6">
                  <Col xs={24} md={8}>
                    <Card>
                      <h3 className="text-lg font-bold mb-2">
                        Total Sales for {month}
                      </h3>
                      {totalMonthlyAmount > 0 ? (
                        <p className="text-2xl font-extrabold">
                          ৳{totalMonthlyAmount.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-gray-400">
                          No total sales data found.
                        </p>
                      )}
                    </Card>
                  </Col>

                  {totalByType.length > 0 ? (
                    totalByType.map(({ billType, totalByType }, idx) => (
                      <Col xs={24} md={8} key={idx}>
                        <Card>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">Bill Type</p>
                              <p className="font-medium">
                                {billType || "Unknown"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="font-semibold text-indigo-600">
                                ৳{totalByType.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col xs={24} md={8}>
                      <Card>
                        <p className="text-center text-gray-400 py-6">
                          No bill type data found.
                        </p>
                      </Card>
                    </Col>
                  )}
                </Row>
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default Stats;
