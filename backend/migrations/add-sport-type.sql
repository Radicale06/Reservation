-- Add SportType column to Court table
ALTER TABLE Court 
ADD COLUMN SportType VARCHAR(50) DEFAULT 'padel' AFTER StadiumType;

-- Update existing courts to have padel as default sport type
UPDATE Court SET SportType = 'padel' WHERE SportType IS NULL;