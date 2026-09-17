import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { MemberContributionSummary } from '../../types/member';
import {
  getMyContributions,
  getMyPayments,
  type MemberPayment,
} from '../../services/memberPortalService';
import './MemberDashboard.css';

interface MemberSummary {
  memberId: number;
  firstName: string;
  lastName: string;
  totalExpected: number;
  totalPaid: number;
  totalRemaining: number;
  totalContributions: number;
  paidContributions: number;
  partialContributions: number;
  unpaidContributions: number;
}

function MemberDashboard() {
  const [summary, setSummary] = useState<MemberSummary | null>(null);
  const [contributions, setContributions] = useState<
    MemberContributionSummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState<MemberPayment[]>([]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [summaryResponse, contributionsData, paymentsData] =
        await Promise.all([
          api.get<MemberSummary>('/member/summary'),
          getMyContributions(),
          getMyPayments(),
        ]);

      setSummary(summaryResponse.data);
      setContributions(contributionsData);
      setPayments(paymentsData);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les données du tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const paymentProgress = useMemo(() => {
    if (!summary || Number(summary.totalExpected) <= 0) {
      return 0;
    }

    return Math.min(
      (Number(summary.totalPaid) / Number(summary.totalExpected)) * 100,
      100
    );
  }, [summary]);

  const formatAmount = (value: number) => {
    return (
      new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0,
      }).format(Number(value)) + ' FCFA'
    );
  };

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
        <p>Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="member-dashboard-page">
        <div className="member-error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error || 'Données indisponibles.'}</span>

          <button onClick={loadDashboard}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="member-dashboard-page">

      {/* HEADER */}

      <div className="member-dashboard-header">

        <div>
          <span className="member-eyebrow">
            Espace membre
          </span>

          <h1>
            Bonjour {summary.firstName} 👋
          </h1>

          <p>
            Voici un aperçu de votre situation au sein de l'association.
          </p>
        </div>

        <button
          className="member-refresh-btn"
          onClick={loadDashboard}
        >
          <i className="bi bi-arrow-clockwise"></i>
          Actualiser
        </button>

      </div>


      {/* STATISTIQUES PRINCIPALES */}

      <div className="member-dashboard-stats">

        <div className="member-dashboard-stat expected">

          <div className="dashboard-stat-icon">
            <i className="bi bi-wallet2"></i>
          </div>

          <div>
            <span>Total attendu</span>
            <strong>
              {formatAmount(summary.totalExpected)}
            </strong>
          </div>

        </div>


        <div className="member-dashboard-stat paid">

          <div className="dashboard-stat-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>

          <div>
            <span>Total payé</span>
            <strong>
              {formatAmount(summary.totalPaid)}
            </strong>
          </div>

        </div>


        <div className="member-dashboard-stat remaining">

          <div className="dashboard-stat-icon">
            <i className="bi bi-hourglass-split"></i>
          </div>

          <div>
            <span>Reste à payer</span>
            <strong>
              {formatAmount(summary.totalRemaining)}
            </strong>
          </div>

        </div>


        <div className="member-dashboard-stat contributions">

          <div className="dashboard-stat-icon">
            <i className="bi bi-receipt"></i>
          </div>

          <div>
            <span>Cotisations</span>
            <strong>
              {summary.totalContributions}
            </strong>
          </div>

        </div>

      </div>


      {/* CONTENU PRINCIPAL */}

      <div className="member-dashboard-grid">

        {/* PROGRESSION */}

        <div className="member-dashboard-card progress-card">

          <div className="dashboard-card-header">

            <div>
              <h2>Progression globale</h2>
              <p>Votre niveau de paiement</p>
            </div>

            <div className="progress-percentage">
              {Math.round(paymentProgress)}%
            </div>

          </div>


          <div className="global-progress">

            <div
              className="global-progress-value"
              style={{
                width: `${paymentProgress}%`,
              }}
            ></div>

          </div>


          <div className="progress-details">

            <div>
              <span>Payé</span>
              <strong>
                {formatAmount(summary.totalPaid)}
              </strong>
            </div>

            <div>
              <span>Restant</span>
              <strong>
                {formatAmount(summary.totalRemaining)}
              </strong>
            </div>

          </div>

        </div>


        {/* RÉPARTITION */}

        <div className="member-dashboard-card">

          <div className="dashboard-card-header">

            <div>
              <h2>État des cotisations</h2>
              <p>Répartition de vos cotisations</p>
            </div>

          </div>


          <div className="contribution-status-list">

            <div className="status-row">

              <div className="status-label">
                <span className="status-dot paid"></span>
                <span>Payées</span>
              </div>

              <strong>
                {summary.paidContributions}
              </strong>

            </div>


            <div className="status-row">

              <div className="status-label">
                <span className="status-dot partial"></span>
                <span>Partielles</span>
              </div>

              <strong>
                {summary.partialContributions}
              </strong>

            </div>


            <div className="status-row">

              <div className="status-label">
                <span className="status-dot unpaid"></span>
                <span>Non payées</span>
              </div>

              <strong>
                {summary.unpaidContributions}
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* COTISATIONS */}

      <div className="member-dashboard-card contributions-preview">

        <div className="dashboard-card-header">

          <div>
            <h2>Mes cotisations</h2>
            <p>Suivez l'état de vos différentes cotisations.</p>
          </div>

          <Link to="/member/contributions">
            Voir toutes
            <i className="bi bi-arrow-right"></i>
          </Link>

        </div>


        {contributions.length === 0 ? (

          <div className="dashboard-empty">
            <i className="bi bi-wallet2"></i>
            <p>Aucune cotisation disponible.</p>
          </div>

        ) : (

          <div className="dashboard-contribution-list">

            {contributions.slice(0, 5).map((item) => {

              const expected = Number(item.expectedAmount);
              const paid = Number(item.totalPaid);

              const progress =
                expected > 0
                  ? Math.min((paid / expected) * 100, 100)
                  : 0;

              return (
                <div
                  className="dashboard-contribution-item"
                  key={item.memberContributionId}
                >

                  <div className="dashboard-contribution-main">

                    <div className="dashboard-contribution-icon">
                      <i className="bi bi-wallet2"></i>
                    </div>

                    <div>

                      <h3>
                        {item.contributionName}
                      </h3>

                      <span>
                        {formatAmount(paid)} sur{' '}
                        {formatAmount(expected)}
                      </span>

                    </div>

                  </div>


                  <div className="dashboard-contribution-progress">

                    <div className="mini-progress">

                      <div
                        style={{
                          width: `${progress}%`,
                        }}
                      ></div>

                    </div>

                    <span>
                      {Math.round(progress)}%
                    </span>

                  </div>


                  <span
                    className={`dashboard-status ${getStatusClass(
                      item.status
                    )}`}
                  >

                    <i
                      className={`bi ${getStatusIcon(
                        item.status
                      )}`}
                    ></i>

                    {getStatusLabel(item.status)}

                  </span>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {/* DERNIERS PAIEMENTS */}

      <div className="member-dashboard-card recent-payments">

        <div className="dashboard-card-header">

          <div>
            <h2>Derniers paiements</h2>
            <p>Vos derniers versements enregistrés.</p>
          </div>

          <Link to="/member/payments">
            Voir tous
            <i className="bi bi-arrow-right"></i>
          </Link>

        </div>

        {payments.length === 0 ? (

          <div className="dashboard-empty">
            <i className="bi bi-cash-stack"></i>
            <p>Aucun paiement enregistré.</p>
          </div>

        ) : (

          <div className="recent-payments-list">

            {payments
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.paymentDate).getTime() -
                  new Date(a.paymentDate).getTime()
              )
              .slice(0, 5)
              .map((payment) => (

                <div
                  className="recent-payment-item"
                  key={payment.paymentId}
                >

                  <div className="recent-payment-icon">
                    <i className="bi bi-cash-stack"></i>
                  </div>

                  <div className="recent-payment-info">

                    <strong>
                      {payment.contributionName}
                    </strong>

                    <span>
                      {new Intl.DateTimeFormat('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date(payment.paymentDate))}
                    </span>

                  </div>

                  <div className="recent-payment-amount">

                    <strong>
                      +{formatAmount(Number(payment.amountPaid))}
                    </strong>

                    <span>
                      Reste : {formatAmount(
                        Number(payment.remainingAmount)
                      )}
                    </span>

                  </div>

                </div>

              ))}

          </div>

        )}

      </div>

      {/* ACTIONS RAPIDES */}

      <div className="member-dashboard-actions">

        <Link to="/member/contributions">
          <i className="bi bi-wallet2"></i>

          <div>
            <strong>Mes cotisations</strong>
            <span>Voir mes cotisations</span>
          </div>

          <i className="bi bi-arrow-right"></i>
        </Link>


        <Link to="/member/payments">
          <i className="bi bi-cash-stack"></i>

          <div>
            <strong>Mes paiements</strong>
            <span>Consulter mon historique</span>
          </div>

          <i className="bi bi-arrow-right"></i>
        </Link>


        <Link to="/member/profile">
          <i className="bi bi-person-circle"></i>

          <div>
            <strong>Mon profil</strong>
            <span>Voir mes informations</span>
          </div>

          <i className="bi bi-arrow-right"></i>
        </Link>

      </div>

    </div>
  );
}

export default MemberDashboard;