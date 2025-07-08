-- MySQL version of ReservationSport database
CREATE DATABASE IF NOT EXISTS ReservationSport;
USE ReservationSport;

-- Account table
CREATE TABLE Account (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(255) NOT NULL,
    CreatedAt DATETIME NOT NULL,
    CreatedBy VARCHAR(255) NOT NULL
);

-- Company table
CREATE TABLE Company (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Company VARCHAR(255) NOT NULL,
    TaxIdentificationNumber VARCHAR(255) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    Phone VARCHAR(255) NOT NULL,
    Logo LONGBLOB
);

-- Court table
CREATE TABLE Court (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description VARCHAR(255),
    Type VARCHAR(255) NOT NULL,
    StadiumType VARCHAR(20) NOT NULL DEFAULT 'outdoor',
    Image LONGBLOB,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL
);

-- PaymentType table
CREATE TABLE PaymentType (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PaymentType VARCHAR(255) NOT NULL
);

-- ReservationStatus table
CREATE TABLE ReservationStatus (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Status VARCHAR(255) NOT NULL
);

-- Reservation table
CREATE TABLE Reservation (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PlayerFullName VARCHAR(255) NOT NULL,
    PlayerPhone VARCHAR(255) NOT NULL,
    PlayerEmail VARCHAR(255),
    NumberOfPlayers INT NOT NULL,
    StadiumType VARCHAR(20) NOT NULL,
    CourtId INT,
    StartTime VARCHAR(255) NOT NULL,
    EndTime VARCHAR(255),
    Date DATE NOT NULL,
    Price DECIMAL(18,3) NOT NULL,
    Status INT NOT NULL,
    IsPaid BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt DATETIME NOT NULL,
    CreatedBy VARCHAR(255) NOT NULL,
    FOREIGN KEY (CourtId) REFERENCES Court(Id)
);

-- Payment table
CREATE TABLE Payment (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PaiementTypeId INT NOT NULL,
    Amount DECIMAL(18,3) NOT NULL,
    ReservationId INT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    FOREIGN KEY (PaiementTypeId) REFERENCES PaymentType(Id),
    FOREIGN KEY (ReservationId) REFERENCES Reservation(Id)
);

-- Insert sample data
INSERT INTO Account (UserName, Password, FullName, CreatedAt, CreatedBy) VALUES 
('Adminitarteur', '0000', 'Neji bouzid', NOW(), 'Access');

INSERT INTO Court (Name, Description, Type, StadiumType, IsActive, CreatedAt) VALUES 
('Terrain 01', 'Terrain 01 de padel', 'Padel', 'indoor', TRUE, NOW()),
('Terrain 02', 'Terrain 02 Padel', 'Padel', 'outdoor', TRUE, NOW()),
('Terrain 03', 'Terrain 03', 'Padel', 'indoor', FALSE, NOW());

INSERT INTO PaymentType (PaymentType) VALUES 
('En ligne'),
('Especes');

INSERT INTO ReservationStatus (Status) VALUES 
('En attente'),
('Confirmée'),
('Annulée'),
('Payée');

-- Insert sample reservations
INSERT INTO Reservation (PlayerFullName, PlayerPhone, PlayerEmail, NumberOfPlayers, StadiumType, CourtId, StartTime, EndTime, Date, Price, Status, IsPaid, CreatedAt, CreatedBy) VALUES 
('Neji Bouzid', '29364502', 'neji@example.com', 4, 'indoor', 1, '16:00', '17:30', '2025-06-27', 120.000, 1, FALSE, NOW(), 'Whatsapp'),
('Neji Bouzid 2', '29364502', NULL, 2, 'outdoor', 2, '15:00', '16:30', '2025-06-27', 120.000, 4, TRUE, NOW(), 'LandingPage'),
('Neji bouzid 3', '29364502', 'neji3@example.com', 4, 'indoor', 1, '14:00', '15:30', '2025-06-28', 120.000, 2, FALSE, NOW(), 'Whatsapp');

-- Insert sample payment
INSERT INTO Payment (PaiementTypeId, Amount, ReservationId, CreatedAt) VALUES 
(1, 120.000, 2, NOW());