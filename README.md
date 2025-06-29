# Padel Reservation Platform

A responsive, multilingual web application for managing padel court reservations.

## Features

- 📅 Interactive calendar for viewing availability
- 🌐 Multilingual support (French, Arabic, English)
- 📱 Responsive design for mobile and desktop
- ⏰ 90-minute reservation slots (24/7 availability)
- 💰 Fixed pricing (60 DT per 90-minute session)
- ✅ Form validation
- 🔄 Real-time availability checking

## Tech Stack

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type-safe development
- **MySQL** - Database
- **TypeORM** - ORM for database management

### Frontend
- **Angular 17** - Frontend framework
- **SCSS** - Styling
- **Angular i18n** - Internationalization
- **Reactive Forms** - Form handling

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL database
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`

4. Create MySQL database:
   ```sql
   CREATE DATABASE padel_reservation;
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

The frontend will run on `http://localhost:4200`

## API Endpoints

- `GET /reservations` - Get all reservations
- `POST /reservations` - Create new reservation
- `GET /reservations/available-slots?date=YYYY-MM-DD` - Get available time slots
- `POST /reservations/check-availability` - Check if time slot is available
- `GET /reservations/calendar?startDate=...&endDate=...` - Get calendar data
- `POST /reservations/:id/confirm-payment` - Confirm payment

## Database Schema

### Reservations Table
- `id` (Primary Key)
- `firstName` (VARCHAR)
- `lastName` (VARCHAR)
- `email` (VARCHAR)
- `phoneNumber` (VARCHAR)
- `reservationDate` (DATE)
- `startTime` (TIME)
- `endTime` (TIME)
- `price` (DECIMAL - default 60)
- `status` (ENUM: pending, confirmed, cancelled)
- `paymentId` (VARCHAR, nullable)
- `createdAt` (TIMESTAMP)

## Available Time Slots

The system operates 24/7 and generates 90-minute time slots starting from midnight:
- 00:00-01:30, 01:30-03:00, 03:00-04:30, 04:30-06:00, etc.
- Available slots: 00:00, 01:30, 03:00, 04:30, 06:00, 07:30, 09:00, 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30, 21:00, 22:30

Each reservation is exactly 90 minutes long with no gaps between potential bookings.

## Languages

- **French (fr)** - Default language
- **Arabic (ar)** - RTL support included
- **English (en)**

## Future Enhancements

- [ ] Payment gateway integration (Konnecti/Flousi)
- [ ] Email confirmations
- [ ] SMS notifications
- [ ] Admin panel for managing reservations
- [ ] User accounts and booking history
- [ ] Multiple court support
- [ ] Dynamic pricing
- [ ] Cancellation system

## Development

### Adding New Languages

1. Create new translation file in `frontend/src/assets/i18n/{lang}.json`
2. Add language button in app component
3. Test RTL layout if needed

### Database Migrations

The application uses TypeORM with `synchronize: true` for development. For production, implement proper migrations.

## License

MIT License