-- Configuration Supabase pour LiveShop - BASÉE SUR LES VRAIES TABLES
-- Exécutez ce script dans l'éditeur SQL de votre dashboard Supabase

-- 1. Table des vendeurs (CORRIGÉE)
CREATE TABLE IF NOT EXISTS sellers (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    public_link_id VARCHAR(20) UNIQUE NOT NULL,
    pin_hash VARCHAR(255),
    credit_balance INTEGER NOT NULL DEFAULT 100,
    role VARCHAR(20) NOT NULL DEFAULT 'seller',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    payment_settings JSONB DEFAULT '{}',
    wave_qr_code_url VARCHAR(500),
    orange_money_qr_code_url VARCHAR(500),
    payment_methods_enabled JSONB DEFAULT '["manual"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des produits (CORRIGÉE)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    attributes JSONB,
    images JSONB,
    image_url VARCHAR(500),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    has_variants BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    tags JSONB,
    weight DECIMAL(10,2),
    dimensions JSONB,
    is_pinned BOOLEAN DEFAULT FALSE,
    image_metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des variantes de produits
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    attributes JSONB NOT NULL,
    price DECIMAL(10,2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    sku VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des lives (CORRIGÉE)
CREATE TABLE IF NOT EXISTS lives (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    sellerId INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des produits en live (CORRIGÉE)
CREATE TABLE IF NOT EXISTS live_products (
    id SERIAL PRIMARY KEY,
    liveId INTEGER REFERENCES lives(id) ON DELETE CASCADE,
    productId INTEGER REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(liveId, productId)
);

-- 6. Table des commandes (CORRIGÉE)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_proof_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des notifications (CORRIGÉE)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    read BOOLEAN DEFAULT FALSE,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table des transactions de crédits (CORRIGÉE)
CREATE TABLE IF NOT EXISTS credit_transactions (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    action_type VARCHAR(50),
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    description TEXT,
    metadata JSONB,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Table des OTP (CORRIGÉE)
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(20) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_seller_id_read ON notifications(seller_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_seller_id ON credit_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at); 