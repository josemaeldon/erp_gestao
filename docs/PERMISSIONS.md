# Mapa de permissões

## Modelo

Permissão canônica: `<módulo>.<recurso>.<operação>`. O JWT define o organismo e ausência da permissão nega acesso ao endpoint.

## Operações

`view`, `create`, `update`, `delete`, `deactivate`, `settle`, `reverse`, `print`, `export`, `view_financial`, `view_values`, `view_documents`, `view_audit`, `close_period`, `reopen_period`, `manage_permissions`.

## Recursos

- `admin`: organizations, users, roles, sessions, parameters, audit, privacy.
- `people`: faithful, families, pastoral_entities, memberships.
- `contributions`: tithe_members, tithe_payments, offerings, campaigns.
- `sacraments`: baptisms, eucharists, confirmations, marriages, books, certificates.
- `catechesis`: grupos, matrículas, encontros, presença, transferências, conclusão, cancelamento, exportação sacramental, certificados, livros e oblações.
- `secretariat`: agenda, courses, masses, intentions, notices, tomb_book.
- `finance`: cash, banks, transfers, checks, payables, receivables, invoices, advances, allocations, closing, budget, reports.
- `assets`: assets, depreciation, properties, rentals, inventory.
- `operations`: cemetery, social, campaigns, courses, inventory and assets.
- `platform`: attachments, templates, reports, notifications.
- `data_management`: visão, inclusão, alteração e exclusão segura dos registros das 20 áreas.

## Perfis iniciais

Papéis são editáveis pela tela de configurações. A migração inicial cria o papel `Administrador` e lhe associa as permissões disponíveis; novos usuários recebem somente os papéis selecionados no cadastro.
