# Catálogo funcional de requisitos ampliados

**Proveniência:** requisitos iniciais fornecidos pelo solicitante.
**Estado global:** `SUPLEMENTAR AO INVENTÁRIO AUTENTICADO`.
**Importante:** a fonte executável reconciliada é `REFERENCE_INVENTORY.md`, com 460 funções em 19 áreas. Itens ampliados abaixo que não apareceram na conta inspecionada — como RH, chancelaria e PDV — documentam possíveis evoluções, não funções indevidamente atribuídas ao produto de referência.

## Shell autenticado

| Área | Itens a catalogar | Comportamento planejado |
|---|---|---|
| Topo | identidade própria, instituição, usuário, busca global, notificações, ajuda, configurações, sair | troca de contexto refaz consultas e respeita escopo RBAC |
| Contexto | diocese, paróquia, comunidade, centro de custo, exercício/período | seletores dependentes; tenant obrigatório |
| Navegação | ribbon por módulos, favoritos, recentes | itens sem permissão não são acionáveis |
| Operações | Novo, Alterar, Excluir/Inativar, Procurar, Copiar, Imprimir, Recibo, QR Code, Salvar, Desfazer | habilitação conforme estado e permissão |

## Árvore de módulos e submódulos

1. **Início**
   - Dashboard; indicadores; gráficos; filtros; favoritos; notificações; eventos próximos.
2. **Pessoas e pastoral**
   - Fiéis: cadastro, pesquisa avançada, família, vida eclesial, inativação, etiquetas e mala direta.
   - Estrutura pastoral: comunidades, capelas, CEBs, pastorais, movimentos, ministérios, coordenações, responsáveis, membros e mandatos.
3. **Dízimo, ofertas e campanhas**
   - Dizimistas; lançamento unitário/múltiplos meses; extrato; grade anual; conferência; comparativos; atrasados; ofertantes; não ofertantes; aniversariantes; evolução.
   - Ofertas: tipos, lançamento, listagem, relatórios e comparação.
   - Campanhas: cadastro, doações, recorrência, QR Code/link, recebimentos e dashboard de meta.
4. **Sacramentos e documentos**
   - Batismo: inscrição, preparação, registro completo/simplificado, pesquisa, transferências, certificados/certidões, índice e livro.
   - Eucaristia: inscrição, preparação, registro, importação da catequese e certificado.
   - Crisma: inscrição, preparação, registro completo/simplificado, certidões, certificados, listagens, índice e livro.
   - Matrimônio: processo/habilitação, nubentes, documentos, entrevistas, aspectos canônicos, proclamas, celebração e documentos.
   - Livros sacramentais: índices, consulta, impressão, exportação, segunda via, averbações e histórico.
   - Central de certidões: busca, modelos, assinaturas, autenticidade, QR Code, PDF e histórico.
5. **Catequese**
   - Catequizandos; catequistas; etapas; grupos/turmas; salas; calendário; presença; transferências; avanço; certificados; exportação ao sacramento.
6. **Secretaria e pastoral**
   - Agenda paroquial: dia, semana, mês e lista; recorrência e lembretes.
   - Cursos/encontros: cadastro, equipe, participantes, inscrição, custo, recebimento, presença, certificado e chamada.
   - Missas: horários regulares e extraordinários.
   - Intenções: tipos, solicitante, celebração, oferta, recibo e integração financeira.
   - Avisos paroquiais: vigência, comunidade, prioridade e publicação.
   - Livro Tombo: entradas, anexos, busca, impressão e encadernação.
7. **Financeiro**
   - Caixa: movimentação, vales, repasses e saldo.
   - Bancos: contas, movimentação, transferências, cheques, repasses, saldos e conciliação OFX/CSV.
   - Contas: fornecedores, notas fiscais/XML, contas a pagar, pagamentos/baixas/estornos, adiantamentos, contas a receber e recebimentos.
   - Recibos: pastoral, avulso, cadastrado, curso, sacramento, dízimo, oferta, RPA e côngrua.
   - Rateios: regras, apuração, previsão, lançamentos e relatórios.
   - Fechamento mensal; reabertura auditada; orçamento anual.
   - Relatórios: boletim, prestação de contas, demonstrativo, resumo, fluxo, saldos, previsões e pendências.
