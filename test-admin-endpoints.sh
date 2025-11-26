#!/bin/bash
set -e

API_BASE="http://localhost:3001/api"

echo "🧪 Tests des endpoints admin..."
echo ""

# Login
echo "📝 Login superadmin..."
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+221771842787","pin":"2468"}' | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Échec du login"
  exit 1
fi
echo "✅ Login OK"
echo ""

# Dashboard
echo "📊 Test /admin/dashboard..."
curl -s -X GET "$API_BASE/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .data.sellers, .data.orders' | head -6
echo ""

# Liste vendeurs
echo "👥 Test /admin/sellers..."
curl -s -X GET "$API_BASE/admin/sellers?page=1&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .data.sellers | length'
echo ""

# Détails vendeur
echo "👤 Test /admin/sellers/1..."
curl -s -X GET "$API_BASE/admin/sellers/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .data.seller.name, .data.stats'
echo ""

# Commandes admin
echo "📦 Test /admin/orders..."
curl -s -X GET "$API_BASE/admin/orders?page=1&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .data.pagination.total'
echo ""

# Produits admin
echo "🛍️  Test /admin/products..."
curl -s -X GET "$API_BASE/admin/products?page=1&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .data.pagination.total'
echo ""

# Transactions
echo "💳 Test /admin/transactions..."
curl -s -X GET "$API_BASE/admin/transactions?page=1&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .data.pagination.total'
echo ""

# Commandes d'un vendeur
echo "📦 Test /admin/sellers/1/orders..."
curl -s -X GET "$API_BASE/admin/sellers/1/orders" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, (.data.orders | length)'
echo ""

# Produits d'un vendeur
echo "🛍️  Test /admin/sellers/1/products..."
curl -s -X GET "$API_BASE/admin/sellers/1/products" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, (.data.products | length)'
echo ""

echo "✅ Tests terminés !"
