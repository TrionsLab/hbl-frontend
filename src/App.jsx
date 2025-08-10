import SideNavbar from "./components/sidebar/Sidebar";
// import Login from "./pages/login/Login";
// import Dashboard from "./pages/admin/dashboard/Dashboard";
import Newbill from "./pages/newbill/Newbill";
// import Test from "./pages/test/Test";

// react router dom
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Dashboard />} />
          <Route path="/newbill" element={<Newbill />} />
          <Route path="/test" element={<Test />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route path="/login" element={<Login />}/> */}

          <Route path="/newbill" element={<Newbill />}/>
          <Route path="/admin/dashboard" element={<SideNavbar />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