8. **Pagamentos digitais**
   - Pix: QR estático/dinâmico, identificador, webhook, conciliação e baixa.
   - Cartões: débito/crédito, recorrência, parcelas, taxas, adquirente e conciliação.
   - Boletos: emissão, PDF, vencimento, nosso número, baixa, cancelamento e webhook.
9. **Patrimônio e suprimentos**
   - Bens móveis, imóveis, automóveis, equipamentos, terrenos, arte sacra e objetos litúrgicos.
   - Depreciação; seguros; documentos; fotos; localização e responsáveis.
   - Imóveis/locações: contratos, reajustes e geração de contas a receber.
   - Almoxarifado: produtos, estoque, entradas, saídas, requisições, baixa e compras.
10. **Cemitério** (opcional)
    - Cemitérios, quadras, lotes, túmulos, gavetas, sepultamentos, responsáveis, concessões, vencimentos, taxas e documentos.
11. **Pessoas, folha e clero**
    - Funcionários, admissões, salários, férias, extras, afastamentos e folhas.
    - Clérigos e côngruas: retenções, pagamentos, recibos e informes.
    - Benefícios: alimentação, refeição, transporte, combustível, saúde e outros.
12. **Chancelaria diocesana** (opcional)
    - Clérigos, diáconos, religiosos, seminaristas, leigos, organismos e paróquias.
    - Ordenações, nomeações, provisões, transferências, licenças, afastamentos, atos, documentos e biblioteca canônica.
13. **Gestão social**
    - Beneficiários, famílias, doadores, atendimentos, necessidades, benefícios e estoque de doações.
14. **Festas, eventos e PDV**
    - Eventos, produtos, categorias, estoque, preços, caixas e operadores.
    - Venda, pagamentos, impressão de ficha, abertura, sangria, suprimento e fechamentos.
    - Relatórios de vendas, estoque, operadores, pagamentos, caixa, margem e horários.
15. **Relatórios e impressão**
    - Motor central; filtros; seleção múltipla; intervalos; agrupamento; totais; preferências; PDF/Excel/CSV.
    - Editor de certificados, certidões, recibos, livros, etiquetas, carnês, cartas, autorizações e atas.
16. **Administração**
    - Organizações e hierarquia; usuários; perfis; permissões; sessões; política de senha; 2FA.
    - Auditoria; anexos; notificações; períodos; parâmetros; LGPD; backup e restauração.

## Ficha padrão de formulário adotada

Formulários são avaliados por: título, abas, agrupamentos, campos obrigatórios, pesquisa, tipos de controle, anexos, observações, validação cliente/servidor, erro, loading, sucesso, auditoria e permissão.

## Modais transversais a verificar

- seleção/pesquisa de pessoa, instituição, comunidade, centro de custo e conta;
- confirmação de exclusão, inativação, baixa, estorno, fechamento e reabertura;
- anexar/visualizar documento;
- impressão, modelo, formato e número de vias;
- exportação e seleção de colunas;
- filtros avançados e filtros salvos;
- escolha de competência/período;
- recibo, QR Code e autenticação de documento;
- sessão expirada, acesso negado e conflito de alteração.

## Comportamentos transversais a verificar

- ENTER/tabulação, atalhos, foco, ARIA e máscaras brasileiras;
- paginação/ordenação/filtros server-side e persistência de grade;
- isolamento de tenant e troca de contexto;
- soft delete, cancelamento e estorno em vez de remoção física;
- bloqueio de período fechado;
- geração transacional de lançamentos integrados;
- notificações, auditoria e rastreabilidade;
- estados offline/erro/sem dados/carregando e prevenção de duplo envio.
