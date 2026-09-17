import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../../services/dashboardService';
import type { DashboardData } from '../../services/dashboardService';
import { getCashSummary } from '../../services/cashService';
import type { CashSummary } from '../../types/cash';
import { getContributions } from '../../services/contributionService';
import type { Contribution } from '../../types/contribution';
import {
  getPaymentSummary,
  getPayments,
} from '../../services/paymentService';
import type { Payment, PaymentSummary } from '../../types/payment';
import { getCategories } from '../../services/categoryService';
import { getMembers } from '../../services/memberService';
import type { Category, Member } from '../../types/member';
import './Dashboard.css';

// Longueur de la circonférence du cercle SVG
const RING_CIRCUMFERENCE = 465;

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [cash, setCash] = useState<CashSummary | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          dashboardData,
          cashData,
          contributionsData,
          summaryData,
          categoriesData,
          membersData,
          paymentsData,
        ] = await Promise.all([
          getDashboard(),
          getCashSummary(),
          getContributions(),
          getPaymentSummary(),
          getCategories(),
          getMembers(),
          getPayments(),
        ]);

        setData(dashboardData);
        setCash(cashData);
        setContributions(contributionsData);
        setPaymentSummary(summaryData);
        setCategories(categoriesData);
        setMembers(membersData);
        setRecentPayments(paymentsData);
      } catch (err) {
        console.error(err);
        setError(
          'Impossible de charger les données du tableau de bord.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================
     CAMPAGNES ACTIVES
  ========================= */

  const activeCampaigns = useMemo(() => {
    return contributions
      .filter((contribution) => contribution.status === 'ACTIVE')
      .map((contribution) => {
        const items = paymentSummary.filter(
          (item) => item.contributionId === contribution.id
        );

        const expected = items.reduce(
          (total, item) => total + Number(item.expectedAmount),
          0
        );

        const paid = items.reduce(
          (total, item) => total + Number(item.totalPaid),
          0
        );

        const progress =
          expected > 0 ? Math.min((paid / expected) * 100, 100) : 0;

        return {
          id: contribution.id,
          name: contribution.name,
          expected,
          paid,
          progress,
        };
      })
      .sort((a, b) => a.progress - b.progress)
      .slice(0, 4);
  }, [contributions, paymentSummary]);

  /* =========================
     À RELANCER
  ========================= */

  const topUnpaid = useMemo(() => {
    return [...paymentSummary]
      .filter((item) => item.remainingAmount > 0)
      .sort((a, b) => b.remainingAmount - a.remainingAmount)
      .slice(0, 5);
  }, [paymentSummary]);

  /* =========================
     ACTIVITÉ RÉCENTE
  ========================= */

  const latestPayments = useMemo(() => {
    return [...recentPayments]
      .sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() -
          new Date(a.paymentDate).getTime()
      )
      .slice(0, 5);
  }, [recentPayments]);

  /* =========================
     RÉPARTITION PAR CATÉGORIE
  ========================= */

  const categoryBreakdown = useMemo(() => {
    const total = members.length;

    return categories
      .map((category) => {
        const count = members.filter(
          (member) => member.category.id === category.id
        ).length;

        return {
          id: category.id,
          name: category.name,
          count,
          percent: total > 0 ? (count / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [categories, members]);

  if (loading) {
    return (
      <div className="dh-loading">
        <div className="dh-spinner" role="status"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dh-error">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  const progress =
    data && data.totalExpected > 0
      ? Math.min(
          (data.totalPaid / data.totalExpected) * 100,
          100
        )
      : 0;

  const ringOffset =
    RING_CIRCUMFERENCE -
    (progress / 100) * RING_CIRCUMFERENCE;

  const formatAmount = (value: number) =>
    value.toLocaleString('fr-FR') + ' FCFA';

  const formatShortDate = (value: string) =>
    new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });

  return (
    <div>

      {/* =========================================
          HERO
      ========================================= */}

      <div className="dh-hero">

        <div className="dh-hero-top">

          <div>
            <h1 className="dh-hero-title">
              Tableau de bord
            </h1>

            <p className="dh-hero-sub">
              Dahira Hisnoul Abraar
              <span className="dot">·</span>
              Touba Bayakh
            </p>
          </div>

         <button
  className="dh-btn-new"
  onClick={() => navigate('/contributions?new=true')}
>
  <i className="bi bi-plus-lg"></i>
  Nouvelle cotisation
</button>

        </div>

        <svg
          className="dh-arch-swoosh"
          viewBox="0 0 220 26"
          fill="none"
        >
          <path
            d="M0 4 C 55 26, 80 26, 110 4 C 140 26, 165 26, 220 4"
            stroke="#E8CE84"
            strokeWidth="1.6"
          />
        </svg>

      </div>


      {/* =========================================
          KPI
      ========================================= */}

      <div className="dh-kpi-row">

        {/* MEMBRES */}
        <div className="dh-kpi-card">

          <div className="dh-kpi-badge">
            <i className="bi bi-people-fill"></i>
          </div>

          <span className="dh-kpi-label">
            Total membres
          </span>

          <h3 className="dh-kpi-value">
            {data?.totalMembers ?? 0}
          </h3>

          <span className="dh-kpi-note">
            {data?.activeMembers ?? 0} membres actifs
          </span>

        </div>


        {/* ATTENDU */}
        <div className="dh-kpi-card">

          <div className="dh-kpi-badge">
            <i className="bi bi-wallet2"></i>
          </div>

          <span className="dh-kpi-label">
            Total attendu
          </span>

          <h3 className="dh-kpi-value">
            {formatAmount(data?.totalExpected ?? 0)}
          </h3>

          <span className="dh-kpi-note">
            cotisations
          </span>

        </div>


        {/* ENCAISSÉ */}
        <div className="dh-kpi-card">

          <div className="dh-kpi-badge">
            <i className="bi bi-check-circle-fill"></i>
          </div>

          <span className="dh-kpi-label">
            Total encaissé
          </span>

          <h3 className="dh-kpi-value">
            {formatAmount(data?.totalPaid ?? 0)}
          </h3>

          <span className="dh-kpi-note">
            paiements reçus
          </span>

        </div>


        {/* CAISSE */}
        <div className="dh-kpi-card dh-kpi-cash">

          <div className="dh-kpi-badge">
            <i className="bi bi-safe2-fill"></i>
          </div>

          <span className="dh-kpi-label">
            Solde caisse
          </span>

          <h3 className="dh-kpi-value">
            {formatAmount(cash?.cashBalance ?? 0)}
          </h3>

          <span className="dh-kpi-note">
            solde disponible
          </span>

        </div>

      </div>


      {/* =========================================
          GRID PRINCIPAL
      ========================================= */}

      <div className="dh-main-grid">

        {/* =====================================
            SITUATION COTISATIONS
        ===================================== */}

        <div className="dh-panel dh-panel-dark">

          <h2 className="dh-panel-title">
            Situation financière
          </h2>

          <p className="dh-panel-sub">
            Suivi global des cotisations
          </p>


          <div className="dh-finance-body">

            <div className="dh-ring-wrap">

              <svg
                width="160"
                height="160"
                viewBox="0 0 168 168"
              >

                <circle
                  cx="84"
                  cy="84"
                  r="74"
                  fill="none"
                  stroke="rgba(251,248,241,.14)"
                  strokeWidth="10"
                />

                <circle
                  cx="84"
                  cy="84"
                  r="74"
                  fill="none"
                  stroke="#C9A227"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={ringOffset}
                  style={{
                    transition:
                      'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)',
                  }}
                />

              </svg>

              <div className="dh-ring-center">

                <span className="dh-ring-pct">
                  {Math.round(progress)}%
                </span>

                <span className="dh-ring-caption">
                  progression
                </span>

              </div>

            </div>


            <div className="dh-finance-amounts">

              <div className="dh-amount-row">

                <span className="dh-amount-label">
                  Total attendu
                </span>

                <span className="dh-amount-value">
                  {formatAmount(data?.totalExpected ?? 0)}
                </span>

              </div>


              <div className="dh-amount-row">

                <span className="dh-amount-label">
                  Encaissé
                </span>

                <span className="dh-amount-value gold">
                  {formatAmount(data?.totalPaid ?? 0)}
                </span>

              </div>


              <div className="dh-amount-row">

                <span className="dh-amount-label">
                  Restant
                </span>

                <span className="dh-amount-value">
                  {formatAmount(data?.totalRemaining ?? 0)}
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================
            VUE GÉNÉRALE
        ===================================== */}

        <div className="dh-panel dh-panel-light">

          <h2 className="dh-panel-title on-light">
            Vue générale
          </h2>

          <p className="dh-panel-sub">
            Informations du Dahira
          </p>


          <div className="dh-list-row">

            <span className="dh-list-label">
              Catégories
            </span>

            <span className="dh-list-value">
              {data?.totalCategories ?? 0}
            </span>

          </div>


          <div className="dh-list-row">

            <span className="dh-list-label">
              Cotisations
            </span>

            <span className="dh-list-value">
              {data?.totalContributions ?? 0}
            </span>

          </div>


          <div className="dh-list-row">

            <span className="dh-list-label">
              Cotisations actives
            </span>

            <span className="dh-list-value">
              {data?.activeContributions ?? 0}
            </span>

          </div>


          <div className="dh-list-row">

            <span className="dh-list-label">
              Membres inactifs
            </span>

            <span className="dh-list-value">
              {data?.inactiveMembers ?? 0}
            </span>

          </div>


          {/* ÉVÉNEMENTS */}

          <div className="dh-list-row">

            <span className="dh-list-label">
              Événements actifs
            </span>

            <span className="dh-list-value">
              {data?.activeEvents ?? 0}
            </span>

          </div>

        </div>

      </div>


      {/* =========================================
          CAMPAGNES ACTIVES + À RELANCER
      ========================================= */}

      <div className="dh-main-grid dh-main-grid-2">

        {/* CAMPAGNES ACTIVES */}
        <div className="dh-panel dh-panel-light">

          <div className="dh-panel-head">
            <div>
              <h2 className="dh-panel-title on-light">
                Campagnes actives
              </h2>
              <p className="dh-panel-sub">
                Progression des cotisations en cours
              </p>
            </div>

            <button
              className="dh-link-btn"
              onClick={() => navigate('/contributions')}
            >
              Voir tout
            </button>
          </div>

          {activeCampaigns.length === 0 ? (
            <p className="dh-empty-note">
              Aucune cotisation active pour le moment.
            </p>
          ) : (
            <div className="dh-campaign-list">
              {activeCampaigns.map((campaign) => (
                <div className="dh-campaign-card" key={campaign.id}>

                  <div className="dh-campaign-top">
                    <strong>{campaign.name}</strong>
                    <span>{Math.round(campaign.progress)}%</span>
                  </div>

                  <div className="dh-campaign-bar">
                    <div
                      className="dh-campaign-bar-fill"
                      style={{ width: `${campaign.progress}%` }}
                    ></div>
                  </div>

                  <div className="dh-campaign-amounts">
                    <span>{formatAmount(campaign.paid)} collecté</span>
                    <span>sur {formatAmount(campaign.expected)}</span>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* À RELANCER */}
        <div className="dh-panel dh-panel-light">

          <div className="dh-panel-head">
            <div>
              <h2 className="dh-panel-title on-light">
                À relancer
              </h2>
              <p className="dh-panel-sub">
                Plus gros restes à payer
              </p>
            </div>
          </div>

          {topUnpaid.length === 0 ? (
            <p className="dh-empty-note">
              Aucun impayé en cours, tout le monde est à jour.
            </p>
          ) : (
            <div className="dh-unpaid-list">
              {topUnpaid.map((item) => (
                <div
                  className="dh-unpaid-row"
                  key={item.memberContributionId}
                >
                  <div className="dh-unpaid-avatar">
                    {item.firstName.charAt(0).toUpperCase()}
                  </div>

                  <div className="dh-unpaid-info">
                    <strong>
                      {item.firstName} {item.lastName}
                    </strong>
                    <small>{item.contributionName}</small>
                  </div>

                  <span className="dh-unpaid-amount">
                    {formatAmount(item.remainingAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>


      {/* =========================================
          ACTIVITÉ RÉCENTE + RÉPARTITION
      ========================================= */}

      <div className="dh-main-grid dh-main-grid-2">

        {/* ACTIVITÉ RÉCENTE */}
        <div className="dh-panel dh-panel-light">

          <div className="dh-panel-head">
            <div>
              <h2 className="dh-panel-title on-light">
                Activité récente
              </h2>
              <p className="dh-panel-sub">
                Derniers paiements enregistrés
              </p>
            </div>

            <button
              className="dh-link-btn"
              onClick={() => navigate('/payments')}
            >
              Voir tout
            </button>
          </div>

          {latestPayments.length === 0 ? (
            <p className="dh-empty-note">
              Aucun paiement enregistré pour l'instant.
            </p>
          ) : (
            <div className="dh-activity-list">
              {latestPayments.map((payment) => (
                <div className="dh-activity-row" key={payment.id}>

                  <div className="dh-activity-icon">
                    <i className="bi bi-cash-coin"></i>
                  </div>

                  <div className="dh-activity-info">
                    <strong>
                      {payment.memberContribution.member.firstName}{' '}
                      {payment.memberContribution.member.lastName}
                    </strong>
                    <small>
                      {payment.memberContribution.contribution.name}
                    </small>
                  </div>

                  <div className="dh-activity-meta">
                    <span className="dh-activity-amount">
                      +{formatAmount(payment.amount)}
                    </span>
                    <small>{formatShortDate(payment.paymentDate)}</small>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* RÉPARTITION PAR CATÉGORIE */}
        <div className="dh-panel dh-panel-light">

          <div className="dh-panel-head">
            <div>
              <h2 className="dh-panel-title on-light">
                Répartition par catégorie
              </h2>
              <p className="dh-panel-sub">
                Membres par catégorie
              </p>
            </div>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="dh-empty-note">
              Aucune catégorie définie.
            </p>
          ) : (
            <div className="dh-category-list">
              {categoryBreakdown.map((category) => (
                <div className="dh-category-row" key={category.id}>

                  <div className="dh-category-top">
                    <span>{category.name}</span>
                    <strong>{category.count}</strong>
                  </div>

                  <div className="dh-category-bar">
                    <div
                      className="dh-category-bar-fill"
                      style={{ width: `${category.percent}%` }}
                    ></div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>


      {/* =========================================
          RÉSUMÉ CAISSE
      ========================================= */}

      <div className="dh-cash-summary">

        <div className="dh-cash-summary-header">

          <div>
            <h2>
              <i className="bi bi-safe2-fill"></i>
              Situation de la caisse
            </h2>

            <p>
              Vue globale des mouvements financiers
            </p>
          </div>

        </div>


        <div className="dh-cash-grid">

          {/* COTISATIONS */}

          <div className="dh-cash-item">

            <span>
              Paiements cotisations
            </span>

            <strong>
              {formatAmount(cash?.totalPayments ?? 0)}
            </strong>

          </div>


          {/* AUTRES REVENUS */}

          <div className="dh-cash-item">

            <span>
              Autres revenus
            </span>

            <strong>
              {formatAmount(cash?.totalIncomes ?? 0)}
            </strong>

          </div>


          {/* TOTAL ENTRÉES */}

          <div className="dh-cash-item">

            <span>
              Total des entrées
            </span>

            <strong>
              {formatAmount(cash?.totalEntries ?? 0)}
            </strong>

          </div>


          {/* DÉPENSES */}

          <div className="dh-cash-item">

            <span>
              Dépenses
            </span>

            <strong className="dh-cash-expense">
              - {formatAmount(cash?.totalExpenses ?? 0)}
            </strong>

          </div>


          {/* SOLDE */}

          <div className="dh-cash-item dh-cash-balance">

            <span>
              Solde disponible
            </span>

            <strong>
              {formatAmount(cash?.cashBalance ?? 0)}
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;