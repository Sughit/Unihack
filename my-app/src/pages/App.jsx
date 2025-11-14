import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Main from "./Main.jsx";
import Profile from "./Profile.jsx";
import Page404 from "./404.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/main" element={<Main />} />
        <Route path="/profile" element={<Profile />} /> 
        <Route path="*" element={<Page404 />} />
      </Routes>
    </Router>
  )
}
