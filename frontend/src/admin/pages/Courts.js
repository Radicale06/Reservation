import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Power, 
  PowerOff, 
  Trash2, 
  Image,
  CheckCircle,
  XCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { courts } from '../services/adminApi';

const Courts = () => {
  const [courtsList, setCourtsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    Type: 'Indoor',
    IsActive: true
  });

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      setLoading(true);
      const response = await courts.getAll();
      setCourtsList(response.data);
    } catch (error) {
      console.error('Error loading courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourt = async (e) => {
    e.preventDefault();
    try {
      const courtData = {
        ...formData,
        CreatedAt: new Date().toISOString()
      };
      await courts.create(courtData);
      setShowCreateModal(false);
      setFormData({ Name: '', Description: '', Type: 'Indoor', IsActive: true });
      loadCourts();
    } catch (error) {
      console.error('Error creating court:', error);
      alert('Erreur lors de la création du terrain');
    }
  };

  const handleEditCourt = async (e) => {
    e.preventDefault();
    try {
      await courts.update(selectedCourt.Id, formData);
      setShowEditModal(false);
      setSelectedCourt(null);
      setFormData({ Name: '', Description: '', Type: 'Indoor', IsActive: true });
      loadCourts();
    } catch (error) {
      console.error('Error updating court:', error);
      alert('Erreur lors de la modification du terrain');
    }
  };

  const handleToggleActive = async (courtId) => {
    try {
      await courts.toggleActive(courtId);
      loadCourts();
    } catch (error) {
      console.error('Error toggling court status:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const openEditModal = (court) => {
    setSelectedCourt(court);
    setFormData({
      Name: court.Name,
      Description: court.Description || '',
      Type: court.Type,
      IsActive: court.IsActive
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCourt(null);
    setFormData({ Name: '', Description: '', Type: 'Indoor', IsActive: true });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des terrains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Gestion des Terrains</h1>
        <p className="admin-page-subtitle">Gérez vos terrains de padel</p>
      </div>

      {/* Actions */}
      <div className="admin-card">
        <div className="card-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            Nouveau terrain
          </button>
        </div>
      </div>

      {/* Courts Grid */}
      <div className="courts-grid">
        {courtsList.map((court) => (
          <div key={court.Id} className={`court-card ${!court.IsActive ? 'inactive' : ''}`}>
            <div className="court-header">
              <div className="court-info">
                <h3>{court.Name}</h3>
                <span className={`court-type ${court.Type.toLowerCase()}`}>
                  {court.Type}
                </span>
              </div>
              <div className="court-status">
                {court.IsActive ? (
                  <span className="status-badge status-active">
                    <CheckCircle size={16} />
                    Actif
                  </span>
                ) : (
                  <span className="status-badge status-inactive">
                    <XCircle size={16} />
                    Inactif
                  </span>
                )}
              </div>
            </div>

            {court.Description && (
              <p className="court-description">{court.Description}</p>
            )}

            <div className="court-meta">
              <div className="meta-item">
                <Calendar size={16} />
                <span>Créé le {formatDate(court.CreatedAt)}</span>
              </div>
            </div>

            <div className="court-actions">
              <button 
                className="btn-icon btn-primary"
                onClick={() => openEditModal(court)}
                title="Modifier"
              >
                <Edit size={16} />
              </button>
              
              <button 
                className={`btn-icon ${court.IsActive ? 'btn-warning' : 'btn-success'}`}
                onClick={() => handleToggleActive(court.Id)}
                title={court.IsActive ? 'Désactiver' : 'Activer'}
              >
                {court.IsActive ? <PowerOff size={16} /> : <Power size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {courtsList.length === 0 && (
        <div className="admin-card">
          <div className="empty-state">
            <MapPin size={48} />
            <p>Aucun terrain configuré</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Créer le premier terrain
            </button>
          </div>
        </div>
      )}

      {/* Create Court Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouveau terrain</h3>
              <button className="modal-close" onClick={closeModals}>
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCourt} className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Nom du terrain *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.Name}
                  onChange={(e) => setFormData({...formData, Name: e.target.value})}
                  required
                  placeholder="Ex: Terrain 01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.Description}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                  placeholder="Description du terrain (optionnel)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Type *</label>
                <select
                  id="type"
                  value={formData.Type}
                  onChange={(e) => setFormData({...formData, Type: e.target.value})}
                  required
                >
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.IsActive}
                    onChange={(e) => setFormData({...formData, IsActive: e.target.checked})}
                  />
                  <span>Terrain actif</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer le terrain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Court Modal */}
      {showEditModal && selectedCourt && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier le terrain</h3>
              <button className="modal-close" onClick={closeModals}>
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditCourt} className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-name">Nom du terrain *</label>
                <input
                  type="text"
                  id="edit-name"
                  value={formData.Name}
                  onChange={(e) => setFormData({...formData, Name: e.target.value})}
                  required
                  placeholder="Ex: Terrain 01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={formData.Description}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                  placeholder="Description du terrain (optionnel)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-type">Type *</label>
                <select
                  id="edit-type"
                  value={formData.Type}
                  onChange={(e) => setFormData({...formData, Type: e.target.value})}
                  required
                >
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.IsActive}
                    onChange={(e) => setFormData({...formData, IsActive: e.target.checked})}
                  />
                  <span>Terrain actif</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courts;