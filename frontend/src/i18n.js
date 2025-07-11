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
        selectDateTitle: 'Choisir une date',
        thisWeek: 'Cette semaine',
        availableSlots: 'Créneaux disponibles',
        noSlots: 'Aucun créneau disponible',
        chooseOtherDate: 'Choisissez une autre date',
        touchCalendar: 'Touchez un jour dans le calendrier ci-dessus',
        loading: 'Chargement des créneaux...',
        loadingError: 'Erreur lors du chargement des créneaux',
        retry: 'Réessayer',
        today: "Aujourd'hui",
        tomorrow: 'Demain',
        minutes: 'min'
      },
      form: {
        title: 'Informations de réservation',
        newReservation: 'Nouvelle Réservation',
        yourReservation: 'Votre réservation',
        personalInfo: 'Informations',
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        date: 'Date',
        time: 'Horaire',
        duration: 'Durée',
        price: 'Prix',
        firstNamePlaceholder: 'Votre prénom',
        lastNamePlaceholder: 'Votre nom',
        emailPlaceholder: 'votre@email.com',
        phonePlaceholder: '12 345 678',
        continue: 'Continuer',
        back: 'Retour',
        cancel: 'Annuler',
        required: 'Ce champ est requis',
        firstNameRequired: 'Prénom requis',
        lastNameRequired: 'Nom requis',
        emailRequired: 'Email requis',
        phoneRequired: 'Numéro de téléphone requis',
        invalidEmail: 'Format d\'email invalide',
        invalidPhone: 'Numéro de téléphone invalide (8 chiffres minimum)',
        creating: 'Création...',
        reservationCreated: 'Réservation créée avec succès!',
        reservationError: 'Erreur lors de la création de la réservation',
        numberOfPlayers: 'Nombre de joueurs',
        numberOfPlayersPlaceholder: 'Nombre de joueurs',
        stadiumType: 'Type de terrain',
        indoor: 'Intérieur',
        outdoor: 'Extérieur',
        available: 'disponible(s)',
        checking: 'Vérification...',
        unavailable: 'Complet',
        noStadiumAvailable: 'Aucun terrain disponible pour ce créneau. Veuillez choisir un autre horaire.'
      },
      payment: {
        title: 'Paiement',
        selectMethod: 'Choisissez votre méthode de paiement',
        paymentMethod: 'Méthode de paiement',
        total: 'Total à payer',
        pay: 'Payer 60 DT',
        payNow: 'Payer maintenant',
        processing: 'Paiement...',
        secure: 'Paiement 100% sécurisé',
        securePayment: 'Paiement 100% sécurisé avec chiffrement SSL',
        paymentSuccess: 'Paiement effectué avec succès!',
        paymentError: 'Erreur lors du traitement du paiement',
        missingReservationId: 'ID de réservation manquant',
        paymentInitError: 'Erreur lors de l\'initialisation du paiement'
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
      },
      footer: {
        available247: '24h/24 - 7j/7',
        securePayment: 'Paiement sécurisé'
      },
      whatsapp: 'Besoin d\'aide?',
      whatsappMessage: 'Bonjour, j\'aimerais avoir plus d\'informations sur la réservation de terrain.'
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
        selectDateTitle: 'Choose a date',
        thisWeek: 'This week',
        availableSlots: 'Available slots',
        noSlots: 'No slots available',
        chooseOtherDate: 'Choose another date',
        touchCalendar: 'Touch a day in the calendar above',
        loading: 'Loading slots...',
        loadingError: 'Error loading slots',
        retry: 'Retry',
        today: 'Today',
        tomorrow: 'Tomorrow',
        minutes: 'min'
      },
      form: {
        title: 'Reservation Information',
        newReservation: 'New Reservation',
        yourReservation: 'Your reservation',
        personalInfo: 'Information',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        date: 'Date',
        time: 'Time',
        duration: 'Duration',
        price: 'Price',
        firstNamePlaceholder: 'Your first name',
        lastNamePlaceholder: 'Your last name',
        emailPlaceholder: 'your@email.com',
        phonePlaceholder: '12 345 678',
        continue: 'Continue',
        back: 'Back',
        cancel: 'Cancel',
        required: 'This field is required',
        firstNameRequired: 'First name required',
        lastNameRequired: 'Last name required',
        emailRequired: 'Email required',
        phoneRequired: 'Phone number required',
        invalidEmail: 'Invalid email format',
        invalidPhone: 'Invalid phone number (8 digits minimum)',
        creating: 'Creating...',
        reservationCreated: 'Reservation created successfully!',
        reservationError: 'Error creating reservation',
        numberOfPlayers: 'Number of players',
        numberOfPlayersPlaceholder: 'Number of players',
        stadiumType: 'Court type',
        indoor: 'Indoor',
        outdoor: 'Outdoor',
        available: 'available',
        checking: 'Checking...',
        unavailable: 'Full',
        noStadiumAvailable: 'No courts available for this time slot. Please choose another time.'
      },
      payment: {
        title: 'Payment',
        selectMethod: 'Choose your payment method',
        paymentMethod: 'Payment method',
        total: 'Total to pay',
        pay: 'Pay 60 DT',
        payNow: 'Pay now',
        processing: 'Processing...',
        secure: '100% Secure payment',
        securePayment: '100% secure payment with SSL encryption',
        paymentSuccess: 'Payment successful!',
        paymentError: 'Error processing payment',
        missingReservationId: 'Missing reservation ID',
        paymentInitError: 'Error initializing payment'
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
      },
      footer: {
        available247: '24/7 available',
        securePayment: 'Secure payment'
      },
      whatsapp: 'Need help?',
      whatsappMessage: 'Hello, I would like more information about court reservations.'
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
        selectDateTitle: 'اختر تاريخاً',
        thisWeek: 'هذا الأسبوع',
        availableSlots: 'المواعيد المتاحة',
        noSlots: 'لا توجد مواعيد متاحة',
        chooseOtherDate: 'اختر تاريخاً آخر',
        touchCalendar: 'انقر على يوم في التقويم أعلاه',
        loading: 'جاري تحميل المواعيد...',
        loadingError: 'خطأ في تحميل المواعيد',
        retry: 'إعادة المحاولة',
        today: 'اليوم',
        tomorrow: 'غداً',
        minutes: 'دقيقة'
      },
      form: {
        title: 'معلومات الحجز',
        newReservation: 'حجز جديد',
        yourReservation: 'حجزك',
        personalInfo: 'المعلومات',
        firstName: 'الاسم الأول',
        lastName: 'اللقب',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        date: 'التاريخ',
        time: 'الوقت',
        duration: 'المدة',
        price: 'السعر',
        firstNamePlaceholder: 'اسمك الأول',
        lastNamePlaceholder: 'اسم عائلتك',
        emailPlaceholder: 'بريدك@الإلكتروني.com',
        phonePlaceholder: '12 345 678',
        continue: 'متابعة',
        back: 'رجوع',
        cancel: 'إلغاء',
        required: 'هذا الحقل مطلوب',
        firstNameRequired: 'الاسم الأول مطلوب',
        lastNameRequired: 'اسم العائلة مطلوب',
        emailRequired: 'البريد الإلكتروني مطلوب',
        phoneRequired: 'رقم الهاتف مطلوب',
        invalidEmail: 'تنسيق البريد الإلكتروني غير صحيح',
        invalidPhone: 'رقم الهاتف غير صحيح (8 أرقام كحد أدنى)',
        creating: 'جاري الإنشاء...',
        reservationCreated: 'تم إنشاء الحجز بنجاح!',
        reservationError: 'خطأ في إنشاء الحجز',
        numberOfPlayers: 'عدد اللاعبين',
        numberOfPlayersPlaceholder: 'عدد اللاعبين',
        stadiumType: 'نوع الملعب',
        indoor: 'داخلي',
        outdoor: 'خارجي',
        available: 'متاح',
        checking: 'جاري التحقق...',
        unavailable: 'مكتمل',
        noStadiumAvailable: 'لا توجد ملاعب متاحة لهذا الوقت. يرجى اختيار وقت آخر.'
      },
      payment: {
        title: 'الدفع',
        selectMethod: 'اختر طريقة الدفع',
        paymentMethod: 'طريقة الدفع',
        total: 'المجموع للدفع',
        pay: 'دفع 60 دينار',
        payNow: 'ادفع الآن',
        processing: 'جاري المعالجة...',
        secure: 'دفع آمن 100%',
        securePayment: 'دفع آمن 100% مع تشفير SSL',
        paymentSuccess: 'تم الدفع بنجاح!',
        paymentError: 'خطأ في معالجة الدفع',
        missingReservationId: 'معرف الحجز مفقود',
        paymentInitError: 'خطأ في تهيئة الدفع'
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
      },
      footer: {
        available247: 'متاح 24/7',
        securePayment: 'دفع آمن'
      },
      whatsapp: 'تحتاج مساعدة؟',
      whatsappMessage: 'مرحباً، أود الحصول على المزيد من المعلومات حول حجز الملعب.'
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