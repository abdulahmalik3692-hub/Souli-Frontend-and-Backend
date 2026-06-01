import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authBg from '../assets/images/auth_bg.png';

export default function Auth() {
    const location = useLocation();
    const isSignUpInitial = location.pathname === '/signup';
    const [isRightPanelActive, setIsRightPanelActive] = useState(isSignUpInitial);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e, type) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);
        
        try {
            if (type === 'login') {
                const response = await fetch("http://127.0.0.1:5000/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: name, password })
                });
                const data = await response.json();
                
                if (data.status === 'success') {
                    localStorage.setItem("soulify_user", JSON.stringify(data.user));
                    setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                    setTimeout(() => {
                        navigate('/chat');
                    }, 1000);
                } else if (data.status === 'unverified') {
                    setEmail(name);
                    setIsVerifying(true);
                    setMessage({ text: data.message, type: 'success' });
                } else {
                    setMessage({ text: data.message || 'Login failed', type: 'error' });
                }
            } else {
                const response = await fetch("http://127.0.0.1:5000/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await response.json();
                
                if (data.status === 'success') {
                    setIsVerifying(true);
                    setMessage({ text: 'Registration successful! Verification code sent to your email.', type: 'success' });
                } else {
                    setMessage({ text: data.message || 'Signup failed', type: 'error' });
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            setMessage({ text: 'Unable to connect to the authentication server.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);
        
        try {
            const response = await fetch("http://127.0.0.1:5000/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: verificationCode })
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                setMessage({ text: data.message + ' Redirecting to login...', type: 'success' });
                setTimeout(() => {
                    setIsVerifying(false);
                    setIsRightPanelActive(false);
                    setName(email);
                    setPassword('');
                    setVerificationCode('');
                    setMessage({ text: 'Please sign in with your password to access your dashboard.', type: 'success' });
                }, 2500);
            } else {
                setMessage({ text: data.message || 'Verification failed', type: 'error' });
            }
        } catch (error) {
            console.error("Verification error:", error);
            setMessage({ text: 'Unable to connect to the authentication server.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden" style={{
            backgroundColor: '#050e12',
            color: '#f0f8fa',
            fontFamily: 'Inter, sans-serif'
        }}>

            {/* Glowing Floating Lines Background (Inspired by React Bits) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Map multiple vertical lines to fill the viewport floating upwards */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bottom-[-20%] w-[1px] bg-gradient-to-t from-transparent via-[#38768B] to-transparent opacity-30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            height: `${Math.random() * 40 + 20}%`,
                            animation: `floatUp ${Math.random() * 8 + 7}s linear infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            filter: 'blur(2px)'
                        }}
                    ></div>
                ))}
            </div>

            <style>
                {`
                @keyframes floatUp {
                    0% { transform: translateY(100vh) scaleY(1); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(-100vh) scaleY(1.5); opacity: 0; }
                }
                @property --angle {
                    syntax: '<angle>';
                    initial-value: 0deg;
                    inherits: false;
                }

                /* Container handles the 3D perspective if we want to add flip flips, but we are doing absolute sliding */
                .auth-container {
                    position: relative;
                    width: 1000px;
                    max-width: 100%;
                    height: 600px;
                    background: #0A1E26;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 0 50px rgba(56, 118, 139, 0.2);
                    z-index: 10;
                }

                .auth-container::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 24px;
                    padding: 2px; 
                    background: conic-gradient(from var(--angle), transparent 0%, transparent 60%, rgba(56,118,139, 0.4) 80%, #7EC8C8 100%);
                    -webkit-mask: 
                        linear-gradient(#fff 0 0) content-box, 
                        linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                    animation: rotateAngle 3s linear infinite;
                    z-index: 200;
                }

                @keyframes rotateAngle {
                    to {
                        --angle: 360deg;
                    }
                }

                .form-container {
                    position: absolute;
                    top: 0;
                    height: 100%;
                    transition: all 0.6s ease-in-out;
                }

                /* SignIn Form (Left) */
                .sign-in-container {
                    left: 0;
                    width: 50%;
                    z-index: 2;
                }
                .auth-container.right-panel-active .sign-in-container {
                    transform: translateX(100%);
                    opacity: 0;
                }

                /* SignUp Form (Left initially, slides to Right) */
                .sign-up-container {
                    left: 0;
                    width: 50%;
                    opacity: 0;
                    z-index: 1;
                }
                .auth-container.right-panel-active .sign-up-container {
                    transform: translateX(100%);
                    opacity: 1;
                    z-index: 5;
                    animation: show 0.6s;
                }

                @keyframes show {
                    0%, 49.99% { opacity: 0; z-index: 1; }
                    50%, 100% { opacity: 1; z-index: 5; }
                }

                /* The Sliding Overlay (The Blue Area) */
                .overlay-container {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    width: 50%;
                    height: 100%;
                    overflow: hidden;
                    transition: transform 0.6s ease-in-out;
                    z-index: 100;
                }
                .auth-container.right-panel-active .overlay-container {
                    transform: translateX(-100%);
                }

                .overlay {
                    background: linear-gradient(135deg, rgba(27,60,74,0.85), rgba(56,118,139,0.85), rgba(10,30,38,0.9)), url(${authBg});
                    background-size: cover;
                    background-position: center;
                    background-blend-mode: overlay;
                    color: #FFFFFF;
                    position: relative;
                    left: -100%;
                    height: 100%;
                    width: 200%;
                    transform: translateX(0);
                    transition: transform 0.6s ease-in-out;
                }

                .overlay::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -150%;
                    width: 60%;
                    height: 100%;
                    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%);
                    transform: skewX(-25deg);
                    animation: flareSweep 4s infinite cubic-bezier(0.25, 0.8, 0.25, 1);
                    z-index: 0;
                }

                @keyframes gradientShine {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes flareSweep {
                    0% { left: -150%; }
                    50% { left: 200%; }
                    100% { left: 200%; }
                }
                .auth-container.right-panel-active .overlay {
                    transform: translateX(50%);
                }

                /* Text Panels inside the blue overlay */
                .overlay-panel {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    padding: 0 40px;
                    text-align: center;
                    top: 0;
                    height: 100%;
                    width: 50%;
                    transform: translateX(0);
                    transition: transform 0.6s ease-in-out;
                }
                
                .overlay-left {
                    transform: translateX(-20%);
                }
                .auth-container.right-panel-active .overlay-left {
                    transform: translateX(0);
                }

                .overlay-right {
                    right: 0;
                    transform: translateX(0);
                }
                .auth-container.right-panel-active .overlay-right {
                    transform: translateX(20%);
                }

                .auth-form {
                    background-color: #0A1E26;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    padding: 0 60px;
                    height: 100%;
                    text-align: center;
                }

                .auth-input {
                    background-color: transparent;
                    border: none;
                    border-bottom: 1px solid rgba(167, 196, 188, 0.3);
                    padding: 12px 15px;
                    margin: 12px 0;
                    width: 100%;
                    color: #f0f8fa;
                    outline: none;
                    transition: border-color 0.3s;
                    font-family: 'Inter', sans-serif;
                    letter-spacing: 0.02em;
                }
                .auth-input::placeholder { color: #A7C4BC; opacity: 0.6; }
                .auth-input:focus { border-bottom-color: #7EC8C8; }

                .auth-btn {
                    border-radius: 12px;
                    border: 1px solid transparent;
                    background: linear-gradient(to right, #38768B, #2F5D6E);
                    color: #FFFFFF;
                    font-size: 14px;
                    font-weight: bold;
                    padding: 12px 45px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    transition: transform 80ms ease-in;
                    cursor: pointer;
                    margin-top: 24px;
                }
                .auth-btn:active { transform: scale(0.95); }
                .auth-btn:focus { outline: none; }
                .auth-btn.ghost {
                    background-color: transparent;
                    border-color: #FFFFFF;
                }
                `}
            </style>

            {/* Go to Home - top left */}
            <Link
                to="/home"
                style={{
                    position: 'fixed',
                    top: '1.25rem',
                    left: '1.5rem',
                    color: '#aaa',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    zIndex: 9999,
                    transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
            >
                ← Home
            </Link>

            <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>

                {/* 1. Email Verification Overlay Panel */}
                {isVerifying && (
                    <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#0A1E26]/98 backdrop-blur-md animate-fade-in">
                        <form className="auth-form max-w-md w-full px-8 py-12 flex flex-col items-center" onSubmit={handleVerify}>
                            <h1 className="text-3xl font-bold mb-4">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7EC8C8] to-[#38768B]">Verify Email</span>
                            </h1>
                            <p className="text-[#A7C4BC] text-[13px] font-light mb-6 max-w-[320px] leading-relaxed">
                                Enter the 6-digit verification code sent to your email:<br />
                                <strong className="text-white font-medium">{email}</strong>
                            </p>
                            
                            {message.text && (
                                <div className={`text-xs my-3 font-semibold px-4 py-2 rounded-lg border ${
                                    message.type === 'success' 
                                        ? 'bg-[#7EC8C8]/10 text-[#7EC8C8] border-[#7EC8C8]/20' 
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                    {message.text}
                                </div>
                            )}

                            <input
                                type="text"
                                placeholder="------"
                                className="auth-input text-center text-2xl tracking-[0.4em] font-mono mt-2 mb-6"
                                maxLength={6}
                                value={verificationCode}
                                onChange={e => setVerificationCode(e.target.value)}
                                required
                            />
                            
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Activate'}
                            </button>
                            
                            <button 
                                type="button" 
                                className="text-xs text-[#A7C4BC]/60 hover:text-white mt-6 underline cursor-pointer bg-transparent border-none outline-none"
                                onClick={() => {
                                    setIsVerifying(false);
                                    setMessage({ text: '', type: '' });
                                }}
                            >
                                Back to Registration
                            </button>
                        </form>
                    </div>
                )}

                {/* 2. Sign Up Form (Left side normally hidden under overlay when active) */}
                <div className="form-container sign-up-container">
                    <form className="auth-form" onSubmit={(e) => handleAuth(e, 'signup')}>
                        <h1 className="text-4xl font-bold mb-8">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7EC8C8] to-[#38768B]">Create Account</span>
                        </h1>
                        <input
                            type="text"
                            placeholder="Name"
                            className="auth-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="auth-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="auth-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        {message.text && !isVerifying && isRightPanelActive && (
                            <div className={`text-xs my-2 font-semibold px-4 py-2 rounded-lg border ${
                                message.type === 'success' 
                                    ? 'bg-[#7EC8C8]/10 text-[#7EC8C8] border-[#7EC8C8]/20' 
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {message.text}
                            </div>
                        )}
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Registering...' : 'Sign Up'}
                        </button>
                    </form>
                </div>

                {/* 3. Sign In Form (Left side visible initially) */}
                <div className="form-container sign-in-container">
                    <form className="auth-form" onSubmit={(e) => handleAuth(e, 'login')}>
                        <h1 className="text-4xl font-bold mb-8">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7EC8C8] to-[#38768B]">Sign In</span>
                        </h1>
                        <input
                            type="email"
                            placeholder="Email"
                            className="auth-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="auth-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        {message.text && !isVerifying && !isRightPanelActive && (
                            <div className={`text-xs my-2 font-semibold px-4 py-2 rounded-lg border ${
                                message.type === 'success' 
                                    ? 'bg-[#7EC8C8]/10 text-[#7EC8C8] border-[#7EC8C8]/20' 
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {message.text}
                            </div>
                        )}
                        <Link to="#" className="text-[#A7C4BC] text-sm mt-4 hover:text-white transition-colors">Forgot your password?</Link>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* 3. Sliding Overlay (The Blue Action Area) */}
                <div className="overlay-container">
                    <div className="overlay">

                        {/* Overlay Left Content (Visible when Sign Up is active, asks to login) */}
                        <div className="overlay-panel overlay-left">
                            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
                            <p className="text-[#A7C4BC] text-sm font-light mb-8 max-w-[250px] leading-relaxed">
                                To keep connected with us please login with your personal info
                            </p>
                            <button className="auth-btn ghost" onClick={() => setIsRightPanelActive(false)}>Sign In</button>
                        </div>

                        {/* Overlay Right Content (Visible initially, asks to Sign up) */}
                        <div className="overlay-panel overlay-right">
                            <h1 className="text-4xl font-bold mb-4">Hello, Friend!</h1>
                            <p className="text-[#A7C4BC] text-sm font-light mb-8 max-w-[250px] leading-relaxed">
                                Enter your personal details and start your journey with us
                            </p>
                            <button className="auth-btn ghost" onClick={() => setIsRightPanelActive(true)}>Sign Up</button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}