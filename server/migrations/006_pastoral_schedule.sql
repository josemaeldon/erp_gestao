CREATE TABLE IF NOT EXISTS pastoral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  parent_event_id uuid REFERENCES pastoral_events(id) ON DELETE CASCADE,
  type text NOT NULL CHECK(type IN ('appointment','mass','meeting','celebration','course','other')),
  title text NOT NULL, description text, location text, community text, celebrant text, responsible text,
  starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
  all_day boolean NOT NULL DEFAULT false, visibility text NOT NULL DEFAULT 'internal' CHECK(visibility IN ('internal','public')),
  status text NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','confirmed','completed','cancelled')),
  recurrence text NOT NULL DEFAULT 'none' CHECK(recurrence IN ('none','daily','weekly','monthly')),
  recurrence_count integer NOT NULL DEFAULT 1 CHECK(recurrence_count BETWEEN 1 AND 104),
  notes text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS pastoral_events_scope_date_idx ON pastoral_events(organization_id,starts_at,status);

CREATE TABLE IF NOT EXISTS mass_intention_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL, suggested_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(suggested_amount>=0), active boolean NOT NULL DEFAULT true,
  UNIQUE(organization_id,name)
);
CREATE TABLE IF NOT EXISTS mass_intentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  event_id uuid REFERENCES pastoral_events(id), intention_type_id uuid REFERENCES mass_intention_types(id), requester_id uuid REFERENCES people(id),
  intention_for text NOT NULL, request_text text, amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(amount>=0), payment_method text,
  status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','scheduled','celebrated','cancelled')),
  financial_transaction_id uuid REFERENCES financial_transactions(id), receipt_emission_id uuid REFERENCES document_emissions(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mass_intentions_scope_idx ON mass_intentions(organization_id,status,created_at DESC);

CREATE TABLE IF NOT EXISTS pastoral_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL, category text, instructor text, location text, capacity integer CHECK(capacity IS NULL OR capacity>0),
  starts_on date, ends_on date, schedule_text text, fee numeric(14,2) NOT NULL DEFAULT 0 CHECK(fee>=0),
  status text NOT NULL DEFAULT 'planning' CHECK(status IN ('planning','enrollment','in_progress','completed','cancelled')),
  description text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pastoral_courses_scope_idx ON pastoral_courses(organization_id,status,starts_on);
CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  course_id uuid NOT NULL REFERENCES pastoral_courses(id) ON DELETE CASCADE, person_id uuid NOT NULL REFERENCES people(id),
  status text NOT NULL DEFAULT 'enrolled' CHECK(status IN ('enrolled','waitlist','completed','cancelled')),
  enrolled_at timestamptz NOT NULL DEFAULT now(), notes text, UNIQUE(course_id,person_id)
);
CREATE INDEX IF NOT EXISTS course_enrollments_scope_idx ON course_enrollments(organization_id,course_id,status);

INSERT INTO mass_intention_types(organization_id,name,suggested_amount) VALUES
('00000000-0000-0000-0000-000000000001','Ação de graças',0),
('00000000-0000-0000-0000-000000000001','Falecimento',0),
('00000000-0000-0000-0000-000000000001','Saúde',0),
('00000000-0000-0000-0000-000000000001','Aniversário',0)
ON CONFLICT DO NOTHING;

INSERT INTO permissions(code) VALUES
('agenda.view'),('agenda.create'),('agenda.update'),('agenda.cancel'),
('intentions.view'),('intentions.create'),('intentions.update'),
('courses.view'),('courses.create'),('courses.enroll')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='Administrador' AND (p.code LIKE 'agenda.%' OR p.code LIKE 'intentions.%' OR p.code LIKE 'courses.%')
ON CONFLICT DO NOTHING;
