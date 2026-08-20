# Modelo de dados

## Núcleo e tenancy

- `organizations(id, parent_id, type, legal_name, display_name, timezone, status)` modela diocese, paróquia, comunidade, capela e CEB.
- `cost_centers(id, organization_id, parent_id, code, name, status)`.
- `users`, `sessions`, `roles`, `permissions`, `role_permissions`, `user_roles`, `access_grants`.
- `work_periods`, `notification_preferences`, `saved_filters`, `grid_preferences`.

## Pessoas e pastoral

- `people` é a identidade civil central; `faithful_profiles` adiciona estado eclesial sem duplicar pessoa.
- `addresses`, `contacts`, `families`, `family_members`, `person_relationships`.
- `pastoral_entities(type)`, `pastoral_memberships`, `mandates`.
- CPF normalizado é único por tenant quando informado; relações familiares impedem autorreferência.

## Contribuições e financeiro

- `tithe_members`, `tithe_payments`, `offering_types`, `offerings`, `campaigns`, `campaign_payments`.
- `ledger_accounts`, `cash_accounts`, `banks`, `bank_accounts`, `financial_transactions`, `financial_entries`.
- `suppliers` referencia `people`; `invoices`, `invoice_items`, `accounts_payable`, `accounts_receivable`, `settlements`, `advances`, `checks`, `transfers`, `allocation_rules`, `allocations`, `budgets`, `financial_closings`.
- Cada transação balanceia débitos/créditos; valores são `numeric(19,4)` e positivos, com direção definida pela partida.
- `source_type/source_id` possuem constraint de unicidade para impedir integração duplicada.

## Sacramentos e formação

- `sacramental_books`, `sacramental_records`, com especializações `baptisms`, `eucharists`, `confirmations`, `marriages`.
- `marriage_processes`, `marriage_parties`, `canonical_assessments`, `banns`, `marriage_documents`, `interviews`.
- `catechists`, `catechumens`, `catechesis_stages`, `catechesis_groups`, `enrollments`, `attendance`, `transfers`.
- Chave única de livro: instituição + tipo + livro + folha + verso + número.

## Secretaria, patrimônio e módulos opcionais

- `agenda_events`, `courses`, `course_participants`, `masses`, `mass_intentions`, `notices`, `tomb_book_entries`.
- `assets`, `asset_depreciations`, `properties`, `rental_contracts`, `inventory_products`, `inventory_movements`.
- `cemeteries`, `cemetery_units`, `burials`, `concessions`.
- `employees`, `payroll_periods`, `payroll_entries`, `clergy`, `stipends`, `benefits`.
- `social_cases`, `social_assistances`, `donation_inventory`.
- `events`, `event_products`, `pos_registers`, `pos_sessions`, `pos_sales`, `pos_sale_items`, `pos_payments`.

## Plataforma

- `attachments` armazena metadados e object key, nunca o binário.
- `document_templates`, `document_issues`, `notifications`, `webhook_events`, `outbox_events`, `audit_logs`.
- Soft delete usa `deleted_at/deleted_by`; fatos financeiros e auditoria são imutáveis e corrigidos por estorno.
