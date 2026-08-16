-- ============================================================================
-- SUPABASE BACKEND SCHEMA FOR BYHARIANS MENSTRUAL STORE
-- Project Name: byharians81's Project
-- Project ID: pqelwrcierxjrpwcbbxe
-- URL: https://pqelwrcierxjrpwcbbxe.supabase.co
-- ============================================================================

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    eco_points INT DEFAULT 480,
    pads_diverted INT DEFAULT 142,
    last_cycle_date DATE DEFAULT '2026-07-28',
    cycle_length_days INT DEFAULT 28,
    period_length_days INT DEFAULT 5,
    active_subscription JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drop foreign key constraint if existing from prior schema setup
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. CUSTOMER ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    currency TEXT DEFAULT 'IDR',
    status TEXT DEFAULT 'pending',
    timeline JSONB,
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SHOPPING CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CUSTOMER PACKAGES & DISPATCHES TABLE
CREATE TABLE IF NOT EXISTS public.customer_packages (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    phone TEXT,
    package_name TEXT NOT NULL,
    items_summary TEXT NOT NULL,
    frequency TEXT NOT NULL,
    next_delivery_date DATE NOT NULL,
    courier TEXT NOT NULL,
    tracking_number TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    status_text TEXT DEFAULT 'Aktif / Berlangganan',
    last_dispatched DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CUSTOMER GROCERIES & AUTO-REFILL TABLE
CREATE TABLE IF NOT EXISTS public.customer_groceries (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    phone TEXT,
    basket_name TEXT NOT NULL,
    items_summary TEXT NOT NULL,
    monthly_price NUMERIC NOT NULL,
    frequency TEXT NOT NULL,
    next_refill_date DATE NOT NULL,
    courier TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    status_text TEXT DEFAULT 'Auto-Refill ON',
    last_refill_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CONTACT & FEEDBACK MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_groceries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public & authenticated users full CRUD for app functionality
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Public Read Cart" ON public.cart_items FOR SELECT USING (true);
CREATE POLICY "Public Insert Cart" ON public.cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Cart" ON public.cart_items FOR UPDATE USING (true);
CREATE POLICY "Public Delete Cart" ON public.cart_items FOR DELETE USING (true);

CREATE POLICY "Public Read Packages" ON public.customer_packages FOR SELECT USING (true);
CREATE POLICY "Public Insert Packages" ON public.customer_packages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Packages" ON public.customer_packages FOR UPDATE USING (true);

CREATE POLICY "Public Read Groceries" ON public.customer_groceries FOR SELECT USING (true);
CREATE POLICY "Public Insert Groceries" ON public.customer_groceries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Groceries" ON public.customer_groceries FOR UPDATE USING (true);

CREATE POLICY "Public Insert Messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- ============================================================================
-- AUTO-PROFILE TRIGGER FOR NEW USER SIGNUPS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- GRANT ACCESS TO ROLES
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.cart_items TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.customer_packages TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.customer_groceries TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.contact_messages TO anon, authenticated, service_role;
