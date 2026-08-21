CREATE TABLE IF NOT EXISTS cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL, name text NOT NULL, active boolean NOT NULL DEFAULT true,
  UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS financial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL, name text NOT NULL, kind text NOT NULL CHECK(kind IN ('income','expense','both')),
  active boolean NOT NULL DEFAULT true, UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS financial_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  type text NOT NULL CHECK(type IN ('payable','receivable')), person_id uuid REFERENCES people(id),
  description text NOT NULL, document_number text, category_id uuid REFERENCES financial_categories(id),
  cost_center_id uuid REFERENCES cost_centers(id), amount numeric(14,2) NOT NULL CHECK(amount>0),
  due_date date NOT NULL, competence_date date, status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','partial','settled','cancelled','overdue')),
  paid_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(paid_amount>=0), notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS financial_obligations_scope_idx ON financial_obligations(organization_id,type,status,due_date);
CREATE TABLE IF NOT EXISTS financial_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  obligation_id uuid NOT NULL REFERENCES financial_obligations(id), account_id uuid NOT NULL REFERENCES financial_accounts(id),
  amount numeric(14,2) NOT NULL CHECK(amount>0), settlement_date date NOT NULL DEFAULT current_date,
  payment_method text NOT NULL, financial_transaction_id uuid NOT NULL REFERENCES financial_transactions(id),
  reversed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS financial_settlements_obligation_idx ON financial_settlements(organization_id,obligation_id);
CREATE TABLE IF NOT EXISTS financial_period_closings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  period_start date NOT NULL, period_end date NOT NULL, status text NOT NULL DEFAULT 'closed',
  closed_by uuid REFERENCES users(id), closed_at timestamptz NOT NULL DEFAULT now(), reopened_by uuid REFERENCES users(id), reopened_at timestamptz,
  UNIQUE(organization_id,period_start,period_end)
);

INSERT INTO cost_centers(organization_id,code,name) VALUES ('00000000-0000-0000-0000-000000000001','GERAL','Paróquia - Geral') ON CONFLICT DO NOTHING;
INSERT INTO financial_categories(organization_id,code,name,kind) VALUES
('00000000-0000-0000-0000-000000000001','DOACOES','Dízimos, ofertas e doações','income'),
('00000000-0000-0000-0000-000000000001','MANUTENCAO','Manutenção e custeio','expense'),
('00000000-0000-0000-0000-000000000001','PASTORAL','Atividades pastorais','both')
ON CONFLICT DO NOTHING;

INSERT INTO permissions(code) VALUES ('finance.obligations.view'),('finance.obligations.create'),('finance.obligations.settle'),('finance.period.close'),('finance.period.reopen') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'finance.%' ON CONFLICT DO NOTHING;
