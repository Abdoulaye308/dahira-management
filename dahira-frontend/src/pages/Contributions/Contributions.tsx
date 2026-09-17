import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getContributions,
  createContribution,
  updateContribution,
  deleteContribution,
} from '../../services/contributionService';

import type {
  Contribution,
  ContributionRequest,
} from '../../types/contribution';
import './Contributions.css';

function Contributions() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingContribution, setEditingContribution] =
    useState<Contribution | null>(null);

  const [form, setForm] = useState<ContributionRequest>({
    name: '',
    description: '',
    targetAmount: 0,
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadContributions();
  }, []);
  

  const loadContributions = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getContributions();
      setContributions(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les cotisations.');
    } finally {
      setLoading(false);
    }
  };

 const openCreateModal = () => {
  setEditingContribution(null);

  setForm({
    name: '',
    description: '',
    targetAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ACTIVE',
  });

  setShowModal(true);
};

useEffect(() => {
  if (searchParams.get('new') === 'true') {
    openCreateModal();
    setSearchParams({});
  }
}, [searchParams, setSearchParams]);

  const openEditModal = (contribution: Contribution) => {
    setEditingContribution(contribution);

    setForm({
      name: contribution.name,
      description: contribution.description || '',
      targetAmount: contribution.targetAmount,
      startDate: contribution.startDate,
      endDate: contribution.endDate || '',
      status: contribution.status,
    });

    setShowModal(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      if (editingContribution) {
        await updateContribution(
          editingContribution.id,
          form
        );
      } else {
        await createContribution(form);
      }

      setShowModal(false);
      await loadContributions();
    } catch (err) {
      console.error(err);
      setError(
        "Une erreur est survenue lors de l'enregistrement."
      );
    }
  };

  const toggleStatus = async (contribution: Contribution) => {
    const newStatus =
      contribution.status === 'ACTIVE'
        ? 'INACTIVE'
        : 'ACTIVE';

    try {
      await updateContribution(contribution.id, {
        name: contribution.name,
        description: contribution.description,
        targetAmount: contribution.targetAmount,
        startDate: contribution.startDate,
        endDate: contribution.endDate,
        status: newStatus,
      });

      await loadContributions();
    } catch (err) {
      console.error(err);
      setError("Impossible de modifier le statut.");
    }
  };

  const handleDelete = async (contribution: Contribution) => {
    const confirmed = window.confirm(
      `Voulez-vous supprimer la cotisation "${contribution.name}" ?`
    );

    if (!confirmed) return;

    try {
      await deleteContribution(contribution.id);
      await loadContributions();
    } catch (err) {
      console.error(err);
      setError("Impossible de supprimer la cotisation.");
    }
  };

  const filteredContributions = contributions.filter(
    (contribution) => {
      const matchesSearch =
        contribution.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (contribution.description || '')
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        contribution.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  return (
    <div>

      {/* En-tête */}
      <div className="ct-hero">
        <div>
          <h1 className="ct-hero-title">Cotisations</h1>
          <p className="ct-hero-sub">
            Gérez les campagnes de cotisation et les paiements
          </p>
        </div>

        <button className="ct-btn-new" onClick={openCreateModal}>
          <i className="bi bi-plus-lg"></i>
          Nouvelle cotisation
        </button>
      </div>

      {error && <div className="ct-alert">{error}</div>}

      <div className="ct-panel">

        {/* Filtres */}
        <div className="ct-filters">
          <div className="ct-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Rechercher une cotisation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="ct-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actives</option>
            <option value="INACTIVE">Inactives</option>
          </select>
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="ct-state">
            <div className="ct-spinner" role="status"></div>
            <p>Chargement des cotisations...</p>
          </div>
        ) : filteredContributions.length === 0 ? (
          <div className="ct-state">
            <i className="bi bi-wallet2"></i>
            <h5>Aucune cotisation trouvée</h5>
            <p>Créez votre première campagne de cotisation.</p>
          </div>
        ) : (
          <div className="ct-table-wrap">
            <table className="ct-table">

              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Objectif</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredContributions.map((contribution) => (
                  <tr key={contribution.id}>

                    <td>
                      <div className="ct-name">{contribution.name}</div>
                    </td>

                    <td>
                      <span className="ct-desc">
                        {contribution.description || 'Aucune description'}
                      </span>
                    </td>

                    <td>
                      <span className="ct-amount">
                        {Number(contribution.targetAmount).toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>

                    <td>{contribution.startDate}</td>

                    <td>{contribution.endDate || '-'}</td>

                    <td>
                      <span
                        className={`ct-badge ${
                          contribution.status === 'ACTIVE'
                            ? 'ct-badge-active'
                            : 'ct-badge-inactive'
                        }`}
                      >
                        {contribution.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="ct-actions">
                      <button
                        className="ct-icon-btn"
                        title="Modifier"
                        onClick={() => openEditModal(contribution)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>

                      <Link
                        to={`/contributions/${contribution.id}`}
                        className="ct-icon-btn"
                        title="Voir les détails"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>

                      <button
                        className="ct-icon-btn"
                        title={contribution.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                        onClick={() => toggleStatus(contribution)}
                      >
                        <i
                          className={`bi ${
                            contribution.status === 'ACTIVE'
                              ? 'bi-pause-fill'
                              : 'bi-play-fill'
                          }`}
                        ></i>
                      </button>

                      <button
                        className="ct-icon-btn danger"
                        title="Supprimer"
                        onClick={() => handleDelete(contribution)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <div className="ct-modal-backdrop">
          <div className="ct-modal">

            <div className="ct-modal-header">
              <h5>{editingContribution ? 'Modifier la cotisation' : 'Nouvelle cotisation'}</h5>
              <button
                type="button"
                className="ct-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="ct-modal-body">
                <div className="ct-form-grid">

                  <div className="ct-field">
                    <label>Nom de la cotisation</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex : Cotisation Tabaski 2026"
                    />
                  </div>

                  <div className="ct-field">
                    <label>Objectif (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.targetAmount}
                      onChange={(e) =>
                        setForm({ ...form, targetAmount: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="ct-field full">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Description de la campagne..."
                    />
                  </div>

                  <div className="ct-dates-row">
                    <div className="ct-field">
                      <label>Date de début</label>
                      <input
                        type="date"
                        required
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      />
                    </div>

                    <div className="ct-field">
                      <label>Date de fin</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                </div>
              </div>

              <div className="ct-modal-footer">
                <button
                  type="button"
                  className="ct-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>

                <button type="submit" className="ct-btn-primary">
                  <i className="bi bi-check-lg"></i>
                  {editingContribution ? 'Enregistrer' : 'Créer la cotisation'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Contributions;