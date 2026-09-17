import { useEffect, useMemo, useState } from 'react';
import { getMyContributions } from '../../services/memberPortalService';
import type { MemberContributionSummary } from '../../types/member';
import './MemberContributions.css';

function MemberContributions() {
  const [contributions, setContributions] = useState<MemberContributionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadContributions = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getMyContributions();
      setContributions(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger vos cotisations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributions();
  }, []);

  const totalExpected = useMemo(
    () => contributions.reduce((t, i) => t + Number(i.expectedAmount), 0),
    [contributions]
  );

  const totalPaid = useMemo(
    () => contributions.reduce((t, i) => t + Number(i.totalPaid), 0),
    [contributions]
  );

  const totalRemaining = useMemo(
    () => contributions.reduce((t, i) => t + Number(i.remainingAmount), 0),
    [contributions]
  );

  const formatAmount = (value: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) +
    ' FCFA';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAYE':
        return 'Payé';
      case 'PARTIEL':
        return 'Partiel';
      default:
        return 'Non payé';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PAYE':
        return 'paid';
      case 'PARTIEL':
        return 'partial';
      default:
        return 'unpaid';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAYE':
        return 'bi-check-circle-fill';
      case 'PARTIEL':
        return 'bi-hourglass-split';
      default:
        return 'bi-exclamation-circle-fill';
    }
  };

  if (loading) {
    return (
      <div className="member-loading">
        <div className="spinner-border" role="status"></div>
        <p>Chargement de vos cotisations...</p>
      </div>
    );
  }

  return (
    <div className="member-contributions-page">
      {/* HEADER */}
      <div className="member-page-header">
        <div>
          <span className="member-eyebrow">Espace membre</span>
          <h1>Mes cotisations</h1>
          <p>Consultez vos cotisations et suivez vos paiements.</p>
        </div>

        <button className="member-refresh-btn" onClick={loadContributions}>
          <i className="bi bi-arrow-clockwise"></i>
          Actualiser
        </button>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="member-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {/* STATISTIQUES */}
      <div className="member-stats-grid">
        <div className="member-stat-card expected">
          <div className="member-stat-icon expected">
            <i className="bi bi-wallet2"></i>
          </div>
          <div>
            <span>Total attendu</span>
            <strong>{formatAmount(totalExpected)}</strong>
          </div>
        </div>

        <div className="member-stat-card paid">
          <div className="member-stat-icon paid">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div>
            <span>Total payé</span>
            <strong>{formatAmount(totalPaid)}</strong>
          </div>
        </div>

        <div className="member-stat-card remaining">
          <div className="member-stat-icon remaining">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <div>
            <span>Reste à payer</span>
            <strong>{formatAmount(totalRemaining)}</strong>
          </div>
        </div>
      </div>

      {/* LISTE */}
      <div className="member-contributions-card">
        <div className="member-card-heading">
          <div>
            <h2>Mes campagnes de cotisation</h2>
            <span>
              {contributions.length} cotisation
              {contributions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {contributions.length === 0 ? (
          <div className="member-empty-state">
            <i className="bi bi-wallet2"></i>
            <h3>Aucune cotisation</h3>
            <p>Vous n'avez actuellement aucune cotisation.</p>
          </div>
        ) : (
          <div className="member-contributions-list">
            {contributions.map((item) => {
              const progress =
                Number(item.expectedAmount) > 0
                  ? Math.min(
                      (Number(item.totalPaid) / Number(item.expectedAmount)) * 100,
                      100
                    )
                  : 0;

              return (
                <div
                  className="member-contribution-item"
                  key={item.memberContributionId}
                >
                  {/* TITRE */}
                  <div className="member-contribution-top">
                    <div className="member-contribution-title">
                      <div className="contribution-icon">
                        <i className="bi bi-wallet2"></i>
                      </div>
                      <div>
                        <h3>{item.contributionName}</h3>
                        <span>Cotisation personnelle</span>
                      </div>
                    </div>

                    <span
                      className={`member-status ${getStatusClass(item.status)}`}
                    >
                      <i className={`bi ${getStatusIcon(item.status)}`}></i>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  {/* MONTANTS */}
                  <div className="member-contribution-amounts">
                    <div>
                      <span>Montant attendu</span>
                      <strong>{formatAmount(Number(item.expectedAmount))}</strong>
                    </div>

                    <div>
                      <span>Montant payé</span>
                      <strong className="paid-amount">
                        {formatAmount(Number(item.totalPaid))}
                      </strong>
                    </div>

                    <div>
                      <span>Reste à payer</span>
                      <strong
                        className={
                          Number(item.remainingAmount) > 0
                            ? 'remaining-amount'
                            : 'completed-amount'
                        }
                      >
                        {formatAmount(Number(item.remainingAmount))}
                      </strong>
                    </div>
                  </div>

                  {/* PROGRESSION */}
                  <div className="member-progress-section">
                    <div className="member-progress-label">
                      <span>Progression du paiement</span>
                      <strong>{Math.round(progress)}%</strong>
                    </div>

                    <div className="member-progress-bar">
                      <div
                        className="member-progress-value"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberContributions;