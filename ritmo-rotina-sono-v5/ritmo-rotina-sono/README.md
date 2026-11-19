# Ritmo · Controle de rotina e sono

Site para organizar a rotina e cuidar do sono, que funciona também sem internet. Cada evento tem nome, horário, frequência (todo dia, dias da semana escolhidos, mensal com dias do mês ou semanas do mês, ou dia único), cor de marcação e esforço (leve, médio ou pesado). O site soma o esforço de cada dia e mostra o sono recomendado e a hora de deitar. Também tem diário de sono, check-in emocional, sequências com dias de descanso, tendências da semana e do mês, relatório para levar ao médico ou terapeuta (PDF e CSV), modo rotina mínima, lembretes, respiração guiada e um mixer de sons para relaxar.

## O que tem no projeto

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | Estrutura das páginas: página inicial, login e cadastro, Minha rotina, Sono, Relaxar e Meu perfil. |
| `js/app.js` | Todo o funcionamento do site (configuração, banco, telas, offline, relatório), com comentários em cada seção. |
| `js/tema.js` | Script curto que aplica o tema claro/escuro antes de desenhar a página, para não piscar. |
| `css/app.css` | Todo o visual do site, com um guia rápido no topo. |
| `vendor/supabase-js-2.117.3.js` | Biblioteca oficial do Supabase, hospedada junto com o site e verificada por integridade (SRI). |
| `_headers` | Cabeçalhos de segurança que o Netlify aplica ao site (CSP sem scripts embutidos, bloqueio de iframe, HTTPS, recursos do navegador desligados) e regras de cache do app. Cada item está explicado no próprio arquivo. |
| `manifest.webmanifest` | Manifesto do app: nome, ícones, cores, atalhos e capturas de tela usadas na instalação. |
| `sw.js` | Service worker: deixa o site instalável e faz ele abrir sem internet. |
| `icons/` | Ícones do app (192 e 512 px, versão para Android com margem segura, ícone do iPhone e favicon). |
| `screenshots/` | Capturas do app mostradas na janela de instalação do Android. |
| `scripts/verificar-segredos.sh` | Procura chaves secretas do Supabase no projeto (use antes de cada commit). |
| `scripts/verificar-csp.sh` | Confere se o HTML continua compatível com a CSP (sem `<script>`, `<style>`, `onclick=` ou `javascript:` embutidos). |
| `.github/workflows/verificar-segredos.yml` | Roda as duas verificações no GitHub a cada push e pull request. |
| `supabase/templates/redefinir-senha.html` | E-mail de "Esqueci minha senha" (pergunta se foi a pessoa que pediu e traz o botão para criar a senha nova). Cole no painel do Supabase. |
| `supabase/migrations/` | Estrutura do banco no Supabase, em ordem: tabelas e regras por linha (RLS), coluna `tema`, reforço de segurança, diário de sono, ritual, lembretes, integrações, rotina mínima, check-in emocional, exclusão de conta e eventos mensais por dias. |

## Páginas

No celular, o menu vira uma barra de abas fixa no rodapé.

| Endereço | Página |
| --- | --- |
| `#inicio` | Só para quem não entrou: com login, some do menu e leva a Minha rotina. Página inicial (landing page): hero com prévia do app, faixa animada, números sobre sono com fonte, problema e solução, recursos em abas, benefícios, como funciona, calculadora de sono, para quem é, comparação, privacidade, perguntas frequentes e chamada final. |
| `#rotina` | Minha rotina: o dia em blocos de Manhã, Tarde e Noite, modo rotina mínima, cadastro de eventos (com dias da semana: dias úteis, fins de semana ou qualquer combinação) e calendário. Exige login. |
| `#sono` | Sono: hora de deitar recomendada (relógio de 24 h), ritual de desaceleração com checklist, registro rápido da noite (com humor ao acordar), check-in emocional, sequência com dias de descanso, tendências da semana e do mês e lembretes. Exige login. |
| `#relaxar` | Relaxar: mixer com 3 pianos instrumentais, chuva, mar e ruído marrom (até 3 juntos), misturas prontas, tempo livre para tocar, relógio e respiração guiada (4-7-8, quadrada e 4-6). |
| `#perfil` | Meu perfil: dados da conta, tema claro ou escuro, dicas automáticas, resumo, relatório de sono (PDF e CSV), integrações, sair e excluir a conta. Exige login. |

## Diário, sequências e tendências

- **Registro rápido**: hora em que foi para a cama, tempo para adormecer (latência), despertares, hora em que acordou e energia de 1 a 5. Uma noite por data (a data da manhã em que acordou); salvar de novo na mesma data atualiza o registro.
- **Sono estimado** = tempo na cama menos a latência. **Eficiência** = sono estimado ÷ tempo na cama.
- **Sequência**: dias seguidos com o diário preenchido. Dias de descanso planejados (hoje ou depois, até 2 por semana) pausam a contagem sem zerar. Marcos de 3, 7, 14, 21, 30, 60 e 100 dias ganham um aviso.
- **Tendências** (7 ou 30 dias): média de sono, horário médio de deitar, porcentagem do ritual concluída por dia (sem contar dias de descanso) e energia média, com gráfico por noite e tabela.

