import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Trophy, Heart, Calendar, ArrowRight, User as UserIcon, CheckCircle } from 'lucide-react';
import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './index.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
        <Trophy color="var(--primary)" size={32} />
        <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Tee to Giving</span>
      </Link>
      <div className="flex gap-4">
        <Link to="/charities" style={{ fontWeight: 600, alignSelf: 'center' }}>Charities</Link>
        <Link to="/draws" style={{ fontWeight: 600, alignSelf: 'center' }}>Monthly Draw</Link>
        {user ? (
          <>
            {user.role === 'Admin' && <Link to="/admin" className="btn btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Admin Panel</Link>}
            <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
            <button onClick={logout} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/subscribe" className="btn">Subscribe Now</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="main-container">
      <header className="hero">
        <h1>Golf with Purpose. Win with Impact.</h1>
        <p>Join a community of golfers making a difference. Enter your scores, participate in monthly draws, and support your favorite charities with every swing.</p>
        <div className="flex gap-4" style={{ justifyContent: 'center' }}>
          <Link to="/subscribe" className="btn">Start Your Impact <ArrowRight size={18} /></Link>
        </div>
      </header>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert('Login Failed: ' + err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '500px', marginTop: '4rem' }}>
      <div className="card">
        <div className="text-center mb-4">
          <UserIcon size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to enter scores and manage your subscription</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Sign In</button>
        </form>
        <div className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
            <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/subscribe'); // Force to subscribe flow
    } catch (err) {
      alert('Registration Failed: ' + err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '500px', marginTop: '4rem' }}>
      <div className="card">
        <div className="text-center mb-4">
          <Trophy size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h2>Create Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Join the platform to access features</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="John Doe" required />
          </div>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Register & Continue</button>
        </form>
      </div>
    </div>
  );
}

