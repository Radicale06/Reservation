-- Add RaisonSociale column to Company table
ALTER TABLE Company 
ADD COLUMN RaisonSociale VARCHAR(255) NULL AFTER Company;