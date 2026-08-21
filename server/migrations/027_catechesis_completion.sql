ALTER TABLE catechesis_enrollments
  ADD COLUMN IF NOT EXISTS sacramental_application_id uuid REFERENCES sacramental_applications(id);

CREATE TABLE IF NOT EXISTS catechesis_certificate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  enrollment_id uuid NOT NULL REFERENCES catechesis_enrollments(id), requested_on date NOT NULL DEFAULT current_date,
  purpose text, status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','issued','cancelled')),
  document_emission_id uuid REFERENCES document_emissions(id), requested_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS catechesis_certificate_requests_scope_idx ON catechesis_certificate_requests(organization_id,status,requested_on DESC);

CREATE TABLE IF NOT EXISTS catechesis_book_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  enrollment_id uuid NOT NULL UNIQUE REFERENCES catechesis_enrollments(id), book text NOT NULL, page text NOT NULL,
  entry_number text NOT NULL, recorded_on date NOT NULL DEFAULT current_date, notes text, recorded_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,book,page,entry_number)
);

CREATE TABLE IF NOT EXISTS catechesis_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  enrollment_id uuid NOT NULL REFERENCES catechesis_enrollments(id), description text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK(amount>0), due_on date, paid_on date,
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','paid','waived','cancelled')),
  payment_method text, receipt_number text, financial_transaction_id uuid REFERENCES financial_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS catechesis_fees_scope_idx ON catechesis_fees(organization_id,status,due_on);

INSERT INTO document_templates(organization_id,code,name,document_type,title,body_template,header_text,footer_text)
VALUES ('00000000-0000-0000-0000-000000000001','catechesis-certificate','Certificado de Catequese','certificate','CERTIFICADO DE CATEQUESE','Certificamos que {{person_name}} concluiu a etapa {{stage_name}}, na turma {{group_name}}, em {{completed_at}}, com frequência de {{attendance_percent}}%.','PARÓQUIA SANTA LUZIA','Documento verificável pelo código de validação.')
ON CONFLICT(organization_id,code) DO NOTHING;

INSERT INTO permissions(code) VALUES
('catechesis.cancel'),('catechesis.export'),('catechesis.certificates.manage'),('catechesis.books.manage'),('catechesis.fees.manage')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='Administrador' AND p.code LIKE 'catechesis.%' ON CONFLICT DO NOTHING;
