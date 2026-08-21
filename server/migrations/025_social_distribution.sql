CREATE TABLE IF NOT EXISTS social_donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid REFERENCES people(id),
  name text NOT NULL, document text, phone text, email text, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS social_product_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), name text NOT NULL, active boolean NOT NULL DEFAULT true,
  UNIQUE(organization_id,name)
);
CREATE TABLE IF NOT EXISTS social_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), product_type_id uuid REFERENCES social_product_types(id),
  code text NOT NULL, name text NOT NULL, unit text NOT NULL DEFAULT 'un', minimum_stock numeric(14,3) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS social_stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), product_id uuid NOT NULL REFERENCES social_products(id),
  kind text NOT NULL CHECK(kind IN ('entry','exit','adjustment_in','adjustment_out','transfer_in','transfer_out')),
  quantity numeric(14,3) NOT NULL CHECK(quantity>0), occurred_on date NOT NULL, donor_id uuid REFERENCES social_donors(id),
  source_entity text, source_id uuid, notes text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_stock_scope_idx ON social_stock_movements(organization_id,product_id,occurred_on DESC);

CREATE TABLE IF NOT EXISTS social_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), code text NOT NULL, name text NOT NULL,
  description text, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS social_kit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), kit_id uuid NOT NULL REFERENCES social_kits(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES social_products(id), quantity numeric(14,3) NOT NULL CHECK(quantity>0), UNIQUE(kit_id,product_id)
);
CREATE TABLE IF NOT EXISTS social_kit_assemblies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), kit_id uuid NOT NULL REFERENCES social_kits(id),
  quantity numeric(14,3) NOT NULL CHECK(quantity>0), assembled_on date NOT NULL, available_quantity numeric(14,3) NOT NULL CHECK(available_quantity>=0),
  notes text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_distribution_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), title text NOT NULL,
  scheduled_for timestamptz NOT NULL, location text, audience text, capacity integer, status text NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled')),
  notes text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS social_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  distribution_type text NOT NULL CHECK(distribution_type IN ('individual','community')), schedule_id uuid REFERENCES social_distribution_schedules(id),
  household_id uuid REFERENCES social_households(id), person_id uuid REFERENCES people(id), community_name text,
  product_id uuid REFERENCES social_products(id), kit_id uuid REFERENCES social_kits(id), quantity numeric(14,3) NOT NULL CHECK(quantity>0),
  distributed_on date NOT NULL, delivered_by text, receipt_reference text, notes text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
  CHECK((product_id IS NOT NULL) <> (kit_id IS NOT NULL)),
  CHECK(distribution_type='community' AND community_name IS NOT NULL OR distribution_type='individual' AND (household_id IS NOT NULL OR person_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS social_distributions_scope_idx ON social_distributions(organization_id,distributed_on DESC,distribution_type);

CREATE TABLE IF NOT EXISTS social_questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), name text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]', active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,name)
);
CREATE TABLE IF NOT EXISTS social_questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), questionnaire_id uuid NOT NULL REFERENCES social_questionnaires(id),
  household_id uuid REFERENCES social_households(id), person_id uuid REFERENCES people(id), answers jsonb NOT NULL DEFAULT '{}', responded_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id), CHECK(household_id IS NOT NULL OR person_id IS NOT NULL)
);

INSERT INTO permissions(code) VALUES
('social.inventory.manage'),('social.kits.manage'),('social.distributions.manage'),('social.schedules.manage'),('social.questionnaires.manage'),('social.donors.manage')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'social.%'
ON CONFLICT DO NOTHING;
INSERT INTO social_product_types(organization_id,name) SELECT id,'Alimentos' FROM organizations ON CONFLICT DO NOTHING;
