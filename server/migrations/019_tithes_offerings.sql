CREATE TABLE IF NOT EXISTS tithe_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid NOT NULL REFERENCES people(id),
  missionary_person_id uuid REFERENCES people(id), community_id uuid REFERENCES parish_communities(id), member_number text NOT NULL,
  joined_on date NOT NULL DEFAULT current_date, monthly_expectation numeric(14,2) NOT NULL DEFAULT 0 CHECK(monthly_expectation>=0),
  preferred_payment_day integer CHECK(preferred_payment_day BETWEEN 1 AND 31), delivery_method text NOT NULL DEFAULT 'parish',
  status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','suspended')), notes text, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,person_id), UNIQUE(organization_id,member_number)
);
CREATE INDEX IF NOT EXISTS tithe_members_scope_idx ON tithe_members(organization_id,status,community_id);

CREATE TABLE IF NOT EXISTS offering_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), name text NOT NULL, code text NOT NULL,
  description text, default_amount numeric(14,2) NOT NULL DEFAULT 0, financial_category text NOT NULL DEFAULT 'offerings',
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,code), UNIQUE(organization_id,name)
);

CREATE TABLE IF NOT EXISTS offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), offering_type_id uuid NOT NULL REFERENCES offering_types(id),
  person_id uuid REFERENCES people(id), amount numeric(14,2) NOT NULL CHECK(amount>0), offered_on date NOT NULL DEFAULT current_date,
  payment_method text NOT NULL DEFAULT 'cash', reference text, notes text, financial_transaction_id uuid REFERENCES financial_transactions(id),
  created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS offerings_scope_idx ON offerings(organization_id,offered_on DESC,offering_type_id);

ALTER TABLE tithe_payments ADD COLUMN IF NOT EXISTS tithe_member_id uuid REFERENCES tithe_members(id);
ALTER TABLE tithe_payments ADD COLUMN IF NOT EXISTS receipt_number text;
ALTER TABLE tithe_payments ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id);
ALTER TABLE tithe_payments ADD COLUMN IF NOT EXISTS reversed_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS tithe_receipt_unique_idx ON tithe_payments(organization_id,receipt_number) WHERE receipt_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS tithe_payment_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), payment_id uuid NOT NULL REFERENCES tithe_payments(id) ON DELETE CASCADE,
  competence date NOT NULL, amount numeric(14,2) NOT NULL CHECK(amount>0), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(payment_id,competence)
);
CREATE INDEX IF NOT EXISTS tithe_allocations_scope_idx ON tithe_payment_allocations(organization_id,competence,payment_id);

CREATE TABLE IF NOT EXISTS contribution_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid REFERENCES people(id),
  tithe_member_id uuid REFERENCES tithe_members(id), document_type text NOT NULL CHECK(document_type IN ('carnet','label','receipt','annual_statement')),
  period_start date, period_end date, sequence integer, payload jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'generated' CHECK(status IN ('generated','printed','sent','cancelled')),
  generated_by uuid REFERENCES users(id), generated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contribution_documents_scope_idx ON contribution_documents(organization_id,document_type,generated_at DESC);

ALTER TABLE pix_charges ADD COLUMN IF NOT EXISTS contribution_type text;
ALTER TABLE pix_charges ADD COLUMN IF NOT EXISTS contribution_id uuid;

INSERT INTO permissions(code) VALUES
('tithe.members.manage'),('tithe.payments.manage'),('tithe.reports.view'),('tithe.documents.generate'),('offerings.view'),('offerings.manage')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='Administrador' AND (p.code LIKE 'tithe.%' OR p.code LIKE 'offerings.%') ON CONFLICT DO NOTHING;

INSERT INTO offering_types(organization_id,name,code,description,default_amount,financial_category)
VALUES('00000000-0000-0000-0000-000000000001','Oferta pastoral','PASTORAL','Ofertas vinculadas às atividades pastorais',0,'offerings')
ON CONFLICT DO NOTHING;