## Página inicial (landing page)

**Só para visitantes.** Depois do login, o item Início some do menu e da barra de abas, a coluna "Conheça" do rodapé some, e qualquer endereço da página inicial (`#inicio`, `#recursos`, a marca no topo) leva a Minha rotina. Ao sair da conta, a página inicial volta.
- A lista fica em `PAGINAS_SO_VISITANTES`, e o destino de quem entrou, em `PAGINA_INICIAL_LOGADO`.
- Itens de menu com `soVisitantes: true` (em `NAV_LINKS`) e elementos com `data-so-visitantes` somem com login.
- Para a página inicial não piscar ao abrir o site já logado, o `<head>` lê a marca `ritmo_sessao_ativa` e esconde a página até a sessão carregar.

Seções em ordem, cada uma com um comentário `SEÇÃO:` no HTML e estilos na seção 22 do CSS:

1. **Hero**: promessa, duas chamadas, selos de confiança e uma prévia do app com cartões flutuantes.
2. **Faixa animada** com as frases de `FRASES_MARQUEE`.
3. **Números** sobre sono, cada um com o link da fonte (National Sleep Foundation, Instituto do Sono e AASM). Ao trocar um número, troque a fonte junto.
4. **Problema e solução**: "Sem um ritmo" contra "Com o Ritmo".
5. **Recursos em abas** (Rotina, Sono, Emocional, Relaxar, Relatório), com prévias feitas em HTML e CSS. As abas funcionam com mouse, toque e teclado (setas, Home e End).
6. **Benefícios**, **Como funciona** e **Calculadora** (funciona sem conta).
7. **Para quem é**, **Comparação** (Ritmo, alarme do celular e planilha), **Privacidade** e **Perguntas frequentes**.
8. **Chamada final** e rodapé com links para páginas e seções.

Detalhes:
- Botões com `data-cta` abrem "Criar conta" para visitantes. Para quem já entrou, levam à página de `data-destino` (padrão: Minha rotina) e mostram o texto de `data-texto-logado`.
- Elementos com a classe `revelar` aparecem suavemente ao rolar. Quem pede menos movimento no aparelho vê tudo direto.
- As perguntas frequentes viram dados estruturados (FAQPage) para buscadores, montados a partir do próprio HTML.
- A página não usa depoimentos nem números de usuários: só dados públicos com fonte e recursos que o site realmente tem.

## App no celular (instalação)

O Ritmo é um PWA: pode ser instalado na tela inicial e abre como app, em tela cheia, com ícone próprio.

- **Android, Chrome e Edge**: quando o navegador permite instalar, o botão **Instalar** abre a janela de instalação do próprio navegador (evento `beforeinstallprompt`).
- **iPhone e iPad**: não existe botão automático. O site mostra os passos do Safari (Compartilhar > Adicionar à Tela de Início). No iPhone, o app instalado pede login uma vez, porque guarda os dados separados do Safari.
- **Onde o convite aparece**:
  - na seção **Leve o Ritmo no bolso** da página inicial;
  - no cartão **App no celular** do perfil;
  - num aviso no topo do celular, a partir da 2ª visita ou com login (se fechado, some por 30 dias);
  - **logo depois do cadastro**, num diálogo "Conta criada! Agora, instale o Ritmo no celular". Se o cadastro pedir confirmação por e-mail, o convite aparece no primeiro acesso.
- **Já instalado** (aberto pelo ícone): os convites somem.
- **Sem internet**: o service worker guarda a página, a biblioteca e os ícones, e o modo offline (veja abaixo) guarda os dados da conta. O cache do service worker nunca guarda dados da conta.
- **Ao publicar uma versão nova**: a página vem sempre da rede primeiro, então o app instalado recebe a atualização sozinho. Se mudar a lista de arquivos em `sw.js`, troque `VERSAO` (por exemplo, `ritmo-v2`).
- A instalação só funciona em HTTPS (o Netlify já usa). Abrindo o `index.html` direto do computador ou na pré-visualização do Claude, o site mostra os passos, mas não instala.
- Os textos dos passos ficam em `PASSOS_INSTALACAO`, em `js/app.js`.

## Rotina mínima (dias de sobrecarga)

- O botão **Modo rotina mínima**, em Minha rotina, vale só para o dia de hoje (`checkins_diarios.modo_minimo`).
- Ligado, a agenda mostra só os eventos marcados como **essenciais** (caixa no cadastro do evento, coluna `eventos.essencial`) e avisa quantas atividades secundárias ficaram ocultas.
- Aparece o básico do dia: copos de água (meta em `AGUA_META_COPOS`), horário mínimo para deitar (garante `SONO_MINIMO_MINUTOS`, 7h) e o ritual curto (só os passos com `essencial: true` em `RITUAL_PASSOS`).

