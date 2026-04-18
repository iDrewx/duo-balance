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

-- 4. Insert some sample data (optional)
-- INSERT INTO gastos (monto, descripcion, tipo, quien) VALUES 
-- (150.00, 'Supermercado', 'compartido', 'el'),
-- (80.00, 'Cine', 'propio', 'ella'),
-- (200.00, 'Gasolina', 'compartido', 'ella');