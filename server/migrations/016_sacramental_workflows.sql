CREATE TABLE IF NOT EXISTS sacramental_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  sacrament_type text NOT NULL CHECK(sacrament_type IN ('baptism','confirmation','eucharist','marriage')),
  code text NOT NULL, title text NOT NULL, volume integer NOT NULL DEFAULT 1, starts_on date, ends_on date,
  first_page integer NOT NULL DEFAULT 1, last_page integer, next_number integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed','archived')),
  opening_term text, closing_term text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,sacrament_type,code)
);
CREATE INDEX IF NOT EXISTS sacramental_books_scope_idx ON sacramental_books(organization_id,sacrament_type,status,created_at DESC);

CREATE TABLE IF NOT EXISTS sacramental_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  sacrament_type text NOT NULL CHECK(sacrament_type IN ('baptism','confirmation','eucharist','marriage')),
  person_id uuid NOT NULL REFERENCES people(id), related_person_id uuid REFERENCES people(id), protocol text NOT NULL,
  requested_on date NOT NULL DEFAULT current_date, planned_date date, community text,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','documents','approved','scheduled','completed','cancelled','transferred')),
  notes text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,protocol)
);
CREATE INDEX IF NOT EXISTS sacramental_applications_scope_idx ON sacramental_applications(organization_id,sacrament_type,status,requested_on DESC);

CREATE TABLE IF NOT EXISTS sacramental_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  sacrament_type text NOT NULL CHECK(sacrament_type IN ('baptism','confirmation','eucharist','marriage')),
  code text NOT NULL, name text NOT NULL, required boolean NOT NULL DEFAULT true, validity_days integer, active boolean NOT NULL DEFAULT true,
  UNIQUE(organization_id,sacrament_type,code)
);
CREATE TABLE IF NOT EXISTS sacramental_application_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  application_id uuid NOT NULL REFERENCES sacramental_applications(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES sacramental_requirements(id), status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','received','waived','rejected')),
  received_on date, expires_on date, reference text, notes text, checked_by uuid REFERENCES users(id), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(application_id,requirement_id)
);
CREATE INDEX IF NOT EXISTS sacramental_requirements_application_idx ON sacramental_application_requirements(application_id,status);

CREATE TABLE IF NOT EXISTS sacramental_witnesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  application_id uuid REFERENCES sacramental_applications(id) ON DELETE CASCADE, record_id uuid REFERENCES sacramental_records(id) ON DELETE CASCADE,
  person_id uuid REFERENCES people(id), name text NOT NULL, role text NOT NULL, document text, phone text,
  canonical_eligibility text NOT NULL DEFAULT 'pending' CHECK(canonical_eligibility IN ('pending','eligible','dispensed','ineligible')),
  notes text, created_at timestamptz NOT NULL DEFAULT now(), CHECK(application_id IS NOT NULL OR record_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS sacramental_witnesses_application_idx ON sacramental_witnesses(organization_id,application_id,role);

CREATE TABLE IF NOT EXISTS sacramental_amendments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), record_id uuid NOT NULL REFERENCES sacramental_records(id),
  amendment_type text NOT NULL CHECK(amendment_type IN ('correction','annotation','cancellation','legitimation','adoption','marriage_note','death_note')),
  reason text NOT NULL, previous_values jsonb NOT NULL DEFAULT '{}', new_values jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','approved','rejected','applied')),
  requested_by uuid REFERENCES users(id), approved_by uuid REFERENCES users(id), requested_at timestamptz NOT NULL DEFAULT now(), approved_at timestamptz, applied_at timestamptz
);
CREATE INDEX IF NOT EXISTS sacramental_amendments_record_idx ON sacramental_amendments(organization_id,record_id,status,requested_at DESC);

