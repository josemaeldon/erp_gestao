const fields = {
  'Fiéis e Cadastros': [['comunidade','Comunidade','text'],['vinculo','Vínculo eclesial','text'],['responsavel','Responsável','text'],['observacao','Observação','textarea']],
  'Dízimos e Ofertas': [['tipo','Tipo','text'],['formaPagamento','Forma de pagamento','text'],['referencia','Referência','text'],['competencia','Competência','date']],
  Financeiro: [['conta','Conta financeira','text'],['categoria','Classificação','text'],['documento','Documento','text'],['centroCusto','Centro de custo','text']],
  Batismo: [['livro','Livro','text'],['folha','Folha','text'],['numero','Número','text'],['celebrante','Celebrante','text']],
  Catequese: [['etapa','Etapa','text'],['grupo','Grupo','text'],['catequista','Catequista','text'],['comunidade','Comunidade','text']],
  Crisma: [['livro','Livro','text'],['folha','Folha','text'],['numero','Número','text'],['ministro','Ministro','text']],
  Eucaristia: [['livro','Livro','text'],['folha','Folha','text'],['numero','Número','text'],['celebrante','Celebrante','text']],
  Matrimônio: [['processo','Processo','text'],['noivo','Noivo','text'],['noiva','Noiva','text'],['celebrante','Celebrante','text']],
  Campanhas: [['meta','Meta financeira','number'],['inicio','Início','date'],['termino','Término','date'],['responsavel','Responsável','text']],
  'Agendas e Cursos': [['inicio','Início','datetime-local'],['termino','Término','datetime-local'],['local','Local','text'],['responsavel','Responsável','text']],
  Almoxarifado: [['codigo','Código','text'],['quantidade','Quantidade','number'],['unidade','Unidade','text'],['localizacao','Localização','text']],
  Cemitério: [['cemiterio','Cemitério','text'],['quadra','Quadra','text'],['tumulo','Túmulo/Jazigo','text'],['responsavel','Responsável','text']],
  Contábil: [['codigo','Código contábil','text'],['conta','Conta','text'],['debito','Débito','number'],['credito','Crédito','number']],
  Patrimônio: [['tombo','Número de tombo','text'],['aquisicao','Aquisição','date'],['valor','Valor','number'],['localizacao','Localização','text']],
  'Gestão Social': [['beneficiario','Beneficiário','text'],['quantidade','Quantidade','number'],['unidade','Unidade','text'],['responsavel','Responsável','text']],
  ParóquiaNet: [['canal','Canal','text'],['destinatario','Destinatário','text'],['envio','Data de envio','date'],['mensagem','Mensagem','textarea']],
  Conectividade: [['servico','Serviço','text'],['evento','Evento','text'],['destino','Destino','text'],['situacao','Situação','text']],
  'Partilha Fraterna': [['tipoOferta','Tipo de oferta','text'],['percentual','Percentual','number'],['destino','Destino','text'],['vigencia','Vigência','date']],
  Configurações: [['chave','Chave','text'],['valor','Valor','text'],['grupo','Grupo','text'],['observacao','Observação','textarea']],
}

