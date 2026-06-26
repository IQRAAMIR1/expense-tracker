import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale,
  CategoryScale, Filler, Tooltip, ArcElement,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, ArcElement);

function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [removing, setRemoving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const headers = { Authorization: `Bearer ${token}` };
          const [profileRes, usersRes, expensesRes] = await Promise.all([
            axios.get('http://localhost:5000/api/auth/me', { headers }),
            axios.get('http://localhost:5000/api/auth/users', { headers }),
            axios.get('http://localhost:5000/api/expenses', { headers }),
          ]);
          setProfile(profileRes.data.user);
          setUsers(usersRes.data);
          setExpenses(expensesRes.data);
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

  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Remove this team member?')) return;
    setRemoving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== userId));
      setSelectedUser(null);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;

  const approvedExpenses = expenses.filter((e) => e.status === 'approved');
  const totalAmount = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === 'pending').length;
  const approvedCount = approvedExpenses.length;
  const rejectedCount = expenses.filter((e) => e.status === 'rejected').length;

  const categoryTotals = approvedExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const categoryColors = ['#3D86E0', '#1D9E75', '#D85A30', '#A06CD5', '#E0B33D', '#5E89C2'];

  const employeeTotals = {};
  expenses.forEach((e) => {
    const id = e.submittedBy?._id || e.submittedBy;
    employeeTotals[id] = (employeeTotals[id] || 0) + e.amount;
  });

  const accountantReviewCounts = {};
  expenses.forEach((e) => {
    if (e.approvedBy) {
      const id = e.approvedBy?._id || e.approvedBy;
      accountantReviewCounts[id] = (accountantReviewCounts[id] || 0) + 1;
    }
  });

  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    last6Months.push(d.toLocaleString('default', { month: 'short' }));
  }
  const monthlyTotals = {};
  last6Months.forEach((m) => (monthlyTotals[m] = 0));
  approvedExpenses.forEach((e) => {
    const key = new Date(e.date || e.createdAt).toLocaleString('default', { month: 'short' });
    if (key in monthlyTotals) monthlyTotals[key] += e.amount;
  });
  const monthLabels = Object.keys(monthlyTotals);
  const monthValues = Object.values(monthlyTotals);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  const monthlyBudget = profile?.companyId?.monthlyBudget || 0;
  const budgetUsed = Math.min(totalAmount, monthlyBudget);
  const budgetLeft = Math.max(monthlyBudget - totalAmount, 0);
  const budgetPct = monthlyBudget ? Math.round((totalAmount / monthlyBudget) * 100) : 0;

  const reviewedTotal = approvedCount + rejectedCount;
  const approvedPct = reviewedTotal ? Math.round((approvedCount / reviewedTotal) * 100) : 0;
  const rejectedPct = reviewedTotal ? Math.round((rejectedCount / reviewedTotal) * 100) : 0;

  const currentMonthKey = new Date().toLocaleString('default', { month: 'short' });
  const currentMonthSpend = monthlyTotals[currentMonthKey] || 0;
  const lastMonthSpend = monthValues.length > 1 ? monthValues[monthValues.length - 2] : 0;
  const monthlyChange = lastMonthSpend ? Math.round(((currentMonthSpend - lastMonthSpend) / lastMonthSpend) * 100) : 0;

  const topEmployees = Object.entries(employeeTotals)
    .map(([id, amount]) => ({ id, name: users.find((u) => u._id === id)?.name || 'Unknown', amount }))
    .sort((a, b) => b.amount - a.amount).slice(0, 3);

  const lineChartData = {
    labels: monthLabels,
    datasets: [{ data: monthValues, borderColor: '#3D86E0', backgroundColor: 'rgba(61,134,224,0.12)', fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 }],
  };
  const lineChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: '#5E89C2', font: { size: 10 }, callback: (v) => v >= 1000 ? `${v/1000}k` : v }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#5E89C2', font: { size: 10 } }, grid: { display: false } },
    },
  };

  const donutOpts = (color) => ({
    responsive: true, maintainAspectRatio: false, cutout: '78%',
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  });

  const getUserName = (id) => users.find((u) => u._id === id)?.name || 'Unknown';

  const exportCsv = () => {
    const rows = [
      ['Employee', 'Category', 'Amount', 'Vendor', 'Status', 'Date'],
      ...expenses.map((e) => [
        getUserName(e.submittedBy?._id || e.submittedBy),
        e.category, e.amount, e.vendor, e.status,
        new Date(e.createdAt).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'expenses.csv';
    a.click();
  };

  const card = { background: '#101F38', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px' };

  return (
    <div style={{ background: '#0A1628', minHeight: '100vh', padding: '20px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#5E89C2', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Workspace</p>
            <h1 style={{ fontSize: '20px', color: '#F4F8FF', margin: '2px 0 0', fontWeight: 500 }}>{profile?.companyId?.name || 'Your Company'}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: '#5E89C2', margin: 0 }}>Invite code</p>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: '#F4F8FF', margin: '2px 0 0', fontWeight: 500, letterSpacing: '1px' }}>{profile?.companyId?.companyCode || '—'}</p>
            </div>
            <button onClick={handleLogout} style={{ fontSize: '12px', padding: '6px 12px', background: '#1C3354', color: '#8FB4E8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { label: 'Budget used', value: monthlyBudget ? `${budgetPct}%` : 'No budget', sub: `Rs. ${totalAmount.toLocaleString()}`, color: '#3D86E0', data: monthlyBudget ? [budgetUsed, budgetLeft] : [1, 0], bg: monthlyBudget ? ['#3D86E0', 'rgba(255,255,255,0.06)'] : ['rgba(255,255,255,0.06)', 'transparent'] },
            { label: 'Pending', value: pendingCount, color: '#FAC775', data: expenses.length ? [pendingCount, expenses.length - pendingCount] : [1, 0], bg: ['#FAC775', 'rgba(255,255,255,0.06)'] },
            { label: 'Approved', value: approvedCount, color: '#97C459', data: expenses.length ? [approvedCount, expenses.length - approvedCount] : [1, 0], bg: ['#97C459', 'rgba(255,255,255,0.06)'] },
            { label: 'Declined', value: rejectedCount, color: '#F09595', data: expenses.length ? [rejectedCount, expenses.length - rejectedCount] : [1, 0], bg: ['#F09595', 'rgba(255,255,255,0.06)'] },
          ].map((item) => (
            <div key={item.label} style={{ ...card, padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: '11px', color: '#5E89C2', margin: '0 0 8px' }}>{item.label}</p>
              <div style={{ width: '64px', height: '64px', position: 'relative' }}>
                <Doughnut data={{ datasets: [{ data: item.data, backgroundColor: item.bg, borderWidth: 0 }] }} options={donutOpts(item.color)} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: '12px', color: item.color, fontWeight: 600, margin: 0 }}>{item.value}</p>
                </div>
              </div>
              {item.sub && <p style={{ fontSize: '11px', color: '#C9D8EE', margin: '6px 0 0' }}>{item.sub}</p>}
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div style={{ ...card, padding: '14px' }}>
            <p style={{ fontSize: '12px', color: '#F4F8FF', fontWeight: 500, margin: '0 0 10px' }}>Monthly spend</p>
            <div style={{ height: '140px' }}><Line data={lineChartData} options={lineChartOptions} /></div>
          </div>
          <div style={{ ...card, padding: '14px' }}>
            <p style={{ fontSize: '12px', color: '#F4F8FF', fontWeight: 500, margin: '0 0 10px' }}>By category</p>
            {Object.keys(categoryTotals).length === 0 ? (
              <p style={{ fontSize: '12px', color: '#5E89C2' }}>No approved expenses yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(categoryTotals).map(([cat, amt], i) => {
                  const pct = totalAmount ? Math.round((amt / totalAmount) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#C9D8EE', marginBottom: '3px' }}>
                        <span>{cat}</span><span style={{ color: '#5E89C2' }}>{pct}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: categoryColors[i % categoryColors.length], borderRadius: '2px', transition: 'width 0.6s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity + Team Roster */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px', marginBottom: '16px' }}>

          {/* Recent Activity Table */}
          <div style={{ ...card, padding: '14px' }}>
            <p style={{ fontSize: '12px', color: '#F4F8FF', fontWeight: 500, margin: '0 0 10px' }}>Recent activity</p>
            {recentExpenses.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#5E89C2' }}>No activity yet.</p>
            ) : (
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Employee', 'Category', 'Amount', 'Status'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '4px 6px', color: '#5E89C2', fontWeight: 500, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((exp) => (
                    <tr key={exp._id}>
                      <td style={{ padding: '6px', color: '#E4ECFB' }}>{getUserName(exp.submittedBy?._id || exp.submittedBy)}</td>
                      <td style={{ padding: '6px', color: '#C9D8EE' }}>{exp.category}</td>
                      <td style={{ padding: '6px', color: '#C9D8EE' }}>Rs. {exp.amount.toLocaleString()}</td>
                      <td style={{ padding: '6px' }}>
                        <span style={{
                          fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                          background: exp.status === 'approved' ? '#16332B' : exp.status === 'rejected' ? '#3D1F1F' : '#4A3A12',
                          color: exp.status === 'approved' ? '#5DCAA5' : exp.status === 'rejected' ? '#F09595' : '#FAC775',
                        }}>{exp.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Team Roster */}
          <div style={{ ...card, padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ fontSize: '12px', color: '#F4F8FF', fontWeight: 500, margin: 0 }}>Team roster</p>
              <span style={{ fontSize: '11px', color: '#5E89C2' }}>{users.length} members</span>
            </div>
            {users.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#5E89C2' }}>No team members yet.</p>
            ) : (
              <div>
                {users.map((u, i) => (
                  <div key={u._id} onClick={() => setSelectedUser(u)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 4px', borderBottom: i < users.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: u.role === 'accountant' ? '#16332B' : '#1C3354', color: u.role === 'accountant' ? '#5DCAA5' : '#8FB4E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600 }}>
                        {u.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <p style={{ fontSize: '12px', color: '#E4ECFB', margin: 0 }}>{u.name}</p>
                    </div>
                    <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: u.role === 'accountant' ? '#16332B' : '#1C3354', color: u.role === 'accountant' ? '#5DCAA5' : '#8FB4E8' }}>{u.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reports */}
        <div style={{ ...card, padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: '#F4F8FF', fontWeight: 500, margin: 0 }}>Reports</p>
            <button onClick={exportCsv} style={{ fontSize: '11px', padding: '5px 12px', background: '#1C3354', color: '#8FB4E8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Export CSV</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px' }}>
              <p style={{ fontSize: '11px', color: '#5E89C2', margin: '0 0 4px' }}>This month</p>
              <p style={{ fontSize: '16px', color: '#F4F8FF', fontWeight: 500, margin: 0 }}>Rs. {currentMonthSpend.toLocaleString()}</p>
              <p style={{ fontSize: '11px', margin: '4px 0 0', color: monthlyChange >= 0 ? '#FAC775' : '#97C459' }}>
                {lastMonthSpend ? `${monthlyChange >= 0 ? '+' : ''}${monthlyChange}% vs last month` : 'First month'}
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px' }}>
              <p style={{ fontSize: '11px', color: '#5E89C2', margin: '0 0 8px' }}>Approval rate</p>
              <div style={{ marginBottom: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#C9D8EE', marginBottom: '3px' }}>
                  <span>Approved</span><span>{approvedPct}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${approvedPct}%`, background: '#97C459', borderRadius: '2px' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#C9D8EE', marginBottom: '3px' }}>
                  <span>Rejected</span><span>{rejectedPct}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${rejectedPct}%`, background: '#F09595', borderRadius: '2px' }} />
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px' }}>
              <p style={{ fontSize: '11px', color: '#5E89C2', margin: '0 0 6px' }}>Top spenders</p>
              {topEmployees.length === 0 ? (
                <p style={{ fontSize: '11px', color: '#5E89C2' }}>No data yet.</p>
              ) : (
                topEmployees.map((emp, i) => (
                  <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#C9D8EE', padding: '3px 0' }}>
                    <span>{i + 1}. {emp.name}</span>
                    <span>Rs. {emp.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setSelectedUser(null)}>
          <div style={{ background: '#101F38', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', width: '280px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedUser.role === 'accountant' ? '#16332B' : '#1C3354', color: selectedUser.role === 'accountant' ? '#5DCAA5' : '#8FB4E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600 }}>
                {selectedUser.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ color: '#F4F8FF', margin: 0, fontWeight: 500 }}>{selectedUser.name}</p>
                <p style={{ color: '#5E89C2', fontSize: '11px', margin: 0 }}>{selectedUser.email}</p>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#C9D8EE', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Role</span><span style={{ textTransform: 'capitalize' }}>{selectedUser.role}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{selectedUser.role === 'accountant' ? 'Reviewed' : 'Total spend'}</span>
                <span>{selectedUser.role === 'accountant' ? `${accountantReviewCounts[selectedUser._id] || 0}` : `Rs. ${(employeeTotals[selectedUser._id] || 0).toLocaleString()}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Joined</span><span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setSelectedUser(null)} style={{ flex: 1, padding: '8px', background: '#1C3354', color: '#8FB4E8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Close</button>
              <button onClick={() => handleRemoveUser(selectedUser._id)} disabled={removing} style={{ flex: 1, padding: '8px', background: '#3D1F1F', color: '#F09595', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                {removing ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;