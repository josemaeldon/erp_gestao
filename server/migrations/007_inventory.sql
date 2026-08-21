CREATE TABLE IF NOT EXISTS inventory_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL, active boolean NOT NULL DEFAULT true, UNIQUE(organization_id,name)
);
CREATE TABLE IF NOT EXISTS storage_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL, name text NOT NULL, active boolean NOT NULL DEFAULT true, UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS inventory_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  category_id uuid REFERENCES inventory_categories(id), sku text NOT NULL, name text NOT NULL, description text,
  unit text NOT NULL DEFAULT 'un', minimum_stock numeric(14,3) NOT NULL DEFAULT 0 CHECK(minimum_stock>=0),
  average_cost numeric(14,4) NOT NULL DEFAULT 0 CHECK(average_cost>=0), barcode text, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,sku)
);
CREATE INDEX IF NOT EXISTS inventory_products_scope_idx ON inventory_products(organization_id,active,name);
CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  product_id uuid NOT NULL REFERENCES inventory_products(id), location_id uuid NOT NULL REFERENCES storage_locations(id),
  kind text NOT NULL CHECK(kind IN ('entry','exit','transfer_in','transfer_out','adjustment_in','adjustment_out')),
  quantity numeric(14,3) NOT NULL CHECK(quantity>0), unit_cost numeric(14,4) CHECK(unit_cost IS NULL OR unit_cost>=0),
  occurred_at date NOT NULL DEFAULT current_date, document_number text, batch text, expires_on date, notes text,
  transfer_group uuid, person_id uuid REFERENCES people(id), created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inventory_movements_balance_idx ON inventory_movements(organization_id,product_id,location_id,occurred_at);

INSERT INTO inventory_categories(organization_id,name) VALUES
('00000000-0000-0000-0000-000000000001','Material litúrgico'),
('00000000-0000-0000-0000-000000000001','Limpeza'),
('00000000-0000-0000-0000-000000000001','Escritório') ON CONFLICT DO NOTHING;
INSERT INTO storage_locations(organization_id,code,name) VALUES
('00000000-0000-0000-0000-000000000001','CENTRAL','Almoxarifado central') ON CONFLICT DO NOTHING;
INSERT INTO permissions(code) VALUES ('inventory.view'),('inventory.products.create'),('inventory.movements.create'),('inventory.transfer') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'inventory.%' ON CONFLICT DO NOTHING;