## Frequência dos eventos

| Opção | Como funciona | No banco |
| --- | --- | --- |
| Todo dia | Todos os dias a partir de "Começa em". | `frequencia = 'diaria'` |
| Dias da semana | Atalhos Dias úteis, Fins de semana e Todos os dias, ou qualquer combinação de Seg a Dom. | `semanal` + `dias_semana` (0 = domingo) |
| Mensal: dias do mês | Atalhos Início do mês, Dias 1 e 15 e Último dia, ou qualquer combinação de 1 a 31 e "último dia". Num mês mais curto, o dia 31 (ou 30, 29) cai no último dia. | `mensal` + `dias_mes` (32 = último dia) |
| Mensal: dias da semana do mês | Escolhe as semanas (1ª, 2ª, 3ª, 4ª ou última) e usa o mesmo seletor de dias da semana. Ex.: 1ª e 3ª segunda e quarta, ou última sexta. A 1ª semana são os dias 1 a 7; a última, os 7 últimos dias. | `mensal` + `semanas_mes` (5 = última) + `dias_semana` |
| Dia único | Só na data escolhida. | `unica` |

Eventos mensais antigos, sem `dias_mes` e sem `semanas_mes`, continuam no dia do mês da data de início. As regras ficam em `ocorreEm()`, e os textos, em `descreverDias()` e `descreverMensal()`.

## Funciona sem internet (modo offline)

Com a conta no Supabase, o site guarda uma cópia dos dados no aparelho e uma fila de alterações:

- **Sem internet**, dá para abrir o site (o service worker guarda a página) e usar tudo com a última cópia: ver a rotina e o sono, cadastrar e excluir eventos, registrar noites, fazer check-ins, ligar a rotina mínima e mudar o perfil.
- **O que você muda sem internet** aparece na hora e entra numa fila no aparelho. Eventos novos ganham um id provisório e a marca "Aguardando internet" na agenda.
- **Quando a conexão volta**, a fila sobe sozinha, na ordem em que foi feita. Isso acontece no evento `online`, ao voltar para a aba e a cada 30 segundos enquanto houver algo pendente. Depois, o site busca a versão mais nova do servidor, inclusive o que mudou em outro aparelho, e avisa quantas alterações foram sincronizadas.
- **Conflitos**: vale a última alteração enviada.
- **Alteração recusada**: se o servidor recusar uma alteração por uma regra do banco, ela sai da fila e o site avisa.
- **Barra no topo**: mostra quando está sem internet, sincronizando ou esperando um novo login para enviar.
- **Precisam de internet**: entrar, criar conta e excluir a conta.
- **Sair da conta com alterações pendentes**: o site avisa antes. Ao sair, a cópia e a fila daquela conta são apagadas do aparelho.
- **Onde fica no código**: em `js/app.js`, em `DB_OFFLINE`, `sincronizar()` e `atualizarBarraConexao()`. No aparelho, as chaves são `ritmo_copia_<id>`, `ritmo_fila_<id>` e `ritmo_offline_ultimo`.

## Check-in emocional

- **À noite** (página Sono): estresse, ansiedade e fadiga mental de 1 a 5, salvos em `checkins_diarios` na data da noite. Antes das 5h ainda conta como a noite anterior.
- **De manhã**: humor ao acordar de 1 a 5, no registro rápido (`registros_sono.humor`).
- A noite D é comparada com a manhã D + 1. "Tensão" é a média dos três valores da noite.
- **Histórico das noites** (tabela, 7 dias, 30 dias ou tudo): uma linha por noite com check-in. Cada linha mostra estresse, ansiedade, fadiga e tensão, mais o sono, o humor e a energia vindos do registro rápido da manhã seguinte, e o **resultado** da noite.
  - **Resultado** = humor ao acordar − calma ao deitar (6 − tensão). **Melhorou** com +1 ou mais, **Piorou** com −1 ou menos e **Estável** no meio.
  - Acima da tabela: noites com check-in, quantas acordou melhor, resultado médio e resultado depois de 7h ou mais de sono contra menos de 7h.
  - Sem a manhã registrada, a linha mostra "Registrar a manhã" (ou "Marcar o humor"), que abre o registro rápido na data certa.
- **No registro rápido**, aparece o check-in da noite anterior e, ao marcar o humor, o resultado da noite antes de salvar. O site mostra as últimas noites lado a lado e leituras simples: médias, humor depois de 7h ou mais de sono contra menos de 7h, e o que aconteceu depois das noites de tensão alta.

## Relatório de sono (Meu perfil)

