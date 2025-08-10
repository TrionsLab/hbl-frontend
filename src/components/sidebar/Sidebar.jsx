import { useState } from "react";
import logo from "../../assets/logo.png";
import Dashboard from "../../components/dashboard/Dashboard";
import Archive from "../archive/Archive";
import ReferralEarnings from "../referralEarnings/ReferralEarnings";
import ReferralManager from "../referralManager/ReferralManager";
import Stats from "../stats/Stats";

const SideNavbar = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "stats":
        return <StatsContent />;
      case "archive":
        return <ArchiveContent />;
      case "reference-manager":
        return <ReferralManagerContent />;
      case "reports":
        return <ReferralEarningsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Navbar */}
      <div className="w-64 bg-white shadow-md">
        <div className="flex justify-center p-4 border-b border-gray-200">
          <img width={75} src={logo} alt="" />
        </div>
        <nav className="mt-6">
          <NavItem
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavItem
            label="Statistics"
            active={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
          />
          <NavItem
            label="Archive"
            active={activeTab === "archive"}
            onClick={() => setActiveTab("archive")}
          />
          <NavItem
            label="Referral Expenses"
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
          />
          <NavItem
            label="Reference Manager"
            active={activeTab === "reference-manager"}
            onClick={() => setActiveTab("reference-manager")}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">{renderContent()}</div>
    </div>
  );
};

const NavItem = ({ label, active, onClick }) => {
  return (
    <div
      className={`px-6 py-3 cursor-pointer transition-colors duration-200 
        ${
          active
            ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      onClick={onClick}
    >
      <span className="font-medium">{label}</span>
    </div>
  );
};

// Content Components (remain the same as before)
const DashboardContent = () => <Dashboard />;

const StatsContent = () => <Stats />;

const ArchiveContent = () => <Archive />;

const ReferralEarningsContent = () => <ReferralEarnings />;

const ReferralManagerContent = () => <ReferralManager />;

export default SideNavbar;
