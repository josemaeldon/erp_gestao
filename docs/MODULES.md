# Relacionamentos entre módulos

| Origem | Destino | Regra integrada |
|---|---|---|
| Fiéis | todos os módulos pastorais | pessoa central é referenciada, nunca recadastrada |
| Dízimo/oferta/campanha | Financeiro/recibos | recebimento e partidas são criados atomicamente |
| Sacramento/intenção/curso | Financeiro | taxa/oferta cria recebível ou recebimento com origem rastreável |
| Catequese | Sacramento | conclusão exporta dados por referência, com revisão, sem duplicação |
| Conta a pagar/receber | Caixa/banco | baixa cria partidas; estorno produz transação inversa |
| Transferência | Caixa/banco | uma transação lógica gera saída e entrada balanceadas |
| Repasse interno | Caixa/banco | gera saída e entrada vinculadas por identificador rastreável |
| Nota fiscal | Fornecedor/contas a pagar | CNPJ reaproveita fornecedor e vencimentos geram títulos |
| Conciliação | Financeiro | item bancário vincula lançamento ou inicia criação controlada |
| Pix/cartão/boleto | Origem/financeiro | webhook idempotente identifica origem, baixa e concilia |
| Imóvel/locação | Contas a receber | contrato gera títulos recorrentes conforme competência |
| Curso | Financeiro/documentos | mensalidades e certificados referenciam a inscrição |
| Campanha | Boleto/financeiro | lote agrega compromissos abertos e recebimento gera transação |
| Estoque social | Kits/distribuições | montagem e entrega consomem saldo com bloqueio transacional |
| Anexos | entidades autorizadas | serviço central mantém hash, MIME, autor e object key |
| Auditoria | módulos críticos | ação, entidade, autor e metadados são persistidos |
| Fechamento | módulos financeiros | competência fechada bloqueia inclusão/alteração; reabertura é auditada |
