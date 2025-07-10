import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  AlertCircle,
  Loader2,
  CreditCard
} from 'lucide-react';
import { reservations } from '../services/adminApi';
import { reservationService } from '../../services/api';

const CreateReservationModal = ({ courts, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [courtAssignments, setCourtAssignments] = useState(null);
  
  const activeCourts = courts.filter(court => court.IsActive);
  
  const [formData, setFormData] = useState({
    playerFullName: '',
    playerPhone: '',
    playerEmail: '',
    numberOfPlayers: 2,
    courtId: activeCourts[0]?.Id || courts[0]?.Id || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    price: 60,
    isPaid: false
  });

  // Generate time slots every 90 minutes (matching backend)
  const generateTimeSlots = () => {
    const slots = [];
    for (let minutes = 0; minutes < 24 * 60; minutes += 90) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeSlot = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      slots.push(timeSlot);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (formData.date) {
      checkAvailability();
    }
  }, [formData.date, formData.courtId]);

  useEffect(() => {
    if (formData.date && formData.startTime) {
      fetchCourtAssignments();
    }
  }, [formData.date, formData.startTime]);

  const fetchCourtAssignments = async () => {
    try {
      const response = await reservationService.getCourtAssignments(formData.date, formData.startTime);
      setCourtAssignments(response);
    } catch (error) {
      console.error('Error fetching court assignments:', error);
    }
  };

  const checkAvailability = async () => {
    setCheckingAvailability(true);
    try {
      // Call the API with courtId parameter
      const url = `/reservations/available-slots?date=${formData.date}&courtId=${formData.courtId}`;
      const response = await reservationService.getAvailableSlots(formData.date, formData.courtId);
      
      // The API returns an array of available slots directly
      if (Array.isArray(response)) {
        setAvailableSlots(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAvailableSlots(response.data);
      } else {
        console.error('Unexpected response format:', response);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      // If error, show all slots as available
      setAvailableSlots(timeSlots);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const getEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 90;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const validateForm = () => {
    if (!formData.playerFullName.trim()) {
      setError('Le nom du client est requis');
      return false;
    }
    if (!formData.playerPhone.trim()) {
      setError('Le numéro de téléphone est requis');
      return false;
    }
    if (!/^[0-9]{8,}$/.test(formData.playerPhone.replace(/\s/g, ''))) {
      setError('Numéro de téléphone invalide (8 chiffres minimum)');
      return false;
    }
    if (formData.playerEmail && !/\S+@\S+\.\S+/.test(formData.playerEmail)) {
      setError('Format d\'email invalide');
      return false;
    }
    if (!formData.numberOfPlayers || formData.numberOfPlayers < 1) {
      setError('Le nombre de joueurs doit être au moins 1');
      return false;
    }
    if (!formData.startTime) {
      setError('Veuillez sélectionner une heure');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Get the selected court to find its stadium type
      const selectedCourt = courts.find(c => c.Id === parseInt(formData.courtId));
      
      const reservationData = {
        PlayerFullName: formData.playerFullName,
        PlayerPhone: formData.playerPhone,
        NumberOfPlayers: formData.numberOfPlayers,
        StadiumType: selectedCourt?.StadiumType || 'outdoor',
        CourtId: parseInt(formData.courtId),
        Date: formData.date,
        StartTime: formData.startTime,
        EndTime: getEndTime(formData.startTime),
        Price: formData.price,
        Status: formData.isPaid ? 2 : 1, // Payé ou En attente
        IsPaid: formData.isPaid,
        CreatedBy: 'Admin'
      };

      // Add email only if provided
      if (formData.playerEmail && formData.playerEmail.trim()) {
        reservationData.PlayerEmail = formData.playerEmail;
      }

      await reservations.create(reservationData);
      onSuccess();
    } catch (error) {
      console.error('Error creating reservation:', error);
      setError(error.response?.data?.message || 'Erreur lors de la création de la réservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nouvelle Réservation</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error mb-4">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-grid">
              {/* Client Information */}
              <div className="form-section">
                <h4 className="form-section-title">Informations Client</h4>
                
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Prénom Nom"
                    value={formData.playerFullName}
                    onChange={(e) => handleInputChange('playerFullName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Phone size={16} />
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="12 345 678"
                    value={formData.playerPhone}
                    onChange={(e) => handleInputChange('playerPhone', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Mail size={16} />
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@exemple.com"
                    value={formData.playerEmail}
                    onChange={(e) => handleInputChange('playerEmail', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Users size={16} />
                    Nombre de joueurs *
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={formData.numberOfPlayers}
                    onChange={(e) => handleInputChange('numberOfPlayers', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
              </div>

              {/* Reservation Details */}
              <div className="form-section">
                <h4 className="form-section-title">Détails de la Réservation</h4>

                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={16} />
                    Terrain *
                  </label>
                  <select
                    className="form-input"
                    value={formData.courtId}
                    onChange={(e) => handleInputChange('courtId', e.target.value)}
                    required
                  >
                    {activeCourts.map(court => {
                      const isOccupied = courtAssignments?.indoor?.occupied?.some(o => o.courtId === court.Id) ||
                                       courtAssignments?.outdoor?.occupied?.some(o => o.courtId === court.Id);
                      const occupiedBy = courtAssignments?.indoor?.occupied?.find(o => o.courtId === court.Id)?.playerName ||
                                       courtAssignments?.outdoor?.occupied?.find(o => o.courtId === court.Id)?.playerName;
                      
                      return (
                        <option key={court.Id} value={court.Id} disabled={isOccupied}>
                          {court.Name} ({court.StadiumType === 'indoor' ? 'Intérieur' : 'Extérieur'}) - {court.SportType || 'Padel'}
                          {isOccupied ? ` (Occupé par ${occupiedBy})` : ''}
                        </option>
                      );
                    })}
                    {courts.filter(court => !court.IsActive).map(court => (
                      <option key={court.Id} value={court.Id}>
                        {court.Name} ({court.StadiumType === 'indoor' ? 'Intérieur' : 'Extérieur'}) - {court.SportType || 'Padel'} (Inactif)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} />
                    Date *
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} />
                    Heure de début *
                  </label>
                  {checkingAvailability ? (
                    <div className="loading-slots">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Vérification des disponibilités...</span>
                    </div>
                  ) : (
                    <div className="time-slots-grid">
                      {timeSlots.map(slot => {
                        const isAvailable = availableSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            className={`time-slot ${formData.startTime === slot ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                            onClick={() => isAvailable && handleInputChange('startTime', slot)}
                            disabled={!isAvailable}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <DollarSign size={16} />
                    Prix (DT)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    min="0"
                    step="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <CreditCard size={16} />
                    Statut de paiement
                  </label>
                  <div className="payment-status-options">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="paymentStatus"
                        checked={!formData.isPaid}
                        onChange={() => handleInputChange('isPaid', false)}
                      />
                      <span className="radio-label">
                        <span className="status-indicator pending"></span>
                        En attente
                      </span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="paymentStatus"
                        checked={formData.isPaid}
                        onChange={() => handleInputChange('isPaid', true)}
                      />
                      <span className="radio-label">
                        <span className="status-indicator paid"></span>
                        Payé
                      </span>
                    </label>
                  </div>
                </div>

                {formData.startTime && (
                  <div className="reservation-summary">
                    <div className="summary-item">
                      <span>Joueurs:</span>
                      <strong>{formData.numberOfPlayers} joueurs</strong>
                    </div>
                    <div className="summary-item">
                      <span>Terrain:</span>
                      <strong>{courts.find(c => c.Id === parseInt(formData.courtId))?.Name || ''}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Durée:</span>
                      <strong>90 minutes</strong>
                    </div>
                    <div className="summary-item">
                      <span>Horaire:</span>
                      <strong>{formData.startTime} - {getEndTime(formData.startTime)}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Total:</span>
                      <strong className="text-green-600">{formData.price} DT</strong>
                    </div>
                    
                    {courtAssignments && (
                      <div className="court-status-summary">
                        <h5>Status des terrains à {formData.startTime}:</h5>
                        <div className="status-grid">
                          <div className="status-section">
                            <span className="status-title">Intérieur ({courtAssignments.indoor.available.length}/{courtAssignments.indoor.total}):</span>
                            {courtAssignments.indoor.available.length > 0 ? (
                              <span className="text-green-600">Disponible</span>
                            ) : (
                              <span className="text-red-600">Complet</span>
                            )}
                          </div>
                          <div className="status-section">
                            <span className="status-title">Extérieur ({courtAssignments.outdoor.available.length}/{courtAssignments.outdoor.total}):</span>
                            {courtAssignments.outdoor.available.length > 0 ? (
                              <span className="text-green-600">Disponible</span>
                            ) : (
                              <span className="text-red-600">Complet</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.startTime}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Création...
                </>
              ) : (
                'Créer la réservation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReservationModal;