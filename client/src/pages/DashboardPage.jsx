import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function DashboardPage() {
    const { user, logout, history, savedMaps, logs, removeSavedMap } = useUser();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <h2>Please Login first</h2>
                <Link to="/login" style={{ marginTop: '1rem', color: 'var(--primary)' }}>Go to Login</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Welcome, {user.username}</h1>
                    <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Member since {new Date(user.joinedAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/" style={{ padding: '0.8rem 1.5rem', background: 'var(--panel-bg)', borderRadius: '8px', color: 'white', textDecoration: 'none' }}>Home</Link>
                    <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>Logout</button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Saved Maps Section */}
                <section className="modal-content" style={{ animation: 'none', height: 'fit-content' }}>
                    <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginTop: 0 }}>Saved Maps</h2>
                    {savedMaps.length === 0 ? (
                        <p style={{ color: '#94a3b8' }}>No saved maps yet.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {savedMaps.map(mapId => (
                                <li key={mapId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Link to={`/map/${mapId}`} style={{ color: 'white' }}>Mock Map {mapId.substr(0, 8)}</Link>
                                    <button onClick={() => removeSavedMap(mapId)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>Remove</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* History Section */}
                <section className="modal-content" style={{ animation: 'none', height: 'fit-content' }}>
                    <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginTop: 0 }}>Recent History</h2>
                    {history.length === 0 ? (
                        <p style={{ color: '#94a3b8' }}>No history yet.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {history.map(mapId => (
                                <li key={mapId} style={{ padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Link to={`/map/${mapId}`} style={{ color: 'var(--primary)' }}>MindMap {mapId.slice(0, 8)}...</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* User Logs Section */}
                <section className="modal-content" style={{ animation: 'none', height: 'fit-content', gridColumn: '1 / -1' }}>
                    <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginTop: 0 }}>Activity Logs</h2>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {logs.length === 0 ? (
                            <p style={{ color: '#94a3b8' }}>No logs recorded.</p>
                        ) : (
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '0.5rem', color: '#94a3b8' }}>Time</th>
                                        <th style={{ padding: '0.5rem', color: '#94a3b8' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td style={{ padding: '0.5rem', color: 'white' }}>{log.action}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}

export default DashboardPage;
