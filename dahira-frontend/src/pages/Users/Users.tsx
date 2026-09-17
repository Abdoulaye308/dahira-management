import { useEffect, useMemo, useState } from 'react';
import {
  deleteUser,
  getUsers,
  toggleUser,
  updateUser,
  type User,
} from '../../services/userService';
import { registerMemberAccount } from '../../services/authService';
import { getMembers } from '../../services/memberService';
import type { Member } from '../../types/member';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =========================
  // CREATION COMPTE MEMBRE
  // =========================

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [createForm, setCreateForm] = useState({
    memberId: '',
    username: '',
    email: '',
    password: '',
  });

  // =========================
  // FILTRES
  // =========================

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // =========================
  // MODIFICATION
  // =========================

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: 'MEMBER' as 'ADMIN' | 'MEMBER',
  });

  const [saving, setSaving] = useState(false);

  // =========================
  // CHARGEMENT
  // =========================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersData, membersData] = await Promise.all([
        getUsers(),
        getMembers(),
      ]);

      setUsers(usersData);
      setMembers(membersData);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================
  // FILTRES
  // =========================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        user.username.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue) ||
        (user.memberName ?? '').toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === 'ALL' || user.role === roleFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && user.enabled) ||
        (statusFilter === 'INACTIVE' && !user.enabled);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // =========================
  // AJOUT COMPTE MEMBRE
  // =========================

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.memberId) {
      setError('Veuillez sélectionner un membre.');
      return;
    }

    try {
      setCreating(true);
      setError('');

      await registerMemberAccount({
        memberId: Number(createForm.memberId),
        username: createForm.username,
        email: createForm.email,
        password: createForm.password,
      });

      setShowCreateModal(false);

      setCreateForm({
        memberId: '',
        username: '',
        email: '',
        password: '',
      });

      await loadUsers();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Impossible de créer le compte membre.";

      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const closeCreateModal = () => {
    if (creating) return;

    setShowCreateModal(false);

    setCreateForm({
      memberId: '',
      username: '',
      email: '',
      password: '',
    });
  };

  // =========================
  // MODIFICATION
  // =========================

  const handleEdit = (user: User) => {
    setEditingUser(user);

    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
    });

    setError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      setSaving(true);
      setError('');

      await updateUser(editingUser.id, editForm);

      setEditingUser(null);

      await loadUsers();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Impossible de modifier l'utilisateur.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const closeEditModal = () => {
    if (saving) return;

    setEditingUser(null);

    setEditForm({
      username: '',
      email: '',
      role: 'MEMBER',
    });
  };

  // =========================
  // ACTIVATION / DESACTIVATION
  // =========================

  const handleToggle = async (user: User) => {
    const action = user.enabled ? 'désactiver' : 'activer';

    const confirmed = window.confirm(
      `Voulez-vous ${action} le compte de ${user.username} ?`
    );

    if (!confirmed) return;

    try {
      setError('');

      await toggleUser(user.id);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(`Impossible de ${action} le compte.`);
    }
  };

  // =========================
  // SUPPRESSION
  // =========================

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `Voulez-vous supprimer définitivement le compte de ${user.username} ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      setError('');

      await deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Impossible de supprimer cet utilisateur.");
    }
  };

  // =========================
  // STATISTIQUES
  // =========================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.enabled
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.enabled
  ).length;

  const memberAccounts = users.filter(
    (user) => user.role === 'MEMBER'
  ).length;

  // Membres qui n'ont pas encore de compte
  const availableMembers = members.filter(
    (member) =>
      !users.some(
        (user) => user.memberId === member.id
      )
  );

  return (
    <div className="users-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="users-header">
        <div>
          <h1>Gestion des utilisateurs</h1>

          <p>
            Gérez les comptes et les accès des utilisateurs de
            l'application.
          </p>
        </div>

        <button
          type="button"
          className="btn-add-user"
          onClick={() => {
            setError('');
            setShowCreateModal(true);
          }}
        >
          <i className="bi bi-person-plus"></i>
          Ajouter un compte membre
        </button>
      </div>

      {/* =========================
          STATISTIQUES
      ========================= */}

      <div className="users-stats">

        <div className="user-stat-card">
          <div className="user-stat-icon">
            <i className="bi bi-people"></i>
          </div>

          <div>
            <span>Total utilisateurs</span>
            <strong>{totalUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon active">
            <i className="bi bi-person-check"></i>
          </div>

          <div>
            <span>Comptes actifs</span>
            <strong>{activeUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon inactive">
            <i className="bi bi-person-x"></i>
          </div>

          <div>
            <span>Comptes désactivés</span>
            <strong>{inactiveUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon member">
            <i className="bi bi-person-badge"></i>
          </div>

          <div>
            <span>Comptes membres</span>
            <strong>{memberAccounts}</strong>
          </div>
        </div>

      </div>

      {/* =========================
          FILTRES
      ========================= */}

      <div className="users-toolbar">

        <div className="users-search">
          <i className="bi bi-search"></i>

          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">Tous les rôles</option>
          <option value="ADMIN">Administrateurs</option>
          <option value="MEMBER">Membres</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actifs</option>
          <option value="INACTIVE">Désactivés</option>
        </select>

      </div>

      {/* =========================
          ERREUR
      ========================= */}

      {error && (
        <div className="users-error">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* =========================
          TABLE
      ========================= */}

      <div className="users-card">

        <div className="users-card-header">
          <div>
            <h2>Comptes utilisateurs</h2>

            <p>
              {filteredUsers.length} utilisateur
              {filteredUsers.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {loading ? (

          <div className="users-loading">

            <div
              className="spinner-border"
              role="status"
            >
              <span className="visually-hidden">
                Chargement...
              </span>
            </div>

            <p>Chargement des utilisateurs...</p>

          </div>

        ) : filteredUsers.length === 0 ? (

          <div className="users-empty">

            <i className="bi bi-person-x"></i>

            <h3>Aucun utilisateur trouvé</h3>

            <p>
              Aucun compte ne correspond aux critères
              sélectionnés.
            </p>

          </div>

        ) : (

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Membre associé</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr key={user.id}>

                    <td>
                      <div className="user-info">

                        <div className="user-avatar">
                          {user.username
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {user.username}
                          </strong>

                          <span>
                            ID #{user.id}
                          </span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="user-email">
                        {user.email}
                      </span>
                    </td>

                    <td>

                      {user.memberName ? (

                        <div className="linked-member">
                          <i className="bi bi-person"></i>
                          {user.memberName}
                        </div>

                      ) : (

                        <span className="not-linked">
                          Non associé
                        </span>

                      )}

                    </td>

                    <td>

                      <span
                        className={`user-role ${user.role.toLowerCase()}`}
                      >
                        {user.role === 'ADMIN'
                          ? 'Administrateur'
                          : 'Membre'}
                      </span>

                    </td>

                    <td>

                      <span
                        className={`user-status ${
                          user.enabled
                            ? 'active'
                            : 'inactive'
                        }`}
                      >

                        <span className="status-dot"></span>

                        {user.enabled
                          ? 'Actif'
                          : 'Désactivé'}

                      </span>

                    </td>

                    <td>

                      <div className="user-actions">

                        <button
                          type="button"
                          className="user-action-btn edit"
                          title="Modifier"
                          onClick={() =>
                            handleEdit(user)
                          }
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className={`user-action-btn ${
                            user.enabled
                              ? 'warning'
                              : 'success'
                          }`}
                          title={
                            user.enabled
                              ? 'Désactiver'
                              : 'Activer'
                          }
                          onClick={() =>
                            handleToggle(user)
                          }
                        >
                          <i
                            className={
                              user.enabled
                                ? 'bi bi-person-dash'
                                : 'bi bi-person-check'
                            }
                          ></i>
                        </button>

                        <button
                          type="button"
                          className="user-action-btn danger"
                          title="Supprimer"
                          onClick={() =>
                            handleDelete(user)
                          }
                        >
                          <i className="bi bi-trash3"></i>
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          MODAL : AJOUTER UN COMPTE MEMBRE
      ===================================================== */}

      {showCreateModal && (

        <div
          className="user-modal-overlay"
          onClick={closeCreateModal}
        >

          <div
            className="user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="user-modal-header">

              <div>
                <h2>
                  Ajouter un compte membre
                </h2>

                <p>
                  Créez un accès à l'espace membre
                  pour un membre existant.
                </p>
              </div>

              <button
                type="button"
                className="user-modal-close"
                onClick={closeCreateModal}
                disabled={creating}
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            <form onSubmit={handleCreateAccount}>

              {/* MEMBRE */}

              <div className="user-form-group">

                <label htmlFor="create-member">
                  Membre
                </label>

                <select
                  id="create-member"
                  value={createForm.memberId}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      memberId: e.target.value,
                    })
                  }
                  required
                >

                  <option value="">
                    Sélectionner un membre
                  </option>

                  {availableMembers.map((member) => (

                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.firstName}{' '}
                      {member.lastName}
                    </option>

                  ))}

                </select>

                {availableMembers.length === 0 && (
                  <small>
                    Tous les membres possèdent déjà
                    un compte.
                  </small>
                )}

              </div>

              {/* USERNAME */}

              <div className="user-form-group">

                <label htmlFor="create-username">
                  Nom d'utilisateur
                </label>

                <input
                  id="create-username"
                  type="text"
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      username: e.target.value,
                    })
                  }
                  placeholder="Ex : fall.sene"
                  minLength={3}
                  required
                />

              </div>

              {/* EMAIL */}

              <div className="user-form-group">

                <label htmlFor="create-email">
                  Email
                </label>

                <input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="Ex : membre@email.com"
                  required
                />

              </div>

              {/* MOT DE PASSE */}

              <div className="user-form-group">

                <label htmlFor="create-password">
                  Mot de passe
                </label>

                <input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      password: e.target.value,
                    })
                  }
                  placeholder="Minimum 6 caractères"
                  minLength={6}
                  required
                />

              </div>

              {/* INFORMATION */}

              <div className="user-linked-info">

                <i className="bi bi-shield-check"></i>

                <div>

                  <strong>
                    Accès membre
                  </strong>

                  <span>
                    Ce compte sera automatiquement
                    créé avec le rôle{' '}
                    <strong>MEMBER</strong>.
                  </span>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="user-modal-actions">

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeCreateModal}
                  disabled={creating}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn-save"
                  disabled={
                    creating ||
                    availableMembers.length === 0
                  }
                >

                  {creating ? (

                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      ></span>

                      Création...
                    </>

                  ) : (

                    <>
                      <i className="bi bi-person-plus"></i>
                      Créer le compte
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          MODAL : MODIFIER UTILISATEUR
      ===================================================== */}

      {editingUser && (

        <div
          className="user-modal-overlay"
          onClick={closeEditModal}
        >

          <div
            className="user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="user-modal-header">

              <div>
                <h2>
                  Modifier l'utilisateur
                </h2>

                <p>
                  Modifiez les informations du compte.
                </p>
              </div>

              <button
                type="button"
                className="user-modal-close"
                onClick={closeEditModal}
                disabled={saving}
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            <form onSubmit={handleUpdate}>

              {/* USERNAME */}

              <div className="user-form-group">

                <label htmlFor="username">
                  Nom d'utilisateur
                </label>

                <input
                  id="username"
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      username: e.target.value,
                    })
                  }
                  required
                  minLength={3}
                />

              </div>

              {/* EMAIL */}

              <div className="user-form-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      email: e.target.value,
                    })
                  }
                  required
                />

              </div>

              {/* ROLE */}

              <div className="user-form-group">

                <label htmlFor="role">
                  Rôle
                </label>

                <select
                  id="role"
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      role:
                        e.target.value as
                          | 'ADMIN'
                          | 'MEMBER',
                    })
                  }
                >

                  <option value="MEMBER">
                    Membre
                  </option>

                  <option value="ADMIN">
                    Administrateur
                  </option>

                </select>

              </div>

              {/* MEMBRE ASSOCIE */}

              {editingUser.memberName && (

                <div className="user-linked-info">

                  <i className="bi bi-person-check"></i>

                  <div>

                    <strong>
                      Membre associé
                    </strong>

                    <span>
                      {editingUser.memberName}
                    </span>

                  </div>

                </div>

              )}

              {/* ACTIONS */}

              <div className="user-modal-actions">

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeEditModal}
                  disabled={saving}
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
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      ></span>

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

    </div>
  );
};

export default Users;