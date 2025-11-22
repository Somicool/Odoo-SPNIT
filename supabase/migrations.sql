-- Supabase migration for StockMaster
-- Tables: warehouses, locations, products, stock_balances, documents, document_lines, stock_ledger

create extension if not exists "uuid-ossp";

-- warehouses
create table if not exists warehouses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  created_at timestamp with time zone default now()
);

-- locations
create table if not exists locations (
  id uuid primary key default uuid_generate_v4(),
  warehouse_id uuid references warehouses(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now()
);

-- products
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sku text unique not null,
  category text,
  uom text,
  reorder_level int default 0,
  created_by uuid,
  created_at timestamp with time zone default now()
);

-- stock_balances
create table if not exists stock_balances (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  quantity double precision default 0
);

-- documents
create type doc_type_enum as enum ('RECEIPT','DELIVERY','TRANSFER','ADJUSTMENT');
create type doc_status_enum as enum ('DRAFT','VALIDATED','CANCELLED');

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  doc_type doc_type_enum not null,
  status doc_status_enum not null default 'DRAFT',
  reference_no text,
  warehouse_from uuid,
  warehouse_to uuid,
  supplier text,
  customer text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone default now()
);

-- document_lines
create table if not exists document_lines (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  qty_expected double precision default 0,
  qty_done double precision default 0,
  location_from uuid,
  location_to uuid
);

-- stock_ledger
create table if not exists stock_ledger (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  qty_delta double precision,
  doc_id uuid references documents(id),
  reason text,
  created_at timestamp with time zone default now(),
  created_by uuid,
  balance_after double precision
);

-- RPC: validate_receipt(document_id uuid)
create or replace function validate_receipt(doc uuid)
returns void language plpgsql as $$
declare
  l_line record;
  l_balance_id uuid;
  l_current_qty double precision;
begin
  perform pg_advisory_xact_lock(1);
  for l_line in select * from document_lines where document_id = doc loop
    -- find or create stock balance
    select id, quantity into l_balance_id, l_current_qty from stock_balances where product_id = l_line.product_id and location_id = l_line.location_to limit 1 for update;
    if not found then
      insert into stock_balances(product_id, location_id, quantity) values (l_line.product_id, l_line.location_to, 0) returning id, quantity into l_balance_id, l_current_qty;
    end if;
    -- update quantity
    update stock_balances set quantity = quantity + l_line.qty_done where id = l_balance_id;
    -- insert ledger
    insert into stock_ledger(product_id, location_id, qty_delta, doc_id, reason, created_by, balance_after)
      values (l_line.product_id, l_line.location_to, l_line.qty_done, doc, 'RECEIPT', null, (l_current_qty + l_line.qty_done));
  end loop;
  update documents set status = 'VALIDATED' where id = doc;
end;
$$;

-- RPC: validate_delivery(document_id uuid)
create or replace function validate_delivery(doc uuid)
returns void language plpgsql as $$
declare
  l_line record;
  l_balance_id uuid;
  l_current_qty double precision;
begin
  perform pg_advisory_xact_lock(2);
  for l_line in select * from document_lines where document_id = doc loop
    select id, quantity into l_balance_id, l_current_qty from stock_balances where product_id = l_line.product_id and location_id = l_line.location_from limit 1 for update;
    if not found then
      raise exception 'Insufficient stock for product % at location %', l_line.product_id, l_line.location_from;
    end if;
    if l_current_qty < l_line.qty_done then
      raise exception 'Insufficient stock for product % at location %', l_line.product_id, l_line.location_from;
    end if;
    update stock_balances set quantity = quantity - l_line.qty_done where id = l_balance_id;
    insert into stock_ledger(product_id, location_id, qty_delta, doc_id, reason, created_by, balance_after)
      values (l_line.product_id, l_line.location_from, -l_line.qty_done, doc, 'DELIVERY', null, (l_current_qty - l_line.qty_done));
  end loop;
  update documents set status = 'VALIDATED' where id = doc;
end;
$$;

-- RPC: validate_transfer(document_id uuid)
create or replace function validate_transfer(doc uuid)
returns void language plpgsql as $$
declare
  l_line record;
  l_from_id uuid;
  l_to_id uuid;
  l_from_qty double precision;
  l_to_qty double precision;
begin
  perform pg_advisory_xact_lock(3);
  for l_line in select * from document_lines where document_id = doc loop
    select id, quantity into l_from_id, l_from_qty from stock_balances where product_id = l_line.product_id and location_id = l_line.location_from limit 1 for update;
    if not found then
      raise exception 'Insufficient stock for product % at location %', l_line.product_id, l_line.location_from;
    end if;
    if l_from_qty < l_line.qty_done then
      raise exception 'Insufficient stock for product % at location %', l_line.product_id, l_line.location_from;
    end if;
    update stock_balances set quantity = quantity - l_line.qty_done where id = l_from_id;

    select id, quantity into l_to_id, l_to_qty from stock_balances where product_id = l_line.product_id and location_id = l_line.location_to limit 1 for update;
    if not found then
      insert into stock_balances(product_id, location_id, quantity) values (l_line.product_id, l_line.location_to, 0) returning id, quantity into l_to_id, l_to_qty;
    end if;
    update stock_balances set quantity = quantity + l_line.qty_done where id = l_to_id;

    insert into stock_ledger(product_id, location_id, qty_delta, doc_id, reason, created_by, balance_after)
      values (l_line.product_id, l_line.location_from, -l_line.qty_done, doc, 'TRANSFER_OUT', null, (l_from_qty - l_line.qty_done));
    insert into stock_ledger(product_id, location_id, qty_delta, doc_id, reason, created_by, balance_after)
      values (l_line.product_id, l_line.location_to, l_line.qty_done, doc, 'TRANSFER_IN', null, (l_to_qty + l_line.qty_done));
  end loop;
  update documents set status = 'VALIDATED' where id = doc;
end;
$$;

-- RPC: validate_adjustment(document_id uuid)
create or replace function validate_adjustment(doc uuid)
returns void language plpgsql as $$
declare
  l_line record;
  l_balance_id uuid;
  l_current_qty double precision;
  l_delta double precision;
begin
  perform pg_advisory_xact_lock(4);
  for l_line in select * from document_lines where document_id = doc loop
    select id, quantity into l_balance_id, l_current_qty from stock_balances where product_id = l_line.product_id and location_id = l_line.location_to limit 1 for update;
    if not found then
      insert into stock_balances(product_id, location_id, quantity) values (l_line.product_id, l_line.location_to, 0) returning id, quantity into l_balance_id, l_current_qty;
    end if;
    l_delta := l_line.qty_done - l_current_qty;
    update stock_balances set quantity = l_line.qty_done where id = l_balance_id;
    insert into stock_ledger(product_id, location_id, qty_delta, doc_id, reason, created_by, balance_after)
      values (l_line.product_id, l_line.location_to, l_delta, doc, 'ADJUSTMENT', null, l_line.qty_done);
  end loop;
  update documents set status = 'VALIDATED' where id = doc;
end;
$$;

-- End migrations
