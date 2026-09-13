CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_contact TEXT,
  total_cents INTEGER NOT NULL CHECK(total_cents >= 0),
  payment_provider TEXT NOT NULL,
  payment_preference_id TEXT,
  payment_id TEXT UNIQUE,
  payment_status TEXT NOT NULL CHECK(payment_status IN ('pending','approved','rejected','cancelled','refunded')),
  created_at TEXT NOT NULL,
  approved_at TEXT,
  email_sent_at TEXT
);
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  beat_id TEXT NOT NULL,
  beat_name TEXT NOT NULL,
  license_id TEXT NOT NULL,
  license_name TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL CHECK(unit_price_cents >= 0),
  applied_discount_cents INTEGER NOT NULL DEFAULT 0 CHECK(applied_discount_cents >= 0)
);
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  received_at TEXT NOT NULL,
  payload TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS download_tokens (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  beat_id TEXT NOT NULL,
  license_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  max_downloads INTEGER NOT NULL DEFAULT 5,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_download_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
