// src/components/MobileReservationForm.js
import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Shield,
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  MapPin,
  Users,
  Home,
} from "lucide-react";
import { reservationService } from "../services/api";

const MobileReservationForm = ({
  selectedDate,
  selectedTime,
  onComplete,
  onCancel,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservationId, setReservationId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    numberOfPlayers: 2,
    stadiumType: "outdoor",
    paymentMethod: "card",
    // Card details
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { label: "Informations", icon: User },
    { label: "Paiement", icon: CreditCard },
  ];

  const paymentMethods = [
    {
      value: "card",
      label: "Carte bancaire",
      icon: "💳",
      description: "Paiement en ligne",
    },
    {
      value: "cash",
      label: "Sur place",
      icon: "💵",
      description: "Payer à l'arrivée",
    },
  ];

  const getEndTime = (startTime) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + 90;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const validateForm = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = "Requis";
      if (!formData.lastName.trim()) newErrors.lastName = "Requis";
      // Email is optional
      if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email invalide";
      }
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Requis";
      } else if (!/^[0-9]{8,}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Numéro invalide";
      }
    }

    if (step === 1 && formData.paymentMethod === "card") {
      // Validate card details
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Requis";
      } else if (!/^[0-9]{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Numéro de carte invalide";
      }

      if (!formData.cardHolder.trim()) {
        newErrors.cardHolder = "Requis";
      }

      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = "Requis";
      } else if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = "Format MM/YY";
      }

      if (!formData.cvv.trim()) {
        newErrors.cvv = "Requis";
      } else if (!/^[0-9]{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = "CVV invalide";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    // Special formatting for card number
    if (field === "cardNumber") {
      value = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (value.length > 19) return; // 16 digits + 3 spaces
    }

    // Special formatting for expiry date
    if (field === "expiryDate") {
      value = value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4);
      }
      if (value.length > 5) return;
    }

    // CVV only numbers
    if (field === "cvv") {
      value = value.replace(/\D/g, "");
      if (value.length > 4) return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNext = async () => {
    if (!validateForm(activeStep)) return;

    if (activeStep === 0) {
      setLoading(true);
      setError(null);

      try {
        const reservationData = {
          PlayerFullName: `${formData.firstName} ${formData.lastName}`,
          PlayerPhone: formData.phoneNumber,
          NumberOfPlayers: formData.numberOfPlayers,
          StadiumType: formData.stadiumType,
          Date: selectedDate,
          StartTime: selectedTime,
          Price: 60,
          Status: 1, // En attente
          CreatedBy: 'LandingPage',
          CourtId: null,
          IsPaid: false
        };
        
        if (formData.email.trim()) {
          reservationData.PlayerEmail = formData.email;
        }
        
        const reservation = await reservationService.createReservation(reservationData);

        setReservationId(reservation.Id || reservation.id);
        setActiveStep(1);
      } catch (error) {
        setError("Erreur lors de la création de la réservation");
      } finally {
        setLoading(false);
      }
    } else {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    if (!reservationId) return;

    setLoading(true);
    setError(null);

    try {
      // If payment method is cash, skip payment processing
      if (formData.paymentMethod === "cash") {
        setTimeout(() => {
          onComplete({
            paymentMethod: "cash",
            message: "Réservation confirmée. Paiement à effectuer sur place.",
          });
        }, 1000);
        return;
      }

      // For card payment
      const paymentData = {
        reservationId,
        amount: 60,
        gateway: "card",
        cardDetails: {
          number: formData.cardNumber.replace(/\s/g, ""),
          holder: formData.cardHolder,
          expiry: formData.expiryDate,
          cvv: formData.cvv,
        },
        successUrl: `${window.location.origin}/payment/success?reservationId=${reservationId}`,
        failUrl: `${window.location.origin}/payment/failed?reservationId=${reservationId}`,
      };

      const response = await reservationService.initPayment(paymentData);

      if (response.success) {
        setTimeout(() => {
          onComplete({
            paymentMethod: "card",
            message: "Paiement effectué avec succès!",
          });
        }, 1000);
      } else {
        setError("Erreur lors du paiement");
      }
    } catch (error) {
      setError("Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      onCancel();
    }
  };

  // Validate required props after hooks
  if (!selectedDate || !selectedTime) {
    console.error(
      "MobileReservationForm: selectedDate and selectedTime are required"
    );
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p>Erreur: Date et heure de réservation manquantes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto">
      <div className="p-6">
        {/* Progress Stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIconComponent = step.icon;
              return (
                <div key={index} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      index <= activeStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <StepIconComponent className="h-5 w-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-colors ${
                        index < activeStep ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900">
            {steps[activeStep].label}
          </h2>
        </div>

        {/* Reservation Summary */}
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Votre réservation</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-2 rounded-lg text-center">
              <div className="text-xs text-gray-500 mb-1">Date</div>
              <div className="font-bold text-sm">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })
                  : "-"}
              </div>
            </div>

            <div className="bg-white p-2 rounded-lg text-center">
              <div className="text-xs text-gray-500 mb-1">Horaire</div>
              <div className="font-bold text-sm">
                {selectedTime || "-"} - {getEndTime(selectedTime)}
              </div>
            </div>

            <div className="bg-white p-2 rounded-lg text-center">
              <div className="text-xs text-gray-500 mb-1">Durée</div>
              <div className="font-bold text-sm">90 min</div>
            </div>

            <div className="bg-white p-2 rounded-lg text-center">
              <div className="text-xs text-gray-500 mb-1">Prix</div>
              <div className="font-bold text-sm text-green-600">60 DT</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto hover:bg-red-100 p-1 rounded"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}

        {/* Form Content */}
        <div className="min-h-80">
          {activeStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.firstName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Votre prénom"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.lastName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Votre nom"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optionnel)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="votre@email.com (optionnel)"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.phoneNumber
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="12345678"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de joueurs *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.numberOfPlayers}
                    onChange={(e) => handleInputChange("numberOfPlayers", parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white"
                  >
                    <option value={2}>2 joueurs</option>
                    <option value={4}>4 joueurs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de terrain *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("stadiumType", "indoor")}
                    className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
                      formData.stadiumType === "indoor"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <Home className="h-6 w-6" />
                    <span className="font-medium">Intérieur</span>
                    <span className="text-xs opacity-75">Terrain couvert</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("stadiumType", "outdoor")}
                    className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
                      formData.stadiumType === "outdoor"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    <span className="font-medium">Extérieur</span>
                    <span className="text-xs opacity-75">Terrain découvert</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total à payer
                </h3>
                <div className="text-4xl font-bold text-green-600">60 DT</div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Méthode de paiement
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() =>
                        handleInputChange("paymentMethod", method.value)
                      }
                      className={`p-4 border-2 rounded-xl transition-all duration-200 touch-manipulation ${
                        formData.paymentMethod === method.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{method.icon}</div>
                        <div className="font-semibold">{method.label}</div>
                        <div className="text-xs mt-1 opacity-75">
                          {method.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Details Form */}
              {formData.paymentMethod === "card" && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-semibold text-gray-900">
                    Informations de la carte
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de carte *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          handleInputChange("cardNumber", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.cardNumber
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du titulaire *
                    </label>
                    <input
                      type="text"
                      value={formData.cardHolder}
                      onChange={(e) =>
                        handleInputChange(
                          "cardHolder",
                          e.target.value.toUpperCase()
                        )
                      }
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.cardHolder
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="JEAN DUPONT"
                    />
                    {errors.cardHolder && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.cardHolder}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date d'expiration *
                      </label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          handleInputChange("expiryDate", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.expiryDate
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="MM/YY"
                      />
                      {errors.expiryDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) =>
                          handleInputChange("cvv", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.cvv
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="123"
                      />
                      {errors.cvv && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 text-sm font-medium">
                      Paiement 100% sécurisé
                    </span>
                  </div>
                </div>
              )}

              {/* Cash Payment Info */}
              {formData.paymentMethod === "cash" && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <span className="text-orange-700 text-sm font-medium block">
                        Paiement sur place
                      </span>
                      <span className="text-orange-600 text-xs">
                        Vous paierez directement au terrain lors de votre
                        arrivée
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-blue-700 text-sm">
                      <strong>Note:</strong> Merci d'arriver 10 minutes avant
                      votre créneau pour effectuer le paiement.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{activeStep === 0 ? "Annuler" : "Retour"}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 touch-manipulation"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : activeStep === 1 ? (
              formData.paymentMethod === "cash" ? (
                <Calendar className="h-5 w-5" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
            <span>
              {loading
                ? "Traitement..."
                : activeStep === 0
                ? "Continuer"
                : formData.paymentMethod === "cash"
                ? "Confirmer la réservation"
                : "Payer 60 DT"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileReservationForm;
