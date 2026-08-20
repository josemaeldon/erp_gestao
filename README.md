# Núcleo Eclesial

Repositório de planejamento e implementação incremental de um ERP eclesial multi-instituição.

> **Estado atual:** primeira fatia executável do produto: shell desktop-first, dashboard e módulos navegáveis com estado local.

## Executar localmente

```bash
npm install
npm run dev
```

Abra `http://127.0.0.1:5173/`.

Esta versão inclui dashboard financeiro/sacramental, navegação pelos módulos levantados, tela de Fiéis e Cadastros com pesquisa local e responsividade inicial. Autenticação, banco persistente, RBAC, auditoria, CRUDs e integrações financeiras ainda são a próxima camada de implementação.

## Documentos

- [Catálogo funcional](docs/CATALOGO_FUNCIONAL.md)
- [Arquitetura](ARCHITECTURE.md)
- [Modelo de dados](DATABASE.md)
- [Permissões](PERMISSIONS.md)
- [Integrações entre módulos](MODULES.md)
- [Checklist central](docs/CHECKLIST.md)
- [Protocolo de descoberta](docs/DISCOVERY.md)

## Segurança da pesquisa

Credenciais nunca devem ser salvas no repositório, em capturas, HARs, logs ou fixtures. Toda evidência oriunda de uma conta real deve ser anonimizada antes do commit.
