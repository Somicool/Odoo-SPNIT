-- Seed data for StockMaster
insert into warehouses (id, name, address) values
  (uuid_generate_v4(), 'Main Warehouse', '123 Warehouse Ave');

-- create sample location
insert into locations (id, warehouse_id, name)
  select uuid_generate_v4(), id, 'Shelf A' from warehouses limit 1;

-- sample products
insert into products (id, name, sku, category, uom, reorder_level) values
  (uuid_generate_v4(), 'Widget A', 'WGT-A-001', 'Widgets', 'pcs', 10),
  (uuid_generate_v4(), 'Widget B', 'WGT-B-001', 'Widgets', 'pcs', 5);

-- initialize stock balances
insert into stock_balances (id, product_id, location_id, quantity)
  select uuid_generate_v4(), p.id, l.id, 100
  from products p cross join locations l limit 2;
