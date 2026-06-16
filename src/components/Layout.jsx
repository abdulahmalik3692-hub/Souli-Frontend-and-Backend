import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ButterflyCursor from './ButterflyCursor';
import MascotWidget from './MascotWidget';

// Lightweight CSS fade for page transitions - opacity only to avoid CLS
const pageStyle = {
    animation: 'pageFadeIn 0.35s ease forwards',
    minHeight: '100vh',
};

const globalStyle = `
@keyframes pageFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
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
            <ButterflyCursor />
            {!hideLayout && <Navbar />}
            <main key={key} style={pageStyle}>
                {children}
            </main>
            {location.pathname === '/home' && <MascotWidget />}
            {!hideLayout && <Footer />}
        </>
    );
};

export default Layout;

