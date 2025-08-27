-- Configuration Supabase pour LiveShop
-- Exécutez ce script dans l'éditeur SQL de votre dashboard Supabase

-- 1. Table des vendeurs
CREATE TABLE IF NOT EXISTS sellers (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    pin VARCHAR(6) NOT NULL,
    credits INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des produits
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    images JSONB, -- Stockage des images (Unsplash, uploads, etc.)
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des lives
CREATE TABLE IF NOT EXISTS lives (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, ended
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des produits en live
CREATE TABLE IF NOT EXISTS live_products (
    id SERIAL PRIMARY KEY,
    live_id INTEGER REFERENCES lives(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_address TEXT,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, delivered, cancelled
    payment_proof TEXT, -- URL de la preuve de paiement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des transactions de crédits
CREATE TABLE IF NOT EXISTS credit_transactions (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positif pour ajout, négatif pour débit
    type VARCHAR(50) NOT NULL, -- purchase, usage, refund, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table des OTP
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_lives_status ON lives(status);
CREATE INDEX IF NOT EXISTS idx_notifications_seller_id ON notifications(seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Activer Row Level Security (RLS)
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;

-- Politiques RLS basiques (à ajuster selon vos besoins)
-- Permettre la lecture publique des produits actifs
CREATE POLICY "Public read access to active products" ON products
    FOR SELECT USING (is_active = true);

-- Permettre la lecture publique des lives actifs
CREATE POLICY "Public read access to active lives" ON lives
    FOR SELECT USING (status = 'active');

-- Permettre la lecture publique des commandes (pour les clients)
CREATE POLICY "Public read access to orders" ON orders
    FOR SELECT USING (true);

-- Permettre l'insertion de commandes (pour les clients)
CREATE POLICY "Public insert access to orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Permettre aux vendeurs de gérer leurs propres données
CREATE POLICY "Sellers can manage their own data" ON sellers
    FOR ALL USING (auth.uid()::text = phone);

-- Permettre aux vendeurs de gérer leurs produits
CREATE POLICY "Sellers can manage their products" ON products
    FOR ALL USING (seller_id IN (
        SELECT id FROM sellers WHERE phone = auth.uid()::text
    ));

-- Permettre aux vendeurs de gérer leurs lives
CREATE POLICY "Sellers can manage their lives" ON lives
    FOR ALL USING (seller_id IN (
        SELECT id FROM sellers WHERE phone = auth.uid()::text
    ));

-- Permettre aux vendeurs de voir leurs commandes
CREATE POLICY "Sellers can view their orders" ON orders
    FOR SELECT USING (product_id IN (
        SELECT id FROM products WHERE seller_id IN (
            SELECT id FROM sellers WHERE phone = auth.uid()::text
        )
    ));

-- Permettre aux vendeurs de gérer leurs notifications
CREATE POLICY "Sellers can manage their notifications" ON notifications
    FOR ALL USING (seller_id IN (
        SELECT id FROM sellers WHERE phone = auth.uid()::text
    ));

-- Permettre aux vendeurs de gérer leurs transactions de crédits
CREATE POLICY "Sellers can manage their credit transactions" ON credit_transactions
    FOR ALL USING (seller_id IN (
        SELECT id FROM sellers WHERE phone = auth.uid()::text
    ));

-- Permettre la gestion des OTP
CREATE POLICY "Public OTP management" ON otps
    FOR ALL USING (true);

-- Activer les triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lives_updated_at BEFORE UPDATE ON lives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques données de test
INSERT INTO sellers (phone, name, pin, credits, is_admin) VALUES
('+221777777777', 'Admin Test', '123456', 1000, true),
('+221777777778', 'Vendeur Test', '123456', 100, false)
ON CONFLICT (phone) DO NOTHING;

INSERT INTO products (seller_id, name, description, price, images, category) VALUES
(2, 'Produit Test 1', 'Description du produit test', 15000, '[]', 'Électronique'),
(2, 'Produit Test 2', 'Description du produit test 2', 25000, '[]', 'Vêtements')
ON CONFLICT DO NOTHING; 