CREATE TABLE IF NOT EXISTS catechesis_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL, name text NOT NULL, sequence integer NOT NULL DEFAULT 1, sacrament_type text,
  minimum_attendance_percent numeric(5,2) NOT NULL DEFAULT 75 CHECK(minimum_attendance_percent BETWEEN 0 AND 100),
  active boolean NOT NULL DEFAULT true, UNIQUE(organization_id,code)
);
ALTER TABLE catechesis_groups ADD COLUMN IF NOT EXISTS stage_id uuid REFERENCES catechesis_stages(id);
ALTER TABLE catechesis_groups ADD COLUMN IF NOT EXISTS capacity integer CHECK(capacity IS NULL OR capacity>0);
ALTER TABLE catechesis_groups ADD COLUMN IF NOT EXISTS starts_on date;
ALTER TABLE catechesis_groups ADD COLUMN IF NOT EXISTS ends_on date;
ALTER TABLE catechesis_groups ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE catechesis_enrollments ADD COLUMN IF NOT EXISTS sponsor_name text;
ALTER TABLE catechesis_enrollments ADD COLUMN IF NOT EXISTS completed_at date;
ALTER TABLE catechesis_enrollments ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE catechesis_enrollments ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE catechesis_enrollments ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS catechesis_enrollments_scope_idx ON catechesis_enrollments(organization_id,group_id,status);

CREATE TABLE IF NOT EXISTS catechesis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  group_id uuid NOT NULL REFERENCES catechesis_groups(id) ON DELETE CASCADE, session_date date NOT NULL,
  starts_at time, ends_at time, topic text NOT NULL, session_type text NOT NULL DEFAULT 'class', catechist text, notes text,
  status text NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','held','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(group_id,session_date,starts_at)
);
CREATE INDEX IF NOT EXISTS catechesis_sessions_scope_idx ON catechesis_sessions(organization_id,group_id,session_date DESC);
CREATE TABLE IF NOT EXISTS catechesis_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  session_id uuid NOT NULL REFERENCES catechesis_sessions(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES catechesis_enrollments(id) ON DELETE CASCADE,
  status text NOT NULL CHECK(status IN ('present','absent','justified')), notes text,
  recorded_at timestamptz NOT NULL DEFAULT now(), UNIQUE(session_id,enrollment_id)
);
CREATE INDEX IF NOT EXISTS catechesis_attendance_enrollment_idx ON catechesis_attendance(organization_id,enrollment_id,status);
CREATE TABLE IF NOT EXISTS catechesis_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  enrollment_id uuid NOT NULL REFERENCES catechesis_enrollments(id), from_group_id uuid NOT NULL REFERENCES catechesis_groups(id),
  to_group_id uuid NOT NULL REFERENCES catechesis_groups(id), transferred_on date NOT NULL DEFAULT current_date, reason text,
  created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO catechesis_stages(organization_id,code,name,sequence,sacrament_type,minimum_attendance_percent) VALUES
('00000000-0000-0000-0000-000000000001','PRE','Pré-catequese',1,null,70),
('00000000-0000-0000-0000-000000000001','EUC1','Eucaristia I',2,'eucharist',75),
('00000000-0000-0000-0000-000000000001','EUC2','Eucaristia II',3,'eucharist',75),
('00000000-0000-0000-0000-000000000001','CRI1','Crisma I',4,'confirmation',75),
('00000000-0000-0000-0000-000000000001','CRI2','Crisma II',5,'confirmation',75)
ON CONFLICT DO NOTHING;
UPDATE catechesis_groups cg SET stage_id=cs.id FROM catechesis_stages cs WHERE cg.stage_id IS NULL AND cg.organization_id=cs.organization_id AND lower(cg.stage)=lower(cs.name);
INSERT INTO permissions(code) VALUES ('catechesis.view'),('catechesis.groups.create'),('catechesis.enroll'),('catechesis.sessions.create'),('catechesis.attendance.manage'),('catechesis.transfer'),('catechesis.complete') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND p.code LIKE 'catechesis.%' ON CONFLICT DO NOTHING;
