# Modelo de dados implementado

O schema executável está nas migrações `server/migrations/001_*.sql` a `028_*.sql`. Todas as tabelas operacionais possuem `organization_id`; as APIs sempre aplicam o organismo do JWT.

## Núcleo e pessoas

- `organizations`, `organization_settings`, `users`, `roles`, `permissions`, `role_permissions`, `user_roles` e `audit_logs` sustentam tenancy, RBAC e auditoria.
- `people` é a identidade central. `parish_communities`, `parish_households`, `parish_household_members`, `person_relationships`, `pastoral_entities`, `pastoral_memberships`, `volunteer_terms`, `service_attendances`, `person_transfers`, `person_field_definitions`, `person_field_values`, `lgpd_consents` e `lgpd_requests` mantêm a vida paroquial e a governança de dados.

## Contribuições, campanhas e financeiro

- `tithe_members`, `tithe_payments`, `tithe_payment_allocations`, `offering_types`, `offerings` e `contribution_documents` controlam competências, recibos e documentos.
- `fundraising_campaigns`, `campaign_pledges`, `campaign_donations`, `campaign_expenses` e `campaign_batches` controlam metas, benfeitores, lotes e recebimentos.
- `financial_accounts`, `financial_categories`, `cost_centers`, `financial_transactions`, `financial_obligations`, `financial_settlements`, `financial_period_closings`, `financial_vouchers`, `financial_checks`, `financial_transfers`, `financial_receipts`, `financial_master_data`, `budget_structures` e `budget_plans` compõem o financeiro.
- PIX, cartões e boletos usam `payment_provider_configs`, `pix_charges`, `card_receivables`, `boleto_agreements`, `bank_slips`, `bank_file_batches` e `bank_return_occurrences`.
- Fiscal e obrigações usam `suppliers`, `fiscal_documents`, `tax_withholdings` e `compliance_submissions`.

## Sacramentos e catequese

- `sacramental_applications`, `sacramental_application_requirements`, `sacramental_requirements`, `sacramental_witnesses`, `sacramental_books`, `sacramental_records`, `sacramental_amendments`, `sacramental_transfers` e `sacramental_fees` implementam pedidos, exigências, registros e livros.
- `marriage_cases`, `marriage_interviews` e `marriage_banns` mantêm a instrução matrimonial.
- `catechesis_stages`, `catechesis_groups`, `catechesis_enrollments`, `catechesis_sessions`, `catechesis_attendance`, `catechesis_transfers`, `catechesis_certificate_requests`, `catechesis_book_entries` e `catechesis_fees` implementam o ciclo catequético. A matrícula concluída referencia o pedido sacramental exportado, impedindo duplicação.

## Agenda, materiais, patrimônio, social e cemitério

- Agenda e cursos: `pastoral_events`, `pastoral_courses`, `course_enrollments`, `course_advisors`, `course_sessions`, `course_checkins`, `course_installments`, `course_certificates`, `mass_intentions`, `mass_intention_types`, `pastoral_receipts`, `agenda_contacts` e `tomb_book_entries`.
- Almoxarifado: `inventory_products`, `inventory_categories`, `storage_locations`, `inventory_movements`, `inventory_departments`, `inventory_requisitions`, `inventory_requisition_items`, `inventory_purchase_orders`, `inventory_purchase_order_items`, `inventory_returns`, `inventory_writeoffs` e `inventory_request_templates`.
- Patrimônio: `assets`, `asset_categories`, `asset_locations`, `asset_events`, `asset_accessories`, `asset_legal_documents`, `asset_insurance_policies`, `vehicle_drivers`, `asset_reservations`, `property_leases` e `property_lease_installments`.
- Social: `social_households`, membros, atendimentos, programas, benefícios, doadores, produtos, estoque, kits, montagens, agendas, distribuições e questionários nas tabelas `social_*`.
- Cemitério: `cemetery_sectors`, `cemetery_graves`, `deceased_people`, `burials`, `grave_concessions`, `cemetery_service_catalog` e `cemetery_service_orders`.

## Plataforma e cobertura integral

- `document_templates`, `document_emissions`, `attachments` e `report_runs` oferecem PDF/CSV, validação pública e integridade SHA-256.
- `portal_*`, `integration_connections`, `notification_*`, `webhook_*` e `integration_delivery_attempts` sustentam ParóquiaNet e conectividade.
- `accounting_*` mantém escrituração e demonstrações; `fraternal_sharing_*` mantém a Partilha Fraterna.
- `operational_records` dá armazenamento isolado às rotinas documentais/consultivas do catálogo de 460 funções que não exigem uma tabela de domínio adicional.
