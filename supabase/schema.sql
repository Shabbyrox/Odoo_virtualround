-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Tables
-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    unit TEXT NOT NULL,
    min_stock_level INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, location_id)
);

-- Movements Table
CREATE TABLE IF NOT EXISTS public.movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id),
    type TEXT NOT NULL CHECK (type IN ('Transfer', 'Receipt', 'Delivery', 'Adjustment')),
    from_location_id UUID REFERENCES public.locations(id),
    to_location_id UUID REFERENCES public.locations(id),
    quantity INTEGER NOT NULL,
    reason TEXT,
    performed_by UUID,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adjustments Table
CREATE TABLE IF NOT EXISTS public.adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id),
    location_id UUID REFERENCES public.locations(id),
    system_quantity INTEGER NOT NULL,
    counted_quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    contact_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    contact_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts Table
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES public.suppliers(id),
    location_id UUID REFERENCES public.locations(id),
    date TIMESTAMPTZ NOT NULL,
    reference TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipt Items Table
CREATE TABLE IF NOT EXISTS public.receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID REFERENCES public.receipts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliveries Table
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id),
    location_id UUID REFERENCES public.locations(id),
    date TIMESTAMPTZ NOT NULL,
    address TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'picking', 'packing', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery Items Table
CREATE TABLE IF NOT EXISTS public.delivery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    picked BOOLEAN DEFAULT FALSE,
    packed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;

-- 3. Helper function to create policies safely (FIXED)
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name text,
    table_name text,
    cmd text,
    roles text[] DEFAULT NULL
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = policy_name AND tablename = table_name
    ) THEN
        -- Fix: syntax depends on the command type
        IF cmd = 'INSERT' THEN
            EXECUTE format('CREATE POLICY %I ON %I FOR %s WITH CHECK (true)', policy_name, table_name, cmd);
        ELSIF cmd = 'SELECT' OR cmd = 'DELETE' THEN
            EXECUTE format('CREATE POLICY %I ON %I FOR %s USING (true)', policy_name, table_name, cmd);
        ELSE -- UPDATE (needs both)
            EXECUTE format('CREATE POLICY %I ON %I FOR %s USING (true) WITH CHECK (true)', policy_name, table_name, cmd);
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Policies
DO $$
DECLARE
    tables text[] := ARRAY[
        'categories', 'products', 'locations', 'inventory', 'movements', 'adjustments',
        'suppliers', 'customers', 'receipts', 'receipt_items', 'deliveries', 'delivery_items'
    ];
    t text;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        PERFORM create_policy_if_not_exists('Allow public read access', t, 'SELECT');
        PERFORM create_policy_if_not_exists('Allow public insert access', t, 'INSERT');
        PERFORM create_policy_if_not_exists('Allow public update access', t, 'UPDATE');
        PERFORM create_policy_if_not_exists('Allow public delete access', t, 'DELETE');
    END LOOP;
END $$;

-- 5. Insert Seed Data
INSERT INTO public.categories (name, description) VALUES
('Electronics', 'Electronic devices and components'),
('Furniture', 'Office and home furniture'),
('Office Supplies', 'Stationery and supplies')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.locations (name, type) VALUES
('Main Warehouse', 'Warehouse'),
('Distribution Center A', 'Distribution Center')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.suppliers (name, contact_info) VALUES
('TechPro Distributors', 'contact@techpro.com'),
('Office Furniture Inc.', 'sales@officefurniture.com'),
('Stationery Wholesale Co.', 'orders@stationery.com')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.customers (name, contact_info) VALUES
('ABC Corporation', 'procurement@abc.com'),
('XYZ Retail', 'inventory@xyz.com'),
('Global Trading Co.', 'logistics@globaltrading.com')
ON CONFLICT (name) DO NOTHING;