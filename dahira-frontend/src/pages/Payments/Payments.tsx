import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { generatePaymentsPdf } from '../../services/paymentPdfService';

import {
  createPayment,
  deletePayment,
  getPaymentSummary,
  getPaymentsByMemberContribution,
  updatePayment,
} from '../../services/paymentService';

import { getMembers } from '../../services/memberService';
import {
  getContributions,
  getContributionStatistics,
} from '../../services/contributionService';

import type { Payment, PaymentSummary } from '../../types/payment';
import type { Member } from '../../types/member';
import type {
  Contribution,
  ContributionStatistics,
} from '../../types/contribution';

import { ToastStack } from '../../Toast';
import { useToast } from '../../useToast';

import './Payments.css';

function Payments() {
  const [summary, setSummary] = useState<PaymentSummary[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [search, setSearch] = useState('');
  const [contributionFilter, setContributionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Statistiques de la cotisation sélectionnée
  const [contributionStats, setContributionStats] =
    useState<ContributionStatistics | null>(null);

  const [statsLoading, setStatsLoading] = useState(false);

  // Nouveau paiement
  const [selectedMemberId, setSelectedMemberId] = useState(0);
  const [selectedMemberContributionId, setSelectedMemberContributionId] =
    useState(0);

  const [memberContributions, setMemberContributions] = useState<
    PaymentSummary[]
  >([]);

  const [amount, setAmount] = useState<number>(0);

  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Modification
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDate, setEditDate] = useState('');

  // Historique
  const [historyPayments, setHistoryPayments] = useState<Payment[]>([]);
  const [historyMember, setHistoryMember] =
    useState<PaymentSummary | null>(null);

  const [loadError, setLoadError] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportContributionId, setExportContributionId] = useState('');
  const [exporting, setExporting] = useState(false);

  const { toasts, pushToast, dismissToast } = useToast();

  /* =========================
     CHARGEMENT
  ========================= */

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError('');

      const [summaryData, membersData, contributionsData] =
        await Promise.all([
          getPaymentSummary(),
          getMembers(),
          getContributions(),
        ]);

      setSummary(summaryData);
      setMembers(membersData);
      setContributions(contributionsData);
    } catch (err) {
      console.error(err);
      setLoadError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =========================
     STATISTIQUES COTISATION
  ========================= */

  useEffect(() => {
    const loadContributionStats = async () => {
      if (!contributionFilter) {
        setContributionStats(null);
        return;
      }

      try {
        setStatsLoading(true);

        const stats = await getContributionStatistics(
          Number(contributionFilter)
        );

        setContributionStats(stats);
      } catch (err) {
        console.error(err);
        setContributionStats(null);
        pushToast(
          'error',
          'Impossible de charger les statistiques de la cotisation.'
        );
      } finally {
        setStatsLoading(false);
      }
    };

    loadContributionStats();
  }, [contributionFilter]);

  /* =========================
     FILTRES
  ========================= */

  const filteredSummary = useMemo(() => {
    return summary.filter((item) => {
      const fullName =
        `${item.firstName} ${item.lastName}`.toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        fullName.includes(searchValue) ||
        item.contributionName.toLowerCase().includes(searchValue);

      const matchesContribution =
        !contributionFilter ||
        item.contributionId === Number(contributionFilter);

      const matchesStatus =
        !statusFilter || item.status === statusFilter;

      return (
        matchesSearch &&
        matchesContribution &&
        matchesStatus
      );
    });
  }, [
    summary,
    search,
    contributionFilter,
    statusFilter,
  ]);

  /* =========================
     STATISTIQUES AFFICHÉES
  ========================= */

  const totalPaid = contributionStats
    ? Number(contributionStats.paidAmount)
    : summary.reduce(
        (total, item) => total + Number(item.totalPaid),
        0
      );

  const totalExpected = contributionStats
    ? Number(contributionStats.expectedAmount)
    : summary.reduce(
        (total, item) => total + Number(item.expectedAmount),
        0
      );

  const totalRemaining = contributionStats
    ? Number(contributionStats.remainingAmount)
    : summary.reduce(
        (total, item) => total + Number(item.remainingAmount),
        0
      );

  const paidCount = contributionStats
    ? contributionStats.fullyPaid
    : summary.filter(
        (item) => item.status === 'PAYE'
      ).length;

  /* =========================
     SÉLECTION NOUVEAU PAIEMENT
  ========================= */

  const selectedMemberSummary = memberContributions.find(
    (item) =>
      item.memberContributionId ===
      selectedMemberContributionId
  );

  useEffect(() => {
    if (!selectedMemberId) {
      setMemberContributions([]);
      setSelectedMemberContributionId(0);
      return;
    }

    const data = summary.filter(
      (item) => item.memberId === selectedMemberId
    );

    setMemberContributions(data);
    setSelectedMemberContributionId(0);
  }, [selectedMemberId, summary]);

  /* =========================
     AJOUT PAIEMENT
  ========================= */

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedMemberContributionId) {
      pushToast(
        'error',
        'Veuillez sélectionner une cotisation.'
      );
      return;
    }

    if (!amount || amount <= 0) {
      pushToast(
        'error',
        'Le montant doit être supérieur à zéro.'
      );
      return;
    }

    const remaining =
      selectedMemberSummary?.remainingAmount ?? 0;

    if (amount > remaining) {
      pushToast(
        'error',
        `Le montant ne peut pas dépasser ${formatAmount(
          remaining
        )}.`
      );
      return;
    }

    try {
      setSaving(true);

      await createPayment({
        memberContributionId:
          selectedMemberContributionId,
        amount,
        paymentDate,
      });

      setShowModal(false);

      resetForm();

      pushToast(
        'success',
        'Paiement enregistré avec succès.'
      );

      await loadData();

      // Les statistiques de la cotisation doivent
      // également être actualisées.
      if (contributionFilter) {
        const stats =
          await getContributionStatistics(
            Number(contributionFilter)
          );

        setContributionStats(stats);
      }
    } catch (err: any) {
      console.error(err);

      pushToast(
        'error',
        err?.response?.data?.error ||
          'Impossible d’enregistrer le paiement.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     MODIFICATION
  ========================= */

  const openEditModal = (payment: Payment) => {
    setEditingPayment(payment);
    setEditAmount(Number(payment.amount));
    setEditDate(payment.paymentDate);
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();

    if (!editingPayment) return;

    if (!editAmount || editAmount <= 0) {
      pushToast(
        'error',
        'Le montant doit être supérieur à zéro.'
      );
      return;
    }

    try {
      setSaving(true);

      await updatePayment(editingPayment.id, {
        amount: editAmount,
        paymentDate: editDate,
      });

      setEditingPayment(null);

      pushToast(
        'success',
        'Paiement modifié avec succès.'
      );

      await loadData();

      if (historyMember) {
        const history =
          await getPaymentsByMemberContribution(
            historyMember.memberContributionId
          );

        setHistoryPayments(history);
      }

      if (contributionFilter) {
        const stats =
          await getContributionStatistics(
            Number(contributionFilter)
          );

        setContributionStats(stats);
      }
    } catch (err: any) {
      console.error(err);

      pushToast(
        'error',
        err?.response?.data?.error ||
          'Impossible de modifier le paiement.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     HISTORIQUE
  ========================= */

  const openHistory = async (
    item: PaymentSummary
  ) => {
    try {
      const history =
        await getPaymentsByMemberContribution(
          item.memberContributionId
        );

      setHistoryMember(item);
      setHistoryPayments(history);
      setShowHistory(true);
    } catch (err) {
      console.error(err);

      pushToast(
        'error',
        'Impossible de charger l’historique.'
      );
    }
  };

  /* =========================
     SUPPRESSION
  ========================= */

  const handleDelete = async (
    payment: Payment
  ) => {
    const confirmed = window.confirm(
      `Supprimer le paiement de ${formatAmount(
        payment.amount
      )} ?`
    );

    if (!confirmed) return;

    try {
      await deletePayment(payment.id);

      pushToast(
        'success',
        'Paiement supprimé avec succès.'
      );

      await loadData();

      if (historyMember) {
        const history =
          await getPaymentsByMemberContribution(
            historyMember.memberContributionId
          );

        setHistoryPayments(history);
      }

      if (contributionFilter) {
        const stats =
          await getContributionStatistics(
            Number(contributionFilter)
          );

        setContributionStats(stats);
      }
    } catch (err) {
      console.error(err);

      pushToast(
        'error',
        'Impossible de supprimer le paiement.'
      );
    }
  };

  /* =========================
     EXPORT PDF
  ========================= */

  const openExportModal = () => {
    setExportContributionId(contributionFilter || '');
    setShowExportModal(true);
  };

  const handleConfirmExport = async () => {
    const dataToExport = exportContributionId
      ? summary.filter(
          (item) => item.contributionId === Number(exportContributionId)
        )
      : summary;

    if (dataToExport.length === 0) {
      pushToast('error', 'Aucune donnée à exporter pour cette cotisation.');
      return;
    }

    const selectedContribution = exportContributionId
      ? contributions.find((c) => c.id === Number(exportContributionId))
      : undefined;

    try {
      setExporting(true);
      await generatePaymentsPdf(dataToExport, selectedContribution?.name);
      setShowExportModal(false);
    } catch (err) {
      console.error('Erreur génération PDF paiements :', err);
      pushToast('error', 'Impossible de générer le PDF.');
    } finally {
      setExporting(false);
    }
  };

  /* =========================
     RESET FORMULAIRE
  ========================= */

  const resetForm = () => {
    setSelectedMemberId(0);
    setSelectedMemberContributionId(0);
    setMemberContributions([]);
    setAmount(0);

    setPaymentDate(
      new Date().toISOString().split('T')[0]
    );
  };

  /* =========================
     FORMAT
  ========================= */

  const formatAmount = (value: number) => {
    return (
      new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0,
      }).format(value) + ' FCFA'
    );
  };

  const formatDate = (date: string) => {
    if (!date) return '-';

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString('fr-FR');
  };

  const statusLabel = (status: string) =>
    status === 'PAYE'
      ? 'Payé'
      : status === 'PARTIEL'
      ? 'Partiel'
      : 'Non payé';

  return (
    <div className="payments-page">

      <ToastStack
        toasts={toasts}
        onDismiss={dismissToast}
      />

      {/* HEADER */}
      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            Gestion financière
          </span>

          <h1>Paiements</h1>

          <p>
            Suivi des cotisations et des versements
            des membres.
          </p>
        </div>

        <div className="header-actions">

          <button
            className="btn-secondary-custom"
            onClick={openExportModal}
          >
            <i className="bi bi-file-earmark-pdf-fill"></i>
            Exporter PDF
          </button>

          <button
            className="btn-primary-custom"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg"></i>
            Nouveau paiement
          </button>

        </div>

      </div>

      {/* ALERTE */}
      {loadError && (
        <div className="alert-custom error">

          <i className="bi bi-exclamation-circle-fill"></i>

          {loadError}

          <button
            onClick={() => setLoadError('')}
          >
            ×
          </button>

        </div>
      )}

      {/* KPI */}
      <div className="payment-kpis">

        <div className="payment-kpi">

          <div className="kpi-icon green">
            <i className="bi bi-cash-stack"></i>
          </div>

          <div>
            <span>
              {contributionStats
                ? 'Collecté'
                : 'Total collecté'}
            </span>

            <strong>
              {statsLoading
                ? '...'
                : formatAmount(totalPaid)}
            </strong>
          </div>

        </div>

        <div className="payment-kpi">

          <div className="kpi-icon blue">
            <i className="bi bi-pie-chart"></i>
          </div>

          <div>
            <span>
              {contributionStats
                ? 'Attendu'
                : 'Total attendu'}
            </span>

            <strong>
              {statsLoading
                ? '...'
                : formatAmount(totalExpected)}
            </strong>
          </div>

        </div>

        <div className="payment-kpi">

          <div className="kpi-icon orange">
            <i className="bi bi-hourglass-split"></i>
          </div>

          <div>
            <span>
              {contributionStats
                ? 'Reste'
                : 'Reste à collecter'}
            </span>

            <strong>
              {statsLoading
                ? '...'
                : formatAmount(totalRemaining)}
            </strong>
          </div>

        </div>

      </div>

      {/* FILTRES */}
      <div className="filters-card">

        <div className="search-box">

          <i className="bi bi-search"></i>

          <input
            type="text"
            placeholder="Rechercher un membre ou une cotisation..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          value={contributionFilter}
          onChange={(e) =>
            setContributionFilter(e.target.value)
          }
        >
          <option value="">
            Toutes les cotisations
          </option>

          {contributions.map(
            (contribution) => (
              <option
                key={contribution.id}
                value={contribution.id}
              >
                {contribution.name}
              </option>
            )
          )}

        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">
            Tous les statuts
          </option>

          <option value="PAYE">
            Payé
          </option>

          <option value="PARTIEL">
            Partiel
          </option>

          <option value="NON_PAYE">
            Non payé
          </option>

        </select>

      </div>

      {/* INDICATEUR COTISATION */}
      {contributionStats && (
        <div className="alert-custom info">

          <i className="bi bi-bar-chart-fill"></i>

          <strong>
            {contributionStats.contributionName}
          </strong>

          <span>
            {contributionStats.totalMembers} membre
            {contributionStats.totalMembers !== 1
              ? 's'
              : ''}
            {' • '}
            {contributionStats.fullyPaid} payé
            {contributionStats.fullyPaid !== 1
              ? 's'
              : ''}
            {' • '}
            {contributionStats.partiallyPaid} partiel
            {contributionStats.partiallyPaid !== 1
              ? 's'
              : ''}
            {' • '}
            {contributionStats.unpaid} non payé
            {contributionStats.unpaid !== 1
              ? 's'
              : ''}
          </span>

        </div>
      )}

      {/* TABLEAU */}
      <div className="payments-card">

        <div className="card-heading">

          <div>

            <h2>
              Suivi des cotisations
            </h2>

            <span>
              {filteredSummary.length} membre
              {filteredSummary.length !== 1
                ? 's'
                : ''}
            </span>

          </div>

          <span className="paid-count-pill">

            <i className="bi bi-check-circle-fill"></i>

            {paidCount} entièrement payé
            {paidCount !== 1
              ? 's'
              : ''}

          </span>

        </div>

        {loading ? (

          <div className="empty-state">

            <div className="spinner-border"></div>

            <p>
              Chargement...
            </p>

          </div>

        ) : filteredSummary.length === 0 ? (

          <div className="empty-state">

            <i className="bi bi-wallet2"></i>

            <h3>
              Aucune donnée
            </h3>

            <p>
              Aucun membre ne correspond
              aux critères.
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="payments-table">

              <thead>

                <tr>
                  <th>Membre</th>
                  <th>Cotisation</th>
                  <th>Attendu</th>
                  <th>Total payé</th>
                  <th>Reste</th>
                  <th>Statut</th>

                  <th className="text-end">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredSummary.map(
                  (item) => (

                    <tr
                      key={
                        item.memberContributionId
                      }
                    >

                      <td>

                        <div className="member-cell">

                          <div className="member-avatar">

                            {item.firstName
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {item.firstName}{' '}
                              {item.lastName}
                            </strong>

                            <small>
                              {item.phone}
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="contribution-badge">
                          {item.contributionName}
                        </span>

                      </td>

                      <td>
                        {formatAmount(
                          item.expectedAmount
                        )}
                      </td>

                      <td>

                        <strong className="amount-value">

                          {formatAmount(
                            item.totalPaid
                          )}

                        </strong>

                      </td>

                      <td>

                        <strong
                          className={
                            item.remainingAmount > 0
                              ? 'remaining-value'
                              : 'paid-value'
                          }
                        >
                          {formatAmount(
                            item.remainingAmount
                          )}
                        </strong>

                      </td>

                      <td>

                        <span
                          className={`status-badge ${item.status.toLowerCase()}`}
                        >
                          {statusLabel(
                            item.status
                          )}
                        </span>

                      </td>

                      <td>

                        <div className="payment-actions">

                          <button
                            className="action-btn history"
                            title="Voir l'historique"
                            onClick={() =>
                              openHistory(item)
                            }
                          >
                            <i className="bi bi-clock-history"></i>
                          </button>

                          <button
                            className="action-btn add"
                            title="Ajouter un paiement"
                            onClick={() => {

                              setSelectedMemberId(
                                item.memberId
                              );

                              setTimeout(() => {

                                setSelectedMemberContributionId(
                                  item.memberContributionId
                                );

                              }, 0);

                              setShowModal(true);

                            }}
                          >
                            <i className="bi bi-plus-lg"></i>
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =========================
          MODAL NOUVEAU PAIEMENT
      ========================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="payment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header-custom">

              <div>

                <span>
                  Nouveau versement
                </span>

                <h2>
                  Enregistrer un paiement
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            <form onSubmit={handleCreate}>

              <div className="form-group-custom">

                <label>
                  Membre <span>*</span>
                </label>

                <select
                  value={selectedMemberId}
                  onChange={(e) =>
                    setSelectedMemberId(
                      Number(e.target.value)
                    )
                  }
                  required
                >

                  <option value={0}>
                    Sélectionner un membre
                  </option>

                  {members
                    .filter(
                      (member) =>
                        member.status ===
                        'ACTIVE'
                    )
                    .map((member) => (

                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.firstName}{' '}
                        {member.lastName}
                      </option>

                    ))}

                </select>

              </div>

              <div className="form-group-custom">

                <label>
                  Cotisation <span>*</span>
                </label>

                <select
                  value={
                    selectedMemberContributionId
                  }
                  onChange={(e) =>
                    setSelectedMemberContributionId(
                      Number(e.target.value)
                    )
                  }
                  disabled={!selectedMemberId}
                  required
                >

                  <option value={0}>
                    Sélectionner une cotisation
                  </option>

                  {memberContributions.map(
                    (item) => (

                      <option
                        key={
                          item.memberContributionId
                        }
                        value={
                          item.memberContributionId
                        }
                      >
                        {item.contributionName}
                      </option>

                    )
                  )}

                </select>

              </div>

              {selectedMemberSummary && (

                <div className="payment-summary">

                  <div>
                    <span>
                      Attendu
                    </span>

                    <strong>
                      {formatAmount(
                        selectedMemberSummary.expectedAmount
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Déjà payé
                    </span>

                    <strong>
                      {formatAmount(
                        selectedMemberSummary.totalPaid
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Reste
                    </span>

                    <strong className="remaining">
                      {formatAmount(
                        selectedMemberSummary.remainingAmount
                      )}
                    </strong>
                  </div>

                </div>

              )}

              <div className="form-group-custom">

                <label>
                  Montant <span>*</span>
                </label>

                <div className="amount-input">

                  <input
                    type="number"
                    min="1"
                    max={
                      selectedMemberSummary?.remainingAmount ||
                      undefined
                    }
                    value={amount || ''}
                    onChange={(e) =>
                      setAmount(
                        Number(e.target.value)
                      )
                    }
                    required
                  />

                  <span>
                    FCFA
                  </span>

                </div>

              </div>

              <div className="form-group-custom">

                <label>
                  Date <span>*</span>
                </label>

                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) =>
                    setPaymentDate(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn-save"
                  disabled={saving}
                >

                  {saving ? (

                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Enregistrement...
                    </>

                  ) : (

                    <>
                      <i className="bi bi-check-lg"></i>
                      Enregistrer
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          MODAL HISTORIQUE
      ========================= */}

      {showHistory && historyMember && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowHistory(false)
          }
        >

          <div
            className="payment-modal history-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header-custom">

              <div>

                <span>
                  Historique
                </span>

                <h2>
                  {historyMember.firstName}{' '}
                  {historyMember.lastName}
                </h2>

                <small>
                  {historyMember.contributionName}
                </small>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowHistory(false)
                }
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            <div className="history-summary">

              <div>

                <span>
                  Attendu
                </span>

                <strong>
                  {formatAmount(
                    historyMember.expectedAmount
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Total payé
                </span>

                <strong>
                  {formatAmount(
                    historyMember.totalPaid
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Reste
                </span>

                <strong>
                  {formatAmount(
                    historyMember.remainingAmount
                  )}
                </strong>

              </div>

            </div>

            <div className="history-list">

              {historyPayments.length === 0 ? (

                <div className="empty-state">

                  <i className="bi bi-receipt"></i>

                  <p>
                    Aucun paiement enregistré.
                  </p>

                </div>

              ) : (

                historyPayments.map(
                  (payment) => (

                    <div
                      className="history-item"
                      key={payment.id}
                    >

                      <div>

                        <strong>
                          {formatAmount(
                            payment.amount
                          )}
                        </strong>

                        <small>
                          {formatDate(
                            payment.paymentDate
                          )}
                        </small>

                      </div>

                      <div className="history-actions">

                        <button
                          className="action-btn edit"
                          title="Modifier"
                          onClick={() =>
                            openEditModal(payment)
                          }
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="action-btn delete"
                          title="Supprimer"
                          onClick={() =>
                            handleDelete(payment)
                          }
                        >
                          <i className="bi bi-trash3"></i>
                        </button>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </div>

      )}

      {/* =========================
          MODAL MODIFICATION
      ========================= */}

      {editingPayment && (

        <div
          className="modal-overlay"
          onClick={() =>
            setEditingPayment(null)
          }
        >

          <div
            className="payment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header-custom">

              <div>

                <span>
                  Modification
                </span>

                <h2>
                  Modifier le paiement
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setEditingPayment(null)
                }
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            <form onSubmit={handleUpdate}>

              <div className="form-group-custom">

                <label>
                  Montant <span>*</span>
                </label>

                <div className="amount-input">

                  <input
                    type="number"
                    min="1"
                    value={
                      editAmount || ''
                    }
                    onChange={(e) =>
                      setEditAmount(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    required
                  />

                  <span>
                    FCFA
                  </span>

                </div>

              </div>

              <div className="form-group-custom">

                <label>
                  Date <span>*</span>
                </label>

                <input
                  type="date"
                  value={editDate}
                  onChange={(e) =>
                    setEditDate(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() =>
                    setEditingPayment(null)
                  }
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn-save"
                  disabled={saving}
                >

                  {saving ? (

                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Modification...
                    </>

                  ) : (

                    <>
                      <i className="bi bi-check-lg"></i>
                      Enregistrer
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          MODAL EXPORT PDF
      ========================= */}

      {showExportModal && (
        <div
          className="modal-overlay"
          onClick={() => !exporting && setShowExportModal(false)}
        >
          <div
            className="payment-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header-custom">
              <div>
                <span>Export PDF</span>
                <h2>Choisir la cotisation</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowExportModal(false)}
                disabled={exporting}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="form-group-custom" style={{ padding: '24px 26px 6px' }}>
              <label>Cotisation à exporter</label>

              <select
                value={exportContributionId}
                onChange={(e) => setExportContributionId(e.target.value)}
              >
                <option value="">Toutes les cotisations</option>

                {contributions.map((contribution) => (
                  <option key={contribution.id} value={contribution.id}>
                    {contribution.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions" style={{ padding: '18px 26px 26px' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowExportModal(false)}
                disabled={exporting}
              >
                Annuler
              </button>

              <button
                type="button"
                className="btn-save"
                onClick={handleConfirmExport}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Génération...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-pdf-fill"></i>
                    Télécharger
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Payments;