function Subscribe() {
  const { user } = useContext(AuthContext);

  const handleSubscribe = async (plan) => {
    if (!user) {
        alert("Please register or login first.");
        return window.location.href = '/register';
    }
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`, { plan });
      window.location.href = res.data.url;
    } catch (err) {
      alert('Error initiating checkout: ' + err.message);
    }
  };

  return (
    <div className="main-container text-center">
      <h1 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Choose Your Impact</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Select a subscription plan. A portion of this will go directly to your chosen charity.</p>
      
      <div className="grid grid-cols-2" style={{ maxWidth: '900px', margin: '0 auto', gap: '2rem' }}>
        <div className="card flex" style={{ flexDirection: 'column', padding: '2.5rem' }}>
          <h2>Monthly Plan</h2>
          <div style={{ fontSize: '3rem', fontWeight: 700, margin: '1.5rem 0' }}>$19<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/mo</span></div>
          <ul style={{ listStyle: 'none', textAlign: 'left', margin: '0 auto 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
             <li className="flex items-center gap-4"><CheckCircle size={20} color="var(--primary)" /> Unlimited Score Entries</li>
             <li className="flex items-center gap-4"><CheckCircle size={20} color="var(--primary)" /> Charity Contribution Included</li>
             <li className="flex items-center gap-4"><CheckCircle size={20} color="var(--primary)" /> Entry in Monthly Draws</li>
          </ul>
          <button onClick={() => handleSubscribe('monthly')} className="btn" style={{ marginTop: 'auto', width: '100%' }}>Subscribe Monthly</button>
        </div>

        <div className="card flex" style={{ flexDirection: 'column', padding: '2.5rem', border: '2px solid var(--primary)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '30px', background: 'var(--primary)', color: 'white', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Save 20%</div>
          <h2>Yearly Plan</h2>
          <div style={{ fontSize: '3rem', fontWeight: 700, margin: '1.5rem 0' }}>$180<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/yr</span></div>
          <ul style={{ listStyle: 'none', textAlign: 'left', margin: '0 auto 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
             <li className="flex items-center gap-4"><CheckCircle size={20} color="var(--primary)" /> All Monthly Features</li>
             <li className="flex items-center gap-4"><CheckCircle size={20} color="var(--primary)" /> 2 Months Free</li>
             <li className="flex items-center gap-4"><CheckCircle size={20} color="var(--primary)" /> Priority Support</li>
          </ul>
          <button onClick={() => handleSubscribe('yearly')} className="btn" style={{ marginTop: 'auto', width: '100%' }}>Subscribe Yearly</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, loading } = useContext(AuthContext);
  const [scoreInput, setScoreInput] = useState('');
  const [scores, setScores] = useState([]);
  
  // Fake fetch on component load from user context
  useEffect(() => {
    if (user?.scores) {
        setScores(user.scores);
    }
  }, [user]);

  if (loading) return <div className="main-container text-center mt-4">Loading...</div>;
  
  if (!user) {
      window.location.href = '/login';
      return null;
  }

  const handleAddScore = async (e) => {
    e.preventDefault();
    try {
        const val = parseInt(scoreInput);
        if (val < 1 || val > 45) return alert('Stableford scores must be between 1 and 45.');

        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/score`, { score: val });
        setScores(res.data.scores);
        setScoreInput('');
    } catch (err) {
        alert('Failed to add score: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="main-container">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1>Welcome, {user.name}</h1>
        <div style={{ background: user.subscriptionStatus === 'active' ? 'rgba(42, 157, 143, 0.2)' : 'rgba(231, 111, 81, 0.2)', color: user.subscriptionStatus === 'active' ? 'var(--primary)' : 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
            {user.subscriptionStatus === 'active' ? 'Active Subscriber' : 'Subscription Inactive'}
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '2rem', alignItems: 'start' }}>
        <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={20} color="var(--primary)" /> Entry Engine
            </h3>
            
            <form onSubmit={handleAddScore} className="flex gap-4" style={{ marginBottom: '2rem' }}>
                <input 
                    type="number" 
                    min="1" max="45" 
                    placeholder="Enter Stableford Score (1-45)" 
                    className="input-field" 
                    value={scoreInput} 
                    onChange={e => setScoreInput(e.target.value)} 
                    required 
                />
                <button type="submit" className="btn" disabled={user.subscriptionStatus !== 'active'}>Add Score</button>
            </form>
            
            {user.subscriptionStatus !== 'active' && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1.5rem' }}>*You must have an active subscription to submit scores to the draw.</p>}

            <h4>Your Rolling Scores</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Only your 5 most recent rounds are retained for the draw algorithm.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {scores.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No scores entered yet.</p> : null}
                {scores.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 600 }}>Score: {s.score}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(s.date).toLocaleDateString()}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Heart size={20} color="var(--danger)" /> Charity Focus
                </h3>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Contribution Split</p>
                    <div className="flex justify-between items-center">
                        <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{user.charityPercentage || 10}%</span>
                        <Link to="/charities" style={{ fontSize: '0.9rem' }}>Change Charity</Link>
                    </div>
                </div>
             </div>

             <div>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={20} color="var(--accent)" /> Draw Schedule
                </h3>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Next Scheduled Draw</p>
                    <div className="flex justify-between items-center">
                        <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>1st of Next Month</span>
                        <Link to="/draws" style={{ fontSize: '0.9rem' }}>View History</Link>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}

