import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Main from "./pages/Main.jsx";
import Profile from "./pages/Profile.jsx";
import Page404 from "./pages/404.jsx";
import Contact from "./pages/Contact.jsx";
import Search from "./pages/Search.jsx";

import Navbar from "./components/Navbar.jsx";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/main" element={<Main />} />
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </Router>
  )
}
