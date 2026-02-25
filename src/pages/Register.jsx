
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, UserPlus, ArrowRight } from 'lucide-react';
import '../index.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            // Auto login or redirect to login? Let's redirect to login for now or auto-login.
            // The context 'register' function just adds to local storage.
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh' }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="flex-center" style={{ marginBottom: '1rem', flexDirection: 'column' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '50%' }}>
                        <UserPlus size={40} color="#4facfe" />
                    </div>
                    <h2 style={{ fontSize: '2rem', margin: '0' }}>Join Us</h2>
                    <p style={{ color: '#aaa' }}>Create your employee account</p>
                </div>

                {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', top: '18px', left: '15px', color: '#aaa' }} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="input-field"
                            style={{ paddingLeft: '45px' }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', top: '18px', left: '15px', color: '#aaa' }} />
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
                        Register <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#4facfe', fontWeight: 'bold', textDecoration: 'none' }}>Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
