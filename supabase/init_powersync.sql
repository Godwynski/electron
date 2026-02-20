-- PowerSync Setup Script for Supabase
-- Run this script in the Supabase SQL Editor to initialize your database for PowerSync

-- 1. Create the Publication
-- PowerSync requires a publication named 'powersync' to track changes.
-- You can specify tables using: CREATE PUBLICATION powersync FOR TABLE table1, table2;
-- For this setup, we sync all tables:
DROP PUBLICATION IF EXISTS powersync;
CREATE PUBLICATION powersync FOR ALL TABLES;

-- 2. Create the PowerSync Role
-- This role is used by the PowerSync server to connect to your Supabase database.
-- IMPORTANT: Change 'YOUR_SECURE_PASSWORD' to a strong, unique password!
-- You will need this password when configuring the connection in the PowerSync dashboard.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'powersync') THEN
    CREATE ROLE powersync WITH NOINHERIT LOGIN PASSWORD 'YOUR_SECURE_PASSWORD';
  END IF;
END
$$;

-- 3. Grant Permissions
-- The powersync role needs read-only access to your public schema to replicate data.
GRANT USAGE ON SCHEMA public TO powersync;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO powersync;

-- Wait for any newly created tables to automatically have SELECT granted
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO powersync;

-- If you have views or functions that powersync needs to execute (optional but common)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO powersync;

-- 4. Enable Logical Replication on specific tables (if needed)
-- By default, Supabase enables logical replication format for all tables.
-- However, you must ensure the replica identity is set to DEFAULT or FULL.
-- Example (Uncomment and run if you add tables later and they don't sync):
-- ALTER TABLE public.users REPLICA IDENTITY DEFAULT;
