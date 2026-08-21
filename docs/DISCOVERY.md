# Protocolo de descoberta do produto de referência

## Status da inspeção

A inspeção autenticada foi concluída em 20/08/2026 por meio da sessão que o usuário já havia aberto no Chrome. A varredura foi estritamente de leitura e limitada à estrutura renderizada de menus e funções, sem copiar dados pessoais, código, banco ou ativos do sistema de referência. O resultado reconciliado contém 460 funções-folha em 19 áreas e está registrado em `REFERENCE_INVENTORY.md`.

## Regras de segurança e privacidade

1. Usar as credenciais somente de forma efêmera e nunca persistir senha, cookie, token, local storage ou resposta contendo dados pessoais.
2. Não abrir, copiar, exportar ou registrar dados de fiéis, finanças, sacramentos ou usuários reais.
3. Catalogar metadados da interface, não conteúdo de registros.
4. Usar nomes sintéticos nas notas e ocultar instituição, pessoas, documentos, valores, endereços e identificadores.
5. Não executar ações destrutivas ou mutações: salvar, excluir, baixar, estornar, emitir, enviar ou alterar configurações.
6. Em modais que exigem gravação para avançar, registrar apenas a existência do bloqueio e solicitar ambiente de homologação.
7. Encerrar a sessão e destruir os artefatos de autenticação ao final.

## Roteiro por tela

Para cada rota visível ao perfil autorizado, registrar:

- módulo, grupo, menu, submenu, breadcrumb e título;
- URL sem identificadores sensíveis;
- permissão aparente e estados sem acesso;
- barra de operações e condição de habilitação de cada ação;
- abas, seções, campos, tipo do controle, obrigatoriedade, máscara, valor padrão e ajuda;
- pesquisa, filtros, colunas, paginação, ordenação e exportações;
- modal, gatilho, campos, validações, confirmação e fechamento;
- estados vazio, carregando, sucesso e erro;
- navegação por teclado e comportamento responsivo;
- integrações inferíveis apenas pela interface, marcadas como hipótese;
- evidência anonimizada e data da observação.

## Matriz de evidência

Cada item do catálogo deverá receber um estado:

- `NÃO INSPECIONADO`: derivado apenas dos requisitos fornecidos;
- `OBSERVADO`: visto diretamente sem executar mutação;
- `VALIDADO`: comportamento exercitado em homologação com dado fictício;
- `INACESSÍVEL`: não exibido ao perfil ou bloqueado pelo ambiente;
- `NÃO APLICÁVEL`: confirmado como fora da edição/tenant.

## Critério de conclusão

A descoberta estará completa quando todas as folhas da árvore de navegação possuírem uma ficha, todos os botões e modais tiverem ao menos um estado documentado e as lacunas por permissão/edição forem explicitamente registradas. A inspeção de um único perfil não comprova o catálogo global do produto.