CREATE TABLE IF NOT EXISTS sacramental_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), application_id uuid REFERENCES sacramental_applications(id), record_id uuid REFERENCES sacramental_records(id),
  direction text NOT NULL CHECK(direction IN ('incoming','outgoing')), destination_organization text, origin_organization text,
  protocol text NOT NULL, requested_on date NOT NULL DEFAULT current_date, sent_on date, received_on date,
  status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','sent','received','accepted','rejected','cancelled')),
  notes text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,protocol), CHECK(application_id IS NOT NULL OR record_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS sacramental_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), application_id uuid REFERENCES sacramental_applications(id), record_id uuid REFERENCES sacramental_records(id),
  fee_type text NOT NULL, description text NOT NULL, amount numeric(14,2) NOT NULL CHECK(amount>0), due_on date, paid_on date,
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','paid','waived','cancelled')), payment_method text,
  financial_transaction_id uuid REFERENCES financial_transactions(id), created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(application_id IS NOT NULL OR record_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS sacramental_fees_scope_idx ON sacramental_fees(organization_id,status,due_on);

CREATE TABLE IF NOT EXISTS marriage_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), application_id uuid NOT NULL UNIQUE REFERENCES sacramental_applications(id) ON DELETE CASCADE,
  groom_id uuid NOT NULL REFERENCES people(id), bride_id uuid NOT NULL REFERENCES people(id), parish_of_celebration text,
  civil_effect boolean NOT NULL DEFAULT false, process_kind text NOT NULL DEFAULT 'ordinary',
  canonical_status text NOT NULL DEFAULT 'instruction' CHECK(canonical_status IN ('instruction','banns','dispensation','authorized','celebrated','cancelled')),
  impediments jsonb NOT NULL DEFAULT '[]', dispensations jsonb NOT NULL DEFAULT '[]', delegation text, consent_notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CHECK(groom_id<>bride_id)
);
CREATE TABLE IF NOT EXISTS marriage_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), marriage_case_id uuid NOT NULL REFERENCES marriage_cases(id) ON DELETE CASCADE,
  interviewee text NOT NULL CHECK(interviewee IN ('groom','bride','couple','witness')),
  scheduled_at timestamptz, conducted_at timestamptz, interviewer text, answers jsonb NOT NULL DEFAULT '{}', conclusion text,
  status text NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled')), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS marriage_banns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), marriage_case_id uuid NOT NULL REFERENCES marriage_cases(id) ON DELETE CASCADE,
  parish text NOT NULL, publication_start date NOT NULL, publication_end date NOT NULL, result text NOT NULL DEFAULT 'pending' CHECK(result IN ('pending','clear','objection','dispensed')),
  objection_notes text, certificate_reference text, created_at timestamptz NOT NULL DEFAULT now(), CHECK(publication_end>=publication_start)
);
CREATE INDEX IF NOT EXISTS marriage_cases_scope_idx ON marriage_cases(organization_id,canonical_status,created_at DESC);

ALTER TABLE sacramental_records ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES sacramental_applications(id);
ALTER TABLE sacramental_records ADD COLUMN IF NOT EXISTS book_id uuid REFERENCES sacramental_books(id);
ALTER TABLE sacramental_records ADD COLUMN IF NOT EXISTS registered_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS sacramental_book_number_uidx ON sacramental_records(organization_id,book_id,number) WHERE book_id IS NOT NULL AND number IS NOT NULL;

INSERT INTO sacramental_requirements(organization_id,sacrament_type,code,name,required) VALUES
('00000000-0000-0000-0000-000000000001','baptism','birth_certificate','Certidão de nascimento',true),
('00000000-0000-0000-0000-000000000001','baptism','godparents','Dados e habilitação dos padrinhos',true),
('00000000-0000-0000-0000-000000000001','confirmation','baptism_certificate','Certidão de batismo',true),
('00000000-0000-0000-0000-000000000001','eucharist','baptism_certificate','Certidão de batismo',true),
('00000000-0000-0000-0000-000000000001','marriage','birth_certificates','Certidões atualizadas dos nubentes',true),
('00000000-0000-0000-0000-000000000001','marriage','baptism_certificates','Certidões de batismo com anotação',true),
('00000000-0000-0000-0000-000000000001','marriage','banns','Proclamas matrimoniais',true),
('00000000-0000-0000-0000-000000000001','marriage','interviews','Entrevistas canônicas',true)
ON CONFLICT DO NOTHING;

INSERT INTO permissions(code) VALUES
('sacraments.view'),('sacraments.applications.manage'),('sacraments.requirements.manage'),('sacraments.books.manage'),
('sacraments.register'),('sacraments.amendments.request'),('sacraments.amendments.approve'),('sacraments.transfers.manage'),
('sacraments.fees.manage'),('marriage.cases.manage'),('marriage.cases.authorize')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='Administrador' AND (p.code LIKE 'sacraments.%' OR p.code LIKE 'marriage.%') ON CONFLICT DO NOTHING;
