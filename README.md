# Núcleo Eclesial

Sistema full-stack local para gestão paroquial, com frontend React/Vite, API Node/Express e PostgreSQL executado via Docker.

> **Estado atual:** núcleo executável com autenticação, RBAC, escopo por organização, dashboard conectado ao banco, cadastro/pesquisa de fiéis, dízimos/ofertas integrados ao financeiro e auditoria transacional. Os módulos sacramentais, pastoral, patrimônio e demais fluxos estão catalogados na interface e na documentação para implementação incremental.

## Executar localmente

Pré-requisitos: Node.js 20+ e Docker Desktop.

```bash
npm install
docker compose up -d postgres
npm run dev:all
```

Abra `http://127.0.0.1:5173/`.

O login de demonstração local é `admin@nucleo.local` / `admin123`. A API fica em `http://localhost:4000` e o Vite encaminha `/api` para ela. O banco expõe a porta `5433` no host.

Para desligar o banco sem remover os dados:

```bash
docker compose stop postgres
```

Verificações rápidas:

```bash
npm run build
curl http://localhost:4000/api/health
```

O schema inicial está em `server/migrations/001_init.sql`; ele cria a organização de demonstração, permissões administrativas, conta de caixa e dados sintéticos. Não são usados dados ou credenciais do sistema Eclesial externo.

## Documentos

- [Catálogo funcional](docs/CATALOGO_FUNCIONAL.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Modelo de dados](docs/DATABASE.md)
- [Permissões](docs/PERMISSIONS.md)
- [Integrações entre módulos](docs/MODULES.md)
- [Checklist central](docs/CHECKLIST.md)
- [Protocolo de descoberta](docs/DISCOVERY.md)

## Segurança da pesquisa

Credenciais nunca devem ser salvas no repositório, em capturas, HARs, logs ou fixtures. Toda evidência oriunda de uma conta real deve ser anonimizada antes do commit.
