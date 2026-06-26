import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

function AdminSettings() {
  const [profile, setProfile] = useState(null);
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.user);
        setBudget(res.data.user.companyId?.monthlyBudget || '');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        'http://localhost:5000/api/auth/budget',
        { monthlyBudget: Number(budget) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500 mt-10 text-center">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Company</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="text-gray-800 font-medium">{profile?.companyId?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Invite Code</span>
            <span className="font-mono text-blue-600 font-medium">{profile?.companyId?.companyCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Admin</span>
            <span className="text-gray-800">{profile?.name}</span>
          </div>
        </div>
      </div>

      {/* Monthly Budget */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Monthly Budget</p>
        <p className="text-xs text-gray-400 mb-4">Set a spending limit for your company this month</p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {saved && <p className="text-green-600 text-sm mb-3">Budget saved successfully!</p>}

        <form onSubmit={handleSave} className="flex gap-3 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">Rs.</span>
            <input
              type="number"
              placeholder="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm"
              min="0"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save Budget'}
          </button>
        </form>

        {profile?.companyId?.monthlyBudget > 0 && (
          <p className="text-xs text-gray-400 mt-3">
            Current budget: Rs. {profile?.companyId?.monthlyBudget?.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminSettings;