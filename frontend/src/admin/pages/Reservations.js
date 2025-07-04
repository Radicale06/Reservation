import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Phone,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  AlertCircle
} from 'lucide-react';
import { reservations, courts } from '../services/adminApi';
import CreateReservationModal from '../components/CreateReservationModal';

const Reservations = () => {
  const [reservationsList, setReservationsList] = useState([]);
  const [courtsList, setCourtsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [courtFilter, setCourtFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reservationsResponse, courtsResponse] = await Promise.all([
        reservations.getAll(),
        courts.getAll()
      ]);
      setReservationsList(reservationsResponse.data);
      setCourtsList(courtsResponse.data);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      1: { label: 'En attente', class: 'status-pending', icon: <Clock size={16} /> },
      2: { label: 'Confirmée', class: 'status-confirmed', icon: <CheckCircle size={16} /> },
      3: { label: 'Annulée', class: 'status-cancelled', icon: <XCircle size={16} /> },
      4: { label: 'Payée', class: 'status-paid', icon: <CheckCircle size={16} /> }
    };
    return statusMap[status] || { label: 'Inconnu', class: 'status-pending', icon: <AlertCircle size={16} /> };
  };

  const handleCancelReservation = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      try {
        await reservations.cancel(id);
        loadData();
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('Erreur lors de l\'annulation');
      }
    }
  };

  const handleConfirmPayment = async (id) => {
    const paymentId = prompt('Entrez l\'ID de paiement :');
    if (paymentId) {
      try {
        await reservations.confirmPayment(id, paymentId);
        loadData();
      } catch (error) {
        console.error('Error confirming payment:', error);
        alert('Erreur lors de la confirmation du paiement');
      }
    }
  };

  const filteredReservations = reservationsList.filter(reservation => {
    const matchesSearch = reservation.PlayerFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.PlayerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || reservation.Status.toString() === statusFilter;
    
    const matchesDate = !dateFilter || 
                       new Date(reservation.Date).toISOString().split('T')[0] === dateFilter;
    
    const matchesCourt = courtFilter === 'all' || 
                        (reservation.CourtId && reservation.CourtId.toString() === courtFilter);

    return matchesSearch && matchesStatus && matchesDate && matchesCourt;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Gestion des Réservations</h1>
        <p className="admin-page-subtitle">Gérez et suivez toutes les réservations</p>
      </div>

      {/* Filters and Actions */}
      <div className="admin-card">
        <div className="filters-row">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="1">En attente</option>
              <option value="2">Confirmée</option>
              <option value="3">Annulée</option>
              <option value="4">Payée</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-date"
            />

            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les terrains</option>
              {courtsList.map(court => (
                <option key={court.Id} value={court.Id}>{court.Name}</option>
              ))}
            </select>
          </div>

          <div className="actions-group">
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              Nouvelle réservation
            </button>
            <button className="btn btn-secondary">
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            Réservations ({filteredReservations.length})
          </h2>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date & Heure</th>
                <th>Terrain</th>
                <th>Statut</th>
                <th>Prix</th>
                <th>Créé par</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => {
                const statusInfo = getStatusInfo(reservation.Status);
                return (
                  <tr key={reservation.Id}>
                    <td>
                      <div className="client-info">
                        <div>
                          <strong>{reservation.PlayerFullName}</strong>
                        </div>
                        <div className="client-contact">
                          <Phone size={12} />
                          {reservation.PlayerPhone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="datetime-info">
                        <div className="date">
                          <Calendar size={14} />
                          {formatDate(reservation.Date)}
                        </div>
                        <div className="time">
                          <Clock size={14} />
                          {formatTime(reservation.StartTime)} - {formatTime(reservation.EndTime)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="court-info">
                        <MapPin size={14} />
                        {reservation.court?.Name || 'Non assigné'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="price-info">
                        <DollarSign size={14} />
                        {formatCurrency(reservation.Price)}
                      </div>
                    </td>
                    <td>
                      <span className="created-by">{reservation.CreatedBy}</span>
                    </td>
                    <td>
                      <div className="actions-buttons">
                        <button 
                          className="btn-icon btn-view"
                          title="Voir détails"
                          onClick={() => setSelectedReservation(reservation)}
                        >
                          <Eye size={16} />
                        </button>
                        
                        {reservation.Status === 1 && (
                          <button 
                            className="btn-icon btn-success"
                            title="Confirmer paiement"
                            onClick={() => handleConfirmPayment(reservation.Id)}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        
                        {reservation.Status !== 3 && reservation.Status !== 4 && (
                          <button 
                            className="btn-icon btn-danger"
                            title="Annuler"
                            onClick={() => handleCancelReservation(reservation.Id)}
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReservations.length === 0 && (
          <div className="empty-state">
            <Calendar size={48} />
            <p>Aucune réservation trouvée</p>
          </div>
        )}
      </div>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="modal-overlay" onClick={() => setSelectedReservation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails de la réservation</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedReservation(null)}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="reservation-details-grid">
                <div className="detail-item">
                  <label>Client</label>
                  <span>{selectedReservation.PlayerFullName}</span>
                </div>
                <div className="detail-item">
                  <label>Téléphone</label>
                  <span>{selectedReservation.PlayerPhone}</span>
                </div>
                <div className="detail-item">
                  <label>Date</label>
                  <span>{formatDate(selectedReservation.Date)}</span>
                </div>
                <div className="detail-item">
                  <label>Heure</label>
                  <span>{formatTime(selectedReservation.StartTime)} - {formatTime(selectedReservation.EndTime)}</span>
                </div>
                <div className="detail-item">
                  <label>Terrain</label>
                  <span>{selectedReservation.court?.Name || 'Non assigné'}</span>
                </div>
                <div className="detail-item">
                  <label>Prix</label>
                  <span>{formatCurrency(selectedReservation.Price)}</span>
                </div>
                <div className="detail-item">
                  <label>Statut</label>
                  <span className={`status-badge ${getStatusInfo(selectedReservation.Status).class}`}>
                    {getStatusInfo(selectedReservation.Status).label}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Payé</label>
                  <span>{selectedReservation.IsPaid ? 'Oui' : 'Non'}</span>
                </div>
                <div className="detail-item">
                  <label>Créé par</label>
                  <span>{selectedReservation.CreatedBy}</span>
                </div>
                <div className="detail-item">
                  <label>Date de création</label>
                  <span>{formatDate(selectedReservation.CreatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Reservation Modal */}
      {showCreateModal && (
        <CreateReservationModal 
          courts={courtsList}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default Reservations;