CREATE DATABASE IF NOT EXISTS libreq;
USE libreq;

-- Create user that connects via TCP (not Unix socket)
CREATE USER 'libreq'@'127.0.0.1' IDENTIFIED BY 'libreq';

-- Grant full privileges on the database
GRANT ALL PRIVILEGES ON libreq.* TO 'libreq'@'127.0.0.1';
FLUSH PRIVILEGES;

-- Include your table creation script
\. create-tables.sql
