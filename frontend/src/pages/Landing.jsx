import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#fff', minHeight: '100vh', color: '#111' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 48px', borderBottom: '1px solid #EBEBEB', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>E</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#111', letterSpacing: '-0.3px' }}>ExpenseTracker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/login"
            style={{
              fontSize: '13px',
              color: '#555',
              textDecoration: 'none',
              padding: '7px 14px',
              borderRadius: '7px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#EFF6FF';
              e.target.style.color = '#2563EB';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#555';
            }}
          >
            Login
          </Link>
          <Link to="/register" style={{ fontSize: '13px', background: '#2563EB', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Get started free</Link>
        </div>
      </nav>


      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #EFF6FF 0%, #F8FAFF 40%, #fff 100%)', padding: '20px 30px 30px', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563EB', background: '#DBEAFE', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '18px' }}>
            Built for Pakistani businesses
          </span>
          <h1 style={{ fontSize: '46px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: '-1px' }}>
            Expense management<br />
            <span style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>your whole team will use</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7, margin: '0 0 28px' }}>
            Submit expenses, get approvals, track budgets — one platform for admins, employees, and accountants.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
            <Link to="/register" style={{ fontSize: '14px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff', padding: '12px 24px', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
              Create a Company
            </Link>
            <Link to="/join" style={{ fontSize: '14px', background: '#fff', color: '#333', padding: '12px 24px', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, border: '1.5px solid #E2E8F0' }}>
              Join a Company
            </Link>
          </div>

          {/* Mini stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
            {[
              { num: '3 roles', label: 'Admin, Employee, Accountant' },
              { num: 'Free', label: 'No credit card needed' },
              { num: 'Live', label: 'Real-time approvals' },
            ].map((s) => (
              <div key={s.num} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#2563EB', margin: '0 0 2px' }}>{s.num}</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* How it works */}
      <div style={{ padding: '20px 18px 35px', background: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p
            style={{
              textAlign: 'center',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#154b9c',
              marginBottom: '20px',
            }}
          >
            How it works
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              position: 'relative',
            }}
          >
            {/* Connector Line */}
            <div
              style={{
                position: 'absolute',
                top: '22px',
                left: '18%',
                right: '18%',
                height: '2px',
                background: '#BFDBFE',
                zIndex: 0,

              }}
            />

            {[
              {
                step: '01',
                title: 'Create your company',
                desc: 'Admin signs up and gets a unique invite code to share with the team.',
                color: '#EFF6FF',
                accent: '#2563EB',

              },
              {
                step: '02',
                title: 'Invite your team',
                desc: 'Employees , accountants join using code , each gets a role-specific dashboard.',
                color: '#F0FDF4',
                accent: '#16A34A',
              },
              {
                step: '03',
                title: 'Track and approve',
                desc: 'Employees submit expenses, accountants approve, admin sees everything live.',
                color: '#FDF4FF',
                accent: '#9333EA',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  textAlign: 'center',
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: item.accent,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    margin: '0 auto 18px',
                    boxShadow: '0 0 0 6px #fff',
                  }}
                >
                  {item.step}
                </div>

                {/* Card */}
                <div
                  style={{
                    background: item.color,
                    borderRadius: '16px',
                    padding: '22px',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
                    border: '1px solid #E5E7EB',
                    transition: '0.3s',
                  }}
                >
                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '10px',
                    }}
                  >
                    {item.title}
                  </p>

                  <p
                    style={{
                      fontSize: '13px',
                      color: '#64748B',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Features */}
      <div
        style={{
          padding: '30px 48px',
          background: 'linear-gradient(to bottom, #F8FBFF, #FFFFFF)',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>

          <p
            style={{
              textAlign: 'center',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#112d7a',
              marginBottom: '12px',
            }}
          >
            Features
          </p>

          <h2
            style={{
              textAlign: 'center',
              fontSize: '30px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 38px',
            }}
          >
            Everything you need in one place
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {[
              {
                icon: '👥',
                title: 'Multi-role system',
                desc: 'Admin, Employee and Accountant each have their own dashboard.',
              },
              {
                icon: '✅',
                title: 'Approval workflow',
                desc: 'Submit, review and approve expenses with complete transparency.',
              },
              {
                icon: '📊',
                title: 'Budget tracking',
                desc: 'Monitor company spending and monthly budgets in real time.',
              },
              {
                icon: '🔑',
                title: 'Company invite code',
                desc: 'Employees join instantly using a secure company code.',
              },
              {
                icon: '🧾',
                title: 'Receipt uploads',
                desc: 'Upload receipts to keep every expense verified.',
              },
              {
                icon: '📥',
                title: 'CSV export',
                desc: 'Export reports anytime for accounting and audits.',
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '16px',
                  padding: '16px',
                  minHeight: '145px',
                  boxShadow: '0 4px 14px rgba(15,23,42,0.05)',
                  transition: '0.3s',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '12px',
                  }}
                >
                  {f.icon}
                </div>

                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#111827',
                    margin: '0 0 6px',
                  }}
                >
                  {f.title}
                </p>

                <p
                  style={{
                    fontSize: '13px',
                    color: '#64748B',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>





      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, #1E40AF, #7C3AED)', padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Ready to get started?</h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 24px' }}>Create your company in under a minute — completely free.</p>
        <Link to="/register" style={{ fontSize: '14px', background: '#fff', color: '#2563EB', padding: '12px 28px', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
          Create a Company — it's free
        </Link>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #F0F0F0', padding: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>© 2025 ExpenseTracker · Built for Pakistani businesses</p>
      </div>

    </div>
  );
}

export default Landing;