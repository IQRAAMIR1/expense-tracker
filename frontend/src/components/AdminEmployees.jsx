import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

function AdminEmployees() {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('employee');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [usersRes, expensesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/users', { headers }),
          axios.get('http://localhost:5000/api/expenses', { headers }),
        ]);
        setUsers(usersRes.data);
        setExpenses(expensesRes.data);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleRemove = async (userId) => {
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

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError('');
    setAdding(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.post(
        'http://localhost:5000/api/auth/users',
        { name: newName, email: newEmail, password: newPassword, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers([...users, res.data]);
      setShowAddForm(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('employee');
    } catch (err) {
      setAddError(err.response?.data?.message || err.message);
    } finally {
      setAdding(false);
    }
  };

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

  if (loading) return <p className="text-gray-500 mt-10 text-center">Loading...</p>;

  const employees = users.filter((u) => u.role === 'employee');
  const accountants = users.filter((u) => u.role === 'accountant');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Team Members</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Member
        </button>
      </div>

      {/* Employees */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Employees ({employees.length})
        </p>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {employees.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">No employees yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      Rs. {(employeeTotals[u._id] || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Accountants */}
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Accountants ({accountants.length})
        </p>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {accountants.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">No accountants yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {accountants.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {accountantReviewCounts[u._id] || 0} expenses
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-80 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-sm">
                {selectedUser.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                <p className="text-xs text-gray-400">{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-5">
              <div className="flex justify-between">
                <span>Role</span>
                <span className="capitalize font-medium">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span>{selectedUser.role === 'accountant' ? 'Reviewed' : 'Total spend'}</span>
                <span className="font-medium">
                  {selectedUser.role === 'accountant'
                    ? `${accountantReviewCounts[selectedUser._id] || 0} expenses`
                    : `Rs. ${(employeeTotals[selectedUser._id] || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Joined</span>
                <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-2 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => handleRemove(selectedUser._id)}
                disabled={removing}
                className="flex-1 py-2 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100"
              >
                {removing ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-80 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-800 mb-4">Add Team Member</h3>

            {addError && <p className="text-red-500 text-sm mb-3">{addError}</p>}

            <form onSubmit={handleAddUser} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="employee">Employee</option>
                <option value="accountant">Accountant</option>
              </select>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-lg text-sm bg-gray-100 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  {adding ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEmployees;