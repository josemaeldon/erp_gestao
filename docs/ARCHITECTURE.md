# Arquitetura implementada

## Visão

Aplicação full-stack local em monólito modular: React 19/Vite no frontend, Node.js/Express na API e PostgreSQL 16 como fonte de verdade. Essa forma mantém transações ACID entre módulos e execução simples pelo Docker Compose.

## Camadas

1. **Interface:** centros operacionais específicos por domínio e catálogo lateral das 460 funções.
2. **API REST:** JWT, validação Zod, RBAC, escopo por organismo, auditoria e respostas de erro.
3. **Casos de uso:** operações transacionais para financeiro, contribuições, sacramentos, estoque, patrimônio, campanhas, cursos, social e contabilidade.
4. **Persistência:** migrações SQL versionadas em `server/migrations`, constraints, índices e PostgreSQL local.
5. **Documentos e arquivos:** PDFs gerados localmente; anexos no diretório `.data/uploads`, com metadados, MIME, tamanho e SHA-256 no banco.

## Multi-tenancy e autorização

Cada tabela de negócio carrega `organization_id`. O organismo é retirado do JWT e nunca aceito do corpo da requisição. `roles`, `permissions`, `role_permissions` e `user_roles` autorizam cada endpoint; `audit_logs` registra ação, entidade, usuário e metadados.

## Transações e invariantes

Operações com múltiplos efeitos usam `BEGIN/COMMIT/ROLLBACK` e bloqueio de linha quando necessário. Exemplos: liquidação financeira, transferência entre contas, pagamento de oblação, recebimento de campanha, movimentos de estoque, locação, exportação sacramental e escrituração. Constraints e chaves únicas impedem saldo negativo, numeração duplicada, conflito de reserva e reprocessamento.

## Integrações

PIX, cartão, boleto/CNAB, fiscal e EFD/SPED possuem adaptadores locais rastreáveis. Webhooks usam assinatura HMAC; segredos de conexão são cifrados. Transmissões oficiais que dependem de certificado, credenciamento bancário ou webservice externo permanecem explicitamente marcadas como simulação local até que o usuário configure o provedor real.

## Operação local

`docker compose up -d postgres` inicia o banco na porta 5433. `npm run dev:all` inicia API e frontend; `npm test` executa os testes integrados e `npm run build` valida a produção. O schema completo é carregado automaticamente em bancos novos pela montagem de `server/migrations` em `/docker-entrypoint-initdb.d`.
