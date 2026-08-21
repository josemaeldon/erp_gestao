CREATE TABLE IF NOT EXISTS organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  setting_group text NOT NULL, setting_key text NOT NULL, value jsonb NOT NULL DEFAULT 'null',
  updated_by uuid REFERENCES users(id), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,setting_group,setting_key)
);
CREATE INDEX IF NOT EXISTS organization_settings_group_idx ON organization_settings(organization_id,setting_group);

CREATE TABLE IF NOT EXISTS integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL, provider text NOT NULL, integration_type text NOT NULL,
  base_url text, config jsonb NOT NULL DEFAULT '{}', encrypted_secret text, inbound_token_hash text,
  status text NOT NULL DEFAULT 'inactive' CHECK(status IN ('inactive','active','error')),
  last_tested_at timestamptz, last_error text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS integration_connections_scope_idx ON integration_connections(organization_id,integration_type,status);

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL, endpoint_url text NOT NULL, event_types text[] NOT NULL, encrypted_secret text NOT NULL,
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS webhook_subscriptions_scope_idx ON webhook_subscriptions(organization_id,active);
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  subscription_id uuid NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_type text NOT NULL, payload jsonb NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','delivered','failed')),
  attempt_count integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(), response_status integer,
  response_excerpt text, last_error text, delivered_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS webhook_delivery_queue_idx ON webhook_deliveries(status,next_attempt_at) WHERE status IN ('pending','failed');

CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  code text NOT NULL, name text NOT NULL, channel text NOT NULL CHECK(channel IN ('email','sms','whatsapp','push','internal')),
  subject_template text, body_template text NOT NULL, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,code)
);
CREATE TABLE IF NOT EXISTS notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  template_id uuid REFERENCES notification_templates(id), person_id uuid REFERENCES people(id), channel text NOT NULL,
  destination text NOT NULL, subject text, body text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','sent','failed','cancelled')),
  attempt_count integer NOT NULL DEFAULT 0, scheduled_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz,
  last_error text, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notification_jobs_queue_idx ON notification_jobs(status,scheduled_at) WHERE status IN ('pending','failed');
CREATE TABLE IF NOT EXISTS integration_delivery_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  entity_type text NOT NULL, entity_id uuid NOT NULL, provider text, attempted_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL, response_status integer, response_excerpt text, error_message text, duration_ms integer
);
CREATE INDEX IF NOT EXISTS delivery_attempts_entity_idx ON integration_delivery_attempts(organization_id,entity_type,entity_id,attempted_at DESC);

INSERT INTO integration_connections(organization_id,name,provider,integration_type,status,config)
SELECT '00000000-0000-0000-0000-000000000001','Entrega interna local','local-log','notifications','active','{"channels":["internal"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM integration_connections WHERE organization_id='00000000-0000-0000-0000-000000000001' AND provider='local-log');
INSERT INTO notification_templates(organization_id,code,name,channel,subject_template,body_template) VALUES
('00000000-0000-0000-0000-000000000001','WELCOME','Boas-vindas','internal','Bem-vindo(a), {{name}}','Olá, {{name}}. Seu cadastro paroquial está ativo.'),
('00000000-0000-0000-0000-000000000001','EVENT_REMINDER','Lembrete de evento','internal','Lembrete: {{event}}','Olá, {{name}}. O evento {{event}} será em {{date}}.')
ON CONFLICT DO NOTHING;
INSERT INTO permissions(code) VALUES ('connectivity.view'),('connectivity.connections.manage'),('connectivity.webhooks.manage'),('connectivity.notifications.send'),('connectivity.queue.process'),('settings.view'),('settings.update') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.name='Administrador' AND (p.code LIKE 'connectivity.%' OR p.code LIKE 'settings.%') ON CONFLICT DO NOTHING;
