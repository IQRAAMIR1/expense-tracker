import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const res = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const role = res.data.user.role;

          if (role === 'employee') navigate('/employee');
          else if (role === 'accountant') navigate('/accountant');
          else if (role === 'admin') navigate('/admin');
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });
    return unsubscribe;
  }, [navigate]);

  if (loading) return <p className="text-center mt-10">Redirecting...</p>;
  return null;
}

export default Dashboard;