- Período: últimos 30 dias, 90 dias ou todo o histórico.
- **Três blocos de resumo**:
  - **Sono**: noites, sono estimado, **sono recomendado pela rotina** e diferença média (quantas noites atingiram), horários médios, latência, despertares, eficiência e energia.
  - **Equilíbrio emocional**: noites com check-in, tensão, humor, quantas vezes acordou melhor ou pior, resultado médio da noite e o resultado com 7h ou mais de sono contra menos de 7h.
  - **Rotina e hábitos**: ritual concluído, esforço médio da rotina, dias em rotina mínima, dias de descanso, água e sequência do diário.
- **Tabela de noites**: deitou → acordou, adormecer, despertares, sono, recomendado (com a diferença), eficiência, energia, humor, estresse · ansiedade · fadiga, resultado da noite, ritual e o dia anterior (rotina mínima, descanso, copos de água).
- **PDF**: "Ver relatório" abre a prévia; "Imprimir ou salvar PDF" usa a impressão do navegador, com a página na horizontal (A4 deitado) e só o relatório.
- **CSV** (25 colunas, com as mesmas informações): separado por ponto e vírgula, com vírgula decimal e BOM (abre direto no Excel em português). Textos que começam com `=`, `+`, `-` ou `@` ganham um apóstrofo, contra fórmulas maliciosas; números negativos passam normalmente. Também dá para copiar o CSV.
- O código fica em `linhasRelatorio()`, `resumoRelatorio()`, `htmlRelatorio()` e `gerarCsv()`.
- Na pré-visualização do Claude, impressão e download comum são bloqueados; no site publicado funcionam normalmente.

## Sua conta

- **Sair** encerra a sessão só no aparelho.
- **Mudar senha** (Meu perfil > Sua conta > Senha): pede a senha atual antes, com o mesmo limite de tentativas do login. A senha nova usa o mesmo medidor e a mesma confirmação do cadastro, e senha fraca não é aceita. Depois de trocar, a sessão é encerrada nos outros aparelhos; neste, a pessoa continua conectada. Lógica em `iniciarMudarSenha()` e `DB.mudarSenha()`.
- **Esqueci minha senha** (no Entrar):
  1. Pede o e-mail e manda o link (`resetPasswordForEmail`). A resposta é sempre a mesma, exista ou não a conta, para ninguém descobrir quais e-mails estão cadastrados. Há uma espera de 60 s entre um pedido e outro.
  2. O e-mail (`supabase/templates/redefinir-senha.html`) chama a pessoa pelo nome, pergunta se foi ela que pediu, mostra o e-mail da conta e tem o botão **Sim, fui eu: criar senha nova**. Quem não pediu pode ignorar: nada muda.
  3. O botão abre o site com `?token_hash=...&type=recovery`. O código sai da barra de endereço na hora, é validado (`verifyOtp`) e abre **Crie uma senha nova**, com o mesmo medidor do cadastro. Funciona em qualquer navegador ou aparelho, vale 1 hora e só uma vez.
  4. A sessão do link serve só para trocar a senha: o site não entra na conta com ela. Fechar sem salvar (ou recarregar no meio) encerra essa sessão.
  5. Senha nova salva: a sessão é encerrada em todos os aparelhos e a pessoa entra com a senha nova.
  - Na demonstração (sem servidor), o e-mail não é enviado: aparece uma prévia dele com o botão, para testar o caminho todo.
  - Lógica em `iniciarRecuperacaoSenha()` e nos métodos `recuperarSenha`, `validarLinkRecuperacao` e `redefinirSenha` de cada `DB_*`.
- **Excluir conta** pede a senha e a confirmação de que é definitivo. No Supabase, chama a função `excluir_minha_conta()`, que apaga o usuário do Auth; perfis, eventos, registros, check-ins e integrações saem junto (cascade). No modo demonstração, apaga os dados do navegador.

### Para o "Esqueci minha senha" funcionar no site publicado (painel do Supabase)

1. **Authentication > URL Configuration**: em *Site URL*, coloque `https://ritmo-rotina-sono-v4.netlify.app`. Em *Redirect URLs*, adicione `https://ritmo-rotina-sono-v4.netlify.app/` (o mesmo de `DB_CONFIG.urlDoSite`, em `js/app.js`).
2. **Authentication > Emails > Templates > Reset Password**: no assunto, `Foi você que pediu uma senha nova no Ritmo?`; no corpo, cole todo o conteúdo de `supabase/templates/redefinir-senha.html`.
3. **Authentication > Emails > SMTP Settings**: ligue *Enable custom SMTP* e preencha com os dados do serviço de e-mail (Resend, Brevo, SendGrid, Amazon SES ou outro). O serviço padrão do Supabase só entrega para os e-mails da equipe do projeto e no máximo 2 por hora, então os usuários não receberiam o link.
   - **Host** é o servidor de e-mail do serviço, **nunca o endereço do site**. Exemplos: Brevo `smtp-relay.brevo.com` (porta 587), Resend `smtp.resend.com` (porta 465).
   - **Username** e **Password**: Brevo usa o e-mail de login e uma *SMTP key*; Resend usa `resend` e uma API key.
   - **Sender email**: um remetente verificado no serviço (de preferência num domínio seu).
   - Se o site mostrar "Não conseguimos enviar o e-mail agora", o problema está nesses dados: veja o erro em Supabase > Logs > Auth.
