# Mapa de permissões

## Modelo

Permissão canônica: `<módulo>.<recurso>.<operação>`, limitada por grants de organização, comunidade e centro de custo. Negação explícita prevalece; ausência de grant nega acesso.

## Operações

`view`, `create`, `update`, `delete`, `deactivate`, `settle`, `reverse`, `print`, `export`, `view_financial`, `view_values`, `view_documents`, `view_audit`, `close_period`, `reopen_period`, `manage_permissions`.

## Recursos

- `admin`: organizations, users, roles, sessions, parameters, audit, privacy.
- `people`: faithful, families, pastoral_entities, memberships.
- `contributions`: tithe_members, tithe_payments, offerings, campaigns.
- `sacraments`: baptisms, eucharists, confirmations, marriages, books, certificates.
- `catechesis`: catechumens, catechists, groups, attendance, transfers.
- `secretariat`: agenda, courses, masses, intentions, notices, tomb_book.
- `finance`: cash, banks, transfers, checks, payables, receivables, invoices, advances, allocations, closing, budget, reports.
- `assets`: assets, depreciation, properties, rentals, inventory.
- `optional`: cemetery, hr, clergy, chancery, social, events, pos.
- `platform`: attachments, templates, reports, notifications.

## Perfis iniciais

Perfis são templates editáveis, não lógica hardcoded: Administrador Geral, Administrador Diocesano, Pároco, Administrador Paroquial, Vigário, Secretário, Financeiro, Tesoureiro, Contabilidade, Catequese, Pastoral, Patrimônio, Consulta e Auditor. Perfis sensíveis não implicam acesso automático a valores, documentos, dados sociais ou auditoria; esses grants são explícitos.
