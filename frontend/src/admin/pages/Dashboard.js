import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { reservations } from '../services/adminApi';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [recentReservations, setRecentReservations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, reservationsResponse] = await Promise.all([
        reservations.getDailyStats(selectedDate),
        reservations.getAll()
      ]);
      
      setStats(statsResponse.data);
      setRecentReservations(reservationsResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Tableau de bord</h1>
        <p className="admin-page-subtitle">Vue d'ensemble de votre activité</p>
      </div>

      {/* Date Selector */}
      <div className="admin-card">
        <div className="date-selector">
          <label htmlFor="date-select">Statistiques pour le :</label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar className="icon-primary" />
          </div>
          <div className="stat-content">
            <h3>Total Réservations</h3>
            <p className="stat-number">{stats?.totalReservations || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle className="icon-success" />
          </div>
          <div className="stat-content">
            <h3>Confirmées</h3>
            <p className="stat-number">{stats?.confirmedReservations || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign className="icon-warning" />
          </div>
          <div className="stat-content">
            <h3>Payées</h3>
            <p className="stat-number">{stats?.paidReservations || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="icon-info" />
          </div>
          <div className="stat-content">
            <h3>Revenus</h3>
            <p className="stat-number">{formatCurrency(stats?.totalRevenue || 0)}</p>
          </div>
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Réservations récentes</h2>
          <a href="/admin/reservations" className="btn btn-primary">
            Voir tout
          </a>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Terrain</th>
                <th>Statut</th>
                <th>Prix</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.map((reservation) => {
                const statusInfo = getStatusInfo(reservation.Status);
                return (
                  <tr key={reservation.Id}>
                    <td>
                      <div>
                        <strong>{reservation.PlayerFullName}</strong>
                        <br />
                        <small>{reservation.PlayerPhone}</small>
                      </div>
                    </td>
                    <td>{formatDate(reservation.Date)}</td>
                    <td>
                      {formatTime(reservation.StartTime)} - {formatTime(reservation.EndTime)}
                    </td>
                    <td>{reservation.court?.Name || 'Non assigné'}</td>
                    <td>
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>{formatCurrency(reservation.Price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {recentReservations.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <p>Aucune réservation récente</p>
          </div>
        )}
      </div>

      {/* Today's Reservations */}
      {stats?.reservations && stats.reservations.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              Réservations du {formatDate(selectedDate)}
            </h2>
          </div>

          <div className="reservations-grid">
            {stats.reservations.map((reservation) => {
              const statusInfo = getStatusInfo(reservation.Status);
              return (
                <div key={reservation.Id} className="reservation-card">
                  <div className="reservation-header">
                    <strong>{reservation.PlayerFullName}</strong>
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="reservation-details">
                    <p><Clock size={16} /> {formatTime(reservation.StartTime)} - {formatTime(reservation.EndTime)}</p>
                    <p><Users size={16} /> {reservation.PlayerPhone}</p>
                    {reservation.court && (
                      <p><Calendar size={16} /> {reservation.court.Name}</p>
                    )}
                    <p><DollarSign size={16} /> {formatCurrency(reservation.Price)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;