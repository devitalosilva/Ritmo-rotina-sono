# Ritmo · Controle de rotina e sono

Site para organizar a rotina e cuidar do sono. Cada evento tem nome, horário, frequência, cor de marcação e esforço (leve, médio ou pesado). O site soma o esforço de cada dia e mostra o sono recomendado e a hora de deitar. Também tem diário de sono, check-in emocional, sequências com dias de descanso, tendências da semana e do mês, relatório para levar ao médico ou terapeuta (PDF e CSV), modo rotina mínima, lembretes, respiração guiada e um mixer de sons para relaxar.

## O que tem no projeto

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | O site inteiro: página inicial, login e cadastro, Minha rotina, Sono, Relaxar e Meu perfil. HTML, CSS e JavaScript no mesmo arquivo, com comentários em cada seção. |
| `vendor/supabase-js-2.117.3.js` | Biblioteca oficial do Supabase, hospedada junto com o site e verificada por integridade (SRI). |
| `_headers` | Cabeçalhos de segurança que o Netlify aplica ao site (CSP, bloqueio de iframe, HTTPS) e regras de cache do app. |
| `manifest.webmanifest` | Manifesto do app: nome, ícones, cores, atalhos e capturas de tela usadas na instalação. |
| `sw.js` | Service worker: deixa o site instalável e faz ele abrir sem internet. |
| `icons/` | Ícones do app (192 e 512 px, versão para Android com margem segura, ícone do iPhone e favicon). |
| `screenshots/` | Capturas do app mostradas na janela de instalação do Android. |
| `supabase/migrations/` | Estrutura do banco no Supabase, em ordem: tabelas e regras por linha (RLS), coluna `tema`, reforço de segurança, diário de sono, ritual, lembretes, integrações, rotina mínima, check-in emocional e exclusão de conta. |

## Páginas

No celular, o menu vira uma barra de abas fixa no rodapé.

| Endereço | Página |
| --- | --- |
| `#inicio` | Só para quem não entrou: com login, some do menu e leva a Minha rotina. Página inicial (landing page): hero com prévia do app, faixa animada, números sobre sono com fonte, problema e solução, recursos em abas, benefícios, como funciona, calculadora de sono, para quem é, comparação, privacidade, perguntas frequentes e chamada final. |
| `#rotina` | Minha rotina: o dia em blocos de Manhã, Tarde e Noite, modo rotina mínima, cadastro de eventos e calendário. Exige login. |
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
- **Sem internet**: o service worker guarda a página, a biblioteca e os ícones. O site abre, e a calculadora e a página Relaxar funcionam. Login e dados precisam de conexão. Dados da conta nunca ficam no cache.
- **Ao publicar uma versão nova**: a página vem sempre da rede primeiro, então o app instalado recebe a atualização sozinho. Se mudar a lista de arquivos em `sw.js`, troque `VERSAO` (por exemplo, `ritmo-v2`).
- A instalação só funciona em HTTPS (o Netlify já usa). Abrindo o `index.html` direto do computador ou na pré-visualização do Claude, o site mostra os passos, mas não instala.
- Os textos dos passos ficam em `PASSOS_INSTALACAO`, no script.

## Rotina mínima (dias de sobrecarga)

- O botão **Modo rotina mínima**, em Minha rotina, vale só para o dia de hoje (`checkins_diarios.modo_minimo`).
- Ligado, a agenda mostra só os eventos marcados como **essenciais** (caixa no cadastro do evento, coluna `eventos.essencial`) e avisa quantas atividades secundárias ficaram ocultas.
- Aparece o básico do dia: copos de água (meta em `AGUA_META_COPOS`), horário mínimo para deitar (garante `SONO_MINIMO_MINUTOS`, 7h) e o ritual curto (só os passos com `essencial: true` em `RITUAL_PASSOS`).

## Check-in emocional

- **À noite** (página Sono): estresse, ansiedade e fadiga mental de 1 a 5, salvos em `checkins_diarios` na data da noite. Antes das 5h ainda conta como a noite anterior.
- **De manhã**: humor ao acordar de 1 a 5, no registro rápido (`registros_sono.humor`).
- A noite D é comparada com a manhã D + 1. "Tensão" é a média dos três valores da noite. O site mostra as últimas noites lado a lado e leituras simples: médias, humor depois de 7h ou mais de sono contra menos de 7h, e o que aconteceu depois das noites de tensão alta.

## Relatório de sono (Meu perfil)

- Período: últimos 30 dias, 90 dias ou todo o histórico.
- **PDF**: "Ver relatório" abre a prévia; "Imprimir ou salvar PDF" usa a impressão do navegador, e o CSS de impressão mostra só o relatório.
- **CSV**: separado por ponto e vírgula, com vírgula decimal e BOM (abre direto no Excel em português). Células que começam com `=`, `+`, `-` ou `@` ganham um apóstrofo, contra fórmulas maliciosas. Também dá para copiar o CSV.
- Na pré-visualização do Claude, impressão e download comum são bloqueados; no site publicado funcionam normalmente.

## Sua conta

- **Sair** encerra a sessão só no aparelho.
- **Excluir conta** pede a senha e a confirmação de que é definitivo. No Supabase, chama a função `excluir_minha_conta()`, que apaga o usuário do Auth; perfis, eventos, registros, check-ins e integrações saem junto (cascade). No modo demonstração, apaga os dados do navegador.

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

