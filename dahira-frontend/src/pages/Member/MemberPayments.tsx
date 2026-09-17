import { useEffect, useMemo, useState } from 'react';
import {
  getMyPayments,
  type MemberPayment,
} from '../../services/memberPortalService';
import './MemberPayments.css';

function MemberPayments() {
  const [payments, setPayments] = useState<MemberPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getMyPayments();
      setPayments(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger vos paiements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const totalPaid = useMemo(
    () =>
      payments.reduce((total, payment) => total + Number(payment.amountPaid), 0),
    [payments]
  );

  const formatAmount = (value: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) +
    ' FCFA';

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="member-loading">
        <div className="spinner-border" role="status"></div>
        <p>Chargement de vos paiements...</p>
      </div>
    );
  }

  return (
    <div className="member-payments-page">
      {/* HEADER */}
      <div className="member-page-header">
        <div>
          <span className="member-eyebrow">Espace membre</span>
          <h1>Mes paiements</h1>
          <p>Consultez l'historique de vos paiements et versements.</p>
        </div>

        <button className="member-refresh-btn" onClick={loadPayments}>
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
        <div className="member-stat-card paid">
          <div className="member-stat-icon paid">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div>
            <span>Total versé</span>
            <strong>{formatAmount(totalPaid)}</strong>
          </div>
        </div>

        <div className="member-stat-card expected">
          <div className="member-stat-icon expected">
            <i className="bi bi-receipt"></i>
          </div>
          <div>
            <span>Nombre de paiements</span>
            <strong>{payments.length}</strong>
          </div>
        </div>
      </div>

      {/* LISTE */}
      <div className="member-payments-card">
        <div className="member-card-heading">
          <div>
            <h2>Historique des paiements</h2>
            <span>
              {payments.length} paiement
              {payments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="member-empty-state">
            <i className="bi bi-cash-stack"></i>
            <h3>Aucun paiement</h3>
            <p>Vous n'avez encore enregistré aucun paiement.</p>
          </div>
        ) : (
          <div className="member-payments-list">
            {payments
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.paymentDate).getTime() -
                  new Date(a.paymentDate).getTime()
              )
              .map((payment) => (
                <div className="member-payment-item" key={payment.paymentId}>
                  <div className="member-payment-icon">
                    <i className="bi bi-cash-stack"></i>
                  </div>

                  <div className="member-payment-info">
                    <h3>{payment.contributionName}</h3>
                    <span>Paiement du {formatDate(payment.paymentDate)}</span>
                  </div>

                  <div className="member-payment-amount">
                    <strong>+{formatAmount(Number(payment.amountPaid))}</strong>
                    <span>
                      Reste : {formatAmount(Number(payment.remainingAmount))}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberPayments;