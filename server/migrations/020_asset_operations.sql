CREATE TABLE IF NOT EXISTS asset_accessories (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
 name text NOT NULL, serial_number text, quantity numeric(12,3) NOT NULL DEFAULT 1 CHECK(quantity>0), condition text, notes text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS asset_legal_documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
 document_type text NOT NULL, document_number text, registry_office text, issued_on date, expires_on date, reference text, notes text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS asset_legal_documents_due_idx ON asset_legal_documents(organization_id,expires_on);
CREATE TABLE IF NOT EXISTS asset_insurance_policies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
 insurer text NOT NULL, policy_number text NOT NULL, coverage text, insured_amount numeric(14,2) NOT NULL DEFAULT 0, premium_amount numeric(14,2) NOT NULL DEFAULT 0,
 starts_on date NOT NULL, ends_on date NOT NULL, status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','expired','cancelled','claimed')),
 notes text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,policy_number)
);
CREATE TABLE IF NOT EXISTS vehicle_drivers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
 person_id uuid NOT NULL REFERENCES people(id), license_number text NOT NULL, license_category text, license_expires_on date,
 assigned_on date NOT NULL DEFAULT current_date, released_on date, notes text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS vehicle_drivers_scope_idx ON vehicle_drivers(organization_id,asset_id,released_on);
CREATE TABLE IF NOT EXISTS asset_reservations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), asset_id uuid NOT NULL REFERENCES assets(id),
 requester_id uuid REFERENCES people(id), title text NOT NULL, starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, purpose text,
 status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','approved','checked_out','returned','rejected','cancelled')),
 approved_by uuid REFERENCES users(id), approved_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), CHECK(ends_at>starts_at)
);
CREATE INDEX IF NOT EXISTS asset_reservations_calendar_idx ON asset_reservations(organization_id,asset_id,starts_at,ends_at);
CREATE TABLE IF NOT EXISTS property_leases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), asset_id uuid NOT NULL REFERENCES assets(id),
 tenant_person_id uuid REFERENCES people(id), tenant_name text NOT NULL, tenant_document text, starts_on date NOT NULL, ends_on date NOT NULL,
 monthly_amount numeric(14,2) NOT NULL CHECK(monthly_amount>0), due_day integer NOT NULL CHECK(due_day BETWEEN 1 AND 28), adjustment_index text,
 deposit_amount numeric(14,2) NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'active' CHECK(status IN ('draft','active','ended','cancelled')),
 notes text, created_at timestamptz NOT NULL DEFAULT now(), CHECK(ends_on>=starts_on)
);
CREATE INDEX IF NOT EXISTS property_leases_scope_idx ON property_leases(organization_id,status,ends_on);
CREATE TABLE IF NOT EXISTS property_lease_installments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), lease_id uuid NOT NULL REFERENCES property_leases(id) ON DELETE CASCADE,
 competence date NOT NULL, due_date date NOT NULL, amount numeric(14,2) NOT NULL CHECK(amount>0), obligation_id uuid REFERENCES financial_obligations(id),
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','settled','cancelled')), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(lease_id,competence)
);

INSERT INTO permissions(code) VALUES ('assets.accessories.manage'),('assets.documents.manage'),('assets.insurance.manage'),('assets.drivers.manage'),('assets.reservations.manage'),('assets.leases.manage') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'assets.%' ON CONFLICT DO NOTHING;
