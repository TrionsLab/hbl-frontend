import { useEffect, useState } from "react";
import {
  Layout,
  DatePicker,
  Card,
  Spin,
  Input,
  Tabs,
  Typography,
  Button,
} from "antd";
import { UserOutlined, HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import SideNavbar from "../../components/common/SideNavbar";
import { getReferralEarnings } from "../../api/referralEarningsApi";
import EarningsCard from "../../components/referral/EarningsCard";

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { Title } = Typography;
const { TabPane } = Tabs;

const ReferralEarnings = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async (from, to) => {
    setLoading(true);
    setError("");
    try {
      const res = await getReferralEarnings({
        from: from.format("YYYY-MM-DD"),
        to: to.format("YYYY-MM-DD"),
      });
      setData(res.data);
    } catch (err) {
      setError(err.message || "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      fetchData(dateRange[0], dateRange[1]);
    }
  }, [dateRange]);

  return (
    <div className="flex h-screen bg-gray-100">
      <SideNavbar />
      <Layout>
        <Content style={{ padding: 24 }}>
          <Title level={3}>Referral Earnings Summary</Title>

          {/* Date Range Picker & Search */}
          <div className="mb-6 flex items-center gap-4 flex-wrap">
            <span className="font-medium text-gray-700">
              Select Date Range:
            </span>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
              disabled={loading}
              allowClear={false}
              style={{ width: 280 }}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />

            <Search
              placeholder="Search referral name"
              allowClear
              value={searchTerm} // bind value explicitly
              onSearch={setSearchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 280 }}
            />

            <Button
              onClick={() => {
                setSearchTerm("");
                setDateRange([
                  dayjs().startOf("month"),
                  dayjs().endOf("month"),
                ]);
              }}
              disabled={!searchTerm && (!dateRange[0] || !dateRange[1])} // disable if nothing to clear
              type="default"
            >
              Clear Filters
            </Button>
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
              <div className="mb-6 text-lg font-semibold">
                Total Distributed Amount:{" "}
                <span className="text-blue-600">
                  ৳ {(data.totalDistributedAmount || 0).toFixed(2)}
                </span>
              </div>

              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <Tabs defaultActiveKey="1" type="card">
                  <TabPane
                    tab={
                      <span>
                        <UserOutlined /> Doctor Referrals
                      </span>
                    }
                    key="1"
                  >
                    <EarningsCard
                      title="Doctor Referrals"
                      items={data.doctorReferrals}
                      type="doctor"
                      searchTerm={searchTerm}
                    />
                  </TabPane>
                  <TabPane
                    tab={
                      <span>
                        <HomeOutlined /> PC Referrals
                      </span>
                    }
                    key="2"
                  >
                    <EarningsCard
                      title="PC Referrals"
                      items={data.pcReferrals}
                      type="pc"
                      searchTerm={searchTerm}
                    />
                  </TabPane>
                </Tabs>
              </Card>
            </>
          )}
        </Content>
      </Layout>
    </div>
  );
};

export default ReferralEarnings;
