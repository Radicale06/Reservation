-- Create the database schema for the reservation system

-- Create Company table
CREATE TABLE IF NOT EXISTS `Company` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Company` varchar(255) NOT NULL,
  `RaisonSociale` varchar(255) DEFAULT NULL,
  `TaxIdentificationNumber` varchar(255) NOT NULL,
  `Address` varchar(255) NOT NULL,
  `Phone` varchar(255) NOT NULL,
  `Logo` longblob,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create Court table
CREATE TABLE IF NOT EXISTS `Court` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `Type` varchar(255) NOT NULL,
  `StadiumType` varchar(20) DEFAULT 'outdoor',
  `SportType` varchar(50) DEFAULT 'padel',
  `Image` longblob,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create Reservation table
CREATE TABLE IF NOT EXISTS `Reservation` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `PlayerFullName` varchar(255) NOT NULL,
  `PlayerPhone` varchar(255) NOT NULL,
  `PlayerEmail` varchar(255) DEFAULT NULL,
  `NumberOfPlayers` int NOT NULL,
  `StadiumType` varchar(20) NOT NULL,
  `CourtId` int DEFAULT NULL,
  `StartTime` varchar(255) NOT NULL,
  `EndTime` varchar(255) DEFAULT NULL,
  `Date` date NOT NULL,
  `Price` decimal(18,3) NOT NULL,
  `Status` int NOT NULL DEFAULT '1',
  `IsPaid` tinyint(1) DEFAULT '0',
  `CreatedAt` datetime NOT NULL,
  `CreatedBy` varchar(255) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Reservation_Court` (`CourtId`),
  CONSTRAINT `FK_Reservation_Court` FOREIGN KEY (`CourtId`) REFERENCES `Court` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create Account table (for admin users)
CREATE TABLE IF NOT EXISTS `Account` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `FullName` varchar(255) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UK_Account_Username` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create Payment table
CREATE TABLE IF NOT EXISTS `Payment` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ReservationId` int NOT NULL,
  `Amount` decimal(18,3) NOT NULL,
  `PaymentType` varchar(50) NOT NULL,
  `PaymentGateway` varchar(50) DEFAULT NULL,
  `PaymentId` varchar(255) DEFAULT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'pending',
  `CreatedAt` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Payment_Reservation` (`ReservationId`),
  CONSTRAINT `FK_Payment_Reservation` FOREIGN KEY (`ReservationId`) REFERENCES `Reservation` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;