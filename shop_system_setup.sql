-- shop_system_setup.sql

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Wellness Products, Apparel, Recovery, Accessories
    images TEXT[] DEFAULT array[]::TEXT[],
    video_url TEXT,
    external_link TEXT,
    is_recommended BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: In older versions of FMF schemas, `products` might have required brand_id or category_id.
-- We are performing soft alters just in case the old schema existed but lacked the new streamlined Phase 3 fields.
DO $$ 
BEGIN
    BEGIN ALTER TABLE public.products ADD COLUMN video_url TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.products ADD COLUMN external_link TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.products ADD COLUMN is_recommended BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.products ADD COLUMN is_active BOOLEAN DEFAULT true; EXCEPTION WHEN duplicate_column THEN END;
    -- If string category didn't exist:
    BEGIN ALTER TABLE public.products ADD COLUMN category VARCHAR(100) DEFAULT 'Apparel'; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, shipped, cancelled
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(10, 2) NOT NULL, -- price at time of purchase
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Shop Security Rules (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read active products. Admins can do anything.
CREATE POLICY "Public reads active products" ON public.products FOR SELECT USING (is_active = true OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins control products" ON public.products FOR ALL USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Orders: Users can read own. Admins can read all.
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (user_id = auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins control orders" ON public.orders FOR ALL USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Order Items: Users can read own. Admins can read all.
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT USING (EXISTS(SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Admins control order items" ON public.order_items FOR ALL USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
