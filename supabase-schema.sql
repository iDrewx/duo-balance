-- Supabase Database Schema for Gastos Compartidos
-- Run this in your Supabase SQL Editor

-- 1. Create the gastos table
CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monto DECIMAL(10, 2) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('propio', 'compartido')),
  quien TEXT NOT NULL CHECK (quien IN ('el', 'ella')),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE gastos;

-- 3. Create a simple security policy (allow all for now - can be restricted later)
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write (for simplicity - can be restricted later)
CREATE POLICY "Allow all access to gastos" ON gastos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Create the user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id TEXT NOT NULL UNIQUE,
  nombre_el TEXT NOT NULL DEFAULT 'André',
  nombre_ella TEXT NOT NULL DEFAULT 'Diana',
  avatar_el TEXT DEFAULT '👨',
  avatar_ella TEXT DEFAULT '👩',
  avatar_el_seed TEXT,
  avatar_ella_seed TEXT,
  assigned_profile TEXT CHECK (assigned_profile IN ('el', 'ella', NULL)),
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to user_settings" ON user_settings
  FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE user_settings;

-- 5. Create the periodo_cerrado table
CREATE TABLE IF NOT EXISTS periodo_cerrado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo TEXT NOT NULL UNIQUE,
  fecha_cierre TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE periodo_cerrado ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to periodo_cerrado" ON periodo_cerrado
  FOR ALL USING (true) WITH CHECK (true);

-- 6. Add cerrado column to gastos (if not exists from migration)
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS cerrado BOOLEAN NOT NULL DEFAULT false;

-- 7. Insert some sample data (optional)
-- INSERT INTO gastos (monto, descripcion, tipo, quien) VALUES 
-- (150.00, 'Supermercado', 'compartido', 'el'),
-- (80.00, 'Cine', 'propio', 'ella'),
-- (200.00, 'Gasolina', 'compartido', 'ella');