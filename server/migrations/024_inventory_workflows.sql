CREATE TABLE IF NOT EXISTS inventory_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), code text NOT NULL, name text NOT NULL,
  responsible_id uuid REFERENCES people(id), active boolean NOT NULL DEFAULT true, UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS inventory_requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  number bigint GENERATED ALWAYS AS IDENTITY, department_id uuid REFERENCES inventory_departments(id), requester_id uuid REFERENCES people(id),
  requested_on date NOT NULL DEFAULT current_date, needed_on date, purpose text NOT NULL,
  status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','approved','partially_fulfilled','fulfilled','rejected','cancelled')),
  approved_by uuid REFERENCES users(id), approved_at timestamptz, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS inventory_requisition_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), requisition_id uuid NOT NULL REFERENCES inventory_requisitions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES inventory_products(id), requested_quantity numeric(14,3) NOT NULL CHECK(requested_quantity>0),
  fulfilled_quantity numeric(14,3) NOT NULL DEFAULT 0 CHECK(fulfilled_quantity>=0), notes text, UNIQUE(requisition_id,product_id)
);
CREATE INDEX IF NOT EXISTS inventory_requisition_scope_idx ON inventory_requisitions(organization_id,status,requested_on DESC);

CREATE TABLE IF NOT EXISTS inventory_purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), number bigint GENERATED ALWAYS AS IDENTITY,
  supplier_id uuid REFERENCES suppliers(id), supplier_name text NOT NULL, ordered_on date NOT NULL DEFAULT current_date, expected_on date,
  status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','partially_received','received','cancelled')),
  notes text, approved_by uuid REFERENCES users(id), created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS inventory_purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), purchase_order_id uuid NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES inventory_products(id), quantity numeric(14,3) NOT NULL CHECK(quantity>0), received_quantity numeric(14,3) NOT NULL DEFAULT 0,
  unit_cost numeric(14,4) NOT NULL CHECK(unit_cost>=0), UNIQUE(purchase_order_id,product_id)
);

CREATE TABLE IF NOT EXISTS inventory_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), requisition_id uuid REFERENCES inventory_requisitions(id),
  product_id uuid NOT NULL REFERENCES inventory_products(id), location_id uuid NOT NULL REFERENCES storage_locations(id), person_id uuid REFERENCES people(id),
  quantity numeric(14,3) NOT NULL CHECK(quantity>0), returned_on date NOT NULL, condition text, notes text,
  movement_id uuid NOT NULL REFERENCES inventory_movements(id), created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS inventory_writeoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), product_id uuid NOT NULL REFERENCES inventory_products(id),
  location_id uuid NOT NULL REFERENCES storage_locations(id), quantity numeric(14,3) NOT NULL CHECK(quantity>0), written_off_on date NOT NULL,
  reason text NOT NULL, authorization_reference text, movement_id uuid NOT NULL REFERENCES inventory_movements(id), created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_request_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), name text NOT NULL, department_id uuid REFERENCES inventory_departments(id),
  items jsonb NOT NULL DEFAULT '[]', active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,name)
);

INSERT INTO permissions(code) VALUES
('inventory.requisitions.manage'),('inventory.purchase_orders.manage'),('inventory.returns.manage'),('inventory.writeoffs.manage'),('inventory.settings.manage')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'inventory.%'
ON CONFLICT DO NOTHING;
INSERT INTO inventory_departments(organization_id,code,name)
SELECT id,'SECRETARIA','Secretaria paroquial' FROM organizations ON CONFLICT DO NOTHING;
