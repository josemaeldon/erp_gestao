CREATE TABLE IF NOT EXISTS social_households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  reference_person_id uuid REFERENCES people(id), family_name text NOT NULL, address text, neighborhood text, city text,
  housing_status text, monthly_income numeric(14,2) NOT NULL DEFAULT 0 CHECK(monthly_income>=0),
  vulnerability_level text NOT NULL DEFAULT 'medium' CHECK(vulnerability_level IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','monitoring','closed')), notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_households_scope_idx ON social_households(organization_id,status,vulnerability_level);
CREATE TABLE IF NOT EXISTS social_household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  household_id uuid NOT NULL REFERENCES social_households(id) ON DELETE CASCADE, person_id uuid NOT NULL REFERENCES people(id),
  relationship text, monthly_income numeric(14,2) NOT NULL DEFAULT 0 CHECK(monthly_income>=0), dependent boolean NOT NULL DEFAULT false,
  notes text, UNIQUE(household_id,person_id)
);
CREATE INDEX IF NOT EXISTS social_members_household_idx ON social_household_members(organization_id,household_id);
CREATE TABLE IF NOT EXISTS social_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL, program_type text NOT NULL, description text, eligibility text,
  starts_on date, ends_on date, budget numeric(14,2) NOT NULL DEFAULT 0 CHECK(budget>=0), active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_programs_scope_idx ON social_programs(organization_id,active,name);
CREATE TABLE IF NOT EXISTS social_assistance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  household_id uuid REFERENCES social_households(id), person_id uuid REFERENCES people(id), attended_at timestamptz NOT NULL,
  assistance_type text NOT NULL, professional text, summary text NOT NULL, referral text, follow_up_on date,
  confidentiality text NOT NULL DEFAULT 'restricted' CHECK(confidentiality IN ('normal','restricted','strict')),
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','follow_up','resolved','cancelled')),
  created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(household_id IS NOT NULL OR person_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS social_assistance_scope_idx ON social_assistance_records(organization_id,status,attended_at DESC);
CREATE TABLE IF NOT EXISTS social_benefit_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  program_id uuid REFERENCES social_programs(id), household_id uuid REFERENCES social_households(id), person_id uuid REFERENCES people(id),
  delivered_on date NOT NULL DEFAULT current_date, benefit text NOT NULL, quantity numeric(14,3) NOT NULL DEFAULT 1 CHECK(quantity>0),
  estimated_value numeric(14,2) NOT NULL DEFAULT 0 CHECK(estimated_value>=0), delivered_by text, receipt_reference text, notes text,
  created_at timestamptz NOT NULL DEFAULT now(), CHECK(household_id IS NOT NULL OR person_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS social_deliveries_scope_idx ON social_benefit_deliveries(organization_id,delivered_on DESC,program_id);

INSERT INTO social_programs(organization_id,name,program_type,description,active) VALUES
('00000000-0000-0000-0000-000000000001','Cesta Fraterna','food','Distribuição periódica de alimentos',true),
('00000000-0000-0000-0000-000000000001','Acolhimento Pastoral','assistance','Escuta, orientação e encaminhamento',true)
ON CONFLICT DO NOTHING;
INSERT INTO permissions(code) VALUES ('social.view'),('social.households.create'),('social.members.manage'),('social.assistance.create'),('social.assistance.update'),('social.benefits.deliver'),('social.confidential.view') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'social.%' ON CONFLICT DO NOTHING;
