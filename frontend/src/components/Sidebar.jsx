import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Sidebar({ companyName }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-lg text-sm mb-1 ${
      isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="w-56 min-h-screen bg-white border-r border-gray-200 p-4 flex flex-col">
      <div className="mb-6 px-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Workspace</p>
        <p className="font-semibold text-gray-800">{companyName || 'Loading...'}</p>
      </div>

      <nav className="flex-1">
        <NavLink to="/admin" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/employees" className={linkClass}>
          Employees
        </NavLink>
        <NavLink to="/admin/settings" className={linkClass}>
          Settings
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="text-sm text-left px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-50"
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;