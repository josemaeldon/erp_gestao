CREATE TABLE IF NOT EXISTS payment_provider_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  provider_type text NOT NULL CHECK(provider_type IN ('pix','boleto','card','bank_file')), provider text NOT NULL,
  name text NOT NULL, account_id uuid REFERENCES financial_accounts(id), settings jsonb NOT NULL DEFAULT '{}', encrypted_secret text,
  status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','error')), last_tested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,provider_type,name)
);
CREATE INDEX IF NOT EXISTS payment_provider_scope_idx ON payment_provider_configs(organization_id,provider_type,status);

CREATE TABLE IF NOT EXISTS pix_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), provider_config_id uuid REFERENCES payment_provider_configs(id),
  person_id uuid REFERENCES people(id), source_entity text, source_id uuid, txid text NOT NULL, description text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK(amount>0), expires_at timestamptz NOT NULL, copy_paste_code text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','paid','expired','cancelled','refunded')),
  paid_at timestamptz, end_to_end_id text, financial_transaction_id uuid REFERENCES financial_transactions(id), created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,txid)
);
CREATE INDEX IF NOT EXISTS pix_charges_scope_idx ON pix_charges(organization_id,status,expires_at);

CREATE TABLE IF NOT EXISTS boleto_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), account_id uuid NOT NULL REFERENCES financial_accounts(id),
  bank_code text NOT NULL, agreement_number text NOT NULL, wallet text NOT NULL, beneficiary_document text, beneficiary_name text NOT NULL,
  sequence_number bigint NOT NULL DEFAULT 1, interest_percent numeric(8,4) NOT NULL DEFAULT 0, fine_percent numeric(8,4) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,bank_code,agreement_number)
);
CREATE TABLE IF NOT EXISTS bank_slips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), agreement_id uuid NOT NULL REFERENCES boleto_agreements(id),
  obligation_id uuid REFERENCES financial_obligations(id), person_id uuid REFERENCES people(id), our_number text NOT NULL, document_number text,
  payer_name text NOT NULL, payer_document text, payer_email text, description text NOT NULL, amount numeric(14,2) NOT NULL CHECK(amount>0),
  issued_on date NOT NULL DEFAULT current_date, due_date date NOT NULL, barcode text NOT NULL, digitable_line text NOT NULL,
  status text NOT NULL DEFAULT 'issued' CHECK(status IN ('issued','remitted','registered','paid','overdue','cancelled','rejected')),
  paid_amount numeric(14,2), paid_on date, financial_transaction_id uuid REFERENCES financial_transactions(id), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,agreement_id,our_number)
);
CREATE INDEX IF NOT EXISTS bank_slips_scope_idx ON bank_slips(organization_id,status,due_date);
CREATE TABLE IF NOT EXISTS bank_file_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), agreement_id uuid NOT NULL REFERENCES boleto_agreements(id),
  file_type text NOT NULL CHECK(file_type IN ('remittance','return')), layout text NOT NULL DEFAULT 'CNAB240', sequence_number bigint NOT NULL,
  filename text NOT NULL, content text NOT NULL, status text NOT NULL DEFAULT 'generated' CHECK(status IN ('generated','sent','processed','error')),
  record_count integer NOT NULL DEFAULT 0, total_amount numeric(14,2) NOT NULL DEFAULT 0, processed_at timestamptz, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,file_type,filename)
);
CREATE TABLE IF NOT EXISTS bank_return_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), batch_id uuid NOT NULL REFERENCES bank_file_batches(id) ON DELETE CASCADE,
  bank_slip_id uuid REFERENCES bank_slips(id), occurrence_code text NOT NULL, occurrence_date date NOT NULL, amount numeric(14,2), bank_reference text,
  status text NOT NULL CHECK(status IN ('registered','paid','rejected','fee','unknown')), raw_record text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS card_receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), provider_config_id uuid REFERENCES payment_provider_configs(id),
  person_id uuid REFERENCES people(id), brand text NOT NULL, authorization_code text NOT NULL, nsu text, sale_date date NOT NULL,
  gross_amount numeric(14,2) NOT NULL CHECK(gross_amount>0), fee_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(fee_amount>=0),
  net_amount numeric(14,2) GENERATED ALWAYS AS (gross_amount-fee_amount) STORED, installment_count integer NOT NULL DEFAULT 1 CHECK(installment_count>0),
  expected_on date NOT NULL, settled_on date, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','settled','cancelled','chargeback')),
  financial_transaction_id uuid REFERENCES financial_transactions(id), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,authorization_code,sale_date)
);
CREATE INDEX IF NOT EXISTS card_receivables_scope_idx ON card_receivables(organization_id,status,expected_on);

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), person_id uuid REFERENCES people(id),
  legal_name text NOT NULL, trade_name text, document text NOT NULL, state_registration text, municipal_registration text,
  email text, phone text, default_cfop text, tax_regime text, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,document)
);
CREATE TABLE IF NOT EXISTS fiscal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), supplier_id uuid REFERENCES suppliers(id),
  document_type text NOT NULL CHECK(document_type IN ('nfe','nfse','receipt','rpa','invoice','other')), access_key text, number text NOT NULL,
  series text, issued_on date NOT NULL, competence_date date, description text NOT NULL, gross_amount numeric(14,2) NOT NULL CHECK(gross_amount>=0),
  discount_amount numeric(14,2) NOT NULL DEFAULT 0, tax_amount numeric(14,2) NOT NULL DEFAULT 0, net_amount numeric(14,2) NOT NULL CHECK(net_amount>=0),
  cfop text, xml_content text, status text NOT NULL DEFAULT 'imported' CHECK(status IN ('imported','validated','approved','rejected','cancelled')),
  payable_id uuid REFERENCES financial_obligations(id), validation_errors jsonb NOT NULL DEFAULT '[]', created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,document_type,number,series,supplier_id)
);
CREATE INDEX IF NOT EXISTS fiscal_documents_scope_idx ON fiscal_documents(organization_id,status,issued_on DESC);