- **Para testar no computador**, abra `index.html` no navegador ou rode um servidor simples na pasta, por exemplo `npx serve .`.
- **Para publicar**, envie a pasta inteira (com `vendor` e `_headers`) para uma hospedagem estática. No Netlify Drop, basta arrastar a pasta.

O modo demonstração, que guarda os dados só no navegador, funciona apenas com o arquivo aberto no computador, em `localhost` ou em pré-visualização. No site publicado, se o Supabase não responder, o login fica indisponível e nada é salvo no navegador.

## Segurança

**No banco (Supabase)**
- Cada usuário só lê e altera os próprios dados (RLS em `perfis` e `eventos`).
- Visitantes sem login não têm nenhuma permissão nas tabelas.
- Só as colunas editáveis podem ser alteradas: `id`, `usuario_id` e `criado_em` ficam travados.
- Nomes com `<`, `>` ou caracteres de controle são recusados, e as datas precisam ser válidas.
- Cada conta pode ter no máximo 300 eventos.
- Funções do banco rodam com `search_path` fixo e não podem ser chamadas pela API, exceto `excluir_minha_conta()`, que só usuários logados chamam e que apaga apenas a própria conta. O aviso 0029 do Security Advisor sobre ela é esperado.
- Excluir a conta exige a senha de novo.

**No site**
- Todo texto do usuário é escapado antes de aparecer na tela, contra injeção de código (XSS).
- Senha de 8 a 72 caracteres, com letras e números, sem conter o e-mail.
- **Medidor de força da senha** no cadastro: **fraca** (vermelho), **moderada** (laranja) ou **forte** (verde claro), com barras, critérios marcados e uma dica do que melhorar. Senha fraca não cria conta.
  - Pontos: tamanho (8, 12 e 16+ caracteres) e variedade (minúsculas, maiúsculas, números e símbolos).
  - Descontos: senha ou palavra comum, nome ou e-mail na senha, sequências (1234, abcd) e repetições (aaa).
  - Regras em `avaliarSenha()`; listas em `SENHAS_COMUNS` e `PALAVRAS_COMUNS`; cores nos tokens `--senha-fraca`, `--senha-moderada` e `--senha-forte`.
  - O campo de confirmação avisa se as duas senhas coincidem.
- Depois de 5 tentativas de login erradas, o site pede uma espera, que dobra a cada novo bloqueio.
- Ao sair, ou quando a sessão termina em outra aba, os dados da conta saem da tela e dos formulários.
- A biblioteca do Supabase fica no próprio site, com verificação de integridade (SRI).

**Na hospedagem (`_headers`)**
- Política de segurança de conteúdo (CSP): scripts só do próprio site e conexões só com o Supabase do projeto.
- O site não pode ser aberto dentro de outra página (proteção contra clickjacking).
- HTTPS obrigatório e recursos como câmera e microfone desligados.

**Configurações que só podem ser feitas no painel do Supabase**
1. Authentication > Attack Protection: ative o CAPTCHA (Cloudflare Turnstile ou hCaptcha) para barrar cadastros automáticos, já que a confirmação de e-mail está desligada.
2. Authentication > Providers > Email: defina a senha mínima em 8 caracteres e exija letras e números.
3. Authentication > Attack Protection: ative a proteção contra senhas vazadas, se o seu plano tiver essa opção.
4. Authentication > URL Configuration: coloque o endereço do Netlify em *Site URL* e deixe em *Redirect URLs* só os endereços do site.

## Banco de dados (Supabase)

O site já aponta para o projeto **Ritmo** no Supabase. Endereço e chave ficam em `DB_CONFIG`, no script de `index.html`.

- A chave em `DB_CONFIG` é a chave **pública** (publishable). Ela pode ficar no código porque as regras de segurança do banco só deixam cada usuário ver e alterar os próprios dados. Nunca coloque a chave secreta (`service_role` ou `sb_secret_…`) no site.
- E-mail e senha ficam no Supabase Auth. Nome, celular, sexo e hora de acordar ficam na tabela `perfis`.
- Para recriar o banco em outro projeto, rode os arquivos de `supabase/migrations` em ordem no SQL Editor do Supabase e troque `url` e `chave` em `DB_CONFIG`.

### Configurações recomendadas no painel do Supabase

1. **Authentication > Sign In / Providers > Email**: desligue *Confirm email* para o usuário entrar logo após criar a conta, ou configure um SMTP próprio para enviar os e-mails de confirmação.
2. **Authentication > URL Configuration**: coloque o endereço onde o site está publicado em *Site URL*.

## Onde editar

O topo do `<style>` em `index.html` tem um guia rápido. Os pontos principais são:

- `CONFIG` e `NAV_LINKS`: nome do site e itens do menu.
- Tokens em `:root`: cores (base `#9FB5C4`) e fontes (Comfortaa nos títulos, Plus Jakarta Sans nos textos).
- `SONO_CONFIG` e `calcularSono()`: regras do cálculo de sono.
- `FREQUENCIAS`, `ocorreEm()` e `renderizarCalendario()`: frequência dos eventos e calendário.
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
