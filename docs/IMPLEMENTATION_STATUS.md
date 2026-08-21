# Estado verificável da implementação

Esta matriz separa funcionalidades especializadas de rotinas atendidas pelo cadastro operacional universal. “Especializado” significa banco tipado, regras do domínio, API própria, tela própria, permissões e teste integrado.

| Domínio | Estado | Principais fluxos especializados |
|---|---|---|
| Plataforma | Especializado | JWT, organização, RBAC, auditoria e PostgreSQL local |
| Fiéis | Especializado | perfil completo, famílias, relações, comunidades, pastorais/ministérios/movimentos, agentes, atendimentos, voluntariado, consentimentos e solicitações LGPD, transferências e campos personalizados |
| Dízimos e ofertas | Especializado | dizimistas, missionários, expectativa, múltiplas competências, recibos, ofertas tipadas, PIX vinculado, grade anual, atrasados, comparativos, carnês, etiquetas e integração financeira atômica |
| Sacramentos | Especializado | pedidos, exigências, padrinhos/testemunhas, oblações, transferências, livros, numeração concorrente, registros e retificações; matrimônio com entrevistas, proclamas e autorização canônica |
| Catequese | Especializado | etapas, grupos, capacidade, matrículas, encontros, frequência, transferências, cancelamento, certificados verificáveis, livros, oblações/recibos e exportação para Eucaristia/Crisma |
| Documentos | Especializado | modelos, emissões PDF, QR Code, código público e histórico |
| Financeiro | Especializado | movimentações, contas, liquidações, fechamento, PIX, cartões, boletos, CNAB, fornecedores, XML fiscal, retenções e pacotes EFD/SPED |
| Agenda e cursos | Especializado | eventos recorrentes, missas, intenções com oferta, cursos, inscrições, assessores, sessões/check-in, mensalidades, certificados, contatos e livro tombo |
| Almoxarifado | Especializado | produtos, locais, entradas, saídas, transferências, custo médio, lote, validade, mínimo, requisições, compras, devoluções e baixas |
| Cemitério | Especializado | quadras, sepulturas, capacidade, falecidos, sepultamentos, exumação, catálogo de serviços, ordens e recibos |
| Campanhas | Especializado | metas, compromissos, doadores, recebimentos, despesas, lotes, boletos/envio e integração financeira |
| Contábil | Especializado | plano de contas, partidas dobradas, diário, razão, estorno, exercícios, saldos iniciais, responsáveis, notas, balanço, DRE, DFC, DMPL e livro caixa |
| Patrimônio | Especializado | bens, responsáveis, locais, eventos, manutenção, baixa, depreciação, acessórios, documentos legais, seguros, condutores, reservas e locações integradas ao contas a receber |
| Gestão Social | Especializado | famílias, membros, vulnerabilidade, atendimentos sigilosos, programas, benefícios, doadores, estoque, kits, agendas, questionários e distribuições |
| ParóquiaNet | Especializado | membros, convites com token de uso único, avisos, portal público, horários e credenciais verificáveis |
| Partilha Fraterna | Especializado | parâmetros, recebimentos pastorais, cálculo, aprovação, pagamento e integração financeira atômica |
| Conectividade | Especializado | integrações com segredo cifrado, notificações, webhooks HMAC, filas, tentativas e logs |
| Configurações | Especializado | organismo, identidade, usuários, papéis, permissões, LGPD e auditoria |
| 460 funções do catálogo | Cobertura individual | cada função-folha possui identidade e rota próprias; rotinas documentais/consultivas de cauda longa usam o registro operacional com CRUD, pesquisa, arquivamento, PDF/CSV, RBAC, auditoria e escopo |

## Verificação automatizada

Execute `npm test` para validar os 34 fluxos integrados atuais. A suíte confere a contagem e unicidade das 460 funções, percorre as 460 rotas com autenticação, verifica o CRUD das 20 áreas e valida os fluxos especializados, incluindo cadastro paroquial, catequese documental, dízimos, patrimônio, anexos SHA-256, relatórios PDF/CSV, PIX, cartões, boleto/CNAB, fiscal/EFD-Reinf, cursos, campanhas, cemitério, estoque e gestão social. Execute `npm run build` para validar o frontend de produção.

A migração mais recente é `server/migrations/028_data_management.sql`. A validação manual em navegador cobre, além dos fluxos anteriores, a gestão completa com inclusão, edição, pesquisa e exclusão segura em todas as áreas. Exclusões preservam o histórico por arquivamento, inativação ou cancelamento quando a entidade possui exigências legais, financeiras ou de auditoria.

O inventário autenticado reconciliado de 460 funções permanece em `docs/REFERENCE_INVENTORY.md`; nomes repetidos em contextos diferentes possuem identidade e armazenamento isolados.
