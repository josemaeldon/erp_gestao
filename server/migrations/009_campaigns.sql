CREATE TABLE IF NOT EXISTS fundraising_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL, campaign_type text NOT NULL DEFAULT 'fundraising', description text, coordinator text,
  starts_on date NOT NULL, ends_on date, target_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(target_amount>=0),
  status text NOT NULL DEFAULT 'planning' CHECK(status IN ('planning','active','paused','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fundraising_campaigns_scope_idx ON fundraising_campaigns(organization_id,status,starts_on DESC);

CREATE TABLE IF NOT EXISTS campaign_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  campaign_id uuid NOT NULL REFERENCES fundraising_campaigns(id) ON DELETE CASCADE, person_id uuid REFERENCES people(id), donor_name text,
  amount numeric(14,2) NOT NULL CHECK(amount>0), frequency text NOT NULL DEFAULT 'once' CHECK(frequency IN ('once','monthly','installments')),
  installments integer CHECK(installments IS NULL OR installments>0), pledged_on date NOT NULL DEFAULT current_date, due_date date,
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','partial','fulfilled','cancelled')), notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(person_id IS NOT NULL OR length(trim(coalesce(donor_name,'')))>1)
);
CREATE INDEX IF NOT EXISTS campaign_pledges_scope_idx ON campaign_pledges(organization_id,campaign_id,status,due_date);

CREATE TABLE IF NOT EXISTS campaign_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  campaign_id uuid NOT NULL REFERENCES fundraising_campaigns(id), pledge_id uuid REFERENCES campaign_pledges(id), person_id uuid REFERENCES people(id), donor_name text,
  amount numeric(14,2) NOT NULL CHECK(amount>0), received_on date NOT NULL DEFAULT current_date, payment_method text NOT NULL,
  reference text, financial_transaction_id uuid NOT NULL REFERENCES financial_transactions(id), receipt_emission_id uuid REFERENCES document_emissions(id),
  notes text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS campaign_donations_scope_idx ON campaign_donations(organization_id,campaign_id,received_on DESC);

CREATE TABLE IF NOT EXISTS campaign_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  campaign_id uuid NOT NULL REFERENCES fundraising_campaigns(id), description text NOT NULL, amount numeric(14,2) NOT NULL CHECK(amount>0),
  occurred_on date NOT NULL DEFAULT current_date, supplier_id uuid REFERENCES people(id), financial_transaction_id uuid NOT NULL REFERENCES financial_transactions(id),
  notes text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS campaign_expenses_scope_idx ON campaign_expenses(organization_id,campaign_id,occurred_on DESC);

INSERT INTO permissions(code) VALUES
('campaigns.view'),('campaigns.create'),('campaigns.update'),('campaigns.pledges.create'),('campaigns.donations.create'),('campaigns.expenses.create')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'campaigns.%'
ON CONFLICT DO NOTHING;
