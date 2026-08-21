const moduleTables = {
  'fieis-cadastros': ['people','parish_communities','parish_households','parish_household_members','person_relationships','pastoral_entities','pastoral_memberships','volunteer_terms','service_attendances','person_transfers','person_field_definitions','person_field_values','lgpd_consents','lgpd_requests'],
  'dizimos-ofertas': ['tithe_members','tithe_payments','tithe_payment_allocations','offering_types','offerings','contribution_documents'],
  financeiro: ['financial_accounts','financial_categories','cost_centers','financial_transactions','financial_obligations','financial_settlements','financial_period_closings','financial_vouchers','financial_checks','financial_transfers','financial_receipts','financial_master_data','budget_structures','budget_plans','payment_provider_configs','pix_charges','card_receivables','boleto_agreements','bank_slips','bank_file_batches','bank_return_occurrences','suppliers','fiscal_documents','tax_withholdings','compliance_submissions'],
  batismo: ['sacramental_applications','sacramental_application_requirements','sacramental_witnesses','sacramental_books','sacramental_records','sacramental_amendments','sacramental_transfers','sacramental_fees'],
  catequese: ['catechesis_stages','catechesis_groups','catechesis_enrollments','catechesis_sessions','catechesis_attendance','catechesis_transfers','catechesis_certificate_requests','catechesis_book_entries','catechesis_fees'],
  crisma: ['sacramental_applications','sacramental_application_requirements','sacramental_witnesses','sacramental_books','sacramental_records','sacramental_amendments','sacramental_transfers','sacramental_fees'],
  eucaristia: ['sacramental_applications','sacramental_application_requirements','sacramental_witnesses','sacramental_books','sacramental_records','sacramental_amendments','sacramental_transfers','sacramental_fees'],
  matrimonio: ['sacramental_applications','sacramental_application_requirements','sacramental_witnesses','sacramental_books','sacramental_records','sacramental_amendments','sacramental_transfers','sacramental_fees','marriage_cases','marriage_interviews','marriage_banns'],
  campanhas: ['fundraising_campaigns','campaign_pledges','campaign_donations','campaign_expenses','campaign_batches'],
  'agenda-cursos': ['pastoral_events','pastoral_courses','course_enrollments','course_advisors','course_sessions','course_checkins','course_installments','course_certificates','mass_intention_types','mass_intentions','pastoral_receipts','agenda_contacts','tomb_book_entries'],
  almoxarifado: ['inventory_categories','storage_locations','inventory_products','inventory_movements','inventory_departments','inventory_requisitions','inventory_requisition_items','inventory_purchase_orders','inventory_purchase_order_items','inventory_returns','inventory_writeoffs','inventory_request_templates'],
  cemiterio: ['cemetery_sectors','cemetery_graves','deceased_people','burials','grave_concessions','cemetery_service_catalog','cemetery_service_orders'],
  contabil: ['accounting_accounts','accounting_entries','accounting_entry_lines','accounting_exercises','accounting_histories','accounting_opening_balances','accounting_professionals','accounting_disclosures','accounting_source_links'],
  patrimonio: ['asset_categories','asset_locations','assets','asset_events','asset_accessories','asset_insurance_policies','asset_legal_documents','asset_reservations','vehicle_drivers','property_leases','property_lease_installments'],
  'gestao-social': ['social_households','social_household_members','social_assistance_records','social_programs','social_benefit_deliveries','social_donors','social_product_types','social_products','social_stock_movements','social_kits','social_kit_items','social_kit_assemblies','social_distribution_schedules','social_distributions','social_questionnaires','social_questionnaire_responses'],
  paroquianet: ['portal_memberships','portal_announcements','portal_mass_schedules','portal_credentials'],
  conectividade: ['integration_connections','integration_delivery_attempts','notification_templates','notification_jobs','webhook_subscriptions','webhook_deliveries'],
  'partilha-fraterna': ['fraternal_sharing_configs','fraternal_sharing_periods','fraternal_sharing_payments'],
  configuracoes: ['organization_settings','users'],
  documentos: ['document_templates','document_emissions','attachments','report_runs'],
}

const moduleNames = {
  'fieis-cadastros':'Fiéis e Cadastros','dizimos-ofertas':'Dízimos e Ofertas',financeiro:'Financeiro',batismo:'Batismo',catequese:'Catequese',crisma:'Crisma',eucaristia:'Eucaristia',matrimonio:'Matrimônio',campanhas:'Campanhas','agenda-cursos':'Agendas e Cursos',almoxarifado:'Almoxarifado',cemiterio:'Cemitério',contabil:'Contábil',patrimonio:'Patrimônio','gestao-social':'Gestão Social',paroquianet:'ParóquiaNet',conectividade:'Conectividade','partilha-fraterna':'Partilha Fraterna',configuracoes:'Configurações',documentos:'Documentos'
}

const fixedByModule = {
  batismo:{sacramental_applications:{sacrament_type:'baptism'},sacramental_books:{sacrament_type:'baptism'},sacramental_records:{type:'baptism'}},
  crisma:{sacramental_applications:{sacrament_type:'confirmation'},sacramental_books:{sacrament_type:'confirmation'},sacramental_records:{type:'confirmation'}},
  eucaristia:{sacramental_applications:{sacrament_type:'eucharist'},sacramental_books:{sacrament_type:'eucharist'},sacramental_records:{type:'eucharist'}},
  matrimonio:{sacramental_applications:{sacrament_type:'marriage'},sacramental_books:{sacrament_type:'marriage'},sacramental_records:{type:'marriage'}},
}

