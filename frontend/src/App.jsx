import { Link } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RegisterCompany from './pages/RegisterCompany';
import JoinCompany from './pages/JoinCompany';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AccountantDashboard from './pages/AccountantDashboard';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmployees from './components/AdminEmployees';
import AdminSettings from './components/AdminSettings';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterCompany />} />
        <Route path="/join" element={<JoinCompany />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/accountant" element={<AccountantDashboard />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;