CREATE TABLE IF NOT EXISTS tax_withholdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id), fiscal_document_id uuid REFERENCES fiscal_documents(id),
  beneficiary_type text NOT NULL CHECK(beneficiary_type IN ('pf','pj')), beneficiary_document text NOT NULL, tax_type text NOT NULL,
  calculation_base numeric(14,2) NOT NULL CHECK(calculation_base>=0), rate numeric(8,4) NOT NULL CHECK(rate>=0), amount numeric(14,2) NOT NULL CHECK(amount>=0),
  competence date NOT NULL, due_date date, paid_on date, status text NOT NULL DEFAULT 'calculated' CHECK(status IN ('calculated','declared','paid','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tax_withholdings_scope_idx ON tax_withholdings(organization_id,status,competence,tax_type);

CREATE TABLE IF NOT EXISTS compliance_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  obligation_type text NOT NULL CHECK(obligation_type IN ('efd_reinf','sped_ecd','sped_ecf','dirf_receipts','income_statement','other')),
  period_start date NOT NULL, period_end date NOT NULL, protocol text, payload jsonb NOT NULL DEFAULT '{}', validation_errors jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','validated','ready','submitted','accepted','rejected','cancelled')),
  generated_by uuid REFERENCES users(id), generated_at timestamptz NOT NULL DEFAULT now(), submitted_at timestamptz, accepted_at timestamptz,
  UNIQUE(organization_id,obligation_type,period_start,period_end)
);
CREATE INDEX IF NOT EXISTS compliance_submissions_scope_idx ON compliance_submissions(organization_id,obligation_type,status,period_end DESC);

INSERT INTO permissions(code) VALUES
('payments.view'),('payments.configure'),('payments.pix.create'),('payments.pix.settle'),('payments.boleto.manage'),('payments.bank_files.manage'),('payments.cards.manage'),
('fiscal.view'),('fiscal.suppliers.manage'),('fiscal.documents.manage'),('fiscal.documents.approve'),('fiscal.withholdings.manage'),
('compliance.view'),('compliance.generate'),('compliance.validate'),('compliance.submit')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='Administrador' AND (p.code LIKE 'payments.%' OR p.code LIKE 'fiscal.%' OR p.code LIKE 'compliance.%') ON CONFLICT DO NOTHING;

INSERT INTO payment_provider_configs(organization_id,provider_type,provider,name,account_id,settings,status)
SELECT '00000000-0000-0000-0000-000000000001','pix','local-simulator','PIX local',id,'{"mode":"local"}','active'
FROM financial_accounts WHERE organization_id='00000000-0000-0000-0000-000000000001' ORDER BY name LIMIT 1
ON CONFLICT DO NOTHING;
