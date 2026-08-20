# Arquitetura da aplicação

## Visão

Monólito modular TypeScript inicialmente, com fronteiras explícitas e eventos internos. Essa escolha preserva transações ACID entre módulos sem impedir extração futura de serviços. Frontend Next.js acessa uma API REST versionada; PostgreSQL é a fonte de verdade, Redis atende cache, filas e rate limiting, e S3-compatible armazena anexos.

## Camadas

1. **Web:** componentes acessíveis, formulários, grids e motor de relatórios.
2. **API:** autenticação, validação, idempotência, autorização e DTOs.
3. **Aplicação:** casos de uso e orquestração transacional.
4. **Domínio:** entidades, políticas, invariantes e eventos.
5. **Infraestrutura:** PostgreSQL, Redis, objetos, e-mail, pagamentos e observabilidade.

## Multi-tenancy

Todas as tabelas de negócio carregam `organization_id`; políticas de acesso combinam escopo do token, grants institucionais e Row-Level Security. O contexto ativo nunca é aceito cegamente do cliente. Jobs e exportações propagam o mesmo contexto.

## Segurança

Cookies HttpOnly/Secure/SameSite, CSRF, CSP, validação de origem, rate limit, Argon2id, 2FA opcional, rotação/revogação de sessão, trilha de auditoria append-only, criptografia em trânsito e segredos fora do repositório.

## Transações e integração

Casos como dízimo, oferta, taxa sacramental, baixa e transferência executam numa transação PostgreSQL. Eventos persistidos em outbox só disparam integrações externas após commit; idempotency keys impedem duplicação por retry/webhook.

## Operação

Logs JSON com correlation ID, métricas, traces, health/readiness, migrações versionadas, backups automáticos com restauração testada e deploy com rollback. Datas persistem em UTC com timezone configurável; dinheiro usa `numeric`, nunca ponto flutuante.
