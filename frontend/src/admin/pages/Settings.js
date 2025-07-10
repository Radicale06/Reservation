import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  Phone, 
  MapPin, 
  FileText,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Image
} from 'lucide-react';
import { company } from '../services/adminApi';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    Company: '',
    RaisonSociale: '',
    TaxIdentificationNumber: '',
    Phone: '',
    Address: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);
      const response = await company.get();
      setFormData({
        Company: response.data.Company || '',
        RaisonSociale: response.data.RaisonSociale || '',
        TaxIdentificationNumber: response.data.TaxIdentificationNumber || '',
        Phone: response.data.Phone || '',
        Address: response.data.Address || ''
      });
      
      if (response.data.Logo) {
        // Convert buffer to base64 for preview
        const base64 = btoa(
          new Uint8Array(response.data.Logo.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );
        setLogoPreview(`data:image/png;base64,${base64}`);
      }
    } catch (error) {
      console.error('Error loading company info:', error);
      setError('Erreur lors du chargement des informations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      // Update company info
      await company.update(formData);

      // Upload logo if changed
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        await company.uploadLogo(formData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving company info:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Paramètres de l'Entreprise</h1>
        <p className="admin-page-subtitle">Configurez les informations de votre entreprise</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-card">
          <div className="card-header">
            <h3>
              <Building size={20} />
              Informations Générales
            </h3>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              <CheckCircle size={16} />
              <span>Informations sauvegardées avec succès!</span>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <Building size={16} />
                Nom de l'application *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Réservation Padel"
                value={formData.Company}
                onChange={(e) => handleInputChange('Company', e.target.value)}
                required
              />
              <p className="form-hint">Ce nom apparaîtra sur toutes les pages publiques</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={16} />
                Raison sociale
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: SARL Sport Center"
                value={formData.RaisonSociale}
                onChange={(e) => handleInputChange('RaisonSociale', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={16} />
                Matricule fiscale *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: 1234567/A/M/000"
                value={formData.TaxIdentificationNumber}
                onChange={(e) => handleInputChange('TaxIdentificationNumber', e.target.value)}
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
                placeholder="Ex: +216 12 345 678"
                value={formData.Phone}
                onChange={(e) => handleInputChange('Phone', e.target.value)}
                required
              />
              <p className="form-hint">Ce numéro sera affiché aux clients</p>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <MapPin size={16} />
                Adresse complète *
              </label>
              <textarea
                className="form-input"
                placeholder="Ex: 123 Avenue Habib Bourguiba, Tunis 1000"
                value={formData.Address}
                onChange={(e) => handleInputChange('Address', e.target.value)}
                rows="3"
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <Image size={16} />
                Logo de l'entreprise
              </label>
              <div className="logo-upload-area">
                {logoPreview && (
                  <div className="logo-preview">
                    <img src={logoPreview} alt="Logo preview" />
                  </div>
                )}
                <input
                  type="file"
                  id="logo-upload"
                  className="file-input"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <label htmlFor="logo-upload" className="file-label">
                  <Image size={24} />
                  <span>Cliquez pour télécharger un logo</span>
                  <span className="file-hint">PNG, JPG, JPEG (Max. 2MB)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Sauvegarder les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;