function Draws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/draw`);
        setDraws(res.data);
      } catch (err) {
        console.error('Failed to fetch draws', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDraws();
  }, []);

  return (
    <div className="main-container">
      <h1 style={{ marginBottom: '1rem' }}>Historical Monthly Draws</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Review the results of our past charity draws and see the impact we've made.</p>

      {loading ? (
        <div className="text-center mt-4">Loading draw history...</div>
      ) : draws.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <Trophy size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No Draws Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>The very first draw hasn't been published yet. Subscribe to participate!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
          {draws.map(draw => (
            <div key={draw._id} className="card">
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="var(--accent)" /> {draw.month}
                </h3>
                {draw.jackpotRolledOver && <span style={{ background: 'var(--danger)', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>Jackpot Rolled Over!</span>}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Winning Numbers</p>
                <div className="flex gap-4">
                  {draw.winningNumbers.map((num, i) => (
                    <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                 <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Prize Pool</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--secondary)' }}>${draw.prizePool}</span>
                 </div>
                 <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>5-Match Winners</span>
                    <span style={{ fontWeight: 'bold' }}>{draw.fiveMatchWinners.length}</span>
                 </div>
                 <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>4-Match Winners</span>
                    <span style={{ fontWeight: 'bold' }}>{draw.fourMatchWinners.length}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-muted)' }}>3-Match Winners</span>
                    <span style={{ fontWeight: 'bold' }}>{draw.threeMatchWinners.length}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPanel() {
  const { user, loading } = useContext(AuthContext);
  const [winners, setWinners] = useState([]);
  const [simMessage, setSimMessage] = useState('');

  useEffect(() => {
    if (user && user.role === 'Admin') {
       fetchWinners();
    }
  }, [user]);

  const fetchWinners = async () => {
     try {
         const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/winners`);
         setWinners(res.data);
     } catch (err) {
         console.error('Failed fetching winners:', err);
     }
  };

  const verifyWinner = async (id) => {
      try {
          await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/winner/pay/${id}`);
          fetchWinners();
      } catch (err) {
          alert('Failed to mark paid: ' + err.message);
      }
  };

  const simulateDraw = async () => {
      try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/draw/simulate`, { type: 'random' });
          setSimMessage(`Draw Simulated. Prize Pool calculated: $${res.data.draw.prizePool}`);
      } catch (err) {
          alert('Sim failed: ' + err.message);
      }
  };

  if (loading) return <div className="text-center mt-4">Loading Admin...</div>;
  if (!user || user.role !== 'Admin') return <div className="text-center mt-4 text-danger">Access Denied. Admin Privileges Required.</div>;

  return (
      <div className="main-container">
          <h1 style={{ marginBottom: '2rem' }}>Administrator Dashboard</h1>
          
          <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
              <div className="card">
                  <h2>Draw Execution Engine</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Ensure all scores are synced before executing the monthly simulation.</p>
                  <button className="btn" onClick={simulateDraw} style={{ marginBottom: '1rem' }}>Execute Simulation (Test Mode)</button>
                  {simMessage && <div style={{ padding: '0.5rem', background: 'rgba(42, 157, 143, 0.2)', color: 'var(--primary)', borderRadius: 'var(--radius)' }}>{simMessage}</div>}
                  <hr style={{ margin: '2rem 0', borderColor: 'var(--border)' }} />
                  <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>* Publishing a draw distributes "Pending" winnings to users instantly.</p>
                  <button className="btn btn-secondary">Publish Latest Simulation (Live)</button>
              </div>

              <div className="card">
                  <h2>Winner Verification</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Users waiting for proof submission payout.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {winners.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No pending winners.</p> : null}
                      {winners.map(w => (
                          <div key={w._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                  <div style={{ fontWeight: 'bold' }}>{w.name}</div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{w.email} | Winnings: ${w.winnings}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.2rem' }}>Status: {w.winningsStatus}</div>
                              </div>
                              {w.winningsStatus !== 'Paid' && (
                                  <button onClick={() => verifyWinner(w._id)} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Verify & Pay</button>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );
}

function Charities() {
    return (
        <div className="main-container text-center">
            <h1 style={{ marginBottom: '1rem' }}>Our Supported Charities</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>Through your monthly subscription, a direct portion is given back to the community. Here are the organizations currently available on the platform.</p>
            
            <div className="card text-center" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
                <Heart size={48} color="var(--danger)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>Charity Listing Populating</h3>
                <p style={{ color: 'var(--text-muted)' }}>The admin team is currently onboarding the initial batch of charities into the database.</p>
            </div>
        </div>
    );
}

function AppContent() {
    return (
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/draws" element={<Draws />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/charities" element={<Charities />} />
          </Routes>
        </Router>
    )
}

function App() {
  return (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
  );
}

export default App;
