CREATE TABLE IF NOT EXISTS financial_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  voucher_type text NOT NULL CHECK(voucher_type IN ('vale','advance')), person_id uuid REFERENCES people(id), beneficiary_name text NOT NULL,
  description text NOT NULL, amount numeric(14,2) NOT NULL CHECK(amount>0), issued_on date NOT NULL, due_on date,
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','settled','cancelled')), obligation_id uuid REFERENCES financial_obligations(id),
  created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS financial_vouchers_scope_idx ON financial_vouchers(organization_id,status,due_on);

CREATE TABLE IF NOT EXISTS financial_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), account_id uuid NOT NULL REFERENCES financial_accounts(id),
  check_number text NOT NULL, payee text NOT NULL, description text, amount numeric(14,2) NOT NULL CHECK(amount>0), issued_on date NOT NULL,
  due_on date NOT NULL, cleared_on date, status text NOT NULL DEFAULT 'issued' CHECK(status IN ('issued','cleared','cancelled','returned')),
  financial_transaction_id uuid REFERENCES financial_transactions(id), created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,account_id,check_number)
);
CREATE INDEX IF NOT EXISTS financial_checks_scope_idx ON financial_checks(organization_id,status,due_on);

CREATE TABLE IF NOT EXISTS financial_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  from_account_id uuid NOT NULL REFERENCES financial_accounts(id), to_account_id uuid NOT NULL REFERENCES financial_accounts(id),
  amount numeric(14,2) NOT NULL CHECK(amount>0), transferred_on date NOT NULL, description text NOT NULL, reference text,
  outgoing_transaction_id uuid NOT NULL REFERENCES financial_transactions(id), incoming_transaction_id uuid NOT NULL REFERENCES financial_transactions(id),
  created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), CHECK(from_account_id<>to_account_id)
);

CREATE TABLE IF NOT EXISTS financial_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  receipt_type text NOT NULL CHECK(receipt_type IN ('receipt','rpa','congrua')), receipt_number bigint GENERATED ALWAYS AS IDENTITY,
  person_id uuid REFERENCES people(id), recipient_name text NOT NULL, recipient_document text, description text NOT NULL,
  gross_amount numeric(14,2) NOT NULL CHECK(gross_amount>0), deduction_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(deduction_amount>=0),
  net_amount numeric(14,2) GENERATED ALWAYS AS (gross_amount-deduction_amount) STORED, issued_on date NOT NULL,
  payment_method text, status text NOT NULL DEFAULT 'issued' CHECK(status IN ('issued','paid','cancelled')),
  financial_transaction_id uuid REFERENCES financial_transactions(id), created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS financial_receipts_scope_idx ON financial_receipts(organization_id,receipt_type,issued_on DESC);

CREATE TABLE IF NOT EXISTS budget_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), parent_id uuid REFERENCES budget_structures(id),
  code text NOT NULL, name text NOT NULL, kind text NOT NULL CHECK(kind IN ('income','expense')), active boolean NOT NULL DEFAULT true,
  UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS budget_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), structure_id uuid NOT NULL REFERENCES budget_structures(id),
  year integer NOT NULL CHECK(year BETWEEN 1900 AND 2200), month integer NOT NULL CHECK(month BETWEEN 1 AND 12),
  planned_amount numeric(14,2) NOT NULL CHECK(planned_amount>=0), notes text, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,structure_id,year,month)
);

CREATE TABLE IF NOT EXISTS financial_master_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  data_type text NOT NULL CHECK(data_type IN ('payment_method','document_type','supplier_group','receipt_type','standard_entry','cfop','ofx_config')),
  code text NOT NULL, name text NOT NULL, settings jsonb NOT NULL DEFAULT '{}', active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,data_type,code)
);

INSERT INTO permissions(code) VALUES
('finance.vouchers.manage'),('finance.checks.manage'),('finance.transfers.manage'),('finance.receipts.manage'),('finance.budgets.manage'),('finance.master_data.manage')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'finance.%'
ON CONFLICT DO NOTHING;

INSERT INTO budget_structures(organization_id,code,name,kind)
SELECT id,'R-PASTORAL','Receitas pastorais','income' FROM organizations ON CONFLICT DO NOTHING;
INSERT INTO budget_structures(organization_id,code,name,kind)
SELECT id,'D-ADMIN','Despesas administrativas','expense' FROM organizations ON CONFLICT DO NOTHING;
INSERT INTO financial_master_data(organization_id,data_type,code,name) SELECT id,'payment_method','PIX','PIX' FROM organizations ON CONFLICT DO NOTHING;
INSERT INTO financial_master_data(organization_id,data_type,code,name) SELECT id,'document_type','REC','Recibo' FROM organizations ON CONFLICT DO NOTHING;
INSERT INTO financial_accounts(organization_id,name,type)
SELECT id,'Conta bancária movimento','bank' FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM financial_accounts fa WHERE fa.organization_id=o.id AND fa.name='Conta bancária movimento');
