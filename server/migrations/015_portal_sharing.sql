CREATE TABLE IF NOT EXISTS portal_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid NOT NULL REFERENCES people(id),
  email text NOT NULL, invitation_token_hash text, status text NOT NULL DEFAULT 'invited' CHECK(status IN ('invited','active','revoked')),
  invited_at timestamptz NOT NULL DEFAULT now(), accepted_at timestamptz, last_access_at timestamptz, external_id text,
  created_by uuid REFERENCES users(id), UNIQUE(organization_id,person_id)
);
CREATE INDEX IF NOT EXISTS portal_memberships_scope_idx ON portal_memberships(organization_id,status,invited_at DESC);
CREATE TABLE IF NOT EXISTS portal_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  title text NOT NULL, body text NOT NULL, category text NOT NULL DEFAULT 'general', audience text NOT NULL DEFAULT 'all',
  starts_at timestamptz NOT NULL DEFAULT now(), ends_at timestamptz, status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portal_announcements_public_idx ON portal_announcements(organization_id,status,starts_at,ends_at);
CREATE TABLE IF NOT EXISTS portal_mass_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  weekday integer NOT NULL CHECK(weekday BETWEEN 0 AND 6), starts_at time NOT NULL, title text NOT NULL DEFAULT 'Santa Missa',
  community text, location text, celebrant text, notes text, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portal_mass_schedules_scope_idx ON portal_mass_schedules(organization_id,active,weekday,starts_at);
CREATE TABLE IF NOT EXISTS portal_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid NOT NULL REFERENCES people(id),
  credential_type text NOT NULL, code text NOT NULL, valid_from timestamptz NOT NULL DEFAULT now(), valid_until timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','used','revoked','expired')), used_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}', created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,code)
);
CREATE INDEX IF NOT EXISTS portal_credentials_scope_idx ON portal_credentials(organization_id,status,valid_until);

CREATE TABLE IF NOT EXISTS fraternal_sharing_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id),
  percentage numeric(6,3) NOT NULL DEFAULT 10 CHECK(percentage BETWEEN 0 AND 100),
  income_categories text[] NOT NULL DEFAULT ARRAY['Dízimos','Ofertas','Doações'], due_day integer NOT NULL DEFAULT 10 CHECK(due_day BETWEEN 1 AND 28),
  beneficiary text, instructions text, updated_by uuid REFERENCES users(id), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS fraternal_sharing_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  period_start date NOT NULL, period_end date NOT NULL, gross_income numeric(14,2) NOT NULL DEFAULT 0,
  excluded_amount numeric(14,2) NOT NULL DEFAULT 0, calculation_base numeric(14,2) NOT NULL DEFAULT 0,
  percentage numeric(6,3) NOT NULL, sharing_amount numeric(14,2) NOT NULL DEFAULT 0,
  due_date date NOT NULL, status text NOT NULL DEFAULT 'calculated' CHECK(status IN ('calculated','approved','paid','cancelled')),
  approved_by uuid REFERENCES users(id), approved_at timestamptz, notes text, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,period_start,period_end)
);
CREATE INDEX IF NOT EXISTS sharing_periods_scope_idx ON fraternal_sharing_periods(organization_id,status,period_end DESC);
CREATE TABLE IF NOT EXISTS fraternal_sharing_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  period_id uuid NOT NULL REFERENCES fraternal_sharing_periods(id), amount numeric(14,2) NOT NULL CHECK(amount>0),
  paid_on date NOT NULL, payment_method text NOT NULL, reference text, financial_transaction_id uuid NOT NULL REFERENCES financial_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS pastoral_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  person_id uuid REFERENCES people(id), receipt_type text NOT NULL, description text NOT NULL, amount numeric(14,2) NOT NULL CHECK(amount>0),
  received_on date NOT NULL DEFAULT current_date, payment_method text NOT NULL, financial_transaction_id uuid NOT NULL REFERENCES financial_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pastoral_receipts_scope_idx ON pastoral_receipts(organization_id,received_on DESC,receipt_type);

INSERT INTO fraternal_sharing_configs(organization_id,percentage,due_day,beneficiary)
VALUES('00000000-0000-0000-0000-000000000001',10,10,'Cúria Diocesana') ON CONFLICT DO NOTHING;
INSERT INTO permissions(code) VALUES
('portal.view'),('portal.members.invite'),('portal.announcements.manage'),('portal.schedules.manage'),('portal.credentials.manage'),
('sharing.view'),('sharing.configure'),('sharing.calculate'),('sharing.approve'),('sharing.pay'),('sharing.receipts.create')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND (p.code LIKE 'portal.%' OR p.code LIKE 'sharing.%') ON CONFLICT DO NOTHING;
