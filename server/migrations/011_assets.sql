CREATE TABLE IF NOT EXISTS asset_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL, name text NOT NULL, default_useful_life_months integer CHECK(default_useful_life_months IS NULL OR default_useful_life_months>0),
  active boolean NOT NULL DEFAULT true, UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS asset_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL, name text NOT NULL, address text, active boolean NOT NULL DEFAULT true, UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  category_id uuid REFERENCES asset_categories(id), location_id uuid REFERENCES asset_locations(id), custodian_id uuid REFERENCES people(id),
  asset_tag text NOT NULL, name text NOT NULL, asset_type text NOT NULL CHECK(asset_type IN ('movable','property','vehicle','equipment','artwork','other')),
  description text, serial_number text, brand text, model text, plate text, registry_number text,
  acquisition_date date, acquisition_value numeric(14,2) NOT NULL DEFAULT 0 CHECK(acquisition_value>=0), residual_value numeric(14,2) NOT NULL DEFAULT 0 CHECK(residual_value>=0),
  useful_life_months integer CHECK(useful_life_months IS NULL OR useful_life_months>0), depreciation_method text NOT NULL DEFAULT 'straight_line' CHECK(depreciation_method IN ('none','straight_line')),
  status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','maintenance','loaned','disposed','lost')),
  disposal_date date, disposal_reason text, notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,asset_tag)
);
CREATE INDEX IF NOT EXISTS assets_scope_idx ON assets(organization_id,status,category_id,location_id);
CREATE TABLE IF NOT EXISTS asset_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), asset_id uuid NOT NULL REFERENCES assets(id),
  event_type text NOT NULL CHECK(event_type IN ('transfer','maintenance','return','loan','inventory','disposal','revaluation')),
  event_date date NOT NULL DEFAULT current_date, from_location_id uuid REFERENCES asset_locations(id), to_location_id uuid REFERENCES asset_locations(id),
  responsible_id uuid REFERENCES people(id), amount numeric(14,2) CHECK(amount IS NULL OR amount>=0), document_number text, description text NOT NULL,
  created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS asset_events_scope_idx ON asset_events(organization_id,asset_id,event_date DESC);

INSERT INTO asset_categories(organization_id,code,name,default_useful_life_months) VALUES
('00000000-0000-0000-0000-000000000001','MOVEIS','Móveis e utensílios',120),
('00000000-0000-0000-0000-000000000001','EQUIP','Equipamentos',60),
('00000000-0000-0000-0000-000000000001','IMOVEIS','Imóveis',300),
('00000000-0000-0000-0000-000000000001','VEIC','Veículos',60) ON CONFLICT DO NOTHING;
INSERT INTO asset_locations(organization_id,code,name) VALUES ('00000000-0000-0000-0000-000000000001','MATRIZ','Igreja Matriz') ON CONFLICT DO NOTHING;
INSERT INTO permissions(code) VALUES ('assets.view'),('assets.create'),('assets.update'),('assets.events.create'),('assets.dispose') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'assets.%' ON CONFLICT DO NOTHING;
