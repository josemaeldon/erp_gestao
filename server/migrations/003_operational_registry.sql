CREATE TABLE IF NOT EXISTS operational_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  module text NOT NULL,
  resource text NOT NULL,
  title text NOT NULL,
  person_id uuid REFERENCES people(id),
  status text NOT NULL DEFAULT 'active',
  occurred_at date,
  amount numeric(14,2),
  data jsonb NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS operational_records_scope_idx ON operational_records(organization_id,module,resource,created_at DESC);
CREATE INDEX IF NOT EXISTS operational_records_person_idx ON operational_records(organization_id,person_id) WHERE person_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS operational_records_data_idx ON operational_records USING gin(data);

INSERT INTO permissions(code) VALUES
('registry.view'),('registry.create'),('registry.update'),('registry.delete'),('registry.export')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='Administrador' AND p.code LIKE 'registry.%'
ON CONFLICT DO NOTHING;
