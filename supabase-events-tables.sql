-- Tables d'événements pour le système de notifications Supabase
-- Exécutez ce script dans l'éditeur SQL de votre dashboard Supabase

-- Table pour les événements de produits
CREATE TABLE IF NOT EXISTS product_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    product_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les événements de lives
CREATE TABLE IF NOT EXISTS live_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    live_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les événements de commandes
CREATE TABLE IF NOT EXISTS order_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    order_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_product_events_timestamp ON product_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_live_events_timestamp ON live_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_order_events_timestamp ON order_events(timestamp);

-- Activer Row Level Security
ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour permettre l'insertion depuis le backend
CREATE POLICY "Allow backend insert to product_events" ON product_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow backend insert to live_events" ON live_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow backend insert to order_events" ON order_events
    FOR INSERT WITH CHECK (true);

-- Politiques RLS pour permettre la lecture publique (pour les clients)
CREATE POLICY "Public read access to product_events" ON product_events
    FOR SELECT USING (true);

CREATE POLICY "Public read access to live_events" ON live_events
    FOR SELECT USING (true);

CREATE POLICY "Public read access to order_events" ON order_events
    FOR SELECT USING (true);

-- Nettoyer les anciens événements (garder seulement les 1000 plus récents)
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS void AS $$
BEGIN
    DELETE FROM product_events 
    WHERE id NOT IN (
        SELECT id FROM product_events 
        ORDER BY timestamp DESC 
        LIMIT 1000
    );
    
    DELETE FROM live_events 
    WHERE id NOT IN (
        SELECT id FROM live_events 
        ORDER BY timestamp DESC 
        LIMIT 1000
    );
    
    DELETE FROM order_events 
    WHERE id NOT IN (
        SELECT id FROM order_events 
        ORDER BY timestamp DESC 
        LIMIT 1000
    );
END;
$$ LANGUAGE plpgsql;

-- Exécuter le nettoyage automatiquement (optionnel)
-- SELECT cleanup_old_events(); 