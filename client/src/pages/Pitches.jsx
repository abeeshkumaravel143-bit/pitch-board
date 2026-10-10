import { useAuth } from '../context/AuthContext';

export default function Pitches() {
  const { user } = useAuth();
  return (
    <div className="card">
      <h2>Welcome, {user.name}</h2>
      <p>You are logged in as a {user.role}. The pitch list comes next.</p>
    </div>
  );
}