4. Opcional: em **Authentication > Rate Limits**, ajuste quantos e-mails por hora o projeto pode mandar depois de ligar o SMTP.

## Lembretes

- No navegador, os avisos do ritual (60 min antes de deitar) e do diário (no horário escolhido) aparecem enquanto o site estiver aberto em uma aba, como notificação e dentro do site.
- E-mail, WhatsApp e Telegram aparecem como "em breve". O banco já guarda as preferências (`lembrete_ritual`, `lembrete_diario`, `hora_lembrete_diario`, `canais_lembrete`). Para ativar, crie uma Edge Function agendada (pg_cron) que leia essas colunas e envie por um provedor de e-mail, pela API do WhatsApp Business ou por um bot do Telegram.

## Integrações (escala futura)

A tabela `integracoes` e as colunas `origem` e `id_externo` de `registros_sono` já estão prontas. O fluxo previsto para cada provedor:

1. O login OAuth é feito por uma Edge Function, e os tokens ficam no servidor (Vault do Supabase), nunca no navegador.
2. Uma função agendada busca as noites e grava em `registros_sono` com `origem` e `id_externo`. O registro manual tem prioridade.
3. O site mostra a origem de cada noite na tabela de tendências.

Situação de cada provedor:
- **Apple Health**: não tem acesso pela web; precisa de um app para iPhone (HealthKit).
- **Google Fit**: o Google não aceita novos apps nessas APIs e vai encerrá-las até o fim de 2026. O caminho é o Health Connect, no Android.
- **Garmin**: Health API, liberada só para desenvolvedores aprovados pela Garmin.
- **Oura**: API oficial com OAuth e dados de sono, o candidato mais simples para começar.

## Como rodar

O site é um arquivo HTML estático, sem etapa de build.

- **Para testar no computador**, abra `index.html` no navegador ou rode um servidor simples na pasta, por exemplo `npx serve .`. Os cabeçalhos de `_headers` (CSP) só valem no Netlify.
- **Para publicar**, envie a pasta inteira (com `js`, `css`, `vendor` e `_headers`) para uma hospedagem estática. No Netlify Drop, basta arrastar a pasta. Em outra hospedagem (Vercel, Cloudflare Pages, GitHub Pages), copie os cabeçalhos de `_headers` para a configuração dela, senão a proteção da CSP fica de fora.
- **Ao editar**, não escreva scripts, estilos nem `onclick=` dentro do `index.html`: coloque em `js/app.js` e `css/app.css`. Rode `bash scripts/verificar-csp.sh` para conferir.

O modo demonstração, que guarda os dados só no navegador, funciona apenas com o arquivo aberto no computador, em `localhost` ou em pré-visualização. No site publicado, se o Supabase não responder, o login fica indisponível e nada é salvo no navegador.

## Segurança

### Checklist

| Conduta | Como está no Ritmo |
| --- | --- |
| RLS em todas as tabelas | Ligado em `perfis`, `eventos`, `registros_sono`, `checkins_diarios` e `integracoes`. As políticas usam `auth.uid()`: cada usuário só lê, cria, altera e exclui o que é dele. |
| Autenticação nativa (Supabase Auth) | Login, senhas (com hash), tokens e renovação ficam no Supabase Auth. Nenhuma tabela tem coluna de senha. O modo demonstração (só no computador, `localhost` ou na prévia) guarda um hash PBKDF2 no navegador e nunca roda no site publicado. |
| `service_role` fora do site e do GitHub | O site usa só a chave pública (`sb_publishable_`). `chavePublica()` se recusa a iniciar com uma chave `sb_secret_` ou um JWT `service_role`. `scripts/verificar-segredos.sh` procura chaves secretas antes do commit, e `.github/workflows/verificar-segredos.yml` faz o mesmo no GitHub. O `.gitignore` bloqueia `.env`, `*.pem`, `*.key` e pastas do Supabase CLI. |
| Redirecionamentos e limite de tentativas | Precisa do painel (veja abaixo). No site, `DB_CONFIG.urlDoSite` fixa o endereço dos links de e-mail. A espera depois de 5 senhas erradas (que dobra a cada bloqueio) vale para o login e para a confirmação de senha ao excluir a conta, e continua valendo depois de recarregar a página. |
| Telas privadas só com sessão confirmada | Minha rotina, Sono e Meu perfil começam ocultas no HTML (`hidden`) e mostram "Carregando…" até a sessão ser conferida. A sessão é confirmada no servidor com `auth.getUser()`, porque `getSession()` só lê o navegador. Token vencido, revogado ou de conta apagada faz o site sair e voltar como visitante. Sem internet, o site só abre a cópia local se a sessão do Supabase daquela mesma conta ainda estiver guardada no aparelho. |
| Validações no banco | Todas as colunas têm tipo, `NOT NULL` onde precisa, faixas (esforço 1–3, notas 1–5, latência 0–240…), tamanhos (nome até 60/80) e formatos (cor `#RRGGBB`, celular com 10 ou 11 dígitos, sem `<` `>` nos nomes). Também há regras de coerência entre colunas (veja `supabase/migrations/20261118080000_reforcar_validacoes_banco.sql`) e um teto de linhas por conta. |
| Sem XSS na tela | Texto vindo do banco entra na tela por `textContent` ou passa por `escaparHtml()` (escapa `& < > " '`). Cores, horários, datas e notas são validados antes de entrar no HTML (`normalizarEvento`, `normalizarRegistro`, `normalizarCheckins`). Não há `onclick` nem outros atributos de evento no HTML. Usuário, cópia offline e fila também passam por validação (`normalizarUsuario`, `lerCopia`, `lerFila`). Por cima disso, a CSP da hospedagem não deixa rodar nenhum script embutido. |

