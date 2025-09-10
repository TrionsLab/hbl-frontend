import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { logout } from "../../api/authService";
import logo from "/assets/logo.png";
import {
  DashboardOutlined,
  BarChartOutlined,
  DeleteOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  ExperimentOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const SideNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleLogout = () => {
    logout();
    if (isMobileView) {
      setIsMobileMenuOpen(false);
    }
  };

  const menuItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: <DashboardOutlined /> },
    { label: "Statistics", to: "/admin/stats", icon: <BarChartOutlined /> },
    { label: "Deleted Bills", to: "/admin/archive", icon: <DeleteOutlined /> },
    {
      label: "Referral Expenses",
      to: "/admin/reports",
      icon: <DollarCircleOutlined />,
    },
    // Replacing Reference Manager with Doctor Manager & PC Manager
    {
      label: "Doctor Manager",
      to: "/admin/doctors",
      icon: <TeamOutlined />,
    },
    {
      label: "PC Manager",
      to: "/admin/pcs",
      icon: <UserSwitchOutlined />,
    },
    {
      label: "Reception Manager",
      to: "/admin/receptions",
      icon: <UserSwitchOutlined />,
    },
    { label: "Test", to: "/admin/test", icon: <ExperimentOutlined /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobileView && (
        <div className="flex items-center justify-between p-4 bg-white shadow-md md:hidden">
          <img width={50} src={logo} alt="Logo" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? "✖" : "☰"}
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
      ${isMobileView ? "fixed inset-y-0 left-0 z-50 transform" : "w-64"} 
      ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0 md:relative md:w-64
      bg-blue-50 shadow-md transition-transform duration-300 ease-in-out
      w-64 h-full overflow-y-auto
    `}
      >
        <div className="flex justify-center p-4 border-b border-gray-200">
          <img width={75} src={logo} alt="Logo" />
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              onClick={() => isMobileView && setIsMobileMenuOpen(false)}
            />
          ))}

          {/* Logout */}
          <div
            onClick={handleLogout}
            className="flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 text-red-600 hover:bg-red-100 font-medium"
          >
            <LogoutOutlined className="text-lg mr-3" />
            <span>Logout</span>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {isMobileView && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

const NavItem = ({ to, label, icon, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 
      ${
        isActive
          ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
          : "text-gray-600 hover:bg-gray-50"
      }`
    }
  >
    <span className="text-lg mr-3">{icon}</span>
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default SideNavbar;
