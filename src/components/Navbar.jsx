import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/Navbar.css";
import logo from "../assets/new_logo.png";


const Navbar = () => {
    const [open, setOpen] = useState(false);

    // Close sidebar when clicking a link
    const closeSidebar = () => {
        setOpen(false);
    };

    return (
        <>
            <div className="navbar-wrapper">
                <div className="navbar-container">

                    {/* Logo */}
                    <div className="navbar-logo">
                        <img src={logo} alt="Soulify Logo" />
                        <span>SOULIFY</span>
                    </div>

                    {/* Desktop Links */}
                    <ul className="navbar-links">
                        <li><Link to="/home">HOME</Link></li>
                        <li><Link to="/work">OUR WORK</Link></li>
                        <li><Link to="/why">Why Soulify</Link></li>
                        <li><Link to="/report">View Report</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                    </ul>

                    {/* Actions */}
                    <div className="navbar-actions">
                        <Link to="/signup" className="nav-signup-btn">Sign Up / Sign In</Link>
                        <div className="navbar-btn">
                            <Link to="/chat">Chat with Souli</Link>
                        </div>
                    </div>

                    <div className="hamburger" onClick={() => setOpen(true)}>
                        ☰
                    </div>

                </div>
            </div>

            {/* SIDE DRAWER + OVERLAY (keep your existing code) */}
        </>
    );
};

export default Navbar;
