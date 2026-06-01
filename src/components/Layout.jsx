import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SoulButterfly from './SoulButterfly';

// Lightweight CSS fade for page transitions - no artificial delays
const pageStyle = {
    animation: 'pageFadeIn 0.35s ease forwards',
};

const globalStyle = `
@keyframes pageFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}
`;

const Layout = ({ children }) => {
    const location = useLocation();
    const [key, setKey] = useState(location.pathname);

    const noLayoutRoutes = ['/', '/loading', '/login', '/signup', '/chat'];
    const isSplash = location.pathname === '/';
    const isLoadingPage = location.pathname === '/loading';
    const hideLayout = noLayoutRoutes.includes(location.pathname);

    useEffect(() => {
        setKey(location.pathname);
        // Scroll to top on every navigation
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    return (
        <>
            <style>{globalStyle}</style>
            {!hideLayout && <Navbar />}
            {location.pathname === '/home' && <SoulButterfly />}
            <main key={key} style={pageStyle}>
                {children}
            </main>
            {!hideLayout && <Footer />}
        </>
    );
};

export default Layout;
