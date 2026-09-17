import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { generateCashPdf } from '../../services/cashPdfService';
import {
  getCashSummary,
  getCashTransactions,
} from '../../services/cashService';

import {
  createIncome,
  updateIncome,
  deleteIncome,
} from '../../services/incomeService';

import {
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../services/expenseService';

import type { CashSummary, CashTransaction } from '../../types/cash';
import type { Income } from '../../types/income';
import type { Expense } from '../../types/expense';

import { ToastStack } from '../../Toast';
import { useToast } from '../../useToast';

import './Caisse.css';

const today = new Date().toISOString().split('T')[0];

type ModalType = 'income' | 'expense' | null;

function Caisse() {
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);

  const [modal, setModal] = useState<ModalType>(null);

  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ENTREE' | 'SORTIE'>('ALL');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [exportingPdf, setExportingPdf] = useState<
    'ALL' | 'INCOME' | 'EXPENSE' | null
  >(null);

  const { toasts, pushToast, dismissToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError('');

      const [summaryData, transactionData] = await Promise.all([
        getCashSummary(),
        getCashTransactions(),
      ]);

      setSummary(summaryData);
      setTransactions(transactionData);
    } catch (err) {
      console.error(err);
      setLoadError('Impossible de charger les données de la caisse.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setDate(today);
    setEditingIncome(null);
    setEditingExpense(null);
  };

  const openCreateIncome = () => {
    resetForm();
    setModal('income');
  };

  const openCreateExpense = () => {
    resetForm();
    setModal('expense');
  };

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    resetForm();
  };

  const openEdit = async (transaction: CashTransaction) => {
    try {
      if (transaction.source === 'INCOME') {
        const income = await import('../../services/incomeService')
          .then((module) => module.getIncome(transaction.id));

        setEditingIncome(income);
        setTitle(income.title);
        setDescription(income.description || '');
        setAmount(String(income.amount));
        setDate(income.incomeDate);
        setModal('income');
      }

      if (transaction.source === 'EXPENSE') {
        const expense = await import('../../services/expenseService')
          .then((module) => module.getExpense(transaction.id));

        setEditingExpense(expense);
        setTitle(expense.title);
        setDescription(expense.description || '');
        setAmount(String(expense.amount));
        setDate(expense.expenseDate);
        setModal('expense');
      }
    } catch (err) {
      console.error(err);
      pushToast('error', 'Impossible de récupérer cette transaction.');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!title.trim()) {
      pushToast('error', 'Le titre est obligatoire.');
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      pushToast('error', 'Le montant doit être supérieur à zéro.');
      return;
    }

    if (!date) {
      pushToast('error', 'La date est obligatoire.');
      return;
    }

    try {
      setSaving(true);

      if (modal === 'income') {
        const data = {
          title: title.trim(),
          description: description.trim(),
          amount: numericAmount,
          incomeDate: date,
        };

        if (editingIncome) {
          await updateIncome(editingIncome.id, data);
          pushToast('success', 'Revenu modifié avec succès.');
        } else {
          await createIncome(data);
          pushToast('success', 'Revenu ajouté avec succès.');
        }
      }

      if (modal === 'expense') {
        const data = {
          title: title.trim(),
          description: description.trim(),
          amount: numericAmount,
          expenseDate: date,
        };

        if (editingExpense) {
          await updateExpense(editingExpense.id, data);
          pushToast('success', 'Dépense modifiée avec succès.');
        } else {
          await createExpense(data);
          pushToast('success', 'Dépense ajoutée avec succès.');
        }
      }

      closeModal();
      await loadData();
    } catch (err) {
      console.error(err);
      pushToast('error', 'Une erreur est survenue lors de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (transaction: CashTransaction) => {
    const confirmed = window.confirm(
      `Voulez-vous supprimer définitivement "${transaction.title}" ?`
    );

    if (!confirmed) return;

    try {
      if (transaction.source === 'INCOME') {
        await deleteIncome(transaction.id);
      }

      if (transaction.source === 'EXPENSE') {
        await deleteExpense(transaction.id);
      }

      pushToast('success', 'Opération supprimée avec succès.');

      await loadData();
    } catch (err) {
      console.error(err);
      pushToast('error', 'Impossible de supprimer cette transaction.');
    }
  };

  const handleExportPdf = async (type: 'ALL' | 'INCOME' | 'EXPENSE') => {
    try {
      setExportingPdf(type);

      await generateCashPdf(transactions, type);

      pushToast(
        'success',
        type === 'ALL'
          ? 'Journal de caisse exporté en PDF.'
          : type === 'INCOME'
            ? 'Revenus exportés en PDF.'
            : 'Dépenses exportées en PDF.'
      );
    } catch (err) {
      console.error(err);
      pushToast('error', 'Impossible de générer le PDF.');
    } finally {
      setExportingPdf(null);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        transaction.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === 'ALL' || transaction.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  const formatAmount = (value: number) =>
    new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';

  const formatDate = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR');

  if (loading) {
    return (
      <div className="cash-page">
        <div className="cash-loading">
          <div className="spinner-border"></div>
          <p>Chargement de la caisse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cash-page">

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* HEADER */}
      <div className="cash-header">
        <div>
          <span className="cash-eyebrow">
            Gestion financière
          </span>

          <h1>Caisse</h1>

          <p>
            Suivez les entrées, les sorties et le solde réel
            de l’association.
          </p>
        </div>

        <div className="cash-actions">
          <button
            className="cash-btn cash-btn-income"
            onClick={openCreateIncome}
          >
            <i className="bi bi-plus-circle" />
            Ajouter un revenu
          </button>

          <button
            className="cash-btn cash-btn-expense"
            onClick={openCreateExpense}
          >
            <i className="bi bi-dash-circle" />
            Ajouter une dépense
          </button>
        </div>
      </div>

      {loadError && (
        <div className="cash-alert">
          <i className="bi bi-exclamation-circle" />
          {loadError}
        </div>
      )}

      {/* KPI */}
      {summary && (
        <div className="cash-kpis">

          <div className="cash-kpi cash-kpi-balance">
            <div className="cash-kpi-icon">
              <i className="bi bi-wallet2" />
            </div>

            <div>
              <span>Solde de la caisse</span>
              <strong>
                {formatAmount(summary.cashBalance)}
              </strong>
            </div>
          </div>

          <div className="cash-kpi">
            <div className="cash-kpi-icon entry">
              <i className="bi bi-arrow-down-left" />
            </div>

            <div>
              <span>Total des entrées</span>
              <strong>
                {formatAmount(summary.totalEntries)}
              </strong>
            </div>
          </div>

          <div className="cash-kpi">
            <div className="cash-kpi-icon">
              <i className="bi bi-coin" />
            </div>

            <div>
              <span>Paiements cotisations</span>
              <strong>
                {formatAmount(summary.totalPayments)}
              </strong>
            </div>
          </div>

          <div className="cash-kpi">
            <div className="cash-kpi-icon exit">
              <i className="bi bi-arrow-up-right" />
            </div>

            <div>
              <span>Total dépenses</span>
              <strong>
                {formatAmount(summary.totalExpenses)}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* RECHERCHE */}
      <div className="cash-toolbar">

        <div className="cash-search">
          <i className="bi bi-search" />

          <input
            type="text"
            placeholder="Rechercher une opération..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="cash-filters">
          <button
            className={filter === 'ALL' ? 'active' : ''}
            onClick={() => setFilter('ALL')}
          >
            Toutes
          </button>

          <button
            className={filter === 'ENTREE' ? 'active' : ''}
            onClick={() => setFilter('ENTREE')}
          >
            Entrées
          </button>

          <button
            className={filter === 'SORTIE' ? 'active' : ''}
            onClick={() => setFilter('SORTIE')}
          >
            Sorties
          </button>
        </div>
      </div>

      {/* JOURNAL */}
      <div className="cash-card">

        <div className="cash-card-header">
          <div>
            <h2>Journal de caisse</h2>
            <span>
              {filteredTransactions.length} opération(s)
            </span>
          </div>

          <div className="cash-pdf-actions">

            <button
              className="cash-pdf-btn"
              onClick={() => handleExportPdf('ALL')}
              title="Exporter tout le journal"
              disabled={exportingPdf !== null}
            >
              {exportingPdf === 'ALL' ? (
                <span className="cash-pdf-spinner"></span>
              ) : (
                <i className="bi bi-file-earmark-pdf" />
              )}
              Tout
            </button>

            <button
              className="cash-pdf-btn"
              onClick={() => handleExportPdf('INCOME')}
              title="Exporter uniquement les revenus"
              disabled={exportingPdf !== null}
            >
              {exportingPdf === 'INCOME' ? (
                <span className="cash-pdf-spinner"></span>
              ) : (
                <i className="bi bi-arrow-down-left" />
              )}
              Revenus
            </button>

            <button
              className="cash-pdf-btn"
              onClick={() => handleExportPdf('EXPENSE')}
              title="Exporter uniquement les dépenses"
              disabled={exportingPdf !== null}
            >
              {exportingPdf === 'EXPENSE' ? (
                <span className="cash-pdf-spinner"></span>
              ) : (
                <i className="bi bi-arrow-up-right" />
              )}
              Dépenses
            </button>

          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="cash-empty">
            <i className="bi bi-receipt" />
            <h3>Aucune opération</h3>
            <p>
              Les mouvements de caisse apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="cash-table-wrapper">
            <table className="cash-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Opération</th>
                  <th>Source</th>
                  <th>Montant</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={`${transaction.source}-${transaction.id}`}>

                    <td>
                      {formatDate(transaction.date)}
                    </td>

                    <td>
                      <div className="cash-operation">
                        <strong>{transaction.title}</strong>

                        {transaction.description && (
                          <small>
                            {transaction.description}
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`cash-source ${transaction.source.toLowerCase()}`}>
                        {transaction.source === 'PAYMENT'
                          ? 'Cotisation'
                          : transaction.source === 'INCOME'
                            ? 'Revenu'
                            : 'Dépense'}
                      </span>
                    </td>

                    <td>
                      <strong
                        className={
                          transaction.type === 'ENTREE'
                            ? 'cash-positive'
                            : 'cash-negative'
                        }
                      >
                        {transaction.type === 'ENTREE' ? '+' : '-'}
                        {formatAmount(transaction.amount)}
                      </strong>
                    </td>

                    <td>
                      {transaction.source === 'PAYMENT' ? (
                        <span className="cash-readonly">
                          Paiement
                        </span>
                      ) : (
                        <div className="cash-row-actions">

                          <button
                            title="Modifier"
                            onClick={() => openEdit(transaction)}
                          >
                            <i className="bi bi-pencil" />
                          </button>

                          <button
                            title="Supprimer"
                            onClick={() => handleDelete(transaction)}
                          >
                            <i className="bi bi-trash" />
                          </button>

                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="cash-modal-overlay">
          <div className="cash-modal">

            <div className={`cash-modal-header ${modal}`}>
              <div>
                <span>
                  {modal === 'income'
                    ? 'Entrée de caisse'
                    : 'Sortie de caisse'}
                </span>

                <h2>
                  {editingIncome || editingExpense
                    ? 'Modifier l’opération'
                    : modal === 'income'
                      ? 'Ajouter un revenu'
                      : 'Ajouter une dépense'}
                </h2>
              </div>

              <button
                className="cash-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="cash-form-group">
                <label>Titre</label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder={
                    modal === 'income'
                      ? 'Ex : Vente de repas'
                      : 'Ex : Achat de boissons'
                  }
                />
              </div>

              <div className="cash-form-group">
                <label>Description</label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Description facultative..."
                  rows={3}
                />
              </div>

              <div className="cash-form-row">

                <div className="cash-form-group">
                  <label>Montant (FCFA)</label>

                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="50000"
                  />
                </div>

                <div className="cash-form-group">
                  <label>Date</label>

                  <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                  />
                </div>

              </div>

              <div className="cash-modal-footer">

                <button
                  type="button"
                  className="cash-btn cash-btn-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className={
                    modal === 'income'
                      ? 'cash-btn cash-btn-income'
                      : 'cash-btn cash-btn-expense'
                  }
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Enregistrement...
                    </>
                  ) : editingIncome || editingExpense ? (
                    'Enregistrer les modifications'
                  ) : (
                    'Enregistrer'
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Caisse;