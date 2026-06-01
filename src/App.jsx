import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Loading from './pages/Loading';

// Performance Optimization: Code Splitting
const Splash = lazy(() => import('./pages/Splash'));
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/auth'));
const Chat = lazy(() => import('./pages/Chat'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const Work = lazy(() => import('./pages/Work'));
const Why = lazy(() => import('./pages/Why'));
const Report = lazy(() => import('./pages/report_generation'));
const ErrorPage = lazy(() => import('./pages/Error'));

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/work" element={<Work />} />
            <Route path="/why" element={<Why />} />
            <Route path="/report" element={<Report />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
