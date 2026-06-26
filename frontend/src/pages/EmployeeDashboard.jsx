import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel');
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const navigate = useNavigate();

  const categories = ['Office Supplies','Travel','Meals','Software Subscription','Utilities','Marketing','Payroll','Cloud Hosting','Hardware','Internet','Training','Client Meeting','Miscellaneous'];
  const paymentMethods = ['Cash','Bank Transfer','Credit Card','Debit Card','Company Card','Online Payment'];

  const fetchExpenses = async (authToken) => {
    try {
      const res = await axios.get('http://localhost:5000/api/expenses', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setExpenses(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const authToken = await currentUser.getIdToken();
        setToken(authToken);
        const profileRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setProfile(profileRes.data.user);
        await fetchExpenses(authToken);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [navigate]);

  const handleReceiptUpload = async (file) => {
    if (!file) return;
    setUploadingReceipt(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/' + import.meta.env.VITE_CLOUDINARY_CLOUD_NAME + '/image/upload',
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
      setReceiptUrl(data.secure_url);
    } catch (err) {
      setError('Receipt upload failed. Check Cloudinary settings.');
      setReceiptUrl('');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const resetForm = () => {
    setAmount(''); setCategory('Travel'); setVendor('');
    setPaymentMethod('Cash'); setDescription(''); setReceiptUrl('');
    setEditingExpense(null); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editingExpense) {
        await axios.put('http://localhost:5000/api/expenses/' + editingExpense._id,
          { amount: Number(amount), category, vendor, paymentMethod, description, receiptUrl },
          { headers: { Authorization: 'Bearer ' + token } }
        );
      } else {
        await axios.post('http://localhost:5000/api/expenses',
          { amount: Number(amount), category, vendor, paymentMethod, description, receiptUrl },
          { headers: { Authorization: 'Bearer ' + token } }
        );
      }
      resetForm();
      fetchExpenses(token);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setAmount(exp.amount); setCategory(exp.category);
    setVendor(exp.vendor || ''); setPaymentMethod(exp.paymentMethod || 'Cash');
    setDescription(exp.description || ''); setReceiptUrl(exp.receiptUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete('http://localhost:5000/api/expenses/' + id, {
        headers: { Authorization: 'Bearer ' + token },
      });
      fetchExpenses(token);
    } catch (err) { alert(err.response?.data?.message || err.message); }
  };

  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  const filteredExpenses = filterStatus === 'all' ? expenses : expenses.filter((e) => e.status === filterStatus);
  const totalSpent = expenses.filter((e) => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === 'pending').length;

  const statusStyle = {
    pending: { background: '#4A3A12', color: '#FAC775' },
    approved: { background: '#16332B', color: '#97C459' },
    rejected: { background: '#3D1F1F', color: '#F09595' },
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const inp = {
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: '7px',
    padding: '8px 10px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
    background: '#fff',
    color: '#1e293b',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Header — same as before */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Employee</p>
          <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', margin: '2px 0 0' }}>{profile?.name || user?.email}</h1>
        </div>
        <button onClick={handleLogout} style={{ fontSize: '13px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
      </div>

      <div
  style={{
    maxWidth: '1260px',
    margin: '0 auto',
    padding: '24px 28px',
  }}
>

        {/* 2-column layout */}
        <div
  style={{
    display: 'grid',
    gridTemplateColumns: '520px minmax(0, 1fr)',
    gap: '24px',
    alignItems: 'start',
  }}
>

          {/* Left column — Stats + Form */}
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {[
                { label: 'Submitted', value: expenses.length, color: '#3b82f6' },
                { label: 'Approved', value: `Rs. ${totalSpent.toLocaleString()}`, color: '#22c55e', small: true },
                { label: 'Pending', value: pendingCount, color: '#f59e0b' },
              ].map((s) => (
                <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px' }}>{s.label}</p>
                  <p style={{ fontSize: s.small ? '13px' : '20px', fontWeight: 600, color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            <div
  style={{
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    width: '100%',
    boxSizing: 'border-box',
  }}
>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: '0 0 12px' }}>
                {editingExpense ? 'Edit Expense' : 'New Expense'}
              </h2>

              {error && <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '10px' }}>{error}</p>}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input type="number" placeholder="Amount (Rs.)" value={amount} onChange={(e) => setAmount(e.target.value)} style={inp} required />
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={inp}>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input type="text" placeholder="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} style={inp} required />
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inp}>
                    {paymentMethods.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>

                <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inp, marginBottom: '8px' }} />

                <div style={{ marginBottom: '10px' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px' }}>Receipt (optional)</p>
                  <input type="file" accept="image/*" onChange={(e) => handleReceiptUpload(e.target.files[0])} style={{ fontSize: '12px', color: '#64748b' }} />
                  {uploadingReceipt && <p style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px' }}>Uploading...</p>}
                  {receiptUrl && (
                    <div style={{ marginTop: '6px' }}>
                      <img src={receiptUrl} alt="receipt" style={{ height: '60px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                      <p style={{ fontSize: '11px', color: '#22c55e', marginTop: '3px' }}>Uploaded</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {editingExpense && (
                    <button type="button" onClick={resetForm} style={{ flex: 1, padding: '8px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" disabled={submitting || uploadingReceipt} style={{ flex: 1, padding: '8px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', cursor: 'pointer', opacity: (submitting || uploadingReceipt) ? 0.6 : 1 }}>
                    {submitting ? 'Saving...' : editingExpense ? 'Update' : 'Submit Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right column — Expenses List */}
          <div
  style={{
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    width: '100%',
    boxSizing: 'border-box',
  }}
>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: 0 }}>My Expenses</h2>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['all', 'pending', 'approved', 'rejected'].map((s) => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', textTransform: 'capitalize', background: filterStatus === s ? '#2563eb' : '#f1f5f9', color: filterStatus === s ? '#fff' : '#64748b' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '30px 0' }}>No expenses found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
                {filteredExpenses.map((exp) => (
                  <div key={exp._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b', margin: 0 }}>{exp.category}</p>
                          <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', fontWeight: 500, ...statusStyle[exp.status] }}>
                            {exp.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155', margin: '0 0 3px' }}>Rs. {exp.amount.toLocaleString()}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{exp.vendor} • {exp.paymentMethod}</p>
                        {exp.description && <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>{exp.description}</p>}
                        {exp.rejectReason && <p style={{ fontSize: '11px', color: '#ef4444', margin: '3px 0 0' }}>Reason: {exp.rejectReason}</p>}
                        {exp.receiptUrl && (
                          <a href={exp.receiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#2563eb', marginTop: '3px', display: 'inline-block' }}>View receipt</a>
                        )}
                      </div>
                      {exp.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                          <button onClick={() => handleEdit(exp)} style={{ fontSize: '11px', padding: '4px 8px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDelete(exp._id)} style={{ fontSize: '11px', padding: '4px 8px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;