**No banco (Supabase)**
- Cada usuário só lê e altera os próprios dados (RLS em todas as tabelas).
- Visitantes sem login não têm nenhuma permissão nas tabelas.
- Só as colunas editáveis podem ser alteradas: `id`, `usuario_id` e `criado_em` ficam travados.
- Nomes com `<`, `>` ou caracteres de controle são recusados, e as datas precisam ser válidas.
- Cada conta pode ter no máximo 300 eventos, 1.500 noites no diário de sono e 2.000 dias de check-in (contra quem tenta encher o banco).
- Funções do banco rodam com `search_path` fixo e não podem ser chamadas pela API, exceto `excluir_minha_conta()`, que só usuários logados chamam e que apaga apenas a própria conta. O aviso 0029 do Security Advisor sobre ela é esperado.
- Excluir a conta exige a senha digitada nos últimos 10 minutos, conferida **no servidor** (claim `amr` do token). Um token roubado, mesmo válido, não apaga a conta.
- Tabelas, sequências e funções novas nascem **sem** acesso para visitantes e usuários (negar por padrão): cada objeto novo precisa de `GRANT` e RLS explícitos.

**No site**
- Todo texto do usuário é escapado antes de aparecer na tela, contra injeção de código (XSS).
- Senha de 8 a 72 caracteres, com letras e números, sem conter o e-mail.
- **Medidor de força da senha** no cadastro: **fraca** (vermelho), **moderada** (laranja) ou **forte** (verde claro), com barras, critérios marcados e uma dica do que melhorar. Senha fraca não cria conta.
  - Pontos: tamanho (8, 12 e 16+ caracteres) e variedade (minúsculas, maiúsculas, números e símbolos).
  - Descontos: senha ou palavra comum, nome ou e-mail na senha, sequências (1234, abcd) e repetições (aaa).
  - Regras em `avaliarSenha()`; listas em `SENHAS_COMUNS` e `PALAVRAS_COMUNS`; cores nos tokens `--senha-fraca`, `--senha-moderada` e `--senha-forte`.
  - O campo de confirmação avisa se as duas senhas coincidem.
- Depois de 5 senhas erradas (no login ou ao excluir a conta), o site pede uma espera, que dobra a cada novo bloqueio e não zera ao recarregar.
- Ao abrir, a sessão é confirmada no servidor (`auth.getUser()`), e só então as telas privadas aparecem.
- Login com fluxo **PKCE**: tokens colados no endereço (`#access_token=...`) são recusados e apagados. Ninguém consegue mandar um link que coloque você dentro da conta dele.
- A cópia offline e a fila de alterações são conferidas antes de usar: dados corrompidos ou adulterados no navegador viram vazio em vez de quebrar a tela, e a fila nunca troca o `id` ou o e-mail da conta.
- O site se recusa a funcionar com uma chave secreta do Supabase (`chavePublica()`).
- Ao sair, ou quando a sessão termina em outra aba, os dados da conta saem da tela e dos formulários.
- A biblioteca do Supabase fica no próprio site, com verificação de integridade (SRI).

**Na hospedagem (`_headers`)**
- Política de segurança de conteúdo (CSP) que começa negando tudo (`default-src 'none'`) e libera só o que o site usa:
  - Scripts só de arquivos do próprio site (`js/` e `vendor/`). Nenhum script escrito dentro do HTML roda, nem `onclick=`, nem `javascript:`, nem `eval`. Mesmo que um texto malicioso chegasse à página, ele não executaria.
  - Folhas de estilo só do site e do Google Fonts; `<style>` injetado é bloqueado. Estilo em atributo (`style="--cor:..."`) continua liberado, porque o site usa para pintar eventos e barras.
  - Conexões só com o próprio site e o Supabase do projeto: os dados não podem ser enviados para outro endereço.
