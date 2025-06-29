import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      title: 'Réservation de Terrain de Padel',
      welcome: 'Bienvenue',
      subtitle: 'Réservez votre terrain de padel en quelques clics',
      features: {
        available24_7: 'Disponible 24h/24, 7j/7',
        duration: 'Sessions de 90 minutes',
        price: '60 DT par session'
      },
      calendar: {
        title: 'Choisissez votre créneau',
        selectDate: 'Sélectionnez une date',
        availableSlots: 'Créneaux disponibles',
        noSlots: 'Aucun créneau disponible pour cette date',
        loading: 'Chargement des créneaux...',
        today: "Aujourd'hui",
        tomorrow: 'Demain'
      },
      form: {
        title: 'Informations de réservation',
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        continue: 'Continuer',
        back: 'Retour',
        cancel: 'Annuler',
        required: 'Ce champ est requis',
        invalidEmail: 'Email invalide',
        invalidPhone: 'Numéro de téléphone invalide'
      },
      payment: {
        title: 'Paiement',
        selectMethod: 'Choisissez votre méthode de paiement',
        total: 'Total à payer',
        payNow: 'Payer maintenant',
        processing: 'Traitement en cours...',
        secure: 'Paiement 100% sécurisé'
      },
      success: {
        title: 'Réservation confirmée !',
        message: 'Votre réservation a été confirmée avec succès.',
        details: 'Détails de votre réservation'
      },
      error: {
        title: 'Erreur',
        generic: 'Une erreur est survenue. Veuillez réessayer.',
        slotTaken: 'Ce créneau a déjà été réservé.'
      }
    }
  },
  en: {
    translation: {
      title: 'Padel Court Reservation',
      welcome: 'Welcome',
      subtitle: 'Book your padel court in just a few clicks',
      features: {
        available24_7: 'Available 24/7',
        duration: '90-minute sessions',
        price: '60 DT per session'
      },
      calendar: {
        title: 'Choose your time slot',
        selectDate: 'Select a date',
        availableSlots: 'Available slots',
        noSlots: 'No slots available for this date',
        loading: 'Loading slots...',
        today: 'Today',
        tomorrow: 'Tomorrow'
      },
      form: {
        title: 'Reservation Information',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        continue: 'Continue',
        back: 'Back',
        cancel: 'Cancel',
        required: 'This field is required',
        invalidEmail: 'Invalid email',
        invalidPhone: 'Invalid phone number'
      },
      payment: {
        title: 'Payment',
        selectMethod: 'Choose your payment method',
        total: 'Total to pay',
        payNow: 'Pay now',
        processing: 'Processing...',
        secure: '100% Secure payment'
      },
      success: {
        title: 'Reservation confirmed!',
        message: 'Your reservation has been successfully confirmed.',
        details: 'Your reservation details'
      },
      error: {
        title: 'Error',
        generic: 'An error occurred. Please try again.',
        slotTaken: 'This slot has already been booked.'
      }
    }
  },
  ar: {
    translation: {
      title: 'حجز ملعب البادل',
      welcome: 'مرحباً',
      subtitle: 'احجز ملعب البادل الخاص بك ببضع نقرات',
      features: {
        available24_7: 'متاح 24/7',
        duration: 'جلسات 90 دقيقة',
        price: '60 دينار تونسي للجلسة'
      },
      calendar: {
        title: 'اختر موعدك',
        selectDate: 'اختر التاريخ',
        availableSlots: 'المواعيد المتاحة',
        noSlots: 'لا توجد مواعيد متاحة لهذا التاريخ',
        loading: 'جاري تحميل المواعيد...',
        today: 'اليوم',
        tomorrow: 'غداً'
      },
      form: {
        title: 'معلومات الحجز',
        firstName: 'الاسم الأول',
        lastName: 'اللقب',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        continue: 'متابعة',
        back: 'رجوع',
        cancel: 'إلغاء',
        required: 'هذا الحقل مطلوب',
        invalidEmail: 'بريد إلكتروني غير صالح',
        invalidPhone: 'رقم هاتف غير صالح'
      },
      payment: {
        title: 'الدفع',
        selectMethod: 'اختر طريقة الدفع',
        total: 'المجموع للدفع',
        payNow: 'ادفع الآن',
        processing: 'جاري المعالجة...',
        secure: 'دفع آمن 100%'
      },
      success: {
        title: 'تم تأكيد الحجز!',
        message: 'تم تأكيد حجزك بنجاح.',
        details: 'تفاصيل حجزك'
      },
      error: {
        title: 'خطأ',
        generic: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
        slotTaken: 'تم حجز هذا الموعد بالفعل.'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;