import React, { lazy, startTransition, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import CitiesSection from './components/cities/CitiesSection';
import VotingRights from './VotingRights';
import ElectionSecurity from './ElectionSecurity';
import Footer from './Footer';
import RegisterVoter from './components/RegisterVoter';
import VerifyVoter from './components/VerifyVoter';
import LoginForm from './components/LoginForm';
import ReceiptCheck from './components/ReceiptCheck';
import AdminLogin from './components/AdminLogin';
import VotingDashboard from './components/VotingDashboard';
import { useAuth } from './auth';
import './App.css';

// Loaded only when an admin opens it, so voters don't download the charting library
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

const LoadingScreen = ({ message }) => (
  <div className="fullscreen-loading-overlay">
    <div className="loading-content">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  </div>
);

// The landing page. Forms like /register and /login open on top of it.
const HomeLayout = () => (
  <div className="App">
    <Navbar />
    <Hero />
    <CitiesSection />
    <VotingRights />
    <ElectionSecurity />
    <Footer />
    <Outlet />
  </div>
);

// --- Pages that wrap the existing components with navigation ---------------

const RegisterPage = () => {
  const navigate = useNavigate();
  return <RegisterVoter onClose={() => navigate('/')} onRegistered={() => navigate('/login')} />;
};

const VerifyPage = () => {
  const navigate = useNavigate();
  return <VerifyVoter onClose={() => navigate('/')} />;
};

const ReceiptPage = () => {
  const navigate = useNavigate();
  return <ReceiptCheck onClose={() => navigate('/')} />;
};

const VoterLoginPage = () => {
  const navigate = useNavigate();
  const { voter, loginVoter } = useAuth();
  if (voter) return <Navigate to="/vote" replace />;
  return (
    <LoginForm
      onClose={() => navigate('/')}
      onLoginSuccess={(profile, token) => {
        loginVoter(profile, token);
        navigate('/vote');
      }}
      onRegisterClick={() => navigate('/register')}
    />
  );
};

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { admin, loginAdmin } = useAuth();
  if (admin) return <Navigate to="/admin" replace />;
  return (
    <AdminLogin
      onClose={() => navigate('/')}
      onLoginSuccess={(token) => {
        loginAdmin(token);
        navigate('/admin');
      }}
    />
  );
};

// --- Protected pages ---------------------------------------------------------

const VotingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { voter, logoutVoter } = useAuth();
  if (!voter) return <Navigate to="/login" replace state={{ from: location }} />;

  // Log out and leave in one update; otherwise the page guard sees "logged out"
  // first and redirects to /login before the move to the home page happens
  const logout = () => startTransition(() => {
    logoutVoter();
    navigate('/');
  });
  return <VotingDashboard voter={voter.profile} token={voter.token} onClose={logout} onFinished={logout} />;
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAuth();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return (
    <Suspense fallback={<LoadingScreen message="Loading admin portal..." />}>
      <AdminDashboard
        token={admin.token}
        onClose={() => startTransition(() => {
          logoutAdmin();
          navigate('/');
        })}
      />
    </Suspense>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={null} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify" element={<VerifyPage />} />
        <Route path="login" element={<VoterLoginPage />} />
        <Route path="receipt" element={<ReceiptPage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
      </Route>
      <Route path="/vote" element={<VotingPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
