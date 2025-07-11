import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Activity,
  BarChart3
} from 'lucide-react';
import { reservations } from '../services/adminApi';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalReservations: 0,
    confirmedReservations: 0,
    paidReservations: 0,
    totalRevenue: 0,
    todayReservations: 0,
    monthlyData: [],
    statusDistribution: { pending: 0, paid: 0 },
    recentReservations: []
  });
  const [timeRange, setTimeRange] = useState('month'); // month, week, today

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get all reservations
      const allReservationsResponse = await reservations.getAll();
      const allReservations = allReservationsResponse.data || [];
      
      // Calculate current date ranges
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Filter reservations by date range
      let filteredReservations = allReservations;
      if (timeRange === 'today') {
        filteredReservations = allReservations.filter(res => 
          new Date(res.Date) >= todayStart
        );
      } else if (timeRange === 'week') {
        filteredReservations = allReservations.filter(res => 
          new Date(res.Date) >= weekStart
        );
      } else {
        filteredReservations = allReservations.filter(res => 
          new Date(res.Date) >= monthStart
        );
      }
      
      // Calculate statistics
      const totalReservations = filteredReservations.length;
      const paidReservations = filteredReservations.filter(r => r.Status === 2).length;
      const pendingReservations = filteredReservations.filter(r => r.Status === 1).length;
      const totalRevenue = filteredReservations
        .filter(r => r.Status === 2)
        .reduce((sum, r) => sum + (parseFloat(r.Price) || 0), 0);
      
      const todayReservations = allReservations.filter(res => 
        new Date(res.Date) >= todayStart
      ).length;
      
      // Get monthly data for trends (last 6 months)
      const monthlyData = await getMonthlyTrends(allReservations);
      
      // Get recent reservations
      const recentReservations = allReservations
        .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
        .slice(0, 5);
      
      setDashboardData({
        totalReservations,
        confirmedReservations: paidReservations + pendingReservations,
        paidReservations,
        totalRevenue,
        todayReservations,
        monthlyData,
        statusDistribution: { pending: pendingReservations, paid: paidReservations },
        recentReservations
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyTrends = (reservations) => {
    const now = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthReservations = reservations.filter(res => {
        const resDate = new Date(res.Date);
        return resDate >= month && resDate <= monthEnd;
      });
      
      const monthRevenue = monthReservations
        .filter(r => r.Status === 2)
        .reduce((sum, r) => sum + (parseFloat(r.Price) || 0), 0);
      
      last6Months.push({
        month: month.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        reservations: monthReservations.length,
        revenue: monthRevenue
      });
    }
    
    return last6Months;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  // Chart configurations
  const monthlyReservationsChart = {
    labels: dashboardData.monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Réservations',
        data: dashboardData.monthlyData.map(d => d.reservations),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const revenueChart = {
    labels: dashboardData.monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Revenus (TND)',
        data: dashboardData.monthlyData.map(d => d.revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const statusChart = {
    labels: ['En attente', 'Payé'],
    datasets: [
      {
        data: [dashboardData.statusDistribution.pending, dashboardData.statusDistribution.paid],
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Tableau de bord</h1>
        <p className="admin-page-subtitle">Vue d'ensemble des statistiques et performances</p>
      </div>

      {/* Time Range Filter */}
      <div className="admin-card">
        <div className="filters-row">
          <div className="filters-group">
            <label>Période d'analyse:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="filter-select"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.totalReservations}</div>
            <div className="stat-label">Total Réservations</div>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon paid">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData.paidReservations}</div>
            <div className="stat-label">Payées</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(dashboardData.totalRevenue)}</div>
            <div className="stat-label">Revenus</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="admin-card chart-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <BarChart3 size={20} />
              Évolution des réservations
            </h3>
          </div>
          <div className="chart-container">
            <Line data={monthlyReservationsChart} options={chartOptions} />
          </div>
        </div>

        <div className="admin-card chart-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <TrendingUp size={20} />
              Évolution des revenus
            </h3>
          </div>
          <div className="chart-container">
            <Bar data={revenueChart} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="charts-row">
        <div className="admin-card chart-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <Activity size={20} />
              Répartition des statuts
            </h3>
          </div>
          <div className="chart-container">
            <Doughnut data={statusChart} options={doughnutOptions} />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <Clock size={20} />
              Réservations récentes
            </h3>
          </div>
          <div className="recent-reservations">
            {dashboardData.recentReservations.map((reservation, index) => (
              <div key={reservation.Id} className="recent-reservation-item">
                <div className="reservation-info">
                  <div className="reservation-client">
                    <Users size={16} />
                    <strong>{reservation.PlayerFullName}</strong>
                  </div>
                  <div className="reservation-details">
                    <span className="reservation-date">
                      <Calendar size={14} />
                      {new Date(reservation.Date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="reservation-time">
                      <Clock size={14} />
                      {reservation.StartTime?.substring(0, 5)}
                    </span>
                  </div>
                </div>
                <div className="reservation-status">
                  <span className={`status-badge ${reservation.Status === 2 ? 'status-paid' : 'status-pending'}`}>
                    {reservation.Status === 2 ? 'Payé' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
            {dashboardData.recentReservations.length === 0 && (
              <p className="no-recent">Aucune réservation récente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;