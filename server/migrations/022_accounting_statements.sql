CREATE TABLE IF NOT EXISTS accounting_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  year integer NOT NULL CHECK(year BETWEEN 1900 AND 2200), starts_on date NOT NULL, ends_on date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed')), closed_at timestamptz, closed_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), CHECK(ends_on>=starts_on), UNIQUE(organization_id,year)
);

CREATE TABLE IF NOT EXISTS accounting_histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL, description text NOT NULL, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,code)
);

CREATE TABLE IF NOT EXISTS accounting_professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  role text NOT NULL CHECK(role IN ('accountant','legal_representative')), name text NOT NULL, document text,
  registration_number text, registration_state text, email text, phone text, starts_on date, ends_on date,
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS accounting_professionals_scope_idx ON accounting_professionals(organization_id,role,active);

CREATE TABLE IF NOT EXISTS accounting_opening_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  exercise_id uuid NOT NULL REFERENCES accounting_exercises(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounting_accounts(id), debit numeric(14,2) NOT NULL DEFAULT 0 CHECK(debit>=0),
  credit numeric(14,2) NOT NULL DEFAULT 0 CHECK(credit>=0), notes text, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK((debit>0 AND credit=0) OR (credit>0 AND debit=0)), UNIQUE(exercise_id,account_id)
);

CREATE TABLE IF NOT EXISTS accounting_disclosures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  exercise_id uuid NOT NULL REFERENCES accounting_exercises(id) ON DELETE CASCADE,
  statement_type text NOT NULL CHECK(statement_type IN ('general','balance_sheet','income_statement','cash_flow','equity_changes')),
  title text NOT NULL, content text NOT NULL, display_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS accounting_disclosures_scope_idx ON accounting_disclosures(organization_id,exercise_id,statement_type,display_order);

INSERT INTO permissions(code) VALUES
('accounting.settings.manage'),('accounting.exercises.manage'),('accounting.statements.view'),('accounting.statements.generate')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'accounting.%'
ON CONFLICT DO NOTHING;

INSERT INTO accounting_exercises(organization_id,year,starts_on,ends_on)
SELECT id,2026,'2026-01-01','2026-12-31' FROM organizations ON CONFLICT DO NOTHING;
INSERT INTO accounting_histories(organization_id,code,description)
SELECT id,'001','Recebimento de receitas paroquiais' FROM organizations ON CONFLICT DO NOTHING;
INSERT INTO accounting_histories(organization_id,code,description)
SELECT id,'002','Pagamento de despesas administrativas e pastorais' FROM organizations ON CONFLICT DO NOTHING;
