CREATE TABLE IF NOT EXISTS course_advisors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), course_id uuid NOT NULL REFERENCES pastoral_courses(id) ON DELETE CASCADE,
  person_id uuid REFERENCES people(id), name text NOT NULL, role text, email text, phone text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS course_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), course_id uuid NOT NULL REFERENCES pastoral_courses(id) ON DELETE CASCADE,
  title text NOT NULL, starts_at timestamptz NOT NULL, ends_at timestamptz, location text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS course_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), session_id uuid NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE, checked_in_at timestamptz NOT NULL DEFAULT now(), label_code text NOT NULL,
  UNIQUE(session_id,enrollment_id)
);
CREATE TABLE IF NOT EXISTS course_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), enrollment_id uuid NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  competence date NOT NULL, due_date date NOT NULL, amount numeric(14,2) NOT NULL CHECK(amount>0), status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','paid','cancelled')),
  paid_on date, financial_transaction_id uuid REFERENCES financial_transactions(id), UNIQUE(enrollment_id,competence)
);
CREATE TABLE IF NOT EXISTS course_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), enrollment_id uuid NOT NULL REFERENCES course_enrollments(id),
  certificate_code text NOT NULL, issued_on date NOT NULL, workload_hours numeric(8,2), validation_code text NOT NULL, issued_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,certificate_code), UNIQUE(enrollment_id)
);
CREATE TABLE IF NOT EXISTS agenda_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid REFERENCES people(id),
  name text NOT NULL, phone_type text NOT NULL DEFAULT 'celular', phone text NOT NULL, email text, notes text, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS tomb_book_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), entry_number bigint GENERATED ALWAYS AS IDENTITY,
  entry_date date NOT NULL, title text NOT NULL, content text NOT NULL, category text, signed_by text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), campaign_id uuid NOT NULL REFERENCES fundraising_campaigns(id) ON DELETE CASCADE,
  batch_number bigint GENERATED ALWAYS AS IDENTITY, description text NOT NULL, pledge_ids uuid[] NOT NULL DEFAULT '{}', total_amount numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'generated' CHECK(status IN ('generated','emailed','cancelled')), emailed_at timestamptz, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cemetery_service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), code text NOT NULL, name text NOT NULL,
  price numeric(14,2) NOT NULL DEFAULT 0 CHECK(price>=0), active boolean NOT NULL DEFAULT true, UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS cemetery_service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), grave_id uuid REFERENCES cemetery_graves(id),
  service_id uuid NOT NULL REFERENCES cemetery_service_catalog(id), requester_id uuid REFERENCES people(id), requester_name text NOT NULL,
  ordered_on date NOT NULL, scheduled_on date, amount numeric(14,2) NOT NULL CHECK(amount>=0), status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','scheduled','completed','cancelled')),
  receipt_number bigint GENERATED ALWAYS AS IDENTITY, financial_transaction_id uuid REFERENCES financial_transactions(id), notes text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO permissions(code) VALUES
('courses.operations.manage'),('agenda.contacts.manage'),('agenda.tomb_book.manage'),('campaigns.batches.manage'),('cemetery.services.manage')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND (p.code LIKE 'courses.%' OR p.code LIKE 'agenda.%' OR p.code LIKE 'campaigns.%' OR p.code LIKE 'cemetery.%')
ON CONFLICT DO NOTHING;
INSERT INTO cemetery_service_catalog(organization_id,code,name,price) SELECT id,'SEP','Serviço de sepultamento',0 FROM organizations ON CONFLICT DO NOTHING;
