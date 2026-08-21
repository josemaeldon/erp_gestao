CREATE TABLE IF NOT EXISTS cemetery_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL, name text NOT NULL, active boolean NOT NULL DEFAULT true, UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS cemetery_graves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), sector_id uuid REFERENCES cemetery_sectors(id),
  code text NOT NULL, type text NOT NULL DEFAULT 'grave', capacity integer NOT NULL DEFAULT 1 CHECK(capacity>0),
  status text NOT NULL DEFAULT 'available' CHECK(status IN ('available','partial','full','reserved','maintenance')),
  location_notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,code)
);
CREATE INDEX IF NOT EXISTS cemetery_graves_scope_idx ON cemetery_graves(organization_id,sector_id,status);
CREATE TABLE IF NOT EXISTS deceased_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), name text NOT NULL,
  document text, birth_date date, death_date date NOT NULL, mother_name text, father_name text, death_certificate text,
  notes text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deceased_people_scope_idx ON deceased_people(organization_id,death_date DESC,name);
CREATE TABLE IF NOT EXISTS burials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), grave_id uuid NOT NULL REFERENCES cemetery_graves(id),
  deceased_id uuid NOT NULL REFERENCES deceased_people(id), buried_at date NOT NULL, position_label text,
  status text NOT NULL DEFAULT 'buried' CHECK(status IN ('buried','exhumed','transferred')),
  exhumed_at date, destination text, notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(grave_id,deceased_id)
);
CREATE INDEX IF NOT EXISTS burials_grave_idx ON burials(organization_id,grave_id,status);
CREATE TABLE IF NOT EXISTS grave_concessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), grave_id uuid NOT NULL REFERENCES cemetery_graves(id),
  holder_id uuid NOT NULL REFERENCES people(id), starts_on date NOT NULL, ends_on date, status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','expired','cancelled')),
  fee numeric(14,2) NOT NULL DEFAULT 0 CHECK(fee>=0), financial_transaction_id uuid REFERENCES financial_transactions(id), notes text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS grave_concessions_scope_idx ON grave_concessions(organization_id,status,ends_on);

INSERT INTO cemetery_sectors(organization_id,code,name) VALUES ('00000000-0000-0000-0000-000000000001','A','Quadra A') ON CONFLICT DO NOTHING;
INSERT INTO permissions(code) VALUES ('cemetery.view'),('cemetery.graves.create'),('cemetery.deceased.create'),('cemetery.burials.create'),('cemetery.burials.exhume'),('cemetery.concessions.create') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'cemetery.%' ON CONFLICT DO NOTHING;
