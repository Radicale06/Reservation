// src/App.js - Single File Version for Testing
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  Phone,
  CreditCard,
  ArrowLeft,
  User,
  Mail,
  Shield,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  MessageCircle,
} from "lucide-react";
import reservationService from "./services/api";
import MobileCalendar from "./components/Calendar";
import MobileReservationForm from "./components/MobileReservationForm";
import { useTranslation } from "react-i18next";

// WhatsApp Icon Component
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// Main App Component
function App() {
  const { t, i18n } = useTranslation();
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: "Réservation Padel",
    phone: "+216 XX XXX XXX",
    address: "",
    hasLogo: false
  });

  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    // Fetch company information
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/company/public`);
        if (response.ok) {
          const data = await response.json();
          setCompanyInfo(data);
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
      }
    };
    fetchCompanyInfo();
  }, []);

  const handleTimeSlotSelect = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowReservationForm(true);
  };

  const handleReservationComplete = () => {
    setShowReservationForm(false);
    setSelectedDate("");
    setSelectedTime("");
    setSnackbar({
      open: true,
      message: t('success.message'),
      severity: "success",
    });
  };

  const handleBack = () => {
    setShowReservationForm(false);
  };

  const handleWhatsAppClick = () => {
    // Remove all special characters from phone number
    const phoneNumber = companyInfo.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      t('whatsappMessage')
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8" />
              <h1 className="text-xl font-bold">{companyInfo.name}</h1>
            </div>

            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              <option value="fr" className="text-gray-900">
                🇫🇷 FR
              </option>
              <option value="en" className="text-gray-900">
                🇬🇧 EN
              </option>
              <option value="ar" className="text-gray-900">
                🇹🇳 AR
              </option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {!showReservationForm ? (
          <>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-90" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {t('welcome')}
                  </h2>
                  <p className="text-blue-100 text-lg">{t('subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {t('features.available24_7')}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <CalendarDays className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{t('features.duration')}</p>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{t('features.price')}</p>
                  </div>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            {/* Calendar */}
            <MobileCalendar onTimeSlotSelect={handleTimeSlotSelect} />
          </>
        ) : (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={handleBack}
                className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-shadow"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                {t('form.newReservation')}
              </h2>
            </div>

            <MobileReservationForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onComplete={handleReservationComplete}
              onCancel={handleBack}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white p-4 mt-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            <Phone className="h-4 w-4 text-blue-400" />
            <span>{companyInfo.phone}</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>{t('footer.available247')}</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <CreditCard className="h-4 w-4 text-blue-400" />
            <span>{t('footer.securePayment')}</span>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-40 flex items-center space-x-2 group"
        aria-label="Contact via WhatsApp"
      >
        <WhatsAppIcon />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-linear">
          <span className="pl-2 pr-1 whitespace-nowrap text-sm font-medium">
            {t('whatsapp')}
          </span>
        </span>
      </button>

      {/* Success Notification */}
      {snackbar.open && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{snackbar.message}</span>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
