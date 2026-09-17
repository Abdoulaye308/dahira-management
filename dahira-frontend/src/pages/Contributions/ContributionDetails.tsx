import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { getContribution } from '../../services/contributionService';
import { getMembers } from '../../services/memberService';

import {
  getByContribution,
  createMemberContribution,
  updateMemberContribution,
  deleteMemberContribution,
} from '../../services/memberContributionService';

import api from '../../services/api';

import type { Contribution } from '../../types/contribution';
import type { Member } from '../../types/member';
import type { MemberContribution } from '../../types/memberContribution';

import { ToastStack } from '../../Toast';
import { useToast } from '../../useToast';
import './ContributionDetails.css';

interface ContributionStatistics {
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalMembers: number;
  fullyPaid: number;
  partiallyPaid: number;
  unpaid: number;
}

function ContributionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const contributionId = Number(id);

  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignedMembers, setAssignedMembers] = useState<MemberContribution[]>([]);
  const [statistics, setStatistics] = useState<ContributionStatistics | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<number>(0);
  const [expectedAmount, setExpectedAmount] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  const { toasts, pushToast, dismissToast } = useToast();

  useEffect(() => {
    if (!contributionId) {
      navigate('/contributions');
      return;
    }

    loadData();
  }, [contributionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError('');

      const [contributionData, membersData, assignedData] = await Promise.all([
        getContribution(contributionId),
        getMembers(),
        getByContribution(contributionId),
      ]);

      setContribution(contributionData);
      setMembers(membersData);
      setAssignedMembers(assignedData);

      await loadStatistics();
    } catch (err) {
      console.error(err);
      setLoadError('Impossible de charger les informations de la cotisation.');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.get<ContributionStatistics>(
        `/contributions/${contributionId}/statistics`
      );
      setStatistics(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      pushToast('error', 'Veuillez sélectionner un membre.');
      return;
    }

    if (expectedAmount <= 0) {
      pushToast('error', 'Le montant attendu doit être supérieur à 0.');
      return;
    }

    const alreadyAssigned = assignedMembers.some(
      (item) => item.member.id === selectedMemberId
    );

    if (alreadyAssigned) {
      pushToast('error', 'Ce membre est déjà associé à cette cotisation.');
      return;
    }

    try {
      setSaving(true);

      await createMemberContribution({
        memberId: selectedMemberId,
        contributionId,
        expectedAmount,
      });

      setSelectedMemberId(0);
      setExpectedAmount(0);

      await loadData();
      pushToast('success', 'Membre ajouté à la cotisation.');
    } catch (err) {
      console.error(err);
      pushToast('error', "Impossible d'associer le membre à cette cotisation.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (memberContributionId: number) => {
    const memberContribution = assignedMembers.find(
      (item) => item.id === memberContributionId
    );

    if (!memberContribution) return;

    const member = memberContribution.member;

    const confirmed = window.confirm(
      `Retirer ${member.firstName} ${member.lastName} de cette cotisation ?`
    );

    if (!confirmed) return;

    try {
      await deleteMemberContribution(memberContributionId);
      await loadData();
      pushToast('success', `${member.firstName} ${member.lastName} retiré de la cotisation.`);
    } catch (err) {
      console.error(err);
      pushToast('error', "Impossible de retirer le membre de cette cotisation.");
    }
  };

  const handleUpdateMember = async (id: number) => {
    if (editAmount <= 0) {
      pushToast('error', 'Le montant attendu doit être supérieur à 0.');
      return;
    }

    try {
      setSaving(true);

      await updateMemberContribution(id, { expectedAmount: editAmount });

      setEditingId(null);
      setEditAmount(0);

      await loadData();
      pushToast('success', 'Montant attendu mis à jour.');
    } catch (err) {
      console.error(err);
      pushToast('error', 'Impossible de modifier le montant attendu.');
    } finally {
      setSaving(false);
    }
  };

  const assignedIds = new Set(assignedMembers.map((item) => item.member.id));

  const availableMembers = members.filter((member) => {
    const matchesSearch =
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      member.phone.includes(search);

    return !assignedIds.has(member.id) && member.status === 'ACTIVE' && matchesSearch;
  });

  const formatAmount = (amount: number) => Number(amount || 0).toLocaleString('fr-FR');

  if (loading) {
    return (
      <div className="cd-state">
        <div className="cd-spinner" role="status"></div>
        <p>Chargement de la cotisation...</p>
      </div>
    );
  }

  if (!contribution) {
    return <div className="cd-alert">Cotisation introuvable.</div>;
  }

  return (
    <div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* En-tête */}
      <div className="cd-hero">
        <Link to="/contributions" className="cd-back">
          <i className="bi bi-arrow-left"></i>
          Retour aux cotisations
        </Link>

        <div className="cd-hero-top">
          <div>
            <h1 className="cd-hero-title">{contribution.name}</h1>
            <p className="cd-hero-sub">
              {contribution.description || 'Détail de la campagne de cotisation'}
            </p>
          </div>

          <span
            className={`cd-badge-status ${
              contribution.status === 'ACTIVE' ? 'active' : 'inactive'
            }`}
          >
            {contribution.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {loadError && <div className="cd-alert">{loadError}</div>}

      {/* KPI */}
      <div className="cd-kpi-row">
        <div className="cd-kpi-card">
          <span className="cd-kpi-label">Objectif</span>
          <h4 className="cd-kpi-value">{formatAmount(contribution.targetAmount)} FCFA</h4>
        </div>

        <div className="cd-kpi-card">
          <span className="cd-kpi-label">Montant attendu</span>
          <h4 className="cd-kpi-value">{formatAmount(statistics?.expectedAmount || 0)} FCFA</h4>
        </div>

        <div className="cd-kpi-card">
          <span className="cd-kpi-label">Montant collecté</span>
          <h4 className="cd-kpi-value green">{formatAmount(statistics?.paidAmount || 0)} FCFA</h4>
        </div>

        <div className="cd-kpi-card">
          <span className="cd-kpi-label">Reste à collecter</span>
          <h4 className="cd-kpi-value gold">{formatAmount(statistics?.remainingAmount || 0)} FCFA</h4>
        </div>
      </div>

      {/* Répartition des paiements */}
      <div className="cd-panel" style={{ marginBottom: 24 }}>
        <div className="cd-panel-header">
          <h2 className="cd-panel-title">Situation des membres</h2>
          <span className="cd-count-badge">{statistics?.totalMembers || 0} membre(s)</span>
        </div>

        <div className="cd-status-grid">
          <div className="cd-status-tile paid">
            <div className="cd-status-label">
              <i className="bi bi-check-circle"></i> Paiement complet
            </div>
            <p className="cd-status-value">{statistics?.fullyPaid || 0}</p>
          </div>

          <div className="cd-status-tile partial">
            <div className="cd-status-label">
              <i className="bi bi-clock"></i> Paiement partiel
            </div>
            <p className="cd-status-value">{statistics?.partiallyPaid || 0}</p>
          </div>

          <div className="cd-status-tile unpaid">
            <div className="cd-status-label">
              <i className="bi bi-dash-circle"></i> Aucun paiement
            </div>
            <p className="cd-status-value">{statistics?.unpaid || 0}</p>
          </div>
        </div>
      </div>

      <div className="cd-main-grid">

        {/* Membres associés */}
        <div className="cd-panel">
          <div className="cd-panel-header">
            <div>
              <h2 className="cd-panel-title">Membres associés</h2>
              <p className="cd-panel-sub">Membres participant à cette cotisation</p>
            </div>
            <span className="cd-count-badge">{assignedMembers.length} membre(s)</span>
          </div>

          {assignedMembers.length === 0 ? (
            <div className="cd-empty">
              <i className="bi bi-people"></i>
              <h6>Aucun membre associé</h6>
              <p>Utilisez le formulaire pour ajouter des membres.</p>
            </div>
          ) : (
            <div className="cd-table-wrap">
              <table className="cd-table">
                <thead>
                  <tr>
                    <th>Membre</th>
                    <th>Téléphone</th>
                    <th>Catégorie</th>
                    <th>Montant attendu</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {assignedMembers.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="cd-name">
                          {item.member.firstName} {item.member.lastName}
                        </div>
                      </td>

                      <td>{item.member.phone}</td>
                      <td>{item.member.category.name}</td>

                      <td>
                        {editingId === item.id ? (
                          <input
                            type="number"
                            className="cd-edit-input"
                            value={editAmount}
                            onChange={(e) => setEditAmount(Number(e.target.value))}
                            min="1"
                            step="1"
                          />
                        ) : (
                          <span className="cd-amount">{formatAmount(item.expectedAmount)} FCFA</span>
                        )}
                      </td>

                      <td>
                        <div className="cd-actions">
                          {editingId === item.id ? (
                            <>
                              <button
                                className="cd-icon-btn confirm"
                                onClick={() => handleUpdateMember(item.id)}
                                disabled={saving}
                                title="Enregistrer"
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>

                              <button
                                className="cd-icon-btn"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditAmount(0);
                                }}
                                disabled={saving}
                                title="Annuler"
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="cd-icon-btn"
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditAmount(item.expectedAmount);
                                }}
                                title="Modifier le montant"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>

                              <button
                                className="cd-icon-btn danger"
                                onClick={() => handleDeleteMember(item.id)}
                                title="Retirer le membre"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ajouter un membre */}
        <div className="cd-panel">
          <h2 className="cd-panel-title">Ajouter un membre</h2>
          <p className="cd-panel-sub" style={{ marginBottom: 20 }}>
            Définissez le montant que ce membre doit verser.
          </p>

          <div className="cd-field">
            <label>Rechercher un membre</label>
            <div className="cd-search-input">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Nom ou téléphone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="cd-field">
            <label>Membre</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(Number(e.target.value))}
            >
              <option value={0}>Sélectionner un membre</option>
              {availableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName} — {member.phone}
                </option>
              ))}
            </select>
          </div>

          {availableMembers.length === 0 && (
            <p className="cd-hint">Aucun membre disponible.</p>
          )}

          <div className="cd-field">
            <label>Montant attendu</label>
            <div className="cd-amount-group">
              <input
                type="number"
                min="1"
                step="1"
                value={expectedAmount || ''}
                onChange={(e) => setExpectedAmount(Number(e.target.value))}
                placeholder="Ex : 10000"
              />
              <span className="cd-amount-suffix">FCFA</span>
            </div>
          </div>

          <button
            type="button"
            className="cd-btn-primary"
            onClick={handleAddMember}
            disabled={saving || !selectedMemberId || expectedAmount <= 0}
          >
            {saving ? (
              <>
                <span className="cd-spinner-sm"></span>
                Ajout...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus-fill"></i>
                Ajouter le membre
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ContributionDetails;