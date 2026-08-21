# Inventário autenticado da referência

Varredura somente leitura realizada em 20/08/2026 no ambiente autenticado do Eclesial, cobrindo os links de módulos e os menus visíveis em cada módulo. O inventário é funcional, não é cópia de código, banco, dados ou assets.

Uma reconciliação autenticada em 20/08/2026 contou **460 funções-folha visíveis** em 19 áreas. A contagem anterior de 449 estava inconsistente: a própria tabela antiga somava 470 e o catálogo executável continha 417. A lista foi refeita a partir dos itens renderizados com classe de função, sem contar os títulos dos agrupamentos.

| Área | Funções encontradas |
|---|---:|
| Fiéis e Cadastros | 30 |
| Dízimos e Ofertas | 14 |
| Financeiro | 82 |
| Batismo | 22 |
| Catequese | 26 |
| Crisma | 23 |
| Eucaristia | 16 |
| Matrimônio | 39 |
| Campanha | 10 |
| Agendas e Cursos | 27 |
| Almoxarifado | 23 |
| Cemitério | 7 |
| Contábil | 61 |
| Patrimônio | 26 |
| ParóquiaNet | 8 |
| Gestão Social | 20 |
| Conectividade | 4 |
| Partilha Fraterna | 5 |
| Configurações | 17 |

## Escopo por área

- **Fiéis e Cadastros:** cadastro, relatórios, ParóquiaNet, atendimento, campos de perfil, responsáveis, comunidades, ministérios, pastorais, movimentos, inativação, voluntariado, missionário do dízimo, mensagens, coordenação, funções, canais, formulários, LGPD e transferências.
- **Dízimos e Ofertas:** lançamento, extrato, período, ofertas anuais, gráficos, conferência, atrasados, expectativa, ofertantes, comparativos, PIX/carnê/etiqueta, tipos de oferta e recebimentos pastorais.
- **Financeiro:** caixa/banco, rateio, notas, históricos, fechamento, orçamento, caixa, vales, repasses, bancos, cheques, conciliação, OFX, recibos, RPA, côngruas, espórtulas, prestação de contas, boletim, relatórios, cartões, contas a receber/pagar, boletos, remessas, retorno bancário, EFD-Reinf, fluxo de caixa, XML, fornecedores, CFOP, centros de custo, convênios e lançamentos padrão.
- **Sacramentos:** inscrição normal e simplificada, certidões, lembranças, autorizações, listagens, preparação, pedidos, transferências, negativas, notificações, retificações, livros, controle, índices, abertura/encerramento, recibos e oblações. Matrimônio acrescenta proclamas, documentos, procuração, delegação, dispensas, justificação, consentimentos, instrumentos canônicos, efeito civil e arquivos.
- **Catequese:** catequizandos, grupos, etapas, certidões, transferências, certificados, grupos do catequizando, exportações para sacramentos, cancelamentos, livros, recibos e oblações.
- **Campanha:** benfeitores individuais/múltiplos, lotes, boletos, envio por e-mail, doações, metas e extrato do benfeitor.
- **Agendas e Cursos:** eventos, cursos, participantes, assessores, mensalidades, certificados, relatórios, calendário, compromissos, telefones, avisos, missas, intenções, tipos de intenção, horários e livro tombo.
- **Almoxarifado:** produtos, complementos, grupos, localização, unidades, departamentos, requisitantes, entradas/saídas, devoluções, baixas, solicitações, requisições, compras, movimentações e consumo.
- **Cemitério:** cemitérios, serviços, túmulos, tipos, relatórios e recibos.
- **Contábil:** plano/perfil de contas, exercícios, históricos, contabilistas, representantes legais, saldos, razão, balancete, DRE, DMPL, DFC, livros, balanço, SPED ECD/ECF, EFD-Reinf, impostos, folha a pagar, apuração e comprovantes.
- **Patrimônio:** bens móveis, imóveis, veículos, acessórios, estado, classificação, localização, subtipo, cartório, documentos legais, seguros, condutores, reservas, locações, depreciação, inventário e relatórios patrimoniais.
- **Gestão Social:** beneficiários, doadores, produtos, unidades, kits/cestas, questionários, distribuição individual/comunitária, entradas/saídas, transferências, agenda de distribuição, atendimento e relatórios.
- **ParóquiaNet, Conectividade, Partilha Fraterna e Configurações:** convites, avisos, horários, credenciamento, integrações, notificações, partilha, personalização, usuários, modelos, impressão, parâmetros, logs, LGPD e estrutura do organismo.

## Regra de implementação

Cada entrada acima deverá virar uma rotina própria com: modelo/migração, API, autorização, formulário, listagem, filtros, estados de erro/vazio, auditoria, integração com pessoas/financeiro quando aplicável e impressão/exportação quando a função exigir.
