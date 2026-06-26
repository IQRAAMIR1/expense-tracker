import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AccountantDashboard() {
  const [token, setToken] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  const fetchData = async (authToken) => {
    try {
      const [expRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/expenses', { headers: { Authorization: `Bearer ${authToken}` } }),
        axios.get('http://localhost:5000/api/auth/users', { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);
      setExpenses(expRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const t = await currentUser.getIdToken();
        setToken(t);
        fetchData(t);
      } else {
        navigate('/login');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/expenses/${id}`, { status: 'approved' }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(token);
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/expenses/${id}`, { status: 'rejected', rejectReason }, { headers: { Authorization: `Bearer ${token}` } });
      setRejectingId(null);
      setRejectReason('');
      fetchData(token);
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  const getName = (exp) => {
    if (exp.submittedBy?.name) return exp.submittedBy.name;
    return users.find((u) => u._id === (exp.submittedBy?._id || exp.submittedBy))?.name || 'Unknown';
  };

  const getDate = (exp) => new Date(exp.date || exp.createdAt);

  const now = new Date();
  const thisMonthReviewed = expenses.filter((e) => {
    const d = getDate(e);
    return e.status !== 'pending' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const approvedThisMonth = thisMonthReviewed.filter((e) => e.status === 'approved').length;
  const rejectedThisMonth = thisMonthReviewed.filter((e) => e.status === 'rejected').length;
  const approvedValue = thisMonthReviewed.filter((e) => e.status === 'approved').reduce((s, e) => s + e.amount, 0);

  const employeeOptions = users.filter((u) => u.role === 'employee');
  const categoryOptions = [...new Set(expenses.map((e) => e.category).filter(Boolean))];

  const filtered = expenses.filter((exp) => {
    const id = exp.submittedBy?._id || exp.submittedBy;
    if (employeeFilter !== 'all' && id !== employeeFilter) return false;
    if (categoryFilter !== 'all' && exp.category !== categoryFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return [getName(exp), exp.category, exp.vendor, exp.description, String(exp.amount)]
      .some((v) => String(v || '').toLowerCase().includes(q));
  });

  const pending = filtered.filter((e) => e.status === 'pending');
  const reviewed = filtered.filter((e) => e.status !== 'pending');

  const exportCsv = () => {
    const rows = [
      ['Employee', 'Category', 'Vendor', 'Amount', 'Status', 'Reason', 'Date'],
      ...reviewed.map((e) => [getName(e), e.category, e.vendor, e.amount, e.status, e.rejectReason || '', getDate(e).toLocaleDateString()]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'reviewed.csv';
    a.click();
  };

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;

  const card = { background: '#101F38', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '10px' };

  return (
    <div style={{ background: '#0A1628', minHeight: '100vh', padding: '20px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#5E89C2', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Role</p>
            <h1 style={{ fontSize: '20px', color: '#F4F8FF', margin: '2px 0 0', fontWeight: 500 }}>Accountant Dashboard</h1>
          </div>
          <button onClick={handleLogout} style={{ fontSize: '12px', padding: '6px 12px', background: '#1C3354', color: '#8FB4E8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{ ...card, padding: '14px' }}>
            <p style={{ fontSize: '11px', color: '#5E89C2', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</p>
            <p style={{ fontSize: '28px', color: '#FAC775', fontWeight: 600, margin: '0 0 6px' }}>{pending.length}</p>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: expenses.length ? `${Math.round((pending.length / expenses.length) * 100)}%` : '0%', background: '#FAC775', borderRadius: '2px' }} />
            </div>
            <p style={{ fontSize: '11px', color: '#5E89C2', margin: '6px 0 0' }}>of {expenses.length} total</p>
          </div>

          <div style={{ ...card, padding: '14px' }}>
            <p style={{ fontSize: '11px', color: '#5E89C2', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reviewed this month</p>
            <p style={{ fontSize: '28px', color: '#8FB4E8', fontWeight: 600, margin: '0 0 6px' }}>{thisMonthReviewed.length}</p>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: expenses.length ? `${Math.round((thisMonthReviewed.length / expenses.length) * 100)}%` : '0%', background: '#8FB4E8', borderRadius: '2px' }} />
            </div>
            <p style={{ fontSize: '11px', color: '#5E89C2', margin: '6px 0 0' }}>{approvedThisMonth} approved, {rejectedThisMonth} rejected</p>
          </div>

          <div style={{ ...card, padding: '14px' }}>
            <p style={{ fontSize: '11px', color: '#5E89C2', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved</p>
            <p style={{ fontSize: '28px', color: '#97C459', fontWeight: 600, margin: '0 0 6px' }}>{approvedThisMonth}</p>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: thisMonthReviewed.length ? `${Math.round((approvedThisMonth / thisMonthReviewed.length) * 100)}%` : '0%', background: '#97C459', borderRadius: '2px' }} />
            </div>
            <p style={{ fontSize: '11px', color: '#5E89C2', margin: '6px 0 0' }}>Rs. {approvedValue.toLocaleString()}</p>
          </div>

          <div style={{ ...card, padding: '14px' }}>
            <p style={{ fontSize: '11px', color: '#5E89C2', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejected</p>
            <p style={{ fontSize: '28px', color: '#F09595', fontWeight: 600, margin: '0 0 6px' }}>{rejectedThisMonth}</p>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: thisMonthReviewed.length ? `${Math.round((rejectedThisMonth / thisMonthReviewed.length) * 100)}%` : '0%', background: '#F09595', borderRadius: '2px' }} />
            </div>
            <p style={{ fontSize: '11px', color: '#5E89C2', margin: '6px 0 0' }}>this month</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ ...card, padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '160px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px 10px', color: '#E4ECFB', fontSize: '12px', outline: 'none' }}
          />
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px 10px', color: '#E4ECFB', fontSize: '12px', outline: 'none' }}
          >
            <option value="all">All Employees</option>
            {employeeOptions.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px 10px', color: '#E4ECFB', fontSize: '12px', outline: 'none' }}
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => { setSearchTerm(''); setEmployeeFilter('all'); setCategoryFilter('all'); }}
            style={{ fontSize: '12px', padding: '7px 12px', background: 'rgba(255,255,255,0.04)', color: '#8FB4E8', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer' }}
          >
            Clear
          </button>
          <button
            onClick={exportCsv}
            disabled={reviewed.length === 0}
            style={{ fontSize: '12px', padding: '7px 12px', background: '#1C3354', color: '#8FB4E8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Export CSV
          </button>
        </div>

        {/* Main content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>

          {/* Pending */}
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '13px', color: '#F4F8FF', fontWeight: 500, margin: 0 }}>Pending approvals</p>
              <span style={{ fontSize: '11px', background: 'rgba(250,199,117,0.15)', color: '#FAC775', padding: '2px 8px', borderRadius: '20px' }}>{pending.length}</span>
            </div>
            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {pending.length === 0 ? (
                <p style={{ padding: '20px', fontSize: '12px', color: '#5E89C2' }}>No pending expenses.</p>
              ) : (
                pending.map((exp) => (
                  <div key={exp._id} style={{ padding: '12px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <p style={{ fontSize: '13px', color: '#E4ECFB', fontWeight: 500, margin: '0 0 2px' }}>{getName(exp)}</p>
                        <p style={{ fontSize: '11px', color: '#5E89C2', margin: 0 }}>{exp.category} • {exp.vendor}</p>
                        {exp.description && <p style={{ fontSize: '11px', color: '#8FB4E8', margin: '2px 0 0' }}>{exp.description}</p>}
                        {exp.receiptUrl && (
                          <a href={exp.receiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#3D86E0', marginTop: '3px', display: 'inline-block' }}>View receipt</a>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', color: '#F4F8FF', fontWeight: 600, margin: '0 0 2px' }}>Rs. {exp.amount.toLocaleString()}</p>
                        <p style={{ fontSize: '11px', color: '#5E89C2', margin: 0 }}>{exp.paymentMethod}</p>
                        <p style={{ fontSize: '11px', color: '#5E89C2', margin: '2px 0 0' }}>{getDate(exp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {rejectingId === exp._id && (
                        <input
                          type="text"
                          placeholder="Reason..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', color: '#E4ECFB', fontSize: '12px', outline: 'none' }}
                        />
                      )}
                      <button
                        onClick={() => rejectingId === exp._id ? handleReject(exp._id) : setRejectingId(exp._id)}
                        style={{ padding: '5px 10px', background: 'rgba(240,149,149,0.12)', color: '#F09595', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        {rejectingId === exp._id ? 'Confirm' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleApprove(exp._id)}
                        style={{ padding: '5px 10px', background: 'rgba(151,196,89,0.12)', color: '#97C459', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* History */}
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontSize: '13px', color: '#F4F8FF', fontWeight: 500, margin: 0 }}>History</p>
            </div>
            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {reviewed.length === 0 ? (
                <p style={{ padding: '20px', fontSize: '12px', color: '#5E89C2' }}>No reviewed expenses yet.</p>
              ) : (
                reviewed.map((exp) => (
                  <div key={exp._id} style={{ padding: '10px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.05)', borderLeft: `3px solid ${exp.status === 'approved' ? '#97C459' : '#F09595'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '12px', color: '#E4ECFB', fontWeight: 500, margin: '0 0 2px' }}>{getName(exp)}</p>
                        <p style={{ fontSize: '11px', color: '#5E89C2', margin: 0 }}>{exp.category} • {exp.vendor}</p>
                        {exp.rejectReason && <p style={{ fontSize: '11px', color: '#F09595', margin: '3px 0 0', fontStyle: 'italic' }}>"{exp.rejectReason}"</p>}
                        {exp.receiptUrl && (
                          <a href={exp.receiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#3D86E0', marginTop: '3px', display: 'inline-block' }}>Receipt</a>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '13px', color: '#F4F8FF', fontWeight: 600, margin: '0 0 3px' }}>Rs. {exp.amount.toLocaleString()}</p>
                        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: exp.status === 'approved' ? '#16332B' : '#3D1F1F', color: exp.status === 'approved' ? '#5DCAA5' : '#F09595' }}>
                          {exp.status}
                        </span>
                        <p style={{ fontSize: '11px', color: '#5E89C2', margin: '4px 0 0' }}>{getDate(exp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AccountantDashboard;