- O site não pode ser aberto dentro de outra página (proteção contra clickjacking).
- HTTPS obrigatório (HSTS) e recursos do navegador desligados (câmera, microfone, localização, pagamentos, sensores, USB, rastreamento de anúncios). Ficam ligados só áudio, tela cheia e copiar o CSV.
- Isolamento de outros sites: `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` e `Origin-Agent-Cluster`.
- Página, script e estilo sempre conferidos de novo (`Cache-Control: no-cache`), para as correções chegarem na hora. O app instalado busca página, script e estilo juntos na rede, para nunca misturar versões.

### Teste de invasão (18/11/2026)

Ataques feitos contra o banco real (em transações desfeitas no fim, sem deixar rastro) e contra o site (com um Supabase simulado e dados maliciosos):

| Ataque | Resultado |
| --- | --- |
| Visitante sem login lendo ou gravando qualquer tabela ou função | Bloqueado |
| Usuário A lendo, alterando ou apagando dados do usuário B | Bloqueado (0 linhas) |
| Trocar `usuario_id`, `id`, `origem` ou forjar uma integração | Bloqueado (42501) |
| Nome com `<script>`, CSS malicioso na cor, HTML no ritual | Bloqueado no banco (23514) |
| **Apagar a conta com um token roubado antigo** | **Falha encontrada e corrigida**: agora exige senha digitada há menos de 10 minutos |
| **Link com o token do atacante (`#access_token=`) logando a vítima na conta dele** | **Falha encontrada e corrigida**: fluxo PKCE e limpeza do endereço |
| **Encher o banco: ~20 mil linhas numa única requisição** | **Falha encontrada e corrigida**: teto por conta |
| **Cópia offline corrompida no navegador quebrando a tela** | **Falha encontrada e corrigida**: cópia e fila validadas |
| Tabela nova criada no futuro ficando aberta por padrão | **Risco corrigido**: negar por padrão |
| XSS em todos os campos (nome, celular, sexo, tema, cor, horários, datas, ids, ritual, notas) nas 4 páginas, calendário e relatório | Nada executou |
| Endereço (`#hash`) com HTML, `javascript:` e `__proto__` | Nada executou |
| Marcar "sessão ativa" no navegador sem estar logado | Telas privadas continuam ocultas |
| Fórmulas no CSV (`=`, `+`, `@`) | Neutralizadas |
| Poluição de protótipo pela fila offline | Bloqueada |
| Vazamento de dados para outros domínios | Nenhum pedido saiu |
| Script injetado na página (`<script>`, `onerror=`, `onload=`, `javascript:`), `<style>` injetado, script de outro site, envio para outro domínio, iframe | Bloqueados pela CSP (hospedagem atualizada) |

Riscos que continuam (dependem do painel do Supabase):
- O cadastro diz quando um e-mail já existe (risco baixo, típico com a confirmação de e-mail desligada).
- Os itens do painel abaixo (CAPTCHA, senhas vazadas, senha mínima, redirecionamentos e limites).

**Configurações que só podem ser feitas no painel do Supabase**
1. **Authentication > URL Configuration**: em *Site URL*, coloque o endereço oficial do site (o do Netlify). Em *Redirect URLs*, deixe **só** esse endereço (apague `localhost` e outros que não usa). Coloque o mesmo endereço em `DB_CONFIG.urlDoSite`, no script.
2. **Authentication > Rate Limits**: mantenha os limites ligados (tentativas de login/token, cadastros e e-mails por hora). Não aumente sem motivo.
3. **Authentication > Attack Protection**: ative o CAPTCHA (Cloudflare Turnstile ou hCaptcha) para barrar robôs no cadastro e no login, já que a confirmação de e-mail está desligada. Ative também a proteção contra senhas vazadas, se o seu plano tiver essa opção.
4. **Authentication > Providers > Email**: senha mínima de 8 caracteres, com letras e números.
5. **Project Settings > API Keys**: nunca copie a chave `service_role` / `secret` para o site. Se ela já foi parar em algum arquivo ou commit, gere uma nova no painel.

## Banco de dados (Supabase)

O site já aponta para o projeto **Ritmo** no Supabase. Endereço e chave ficam em `DB_CONFIG`, no topo de `js/app.js`.

- A chave em `DB_CONFIG` é a chave **pública** (publishable). Ela pode ficar no código porque as regras de segurança do banco só deixam cada usuário ver e alterar os próprios dados. Nunca coloque a chave secreta (`service_role` ou `sb_secret_…`) no site.
- E-mail e senha ficam no Supabase Auth. Nome, celular, sexo e hora de acordar ficam na tabela `perfis`.
- Para recriar o banco em outro projeto, rode os arquivos de `supabase/migrations` em ordem no SQL Editor do Supabase e troque `url` e `chave` em `DB_CONFIG`.

