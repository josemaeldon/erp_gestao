CREATE TABLE IF NOT EXISTS accounting_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  parent_id uuid REFERENCES accounting_accounts(id), code text NOT NULL, name text NOT NULL,
  account_type text NOT NULL CHECK(account_type IN ('asset','liability','equity','revenue','expense')),
  nature text NOT NULL CHECK(nature IN ('debit','credit')), accepts_entries boolean NOT NULL DEFAULT true, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,code)
);
CREATE INDEX IF NOT EXISTS accounting_accounts_scope_idx ON accounting_accounts(organization_id,active,code);

CREATE TABLE IF NOT EXISTS accounting_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  entry_date date NOT NULL, document_number text, memo text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','posted','reversed')),
  source text NOT NULL DEFAULT 'manual', posted_by uuid REFERENCES users(id), posted_at timestamptz,
  reversed_entry_id uuid REFERENCES accounting_entries(id), created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS accounting_entries_scope_idx ON accounting_entries(organization_id,status,entry_date DESC);
CREATE TABLE IF NOT EXISTS accounting_entry_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  entry_id uuid NOT NULL REFERENCES accounting_entries(id) ON DELETE CASCADE, account_id uuid NOT NULL REFERENCES accounting_accounts(id),
  cost_center_id uuid REFERENCES cost_centers(id), description text,
  debit numeric(14,2) NOT NULL DEFAULT 0 CHECK(debit>=0), credit numeric(14,2) NOT NULL DEFAULT 0 CHECK(credit>=0),
  CHECK((debit>0 AND credit=0) OR (credit>0 AND debit=0))
);
CREATE INDEX IF NOT EXISTS accounting_lines_account_idx ON accounting_entry_lines(organization_id,account_id,entry_id);
CREATE TABLE IF NOT EXISTS accounting_source_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  source_entity text NOT NULL, source_id uuid NOT NULL, entry_id uuid NOT NULL REFERENCES accounting_entries(id),
  UNIQUE(organization_id,source_entity,source_id)
);

INSERT INTO accounting_accounts(organization_id,code,name,account_type,nature,accepts_entries) VALUES
('00000000-0000-0000-0000-000000000001','1','Ativo','asset','debit',false),
('00000000-0000-0000-0000-000000000001','1.1.01','Caixa e equivalentes','asset','debit',true),
('00000000-0000-0000-0000-000000000001','2','Passivo','liability','credit',false),
('00000000-0000-0000-0000-000000000001','3','Patrimônio social','equity','credit',true),
('00000000-0000-0000-0000-000000000001','4','Receitas','revenue','credit',false),
('00000000-0000-0000-0000-000000000001','4.1.01','Receitas pastorais e doações','revenue','credit',true),
('00000000-0000-0000-0000-000000000001','5','Despesas','expense','debit',false),
('00000000-0000-0000-0000-000000000001','5.1.01','Despesas administrativas e pastorais','expense','debit',true)
ON CONFLICT DO NOTHING;

UPDATE accounting_accounts child SET parent_id=parent.id FROM accounting_accounts parent
WHERE child.organization_id=parent.organization_id AND child.parent_id IS NULL AND child.code LIKE parent.code||'.%' AND parent.code IN ('1','4','5');

INSERT INTO permissions(code) VALUES
('accounting.view'),('accounting.accounts.create'),('accounting.entries.create'),('accounting.entries.post'),('accounting.import')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'accounting.%'
ON CONFLICT DO NOTHING;
