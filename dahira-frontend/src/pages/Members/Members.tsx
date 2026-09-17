import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { generateMembersPdf } from '../../services/memberPdfService';
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} from '../../services/memberService';

import { getCategories } from '../../services/categoryService';

import type { Member, MemberRequest, Category } from '../../types/member';
import { ToastStack } from '../../Toast';
import { useToast } from '../../useToast';
import './Members.css';

function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const { toasts, pushToast, dismissToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [form, setForm] = useState<MemberRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    categoryId: 0,
    joinDate: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError('');

      const [membersData, categoriesData] = await Promise.all([
        getMembers(),
        getCategories(),
      ]);

      setMembers(membersData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
      setLoadError('Impossible de charger les membres.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingMember(null);

    setForm({
      firstName: '',
      lastName: '',
      phone: '',
      gender: '',
      categoryId: categories.length > 0 ? categories[0].id : 0,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });

    setShowModal(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);

    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      gender: member.gender,
      categoryId: member.category.id,
      joinDate: member.joinDate,
      status: member.status,
    });

    setShowModal(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      if (editingMember) {
        await updateMember(editingMember.id, form);
        pushToast('success', 'Membre modifié avec succès.');
      } else {
        await createMember(form);
        pushToast('success', 'Membre ajouté avec succès.');
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error(err);
      pushToast('error', 'Une erreur est survenue lors de l’enregistrement.');
    }
  };

  const toggleStatus = async (member: Member) => {
    const newStatus = member.status === 'ACTIVE'
      ? 'INACTIVE'
      : 'ACTIVE';

    try {
      await updateMember(member.id, {
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        gender: member.gender,
        categoryId: member.category.id,
        joinDate: member.joinDate,
        status: newStatus,
      });

      pushToast(
        'success',
        newStatus === 'ACTIVE' ? 'Membre activé.' : 'Membre désactivé.'
      );

      await loadData();
    } catch (err) {
      console.error(err);
      pushToast('error', 'Impossible de modifier le statut.');
    }
  };

  const handleDelete = async (member: Member) => {
    const confirmed = window.confirm(
      `Voulez-vous supprimer définitivement ${member.firstName} ${member.lastName} ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      await deleteMember(member.id);
      pushToast('success', 'Membre supprimé avec succès.');
      await loadData();
    } catch (err) {
      console.error(err);
      pushToast('error', 'Impossible de supprimer le membre.');
    }
  };

  const handleExportPdf = async () => {
    try {
      await generateMembersPdf(filteredMembers);
    } catch (err) {
      console.error(err);
      pushToast('error', 'Impossible de générer le PDF.');
    }
  };

  const filteredMembers = members.filter((member) => {
    const fullName =
      `${member.firstName} ${member.lastName}`.toLowerCase();

    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      member.phone.includes(search);

    const matchesStatus =
      statusFilter === 'ALL' ||
      member.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'ALL' ||
      member.category.id === Number(categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="mb-hero">
        <div>
          <h1 className="mb-hero-title">Membres</h1>
          <p className="mb-hero-sub">Gérez les membres du Dahira</p>
        </div>

        <div className="mb-hero-actions">
          <button className="mb-btn-new" onClick={openCreateModal}>
            <i className="bi bi-person-plus-fill"></i>
            Nouveau membre
          </button>

          <button
            className="mb-btn-pdf"
            onClick={handleExportPdf}
          >
            <i className="bi bi-file-earmark-pdf-fill"></i>
            Exporter PDF
          </button>
        </div>
      </div>

      {loadError && <div className="mb-alert">{loadError}</div>}

      <div className="mb-panel">

        {/* Filtres */}
        <div className="mb-filters">
          <div className="mb-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="mb-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="INACTIVE">Inactifs</option>
          </select>

          <select
            className="mb-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">Toutes les catégories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="mb-state">
            <div className="mb-spinner" role="status"></div>
            <p>Chargement des membres...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="mb-state">
            <i className="bi bi-people"></i>
            <h5>Aucun membre trouvé</h5>
            <p>Ajoutez votre premier membre.</p>
          </div>
        ) : (
          <div className="mb-table-wrap">
            <table className="mb-table">

              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Téléphone</th>
                  <th>Sexe</th>
                  <th>Catégorie</th>
                  <th>Date d'adhésion</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>

                    <td>
                      <div className="mb-name">
                        {member.firstName} {member.lastName}
                      </div>
                    </td>

                    <td>{member.phone}</td>

                    <td>{member.gender === 'M' ? 'Homme' : 'Femme'}</td>

                    <td>
                      <span className="mb-badge mb-badge-category">
                        {member.category.name}
                      </span>
                    </td>

                    <td>{member.joinDate}</td>

                    <td>
                      <span
                        className={`mb-badge ${
                          member.status === 'ACTIVE'
                            ? 'mb-badge-active'
                            : 'mb-badge-inactive'
                        }`}
                      >
                        {member.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>

                    <td>
                      <button
                        className="mb-icon-btn"
                        title="Modifier"
                        onClick={() => openEditModal(member)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>

                      <button
                        className="mb-icon-btn"
                        title={member.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                        onClick={() => toggleStatus(member)}
                      >
                        <i
                          className={`bi ${
                            member.status === 'ACTIVE'
                              ? 'bi-person-dash'
                              : 'bi-person-check'
                          }`}
                        ></i>
                      </button>

                      <button
                        className="mb-icon-btn danger"
                        title="Supprimer"
                        onClick={() => handleDelete(member)}
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
        <div className="mb-modal-backdrop">
          <div className="mb-modal">

            <div className="mb-modal-header">
              <h5>{editingMember ? 'Modifier le membre' : 'Nouveau membre'}</h5>
              <button
                type="button"
                className="mb-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="mb-modal-body">
                <div className="mb-form-grid">

                  <div className="mb-field">
                    <label>Prénom</label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                  </div>

                  <div className="mb-field">
                    <label>Nom</label>
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </div>

                  <div className="mb-field">
                    <label>Téléphone</label>
                    <input
                      type="text"
                      maxLength={9}
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div className="mb-field">
                    <label>Sexe</label>
                    <select
                      required
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    >
                      <option value="">Sélectionner</option>
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                    </select>
                  </div>

                  <div className="mb-field">
                    <label>Catégorie</label>
                    <select
                      required
                      value={form.categoryId}
                      onChange={(e) =>
                        setForm({ ...form, categoryId: Number(e.target.value) })
                      }
                    >
                      <option value={0}>Sélectionner</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-field">
                    <label>Date d'adhésion</label>
                    <input
                      type="date"
                      required
                      value={form.joinDate}
                      onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                    />
                  </div>

                </div>
              </div>

              <div className="mb-modal-footer">
                <button
                  type="button"
                  className="mb-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>

                <button type="submit" className="mb-btn-primary">
                  <i className="bi bi-check-lg"></i>
                  {editingMember ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Members;