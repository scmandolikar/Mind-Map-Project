import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function LoginPage() {
    const [username, setUsername] = useState('');
    const { login } = useUser();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username.trim()) {
            login(username);
            navigate('/dashboard');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }}>
            <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px', width: '90%' }}>
                <h2 style={{ marginBottom: '2rem' }}>Login to MindMap</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            marginBottom: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #475569',
                            background: '#1e293b',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                        autoFocus
                    />
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            background: 'var(--primary)',
                            border: 'none',
                            padding: '1rem',
                            fontSize: '1rem'
                        }}>
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
