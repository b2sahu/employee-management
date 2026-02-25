
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import '../index.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh' }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="flex-center" style={{ marginBottom: '1rem', flexDirection: 'column' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '50%' }}>
                        {isAdmin ? <ShieldCheck size={40} color="#4facfe" /> : <User size={40} color="#4facfe" />}
                    </div>
                    <h2 style={{ fontSize: '2rem', margin: '0' }}>{isAdmin ? 'Admin Portal' : 'Welcome Back'}</h2>
                    <p style={{ color: '#aaa' }}>{isAdmin ? 'Manage your workforce' : 'Login to access your dashboard'}</p>
                </div>

                {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', top: '18px', left: '15px', color: '#aaa' }} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="input-field"
                            style={{ paddingLeft: '45px' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', top: '18px', left: '15px', color: '#aaa' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field"
                            style={{ paddingLeft: '45px' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        Login <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                        {isAdmin ? "Not an admin?" : "Don't have an account?"}
                        {' '}
                        {isAdmin ? (
                            <span style={{ color: '#4facfe', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsAdmin(false)}>Employee Login</span>
                        ) : (
                            <Link to="/register" style={{ color: '#4facfe', fontWeight: 'bold', textDecoration: 'none' }}>Register here</Link>
                        )}
                    </p>
                    {!isAdmin && (
                        <p style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '5px' }}>
                            Admin access? <span style={{ color: '#4facfe', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsAdmin(true)}>Click here</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
