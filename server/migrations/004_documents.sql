CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  document_type text NOT NULL,
  title text NOT NULL,
  body_template text NOT NULL,
  header_text text,
  footer_text text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,code)
);

CREATE TABLE IF NOT EXISTS document_emissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  template_id uuid REFERENCES document_templates(id),
  document_type text NOT NULL,
  source_entity text,
  source_id uuid,
  person_id uuid REFERENCES people(id),
  validation_code text NOT NULL UNIQUE,
  title text NOT NULL,
  snapshot jsonb NOT NULL DEFAULT '{}',
  emitted_by uuid REFERENCES users(id),
  emitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS document_emissions_scope_idx ON document_emissions(organization_id,document_type,emitted_at DESC);
CREATE INDEX IF NOT EXISTS document_emissions_person_idx ON document_emissions(organization_id,person_id) WHERE person_id IS NOT NULL;

INSERT INTO permissions(code) VALUES ('documents.view'),('documents.issue'),('documents.manage_templates'),('documents.validate') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='Administrador' AND p.code LIKE 'documents.%'
ON CONFLICT DO NOTHING;

INSERT INTO document_templates(organization_id,code,name,document_type,title,body_template,header_text,footer_text)
VALUES
('00000000-0000-0000-0000-000000000001','baptism-certificate','Certidão de Batismo','certificate','CERTIDÃO DE BATISMO','Certificamos que {{person_name}} consta no livro sacramental desta paróquia, conforme Livro {{book}}, Folha {{page}}, Número {{number}}, tendo recebido o Sacramento do Batismo em {{celebration_date}}.','PARÓQUIA SANTA LUZIA','Documento emitido pelo Núcleo Eclesial.'),
('00000000-0000-0000-0000-000000000001','confirmation-certificate','Certidão de Crisma','certificate','CERTIDÃO DE CRISMA','Certificamos que {{person_name}} recebeu o Sacramento da Crisma em {{celebration_date}}, conforme Livro {{book}}, Folha {{page}}, Número {{number}}.','PARÓQUIA SANTA LUZIA','Documento emitido pelo Núcleo Eclesial.'),
('00000000-0000-0000-0000-000000000001','marriage-certificate','Certidão de Matrimônio','certificate','CERTIDÃO DE MATRIMÔNIO','Certificamos o registro matrimonial de {{person_name}} e {{related_person_name}}, celebrado em {{celebration_date}}, conforme Livro {{book}}, Folha {{page}}, Número {{number}}.','PARÓQUIA SANTA LUZIA','Documento emitido pelo Núcleo Eclesial.'),
('00000000-0000-0000-0000-000000000001','generic-receipt','Recibo','receipt','RECIBO','Recebemos de {{person_name}} a importância de {{amount}}, referente a {{description}}, em {{occurred_at}}.','PARÓQUIA SANTA LUZIA','Documento emitido pelo Núcleo Eclesial.')
ON CONFLICT(organization_id,code) DO NOTHING;