const noCreate = new Set(['users','document_emissions','attachments','report_runs','integration_delivery_attempts','webhook_deliveries','bank_return_occurrences','accounting_source_links','tithe_payment_allocations','financial_settlements','bank_file_batches','campaign_batches','course_checkins','course_certificates','catechesis_certificate_requests','property_lease_installments'])
const immutable = new Set(['audit_logs'])
const cancelValues = {
  financial_obligations:'cancelled', financial_vouchers:'cancelled', financial_checks:'cancelled', bank_slips:'cancelled', pix_charges:'cancelled', card_receivables:'cancelled', fiscal_documents:'cancelled', compliance_submissions:'cancelled',
  sacramental_applications:'cancelled', sacramental_records:'cancelled', sacramental_transfers:'cancelled', sacramental_fees:'cancelled', marriage_cases:'cancelled', marriage_interviews:'cancelled',
  catechesis_enrollments:'cancelled', catechesis_sessions:'cancelled', catechesis_certificate_requests:'cancelled', catechesis_fees:'cancelled',
  pastoral_events:'cancelled', pastoral_courses:'cancelled', course_enrollments:'cancelled', course_installments:'cancelled',
  inventory_requisitions:'cancelled', inventory_purchase_orders:'cancelled', cemetery_service_orders:'cancelled',
  fundraising_campaigns:'cancelled', campaign_pledges:'cancelled', asset_reservations:'cancelled', property_leases:'cancelled',
  social_households:'closed', social_assistance_records:'cancelled', social_distribution_schedules:'cancelled',
  portal_announcements:'archived', portal_credentials:'revoked', notification_jobs:'cancelled', webhook_deliveries:'cancelled', fraternal_sharing_periods:'cancelled'
}

const exactLabels = {
  cemetery_sectors:'Setores do cemitério', cemetery_graves:'Sepulturas', deceased_people:'Falecidos', burials:'Sepultamentos', grave_concessions:'Concessões de sepultura', cemetery_service_catalog:'Catálogo de serviços', cemetery_service_orders:'Ordens de serviço',
  parish_communities:'Comunidades paroquiais', parish_households:'Famílias paroquiais', parish_household_members:'Membros das famílias', people:'Fiéis e pessoas', users:'Usuários', organization_settings:'Dados do organismo',
  financial_accounts:'Contas financeiras', financial_categories:'Categorias financeiras', financial_transactions:'Movimentações financeiras', financial_obligations:'Contas a pagar e receber', financial_settlements:'Liquidações', financial_period_closings:'Fechamentos financeiros',
  sacramental_applications:'Pedidos sacramentais', sacramental_application_requirements:'Exigências dos pedidos', sacramental_witnesses:'Padrinhos e testemunhas', sacramental_books:'Livros sacramentais', sacramental_records:'Registros sacramentais', sacramental_amendments:'Retificações sacramentais', sacramental_transfers:'Transferências sacramentais', sacramental_fees:'Oblações sacramentais',
  document_templates:'Modelos de documentos', document_emissions:'Documentos emitidos', attachments:'Anexos', report_runs:'Relatórios gerados', tomb_book_entries:'Registros do livro tombo'
}
const wordLabels = {
  id:'ID', code:'código', name:'nome', title:'título', description:'descrição', status:'situação', active:'ativo', date:'data', start:'início', end:'fim', notes:'observações', content:'conteúdo', number:'número', amount:'valor', total:'total', type:'tipo', category:'categoria', phone:'telefone', email:'e-mail', address:'endereço', city:'cidade', state:'estado', country:'país', person:'pessoa', member:'membro', members:'membros', created:'criado', updated:'atualizado', at:'em', by:'por', due:'vencimento', paid:'pago', payment:'pagamento', payments:'pagamentos', account:'conta', accounts:'contas', financial:'financeiro', service:'serviço', services:'serviços', order:'ordem', orders:'ordens', catalog:'catálogo', cemetery:'cemitério', sector:'setor', sectors:'setores', grave:'sepultura', graves:'sepulturas', deceased:'falecido', people:'pessoas', burials:'sepultamentos', concessions:'concessões', parish:'paroquial', communities:'comunidades', households:'famílias', relationship:'relação', relationships:'relações', pastoral:'pastoral', entities:'entidades', memberships:'vínculos', volunteer:'voluntariado', terms:'termos', attendance:'presença', attendances:'atendimentos', transfer:'transferência', transfers:'transferências', fields:'campos', values:'valores', requests:'solicitações', applications:'pedidos', requirements:'exigências', witnesses:'testemunhas', books:'livros', records:'registros', amendments:'retificações', fees:'oblações', marriage:'matrimônio', interviews:'entrevistas', banns:'proclamas', settings:'configurações', users:'usuários', templates:'modelos', documents:'documentos', emissions:'emissões', attachments:'anexos', reports:'relatórios', runs:'execuções'
}
export const dataLabel = value => {
  if (exactLabels[value]) return exactLabels[value]
  const label = value.split('_').map(word => wordLabels[word] || word).join(' ')
  return label.charAt(0).toUpperCase()+label.slice(1)
}

export const dataManagementModules = Object.fromEntries(Object.entries(moduleTables).map(([module,tables]) => [module,{name:moduleNames[module],entities:tables.map(table=>({key:`${module}--${table}`,table,label:dataLabel(table),fixed:fixedByModule[module]?.[table]||{},canCreate:!noCreate.has(table),immutable:immutable.has(table)}))}]))
export const managedEntities = Object.fromEntries(Object.entries(dataManagementModules).flatMap(([module,config])=>config.entities.map(entity=>[entity.key,{...entity,module,moduleName:config.name,cancelValue:cancelValues[entity.table]}])))
