import logo from "../../assets/logo.png";
const Navbar = () => {
  return (
    <nav className="bg-slate- px-6 py-2 flex items-center justify-center flex">
      <img src={logo} alt="Logo" className="w-20 h-20 rounded-full" />
    </nav>
  );
};

export default Navbar;
