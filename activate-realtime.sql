-- Activer le temps réel pour les tables Supabase
-- Exécutez ce script dans l'éditeur SQL de votre dashboard Supabase

-- Activer la publication pour toutes les tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE lives;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE sellers;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE credit_transactions;

-- Vérifier les publications actives
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Alternative : créer une nouvelle publication si nécessaire
-- CREATE PUBLICATION supabase_realtime_liveshop FOR TABLE products, lives, orders, sellers, notifications, credit_transactions; 