import { useEffect, useState } from "react";
import { Layout, DatePicker, Card, Spin, Row, Col } from "antd";
import dayjs from "dayjs";
import SideNavbar from "../../components/common/SideNavbar";
import { getReferralEarnings } from "../../api/referralEarningsApi";

const { Content } = Layout;

const ReferralEarnings = () => {
  const [month, setMonth] = useState(() => dayjs()); // Day.js object
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async (monthParam) => {
    setLoading(true);
    setError("");
    try {
      const data = await getReferralEarnings(monthParam);
      setData(data);
    } catch (err) {
      setError(err.message || "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (month) {
      fetchData(month.format("YYYY-MM"));
    }
  }, [month]);

  const EarningsCard = ({ title, items }) => {
    const total = items
      ? items
          .filter((item) => item.name && item.name.trim() !== "")
          .reduce((sum, item) => sum + parseFloat(item.totalEarnings || 0), 0)
      : 0;

    return (
      <Card
        title={title}
        bordered
        style={{ flex: 1, maxHeight: 400, overflowY: "auto" }}
      >
        {items && items.length > 0 ? (
          <ul className="space-y-1">
            {items
              .filter((item) => item.name && item.name.trim() !== "")
              .map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between border-b border-gray-100 pb-1"
                >
                  <span className="truncate">{item.name}</span>
                  <span>
                    ৳ {parseFloat(item.totalEarnings || 0).toFixed(2)}
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p>No referrals available.</p>
        )}
        <p className="text-right font-semibold mt-2">
          Total: ৳ {total.toFixed(2)}
        </p>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavbar />
      <Layout>
        <Content style={{ padding: 24 }}>
          <h1 className="text-xl font-medium mb-4">
            Referral Earnings Summary
          </h1>

          {/* Month Picker */}
          <div className="mb-6 flex items-center gap-4">
            <span className="font-medium text-gray-700">Select Month:</span>
            <DatePicker.MonthPicker
              value={month}
              onChange={(date) => setMonth(date)}
              format="YYYY-MM"
              disabled={loading}
              allowClear={false}
              style={{ width: 150 }}
              placeholder="Select Month"
              disabledDate={(current) =>
                current && current > dayjs().endOf("month")
              }
            />
          </div>

          {loading && (
            <div className="text-center py-12">
              <Spin size="large" tip="Loading referral earnings..." />
            </div>
          )}

          {error && (
            <p className="text-center text-red-500 font-semibold mb-4">
              {error}
            </p>
          )}

          {!loading && !error && data && (
            <>
              <p className="text-lg font-semibold mb-6">
                Total Distributed Amount: ৳{" "}
                {(data.totalDistributedAmount || 0).toFixed(2)}
              </p>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <EarningsCard
                    title="Doctor Referrals"
                    items={data.doctorReferrals}
                  />
                </Col>
                <Col xs={24} md={12}>
                  <EarningsCard title="PC Referrals" items={data.pcReferrals} />
                </Col>
              </Row>
            </>
          )}
        </Content>
      </Layout>
    </div>
  );
};

export default ReferralEarnings;
