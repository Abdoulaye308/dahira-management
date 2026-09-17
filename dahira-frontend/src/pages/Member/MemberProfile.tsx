import { useEffect, useState } from 'react';
import api from '../../services/api';
import './MemberProfile.css';

interface MemberProfileData {
  userId: number;
  memberId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  status: string;
}

function MemberProfile() {
  const [profile, setProfile] = useState<MemberProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get<MemberProfileData>('/member/profile');
      setProfile(response.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger votre profil.');
    } finally {
      setLoading(false);
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'Homme';
      case 'FEMALE':
        return 'Femme';
      default:
        return gender || '—';
    }
  };

  if (loading) {
    return (
      <div className="member-loading">
        <div className="spinner-border" role="status"></div>
        <p>Chargement de votre profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="member-profile-page">
        <div className="member-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
          <button onClick={loadProfile}>Réessayer</button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initial = profile.firstName.charAt(0).toUpperCase();
  const isActive = profile.status === 'ACTIVE';

  return (
    <div className="member-profile-page">
      {/* HEADER */}
      <div className="member-page-header">
        <div>
          <span className="member-eyebrow">Espace membre</span>
          <h1>Mon profil</h1>
          <p>Consultez vos informations personnelles.</p>
        </div>

        <button className="member-refresh-btn" onClick={loadProfile}>
          <i className="bi bi-arrow-clockwise"></i>
          Actualiser
        </button>
      </div>

      {/* CARTE PROFIL */}
      <div className="member-profile-card">
        {/* AVATAR */}
        <div className="member-profile-avatar-block">
          <div className="member-profile-avatar">{initial}</div>

          <h2 className="member-profile-name">
            {profile.firstName} {profile.lastName}
          </h2>

          <span
            className={`member-profile-status ${isActive ? 'active' : 'inactive'}`}
          >
            <i
              className={`bi ${
                isActive ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'
              }`}
            ></i>
            {isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>

        {/* INFORMATIONS */}
        <div className="member-profile-info">
          <div className="member-profile-info-header">
            <h3>Informations personnelles</h3>
            <p>Détails de votre compte membre</p>
          </div>

          <div className="member-profile-fields">
            <div className="member-profile-field">
              <span>Prénom</span>
              <strong>{profile.firstName}</strong>
            </div>

            <div className="member-profile-field">
              <span>Nom</span>
              <strong>{profile.lastName}</strong>
            </div>

            <div className="member-profile-field">
              <span>Téléphone</span>
              <strong>{profile.phone || '—'}</strong>
            </div>

            <div className="member-profile-field">
              <span>Sexe</span>
              <strong>{getGenderLabel(profile.gender)}</strong>
            </div>

            <div className="member-profile-field">
              <span>Nom d'utilisateur</span>
              <strong>{profile.username}</strong>
            </div>

            <div className="member-profile-field">
              <span>Adresse email</span>
              <strong>{profile.email}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberProfile;