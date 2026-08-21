CREATE TABLE IF NOT EXISTS attachments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), entity_type text NOT NULL, entity_id uuid NOT NULL,
 filename text NOT NULL, mime_type text NOT NULL, size_bytes bigint NOT NULL CHECK(size_bytes>0), sha256 text NOT NULL, object_key text NOT NULL,
 description text, uploaded_by uuid REFERENCES users(id), uploaded_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
 UNIQUE(organization_id,object_key)
);
CREATE INDEX IF NOT EXISTS attachments_entity_idx ON attachments(organization_id,entity_type,entity_id,deleted_at);
CREATE TABLE IF NOT EXISTS report_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), report_type text NOT NULL, title text NOT NULL,
 output_format text NOT NULL CHECK(output_format IN ('pdf','csv')), filters jsonb NOT NULL DEFAULT '{}', row_count integer NOT NULL DEFAULT 0,
 sha256 text, generated_by uuid REFERENCES users(id), generated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS report_runs_scope_idx ON report_runs(organization_id,report_type,generated_at DESC);
INSERT INTO permissions(code) VALUES ('attachments.view'),('attachments.upload'),('attachments.delete'),('reports.view'),('reports.generate') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND (p.code LIKE 'attachments.%' OR p.code LIKE 'reports.%') ON CONFLICT DO NOTHING;