const groups = entries => entries.map(([name, items]) => ({ name, items }))
export const moduleCatalog = {
  'Fiéis e Cadastros': { slug:'fieis-cadastros', description:'Fiéis, vínculos pastorais, atendimentos, LGPD e transferências.', fields:fields['Fiéis e Cadastros'], groups:groups([
    ['Geral',['Cadastro de fiéis','Relatórios de fiéis','Vincular fiel ParóquiaNet','Registro de atendimento','Campos do perfil']],
    ['Cadastros',['Responsáveis','Comunidades','Ministérios','Pastorais','Movimentos','Motivo de inativação','Termo de trabalho voluntário','Missionário do Dízimo','Mensagens','Coordenação','Funções','Canal de atendimento','Tipo de atendimento','Atendente']],
    ['Relatórios',['Formulários em branco','Elenco dos cadastros','Estatísticas paroquiais','Carnê pré-impresso','Elenco LGPD','Atendimento']],
    ['Transferências',['Gerenciamento de transferências','Enviar documento','Solicitar documento','Enviar registro','Solicitar registro']],
  ])},
  'Dízimos e Ofertas': { slug:'dizimos-ofertas', description:'Dízimos, ofertas, conferência, comparativos e recebimentos pastorais.', fields:fields['Dízimos e Ofertas'], groups:groups([
    ['Dízimos',['Lançamento de dízimo','Extrato de dízimo','Dízimo no período','Relação de ofertas anuais','Gráfico analítico do dízimo','Conferência do dízimo','Atrasados e expectativa mensal','Ofertantes e não ofertantes','Comparativo do dízimo','PIX carnê e etiqueta']],
    ['Ofertas',['Lançamento de oferta','Tipo de oferta','Listagem de tipo de oferta','Recebimentos Pastorais']],
  ])},
  Financeiro: { slug:'financeiro', description:'Caixa, bancos, contas, conciliação, boletos, rateios, notas e relatórios.', fields:fields.Financeiro, groups:groups([
    ['Caixa e Banco',['Movimentação de caixa','Vales','Repasses de caixa','Saldos de caixa','Movimentação bancária','Cheque','Repasses bancários','Saldos bancários','Conciliação','Bancária / financeira','Configuração OFX','Painel conciliação','Eventos pendentes','Recibos','Avulso','RPA','Côngruas','Relatório de recibos','Prestação de contas','Boletim financeiro','Relatórios financeiros','Extrato de operações em Cartão','Demonstrativo financeiro','Resumo financeiro','Resumo financeiro - detalhado','Movimentações financeiras','Declaração de recebimentos','Lançamentos por usuários','Relatório de cheques','Impl. saldo financeiro','Balancete financeiro','Saldos Financeiros','Recebimentos Pastorais']],
    ['Rateio / Contas',['A receber','A pagar','A pagar simplificado','Adiantamento','Recebimentos','Pagamentos','Boletos','Impressão/Envio de boletos bancários','Leitura arquivos de retorno','Boletos a receber','Gerar boletos e remessas','Boletos e remessas gerados','A receber / recebidas','A pagar / pagas','Conferência EFD - Reinf','Fluxo de caixa','Adiantamento','Previsão de Rateio']],
    ['Notas',['Configurar fornecedor','Configurar CFOP','Importar XML','Gerar contas a pagar','Auxiliar import. xml']],
    ['Cadastros',['Bancos','Pessoas','Implantação de saldo financeiro','Classificação financeira','Lançamento padrão recibo avulso','Forma pgto/recbto','Centro de custo','Convênio boleto','Lançamento padrão','Tipo de documento','Grupo de fornecedor','Relatório de pessoas','Centro de custo','Relatório de bancos','Tipo de recebimento']],
    ['Dados históricos',['Relatórios de recibos','Relatórios do contábil']],
    ['Fechamento',['Conciliação financeira','Fechamento','Analítico','Sintético','Painel de fechamento']],
    ['Orçamentos',['Estrutura do Orçamento','Planejamento orçamentário','Relatórios','Painel orçamentário']],
  ])},
  Batismo: { slug:'batismo', description:'Inscrições, registros, documentos, livros, oblações e transferências.', fields:fields.Batismo, groups:groups([
    ['Registros',['Inscrição e registro','Inscrição e registro simplificado','Certidão','Lembrança','Autorizações e apresentações','Listagens','Certificado de preparação','Pedido de certidão','Transferência de batismo','Certidão negativa de batismo','Retificação','Livros']],
    ['Livros',['Controle de livros','Índice','Abertura e encerramento']],['Financeiro',['Recibo de batismo','Relatório de oblações']],['Transferências',['Gerenciamento de transferências','Enviar documento','Solicitar documento','Enviar registro','Solicitar registro']],
  ])},
  Catequese: { slug:'catequese', description:'Catequizandos, grupos, etapas, livros, certificados e exportação sacramental.', fields:fields.Catequese, groups:groups([
    ['Formação',['Catequizando','Grupos catequéticos','Cadastro de etapas','Pedido de certidão','Transferência catequética','Certificado de catequese','Catequizando e seus grupos']],
    ['Sacramentos',['Exportar para batismo','Cancelar registro','Controle de livros','Registrar em livro','Exportar para eucaristia','Cancelar registro','Controle de livros','Registrar em livro','Exportar para crisma','Cancelar registro','Controle de livros','Registrar em livro']],
    ['Financeiro',['Recibo de catequese','Relatório de oblações']],['Transferências',['Gerenciamento de transferências','Enviar documento','Solicitar documento','Enviar registro','Solicitar registro']],
  ])},
  Crisma: { slug:'crisma', description:'Inscrições, registros, documentos, livros, oblações e transferências.', fields:fields.Crisma, groups:groups([
    ['Registros',['Inscrição e registro','Inscrição e registro simplificado','Certidão','Lembrança','Autorizações e apresentações','Listagens','Certificado de preparação','Pedido de certidão','Transferência de crisma','Certidão negativa de crisma','Notificação de crisma','Retificação','Livros']],
    ['Livros',['Controle de livros','Índice','Abertura e encerramento']],['Financeiro',['Recibo de crisma','Relatório de oblações']],['Transferências',['Gerenciamento de transferências','Enviar documento','Solicitar documento','Enviar registro','Solicitar registro']],
  ])},
  Eucaristia: { slug:'eucaristia', description:'Inscrições, registros, lembranças, livros, oblações e transferências.', fields:fields.Eucaristia, groups:groups([
    ['Registros',['Inscrição e registro','Lembrança','Listagens','Retificação']],['Livros',['Controle de livros','Registrar em livro','Índice de livros','Livros de eucaristia','Abertura e encerramento']],['Financeiro',['Recibo de eucaristia','Relatório de oblações']],['Transferências',['Gerenciamento de transferências','Enviar documento','Solicitar documento','Enviar registro','Solicitar registro']],
  ])},
  Matrimônio: { slug:'matrimonio', description:'Processo matrimonial, documentos canônicos, efeito civil, livros e transferências.', fields:fields.Matrimônio, groups:groups([
    ['Processo',['Inscrição e registro','Inscrição e registro simplificado','Procuração','Delegação',"Dispensa 'super rato'",'Justificação / supletório','Transferência matrimonial','Consentimento dos pais']],
    ['Documentos',['Certidão','Lembrança','Proclamas','Listagens','Documentos','Certidão negativa de matrimônio','Notificação de matrimônio','Autorizações e apresentações','Pedido de certidão','Instrumento canônico','Profissão de fé',"Pedido de 'sanatio'",'Retificação']],
    ['Efeito civil',['Efeito Civil','Requerimento de certidão de habilitação civil','Pedido de registro no livro civil','Termo de casamento para efeito civil','Declaração de compromisso de entrega']],
    ['Livros e arquivos',['Livros e arquivos','Controle de livros de matrimônio','Índice de livros de matrimônio','Livro de registros de matrimônios','Abertura e encerramento','Etiquetas para arquivo']],
    ['Financeiro',['Recibo de matrimônio','Relatório de oblações']],['Transferências',['Gerenciamento de transferências','Enviar documento','Solicitar documento','Enviar registro','Solicitar registro']],
  ])},
  Campanhas: { slug:'campanhas', description:'Benfeitores, lotes, doações, boletos e metas.', fields:fields.Campanhas, groups:groups([
    ['Campanha',['Campanha','Incluir benfeitor','Incluir múltiplos benfeitores','Geração de lote','Gerenciador de boleto','Envio de lote por e-mail','Doação para a campanha']],
    ['Relatórios',['Relatório de doações','Extrato do benfeitor','Relatório de metas de campanha']],
  ])},
  'Agendas e Cursos': { slug:'agenda-cursos', description:'Eventos, cursos, compromissos, missas, intenções e livro tombo.', fields:fields['Agendas e Cursos'], groups:groups([
    ['Eventos e cursos',['Eventos e cursos','Cadastro de participantes','Cadastro de assessores','Check-in e etiquetas','Gerenciador de mensalidades','Certificados','Relatórios','Ficha de eventos e cursos','Recibo','Relatório de recibos']],
    ['Agenda',['Calendário de atividades','Compromissos','Agenda de telefones','Pessoa para agenda','Tipos de telefone','Relatório de calendário de atividades','Compromissos no período']],
    ['Missas',['Avisos de missa','Intenções de missa','Tipos de intenções','Horários de missa','Agenda de avisos de missa','Intenções de missa','Recibo de intenção de missa','Relatório de recibos']],
    ['Livro tombo',['Cadastro de livro tombo','Relatório de livro tombo']],
  ])},
  Almoxarifado: { slug:'almoxarifado', description:'Produtos, requisições, compras, entradas, saídas e inventário.', fields:fields.Almoxarifado, groups:groups([
    ['Cadastros',['Produtos','Complementos','Grupo de produtos','Localização','Unidades','Departamentos','Requisitante']],
    ['Operações',['Entrada e saída de produtos','Devolução de produtos não consumíveis','Baixa definitiva de produtos','Solicitação predefinida','Requisições','Pedido de compra']],
    ['Relatórios',['Produtos','Movimentação','Requisições','Entradas de produtos','Saídas de produtos','Pedidos','Devoluções','Baixa definitiva de produtos','Produtos consumidos','Movimentação de produtos']],
  ])},
  Cemitério: { slug:'cemiterio', description:'Cemitérios, serviços, túmulos, concessões e recibos.', fields:fields.Cemitério, groups:groups([
    ['Cadastros',['Cadastro de cemitério','Cadastros','Cadastro de serviço','Túmulos','Tipos de túmulos']],
    ['Relatórios',['Relatórios de túmulos','Recibo de túmulo']],
  ])},
  Contábil: { slug:'contabil', description:'Escrituração, demonstrações, SPED, EFD-Reinf e impostos.', fields:fields.Contábil, groups:groups([
    ['Contabilidade',['Movimentação contábil','Aprop. e Transf. CP/LP','Manutenção de exercício']],
    ['Cadastros',['Históricos padrões','Plano de contas','Perfil plano de contas','Contabilistas','Representantes legais','Implantação de saldo contábil','Históricos padrões','Plano de contas']],
    ['Relatórios',['Razão','Balancete','DRE','Configuração','Relatório','DMPL','Configuração','Relatório','DFC','Configuração','Relatório','Notas Explicativas','Configuração','Relatório','Livros Contábeis','Diário Geral','Balanço Patrimonial','Livro Caixa','Termos','Gerenciais','Demonstrativo Gerencial','Estatísticas das arrecadações','Declaração de recebimentos','Relação dos totais por data','Movimentação contábil']],
    ['Saldos',['Impl. saldo contábil','Saldos contábeis']],
    ['SPED',['ECD','ECF','Origem e aplicação recursos X390','Saldo plano de contas anterior']],
    ['EFD-Reinf',['Cadastros EFD','Comissão financeira R-4020','Outras bases EFD Reinf','Dependente EFD Reinf','Advogado','Suspensão','Processo','Enviar','Consultar','Conferência EFD - Reinf']],
    ['Integrações',['Integrações','Consulta das integrações','Folha a pagar']],
    ['Impostos',['Configuração','Apuração','Relatórios','Impostos retidos','Comprovante de rendimentos pagos PJ','Comprovante de rendimentos pagos PF (aluguel)']],
  ])},
  Patrimônio: { slug:'patrimonio', description:'Bens, imóveis, veículos, reservas, locações e depreciação.', fields:fields.Patrimônio, groups:groups([
    ['Bens',['Bens móveis e outros','Imóveis','Veículos']],
    ['Cadastros',['Acessórios','Estado do bem','Classificação patrimonial','Localização do bem','Subtipo de bens','Cartório','Documentos legais','Apólice de seguros','Condutor']],
    ['Operações',['Reservas de bens','Locação de imóveis','Controle de depreciação','Inventário']],
    ['Relatórios',['Ficha do bem','Aquisições e baixas por período','Demonstrativo da depreciação','Balancete patrimonial','Razão patrimonial','Resumo de bens','Listagem de bens','Informativo de datas','Reservas','Locações']],
  ])},
  'Gestão Social': { slug:'gestao-social', description:'Beneficiários, doadores, produtos, cestas, distribuição e atendimento.', fields:fields['Gestão Social'], groups:groups([
    ['Pessoas',['Beneficiários','Doadores']],
    ['Cadastros',['Cadastro de produtos','Outros Cadastros','Unidades','Tipo de produto','Composição de kits e cestas','Cadastro de questionário']],
    ['Movimentações',['Distribuição individual','Entradas e saídas','Outras movimentações','Transferências','Distribuição comunitária','Montagem de kits e cestas','Transferências pendentes']],
    ['Atendimento',['Agenda de distribuição','Registro de atendimento','Relatório','Atendimento','Geral']],
  ])},
  ParóquiaNet: { slug:'paroquianet', description:'Canal digital, convites, avisos, horários e credenciamento.', fields:fields.ParóquiaNet, groups:groups([
    ['Canal',['Enviar convite ao fiel','Vincular fiel ParóquiaNet','Avisos de missa','Horários de missa','Credenciamento','Configuração do canal','Central de configurações','Tire suas dúvidas']],
  ])},
  Conectividade: { slug:'conectividade', description:'Suporte, avisos, novidades e notificações.', fields:fields.Conectividade, groups:groups([
    ['Serviços',['Suporte remoto','Central de avisos','O que há de novo','Notificações']],
  ])},
  'Partilha Fraterna': { slug:'partilha-fraterna', description:'Partilha, ofertas, recebimentos pastorais e credenciamento.', fields:fields['Partilha Fraterna'], groups:groups([
    ['Partilha',['Configurar partilha fraterna','Tipo de oferta','Recebimentos Pastorais','Credenciamento','Tire suas dúvidas']],
  ])},
  Configurações: { slug:'configuracoes', description:'Organismo, personalização, usuários, modelos, parâmetros e auditoria.', fields:fields.Configurações, groups:groups([
    ['Configuração',['Dados do organismo','Geral','Cabeçalho','Etiquetas','Licença de uso','Central de impressão','Parâmetros','Log de registros']],
    ['Personalização',['Modelo de texto','Envelope personalizado','Texto personalizado','Modelo de e-mail']],
    ['Usuários',['Cadastro de usuários','Troca de senha','Relatório de usuários']],
    ['Sobre',['Sobre o sistema Eclesial','Estrutura']],
  ])},
}

export const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
export const isReport = label => /relat|extrato|balancete|razão|demonstrativo|resumo|dre|dmpl|dfc|livro|declaração|estatística|conferência|listagem|ficha/i.test(label)
