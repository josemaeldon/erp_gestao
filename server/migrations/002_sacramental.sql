CREATE TABLE IF NOT EXISTS sacramental_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  type text NOT NULL CHECK (type IN ('baptism','confirmation','eucharist','marriage')),
  person_id uuid REFERENCES people(id),
  related_person_id uuid REFERENCES people(id),
  status text NOT NULL DEFAULT 'draft',
  celebration_date date,
  celebration_time time,
  community text,
  celebrant text,
  book text,
  page text,
  number text,
  verso text,
  notes text,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sacramental_org_type_idx ON sacramental_records(organization_id,type,celebration_date DESC);
CREATE TABLE IF NOT EXISTS catechesis_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL, stage text NOT NULL, community text, catechist text, assistant text,
  weekday text, start_time time, room text, period text, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS catechesis_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  group_id uuid NOT NULL REFERENCES catechesis_groups(id), person_id uuid NOT NULL REFERENCES people(id),
  status text NOT NULL DEFAULT 'active', enrolled_at date NOT NULL DEFAULT current_date,
  UNIQUE(group_id, person_id)
);