### Configurações recomendadas no painel do Supabase

1. **Authentication > Sign In / Providers > Email**: desligue *Confirm email* para o usuário entrar logo após criar a conta, ou configure um SMTP próprio para enviar os e-mails de confirmação. Se ligar, o link de confirmação (fluxo PKCE) já entra sozinho no mesmo navegador em que a conta foi criada; em outro aparelho, o e-mail fica confirmado e basta entrar com a senha.
2. **Authentication > URL Configuration**: coloque o endereço onde o site está publicado em *Site URL*.

## Tom de voz dos textos

Os textos do Ritmo conversam com a pessoa, em português do Brasil. Ao escrever algo novo:

- Fale com "você", de forma próxima e acolhedora, como alguém que entende de sono e quer ajudar. Frases curtas e palavras do dia a dia ("deitar", "cansar", "contar como dormiu"), sem termos técnicos.
- Sem culpa: dia puxado, noite esquecida ou meta perdida "acontecem com todo mundo". O texto mostra o próximo passo.
- Erros dizem o que aconteceu e o que fazer ("Não deu para salvar agora. Tente de novo em instantes."). Faltou um campo? "Faltou o horário do evento."
- Conquistas são comemoradas sem exagero ("Meta de água cumprida! Seu corpo agradece.").
- **Ligações entre assuntos**: cada seção da página inicial termina com uma frase-ponte que leva à próxima (`.ponte`), na ordem números → problema → recursos → benefícios → como começar → calculadora → para quem é → comparação → instalar → privacidade → perguntas. Cada página do app termina sugerindo o próximo passo do dia (`.ponte-pagina`): Minha rotina → Sono → Relaxar → Sono (de manhã); Meu perfil → Minha rotina. Ao criar uma seção nova, ajuste a ponte da seção anterior para apontar para ela.
- Títulos e rótulos em PT-BR usam maiúscula só na primeira letra ("Mente tranquila", não "Mente Tranquila").

## Onde editar

O topo de `css/app.css` tem um guia rápido. Os pontos principais são:

- `CONFIG` e `NAV_LINKS`: nome do site e itens do menu.
- Tokens em `:root`: cores (base `#9FB5C4`) e fontes (Comfortaa nos títulos, Plus Jakarta Sans nos textos).
- `SONO_CONFIG` e `calcularSono()`: regras do cálculo de sono.
- `FREQUENCIAS`, `ocorreEm()` e `renderizarCalendario()`: frequência dos eventos e calendário. `ATALHOS_DIAS` e `descreverDias()`: atalhos (dias úteis, fins de semana, todos os dias) e textos dos dias da semana.
- `renderizarHistoricoEmocional()` e `resultadoNoite()`: tabela do check-in emocional.
- `DB_OFFLINE`, `sincronizar()` e `atualizarBarraConexao()`: modo offline e sincronização.
- `DB_SUPABASE` e `DB_LOCAL`: acesso ao banco online e ao modo demonstração.
- `FRASES_MARQUEE`: frases da faixa animada.
- `iniciarLanding()`: abas de recursos, animação ao rolar, textos das chamadas e perguntas frequentes para buscadores.
- `PASSOS_INSTALACAO`, `iniciarInstalacao()` e `sw.js`: instalação no celular e funcionamento sem internet.
- `aplicarTema()`: tema claro, escuro ou automático.
- `SONS`, `MISTURAS` e `MAX_SONS`: sons, misturas prontas e limite do mixer. `notaPiano()` e `sequenciador()` geram o piano.
- `PERIODOS`, `RITUAL_MINUTOS` e `RITUAL_PASSOS`: blocos do dia e passos do ritual (não troque ids já usados; `essencial: true` mantém o passo na rotina mínima).
- `AGUA_META_COPOS` e `SONO_MINIMO_MINUTOS`: o básico do modo rotina mínima.
- `ESCALAS_EMOCIONAIS`, `NIVEIS_TENSAO` e `NIVEIS_HUMOR`: check-in emocional e rótulos das escalas.
- `gerarCsv()` e `htmlRelatorio()`: colunas do CSV e conteúdo do relatório.
- `TECNICAS_RESPIRACAO`: técnicas de respiração guiada (fases, segundos e ciclos).
- `DICAS`: dicas de descanso mostradas no popup.
- `INTEGRACOES`: provedores de wearables listados no perfil.
- `PAGINAS`: lista de páginas. Para criar uma nova, adicione um `<div id="view-NOME" hidden>` e o nome nessa lista.

## Como o sono é calculado

Para cada dia, o cálculo parte de 7h e soma 5 min por evento leve, 10 por médio e 20 por pesado. O resultado fica entre 7h e 9h, a faixa indicada para adultos. A hora de deitar soma 15 min para pegar no sono. É uma estimativa e não substitui a orientação de um profissional de saúde.
