-- Update existing courts to have proper StadiumType based on their Type field
-- First, add the columns if they don't exist
ALTER TABLE Court 
ADD COLUMN IF NOT EXISTS SportType VARCHAR(50) DEFAULT 'padel',
ADD COLUMN IF NOT EXISTS StadiumType VARCHAR(20) DEFAULT 'outdoor';

-- Update existing courts based on their Type field
UPDATE Court 
SET StadiumType = CASE 
    WHEN LOWER(Type) LIKE '%indoor%' OR LOWER(Type) LIKE '%int%' THEN 'indoor'
    WHEN LOWER(Type) LIKE '%outdoor%' OR LOWER(Type) LIKE '%ext%' THEN 'outdoor'
    ELSE 'outdoor'
END
WHERE StadiumType IS NULL OR StadiumType = '';

-- Set default sport type if not set
UPDATE Court 
SET SportType = 'padel' 
WHERE SportType IS NULL OR SportType = '';

-- Make sure all courts are active by default
UPDATE Court 
SET IsActive = true 
WHERE IsActive IS NULL;