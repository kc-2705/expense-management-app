import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Analytics from './components/Analytics';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<ProtectedRoutes><HomePage /></ProtectedRoutes>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/charts" element={<Analytics />} />
      <Route path="/reset-password" element={<ResetPassword />} /> 
    </Routes>
  );
}

export function ProtectedRoutes(props) {
  return localStorage.getItem('user') ? props.children : <Navigate to="/login" />;
}

export default App;
