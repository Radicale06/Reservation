-- Insert sample data for the reservation system

-- Insert default company information
INSERT INTO `Company` (`Company`, `RaisonSociale`, `TaxIdentificationNumber`, `Address`, `Phone`) 
VALUES ('Réservation Sport', 'SARL Sport Center', '1234567/A/M/000', '123 Avenue Habib Bourguiba, Tunis 1000', '+216 12 345 678')
ON DUPLICATE KEY UPDATE `Company` = VALUES(`Company`);

-- Insert sample courts
INSERT INTO `Court` (`Name`, `Description`, `Type`, `StadiumType`, `SportType`, `IsActive`, `CreatedAt`) 
VALUES 
  ('Terrain Padel 1', 'Terrain de padel extérieur principal', 'Court', 'outdoor', 'padel', 1, NOW()),
  ('Terrain Padel 2', 'Terrain de padel extérieur secondaire', 'Court', 'outdoor', 'padel', 1, NOW()),
  ('Terrain Padel Indoor 1', 'Terrain de padel intérieur climatisé', 'Court', 'indoor', 'padel', 1, NOW()),
  ('Terrain Tennis 1', 'Terrain de tennis extérieur', 'Court', 'outdoor', 'tennis', 1, NOW()),
  ('Terrain Football 1', 'Terrain de football à 5', 'Court', 'outdoor', 'football', 1, NOW()),
  ('Terrain Basketball 1', 'Terrain de basketball couvert', 'Court', 'indoor', 'basketball', 1, NOW())
ON DUPLICATE KEY UPDATE `Name` = VALUES(`Name`);

-- Insert default admin account (password: admin123)
-- Note: In production, hash this password properly
INSERT INTO `Account` (`Username`, `Password`, `FullName`, `Email`, `IsActive`, `CreatedAt`)
VALUES ('admin', '$2b$10$rQZ5nqZ5nqZ5nqZ5nqZ5nO5nqZ5nqZ5nqZ5nqZ5nqZ5nqZ5nqZ5nq', 'Administrator', 'admin@example.com', 1, NOW())
ON DUPLICATE KEY UPDATE `Username` = VALUES(`Username`);

-- Grant permissions for WSL connections
GRANT ALL PRIVILEGES ON reservation_db.* TO 'reservation_user'@'%';
FLUSH PRIVILEGES;

-- Insert sample reservations (optional - remove if you don't want sample data)
INSERT INTO `Reservation` (`PlayerFullName`, `PlayerPhone`, `PlayerEmail`, `NumberOfPlayers`, `StadiumType`, `CourtId`, `StartTime`, `EndTime`, `Date`, `Price`, `Status`, `IsPaid`, `CreatedAt`, `CreatedBy`)
VALUES 
  ('Ahmed Ben Ali', '12345678', 'ahmed@example.com', 4, 'outdoor', 1, '09:00', '10:30', CURDATE(), 60.000, 2, 1, NOW(), 'System'),
  ('Fatma Trabelsi', '87654321', 'fatma@example.com', 2, 'indoor', 3, '14:00', '15:30', CURDATE(), 60.000, 1, 0, NOW(), 'System'),
  ('Mohamed Sassi', '11223344', NULL, 4, 'outdoor', 2, '16:30', '18:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 60.000, 1, 0, NOW(), 'LandingPage')
ON DUPLICATE KEY UPDATE `PlayerFullName` = VALUES(`PlayerFullName`);