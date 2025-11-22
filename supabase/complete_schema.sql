-- =============================================
-- STOCKMASTER COMPLETE DATABASE SCHEMA
-- =============================================

-- ============= CORE TABLES =============

-- Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Locations Table (within warehouses)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  location_type VARCHAR(50) DEFAULT 'INTERNAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT locations_code_warehouse_unique UNIQUE (code, warehouse_id)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100),
  unit_cost DECIMAL(15, 2) DEFAULT 0,
  uom VARCHAR(50) DEFAULT 'Units',
  reorder_level INTEGER DEFAULT 0,
  on_hand INTEGER DEFAULT 0,
  free_to_use INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents Table (Receipts, Deliveries, Transfers, Adjustments)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no VARCHAR(100) NOT NULL UNIQUE,
  doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT')),
  status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Waiting', 'Ready', 'Done', 'Cancelled')),
  warehouse_id UUID REFERENCES warehouses(id),
  location_from_id UUID REFERENCES locations(id),
  location_to_id UUID REFERENCES locations(id),
  supplier VARCHAR(255),
  customer VARCHAR(255),
  scheduled_date DATE,
  responsible VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document Lines Table (Products in each document)
CREATE TABLE IF NOT EXISTS document_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  qty_expected DECIMAL(15, 3) NOT NULL DEFAULT 0,
  qty_done DECIMAL(15, 3) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock Ledger Table (Move History)
CREATE TABLE IF NOT EXISTS stock_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  product_id UUID NOT NULL REFERENCES products(id),
  location_id UUID REFERENCES locations(id),
  qty_delta DECIMAL(15, 3) NOT NULL,
  balance_after DECIMAL(15, 3) NOT NULL,
  reason VARCHAR(255),
  reference_no VARCHAR(100),
  contact VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============= INDEXES =============

CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_reference ON documents(reference_no);
CREATE INDEX IF NOT EXISTS idx_document_lines_document ON document_lines(document_id);
CREATE INDEX IF NOT EXISTS idx_document_lines_product ON document_lines(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_product ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_location ON stock_ledger(location_id);
CREATE INDEX IF NOT EXISTS idx_locations_warehouse ON locations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- ============= AUTO-INCREMENT FUNCTIONS =============

-- Function to generate next reference number
CREATE OR REPLACE FUNCTION generate_reference_no(
  p_warehouse_code VARCHAR,
  p_operation VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
  next_id INTEGER;
  new_ref VARCHAR;
BEGIN
  -- Get the next ID for this warehouse/operation combination
  SELECT COALESCE(MAX(
    CAST(
      SPLIT_PART(reference_no, '/', 3) AS INTEGER
    )
  ), 0) + 1
  INTO next_id
  FROM documents
  WHERE reference_no LIKE p_warehouse_code || '/' || p_operation || '/%';
  
  -- Format: WH/IN/001
  new_ref := p_warehouse_code || '/' || p_operation || '/' || LPAD(next_id::TEXT, 3, '0');
  
  RETURN new_ref;
END;
$$ LANGUAGE plpgsql;

-- ============= STOCK CALCULATION FUNCTIONS =============

-- Function to update product quantities
CREATE OR REPLACE FUNCTION update_product_quantities(
  p_product_id UUID,
  p_qty_delta DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET 
    on_hand = on_hand + p_qty_delta,
    free_to_use = free_to_use + p_qty_delta,
    updated_at = NOW()
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record stock move
CREATE OR REPLACE FUNCTION record_stock_move(
  p_document_id UUID,
  p_product_id UUID,
  p_location_id UUID,
  p_qty_delta DECIMAL,
  p_reason VARCHAR,
  p_reference_no VARCHAR,
  p_contact VARCHAR
)
RETURNS VOID AS $$
DECLARE
  current_balance DECIMAL;
BEGIN
  -- Get current balance
  SELECT COALESCE(on_hand, 0) INTO current_balance
  FROM products
  WHERE id = p_product_id;
  
  -- Insert ledger entry
  INSERT INTO stock_ledger (
    document_id,
    product_id,
    location_id,
    qty_delta,
    balance_after,
    reason,
    reference_no,
    contact,
    created_at
  ) VALUES (
    p_document_id,
    p_product_id,
    p_location_id,
    p_qty_delta,
    current_balance + p_qty_delta,
    p_reason,
    p_reference_no,
    p_contact,
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- ============= VALIDATION RPC FUNCTIONS =============

-- Validate Receipt (Incoming Stock)
CREATE OR REPLACE FUNCTION validate_receipt(doc UUID)
RETURNS VOID AS $$
DECLARE
  line RECORD;
  doc_rec RECORD;
BEGIN
  -- Get document details
  SELECT * INTO doc_rec FROM documents WHERE id = doc;
  
  -- Update document status
  UPDATE documents
  SET status = 'Done', updated_at = NOW()
  WHERE id = doc;
  
  -- Process each line
  FOR line IN
    SELECT * FROM document_lines WHERE document_id = doc
  LOOP
    -- Increase stock
    PERFORM update_product_quantities(line.product_id, line.qty_done);
    
    -- Record move
    PERFORM record_stock_move(
      doc,
      line.product_id,
      doc_rec.location_to_id,
      line.qty_done,
      'Receipt validated',
      doc_rec.reference_no,
      doc_rec.supplier
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Validate Delivery (Outgoing Stock)
CREATE OR REPLACE FUNCTION validate_delivery(doc UUID)
RETURNS VOID AS $$
DECLARE
  line RECORD;
  doc_rec RECORD;
  available_qty DECIMAL;
BEGIN
  -- Get document details
  SELECT * INTO doc_rec FROM documents WHERE id = doc;
  
  -- Check stock availability for all lines
  FOR line IN
    SELECT dl.*, p.on_hand, p.free_to_use
    FROM document_lines dl
    JOIN products p ON p.id = dl.product_id
    WHERE dl.document_id = doc
  LOOP
    IF line.free_to_use < line.qty_done THEN
      -- Set to Waiting if out of stock
      UPDATE documents
      SET status = 'Waiting', updated_at = NOW()
      WHERE id = doc;
      
      RAISE EXCEPTION 'Insufficient stock for product %', line.product_id;
    END IF;
  END LOOP;
  
  -- Update document status to Done
  UPDATE documents
  SET status = 'Done', updated_at = NOW()
  WHERE id = doc;
  
  -- Process each line
  FOR line IN
    SELECT * FROM document_lines WHERE document_id = doc
  LOOP
    -- Decrease stock
    PERFORM update_product_quantities(line.product_id, -line.qty_done);
    
    -- Record move
    PERFORM record_stock_move(
      doc,
      line.product_id,
      doc_rec.location_from_id,
      -line.qty_done,
      'Delivery validated',
      doc_rec.reference_no,
      doc_rec.customer
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Validate Transfer (Move between locations)
CREATE OR REPLACE FUNCTION validate_transfer(doc UUID)
RETURNS VOID AS $$
DECLARE
  line RECORD;
  doc_rec RECORD;
BEGIN
  -- Get document details
  SELECT * INTO doc_rec FROM documents WHERE id = doc;
  
  -- Update document status
  UPDATE documents
  SET status = 'Done', updated_at = NOW()
  WHERE id = doc;
  
  -- Process each line (deduct from source, add to destination)
  FOR line IN
    SELECT * FROM document_lines WHERE document_id = doc
  LOOP
    -- Record move OUT from source
    PERFORM record_stock_move(
      doc,
      line.product_id,
      doc_rec.location_from_id,
      -line.qty_done,
      'Transfer out',
      doc_rec.reference_no,
      NULL
    );
    
    -- Record move IN to destination
    PERFORM record_stock_move(
      doc,
      line.product_id,
      doc_rec.location_to_id,
      line.qty_done,
      'Transfer in',
      doc_rec.reference_no,
      NULL
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Validate Adjustment (Inventory adjustment)
CREATE OR REPLACE FUNCTION validate_adjustment(doc UUID)
RETURNS VOID AS $$
DECLARE
  line RECORD;
  doc_rec RECORD;
  qty_diff DECIMAL;
BEGIN
  -- Get document details
  SELECT * INTO doc_rec FROM documents WHERE id = doc;
  
  -- Update document status
  UPDATE documents
  SET status = 'Done', updated_at = NOW()
  WHERE id = doc;
  
  -- Process each line
  FOR line IN
    SELECT * FROM document_lines WHERE document_id = doc
  LOOP
    -- Calculate difference
    qty_diff := line.qty_done - line.qty_expected;
    
    -- Update stock
    PERFORM update_product_quantities(line.product_id, qty_diff);
    
    -- Record move
    PERFORM record_stock_move(
      doc,
      line.product_id,
      doc_rec.location_to_id,
      qty_diff,
      'Inventory adjustment',
      doc_rec.reference_no,
      NULL
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============= ROW LEVEL SECURITY =============

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on warehouses"
  ON warehouses FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on locations"
  ON locations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on products"
  ON products FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on documents"
  ON documents FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on document_lines"
  ON document_lines FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on stock_ledger"
  ON stock_ledger FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============= SAMPLE DATA (Optional) =============

-- Insert default warehouse
INSERT INTO warehouses (id, name, code) VALUES 
  (gen_random_uuid(), 'Main Warehouse', 'WH')
ON CONFLICT (code) DO NOTHING;

-- Insert default locations
INSERT INTO locations (warehouse_id, name, code, location_type)
SELECT 
  w.id,
  'Stock',
  'Stock1',
  'INTERNAL'
FROM warehouses w
WHERE w.code = 'WH'
ON CONFLICT (code, warehouse_id) DO NOTHING;

INSERT INTO locations (warehouse_id, name, code, location_type)
SELECT 
  w.id,
  'Vendor',
  'vendor',
  'SUPPLIER'
FROM warehouses w
WHERE w.code = 'WH'
ON CONFLICT (code, warehouse_id) DO NOTHING;
