// src/components/MobileCalendar.js
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { reservationService } from "../services/api";

const MobileCalendar = ({ onTimeSlotSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDays = getWeekDays();

  useEffect(() => {
    if (selectedDate && selectedDate >= new Date().setHours(0, 0, 0, 0)) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = date.toISOString().split("T")[0];
      const slots = await reservationService.getAvailableSlots(dateStr);
      setAvailableSlots(slots);
    } catch (error) {
      setError("Erreur lors du chargement des créneaux");
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    if (date >= new Date().setHours(0, 0, 0, 0)) {
      setSelectedDate(date);
    }
  };

  const handleSlotSelect = (time) => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      onTimeSlotSelect(dateStr, time);
    }
  };

  const getEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + 90;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const getDayLabel = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === tomorrow.toDateString()) return "Demain";
    return date.toLocaleDateString("fr-FR", { weekday: "short" });
  };

  const isPastDate = (date) => {
    return date < new Date().setHours(0, 0, 0, 0);
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-7 w-7 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Choisir une date
            </h2>
          </div>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center space-x-1 hover:bg-blue-200 transition-colors"
          >
            <CalendarDays className="h-4 w-4" />
            <span>Cette semaine</span>
          </button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => {
              const prevWeek = new Date(currentWeek);
              prevWeek.setDate(currentWeek.getDate() - 7);
              setCurrentWeek(prevWeek);
            }}
            className="flex-shrink-0 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          <div className="flex space-x-1 flex-1 overflow-x-auto px-1">
            {weekDays.map((day, index) => {
              const isPast = isPastDate(day);
              const isSelected =
                selectedDate?.toDateString() === day.toDateString();
              const todayFlag = isToday(day);

              return (
                <button
                  key={index}
                  disabled={isPast}
                  onClick={() => !isPast && handleDateSelect(day)}
                  className={`flex-shrink-0 w-16 p-2 rounded-xl transition-all duration-200 touch-manipulation ${
                    isSelected
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                      : isPast
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-white shadow-md hover:shadow-lg hover:scale-102 text-gray-700"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs font-semibold opacity-80 mb-1">
                      {getDayLabel(day)}
                    </div>
                    <div className="text-lg font-bold mb-1">
                      {day.getDate()}
                    </div>
                    <div className="text-xs opacity-75">
                      {day.toLocaleDateString("fr-FR", { month: "short" })}
                    </div>
                    {todayFlag && !isSelected && (
                      <div className="w-1 h-1 bg-orange-500 rounded-full mx-auto mt-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              const nextWeek = new Date(currentWeek);
              nextWeek.setDate(currentWeek.getDate() + 7);
              setCurrentWeek(nextWeek);
            }}
            className="flex-shrink-0 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Selected Date Time Slots */}
        {selectedDate && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Créneaux disponibles
              </h3>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {selectedDate.toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-600 text-sm">
                  Chargement des créneaux...
                </p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot, index) => (
                  <button
                    key={slot}
                    onClick={() => handleSlotSelect(slot)}
                    className="group p-3 bg-gradient-to-br from-white to-blue-50 border border-gray-200 rounded-xl hover:from-blue-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-200 hover:shadow-lg hover:scale-105 touch-manipulation"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="text-center">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600 group-hover:text-white transition-colors" />
                      <div className="text-sm font-bold mb-1">
                        {slot} - {getEndTime(slot)}
                      </div>
                      <div className="text-xs opacity-75 mb-2">90 min</div>
                      <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium group-hover:bg-white group-hover:bg-opacity-20 transition-all">
                        <DollarSign className="h-3 w-3" />
                        <span>60 DT</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium mb-1">
                  Aucun créneau disponible
                </p>
                <p className="text-gray-500 text-sm">
                  Choisissez une autre date
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!selectedDate && (
          <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            <Calendar className="h-16 w-16 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Sélectionnez une date
            </h3>
            <p className="text-gray-500 text-sm">
              Touchez un jour dans le calendrier ci-dessus
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCalendar;
