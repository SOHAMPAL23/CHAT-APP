import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import './LoginPage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="login-page">
      <div className="login-container" style={{maxWidth: '500px'}}>
        <div className="login-card">
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-secondary"
            style={{marginBottom: '1.5rem'}}
          >
            ← Back to Chat
          </button>

          <div className="login-header">
            <div style={{marginBottom: '1rem'}}>
              <img 
                src={user.profilePicture} 
                alt={user.username}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid white',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
            </div>
            <h2 className="login-title">{user.username}</h2>
            <p className="login-subtitle">{user.email}</p>
            <div style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#10b98120',
              borderRadius: '1rem',
              color: '#10b981',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              ● Online
            </div>
          </div>

          <div style={{
            background: 'var(--gray-50)',
            padding: '1rem',
            borderRadius: '1rem',
            marginTop: '1.5rem'
          }}>
            <h3 style={{fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem'}}>Account Information</h3>
            <p style={{fontSize: '0.75rem', color: 'var(--gray-600)', margin: 0}}>
              Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
