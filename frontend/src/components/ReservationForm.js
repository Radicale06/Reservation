// src/components/ReservationForm.js - Pure CSS Version
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
  CheckCircle,
} from "lucide-react";
import { reservationService } from "../services/api";

const ReservationForm = ({
  selectedDate,
  selectedTime,
  onComplete,
  onCancel,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservationId, setReservationId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    paymentMethod: "konnect",
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { label: "Informations", icon: User },
    { label: "Paiement", icon: CreditCard },
  ];

  const paymentMethods = [
    { value: "konnect", label: "Konnect", icon: "💳" },
    { value: "flouci", label: "Flouci", icon: "💰" },
  ];

  const getEndTime = (startTime) => {
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
      if (!formData.firstName.trim()) newErrors.firstName = "Prénom requis";
      if (!formData.lastName.trim()) newErrors.lastName = "Nom requis";
      if (!formData.email.trim()) {
        newErrors.email = "Email requis";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Numéro de téléphone requis";
      } else if (!/^[0-9]{8,}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
        newErrors.phoneNumber =
          "Numéro de téléphone invalide (8 chiffres minimum)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
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
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          reservationDate: selectedDate,
          startTime: selectedTime,
          endTime: getEndTime(selectedTime),
          duration: 90,
          price: 60,
        };

        const response = await reservationService.createReservation(
          reservationData
        );

        // Handle different API response formats
        const reservation = response.reservation || response.data || response;
        setReservationId(reservation.id || reservation._id);
        setSuccessMessage("Réservation créée avec succès!");
        setActiveStep(1);
      } catch (error) {
        console.error("Error creating reservation:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Erreur lors de la création de la réservation";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    if (!reservationId) {
      setError("ID de réservation manquant");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentData = {
        reservationId,
        amount: 60,
        gateway: formData.paymentMethod,
        currency: "TND",
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phoneNumber,
        },
        successUrl: `${window.location.origin}/payment/success?reservationId=${reservationId}`,
        failUrl: `${window.location.origin}/payment/failed?reservationId=${reservationId}`,
        cancelUrl: `${window.location.origin}/payment/cancelled?reservationId=${reservationId}`,
      };

      const response = await reservationService.initPayment(paymentData);

      // Handle different API response formats
      const paymentResponse = response.payment || response.data || response;

      if (
        paymentResponse.success !== false &&
        (paymentResponse.paymentUrl || paymentResponse.redirectUrl)
      ) {
        // Redirect to payment gateway
        const paymentUrl =
          paymentResponse.paymentUrl || paymentResponse.redirectUrl;
        window.location.href = paymentUrl;
      } else if (paymentResponse.success === true) {
        // Payment was processed immediately (test mode or cash payment)
        setSuccessMessage("Paiement effectué avec succès!");
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        throw new Error(
          paymentResponse.error || "Erreur lors de l'initialisation du paiement"
        );
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erreur lors du traitement du paiement";
      setError(errorMessage);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={handleBack}
          disabled={loading}
          className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-shadow disabled:opacity-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          Nouvelle Réservation
        </h1>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700 text-sm font-medium">
            {successMessage}
          </span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto">
        <div className="p-6">
          {/* Progress Stepper */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const StepIconComponent = step.icon;

                let stepClass =
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors ";
                stepClass +=
                  index <= activeStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400";

                let lineClass = "flex-1 h-0.5 mx-4 transition-colors ";
                lineClass += index < activeStep ? "bg-blue-600" : "bg-gray-200";

                return (
                  <div key={index} className="flex items-center flex-1">
                    <div className={stepClass}>
                      <StepIconComponent className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && <div className={lineClass} />}
                  </div>
                );
              })}
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900">
              {steps[activeStep].label}
            </h2>
          </div>

          {/* Reservation Summary */}
          <div className="mb-6 p-4 gradient-blue-light rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Votre réservation</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-lg text-center">
                <div className="text-xs text-gray-500 mb-1">Date</div>
                <div className="font-bold text-sm">
                  {new Date(selectedDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg text-center">
                <div className="text-xs text-gray-500 mb-1">Horaire</div>
                <div className="font-bold text-sm">
                  {selectedTime} - {getEndTime(selectedTime)}
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
              <span className="text-red-700 text-sm flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
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
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="votre@email.com"
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
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                      placeholder="12 345 678"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="text-center p-6 gradient-green rounded-xl">
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
                    {paymentMethods.map((method) => {
                      let buttonClass =
                        "p-4 border-2 rounded-xl transition-all duration-200 touch-manipulation ";
                      buttonClass +=
                        formData.paymentMethod === method.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300";

                      return (
                        <button
                          key={method.value}
                          onClick={() =>
                            handleInputChange("paymentMethod", method.value)
                          }
                          className={buttonClass}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{method.icon}</div>
                            <div className="font-semibold">{method.label}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 text-sm font-medium">
                    Paiement 100% sécurisé avec chiffrement SSL
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{activeStep === 0 ? "Annuler" : "Retour"}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-2 py-3 px-6 gradient-button text-white rounded-xl font-semibold hover:gradient-button disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : activeStep === 1 ? (
                <CreditCard className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <span>
                {loading
                  ? activeStep === 0
                    ? "Création..."
                    : "Paiement..."
                  : activeStep === 0
                  ? "Continuer"
                  : "Payer 60 DT"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
