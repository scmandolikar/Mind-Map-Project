import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { FaProjectDiagram, FaArrowRight } from 'react-icons/fa';

function HomePage() {
  const [mapId, setMapId] = useState('');
  const navigate = useNavigate();
  const { user } = useUser();

  const joinMap = (e) => {
    e.preventDefault();
    if (mapId.trim() !== '') {
      navigate(`/map/${mapId.trim()}`);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="modal-content" style={{ maxWidth: '600px', width: '100%', padding: '3rem 2rem', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '1rem' }}>
          <FaProjectDiagram />
        </div>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>MindMap Projects</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2.5rem' }}>
          Collaborate, brainstorm, and organize your ideas in real-time.
        </p>

        <form onSubmit={joinMap} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
          <input
            type="text"
            value={mapId}
            onChange={(e) => setMapId(e.target.value)}
            placeholder="Enter a Map Name to Join..."
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #475569',
              background: '#1e293b',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          <button type="submit" className="btn-save" style={{ padding: '0 2rem', fontSize: '1.1rem' }}>
            Go <FaArrowRight />
          </button>
        </form>

        <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {user ? (
            <div>
              <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>Welcome back, <b>{user.username}</b></p>
              <Link to="/dashboard" style={{
                display: 'inline-block',
                padding: '0.8rem 1.5rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/login" style={{ color: 'var(--primary)' }}>Login / Register</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;