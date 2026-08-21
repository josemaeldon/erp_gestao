ALTER TABLE people ADD COLUMN IF NOT EXISTS preferred_name text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS marital_status text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS occupation text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS address_number text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS neighborhood text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE people ADD COLUMN IF NOT EXISTS state text;

CREATE TABLE IF NOT EXISTS parish_communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), name text NOT NULL,
  patron text, address text, phone text, coordinator_person_id uuid REFERENCES people(id), active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,name)
);

CREATE TABLE IF NOT EXISTS parish_households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), community_id uuid REFERENCES parish_communities(id),
  name text NOT NULL, phone text, postal_code text, address text, address_number text, neighborhood text, city text, state text,
  notes text, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS parish_households_scope_idx ON parish_households(organization_id,community_id,name);

CREATE TABLE IF NOT EXISTS parish_household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), household_id uuid NOT NULL REFERENCES parish_households(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES people(id), relationship text NOT NULL DEFAULT 'member', is_responsible boolean NOT NULL DEFAULT false,
  joined_on date NOT NULL DEFAULT current_date, left_on date, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(household_id,person_id)
);
CREATE INDEX IF NOT EXISTS parish_household_members_person_idx ON parish_household_members(organization_id,person_id);

CREATE TABLE IF NOT EXISTS person_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid NOT NULL REFERENCES people(id),
  related_person_id uuid NOT NULL REFERENCES people(id), relationship_type text NOT NULL, notes text, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(person_id<>related_person_id), UNIQUE(organization_id,person_id,related_person_id,relationship_type)
);

CREATE TABLE IF NOT EXISTS pastoral_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), community_id uuid REFERENCES parish_communities(id),
  entity_type text NOT NULL CHECK(entity_type IN ('ministry','pastoral','movement','group','service')), name text NOT NULL, description text,
  meeting_schedule text, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,entity_type,name)
);

CREATE TABLE IF NOT EXISTS pastoral_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), entity_id uuid NOT NULL REFERENCES pastoral_entities(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES people(id), role_name text NOT NULL DEFAULT 'Membro', is_coordinator boolean NOT NULL DEFAULT false,
  joined_on date NOT NULL DEFAULT current_date, left_on date, status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','leave')),
  notes text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(entity_id,person_id,joined_on)
);
CREATE INDEX IF NOT EXISTS pastoral_memberships_scope_idx ON pastoral_memberships(organization_id,entity_id,status);

CREATE TABLE IF NOT EXISTS service_attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid REFERENCES people(id),
  community_id uuid REFERENCES parish_communities(id), protocol text NOT NULL, channel text NOT NULL CHECK(channel IN ('presential','phone','whatsapp','email','portal','other')),
  service_type text NOT NULL, subject text NOT NULL, description text, attended_by uuid REFERENCES users(id), attended_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','pending','resolved','cancelled')), resolution text, resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,protocol)
);
CREATE INDEX IF NOT EXISTS service_attendances_scope_idx ON service_attendances(organization_id,status,attended_at DESC);

CREATE TABLE IF NOT EXISTS volunteer_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid NOT NULL REFERENCES people(id),
  entity_id uuid REFERENCES pastoral_entities(id), term_version text NOT NULL, activity text NOT NULL, started_on date NOT NULL, ended_on date,
  accepted_at timestamptz, revoked_at timestamptz, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','revoked','expired')),
  notes text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lgpd_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid NOT NULL REFERENCES people(id),
  purpose text NOT NULL, legal_basis text NOT NULL, channel text NOT NULL DEFAULT 'written', term_version text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz, revoked_at timestamptz, evidence text,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,person_id,purpose,term_version)
);

CREATE TABLE IF NOT EXISTS lgpd_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid NOT NULL REFERENCES people(id),
  protocol text NOT NULL, request_type text NOT NULL CHECK(request_type IN ('access','correction','portability','deletion','anonymization','consent_revocation','information')),
  description text, requested_at timestamptz NOT NULL DEFAULT now(), due_at date NOT NULL, status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','completed','denied','cancelled')),
  response text, resolved_at timestamptz, handled_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,protocol)
);
CREATE INDEX IF NOT EXISTS lgpd_requests_scope_idx ON lgpd_requests(organization_id,status,due_at);

CREATE TABLE IF NOT EXISTS person_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid NOT NULL REFERENCES people(id),
  direction text NOT NULL CHECK(direction IN ('incoming','outgoing')), origin_destination text NOT NULL, requested_on date NOT NULL DEFAULT current_date,
  effective_on date, reason text, status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','approved','completed','cancelled')),
  document_emission_id uuid REFERENCES document_emissions(id), created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS person_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), label text NOT NULL, field_key text NOT NULL,
  field_type text NOT NULL CHECK(field_type IN ('text','number','date','boolean','select','textarea')), options jsonb NOT NULL DEFAULT '[]',
  required boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,field_key)
);
CREATE TABLE IF NOT EXISTS person_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  field_definition_id uuid NOT NULL REFERENCES person_field_definitions(id) ON DELETE CASCADE, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(person_id,field_definition_id)
);

INSERT INTO permissions(code) VALUES
('people.households.manage'),('people.relationships.manage'),('people.communities.manage'),('people.pastoral.manage'),
('people.attendance.manage'),('people.volunteers.manage'),('people.lgpd.manage'),('people.transfers.manage'),('people.fields.manage')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='Administrador' AND p.code LIKE 'people.%' ON CONFLICT DO NOTHING;
