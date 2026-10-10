import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Pitches from './pages/Pitches';
import PitchDetail from './pages/PitchDetail';
import PitchForm from './pages/PitchForm';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Pitches /></ProtectedRoute>} />
          <Route path="/pitches/:id" element={<ProtectedRoute><PitchDetail /></ProtectedRoute>} />
          
          {/* Dashboard Hub Route */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Creator Content Forms - Enforced for Founders Only */}
          <Route path="/pitches/new" element={<ProtectedRoute role="founder"><PitchForm /></ProtectedRoute>} />
          <Route path="/pitches/:id/edit" element={<ProtectedRoute role="founder"><PitchForm /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}
