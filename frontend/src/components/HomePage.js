// src/components/HomePage.js
import React from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  Phone,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import MobileCalendar from "./Calendar";
import { useTranslation } from "react-i18next";

const HomePage = ({ onTimeSlotSelect }) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8" />
              <h1 className="text-xl font-bold">{t('title')}</h1>
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
                <p className="text-sm font-medium">{t('features.available24_7')}</p>
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

        {/* Calendar Component */}
        <MobileCalendar onTimeSlotSelect={onTimeSlotSelect} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white p-4 mt-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            <Phone className="h-4 w-4 text-blue-400" />
            <span>+216 XX XXX XXX</span>
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
    </div>
  );
};

export default HomePage;
