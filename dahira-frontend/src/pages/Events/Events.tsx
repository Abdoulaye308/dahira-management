import { useEffect, useMemo, useState } from 'react';
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from '../../services/eventService';
import type { Event, EventRequest } from '../../types/event';
import { ToastStack } from '../../Toast';
import { useToast } from '../../useToast';
import './Events.css';

function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [loadError, setLoadError] = useState('');

  const { toasts, pushToast, dismissToast } = useToast();

  const [form, setForm] = useState<EventRequest>({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setLoadError('Impossible de charger les événements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // =========================
  // STATISTIQUES
  // =========================

  const totalEvents = events.length;

  const activeEvents = events.filter(
    (event) => event.status === 'ACTIVE'
  ).length;

  const inactiveEvents = events.filter(
    (event) => event.status !== 'ACTIVE'
  ).length;

  const upcomingEvents = events.filter((event) => {
    return new Date(event.startDate) >= new Date();
  }).length;

  // =========================
  // FILTRAGE
  // =========================

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const searchLower = search.toLowerCase();

        return (
          event.title.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower)
        );
      })
      .filter((event) => {
        if (statusFilter === 'ALL') return true;
        return event.status === statusFilter;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() -
          new Date(b.startDate).getTime()
      );
  }, [events, search, statusFilter]);

  // =========================
  // FORMULAIRE
  // =========================

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
    });

    setEditingEvent(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);

    setForm({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      startDate: formatDateTimeForInput(event.startDate),
      endDate: event.endDate
        ? formatDateTimeForInput(event.endDate)
        : '',
      status: event.status,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.title.trim()) {
      pushToast('error', "Le titre de l'événement est obligatoire.");
      return;
    }

    if (!form.startDate) {
      pushToast('error', 'La date de début est obligatoire.');
      return;
    }

    if (
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      pushToast(
        'error',
        'La date de fin doit être supérieure à la date de début.'
      );
      return;
    }

    try {
      setSaving(true);

      const data: EventRequest = {
        title: form.title.trim(),
        description: form.description?.trim() || '',
        location: form.location?.trim() || '',
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        status: form.status || 'ACTIVE',
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
        pushToast('success', 'Événement modifié avec succès.');
      } else {
        await createEvent(data);
        pushToast('success', 'Événement créé avec succès.');
      }

      await loadEvents();

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Une erreur s'est produite.";

      pushToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // SUPPRESSION
  // =========================

  const handleDelete = async (event: Event) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'événement "${event.title}" ?`
    );

    if (!confirmed) return;

    try {
      await deleteEvent(event.id);
      pushToast('success', 'Événement supprimé avec succès.');
      await loadEvents();
    } catch (err) {
      console.error(err);
      pushToast('error', "Impossible de supprimer l'événement.");
    }
  };

  // =========================
  // FORMATAGE
  // =========================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTimeForInput = (date: string) => {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif';

      case 'CANCELLED':
        return 'Annulé';

      case 'COMPLETED':
        return 'Terminé';

      case 'INACTIVE':
        return 'Inactif';

      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'active';

      case 'CANCELLED':
        return 'cancelled';

      case 'COMPLETED':
        return 'completed';

      default:
        return 'inactive';
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="events-page">

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>
            <i className="bi bi-calendar-event-fill"></i>
            Événements
          </h1>

          <p>
            Gérez les activités et événements du dahira.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={openCreateModal}
        >
          <i className="bi bi-plus-lg"></i>
          Nouvel événement
        </button>
      </div>

      {/* ALERTE DE CHARGEMENT */}
      {loadError && (
        <div className="events-alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {loadError}
        </div>
      )}

      {/* KPI */}
      <div className="event-stats">

        <div className="event-stat-card">
          <div className="event-stat-icon total">
            <i className="bi bi-calendar3"></i>
          </div>

          <div>
            <span>Total événements</span>
            <strong>{totalEvents}</strong>
          </div>
        </div>

        <div className="event-stat-card">
          <div className="event-stat-icon active">
            <i className="bi bi-check-circle-fill"></i>
          </div>

          <div>
            <span>Événements actifs</span>
            <strong>{activeEvents}</strong>
          </div>
        </div>

        <div className="event-stat-card">
          <div className="event-stat-icon upcoming">
            <i className="bi bi-calendar-check"></i>
          </div>

          <div>
            <span>À venir</span>
            <strong>{upcomingEvents}</strong>
          </div>
        </div>

        <div className="event-stat-card">
          <div className="event-stat-icon inactive">
            <i className="bi bi-x-circle"></i>
          </div>

          <div>
            <span>Autres statuts</span>
            <strong>{inactiveEvents}</strong>
          </div>
        </div>

      </div>

      {/* FILTRES */}
      <div className="events-toolbar">

        <div className="search-box">
          <i className="bi bi-search"></i>

          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actifs</option>
          <option value="COMPLETED">Terminés</option>
          <option value="CANCELLED">Annulés</option>
          <option value="INACTIVE">Inactifs</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="events-card">

        {loading ? (
          <div className="events-loading">
            <div className="spinner-border"></div>
            <p>Chargement des événements...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="events-empty">
            <div className="empty-icon">
              <i className="bi bi-calendar-x"></i>
            </div>

            <h3>Aucun événement</h3>

            <p>
              {search || statusFilter !== 'ALL'
                ? 'Aucun événement ne correspond à vos critères.'
                : 'Commencez par créer votre premier événement.'}
            </p>

            {!search && statusFilter === 'ALL' && (
              <button
                className="primary-btn"
                onClick={openCreateModal}
              >
                <i className="bi bi-plus-lg"></i>
                Créer un événement
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">

            <table className="events-table">

              <thead>
                <tr>
                  <th>ÉVÉNEMENT</th>
                  <th>DATE</th>
                  <th>HORAIRE</th>
                  <th>LIEU</th>
                  <th>STATUT</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>

                    <td>
                      <div className="event-title-cell">

                        <div className="event-icon">
                          <i className="bi bi-calendar-event"></i>
                        </div>

                        <div>
                          <strong>{event.title}</strong>

                          {event.description && (
                            <small>
                              {event.description.length > 70
                                ? `${event.description.substring(
                                    0,
                                    70
                                  )}...`
                                : event.description}
                            </small>
                          )}
                        </div>

                      </div>
                    </td>

                    <td>
                      <div className="date-cell">
                        <strong>
                          {formatDate(event.startDate)}
                        </strong>

                        {event.endDate && (
                          <small>
                            au {formatDate(event.endDate)}
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="time-cell">
                        <i className="bi bi-clock"></i>

                        <span>
                          {formatTime(event.startDate)}

                          {event.endDate &&
                            ` → ${formatTime(event.endDate)}`}
                        </span>
                      </div>
                    </td>

                    <td>
                      {event.location ? (
                        <div className="location-cell">
                          <i className="bi bi-geo-alt-fill"></i>
                          <span>{event.location}</span>
                        </div>
                      ) : (
                        <span className="no-location">
                          Non précisé
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`event-status ${getStatusClass(
                          event.status
                        )}`}
                      >
                        <span className="status-dot"></span>

                        {getStatusLabel(event.status)}
                      </span>
                    </td>

                    <td>
                      <div className="event-actions">

                        <button
                          className="event-action edit"
                          title="Modifier"
                          onClick={() =>
                            openEditModal(event)
                          }
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="event-action delete"
                          title="Supprimer"
                          onClick={() =>
                            handleDelete(event)
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

      {/* MODAL */}
      {showModal && (
        <div
          className="event-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="event-modal">

            {/* MODAL HEADER */}
            <div className="event-modal-header">

              <div>
                <h2>
                  <i className="bi bi-calendar-plus"></i>

                  {editingEvent
                    ? "Modifier l'événement"
                    : 'Nouvel événement'}
                </h2>

                <p>
                  {editingEvent
                    ? 'Modifiez les informations de cet événement.'
                    : 'Ajoutez un nouvel événement au calendrier du dahira.'}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            {/* MODAL BODY */}
            <form
              className="event-form"
              onSubmit={handleSubmit}
            >

              {/* TITRE */}
              <div className="form-group">

                <label>
                  Titre <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ex : Gamou 2026"
                  maxLength={150}
                  required
                />

              </div>

              {/* DESCRIPTION */}
              <div className="form-group">

                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Décrivez l'événement..."
                  rows={4}
                  maxLength={1000}
                />

              </div>

              {/* LIEU */}
              <div className="form-group">

                <label>Lieu</label>

                <div className="input-with-icon">
                  <i className="bi bi-geo-alt"></i>

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Ex : Dakar"
                    maxLength={255}
                  />
                </div>

              </div>

              {/* DATES */}
              <div className="form-row">

                <div className="form-group">

                  <label>
                    Début <span>*</span>
                  </label>

                  <input
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label>Fin</label>

                  <input
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* STATUT */}
              <div className="form-group">

                <label>Statut</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="COMPLETED">
                    Terminé
                  </option>
                  <option value="CANCELLED">
                    Annulé
                  </option>
                  <option value="INACTIVE">
                    Inactif
                  </option>
                </select>

              </div>

              {/* FOOTER */}
              <div className="event-modal-footer">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="primary-btn"
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

                      {editingEvent
                        ? 'Enregistrer les modifications'
                        : "Créer l'événement"}
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
}

export default Events;