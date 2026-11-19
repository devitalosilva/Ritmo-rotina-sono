/* =========================================================
   RITMO · script do site (antes ficava dentro do index.html)
   Fica num arquivo separado porque a política de segurança (CSP, em _headers)
   só deixa rodar scripts que são arquivos do próprio site. Assim, mesmo que algum
   texto malicioso entrasse na página, ele não conseguiria executar código.
   ========================================================= */
/* =========================================================
   CONFIG: dados gerais do site. Edite aqui primeiro.
   ========================================================= */
const CONFIG = {
  nome: "Ritmo", // Nome do site (marca no menu e rodapé)
};

/* =========================================================
   NAV_LINKS: itens do menu (no computador, no topo; no celular, barra de abas no rodapé).
   "#rotina", "#sono", "#relaxar" e "#perfil" abrem as páginas do site (veja PAGINAS).
   curto: nome na barra de abas do celular. icone: chave de ICONES.
   soVisitantes: true faz o item aparecer só para quem não entrou (some depois do login).
   Para uma página nova em outro arquivo: { label: "Relatórios", href: "relatorios.html", icone: "lista" }
   ========================================================= */
const NAV_LINKS = [
  { label: "Início", href: "#inicio", icone: "casa", soVisitantes: true },
  { label: "Minha rotina", curto: "Rotina", href: "#rotina", icone: "lista" },
  { label: "Sono", href: "#sono", icone: "lua" },
  { label: "Relaxar", href: "#relaxar", icone: "nota" },
  { label: "Meu perfil", curto: "Perfil", href: "#perfil", icone: "pessoa" },
];

/* Ícones em SVG (traço de 24 x 24), usados no menu e nos blocos do dia */
const ICONES = {
  casa: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />',
  lista: '<path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1.2" /><circle cx="4.5" cy="12" r="1.2" /><circle cx="4.5" cy="18" r="1.2" />',
  lua: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />',
  nota: '<path d="M9 18V6l11-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" />',
  pessoa: '<circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />',
  sol: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />',
  solPoente: '<path d="M17 18a5 5 0 0 0-10 0" /><path d="M12 9V3M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1" />',
};

/* Frases da faixa animada da página inicial */
const FRASES_MARQUEE = ["Rotina em dia", "Mente tranquila", "Corpo descansado"];

/* =========================================================
   CALCULADORA RÁPIDA (página inicial)
   cycleMinutes: duração de um ciclo de sono (cerca de 90 min)
   fallAsleepMinutes: tempo médio para pegar no sono
   ========================================================= */
const SLEEP_SETTINGS = {
  cycleMinutes: 90,
  fallAsleepMinutes: 15,
  opcoes: [
    { ciclos: 5, rotulo: "Mínimo recomendado" },               // 7h30 de sono
    { ciclos: 6, rotulo: "Ideal para a maioria dos adultos" }, // 9h00 de sono
  ],
};

/* =========================================================
   SONO_CONFIG: regras do cálculo de sono da página Minha rotina.
   Sono recomendado do dia = base + minutos extras por evento daquele dia,
   conforme o esforço, limitado entre mínimo e máximo
   (7h a 9h é a faixa indicada para adultos).
   ========================================================= */
const SONO_CONFIG = {
  baseMinutos: 420,                        // 7h
  minimoMinutos: 420,                      // 7h
  maximoMinutos: 540,                      // 9h
  extraPorEsforco: { 1: 5, 2: 10, 3: 20 }, // minutos a mais por evento leve, médio e pesado
  minutosParaAdormecer: 15,
  horaAcordarPadrao: "07:00",
};

/* Nomes de cada nível de esforço (1, 2 ou 3 bolas) */
const ESFORCOS = {
  1: { nome: "Leve", singular: "leve", plural: "leves" },
  2: { nome: "Médio", singular: "médio", plural: "médios" },
  3: { nome: "Pesado", singular: "pesado", plural: "pesados" },
};

/* Frequências aceitas. As chaves são as mesmas da coluna "frequencia" no banco. */
const FREQUENCIAS = {
  diaria: "Todo dia",
  semanal: "Dias da semana",
  mensal: "Mensal",
  unica: "Dia único",
};

/* Dias da semana na ordem do JavaScript (0 = domingo) */
const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const DIAS_SEMANA_NOMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/* Atalhos do cadastro de eventos (frequência "Dias da semana") */
const ATALHOS_DIAS = {
  uteis: [1, 2, 3, 4, 5],
  fimDeSemana: [0, 6],
  todos: [0, 1, 2, 3, 4, 5, 6],
};

/* Cores prontas de marcação. Adicione ou troque à vontade (formato #RRGGBB). */
const CORES_EVENTO = [
  { cor: "#9FB5C4", nome: "Azul névoa" },
  { cor: "#F4C2A8", nome: "Pêssego" },
  { cor: "#A8C3A0", nome: "Sálvia" },
  { cor: "#B9A7D6", nome: "Lavanda" },
  { cor: "#E8D08A", nome: "Areia" },
  { cor: "#5F7D91", nome: "Ardósia" },
];

/* Rotina usada pelo botão "Carregar rotina de exemplo".
   As datas são calculadas a partir do mês atual. */
function montarRotinaExemplo() {
  const hoje = new Date();
  const inicioMes = chaveData(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const dia10 = chaveData(new Date(hoje.getFullYear(), hoje.getMonth(), 10));
  const daqui3Dias = chaveData(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 3));
  return [
    { nome: "Acordar", horario: "07:00", esforco: 1, cor: "#E8D08A", frequencia: "diaria", dataInicio: inicioMes, diasSemana: [], essencial: true },
    { nome: "Corrida no parque", horario: "07:30", esforco: 3, cor: "#A8C3A0", frequencia: "semanal", dataInicio: inicioMes, diasSemana: [1, 3, 5] },
    { nome: "Trabalho", horario: "09:00", esforco: 2, cor: "#9FB5C4", frequencia: "semanal", dataInicio: inicioMes, diasSemana: [1, 2, 3, 4, 5], essencial: true },
    { nome: "Almoço", horario: "12:30", esforco: 1, cor: "#F4C2A8", frequencia: "diaria", dataInicio: inicioMes, diasSemana: [], essencial: true },
    { nome: "Reuniões", horario: "14:00", esforco: 2, cor: "#5F7D91", frequencia: "semanal", dataInicio: inicioMes, diasSemana: [2, 4] },
    { nome: "Consulta no dentista", horario: "16:00", esforco: 2, cor: "#B9A7D6", frequencia: "unica", dataInicio: daqui3Dias, diasSemana: [], essencial: true },
    { nome: "Musculação", horario: "18:30", esforco: 3, cor: "#A8C3A0", frequencia: "semanal", dataInicio: inicioMes, diasSemana: [2, 4, 6] },
    { nome: "Revisar as contas", horario: "20:00", esforco: 1, cor: "#E8D08A", frequencia: "mensal", dataInicio: dia10, diasSemana: [], diasMes: [10] },
    { nome: "Planejar o mês", horario: "10:00", esforco: 2, cor: "#5F7D91", frequencia: "mensal", dataInicio: inicioMes, diasSemana: [1], semanasMes: [1] },
    { nome: "Leitura", horario: "21:30", esforco: 1, cor: "#B9A7D6", frequencia: "diaria", dataInicio: inicioMes, diasSemana: [] },
  ];
}

/* =========================================================
   BANCO DE DADOS
   DB_CONFIG aponta para o projeto "Ritmo" no Supabase.
   A chave abaixo é a chave PÚBLICA (publishable): pode ficar na página,
   porque as regras de segurança (RLS) do banco só deixam cada usuário
   ver e alterar os próprios dados. Nunca coloque a chave secreta aqui.

   Tabelas no Supabase:
     perfis           (id, nome, celular, sexo, hora_acordar, tema, lembrete_ritual,
                       lembrete_diario, hora_lembrete_diario, canais_lembrete, criado_em)
                      criada automaticamente no cadastro pelo gatilho ao_criar_usuario
     eventos          (id, usuario_id, nome, horario, esforco, cor, frequencia,
                       data_inicio, dias_semana, criado_em)
     registros_sono   (id, usuario_id, data, hora_deitar, latencia_min, despertares,
                       hora_acordar, energia, origem, id_externo) - uma linha por noite
     checkins_diarios (usuario_id, data, ritual_concluidos, dia_descanso)
     integracoes      (usuario_id, provedor, status, ultimo_sincronismo) - escala futura
   E-mail e senha ficam no Supabase Auth.

   Se a conexão falhar (sem internet, ou dentro da pré-visualização do
   Claude), o site entra no modo demonstração e guarda tudo no navegador.
   provedor "local" força o modo demonstração.
   ========================================================= */
const DB_CONFIG = {
  provedor: "supabase", // "supabase" | "local"
  url: "https://rrsgyrymsmkihrpsmpwj.supabase.co",
  // Só a chave PÚBLICA (sb_publishable_... ou a "anon"). Ela obedece ao RLS.
  // Nunca a service_role / sb_secret_: o site se recusa a usar uma chave secreta (chavePublica()).
  chave: "sb_publishable_QBmuGhyIt0YbEqosbB0yDw_k-cWbgR9",
  // Endereço oficial do site no Netlify. Os links dos e-mails (confirmação e "Esqueci minha senha")
  // sempre voltam para ele. Cadastre o mesmo em Supabase > Authentication > URL Configuration.
  // Se trocar o endereço do site, troque aqui também.
  urlDoSite: "https://ritmo-rotina-sono-v4.netlify.app/",
};

/* Recusa chaves administrativas: sb_secret_... ou JWT com role "service_role" */
function chavePublica(chave) {
  const k = String(chave || "");
  if (!k || /^sb_secret_/i.test(k)) return false;
  if (/^eyJ/.test(k)) {
    try {
      const dados = JSON.parse(atob(k.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return dados.role === "anon";
    } catch (e) { return false; }
  }
  return /^sb_publishable_/.test(k);
}

/* Erro com mensagem pronta para mostrar ao usuário */
class ErroAmigavel extends Error {}

/* --- Modo Supabase (online) --- */
const DB_SUPABASE = {
  tipo: "supabase",
  descricao: "na nuvem",
  cliente: null,

  /* Traduz as mensagens do Supabase para português */
  erro(error) {
    const m = (error && error.message) || "";
    const codigo = (error && error.code) || "";
    // Falha ao mandar e-mail (SMTP do Supabase mal configurado ou fora do ar). Vem como erro 500,
    // que a biblioteca do Supabase classifica como "tente de novo": não é falta de internet.
    if (/error sending .*email|email address not authorized/i.test(m)) {
      return new ErroAmigavel("Não conseguimos enviar o e-mail agora. Tente de novo mais tarde.");
    }
    // O servidor do Supabase respondeu com erro (500 a 530): também não é falta de internet
    if (error && error.name === "AuthRetryableFetchError" && error.status >= 500) {
      const foraDoAr = new ErroAmigavel("O servidor não respondeu como esperado. Tente de novo em instantes.");
      foraDoAr.rede = true;
      return foraDoAr;
    }
    if (/failed to fetch|networkerror|network request failed|load failed|fetch failed|internet_disconnected/i.test(m) ||
        (error && (error.name === "AuthRetryableFetchError" || error.status === 0))) {
      const semRede = new ErroAmigavel("Parece que você está sem internet agora.");
      semRede.rede = true;
      return semRede;
    }
    if (/limite de 300 eventos/i.test(m)) return new ErroAmigavel("Você chegou ao limite de 300 eventos. Apague alguns que não usa mais para abrir espaço.");
    if (codigo === "P0001" && m) return new ErroAmigavel(m); // mensagens das regras do banco, já em português
    if (codigo === "23514") return new ErroAmigavel("Algum campo ficou com um valor que não dá para aceitar. Dê uma revisada e tente de novo.");
    if (codigo === "42501") return new ErroAmigavel("Sua sessão não permite isso agora. Entre de novo na sua conta para continuar.");
    if (/invalid login credentials/i.test(m)) return new ErroAmigavel("E-mail ou senha não conferem. Confira e tente de novo.");
    if (/email not confirmed/i.test(m)) return new ErroAmigavel("Falta só confirmar o seu e-mail: abra o link que enviamos e depois entre.");
    if (/already registered|already exists/i.test(m)) return new ErroAmigavel("Esse e-mail já tem uma conta. É só usar a aba Entrar.");
    if (/rate limit|too many/i.test(m)) return new ErroAmigavel("Muitas tentativas seguidas. Respire fundo e tente de novo daqui a alguns minutos.");
    const esperar = m.match(/only request this after (\d+) seconds?/i);
    if (esperar) return new ErroAmigavel(`Por segurança, espere ${esperar[1]} segundos para pedir outro link.`);
    if (codigo === "same_password" || /should be different/i.test(m)) return new ErroAmigavel("A senha nova precisa ser diferente da atual.");
    if (codigo === "weak_password" && /pwned|leak|vazad/i.test(m)) return new ErroAmigavel("Essa senha já apareceu em vazamentos de dados. Escolha outra.");
    if (/password/i.test(m)) return new ErroAmigavel("O servidor não aceitou essa senha. Tente uma um pouco mais longa.");
    return new ErroAmigavel("Não conseguimos falar com o servidor agora. Tente de novo em instantes.");
  },

  /* Converte entre o formato do site e as colunas do banco */
  paraBanco(ev) {
    return { nome: ev.nome, horario: ev.horario, esforco: ev.esforco, cor: ev.cor, frequencia: ev.frequencia, data_inicio: ev.dataInicio, dias_semana: ev.diasSemana, dias_mes: ev.diasMes || [], semanas_mes: ev.semanasMes || [], essencial: Boolean(ev.essencial) };
  },
  doBanco(linha) {
    return { id: linha.id, nome: linha.nome, horario: String(linha.horario).slice(0, 5), esforco: linha.esforco, cor: linha.cor, frequencia: linha.frequencia, dataInicio: linha.data_inicio, diasSemana: linha.dias_semana || [], diasMes: linha.dias_mes || [], semanasMes: linha.semanas_mes || [], essencial: Boolean(linha.essencial) };
  },

  async perfil(user) {
    const { data, error } = await this.cliente.from("perfis")
      .select("nome, celular, sexo, hora_acordar, tema, criado_em, lembrete_ritual, lembrete_diario, hora_lembrete_diario, canais_lembrete")
      .eq("id", user.id).maybeSingle();
    if (error) throw this.erro(error);
    const meta = user.user_metadata || {};
    return {
      id: user.id,
      email: user.email,
      nome: (data && data.nome) || meta.nome || user.email,
      celular: (data && data.celular) || "",
      sexo: (data && data.sexo) || "",
      horaAcordar: data && data.hora_acordar ? String(data.hora_acordar).slice(0, 5) : SONO_CONFIG.horaAcordarPadrao,
      tema: (data && data.tema) || "sistema",
      criadoEm: (data && data.criado_em) || user.created_at || null,
      lembreteRitual: Boolean(data && data.lembrete_ritual),
      lembreteDiario: Boolean(data && data.lembrete_diario),
      horaLembreteDiario: data && data.hora_lembrete_diario ? String(data.hora_lembrete_diario).slice(0, 5) : "07:30",
      canaisLembrete: (data && data.canais_lembrete) || ["navegador"],
    };
  },

  /* Sessão válida = guardada no navegador E confirmada pelo Supabase Auth (getUser vai ao servidor).
     Token vencido, revogado ou de conta excluída: sai neste aparelho e volta como visitante. */
  async usuarioAtual() {
    const { data } = await this.cliente.auth.getSession();
    if (!data.session) return null;
    const { data: confirmado, error } = await this.cliente.auth.getUser();
    if (error || !confirmado || !confirmado.user) {
      const falha = this.erro(error || {});
      if (falha.rede) throw falha; // sem internet: quem decide é o modo offline
      try { await this.cliente.auth.signOut({ scope: "local" }); } catch (e) { /* já não há sessão */ }
      return null;
    }
    return this.perfil(confirmado.user);
  },

  /* Nome, celular e sexo vão em options.data; o gatilho do banco cria o perfil */
  async cadastrar(dados, senha) {
    const { data, error } = await this.cliente.auth.signUp({
      email: dados.email,
      password: senha,
      options: {
        data: { nome: dados.nome, celular: dados.celular, sexo: dados.sexo },
        emailRedirectTo: DB_CONFIG.urlDoSite || location.origin + location.pathname,
      },
    });
    if (error) throw this.erro(error);
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new ErroAmigavel("Esse e-mail já tem uma conta. É só usar a aba Entrar.");
    }
    if (!data.session) return { usuario: null, precisaConfirmar: true };
    return { usuario: await this.perfil(data.user), precisaConfirmar: false };
  },

  async entrar(email, senha) {
    const { data, error } = await this.cliente.auth.signInWithPassword({ email, password: senha });
    if (error) throw this.erro(error);
    return this.perfil(data.user);
  },

  // Sai só neste aparelho; os outros continuam conectados
  async sair() { await this.cliente.auth.signOut({ scope: "local" }); },

  async listarEventos() {
    const { data, error } = await this.cliente.from("eventos").select("*").order("horario");
    if (error) throw this.erro(error);
    return data.map((linha) => this.doBanco(linha));
  },

  async criarEvento(usuario, evento) {
    const { data, error } = await this.cliente.from("eventos").insert(this.paraBanco(evento)).select().single();
    if (error) throw this.erro(error);
    return this.doBanco(data);
  },

  async excluirEvento(usuario, id) {
    const { error } = await this.cliente.from("eventos").delete().eq("id", id);
    if (error) throw this.erro(error);
  },

  /* --- Diário de sono (registros_sono) --- */
  doRegistro(linha) {
    return {
      id: linha.id,
      data: linha.data,
      horaDeitar: String(linha.hora_deitar).slice(0, 5),
      horaAcordar: String(linha.hora_acordar).slice(0, 5),
      latencia: linha.latencia_min,
      despertares: linha.despertares,
      energia: linha.energia,
      humor: linha.humor,
      origem: linha.origem || "manual",
    };
  },

  async listarRegistrosSono(usuario, desde) {
    const { data, error } = await this.cliente.from("registros_sono")
      .select("id, data, hora_deitar, hora_acordar, latencia_min, despertares, energia, humor, origem")
      .gte("data", desde)
      .order("data", { ascending: false });
    if (error) throw this.erro(error);
    return data.map((linha) => this.doRegistro(linha));
  },

  /* Grava a noite; se já existir registro na mesma data, atualiza (upsert) */
  async salvarRegistroSono(usuario, r) {
    const { data, error } = await this.cliente.from("registros_sono")
      .upsert({
        data: r.data,
        hora_deitar: r.horaDeitar,
        hora_acordar: r.horaAcordar,
        latencia_min: r.latencia,
        despertares: r.despertares,
        energia: r.energia,
        humor: r.humor || null,
      }, { onConflict: "usuario_id,data" })
      .select("id, data, hora_deitar, hora_acordar, latencia_min, despertares, energia, humor, origem")
      .single();
    if (error) throw this.erro(error);
    return this.doRegistro(data);
  },

  async excluirRegistroSono(usuario, data) {
    const { error } = await this.cliente.from("registros_sono").delete().eq("data", data);
    if (error) throw this.erro(error);
  },

  /* --- Check-ins do dia: ritual concluído e dia de descanso (devolve um mapa por data) --- */
  async listarCheckins(usuario, desde) {
    const { data, error } = await this.cliente.from("checkins_diarios")
      .select("data, ritual_concluidos, dia_descanso, modo_minimo, agua_copos, estresse_noite, ansiedade_noite, fadiga_noite")
      .gte("data", desde);
    if (error) throw this.erro(error);
    const mapa = {};
    data.forEach((l) => {
      mapa[l.data] = {
        ritualConcluidos: l.ritual_concluidos || [],
        diaDescanso: Boolean(l.dia_descanso),
        modoMinimo: Boolean(l.modo_minimo),
        aguaCopos: l.agua_copos || 0,
        estresseNoite: l.estresse_noite,
        ansiedadeNoite: l.ansiedade_noite,
        fadigaNoite: l.fadiga_noite,
      };
    });
    return mapa;
  },

  /* Grava só os campos enviados do dia (ritual, descanso, rotina mínima, água e emoções) */
  async salvarCheckin(usuario, data, campos) {
    const colunas = {
      ritualConcluidos: "ritual_concluidos",
      diaDescanso: "dia_descanso",
      modoMinimo: "modo_minimo",
      aguaCopos: "agua_copos",
      estresseNoite: "estresse_noite",
      ansiedadeNoite: "ansiedade_noite",
      fadigaNoite: "fadiga_noite",
    };
    const linha = { data };
    Object.keys(campos).forEach((chave) => { if (temChave(colunas, chave)) linha[colunas[chave]] = campos[chave]; });
    const { error } = await this.cliente.from("checkins_diarios").upsert(linha, { onConflict: "usuario_id,data" });
    if (error) throw this.erro(error);
  },

  /* --- Conta: confirmar a senha antes de ações sensíveis e excluir a conta --- */
  async confirmarSenha(usuario, senha) {
    const { error } = await this.cliente.auth.signInWithPassword({ email: usuario.email, password: senha });
    if (error) throw /invalid login credentials/i.test(error.message || "") ? new ErroAmigavel("Senha incorreta. Confira e tente de novo.") : this.erro(error);
  },

  /* --- Esqueci minha senha ---
     1. recuperarSenha: o Supabase Auth manda o e-mail (modelo padrão "Reset Password" do Supabase).
        Responde igual exista ou não a conta, para ninguém descobrir quais e-mails estão cadastrados.
     2. O link do e-mail padrão volta com ?code=... (trocado pela biblioteca, no mesmo navegador do pedido,
        com o aviso PASSWORD_RECOVERY). Links ?token_hash=...&type=recovery (modelo próprio) passam por
        validarLinkRecuperacao, que funciona em qualquer navegador.
     3. redefinirSenha grava a senha nova e encerra a sessão em todos os aparelhos.
        A sessão do link só serve para trocar a senha: o site não entra na conta com ela. */
  enderecoDoSite() { return DB_CONFIG.urlDoSite || location.origin + location.pathname; },

  async recuperarSenha(email) {
    const { error } = await this.cliente.auth.resetPasswordForEmail(email, { redirectTo: this.enderecoDoSite() });
    if (error) throw this.erro(error);
    return {};
  },

  async validarLinkRecuperacao(tokenHash) {
    const { data, error } = await this.cliente.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (error || !data || !data.user) {
      const falha = this.erro(error || {});
      if (falha.rede) throw falha;
      throw new ErroAmigavel("Esse link expirou ou já foi usado. Peça um novo aqui embaixo.");
    }
    return { email: data.user.email, nome: limparTexto((data.user.user_metadata || {}).nome || "") };
  },

  async redefinirSenha(senha) {
    const { error } = await this.cliente.auth.updateUser({ password: senha });
    if (error) throw this.erro(error);
    try { await this.cliente.auth.signOut({ scope: "global" }); } catch (e) { /* a senha já mudou */ }
  },

  async cancelarRecuperacao() {
    try { await this.cliente.auth.signOut({ scope: "local" }); } catch (e) { /* já não há sessão */ }
  },

  /* --- Mudar senha (Meu perfil): confere a atual com um login novo, troca e encerra os outros aparelhos --- */
  async mudarSenha(usuario, senhaAtual, senhaNova) {
    await this.confirmarSenha(usuario, senhaAtual);
    const { error } = await this.cliente.auth.updateUser({ password: senhaNova });
    if (error) throw this.erro(error);
    try { await this.cliente.auth.signOut({ scope: "others" }); } catch (e) { /* a senha já mudou */ }
  },

  /* Chama a função excluir_minha_conta do banco: apaga o usuário e, em cascata, todos os dados dele */
  async excluirConta() {
    const { error } = await this.cliente.rpc("excluir_minha_conta");
    if (error) throw this.erro(error);
    try { await this.cliente.auth.signOut({ scope: "local" }); } catch (e) { /* a sessão já não existe */ }
  },

  /* Atualiza só os campos enviados (perfil, hora de acordar, tema e lembretes) */
  async salvarPerfil(usuario, campos) {
    const colunas = {
      nome: "nome",
      celular: "celular",
      sexo: "sexo",
      horaAcordar: "hora_acordar",
      tema: "tema",
      lembreteRitual: "lembrete_ritual",
      lembreteDiario: "lembrete_diario",
      horaLembreteDiario: "hora_lembrete_diario",
      canaisLembrete: "canais_lembrete",
    };
    const dados = {};
    Object.keys(campos).forEach((chave) => { if (temChave(colunas, chave)) dados[colunas[chave]] = campos[chave]; });
    const { error } = await this.cliente.from("perfis").update(dados).eq("id", usuario.id);
    if (error) throw this.erro(error);
  },
};

/* --- Modo demonstração (dados só neste navegador) --- */
const CHAVES = {
  usuarios: "ritmo_usuarios",
  sessao: "ritmo_sessao",
  eventos: "ritmo_eventos_",   // + e-mail do usuário
  sono: "ritmo_sono_",         // + e-mail do usuário
  checkins: "ritmo_checkins_", // + e-mail do usuário
};
/* Chave própria do objeto (ignora __proto__, constructor e outras herdadas) */
const temChave = (obj, chave) => Object.prototype.hasOwnProperty.call(obj, chave);
const memoria = {}; // cópia em memória, caso o navegador bloqueie o armazenamento

const armazenamento = {
  ler(chave, padrao) {
    try {
      const valor = localStorage.getItem(chave);
      if (valor !== null) return JSON.parse(valor);
    } catch (e) { /* armazenamento bloqueado: usa a memória */ }
    try { return chave in memoria ? JSON.parse(memoria[chave]) : padrao; } catch (e) { return padrao; }
  },
  gravar(chave, valor) {
    const texto = JSON.stringify(valor);
    memoria[chave] = texto;
    try { localStorage.setItem(chave, texto); } catch (e) { /* segue só na memória */ }
  },
  remover(chave) {
    delete memoria[chave];
    try { localStorage.removeItem(chave); } catch (e) { /* nada a fazer */ }
  },
};

const DB_LOCAL = {
  tipo: "local",
  descricao: "só neste navegador (demonstração)",

  usuarios() { return armazenamento.ler(CHAVES.usuarios, []); },
  publico(u) {
    return {
      id: u.email,
      email: u.email,
      nome: u.nome || u.email,
      celular: u.celular || "",
      sexo: u.sexo || "",
      horaAcordar: horaValida(u.horaAcordar) ? u.horaAcordar : SONO_CONFIG.horaAcordarPadrao,
      tema: u.tema || "sistema",
      criadoEm: u.criadoEm || null,
      lembreteRitual: Boolean(u.lembreteRitual),
      lembreteDiario: Boolean(u.lembreteDiario),
      horaLembreteDiario: horaValida(u.horaLembreteDiario) ? u.horaLembreteDiario : "07:30",
      canaisLembrete: Array.isArray(u.canaisLembrete) ? u.canaisLembrete : ["navegador"],
    };
  },

  async usuarioAtual() {
    const email = armazenamento.ler(CHAVES.sessao, null);
    const u = email && this.usuarios().find((x) => x.email === email);
    return u ? this.publico(u) : null;
  },

  async cadastrar(dados, senha) {
    if (this.usuarios().some((u) => u.email === dados.email)) {
      throw new ErroAmigavel("Esse e-mail já tem uma conta. É só usar a aba Entrar.");
    }
    const salt = bytesParaHex(crypto.getRandomValues(new Uint8Array(16)));
    const u = { ...dados, salt, hash: await gerarHash(senha, salt), horaAcordar: SONO_CONFIG.horaAcordarPadrao, tema: temaSalvo(), criadoEm: new Date().toISOString() };
    armazenamento.gravar(CHAVES.usuarios, [...this.usuarios(), u]);
    armazenamento.gravar(CHAVES.sessao, u.email);
    return { usuario: this.publico(u), precisaConfirmar: false };
  },

  async entrar(email, senha) {
    const u = this.usuarios().find((x) => x.email === email);
    if (!u || (await gerarHash(senha, u.salt)) !== u.hash) throw new ErroAmigavel("E-mail ou senha não conferem. Confira e tente de novo.");
    armazenamento.gravar(CHAVES.sessao, u.email);
    return this.publico(u);
  },

  async sair() { armazenamento.remover(CHAVES.sessao); },

  async listarEventos(usuario) { return armazenamento.ler(CHAVES.eventos + usuario.email, []); },

  async criarEvento(usuario, evento) {
    const salvo = { ...evento, id: gerarId() };
    armazenamento.gravar(CHAVES.eventos + usuario.email, [...(await this.listarEventos(usuario)), salvo]);
    return salvo;
  },

  async excluirEvento(usuario, id) {
    armazenamento.gravar(CHAVES.eventos + usuario.email, (await this.listarEventos(usuario)).filter((e) => e.id !== id));
  },

  async listarRegistrosSono(usuario) {
    return armazenamento.ler(CHAVES.sono + usuario.email, []).sort((a, b) => (a.data < b.data ? 1 : -1));
  },

  async salvarRegistroSono(usuario, r) {
    if (r.data > hojeChave()) throw new ErroAmigavel("Essa noite ainda não aconteceu: escolha hoje ou uma data anterior.");
    const lista = armazenamento.ler(CHAVES.sono + usuario.email, []).filter((x) => x.data !== r.data);
    const salvo = { ...r, id: gerarId(), origem: "manual" };
    armazenamento.gravar(CHAVES.sono + usuario.email, [...lista, salvo]);
    return salvo;
  },

  async excluirRegistroSono(usuario, data) {
    armazenamento.gravar(CHAVES.sono + usuario.email, armazenamento.ler(CHAVES.sono + usuario.email, []).filter((x) => x.data !== data));
  },

  async listarCheckins(usuario) {
    return armazenamento.ler(CHAVES.checkins + usuario.email, {});
  },

  async salvarCheckin(usuario, data, campos) {
    if (campos.diaDescanso && data < hojeChave()) throw new ErroAmigavel("Dias de descanso são planejados: escolha hoje ou uma data mais para frente.");
    const mapa = armazenamento.ler(CHAVES.checkins + usuario.email, {});
    mapa[data] = { ritualConcluidos: [], diaDescanso: false, ...mapa[data], ...campos };
    armazenamento.gravar(CHAVES.checkins + usuario.email, mapa);
  },

  async salvarPerfil(usuario, campos) {
    armazenamento.gravar(CHAVES.usuarios, this.usuarios().map((u) => (u.email === usuario.email ? { ...u, ...campos } : u)));
  },

  async confirmarSenha(usuario, senha) {
    const u = this.usuarios().find((x) => x.email === usuario.email);
    if (!u || (await gerarHash(senha, u.salt)) !== u.hash) throw new ErroAmigavel("Senha incorreta. Confira e tente de novo.");
  },

  /* Demonstração: não há envio de e-mail. O site mostra uma prévia do e-mail com o botão. */
  recuperacaoDemo: null,
  async trocarSenha(email, senha) {
    const salt = bytesParaHex(crypto.getRandomValues(new Uint8Array(16)));
    const hash = await gerarHash(senha, salt);
    armazenamento.gravar(CHAVES.usuarios, this.usuarios().map((u) => (u.email === email ? { ...u, salt, hash } : u)));
  },
  async recuperarSenha(email) {
    const u = this.usuarios().find((x) => x.email === email);
    if (!u) return {};
    this.recuperacaoDemo = { email, expira: Date.now() + 3600000 };
    return { previa: { email, nome: u.nome || "" } };
  },
  async validarLinkRecuperacao() { throw new ErroAmigavel("Na demonstração, use o botão da prévia do e-mail."); },
  async redefinirSenha(senha) {
    const r = this.recuperacaoDemo;
    if (!r || r.expira < Date.now()) throw new ErroAmigavel("Esse link expirou. Peça um novo.");
    await this.trocarSenha(r.email, senha);
    this.recuperacaoDemo = null;
    armazenamento.remover(CHAVES.sessao);
  },
  async cancelarRecuperacao() { this.recuperacaoDemo = null; },
  async mudarSenha(usuario, senhaAtual, senhaNova) {
    await this.confirmarSenha(usuario, senhaAtual);
    await this.trocarSenha(usuario.email, senhaNova);
  },

  async excluirConta(usuario) {
    armazenamento.gravar(CHAVES.usuarios, this.usuarios().filter((u) => u.email !== usuario.email));
    [CHAVES.eventos, CHAVES.sono, CHAVES.checkins].forEach((prefixo) => armazenamento.remover(prefixo + usuario.email));
    armazenamento.remover(CHAVES.sessao);
  },
};

/* --- Site publicado sem conexão: nada é guardado no navegador --- */
const DB_INDISPONIVEL = {
  tipo: "indisponivel",
  descricao: "sem conexão com o servidor",
  falha() { return new ErroAmigavel("Sem conexão com o servidor. Confira a sua internet e recarregue a página."); },
  async usuarioAtual() { return null; },
  async cadastrar() { throw this.falha(); },
  async entrar() { throw this.falha(); },
  async sair() {},
  async listarEventos() { return []; },
  async criarEvento() { throw this.falha(); },
  async excluirEvento() { throw this.falha(); },
  async salvarPerfil() { throw this.falha(); },
  async listarRegistrosSono() { return []; },
  async salvarRegistroSono() { throw this.falha(); },
  async excluirRegistroSono() { throw this.falha(); },
  async listarCheckins() { return {}; },
  async salvarCheckin() { throw this.falha(); },
  async confirmarSenha() { throw this.falha(); },
  async excluirConta() { throw this.falha(); },
  async recuperarSenha() { throw this.falha(); },
  async validarLinkRecuperacao() { throw this.falha(); },
  async redefinirSenha() { throw this.falha(); },
  async cancelarRecuperacao() {},
  async mudarSenha() { throw this.falha(); },
};

/* =========================================================
   MODO OFFLINE E SINCRONIZAÇÃO AUTOMÁTICA
   DB_OFFLINE envolve o Supabase (DB_SUPABASE):
   - Leituras: com internet, vêm do servidor e atualizam uma cópia neste aparelho;
     sem internet, vêm dessa cópia.
   - Gravações: com internet e nada pendente, vão direto ao servidor. Sem internet
     (ou com alterações ainda na fila), entram numa fila e já aparecem na tela.
   - Quando a conexão volta, sincronizar() envia a fila na ordem em que foi feita e
     depois busca a versão mais nova do servidor (inclusive o que mudou em outro aparelho).
   - Eventos criados sem internet ganham um id provisório ("local-..."), trocado pelo
     id do banco na sincronização.
   - Cópia e fila ficam por conta (ritmo_copia_<id> e ritmo_fila_<id>) e são apagadas
     ao sair da conta ou excluí-la.
   - Conflito: vale a última alteração enviada (o mesmo dia editado em dois aparelhos).
   Entrar, criar conta e excluir a conta precisam de internet.
   ========================================================= */
const OFFLINE = {
  copia: (id) => `ritmo_copia_${id}`,
  fila: (id) => `ritmo_fila_${id}`,
  ultimo: "ritmo_offline_ultimo", // id da última conta que entrou neste aparelho
  intervaloMs: 30000,            // nova tentativa enquanto houver algo pendente
};
const sinc = { rodando: false, enviando: 0, erroConta: false };

function semInternet() { return navigator.onLine === false; }
function erroDeRede(err) { return Boolean(err && err.rede); }
function erroDeSemInternet() {
  const e = new ErroAmigavel("Você está sem internet. Conecte-se para continuar.");
  e.rede = true;
  return e;
}

function copiaVazia(usuario) { return { usuario: usuario || null, eventos: [], registros: [], checkins: {} }; }
/* A cópia e a fila vêm do localStorage, que pode estar corrompido ou adulterado:
   tudo é conferido antes de usar (formato errado vira vazio, nunca quebra a tela). */
const ehObjeto = (v) => Boolean(v) && typeof v === "object" && !Array.isArray(v);
const CAMPOS_CHECKIN = ["ritualConcluidos", "diaDescanso", "modoMinimo", "aguaCopos", "estresseNoite", "ansiedadeNoite", "fadigaNoite"];
const CAMPOS_PERFIL = ["nome", "celular", "sexo", "horaAcordar", "tema", "lembreteRitual", "lembreteDiario", "horaLembreteDiario", "canaisLembrete"];
function lerCopia(id) {
  const c = armazenamento.ler(OFFLINE.copia(id), null);
  if (!ehObjeto(c)) return null;
  return {
    usuario: ehObjeto(c.usuario) && c.usuario.id === id ? c.usuario : null, // a cópia só vale para a própria conta
    eventos: Array.isArray(c.eventos) ? c.eventos.filter(ehObjeto) : [],
    registros: Array.isArray(c.registros) ? c.registros.filter(ehObjeto) : [],
    checkins: ehObjeto(c.checkins) ? c.checkins : {},
    salvoEm: typeof c.salvoEm === "string" ? c.salvoEm : null,
  };
}
function gravarCopia(id, copia) { armazenamento.gravar(OFFLINE.copia(id), { ...copia, salvoEm: new Date().toISOString() }); }
function operacaoValida(op) {
  if (!ehObjeto(op)) return false;
  switch (op.tipo) {
    case "criarEvento": return typeof op.tempId === "string" && op.tempId.startsWith("local-") && ehObjeto(op.evento);
    case "excluirEvento": return typeof op.id === "string" && op.id.length <= 80;
    case "salvarRegistroSono": return ehObjeto(op.registro) && dataValida(op.registro.data);
    case "excluirRegistroSono": return dataValida(op.data);
    case "salvarCheckin": return dataValida(op.data) && ehObjeto(op.campos);
    case "salvarPerfil": return ehObjeto(op.campos);
    default: return false;
  }
}
function lerFila(id) {
  const fila = armazenamento.ler(OFFLINE.fila(id), []);
  return Array.isArray(fila) ? fila.filter(operacaoValida) : [];
}
function gravarFila(id, fila) {
  armazenamento.gravar(OFFLINE.fila(id), fila);
  atualizarBarraConexao();
}
function pendentes() {
  return DB === DB_OFFLINE && estado.usuario ? lerFila(estado.usuario.id).length : 0;
}
function apagarDadosOffline(id) {
  armazenamento.remover(OFFLINE.copia(id));
  armazenamento.remover(OFFLINE.fila(id));
  if (armazenamento.ler(OFFLINE.ultimo, null) === id) armazenamento.remover(OFFLINE.ultimo);
}
/* Sessão do Supabase guardada neste aparelho (sb-<projeto>-auth-token) pertence a esta conta?
   Sair da conta apaga essa sessão; sem ela, o modo offline não abre os dados. */
function sessaoGuardadaDe(id) {
  try {
    const projeto = new URL(DB_CONFIG.url).hostname.split(".")[0];
    const sessao = JSON.parse(localStorage.getItem(`sb-${projeto}-auth-token`) || "null");
    const usuario = sessao && (sessao.user || (sessao.currentSession && sessao.currentSession.user));
    return Boolean(usuario && usuario.id === id && sessao.refresh_token !== undefined);
  } catch (e) { return false; }
}

function lembrarConta(usuario) {
  if (!usuario) return;
  armazenamento.gravar(OFFLINE.ultimo, usuario.id);
  const copia = lerCopia(usuario.id) || copiaVazia(usuario);
  copia.usuario = usuario;
  gravarCopia(usuario.id, copia);
}

/* Aplica uma alteração a um conjunto de dados { usuario, eventos, registros, checkins }.
   resultado: o que o servidor devolveu (sem ele, usa os valores locais). */
function aplicarOperacao(dados, op, resultado) {
  switch (op.tipo) {
    case "criarEvento": {
      const ev = resultado || { ...op.evento, id: op.tempId };
      dados.eventos = [...dados.eventos.filter((e) => e.id !== op.tempId && e.id !== ev.id), ev];
      break;
    }
    case "excluirEvento":
      dados.eventos = dados.eventos.filter((e) => e.id !== op.id);
      break;
    case "salvarRegistroSono": {
      const r = resultado || { ...op.registro, id: op.registro.data, origem: "manual" };
      dados.registros = [r, ...dados.registros.filter((x) => x.data !== r.data)].sort((a, b) => (a.data < b.data ? 1 : -1));
      break;
    }
    case "excluirRegistroSono":
      dados.registros = dados.registros.filter((x) => x.data !== op.data);
      break;
    case "salvarCheckin": {
      const campos = {};
      CAMPOS_CHECKIN.forEach((c) => { if (temChave(op.campos, c)) campos[c] = op.campos[c]; });
      const atual = temChave(dados.checkins, op.data) ? dados.checkins[op.data] : {};
      dados.checkins = { ...dados.checkins, [op.data]: { ...checkinVazio(), ...atual, ...campos } };
      break;
    }
    case "salvarPerfil": {
      // Só os campos editáveis do perfil: id e e-mail da conta nunca mudam pela fila
      const campos = {};
      CAMPOS_PERFIL.forEach((c) => { if (temChave(op.campos, c)) campos[c] = op.campos[c]; });
      if (dados.usuario) dados.usuario = { ...dados.usuario, ...campos };
      break;
    }
    default:
      break;
  }
  return dados;
}

/* Cópia do servidor + o que ainda está na fila = o que a pessoa vê */
function comFila(copia, fila) {
  const dados = JSON.parse(JSON.stringify(copia));
  fila.forEach((op) => aplicarOperacao(dados, op));
  return dados;
}

/* Põe uma alteração na fila (junta com a anterior quando é o mesmo dia ou o perfil) */
function enfileirar(usuario, op) {
  const fila = lerFila(usuario.id);
  const emEnvio = sinc.rodando ? 1 : 0; // a primeira da fila pode estar sendo enviada agora
  const ultima = fila.length > emEnvio ? fila[fila.length - 1] : null;
  op = { ...op, criadoEm: Date.now() };

  if (op.tipo === "excluirEvento" && String(op.id).startsWith("local-")) {
    // O evento nem chegou ao servidor: basta tirar a criação da fila
    const i = fila.findIndex((o, n) => n >= emEnvio && o.tipo === "criarEvento" && o.tempId === op.id);
    if (i >= 0) { fila.splice(i, 1); gravarFila(usuario.id, fila); return; }
  }
  if (ultima && ultima.tipo === op.tipo && op.tipo === "salvarCheckin" && ultima.data === op.data) {
    ultima.campos = { ...ultima.campos, ...op.campos };
  } else if (ultima && ultima.tipo === op.tipo && op.tipo === "salvarRegistroSono" && ultima.registro.data === op.registro.data) {
    ultima.registro = op.registro;
  } else if (ultima && ultima.tipo === op.tipo && op.tipo === "salvarPerfil") {
    ultima.campos = { ...ultima.campos, ...op.campos };
  } else {
    fila.push(op);
  }
  gravarFila(usuario.id, fila);
}

/* Envia uma alteração da fila ao servidor */
function enviarOperacao(op) {
  const u = estado.usuario;
  switch (op.tipo) {
    case "criarEvento": return DB_SUPABASE.criarEvento(u, op.evento);
    case "excluirEvento": return DB_SUPABASE.excluirEvento(u, op.id);
    case "salvarRegistroSono": return DB_SUPABASE.salvarRegistroSono(u, op.registro);
    case "excluirRegistroSono": return DB_SUPABASE.excluirRegistroSono(u, op.data);
    case "salvarCheckin": return DB_SUPABASE.salvarCheckin(u, op.data, op.campos);
    case "salvarPerfil": return DB_SUPABASE.salvarPerfil(u, op.campos);
    default: return Promise.resolve();
  }
}

const DB_OFFLINE = Object.assign(Object.create(DB_SUPABASE), {
  descricao: "na nuvem, com uma cópia neste aparelho",
  offline: false, // true quando o servidor não respondeu

  semConexao() {
    this.offline = true;
    atualizarBarraConexao();
  },

  /* Leitura: servidor quando dá; senão, a cópia deste aparelho */
  async ler(usuario, campo, buscar) {
    if (!this.offline && !semInternet()) {
      try {
        const valor = await buscar();
        const copia = lerCopia(usuario.id) || copiaVazia(usuario); // lê de novo: as leituras correm em paralelo
        copia[campo] = valor;
        gravarCopia(usuario.id, copia);
      } catch (err) {
        if (!erroDeRede(err)) throw err;
        this.semConexao();
      }
    }
    const copia = lerCopia(usuario.id) || copiaVazia(usuario);
    return comFila(copia, lerFila(usuario.id))[campo];
  },

  /* Gravação: direto no servidor ou na fila */
  async gravar(usuario, op, enviar, resultadoLocal) {
    if (!this.offline && !semInternet() && !lerFila(usuario.id).length) {
      try {
        const resultado = await enviar();
        const copia = lerCopia(usuario.id) || copiaVazia(usuario);
        gravarCopia(usuario.id, aplicarOperacao(copia, op, resultado));
        return resultado;
      } catch (err) {
        if (!erroDeRede(err)) throw err;
        this.semConexao();
      }
    }
    enfileirar(usuario, op);
    agendarSincronizacao();
    return resultadoLocal;
  },

  async usuarioAtual() {
    if (!this.offline && !semInternet()) {
      try {
        const usuario = await DB_SUPABASE.usuarioAtual();
        if (usuario) lembrarConta(usuario);
        return usuario;
      } catch (err) {
        if (!erroDeRede(err)) throw err;
        this.semConexao();
      }
    }
    // Sem conexão: abre com a última conta usada neste aparelho, se a sessão dela ainda estiver guardada
    const id = armazenamento.ler(OFFLINE.ultimo, null);
    if (!id || !sessaoGuardadaDe(id)) return null;
    const copia = lerCopia(id);
    return copia && copia.usuario ? comFila(copia, lerFila(id)).usuario : null;
  },

  async cadastrar(dados, senha) {
    if (semInternet()) throw erroDeSemInternet();
    const r = await DB_SUPABASE.cadastrar(dados, senha);
    this.offline = false;
    if (r.usuario) lembrarConta(r.usuario);
    return r;
  },
  async entrar(email, senha) {
    if (semInternet()) throw erroDeSemInternet();
    const usuario = await DB_SUPABASE.entrar(email, senha);
    this.offline = false;
    lembrarConta(usuario);
    return usuario;
  },
  async sair() {
    try { await DB_SUPABASE.sair(); } catch (e) { /* sai neste aparelho mesmo sem internet */ }
  },
  async confirmarSenha(usuario, senha) {
    if (this.offline || semInternet()) throw erroDeSemInternet();
    return DB_SUPABASE.confirmarSenha(usuario, senha);
  },
  async recuperarSenha(email) {
    if (semInternet()) throw erroDeSemInternet();
    return DB_SUPABASE.recuperarSenha(email);
  },
  async validarLinkRecuperacao(tokenHash) {
    if (semInternet()) throw erroDeSemInternet();
    return DB_SUPABASE.validarLinkRecuperacao(tokenHash);
  },
  async redefinirSenha(senha) {
    if (semInternet()) throw erroDeSemInternet();
    return DB_SUPABASE.redefinirSenha(senha);
  },
  async mudarSenha(usuario, senhaAtual, senhaNova) {
    if (this.offline || semInternet()) throw erroDeSemInternet();
    return DB_SUPABASE.mudarSenha(usuario, senhaAtual, senhaNova);
  },
  async excluirConta(usuario) {
    if (this.offline || semInternet()) throw erroDeSemInternet();
    await DB_SUPABASE.excluirConta(usuario);
    apagarDadosOffline(usuario.id);
  },

  listarEventos(usuario) {
    return this.ler(usuario, "eventos", () => DB_SUPABASE.listarEventos(usuario));
  },
  listarRegistrosSono(usuario, desde) {
    return this.ler(usuario, "registros", () => DB_SUPABASE.listarRegistrosSono(usuario, desde));
  },
  listarCheckins(usuario, desde) {
    return this.ler(usuario, "checkins", () => DB_SUPABASE.listarCheckins(usuario, desde));
  },

  criarEvento(usuario, evento) {
    const op = { tipo: "criarEvento", tempId: `local-${gerarId()}`, evento: { ...evento } };
    return this.gravar(usuario, op, () => DB_SUPABASE.criarEvento(usuario, evento), { ...evento, id: op.tempId });
  },
  excluirEvento(usuario, id) {
    return this.gravar(usuario, { tipo: "excluirEvento", id }, () => DB_SUPABASE.excluirEvento(usuario, id));
  },
  salvarRegistroSono(usuario, registro) {
    const op = { tipo: "salvarRegistroSono", registro: { ...registro } };
    return this.gravar(usuario, op, () => DB_SUPABASE.salvarRegistroSono(usuario, registro), { ...registro, id: registro.data, origem: "manual" });
  },
  excluirRegistroSono(usuario, data) {
    return this.gravar(usuario, { tipo: "excluirRegistroSono", data }, () => DB_SUPABASE.excluirRegistroSono(usuario, data));
  },
  salvarCheckin(usuario, data, campos) {
    return this.gravar(usuario, { tipo: "salvarCheckin", data, campos: { ...campos } }, () => DB_SUPABASE.salvarCheckin(usuario, data, campos));
  },
  salvarPerfil(usuario, campos) {
    return this.gravar(usuario, { tipo: "salvarPerfil", campos: { ...campos } }, () => DB_SUPABASE.salvarPerfil(usuario, campos));
  },
});

/* Complemento das mensagens de "salvo" quando a alteração ficou na fila */
function avisoGuardado() {
  return pendentes() ? " Ficou guardado aqui no aparelho e vai para a sua conta quando a internet voltar." : "";
}

function agendarSincronizacao() {
  clearTimeout(agendarSincronizacao.espera);
  agendarSincronizacao.espera = setTimeout(sincronizar, 300);
}

/* Envia a fila ao servidor e depois traz a versão mais nova */
async function sincronizar() {
  if (DB !== DB_OFFLINE || sinc.rodando || !estado.usuario || semInternet()) return;
  const id = estado.usuario.id;
  sinc.rodando = true;
  let enviadas = 0;
  const recusadas = [];
  try {
    // A sessão precisa ser desta mesma conta (o Supabase renova o acesso sozinho)
    const { data } = await DB_SUPABASE.cliente.auth.getSession();
    if (!data || !data.session || data.session.user.id !== id) {
      sinc.erroConta = lerFila(id).length > 0;
      return;
    }
    sinc.erroConta = false;
    DB_OFFLINE.offline = false;
    atualizarBarraConexao();

    let fila = lerFila(id);
    while (fila.length) {
      const op = fila[0];
      sinc.enviando = fila.length;
      atualizarBarraConexao();
      let resultado;
      try {
        resultado = await enviarOperacao(op);
      } catch (err) {
        if (erroDeRede(err)) throw err;
        if (/permissão|entre de novo/i.test(err.message || "")) { sinc.erroConta = true; return; }
        recusadas.push(err.message); // o servidor recusou de vez (regra do banco): não adianta tentar de novo
        gravarFila(id, lerFila(id).slice(1));
        fila = lerFila(id);
        continue;
      }
      gravarCopia(id, aplicarOperacao(lerCopia(id) || copiaVazia(estado.usuario), op, resultado));
      let resto = lerFila(id).slice(1);
      if (op.tipo === "criarEvento" && resultado && resultado.id) {
        // Troca o id provisório pelo do banco na tela e no que ainda está na fila
        resto = resto.map((o) => (o.tipo === "excluirEvento" && o.id === op.tempId ? { ...o, id: resultado.id } : o));
        estado.eventos.forEach((ev) => { if (ev.id === op.tempId) ev.id = resultado.id; });
      }
      gravarFila(id, resto);
      enviadas += 1;
      fila = resto;
    }

    // Traz a versão mais nova do servidor, sem perder o que estiver sendo editado
    const usuario = await DB_OFFLINE.usuarioAtual();
    if (usuario && estado.usuario && usuario.id === estado.usuario.id) {
      await definirUsuario(usuario);
      atualizarTela();
    }
    if (enviadas) mostrarToast(`A internet voltou: ${plural(enviadas, "alteração sincronizada", "alterações sincronizadas")}.`);
    if (recusadas.length) mostrarToast(`Uma alteração feita sem internet não pôde ser salva. ${recusadas[0]}`, 7000);
  } catch (err) {
    if (erroDeRede(err)) DB_OFFLINE.semConexao();
  } finally {
    sinc.rodando = false;
    sinc.enviando = 0;
    atualizarBarraConexao();
  }
}

/* Barra de conexão: sem internet, sincronizando ou esperando o login */
function atualizarBarraConexao() {
  const barra = el("barra-conexao");
  if (!barra) return;
  const fila = pendentes();
  const offline = semInternet() || (DB === DB_OFFLINE && DB_OFFLINE.offline);
  const logado = Boolean(estado.usuario);
  const acao = el("conexao-acao");
  let tipo = "";
  let texto = "";
  acao.hidden = true;

  if (offline) {
    tipo = "offline";
    if (!logado) texto = "Sem internet. Para entrar ou criar uma conta, conecte-se.";
    else if (DB !== DB_OFFLINE) texto = "Sem internet. No modo demonstração, tudo continua funcionando neste aparelho.";
    else if (fila) texto = `Sem internet. ${plural(fila, "alteração guardada", "alterações guardadas")} neste aparelho: ${fila === 1 ? "ela sobe" : "elas sobem"} sozinha${fila === 1 ? "" : "s"} quando a conexão voltar.`;
    else texto = "Sem internet, mas tudo bem: continue usando o Ritmo. O que você mudar fica guardado e vai sozinho para a sua conta quando a conexão voltar.";
    if (logado && DB === DB_OFFLINE && !semInternet()) { acao.hidden = false; acao.textContent = "Tentar de novo"; }
  } else if (sinc.rodando && fila) {
    tipo = "sincronizando";
    texto = `Sincronizando ${plural(fila, "alteração", "alterações")}…`;
  } else if (fila && sinc.erroConta) {
    tipo = "atencao";
    texto = `Entre de novo na sua conta para enviar ${plural(fila, "alteração feita", "alterações feitas")} sem internet.`;
    acao.hidden = false;
    acao.textContent = "Entrar";
  } else if (fila) {
    tipo = "sincronizando";
    texto = `${plural(fila, "alteração esperando", "alterações esperando")} para subir.`;
    acao.hidden = false;
    acao.textContent = "Enviar agora";
  }
  barra.hidden = !tipo;
  barra.dataset.tipo = tipo;
  el("conexao-texto").textContent = texto;
  atualizarStatusDados();
  // Fila enviada: o aviso de "Sair mesmo assim" não vale mais
  const avisoSair = el("pf-sair-aviso");
  if (!fila && avisoSair && avisoSair.dataset.confirmado) restaurarBotaoSair();
}

/* Aviso no rodapé do diálogo de entrar. Só aparece quando há algo a saber
   (sem internet, modo demonstração ou servidor fora do ar). Conectado normalmente, fica escondido. */
let bancoDefinido = false;
function atualizarStatusDados() {
  const aviso = el("auth-status");
  if (!aviso || !bancoDefinido) return;
  let texto = "";
  if (DB.tipo === "local") texto = "Modo demonstração: os dados ficam só neste navegador.";
  else if (DB.tipo === "indisponivel") texto = "Sem conexão com o servidor agora. Confira a sua internet e recarregue a página.";
  else if (DB === DB_OFFLINE && (semInternet() || DB_OFFLINE.offline)) texto = "Sem internet agora. Para entrar ou criar uma conta, conecte-se.";
  aviso.textContent = texto;
  aviso.hidden = !texto;
}

function iniciarModoOffline() {
  window.addEventListener("online", () => {
    if (DB === DB_INDISPONIVEL) { location.reload(); return; } // abriu sem internet e sem conta guardada
    if (DB === DB_OFFLINE) DB_OFFLINE.offline = false;
    atualizarBarraConexao();
    sincronizar();
  });
  window.addEventListener("offline", () => {
    if (DB === DB_OFFLINE) DB_OFFLINE.semConexao();
    atualizarBarraConexao();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && (pendentes() || DB_OFFLINE.offline)) sincronizar();
  });
  // Enquanto houver algo pendente (ou o servidor estiver fora), tenta de novo a cada 30 s
  setInterval(() => { if (pendentes() || (DB === DB_OFFLINE && DB_OFFLINE.offline)) sincronizar(); }, OFFLINE.intervaloMs);
  el("conexao-acao").addEventListener("click", () => {
    if (sinc.erroConta && !semInternet()) abrirConta("entrar");
    else { DB_OFFLINE.offline = false; sincronizar(); }
  });
  atualizarBarraConexao();
}

/* O modo demonstração só vale fora do site publicado: arquivo aberto no computador,
   localhost ou pré-visualização dentro de outra página (como no Claude).
   No site publicado, se o Supabase não responder, o login fica indisponível em vez de
   guardar contas e senhas no navegador. */
function podeUsarDemonstracao() {
  if (location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return true;
  try { return window.self !== window.top; } catch (e) { return true; }
}

/* Banco em uso. escolherBanco() decide ao abrir a página. */
let DB = DB_LOCAL;

async function escolherBanco() {
  if (DB_CONFIG.provedor === "local") return DB_LOCAL;
  if (DB_CONFIG.provedor === "supabase" && !chavePublica(DB_CONFIG.chave)) {
    // Segurança: uma chave administrativa no navegador daria acesso a todos os dados
    console.error("Ritmo: a chave em DB_CONFIG não é pública. Use a chave publishable/anon do Supabase.");
    return podeUsarDemonstracao() ? DB_LOCAL : DB_INDISPONIVEL;
  }
  if (DB_CONFIG.url && DB_CONFIG.chave && window.supabase) {
    const criarCliente = () => {
      // flowType "pkce": links de e-mail voltam com ?code=, que só vale no navegador que iniciou
      // o cadastro. Assim ninguém consegue logar outra pessoa na conta dele mandando um link com
      // #access_token=... (ataque de injeção de sessão / login CSRF).
      if (!DB_SUPABASE.cliente) {
        DB_SUPABASE.cliente = window.supabase.createClient(DB_CONFIG.url, DB_CONFIG.chave, {
          auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
        });
        // Link do e-mail padrão do Supabase ("Reset Password"): volta com ?code=... e a biblioteca
        // avisa PASSWORD_RECOVERY. O site então abre "Crie uma senha nova" em vez de entrar na conta.
        DB_SUPABASE.cliente.auth.onAuthStateChange((evento, sessao) => {
          if (evento === "PASSWORD_RECOVERY" && sessao && sessao.user) {
            DB_SUPABASE.recuperacaoPorLink = { email: sessao.user.email, nome: limparTexto((sessao.user.user_metadata || {}).nome || "") };
          }
        });
      }
    };
    if (!semInternet()) {
      try {
        // Teste rápido de conexão: qualquer resposta do servidor serve; só falha de rede conta como erro
        const controle = new AbortController();
        const limite = setTimeout(() => controle.abort(), 5000);
        await fetch(`${DB_CONFIG.url}/auth/v1/health`, { headers: { apikey: DB_CONFIG.chave }, signal: controle.signal });
        clearTimeout(limite);
        criarCliente();
        DB_OFFLINE.offline = false;
        return DB_OFFLINE; // Supabase com cópia neste aparelho e fila para quando a internet cair
      } catch (e) { /* sem conexão */ }
    }
    // Sem conexão: se alguém já entrou neste aparelho, abre com a cópia guardada
    if (armazenamento.ler(OFFLINE.ultimo, null)) {
      criarCliente();
      DB_OFFLINE.offline = true;
      return DB_OFFLINE;
    }
  }
  return podeUsarDemonstracao() ? DB_LOCAL : DB_INDISPONIVEL;
}

/* =========================================================
   ESTADO DA PÁGINA E UTILITÁRIOS
   ========================================================= */
const estado = {
  pronto: false,  // vira true depois de conectar ao banco
  usuario: null,  // { id, email, nome, celular, sexo, horaAcordar, tema, lembretes... }
  eventos: [],
  registros: [],  // diário de sono, mais recente primeiro
  checkins: {},   // por data: { ritualConcluidos: [...], diaDescanso: true/false }
  tendDias: 7,    // período das tendências: 7 (semana) ou 30 (mês)
  emoPeriodo: 30, // período do histórico emocional: 7, 30 ou 0 (tudo)
  formSono: { data: null, sujo: false }, // data mostrada no registro rápido e se há edição não salva
  cor: CORES_EVENTO[0].cor, // cor escolhida no formulário
  calendario: { ano: new Date().getFullYear(), mes: new Date().getMonth(), selecionado: null },
};

const el = (id) => document.getElementById(id);
const pad2 = (n) => String(n).padStart(2, "0");
const horaValida = (h) => /^\d{2}:\d{2}$/.test(h);
const dataValida = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
const corValida = (c) => /^#[0-9a-f]{6}$/i.test(c);

/* "07:30" -> 450 */
function paraMinutos(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
const porHorario = (a, b) => paraMinutos(a.horario) - paraMinutos(b.horario);

/* 1395 -> "23:15". Aceita negativos e valores acima de 24h. */
function formatarHora(minutos) {
  const total = ((minutos % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

/* 500 -> "8h20"; 420 -> "7h" */
function formatarDuracao(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h}h${pad2(m)}` : `${h}h`;
}

/* Datas como texto "AAAA-MM-DD" no fuso do usuário */
function chaveData(data) { return `${data.getFullYear()}-${pad2(data.getMonth() + 1)}-${pad2(data.getDate())}`; }
function lerData(chave) { const [a, m, d] = chave.split("-").map(Number); return new Date(a, m - 1, d); }
function hojeChave() { return chaveData(new Date()); }
function formatarDataCurta(chave) { return lerData(chave).toLocaleDateString("pt-BR"); }
function formatarDataLonga(chave) {
  const texto = lerData(chave).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function plural(n, singular, pluralTexto) { return `${n} ${n === 1 ? singular : pluralTexto}`; }
function juntarLista(itens) {
  return itens.length <= 1 ? itens.join("") : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

/* Evita que textos digitados virem HTML */
function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function gerarId() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* (81) 91234-5678 */
function formatarCelular(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/* Bolas de esforço em HTML (nível de 0 a 3) */
function bolasHtml(nivel) {
  return `<span class="esforco" data-nivel="${nivel}" aria-hidden="true"><span class="bola"></span><span class="bola"></span><span class="bola"></span></span>`;
}

/* Garante que um evento lido do banco tenha formato válido.
   Eventos antigos, sem frequência, viram "todo dia". */
function normalizarEvento(e) {
  const horario = e && String(e.horario || "").slice(0, 5);
  if (!e || typeof e.nome !== "string" || !horaValida(horario)) return null;
  const esforco = Number(e.esforco);
  const frequencia = typeof e.frequencia === "string" && temChave(FREQUENCIAS, e.frequencia) ? e.frequencia : "diaria";
  const dataInicio = dataValida(e.dataInicio) ? e.dataInicio
    : (typeof e.criadoEm === "string" && dataValida(e.criadoEm.slice(0, 10)) ? e.criadoEm.slice(0, 10) : hojeChave());
  let dias = Array.isArray(e.diasSemana) ? e.diasSemana.map(Number).filter((d) => d >= 0 && d <= 6) : [];
  const ordenar = (lista) => [...new Set(lista)].sort((a, b) => a - b);
  // Mensal: dias do mês (1 a 31; 32 = último dia) ou semanas do mês (1ª a 4ª; 5 = última) + dias da semana
  const semanasMes = frequencia === "mensal" && Array.isArray(e.semanasMes) ? ordenar(e.semanasMes.map(Number).filter((n) => n >= 1 && n <= 5)) : [];
  let diasMes = frequencia === "mensal" && !semanasMes.length && Array.isArray(e.diasMes) ? ordenar(e.diasMes.map(Number).filter((n) => n >= 1 && n <= 32)) : [];
  if (frequencia === "mensal" && !semanasMes.length && !diasMes.length) diasMes = [lerData(dataInicio).getDate()]; // mensal antigo: dia de início
  const usaDiasSemana = frequencia === "semanal" || semanasMes.length > 0;
  if (usaDiasSemana && !dias.length) dias = [lerData(dataInicio).getDay()];
  return {
    id: String(e.id || gerarId()),
    nome: e.nome.slice(0, 60),
    horario,
    esforco: [1, 2, 3].includes(esforco) ? esforco : 1,
    cor: corValida(e.cor) ? e.cor : CORES_EVENTO[0].cor,
    frequencia,
    dataInicio,
    diasSemana: usaDiasSemana ? ordenar(dias) : [],
    diasMes,
    semanasMes,
    essencial: Boolean(e.essencial), // aparece no modo rotina mínima
  };
}

/* Garante que o usuário (vindo do servidor, da cópia offline ou da fila) tenha formato válido.
   Um valor estranho vira o padrão em vez de quebrar a tela. */
const SEXOS = ["Feminino", "Masculino", "Outro", "Prefiro não informar"];
const CANAIS_LEMBRETE = ["navegador", "email", "whatsapp", "telegram"];
function normalizarUsuario(u) {
  if (!u || typeof u !== "object" || typeof u.id !== "string" || !u.id) return null;
  const texto = (v) => (typeof v === "string" ? v : "");
  const email = texto(u.email);
  const nome = texto(u.nome).replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80);
  const canais = Array.isArray(u.canaisLembrete) ? u.canaisLembrete.filter((c) => CANAIS_LEMBRETE.includes(c)) : ["navegador"];
  return {
    ...u,
    id: u.id,
    email,
    nome: nome || email || "Você",
    celular: texto(u.celular).replace(/\D/g, "").slice(0, 11),
    sexo: SEXOS.includes(u.sexo) ? u.sexo : "",
    horaAcordar: horaValida(u.horaAcordar) ? u.horaAcordar : SONO_CONFIG.horaAcordarPadrao,
    tema: ["sistema", "claro", "escuro"].includes(u.tema) ? u.tema : "sistema",
    criadoEm: typeof u.criadoEm === "string" ? u.criadoEm : null,
    lembreteRitual: u.lembreteRitual === true,
    lembreteDiario: u.lembreteDiario === true,
    horaLembreteDiario: horaValida(u.horaLembreteDiario) ? u.horaLembreteDiario : "07:30",
    canaisLembrete: [...new Set(canais)],
  };
}

/* =========================================================
   FREQUÊNCIA: em quais dias um evento acontece
   diaria  : todo dia a partir de dataInicio
   semanal : nos diasSemana marcados, a partir de dataInicio
   mensal  : no mesmo dia do mês de dataInicio (dia 31 vira o último dia em meses curtos)
   unica   : só em dataInicio
   ========================================================= */
function ocorreEm(ev, chave) {
  if (chave < ev.dataInicio) return false; // textos AAAA-MM-DD comparam como datas
  const data = lerData(chave);
  switch (ev.frequencia) {
    case "diaria": return true;
    case "semanal": return ev.diasSemana.includes(data.getDay());
    case "mensal": {
      const dia = data.getDate();
      const ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
      const semanas = ev.semanasMes || [];
      if (semanas.length) {
        // Dias da semana do mês: a 1ª semana são os dias 1 a 7; a última, os 7 últimos dias
        if (!ev.diasSemana.includes(data.getDay())) return false;
        return semanas.some((s) => (s === 5 ? dia + 7 > ultimoDia : Math.ceil(dia / 7) === s));
      }
      // Dias do mês: num mês mais curto, o dia 31 (ou 30, 29) cai no último dia
      const dias = ev.diasMes && ev.diasMes.length ? ev.diasMes : [lerData(ev.dataInicio).getDate()];
      return dias.some((d) => (d === 32 ? dia === ultimoDia : Math.min(d, ultimoDia) === dia));
    }
    case "unica": return chave === ev.dataInicio;
    default: return false;
  }
}

function eventosDoDia(chave) {
  return estado.eventos.filter((ev) => ocorreEm(ev, chave)).sort(porHorario);
}

/* Dias escolhidos em texto.
   curto: "Dias úteis", "Fins de semana", "Todo dia" ou "Ter, qua e qui" (agenda).
   longo: "Aparece nos dias úteis, de segunda a sexta." (formulário). */
function mesmosDias(a, b) {
  return a.length === b.length && a.every((d) => b.includes(d));
}
function diasEmOrdem(dias) {
  return [...new Set(dias)].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)); // segunda primeiro
}
function descreverDias(dias, curto) {
  if (mesmosDias(dias, ATALHOS_DIAS.todos)) return curto ? "Todo dia" : "Aparece todos os dias.";
  if (mesmosDias(dias, ATALHOS_DIAS.uteis)) return curto ? "Dias úteis" : "Aparece nos dias úteis, de segunda a sexta.";
  if (mesmosDias(dias, ATALHOS_DIAS.fimDeSemana)) return curto ? "Fins de semana" : "Aparece nos fins de semana, sábado e domingo.";
  const ordem = diasEmOrdem(dias);
  if (curto) {
    const lista = juntarLista(ordem.map((d) => DIAS_SEMANA[d]));
    return lista.charAt(0).toUpperCase() + lista.slice(1);
  }
  if (ordem.length === 1) {
    const d = ordem[0];
    return `Aparece ${d === 0 || d === 6 ? "todo" : "toda"} ${DIAS_SEMANA_NOMES[d]}.`;
  }
  return `Aparece toda semana: ${juntarLista(ordem.map((d) => DIAS_SEMANA_NOMES[d]))}.`;
}

/* Mensal em texto.
   curto (agenda): "Todo dia 10 do mês", "Dias 1 e 15 do mês", "Último dia do mês", "1ª e 3ª semana: seg e qua".
   longo (formulário): "Aparece nos dias 1 e 15 de cada mês." */
const ORDINAIS_SEMANA = { 1: "1ª", 2: "2ª", 3: "3ª", 4: "4ª", 5: "última" };
const ATALHOS_MES = { inicio: [1], quinzenal: [1, 15], ultimo: [32] };

/* "às segundas e quartas", "nos dias úteis", "todos os dias" */
const DIAS_PLURAL = ["domingos", "segundas", "terças", "quartas", "quintas", "sextas", "sábados"];
function diasNoPlural(dias) {
  if (mesmosDias(dias, ATALHOS_DIAS.todos)) return "todos os dias";
  if (mesmosDias(dias, ATALHOS_DIAS.uteis)) return "nos dias úteis";
  if (mesmosDias(dias, ATALHOS_DIAS.fimDeSemana)) return "nos fins de semana";
  const ordem = diasEmOrdem(dias);
  return `${ordem[0] === 0 || ordem[0] === 6 ? "aos" : "às"} ${juntarLista(ordem.map((d) => DIAS_PLURAL[d]))}`;
}

function descreverMensal(ev, curto) {
  const semanas = ev.semanasMes || [];
  if (semanas.length) {
    const quais = juntarLista(semanas.map((s) => ORDINAIS_SEMANA[s]));
    const plural = semanas.length > 1 ? "semanas" : "semana";
    const dias = descreverDias(ev.diasSemana, true);
    if (curto) return `${quais.charAt(0).toUpperCase() + quais.slice(1)} ${plural} do mês: ${dias.toLowerCase()}`;
    return `Aparece na ${quais} ${plural} de cada mês, ${diasNoPlural(ev.diasSemana)}.`;
  }
  const dias = ev.diasMes && ev.diasMes.length ? ev.diasMes : [lerData(ev.dataInicio).getDate()];
  const numeros = dias.filter((d) => d !== 32);
  const ultimo = dias.includes(32);
  const partes = [...numeros.map(String), ...(ultimo ? ["último"] : [])];
  if (curto) {
    if (numeros.length === 1 && !ultimo) return `Todo dia ${numeros[0]} do mês`;
    if (!numeros.length) return "Último dia do mês";
    return `Dias ${juntarLista(partes)} do mês`;
  }
  const curtos = numeros.some((d) => d >= 29) ? " Nos meses mais curtos, os dias que não existem caem no último dia." : "";
  if (numeros.length === 1 && !ultimo) return `Aparece todo dia ${numeros[0]} de cada mês.${curtos}`;
  if (!numeros.length) return "Aparece no último dia de cada mês.";
  return `Aparece nos dias ${juntarLista(partes)} de cada mês.${curtos}`.replace("e último de cada", "e no último dia de cada");
}

/* Texto curto da frequência: "Todo dia", "Dias úteis", "Ter e qua", "Todo dia 10 do mês", "Só em 20/11/2026" */
function descreverFrequencia(ev) {
  const aPartir = ev.dataInicio > hojeChave() ? ` · a partir de ${formatarDataCurta(ev.dataInicio)}` : "";
  switch (ev.frequencia) {
    case "diaria": return "Todo dia" + aPartir;
    case "semanal": return descreverDias(ev.diasSemana, true) + aPartir;
    case "mensal": return descreverMensal(ev, true) + aPartir;
    case "unica": return `Só em ${formatarDataCurta(ev.dataInicio)}`;
    default: return "";
  }
}

/* =========================================================
   CALCULADORA RÁPIDA (página inicial)
   ========================================================= */
function calcularHorarios(horaAcordar) {
  const acordar = paraMinutos(horaAcordar);
  return SLEEP_SETTINGS.opcoes.map((op) => {
    const minutosDeSono = op.ciclos * SLEEP_SETTINGS.cycleMinutes;
    return {
      hora: formatarHora(acordar - minutosDeSono - SLEEP_SETTINGS.fallAsleepMinutes),
      duracao: formatarDuracao(minutosDeSono),
      rotulo: op.rotulo,
    };
  });
}

function renderizarResultados() {
  const input = el("hora-acordar");
  const lista = el("resultados");
  if (!horaValida(input.value)) { lista.innerHTML = ""; return; }
  lista.innerHTML = calcularHorarios(input.value).map((r) => `
    <li class="result">
      <div><small>${r.rotulo}</small><span>Sono de ${r.duracao}</span></div>
      <strong>${r.hora}</strong>
    </li>`).join("");
}

function iniciarCalculadora() {
  el("hora-acordar").addEventListener("input", renderizarResultados);
  renderizarResultados();
}

/* =========================================================
   CÁLCULO DO SONO A PARTIR DO ESFORÇO DE UM DIA
   Pontos de carga: leve = 1, médio = 2, pesado = 3.
   Média de esforço = carga ÷ número de eventos (de 1 a 3).
   ========================================================= */
function calcularSono(eventos) {
  const contagem = { 1: 0, 2: 0, 3: 0 };
  eventos.forEach((e) => { contagem[e.esforco] += 1; });

  const total = eventos.length;
  const carga = contagem[1] + contagem[2] * 2 + contagem[3] * 3;
  const media = total ? carga / total : 0;
  const extra = [1, 2, 3].reduce((soma, n) => soma + contagem[n] * SONO_CONFIG.extraPorEsforco[n], 0);
  const sono = Math.min(SONO_CONFIG.maximoMinutos, Math.max(SONO_CONFIG.minimoMinutos, SONO_CONFIG.baseMinutos + extra));

  return { contagem, total, carga, media, sono };
}

function rotuloMedia(media) {
  if (!media) return "—";
  if (media < 1.5) return "Leve";
  if (media < 2.5) return "Moderado";
  return "Intenso";
}

function formatarMedia(media) {
  return media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/* Resumo completo de um dia: eventos, carga, sono e hora de deitar */
function resumoDoDia(chave) {
  const eventos = eventosDoDia(chave);
  const r = calcularSono(eventos);
  const acordar = paraMinutos(estado.usuario.horaAcordar);
  const deitar = (acordar - r.sono - SONO_CONFIG.minutosParaAdormecer + 2880) % 1440;
  const janela = (acordar - deitar + 1440) % 1440;
  const noHorarioDeSono = (ev) => {
    const d = (paraMinutos(ev.horario) - deitar + 1440) % 1440;
    return d > 0 && d < janela;
  };
  return { ...r, eventos, acordar, deitar, noHorarioDeSono };
}

/* =========================================================
   RELÓGIO DE 24 HORAS (SVG)
   Meia-noite fica no topo e as horas avançam no sentido horário.
   O arco claro é o período na cama; os pontos coloridos são os eventos de hoje.
   ========================================================= */
function desenharRelogio(eventos, deitar, acordar, sono) {
  const C = 130;  // centro
  const R = 96;   // raio da trilha
  const ponto = (minutos, raio) => {
    const a = (minutos / 1440) * Math.PI * 2;
    return [+(C + raio * Math.sin(a)).toFixed(2), +(C - raio * Math.cos(a)).toFixed(2)];
  };

  const janela = (acordar - deitar + 1440) % 1440;
  const [x1, y1] = ponto(deitar, R);
  const [x2, y2] = ponto(acordar, R);
  const arco = `M ${x1} ${y1} A ${R} ${R} 0 ${janela > 720 ? 1 : 0} 1 ${x2} ${y2}`;

  let marcas = "";
  for (let h = 0; h < 24; h += 1) {
    const longa = h % 6 === 0;
    const [ax, ay] = ponto(h * 60, 108);
    const [bx, by] = ponto(h * 60, longa ? 117 : 112);
    marcas += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" class="rel-marca${longa ? " longa" : ""}" />`;
  }

  const rotulos = [0, 6, 12, 18].map((h) => {
    const [x, y] = ponto(h * 60, 72);
    return `<text x="${x}" y="${y}" class="rel-hora">${h}h</text>`;
  }).join("");

  const pontos = eventos.map((e) => {
    const [x, y] = ponto(paraMinutos(e.horario), R);
    return `<circle cx="${x}" cy="${y}" r="6.5" class="rel-evento" style="fill:${e.cor}"><title>${escaparHtml(e.nome)} · ${e.horario}</title></circle>`;
  }).join("");

  const svg = el("relogio");
  svg.innerHTML = `
    <circle cx="${C}" cy="${C}" r="${R}" class="rel-trilha" />
    ${marcas}
    <path d="${arco}" class="rel-sono" />
    ${rotulos}
    ${pontos}
    <text x="${C}" y="128" class="rel-total">${formatarDuracao(sono)}</text>
    <text x="${C}" y="152" class="rel-legenda">de sono</text>`;
  svg.setAttribute("aria-label", `Relógio de 24 horas: deitar às ${formatarHora(deitar)}, acordar às ${formatarHora(acordar)}, ${plural(eventos.length, "evento hoje", "eventos hoje")}.`);
}

/* =========================================================
   PÁGINA MINHA ROTINA: desenho da tela
   ========================================================= */
function renderizarRotina() {
  const logado = Boolean(estado.usuario);
  el("rotina-carregando").hidden = estado.pronto;
  el("rotina-bloqueio").hidden = !estado.pronto || logado;
  el("rotina-app").hidden = !estado.pronto || !logado;
  if (!estado.pronto || !logado) return;

  const hora = new Date().getHours();
  const cumprimento = hora >= 5 && hora < 12 ? "Bom dia" : hora >= 12 && hora < 18 ? "Boa tarde" : "Boa noite";
  el("rotina-saudacao").textContent = `${cumprimento}, ${primeiroNome()}`;
  renderizarHoje();
  renderizarAgenda();
  renderizarCalendario();
}

/* Painel noturno: sono recomendado para hoje */
function renderizarPainelHoje() {
  const hoje = hojeChave();
  const r = resumoDoDia(hoje);

  el("painel-titulo").innerHTML = `Deite às <strong>${formatarHora(r.deitar)}</strong> para acordar às <strong>${formatarHora(r.acordar)}</strong>`;
  el("painel-sub").textContent = r.total
    ? `${formatarDuracao(r.sono)} de sono, calculadas a partir de ${plural(r.total, "evento", "eventos")} de hoje (${formatarDataLonga(hoje).toLowerCase()}).`
    : `Hoje está tranquilo, sem eventos marcados, então usamos a base de ${formatarDuracao(SONO_CONFIG.baseMinutos)} de sono.`;

  el("media-bolas").dataset.nivel = r.total ? Math.round(r.media) : 0;
  el("media-texto").textContent = r.total ? `${formatarMedia(r.media)} · ${rotuloMedia(r.media)}` : "—";
  el("carga-texto").textContent = plural(r.carga, "ponto", "pontos");
  el("contagem-texto").textContent = r.total
    ? [1, 2, 3].filter((n) => r.contagem[n]).map((n) => plural(r.contagem[n], ESFORCOS[n].singular, ESFORCOS[n].plural)).join(" · ")
    : "Nenhum";

  const conflitos = r.eventos.filter(r.noHorarioDeSono);
  const aviso = el("aviso-conflito");
  aviso.hidden = conflitos.length === 0;
  if (conflitos.length) {
    const lista = conflitos.map((e) => `${e.nome} (${e.horario})`).join(", ");
    aviso.textContent = conflitos.length === 1
      ? `${lista} cai bem no horário de sono sugerido. Que tal antecipar esse evento ou acordar um pouco mais tarde?`
      : `${lista} caem bem no horário de sono sugerido. Que tal antecipar esses eventos ou acordar um pouco mais tarde?`;
  }

  const x = SONO_CONFIG.extraPorEsforco;
  el("nota-calculo").textContent =
    `Como calculamos: para cada dia, partimos de ${formatarDuracao(SONO_CONFIG.baseMinutos)} e somamos ${x[1]} min por evento leve, ` +
    `${x[2]} por médio e ${x[3]} por pesado, dentro da faixa de ${formatarDuracao(SONO_CONFIG.minimoMinutos)} a ` +
    `${formatarDuracao(SONO_CONFIG.maximoMinutos)} indicada para adultos, mais ${SONO_CONFIG.minutosParaAdormecer} min ` +
    `para você pegar no sono. É uma estimativa e não substitui a orientação de um profissional de saúde.`;

  desenharRelogio(r.eventos, r.deitar, r.acordar, r.sono);
}

/* Um evento na linha do tempo */
function itemAgendaHtml(ev, { excluir = false, conflito = false } = {}) {
  return `
    <li class="agenda-item" style="--cor:${ev.cor}">
      <time datetime="${ev.horario}">${ev.horario}</time>
      <span class="agenda-ponto" aria-hidden="true"></span>
      <div class="agenda-card">
        <p class="agenda-nome">${escaparHtml(ev.nome)}</p>
        <p class="agenda-meta">
          ${bolasHtml(ev.esforco)}
          <span>Esforço ${ESFORCOS[ev.esforco].singular}</span>
          <span class="agenda-freq">${escaparHtml(descreverFrequencia(ev))}</span>
          ${ev.essencial ? '<span class="tag-essencial">Essencial</span>' : ""}
          ${String(ev.id).startsWith("local-") ? '<span class="tag-pendente">Aguardando internet</span>' : ""}
          ${conflito ? '<span class="tag-conflito">No horário de sono</span>' : ""}
        </p>
      </div>
      ${excluir ? `<button class="agenda-excluir" type="button" data-excluir="${escaparHtml(ev.id)}" aria-label="Excluir ${escaparHtml(ev.nome)}">×</button>` : ""}
    </li>`;
}

/* Todos os eventos cadastrados, em ordem de horário */
function renderizarAgenda() {
  const eventos = [...estado.eventos].sort(porHorario);
  el("agenda-total").textContent = eventos.length ? plural(eventos.length, "evento cadastrado", "eventos cadastrados") : "";
  el("agenda-vazia").hidden = eventos.length > 0;
  el("agenda").innerHTML = eventos.map((ev) => itemAgendaHtml(ev, { excluir: true })).join("");
}

/* =========================================================
   CALENDÁRIO MENSAL
   Cada dia mostra até 3 pontos com as cores dos eventos e uma faixa
   com o esforço médio do dia. Ao tocar num dia, o detalhe ao lado
   lista os eventos, o esforço, o sono recomendado e a hora de deitar.
   ========================================================= */
function renderizarCalendario() {
  const cal = estado.calendario;
  if (!cal.selecionado) cal.selecionado = hojeChave();

  const primeiroDia = new Date(cal.ano, cal.mes, 1);
  const titulo = primeiroDia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const nomeMes = primeiroDia.toLocaleDateString("pt-BR", { month: "long" });
  el("cal-mes").textContent = titulo.charAt(0).toUpperCase() + titulo.slice(1);

  const vazios = primeiroDia.getDay();
  const diasNoMes = new Date(cal.ano, cal.mes + 1, 0).getDate();
  const hoje = hojeChave();

  let html = "";
  for (let i = 0; i < vazios; i += 1) html += '<span class="cal-vazio" aria-hidden="true"></span>';
  for (let dia = 1; dia <= diasNoMes; dia += 1) {
    const chave = chaveData(new Date(cal.ano, cal.mes, dia));
    const eventos = eventosDoDia(chave);
    const r = calcularSono(eventos);
    const nivel = r.total ? Math.round(r.media) : 0;
    const pontos = eventos.slice(0, 3).map((ev) => `<span class="cal-ponto" style="--cor:${ev.cor}"></span>`).join("")
      + (eventos.length > 3 ? `<span class="cal-mais">+${eventos.length - 3}</span>` : "");
    const rotulo = `${dia} de ${nomeMes}: ${r.total ? `${plural(r.total, "evento", "eventos")}, esforço ${rotuloMedia(r.media).toLowerCase()}` : "sem eventos"}`;
    html += `
      <button type="button" class="cal-dia${chave === hoje ? " hoje" : ""}" data-dia="${chave}" data-nivel="${nivel}"
        aria-pressed="${chave === cal.selecionado}" aria-label="${rotulo}">
        <span class="cal-num">${dia}</span>
        <span class="cal-pontos" aria-hidden="true">${pontos}</span>
      </button>`;
  }
  el("cal-grade").innerHTML = html;
  renderizarDetalheDia();
}

function renderizarDetalheDia() {
  const chave = estado.calendario.selecionado;
  const r = resumoDoDia(chave);

  el("dia-titulo").textContent = formatarDataLonga(chave) + (chave === hojeChave() ? " (hoje)" : "");
  el("dia-resumo").hidden = r.total === 0;
  const ritual = progressoRitual(chave);
  el("dia-resumo").innerHTML = r.total ? `
    <div><dt>Esforço do dia</dt><dd>${bolasHtml(Math.round(r.media))}<span>${rotuloMedia(r.media)} · ${formatarMedia(r.media)}</span></dd></div>
    <div><dt>Carga</dt><dd>${plural(r.carga, "ponto", "pontos")}</dd></div>
    <div><dt>Eventos</dt><dd>${r.total}</dd></div>
    <div><dt>Ritual noturno</dt><dd>${ritual.feitos ? `${ritual.feitos} de ${ritual.total} passos` : "—"}</dd></div>` : "";
  el("dia-lista").innerHTML = r.eventos.map((ev) => itemAgendaHtml(ev)).join("");
  el("dia-vazio").hidden = r.total > 0;
}

function irParaMes(ano, mes, selecionado) {
  const data = new Date(ano, mes, 1);
  estado.calendario.ano = data.getFullYear();
  estado.calendario.mes = data.getMonth();
  estado.calendario.selecionado = selecionado || chaveData(data);
  renderizarCalendario();
}

function iniciarCalendario() {
  el("cal-grade").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-dia]");
    if (!botao) return;
    const chave = botao.dataset.dia;
    estado.calendario.selecionado = chave;
    renderizarCalendario();
    const novo = el("cal-grade").querySelector(`[data-dia="${chave}"]`);
    if (novo) novo.focus();
  });
  el("cal-anterior").addEventListener("click", () => irParaMes(estado.calendario.ano, estado.calendario.mes - 1));
  el("cal-proximo").addEventListener("click", () => irParaMes(estado.calendario.ano, estado.calendario.mes + 1));
  el("cal-hoje").addEventListener("click", () => {
    const hoje = new Date();
    irParaMes(hoje.getFullYear(), hoje.getMonth(), chaveData(hoje));
  });
}

/* =========================================================
   PÁGINA MINHA ROTINA: formulário, exclusão e exemplo
   ========================================================= */
function mensagemEvento(texto, tipo = "") {
  const m = el("ev-msg");
  m.textContent = texto;
  m.className = "form-msg " + tipo;
}

function selecionarCor(cor, personalizada) {
  estado.cor = cor;
  document.querySelectorAll(".cor-op").forEach((b) => {
    b.setAttribute("aria-pressed", String(!personalizada && b.dataset.cor.toLowerCase() === cor.toLowerCase()));
  });
  el("cor-livre").classList.toggle("ativo", personalizada);
  if (!personalizada) el("ev-cor").value = cor.toLowerCase();
}

/* Mostra os dias da semana só no modo semanal e ajusta o texto de ajuda */
function atualizarFrequencia() {
  const form = el("form-evento");
  const frequencia = form.elements.frequencia.value;
  const data = dataValida(el("ev-data").value) ? el("ev-data").value : hojeChave();

  const modoMensal = form.elements["modo-mensal"].value;
  const mensalPorSemana = frequencia === "mensal" && modoMensal === "semana";
  el("campo-mensal").hidden = frequencia !== "mensal";
  el("mensal-dias").hidden = mensalPorSemana;
  el("mensal-semana").hidden = !mensalPorSemana;
  // O seletor de dias da semana serve ao semanal e ao mensal por semana
  el("campo-dias").hidden = frequencia !== "semanal" && !mensalPorSemana;
  el("legenda-dias").textContent = mensalPorSemana ? "Em quais dias dessas semanas?" : "Em quais dias o evento aparece?";
  if (frequencia === "mensal" && modoMensal === "dias" && !form.querySelector('input[name="dias-mes"]:checked')) {
    el(`ev-mes-${lerData(data).getDate()}`).checked = true;
  }
  if (mensalPorSemana && !form.querySelector('input[name="semanas-mes"]:checked')) {
    el(`ev-semana-${Math.min(4, Math.ceil(lerData(data).getDate() / 7))}`).checked = true;
  }
  el("rotulo-data").textContent = frequencia === "unica" ? "Data do evento" : "Começa em";
  if ((frequencia === "semanal" || mensalPorSemana) && !form.querySelector('input[name="dias"]:checked')) {
    el(`ev-dia-${lerData(data).getDay()}`).checked = true;
  }
  atualizarDiasEvento();
  const dicas = {
    diaria: "Repete todos os dias a partir da data escolhida.",
    semanal: "Escolha um atalho ou marque qualquer combinação de dias.",
    mensal: "Escolha os dias do mês ou os dias da semana dentro do mês, com atalhos ou qualquer combinação.",
    unica: "Acontece só na data escolhida.",
  };
  el("ev-freq-dica").textContent = dicas[frequencia];
}

/* Atalhos acesos conforme os dias marcados e o resumo em texto */
function diasMarcados() {
  return [...el("form-evento").querySelectorAll('input[name="dias"]:checked')].map((c) => Number(c.value));
}
function atualizarDiasEvento() {
  const dias = diasMarcados();
  document.querySelectorAll("[data-atalho-dias]").forEach((b) => {
    b.setAttribute("aria-pressed", String(mesmosDias(dias, ATALHOS_DIAS[b.dataset.atalhoDias])));
  });
  el("ev-dias-resumo").textContent = dias.length ? descreverDias(dias, false) : "Marque pelo menos um dia.";
  atualizarMensal();
}

/* Mensal: dias do mês ou semanas do mês marcadas */
function marcados(nome) {
  return [...el("form-evento").querySelectorAll(`input[name="${nome}"]:checked`)].map((c) => Number(c.value));
}
function atualizarMensal() {
  const form = el("form-evento");
  if (form.elements.frequencia.value !== "mensal") return;
  const porSemana = form.elements["modo-mensal"].value === "semana";
  const diasMes = marcados("dias-mes");
  document.querySelectorAll("[data-atalho-mes]").forEach((b) => {
    b.setAttribute("aria-pressed", String(mesmosDias(diasMes, ATALHOS_MES[b.dataset.atalhoMes])));
  });
  const semanas = marcados("semanas-mes");
  const dias = diasMarcados();
  let texto;
  if (porSemana) {
    texto = !semanas.length ? "Marque pelo menos uma semana do mês." : !dias.length ? "Marque pelo menos um dia da semana."
      : descreverMensal({ semanasMes: semanas, diasSemana: dias }, false);
  } else {
    texto = diasMes.length ? descreverMensal({ diasMes, dataInicio: hojeChave() }, false) : "Marque pelo menos um dia do mês.";
  }
  // Por semana, o resumo vai para baixo dos dias da semana (o último campo preenchido)
  el("ev-mensal-resumo").textContent = porSemana ? "" : texto;
  el("ev-mensal-resumo").hidden = porSemana;
  if (porSemana) el("ev-dias-resumo").textContent = texto;
}

async function carregarExemplo() {
  if (!estado.usuario) return;
  const botao = el("btn-exemplo");
  botao.disabled = true;
  try {
    for (const modelo of montarRotinaExemplo()) {
      const salvo = normalizarEvento(await DB.criarEvento(estado.usuario, modelo));
      if (salvo) estado.eventos.push(salvo);
    }
  } catch (err) {
    mensagemEvento(err instanceof ErroAmigavel ? err.message : "Não deu para carregar o exemplo agora. Tente de novo em instantes.", "erro");
  }
  botao.disabled = false;
  renderizarRotina();
}

function iniciarRotina() {
  const form = el("form-evento");
  el("ev-data").value = hojeChave();

  /* Seletor de esforço: preenche as bolas até o nível escolhido */
  const seletor = el("ev-esforco");
  const atualizarEsforco = () => {
    const nivel = form.elements.esforco.value || "1";
    seletor.dataset.nivel = nivel;
    seletor.querySelectorAll(".op-esforco").forEach((op) => {
      op.classList.toggle("ativo", op.querySelector("input").value === nivel);
    });
  };
  seletor.addEventListener("change", atualizarEsforco);
  atualizarEsforco();

  /* Frequência e data */
  form.addEventListener("change", (e) => {
    if (e.target.name === "frequencia" || e.target.id === "ev-data") atualizarFrequencia();
    if (e.target.name === "dias") atualizarDiasEvento();
    if (e.target.name === "modo-mensal") atualizarFrequencia();
    if (e.target.name === "dias-mes" || e.target.name === "semanas-mes") atualizarMensal();
  });
  /* Atalhos de dias do mês: Início do mês, Dias 1 e 15 e Último dia */
  el("campo-mensal").addEventListener("click", (e) => {
    const atalho = e.target.closest("[data-atalho-mes]");
    if (!atalho) return;
    const dias = ATALHOS_MES[atalho.dataset.atalhoMes];
    form.querySelectorAll('input[name="dias-mes"]').forEach((c) => { c.checked = dias.includes(Number(c.value)); });
    atualizarMensal();
  });
  /* Atalhos de dias: Dias úteis, Fins de semana e Todos os dias */
  el("campo-dias").addEventListener("click", (e) => {
    const atalho = e.target.closest("[data-atalho-dias]");
    if (!atalho) return;
    const dias = ATALHOS_DIAS[atalho.dataset.atalhoDias];
    form.querySelectorAll('input[name="dias"]').forEach((c) => { c.checked = dias.includes(Number(c.value)); });
    atualizarDiasEvento();
  });
  atualizarFrequencia();

  /* Cores de marcação */
  el("ev-cores").insertAdjacentHTML("afterbegin", CORES_EVENTO.map(({ cor, nome }) =>
    `<button type="button" class="cor-op" data-cor="${cor}" style="--cor:${cor}" aria-pressed="false" aria-label="${nome}" title="${nome}"></button>`
  ).join(""));
  el("ev-cores").addEventListener("click", (e) => {
    const botao = e.target.closest(".cor-op");
    if (botao) selecionarCor(botao.dataset.cor, false);
  });
  el("ev-cor").addEventListener("input", (e) => selecionarCor(e.target.value, true));
  selecionarCor(CORES_EVENTO[0].cor, false);

  /* Salvar evento */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!estado.usuario) return;
    const campos = form.elements;
    const nome = limparTexto(campos.nome.value);
    const horario = campos.horario.value;
    const dataInicio = el("ev-data").value;
    const frequencia = campos.frequencia.value;
    const mensalPorSemana = frequencia === "mensal" && campos["modo-mensal"].value === "semana";
    const diasSemana = frequencia === "semanal" || mensalPorSemana ? diasMarcados() : [];
    const semanasMes = mensalPorSemana ? marcados("semanas-mes") : [];
    const diasMes = frequencia === "mensal" && !mensalPorSemana ? marcados("dias-mes") : [];

    if (!nome) { mensagemEvento("Faltou o nome do evento.", "erro"); campos.nome.focus(); return; }
    if (!horaValida(horario)) { mensagemEvento("Faltou o horário do evento.", "erro"); campos.horario.focus(); return; }
    if (!dataValida(dataInicio)) { mensagemEvento("Faltou a data do evento.", "erro"); el("ev-data").focus(); return; }
    if (frequencia === "semanal" && !diasSemana.length) { mensagemEvento("Marque pelo menos um dia da semana.", "erro"); return; }
    if (mensalPorSemana && !semanasMes.length) { mensagemEvento("Marque pelo menos uma semana do mês.", "erro"); return; }
    if (mensalPorSemana && !diasSemana.length) { mensagemEvento("Marque pelo menos um dia da semana.", "erro"); return; }
    if (frequencia === "mensal" && !mensalPorSemana && !diasMes.length) { mensagemEvento("Marque pelo menos um dia do mês.", "erro"); return; }

    const novo = {
      nome,
      horario,
      esforco: Number(campos.esforco.value || 1),
      cor: corValida(estado.cor) ? estado.cor : CORES_EVENTO[0].cor,
      frequencia,
      dataInicio,
      diasSemana,
      diasMes,
      semanasMes,
      essencial: el("ev-essencial").checked,
    };

    const botao = el("ev-salvar");
    botao.disabled = true;
    try {
      const salvo = normalizarEvento(await DB.criarEvento(estado.usuario, novo));
      estado.eventos.push(salvo);
      if (salvo.frequencia === "unica") {
        const d = lerData(salvo.dataInicio);
        estado.calendario.ano = d.getFullYear();
        estado.calendario.mes = d.getMonth();
        estado.calendario.selecionado = salvo.dataInicio;
      }
      renderizarRotina();
      campos.nome.value = "";
      campos.horario.value = "";
      el("ev-essencial").checked = false;
      mensagemEvento(`“${nome}” adicionado: ${descreverFrequencia(salvo).toLowerCase()}, às ${horario}.${avisoGuardado()}`, "ok");
      // Dica no momento certo: hábitos que atrapalham o sono
      const minutosEvento = paraMinutos(horario);
      if (/caf[eé]|energ[eé]tico/i.test(nome) && minutosEvento >= 14 * 60) mostrarDica("cafeina");
      else if (salvo.esforco === 3 && minutosEvento >= 19 * 60) mostrarDica("exercicio");
      else if (/jant|refei/i.test(nome) && minutosEvento >= 21 * 60) mostrarDica("refeicao");
      campos.nome.focus();
    } catch (err) {
      mensagemEvento(err instanceof ErroAmigavel ? err.message : "Não deu para salvar o evento agora. Tente de novo em instantes.", "erro");
    }
    botao.disabled = false;
  });

  /* Excluir evento */
  el("agenda").addEventListener("click", async (e) => {
    const botao = e.target.closest("[data-excluir]");
    if (!botao || !estado.usuario) return;
    const id = botao.dataset.excluir;
    botao.disabled = true;
    try {
      await DB.excluirEvento(estado.usuario, id);
      estado.eventos = estado.eventos.filter((ev) => ev.id !== id);
      renderizarRotina();
    } catch (err) {
      botao.disabled = false;
      mensagemEvento(err instanceof ErroAmigavel ? err.message : "Não deu para excluir o evento agora. Tente de novo em instantes.", "erro");
    }
  });

  /* Hora de acordar */
  el("sono-acordar").addEventListener("change", async (e) => {
    if (!estado.usuario || !horaValida(e.target.value)) return;
    const anterior = estado.usuario.horaAcordar;
    estado.usuario.horaAcordar = e.target.value;
    atualizarTela();
    try {
      await DB.salvarPerfil(estado.usuario, { horaAcordar: e.target.value });
      mostrarToast(`Combinado: você acorda às ${e.target.value}.`);
    } catch (err) {
      estado.usuario.horaAcordar = anterior;
      atualizarTela();
    }
  });

  el("btn-exemplo").addEventListener("click", carregarExemplo);
  iniciarCalendario();
}

/* =========================================================
   LOGIN E SENHA
   Com o Supabase, e-mail e senha ficam no Supabase Auth.
   No modo demonstração, a senha é guardada como hash PBKDF2 com salt.
   ========================================================= */
/* =========================================================
   SEGURANÇA (resumo do que o site e o banco fazem)
   - Todo texto digitado é escapado antes de ir para a tela (escaparHtml), e nomes
     perdem < > e caracteres de controle antes de salvar (limparTexto).
     O banco também recusa esses caracteres.
   - Senha: de 8 a 72 caracteres, com letras e números, sem conter o e-mail (validarSenha).
   - Login: depois de 5 tentativas erradas, espera antes de tentar de novo,
     e a espera dobra a cada novo bloqueio. O Supabase também limita tentativas.
   - A sessão é vigiada: se terminar em outra aba ou expirar, os dados saem da tela.
   - No site publicado sem conexão, nada é guardado no navegador (DB_INDISPONIVEL).
   - A biblioteca do Supabase fica no próprio site, com verificação de integridade (SRI).
   - No banco: cada usuário só acessa os próprios dados (RLS); id, usuario_id e
     criado_em não podem ser alterados; visitantes sem login não acessam nada;
     limite de 300 eventos por conta.
   - Na hospedagem: cabeçalhos de segurança no arquivo _headers (Netlify).
   ========================================================= */
const AUTH_SETTINGS = {
  senhaMinima: 8,
  senhaMaxima: 72,              // limite do Supabase Auth
  tentativasAntesDeEsperar: 5,
  esperaSegundos: 30,           // dobra a cada novo bloqueio
  iteracoes: 150000,            // PBKDF2 do modo demonstração
};

/* Tira < > e caracteres de controle e junta espaços */
function limparTexto(texto) {
  return String(texto).replace(/[<>\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
}

/* Devolve o problema da senha, ou "" se ela estiver boa */
function validarSenha(senha, email) {
  if (senha.length < AUTH_SETTINGS.senhaMinima) return `A senha precisa ter pelo menos ${AUTH_SETTINGS.senhaMinima} caracteres.`;
  if (senha.length > AUTH_SETTINGS.senhaMaxima) return `A senha pode ter no máximo ${AUTH_SETTINGS.senhaMaxima} caracteres.`;
  if (!/\p{L}/u.test(senha) || !/\d/.test(senha)) return "Use letras e números na senha.";
  const usuarioEmail = String(email || "").split("@")[0].toLowerCase();
  if (usuarioEmail.length >= 4 && senha.toLowerCase().includes(usuarioEmail)) return "A senha não pode conter o seu e-mail.";
  return "";
}

/* =========================================================
   FORÇA DA SENHA (cadastro)
   Nota de 0 a 6:
   - tamanho: +1 com 8 caracteres, +1 com 12 e +1 com 16 ou mais;
   - variedade: +1 para cada tipo além do primeiro (minúsculas, maiúsculas,
     números e símbolos, que incluem o espaço).
   Descontos: senha ou palavra muito comum (-2), nome ou e-mail na senha (-2),
   sequência como 1234 ou abcd (-1) e repetição como aaa (-1).
   Resultado: fraca (vermelho) até 2 pontos ou fora das regras de validarSenha();
   moderada (laranja) com 3 ou 4; forte (verde claro) com 5 ou mais.
   Senha fraca não cria conta.
   ========================================================= */
const NIVEIS_SENHA = {
  0: { nome: "", texto: "Digite uma senha" },
  1: { nome: "fraca", texto: "Senha fraca" },
  2: { nome: "moderada", texto: "Senha moderada" },
  3: { nome: "forte", texto: "Senha forte" },
};
const SENHAS_COMUNS = [
  "12345678", "123456789", "1234567890", "senha123", "senha1234", "password", "password1", "qwerty123",
  "abc12345", "abcd1234", "11111111", "00000000", "a1b2c3d4", "q1w2e3r4", "iloveyou", "admin123",
  "mudar123", "teste123", "brasil123", "ritmo123",
];
const PALAVRAS_COMUNS = [
  "senha", "password", "qwerty", "admin", "teste", "ritmo", "brasil", "amor", "deus", "jesus", "iloveyou",
  "flamengo", "corinthians", "palmeiras", "vasco", "santos", "gremio", "cruzeiro", "botafogo", "fluminense",
];

function temSequencia(texto) {
  const t = texto.toLowerCase();
  for (let i = 0; i + 3 < t.length; i += 1) {
    const d = t.charCodeAt(i + 1) - t.charCodeAt(i);
    if ((d === 1 || d === -1) && t.charCodeAt(i + 2) - t.charCodeAt(i + 1) === d && t.charCodeAt(i + 3) - t.charCodeAt(i + 2) === d) return true;
  }
  return false;
}

function avaliarSenha(senha, { email = "", nome = "" } = {}) {
  const criterios = {
    tamanho: senha.length >= AUTH_SETTINGS.senhaMinima,
    letrasNumeros: /\p{L}/u.test(senha) && /\d/.test(senha),
    maiusculaMinuscula: /\p{Ll}/u.test(senha) && /\p{Lu}/u.test(senha),
    simbolo: /[^\p{L}\d]/u.test(senha),
    longa: senha.length >= 12,
  };
  if (!senha) return { nivel: 0, nota: 0, criterios, avisos: [] };

  let nota = [8, 12, 16].filter((n) => senha.length >= n).length;
  const tipos = [/\p{Ll}/u, /\p{Lu}/u, /\d/, /[^\p{L}\d]/u].filter((r) => r.test(senha)).length;
  nota += Math.max(0, tipos - 1);

  const avisos = [];
  const minuscula = senha.toLowerCase();
  const soLetras = minuscula.replace(/[^\p{L}]/gu, "");
  const comum = SENHAS_COMUNS.includes(minuscula) ||
    PALAVRAS_COMUNS.some((p) => soLetras === p || (p.length >= 5 && minuscula.includes(p)));
  if (comum) { nota -= 2; avisos.push("Evite senhas e palavras muito comuns."); }
  const pedacos = [...String(nome).toLowerCase().split(/\s+/), String(email).toLowerCase().split("@")[0]]
    .filter((p) => p.length >= 3);
  if (pedacos.some((p) => minuscula.includes(p))) { nota -= 2; avisos.push("Não use seu nome ou e-mail na senha."); }
  if (temSequencia(senha)) { nota -= 1; avisos.push("Evite sequências como 1234 ou abcd."); }
  if (/(.)\1\1/u.test(senha)) { nota -= 1; avisos.push("Evite repetir o mesmo caractere, como aaa."); }

  const erro = validarSenha(senha, email);
  const nivel = erro || nota <= 2 ? 1 : nota <= 4 ? 2 : 3;
  return { nivel, nota, criterios, avisos, erro };
}

/* =========================================================
   MEDIDOR DE FORÇA E CONFIRMAÇÃO DA SENHA
   O mesmo sistema vale para criar conta, criar senha nova (Esqueci minha senha)
   e mudar a senha no Meu perfil. Cada formulário tem os campos "senha" e
   "confirmar" e um bloco .forca-senha com .forca-rotulo, [data-criterio] e .forca-aviso.
   ========================================================= */
function desenharMedidor(medidor, r, senha) {
  medidor.dataset.nivel = r.nivel;
  medidor.querySelector(".forca-rotulo").textContent = NIVEIS_SENHA[r.nivel].texto;
  medidor.querySelectorAll("[data-criterio]").forEach((item) => {
    const ok = Boolean(r.criterios[item.dataset.criterio]);
    item.dataset.ok = ok;
    item.querySelector("use").setAttribute("href", ok ? "#ic-check" : "#ic-traco");
  });
  const aviso = medidor.querySelector(".forca-aviso");
  aviso.textContent = senha ? (r.erro || r.avisos[0] || (r.nivel < 3 ? "Para deixar mais forte, use 12 ou mais caracteres e um símbolo." : "")) : "";
  aviso.hidden = !aviso.textContent;
}

function desenharConfirmacao(msg, senha, confirmar) {
  msg.hidden = !confirmar;
  msg.dataset.ok = confirmar === senha;
  msg.textContent = confirmar === senha ? "Tudo certo, as senhas são iguais." : "As senhas ainda estão diferentes.";
}

/* Liga o medidor a um formulário e devolve a função que redesenha (dados: email e nome, para os avisos) */
function ligarMedidorSenha({ form, medidor, confirmarMsg, dados }) {
  const atualizar = () => {
    const senha = form.elements.senha.value;
    const r = avaliarSenha(senha, dados());
    desenharMedidor(medidor, r, senha);
    desenharConfirmacao(confirmarMsg, senha, form.elements.confirmar.value);
    return r;
  };
  ["senha", "confirmar"].forEach((campo) => form.elements[campo].addEventListener("input", atualizar));
  form.addEventListener("reset", () => setTimeout(atualizar, 0)); // o reset limpa os campos depois do evento
  atualizar();
  return atualizar;
}

/* Mesmas regras do cadastro para qualquer senha nova. Devolve o problema, ou "" se estiver tudo certo. */
function problemaSenhaNova(senha, confirmar, { email = "", nome = "" } = {}) {
  const problema = validarSenha(senha, email);
  if (problema) return problema;
  const forca = avaliarSenha(senha, { email, nome });
  if (forca.nivel < 2) {
    return `Essa senha é fraca. ${forca.avisos[0] || "Use 12 ou mais caracteres e misture maiúsculas, minúsculas, números e símbolos."}`;
  }
  if (senha !== confirmar) return "As duas senhas ficaram diferentes. Digite de novo.";
  return "";
}

let atualizarForcaSenha = () => {};
function iniciarForcaSenha() {
  const form = el("form-criar");
  atualizarForcaSenha = ligarMedidorSenha({
    form,
    medidor: el("forca-senha"),
    confirmarMsg: el("confirmar-msg"),
    dados: () => ({ email: form.elements.email.value, nome: form.elements.nome.value }),
  });
  ["email", "nome"].forEach((campo) => form.elements[campo].addEventListener("input", atualizarForcaSenha));
}

/* Controle de tentativas de login nesta aba */
/* Vale para entrar e para confirmar a senha antes de excluir a conta.
   A espera fica guardada no navegador (recarregar a página não zera).
   O limite de verdade é o do Supabase Auth (Authentication > Rate Limits); este só ajuda na tela. */
const CHAVE_TENTATIVAS = "ritmo_tentativas_senha";
const tentativasLogin = Object.assign({ falhas: 0, bloqueios: 0, liberaEm: 0 }, armazenamento.ler(CHAVE_TENTATIVAS, {}));

function segundosDeEspera() {
  return Math.max(0, Math.ceil((tentativasLogin.liberaEm - Date.now()) / 1000));
}

function registrarFalhaLogin() {
  tentativasLogin.falhas += 1;
  if (tentativasLogin.falhas >= AUTH_SETTINGS.tentativasAntesDeEsperar) {
    tentativasLogin.falhas = 0;
    tentativasLogin.bloqueios += 1;
    tentativasLogin.liberaEm = Date.now() + AUTH_SETTINGS.esperaSegundos * 1000 * 2 ** (tentativasLogin.bloqueios - 1);
  }
  armazenamento.gravar(CHAVE_TENTATIVAS, tentativasLogin);
}

function zerarTentativas() {
  Object.assign(tentativasLogin, { falhas: 0, bloqueios: 0, liberaEm: 0 });
  armazenamento.remover(CHAVE_TENTATIVAS);
}

/* Apaga dos formulários os dados da conta (usado ao sair) */
function limparFormularios() {
  ["form-entrar", "form-criar", "form-recuperar", "form-redefinir", "form-senha", "form-perfil", "form-sono", "form-emocional", "form-excluir"].forEach((id) => el(id).reset());
  el("form-excluir").hidden = true;
  fecharMudarSenha();
  el("pf-senha-msg").textContent = "";
  estado.emocionalSujo = false;
  estado.formSono = { data: null, sujo: false };
  el("ev-nome").value = "";
  mensagemPerfil("");
  mensagemEvento("");
}

/* Se a sessão terminar fora desta aba (saída em outra aba, troca de senha ou
   sessão expirada), tira os dados da conta da tela na hora */
function vigiarSessao() {
  if (DB.tipo !== "supabase") return;
  DB.cliente.auth.onAuthStateChange((evento) => {
    if (evento !== "SIGNED_OUT" || !estado.usuario) return;
    setTimeout(async () => {
      await definirUsuario(null);
      limparFormularios();
      atualizarTela();
    }, 0);
  });
}

function bytesParaHex(bytes) { return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(""); }
function hexParaBytes(hex) { return Uint8Array.from(hex.match(/../g), (h) => parseInt(h, 16)); }

async function gerarHash(senha, saltHex) {
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: hexParaBytes(saltHex), iterations: AUTH_SETTINGS.iteracoes, hash: "SHA-256" },
    chave,
    256
  );
  return bytesParaHex(new Uint8Array(bits));
}

/* Carrega o usuário conectado (ou nenhum) e os eventos dele */
async function definirUsuario(usuario) {
  usuario = normalizarUsuario(usuario);
  estado.usuario = usuario;
  if (usuario) {
    // Eventos, diário de sono e check-ins dos últimos DIAS_HISTORICO dias, em paralelo
    const desde = chaveData(new Date(Date.now() - DIAS_HISTORICO * 86400000));
    const [eventos, registros, checkins] = await Promise.all([
      DB.listarEventos(usuario),
      DB.listarRegistrosSono(usuario, desde).catch(() => []),
      DB.listarCheckins(usuario, desde).catch(() => ({})),
    ]);
    estado.eventos = eventos.map(normalizarEvento).filter(Boolean);
    estado.registros = registros.map(normalizarRegistro).filter(Boolean).sort((a, b) => (a.data < b.data ? 1 : -1));
    estado.checkins = normalizarCheckins(checkins);
  } else {
    estado.eventos = [];
    estado.registros = [];
    estado.checkins = {};
  }
  atualizarBotaoConta();
  if (usuario && usuario.tema) aplicarTema(usuario.tema); // o tema da conta vale em qualquer aparelho
  if (usuario && armazenamento.ler(CHAVE_SUGERIR_INSTALAR, false)) sugerirInstalacaoAposCadastro();
  if (usuario && DB === DB_OFFLINE && lerFila(usuario.id).length) agendarSincronizacao(); // alterações feitas sem internet
  atualizarBarraConexao();
}

/* Botão da conta no topo: "Entrar" ou as iniciais + primeiro nome (leva ao perfil) */
function atualizarBotaoConta() {
  const botao = el("btn-conta");
  const u = estado.usuario;
  botao.classList.toggle("conectado", Boolean(u));
  if (u) {
    botao.innerHTML = `<span class="mini-avatar" aria-hidden="true">${escaparHtml(iniciais(u.nome))}</span>${escaparHtml(primeiroNome())}`;
    botao.setAttribute("aria-label", `Abrir meu perfil (${u.nome})`);
  } else {
    botao.textContent = "Entrar";
    botao.removeAttribute("aria-label");
  }
  atualizarCtas();
  atualizarInstalacao();
  atualizarAreasVisitante();
}

/* Itens com data-so-visitantes (Início no menu, coluna "Conheça" do rodapé) somem com login */
const CHAVE_SESSAO_ATIVA = "ritmo_sessao_ativa"; // lida no <head> para a página inicial não piscar
function atualizarAreasVisitante() {
  const logado = Boolean(estado.usuario);
  document.querySelectorAll("[data-so-visitantes]").forEach((n) => { n.hidden = logado; });
  armazenamento.gravar(CHAVE_SESSAO_ATIVA, logado);
}

function primeiroNome() {
  return estado.usuario ? String(estado.usuario.nome).split(" ")[0] : "";
}

/* Depois de entrar: quem está em Meu perfil ou Relaxar continua na mesma página */
async function concluirAcesso(usuario, contaNova = false) {
  await definirUsuario(usuario);
  const pagina = location.hash.slice(1);
  const ficar = pagina === "perfil" || pagina === "relaxar" || pagina === "sono";
  const saudacao = contaNova ? "Conta criada. Boas-vindas ao Ritmo!" : "Que bom ter você de volta!";
  mensagemConta(ficar ? saudacao : `${saudacao} Abrindo a sua rotina.`, "ok");
  setTimeout(() => el("auth-dialog").close(), 600);
  if (ficar) atualizarTela();
  else irPara("rotina");
}

/* "Sair da conta": se houver alterações feitas sem internet ainda não enviadas, avisa antes */
async function pedirSaida() {
  const aviso = el("pf-sair-aviso");
  if (pendentes() && !aviso.dataset.confirmado) {
    if (!semInternet()) {
      await sincronizar();
      if (!pendentes()) { sair(); return; }
    }
    const n = pendentes();
    aviso.hidden = false;
    aviso.dataset.confirmado = "1";
    aviso.textContent = `${plural(n, "alteração feita", "alterações feitas")} sem internet ainda não ${n === 1 ? "foi enviada" : "foram enviadas"}. Conecte-se e espere a sincronização, ou toque em "Sair mesmo assim" para descartar.`;
    el("pf-sair").textContent = "Sair mesmo assim";
    return;
  }
  sair();
}

function restaurarBotaoSair() {
  const aviso = el("pf-sair-aviso");
  aviso.hidden = true;
  delete aviso.dataset.confirmado;
  el("pf-sair").textContent = "Sair da conta";
}

async function sair() {
  const id = estado.usuario && estado.usuario.id;
  try { await DB.sair(); } catch (e) { /* sai localmente mesmo assim */ }
  if (id && DB === DB_OFFLINE) apagarDadosOffline(id); // cópia e fila desta conta saem do aparelho
  restaurarBotaoSair();
  await definirUsuario(null);
  limparFormularios();
  atualizarTela();
  irPara("inicio"); // sem login, a página inicial volta a aparecer
}

function mensagemConta(texto, tipo = "") {
  const m = el("auth-msg");
  m.textContent = texto;
  m.className = "auth-msg " + tipo;
}

/* Modos do diálogo da conta: entrar, criar, recuperar (pedir o link) e redefinir (senha nova) */
const MODOS_CONTA = {
  entrar: "Que bom ver você de novo",
  criar: "Vamos criar a sua conta",
  recuperar: "Vamos recuperar o seu acesso",
  redefinir: "Crie uma senha nova",
};

function trocarModoConta(modo) {
  document.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.modo === modo)));
  Object.keys(MODOS_CONTA).forEach((m) => { el(`form-${m}`).hidden = modo !== m; });
  el("auth-abas").hidden = modo === "recuperar" || modo === "redefinir";
  el("auth-titulo").textContent = MODOS_CONTA[modo];
  el("recuperar-previa").hidden = true;
  mensagemConta("");
}

function abrirConta(modo) {
  el("form-entrar").reset();
  el("form-criar").reset();
  el("form-recuperar").reset();
  trocarModoConta(modo);
  const dialogo = el("auth-dialog");
  if (!dialogo.open) dialogo.showModal();
}

/* Desativa o botão do formulário enquanto espera o banco */
function ocupado(form, sim) {
  const botao = form.querySelector('button[type="submit"]');
  if (botao) botao.disabled = sim;
}

/* =========================================================
   ESQUECI MINHA SENHA
   1. "Esqueci minha senha" (no Entrar) pede o e-mail e manda o link (DB.recuperarSenha).
      A resposta é sempre a mesma, exista ou não a conta, e há uma espera entre um pedido e outro.
   2. O e-mail é o modelo padrão do Supabase. O link volta ao site com ?code=... (ou ?token_hash=...
      se um dia usar um modelo próprio).
   3. O site valida o link e abre "Crie uma senha nova", com o mesmo medidor do cadastro.
      A sessão do link serve só para isso: fechar sem salvar encerra essa sessão.
   4. Senha salva: o Supabase encerra a sessão em todos os aparelhos e a pessoa entra com a senha nova.
   Na demonstração (sem servidor), o e-mail não é enviado: aparece uma prévia dele com o botão.
   ========================================================= */
const RECUPERACAO = {
  esperaSegundos: 60,                          // entre um pedido de link e outro (o Supabase também limita)
  chaveEspera: "ritmo_recuperacao_enviado",    // quando o último link foi pedido, neste navegador
  chavePendente: "ritmo_recuperacao_pendente", // sessionStorage: link aberto e senha ainda não trocada
};
const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function segundosParaNovoLink() {
  const enviado = Number(armazenamento.ler(RECUPERACAO.chaveEspera, 0)) || 0;
  return Math.max(0, Math.ceil((enviado + RECUPERACAO.esperaSegundos * 1000 - Date.now()) / 1000));
}

function marcarRecuperacaoPendente(sim) {
  try {
    if (sim) sessionStorage.setItem(RECUPERACAO.chavePendente, "1");
    else sessionStorage.removeItem(RECUPERACAO.chavePendente);
  } catch (e) { /* sem armazenamento da aba: segue */ }
}
function recuperacaoFicouPendente() {
  try { return sessionStorage.getItem(RECUPERACAO.chavePendente) === "1"; } catch (e) { return false; }
}

/* Abre o formulário "Crie uma senha nova" para a conta do link */
let atualizarMedidorRedefinir = () => {};
function abrirRedefinirSenha(info) {
  estado.recuperacao = info;
  marcarRecuperacaoPendente(true);
  const form = el("form-redefinir");
  form.reset();
  trocarModoConta("redefinir");
  el("redefinir-email").textContent = info.email;
  form.elements.usuario.value = info.email; // para o gerenciador de senhas saber de qual conta é
  atualizarMedidorRedefinir();
  const dialogo = el("auth-dialog");
  if (!dialogo.open) dialogo.showModal();
  form.elements.senha.focus();
}

/* Encerra a sessão do link sem trocar a senha (diálogo fechado) */
function cancelarRedefinicao() {
  if (!estado.recuperacao) return;
  estado.recuperacao = null;
  marcarRecuperacaoPendente(false);
  DB.cancelarRecuperacao().catch(() => {});
}

/* Demonstração: mostra como o e-mail chegaria, com o botão que leva à senha nova */
function mostrarPreviaEmail({ email, nome }) {
  const caixa = el("recuperar-previa");
  const primeiro = String(nome || "").split(" ")[0];
  caixa.innerHTML = `
    <p class="previa-rotulo">Modo demonstração: o e-mail não é enviado de verdade. Ele chegaria assim:</p>
    <div class="email-previa">
      <p class="email-assunto"><span>Assunto</span>Foi você que pediu uma senha nova no Ritmo?</p>
      <p><strong>${primeiro ? `Olá, ${escaparHtml(primeiro)}!` : "Olá!"}</strong></p>
      <p>Recebemos um pedido para criar uma senha nova para a conta <strong>${escaparHtml(email)}</strong>. Foi você?</p>
      <button type="button" class="btn btn-small" id="previa-redefinir">Sim, fui eu: criar senha nova</button>
      <p class="dica">Não foi você? É só ignorar este e-mail. A sua senha continua a mesma.</p>
    </div>`;
  caixa.hidden = false;
  el("previa-redefinir").addEventListener("click", () => abrirRedefinirSenha({ email, nome: nome || "" }));
}

function iniciarRecuperacaoSenha(dialogo, formEntrar) {
  const formRecuperar = el("form-recuperar");
  const formRedefinir = el("form-redefinir");

  el("btn-esqueci").addEventListener("click", () => {
    const email = formEntrar.elements.email.value.trim();
    trocarModoConta("recuperar");
    formRecuperar.elements.email.value = email;
    formRecuperar.elements.email.focus();
  });
  el("btn-voltar-entrar").addEventListener("click", () => {
    const email = formRecuperar.elements.email.value.trim();
    trocarModoConta("entrar");
    formEntrar.elements.email.value = email;
    formEntrar.elements[email ? "senha" : "email"].focus();
  });

  formRecuperar.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!estado.pronto) return mensagemConta("Ainda conectando ao servidor. Tente de novo em instantes.", "erro");
    const email = formRecuperar.elements.email.value.trim().toLowerCase();
    if (!emailValido(email)) return mensagemConta("Esse e-mail parece incompleto. Confira e tente de novo.", "erro");
    const espera = segundosParaNovoLink();
    if (espera) return mensagemConta(`Acabamos de mandar um link. Espere ${espera} s para pedir outro.`, "erro");
    el("recuperar-previa").hidden = true;
    ocupado(formRecuperar, true);
    mensagemConta("Enviando o link…");
    try {
      const resposta = await DB.recuperarSenha(email);
      armazenamento.gravar(RECUPERACAO.chaveEspera, Date.now());
      mensagemConta(`Pronto! Se existir uma conta com ${email}, o link para criar uma senha nova chega em instantes. Confira também a caixa de spam.`, "ok");
      if (resposta && resposta.previa) mostrarPreviaEmail(resposta.previa);
    } catch (err) {
      mensagemConta(err instanceof ErroAmigavel ? err.message : "Não deu para enviar o link agora. Tente de novo em instantes.", "erro");
    }
    ocupado(formRecuperar, false);
  });

  atualizarMedidorRedefinir = ligarMedidorSenha({
    form: formRedefinir,
    medidor: el("forca-senha-nova"),
    confirmarMsg: el("redefinir-confirmar-msg"),
    dados: () => ({ email: (estado.recuperacao || {}).email || "", nome: (estado.recuperacao || {}).nome || "" }),
  });

  formRedefinir.addEventListener("submit", async (e) => {
    e.preventDefault();
    const info = estado.recuperacao;
    if (!info) return mensagemConta("Esse link não vale mais. Peça um novo em Esqueci minha senha.", "erro");
    const campos = formRedefinir.elements;
    const problema = problemaSenhaNova(campos.senha.value, campos.confirmar.value, info);
    if (problema) return mensagemConta(problema, "erro");
    ocupado(formRedefinir, true);
    mensagemConta("Salvando a senha nova…");
    try {
      await DB.redefinirSenha(campos.senha.value, info);
      estado.recuperacao = null;
      marcarRecuperacaoPendente(false);
      formRedefinir.reset();
      zerarTentativas();
      trocarModoConta("entrar");
      formEntrar.elements.email.value = info.email;
      mensagemConta(DB.tipo === "supabase"
        ? "Senha nova salva! Por segurança, saímos da sua conta em todos os aparelhos. Agora é só entrar com a senha nova."
        : "Senha nova salva! Agora é só entrar com ela.", "ok");
      formEntrar.elements.senha.focus();
    } catch (err) {
      mensagemConta(err instanceof ErroAmigavel ? err.message : "Não deu para salvar a senha nova agora. Tente de novo em instantes.", "erro");
    }
    ocupado(formRedefinir, false);
  });

  // Fechou o diálogo sem salvar a senha nova: a sessão do link é encerrada
  dialogo.addEventListener("close", cancelarRedefinicao);
}

function iniciarAutenticacao() {
  const dialogo = el("auth-dialog");
  const formEntrar = el("form-entrar");
  const formCriar = el("form-criar");

  el("btn-conta").addEventListener("click", () => {
    if (estado.usuario) irPara("perfil"); // sair fica no perfil
    else abrirConta("entrar");
  });
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => trocarModoConta(t.dataset.modo)));
  dialogo.querySelector("[data-fechar]").addEventListener("click", () => dialogo.close());

  /* Botões "Entrar" / "Criar conta" e chamadas da página inicial */
  document.addEventListener("click", (e) => {
    const abrir = e.target.closest("[data-abrir]");
    if (abrir) { e.preventDefault(); abrirConta(abrir.dataset.abrir); return; }
    const cta = e.target.closest("[data-cta]");
    if (cta) {
      e.preventDefault();
      if (estado.usuario) irPara(cta.dataset.destino || "rotina"); // data-destino: outra página para quem já entrou
      else abrirConta("criar");
    }
  });

  formCriar.elements.celular.addEventListener("input", (e) => {
    e.target.value = formatarCelular(e.target.value);
  });

  formEntrar.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!estado.pronto) return mensagemConta("Ainda conectando ao servidor. Tente de novo em instantes.", "erro");
    const email = formEntrar.elements.email.value.trim().toLowerCase();
    const senha = formEntrar.elements.senha.value;
    if (!email || !senha) return mensagemConta("Preencha e-mail e senha.", "erro");
    const espera = segundosDeEspera();
    if (espera) return mensagemConta(`Muitas tentativas seguidas. Aguarde ${espera} s para tentar de novo.`, "erro");
    ocupado(formEntrar, true);
    mensagemConta("Entrando…");
    try {
      const usuario = await DB.entrar(email, senha);
      zerarTentativas();
      formEntrar.reset(); // não deixa a senha no campo
      await concluirAcesso(usuario);
    } catch (err) {
      registrarFalhaLogin();
      const aviso = segundosDeEspera() ? ` Por segurança, aguarde ${segundosDeEspera()} s antes de tentar de novo.` : "";
      mensagemConta((err instanceof ErroAmigavel ? err.message : "Não deu para entrar agora. Tente de novo em instantes.") + aviso, "erro");
    }
    ocupado(formEntrar, false);
  });

  iniciarRecuperacaoSenha(dialogo, formEntrar);

  formCriar.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!estado.pronto) return mensagemConta("Ainda conectando ao servidor. Tente de novo em instantes.", "erro");
    const campos = formCriar.elements;
    const dados = {
      nome: limparTexto(campos.nome.value),
      email: campos.email.value.trim().toLowerCase(),
      celular: campos.celular.value.replace(/\D/g, ""),
      sexo: campos.sexo.value,
    };
    const senha = campos.senha.value;

    if (dados.nome.length < 2) return mensagemConta("Digite seu nome.", "erro");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) return mensagemConta("Esse e-mail parece incompleto. Confira e tente de novo.", "erro");
    if (dados.celular.length < 10) return mensagemConta("Digite o celular com DDD, por exemplo (81) 91234-5678.", "erro");
    if (!dados.sexo) return mensagemConta("Selecione o sexo.", "erro");
    const problemaSenha = problemaSenhaNova(senha, campos.confirmar.value, { email: dados.email, nome: dados.nome });
    if (problemaSenha) return mensagemConta(problemaSenha, "erro");

    ocupado(formCriar, true);
    mensagemConta("Criando a sua conta…");
    try {
      const { usuario, precisaConfirmar } = await DB.cadastrar(dados, senha);
      campos.senha.value = ""; // não deixa a senha nos campos
      campos.confirmar.value = "";
      // Leva para a conta nova o tema escolhido antes do cadastro
      if (usuario && usuario.tema !== temaSalvo()) {
        try {
          await DB.salvarPerfil(usuario, { tema: temaSalvo() });
          usuario.tema = temaSalvo();
        } catch (e) { /* segue com o tema padrão da conta */ }
      }
      if (precisaConfirmar) {
        armazenamento.gravar(CHAVE_SUGERIR_INSTALAR, true); // sugere a instalação no primeiro acesso
        mensagemConta(`Conta criada! Mandamos um link de confirmação para ${dados.email}. Abra o e-mail, confirme e depois entre pela aba Entrar.`, "ok");
      } else {
        await concluirAcesso(usuario, true);
        sugerirInstalacaoAposCadastro(); // cadastro concluído: convida a instalar o app
      }
    } catch (err) {
      mensagemConta(err instanceof ErroAmigavel ? err.message : "Não deu para criar a conta agora. Tente de novo em instantes.", "erro");
    }
    ocupado(formCriar, false);
  });
}

/* =========================================================
   NAVEGAÇÃO: menu do topo e barra de abas do celular
   ========================================================= */
function montarNavegacao() {
  const soVisitantes = (l) => (l.soVisitantes ? " data-so-visitantes" : "");
  el("nav-links").innerHTML = NAV_LINKS.map((l) => `<a href="${l.href}"${soVisitantes(l)}>${l.label}</a>`).join("");
  el("abas").innerHTML = NAV_LINKS.map((l) => `
    <a href="${l.href}"${soVisitantes(l)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[l.icone] || ""}</svg>
      <span>${l.curto || l.label}</span>
    </a>`).join("");
}

/* Aviso rápido na parte de baixo da tela */
function mostrarToast(texto, duracaoMs = 3500) {
  const t = el("toast");
  t.textContent = texto;
  t.hidden = false;
  clearTimeout(mostrarToast.espera);
  mostrarToast.espera = setTimeout(() => { t.hidden = true; }, duracaoMs);
}

/* =========================================================
   DADOS DE SONO: utilitários
   ========================================================= */
const DIAS_HISTORICO = 400;              // quantos dias de histórico carregar
const MARCOS_SEQUENCIA = [3, 7, 14, 21, 30, 60, 100]; // comemorados com um aviso
const LIMITE_DESCANSO_SEMANA = 2;        // dias de descanso planejados por semana
const NIVEIS_ENERGIA = { 1: "Muito baixa", 2: "Baixa", 3: "Razoável", 4: "Boa", 5: "Ótima" };
/* Origem do registro (manual ou importado de um wearable) */
const ORIGENS = { manual: "Manual", apple_health: "Apple Health", google_fit: "Google Fit", garmin: "Garmin", oura: "Oura" };

function somarDias(chave, n) {
  const d = lerData(chave);
  d.setDate(d.getDate() + n);
  return chaveData(d);
}

function formatarDataSemana(chave) {
  return lerData(chave).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "");
}

/* Garante que um registro lido do banco tenha formato válido */
function normalizarRegistro(r) {
  if (!r || !dataValida(r.data)) return null;
  const horaDeitar = String(r.horaDeitar || "").slice(0, 5);
  const horaAcordar = String(r.horaAcordar || "").slice(0, 5);
  if (!horaValida(horaDeitar) || !horaValida(horaAcordar)) return null;
  const energia = Number(r.energia);
  return {
    id: String(r.id || r.data),
    data: r.data,
    horaDeitar,
    horaAcordar,
    latencia: Math.min(240, Math.max(0, Math.round(Number(r.latencia) || 0))),
    despertares: Math.min(30, Math.max(0, Math.round(Number(r.despertares) || 0))),
    energia: energia >= 1 && energia <= 5 ? energia : null,
    humor: Number(r.humor) >= 1 && Number(r.humor) <= 5 ? Number(r.humor) : null,
    origem: ORIGENS[r.origem] ? r.origem : "manual",
  };
}

/* Tempo na cama, sono estimado (cama menos latência) e eficiência do sono */
function calcularNoite(r) {
  const naCama = (paraMinutos(r.horaAcordar) - paraMinutos(r.horaDeitar) + 1440) % 1440;
  const dormindo = Math.max(0, naCama - (Number(r.latencia) || 0));
  return { naCama, dormindo, eficiencia: naCama ? Math.round((dormindo / naCama) * 100) : 0 };
}

/* Média de horários perto da meia-noite (23:30 e 00:30 dão 00:00, não 12:00) */
function horarioMedio(minutos) {
  if (!minutos.length) return null;
  const ajustados = minutos.map((m) => (m < 720 ? m + 1440 : m));
  return Math.round(ajustados.reduce((a, b) => a + b, 0) / ajustados.length) % 1440;
}

function energiaHtml(n) {
  if (!n) return "—";
  return `<span class="bolas-energia" role="img" aria-label="${n} de 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "cheia" : ""}"></i>`).join("")}</span>`;
}

/* =========================================================
   MINHA ROTINA: HOJE POR PERÍODO E RITUAL DE DESACELERAÇÃO
   Manhã 5h–12h, Tarde 12h–18h, Noite 18h–5h. O ritual ocupa os
   RITUAL_MINUTOS antes da hora de deitar recomendada e tem uma lista
   de passos que a pessoa marca (salva em checkins_diarios).
   ========================================================= */
const PERIODOS = [
  { id: "manha", nome: "Manhã", faixa: "5h às 12h", icone: "sol" },
  { id: "tarde", nome: "Tarde", faixa: "12h às 18h", icone: "solPoente" },
  { id: "noite", nome: "Noite", faixa: "18h às 5h", icone: "lua" },
];
const RITUAL_MINUTOS = 60;
/* Passos do ritual. O id é salvo no banco: não troque ids já usados (só o texto).
   essencial: continua valendo no modo rotina mínima. */
const RITUAL_PASSOS = [
  { id: "telas", texto: "Desligar telas e notificações", essencial: true },
  { id: "luz", texto: "Diminuir as luzes da casa" },
  { id: "banho", texto: "Banho morno ou lavar o rosto" },
  { id: "leitura", texto: "Leitura leve ou música calma" },
  { id: "respirar", texto: "Respirar devagar por 5 minutos", essencial: true },
  { id: "amanha", texto: "Anotar as tarefas de amanhã" },
];

/* Modo rotina mínima (dias de sobrecarga): meta de água e sono mínimo garantido */
const AGUA_META_COPOS = 8;
const SONO_MINIMO_MINUTOS = 420; // 7h

function modoMinimo(chave) {
  return Boolean((estado.checkins[chave] || {}).modoMinimo);
}

/* Passos do ritual que valem no dia: todos, ou só os essenciais na rotina mínima */
function passosDoDia(chave) {
  return modoMinimo(chave) ? RITUAL_PASSOS.filter((p) => p.essencial) : RITUAL_PASSOS;
}

function periodoDe(minutos) {
  if (minutos >= 300 && minutos < 720) return "manha";
  if (minutos >= 720 && minutos < 1080) return "tarde";
  return "noite";
}

/* O horário cai dentro da hora antes de deitar? */
function noRitual(minutos, deitar) {
  const antes = (deitar - minutos + 1440) % 1440;
  return antes > 0 && antes <= RITUAL_MINUTOS;
}

/* Noite: eventos depois da meia-noite vão para o fim da lista */
const ordemNoite = (ev) => { const m = paraMinutos(ev.horario); return m < 300 ? m + 1440 : m; };

function progressoRitual(chave) {
  const ids = (estado.checkins[chave] || {}).ritualConcluidos || [];
  const passos = passosDoDia(chave);
  return { feitos: passos.filter((p) => ids.includes(p.id)).length, total: passos.length };
}

/* Check-in vazio de um dia (valores padrão) */
/* Limpa os check-ins vindos do banco ou do aparelho antes de aparecerem na tela */
function normalizarCheckins(mapa) {
  const nota = (v) => (Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 5 ? Number(v) : null);
  const limpo = {};
  Object.entries(mapa || {}).forEach(([data, c]) => {
    if (!dataValida(data) || !c || typeof c !== "object") return;
    const emocoes = [nota(c.estresseNoite), nota(c.ansiedadeNoite), nota(c.fadigaNoite)];
    const completas = emocoes.every((v) => v != null);
    limpo[data] = {
      ritualConcluidos: (Array.isArray(c.ritualConcluidos) ? c.ritualConcluidos : []).filter((id) => /^[a-z0-9_-]{1,40}$/.test(String(id))),
      diaDescanso: c.diaDescanso === true,
      modoMinimo: c.modoMinimo === true,
      aguaCopos: Math.min(30, Math.max(0, Math.round(Number(c.aguaCopos) || 0))),
      estresseNoite: completas ? emocoes[0] : null,
      ansiedadeNoite: completas ? emocoes[1] : null,
      fadigaNoite: completas ? emocoes[2] : null,
    };
  });
  return limpo;
}

const checkinVazio = () => ({
  ritualConcluidos: [], diaDescanso: false, modoMinimo: false, aguaCopos: 0,
  estresseNoite: null, ansiedadeNoite: null, fadigaNoite: null,
});

/* Atualiza o check-in do dia na tela e no banco; desfaz se o banco recusar */
async function atualizarCheckin(data, campos, aoMudar) {
  const anterior = estado.checkins[data];
  estado.checkins[data] = { ...checkinVazio(), ...anterior, ...campos };
  aoMudar();
  try {
    await DB.salvarCheckin(estado.usuario, data, campos);
    return true;
  } catch (err) {
    if (anterior) estado.checkins[data] = anterior; else delete estado.checkins[data];
    aoMudar();
    mostrarToast(err instanceof ErroAmigavel ? err.message : "Não deu para salvar agora. Tente de novo em instantes.");
    return false;
  }
}

function renderizarHoje() {
  const hoje = hojeChave();
  const r = resumoDoDia(hoje);
  const minimo = modoMinimo(hoje);
  const inicioRitual = (r.deitar - RITUAL_MINUTOS + 1440) % 1440;
  const grupos = { manha: [], tarde: [], noite: [] };
  const ocultos = { manha: 0, tarde: 0, noite: 0 };
  r.eventos.forEach((ev) => {
    const p = periodoDe(paraMinutos(ev.horario));
    if (minimo && !ev.essencial) ocultos[p] += 1; // rotina mínima: só o essencial aparece
    else grupos[p].push(ev);
  });
  grupos.noite.sort((a, b) => ordemNoite(a) - ordemNoite(b));

  // Botão, aviso e básico do dia do modo rotina mínima
  const botao = el("btn-minimo");
  botao.setAttribute("aria-pressed", String(minimo));
  botao.textContent = minimo ? "Rotina mínima ligada" : "Modo rotina mínima";
  el("banner-minimo").hidden = !minimo;
  el("basico-hoje").hidden = !minimo;
  if (minimo) renderizarBasico(r);

  el("hoje-sub").innerHTML = `${formatarDataLonga(hoje)} · ${r.total ? plural(r.total, "evento", "eventos") : "dia livre"} · <a href="#sono">Ritual da noite às ${formatarHora(inicioRitual)}</a>`;

  el("periodos").innerHTML = PERIODOS.map((p) => {
    const lista = grupos[p.id];
    const media = calcularSono(lista).media;
    const itens = lista.map((ev) => `
      <li class="item-periodo" style="--cor:${ev.cor}">
        <time datetime="${ev.horario}">${ev.horario}</time>
        <span class="ponto" aria-hidden="true"></span>
        <span class="nome">${escaparHtml(ev.nome)}${noRitual(paraMinutos(ev.horario), r.deitar) ? '<span class="tag-ritual">Hora do ritual</span>' : ""}</span>
        <span class="esforco" data-nivel="${ev.esforco}" role="img" aria-label="Esforço ${ESFORCOS[ev.esforco].singular}"><span class="bola"></span><span class="bola"></span><span class="bola"></span></span>
      </li>`).join("");
    const esforcoPeriodo = lista.length
      ? `<span class="esforco" data-nivel="${Math.round(media)}" role="img" aria-label="Esforço médio do período: ${rotuloMedia(media).toLowerCase()}" title="Esforço médio: ${rotuloMedia(media).toLowerCase()}"><span class="bola"></span><span class="bola"></span><span class="bola"></span></span>`
      : "";
    const oculto = ocultos[p.id]
      ? `<p class="periodo-oculto">${plural(ocultos[p.id], "atividade secundária oculta", "atividades secundárias ocultas")} hoje</p>`
      : "";
    return `
      <article class="periodo" data-periodo="${p.id}">
        <div class="periodo-topo">
          <span class="periodo-icone" aria-hidden="true"><svg class="icone-svg" viewBox="0 0 24 24">${ICONES[p.icone]}</svg></span>
          <div><h3>${p.nome}</h3><span class="periodo-faixa">${p.faixa}</span></div>
          ${esforcoPeriodo}
        </div>
        ${lista.length ? `<ol class="lista-periodo">${itens}</ol>` : `<p class="periodo-vazio">${minimo ? "Nada essencial por aqui." : "Livre por aqui."}</p>`}
        ${oculto}
      </article>`;
  }).join("");
}

/* Básico do dia na rotina mínima: água, horário mínimo de sono e ritual curto */
function renderizarBasico(r) {
  const hoje = hojeChave();
  const copos = (estado.checkins[hoje] || {}).aguaCopos || 0;
  const deitarMinimo = (r.acordar - SONO_MINIMO_MINUTOS - SONO_CONFIG.minutosParaAdormecer + 1440) % 1440;
  const ritual = progressoRitual(hoje);
  el("basico-hoje").innerHTML = `
    <article class="basico">
      <h3>Hidratação</h3>
      <div class="copos" role="group" aria-label="Copos de água bebidos hoje">
        ${Array.from({ length: AGUA_META_COPOS }, (_, i) => `<button type="button" class="copo" data-copo="${i + 1}" aria-pressed="${i < copos}" aria-label="${i + 1} ${i ? "copos" : "copo"} de água"></button>`).join("")}
      </div>
      <p>${copos} de ${AGUA_META_COPOS} copos. Toque no copo para marcar.</p>
    </article>
    <article class="basico">
      <h3>Horário mínimo de sono</h3>
      <p class="basico-destaque">Deite até ${formatarHora(deitarMinimo)}</p>
      <p>Assim você dorme pelo menos ${formatarDuracao(SONO_MINIMO_MINUTOS)} e acorda às ${formatarHora(r.acordar)}.</p>
    </article>
    <article class="basico">
      <h3>Ritual curto</h3>
      <p class="basico-destaque">${ritual.feitos} de ${ritual.total} passos</p>
      <p>${passosDoDia(hoje).map((p) => escaparHtml(p.texto)).join(" e ")}. <a href="#sono">Marcar no Sono</a></p>
    </article>`;
}

/* Ritual de desaceleração (página Sono): os 60 minutos antes da hora de deitar */
function renderizarRitual() {
  const hoje = hojeChave();
  const r = resumoDoDia(hoje);
  const inicioRitual = (r.deitar - RITUAL_MINUTOS + 1440) % 1440;
  const minimo = modoMinimo(hoje);
  const passos = passosDoDia(hoje);
  const progresso = progressoRitual(hoje);
  const feitos = (estado.checkins[hoje] || {}).ritualConcluidos || [];
  const duranteRitual = r.eventos.filter((ev) => noRitual(paraMinutos(ev.horario), r.deitar));
  const pesados = duranteRitual.filter((ev) => ev.esforco >= 2);
  const alerta = duranteRitual.length
    ? `<p class="ritual-alerta">Marcado para essa hora: ${duranteRitual.map((ev) => `${escaparHtml(ev.nome)} (${ev.horario})`).join(", ")}.${pesados.length ? " Atividades que cansam muito nesse horário podem deixar o corpo agitado na hora de dormir." : ""}</p>`
    : "";
  const avisoMinimo = minimo
    ? '<p class="ritual-alerta">Rotina mínima ligada hoje: só os passos essenciais contam.</p>'
    : "";
  el("ritual").innerHTML = `
    <article class="ritual" aria-labelledby="ritual-titulo">
      <div>
        <span class="ritual-rotulo">Ritual de desaceleração</span>
        <h3 id="ritual-titulo">${formatarHora(inicioRitual)} às ${formatarHora(r.deitar)}</h3>
        <p>Os ${RITUAL_MINUTOS} minutos antes de dormir preparam o corpo para o sono. Marque o que você fez hoje.</p>
        <div class="ritual-progresso" aria-hidden="true"><span style="width:${Math.round((progresso.feitos / progresso.total) * 100)}%"></span></div>
        <span class="ritual-contagem">${progresso.feitos} de ${progresso.total} passos concluídos</span>
        ${avisoMinimo}
        ${alerta}
        <p style="margin: 14px 0 0;"><a class="ritual-link" href="#relaxar">Respiração guiada e sons para relaxar</a></p>
      </div>
      <ul class="ritual-passos" aria-label="Passos do ritual de hoje">
        ${passos.map((p) => `
          <li><label class="passo"><input type="checkbox" data-passo-ritual="${p.id}"${feitos.includes(p.id) ? " checked" : ""} /><span>${escaparHtml(p.texto)}</span></label></li>`).join("")}
      </ul>
    </article>`;
}

function iniciarHoje() {
  /* Modo rotina mínima: liga e desliga para o dia de hoje */
  const alternarMinimo = async () => {
    if (!estado.usuario) return;
    const hoje = hojeChave();
    const novo = !modoMinimo(hoje);
    const ok = await atualizarCheckin(hoje, { modoMinimo: novo }, () => { renderizarHoje(); renderizarRitual(); });
    if (ok) mostrarToast(novo ? "Rotina mínima ligada. Hoje é só o essencial, e tudo bem." : "Rotina completa de volta. Bom dia para você!");
  };
  el("btn-minimo").addEventListener("click", alternarMinimo);
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-alternar-minimo]")) alternarMinimo();
  });

  /* Copos de água: tocar no copo N marca N copos (tocar de novo no último desmarca) */
  el("basico-hoje").addEventListener("click", async (e) => {
    const copo = e.target.closest("[data-copo]");
    if (!copo || !estado.usuario) return;
    const hoje = hojeChave();
    const atual = (estado.checkins[hoje] || {}).aguaCopos || 0;
    const n = Number(copo.dataset.copo);
    const novo = n === atual ? n - 1 : n;
    await atualizarCheckin(hoje, { aguaCopos: novo }, renderizarHoje);
    const foco = el("basico-hoje").querySelector(`[data-copo="${n}"]`);
    if (foco) foco.focus();
    if (novo === AGUA_META_COPOS && n > atual) mostrarToast("Meta de água cumprida! Seu corpo agradece.");
  });

  /* Passos do ritual (página Sono) */
  el("ritual").addEventListener("change", async (e) => {
    const caixa = e.target.closest("[data-passo-ritual]");
    if (!caixa || !estado.usuario) return;
    const hoje = hojeChave();
    const id = caixa.dataset.passoRitual;
    const marcados = new Set((estado.checkins[hoje] || {}).ritualConcluidos || []);
    if (caixa.checked) marcados.add(id); else marcados.delete(id);
    const lista = RITUAL_PASSOS.map((p) => p.id).filter((pid) => marcados.has(pid));
    const ok = await atualizarCheckin(hoje, { ritualConcluidos: lista }, () => { renderizarRitual(); renderizarHoje(); });
    const novaCaixa = el("ritual").querySelector(`[data-passo-ritual="${id}"]`);
    if (novaCaixa) novaCaixa.focus();
    const progresso = progressoRitual(hoje);
    if (ok && caixa.checked && progresso.feitos === progresso.total) mostrarToast("Ritual completo. Agora é só descansar. Boa noite!");
  });
}

/* =========================================================
   PÁGINA SONO
   ========================================================= */
function renderizarSono() {
  const logado = Boolean(estado.usuario);
  el("sono-carregando").hidden = estado.pronto;
  el("sono-bloqueio").hidden = !estado.pronto || logado;
  el("sono-app").hidden = !estado.pronto || !logado;
  if (!estado.pronto || !logado) return;

  el("sono-acordar").value = estado.usuario.horaAcordar;
  renderizarPainelHoje();
  renderizarRitual();
  if (estado.formSono.sujo) atualizarResumoNoite();
  else preencherFormSono(estado.formSono.data || hojeChave());
  renderizarEmocional();
  renderizarSequencia();
  renderizarTendencias();
  renderizarLembretes();
}

/* --- Registro rápido --- */
function definirEnergia(n) {
  el("rs-energia").dataset.nivel = n || 0;
  document.querySelectorAll('#rs-energia input[name="energia"]').forEach((r) => { r.checked = Number(r.value) === n; });
  el("rs-energia-texto").textContent = n ? `${n} de 5 · ${NIVEIS_ENERGIA[n]}` : "Toque nas bolinhas: 1 é muito baixa e 5 é ótima.";
}

/* Mostra no formulário a noite da data escolhida (para editar) ou sugere horários */
function preencherFormSono(data) {
  const campos = el("form-sono").elements;
  const reg = estado.registros.find((r) => r.data === data);
  el("rs-data").max = hojeChave();
  el("rs-data").value = data;
  if (reg) {
    campos.deitar.value = reg.horaDeitar;
    campos.acordar.value = reg.horaAcordar;
    campos.latencia.value = reg.latencia;
    campos.despertares.value = reg.despertares;
    definirEnergia(reg.energia || 0);
    definirEscala("rs-humor", reg.humor || 0);
    el("rs-selo").textContent = "Já registrado · editando";
    el("rs-salvar").textContent = "Salvar alterações";
  } else {
    // Sugere os horários da última noite registrada ou a recomendação do site
    const ultimo = estado.registros[0];
    campos.deitar.value = ultimo ? ultimo.horaDeitar : formatarHora(resumoDoDia(somarDias(data, -1)).deitar);
    campos.acordar.value = ultimo ? ultimo.horaAcordar : estado.usuario.horaAcordar;
    campos.latencia.value = 15;
    campos.despertares.value = 0;
    definirEnergia(0);
    definirEscala("rs-humor", 0);
    el("rs-selo").textContent = "";
    el("rs-salvar").textContent = "Salvar registro";
  }
  estado.formSono = { data, sujo: false };
  atualizarResumoNoite();
}

function atualizarResumoNoite() {
  atualizarLigacaoCheckin(); // check-in da noite anterior e resultado com o humor marcado
  const campos = el("form-sono").elements;
  if (!horaValida(campos.deitar.value) || !horaValida(campos.acordar.value)) {
    el("rs-resumo").innerHTML = "";
    return;
  }
  const n = calcularNoite({ horaDeitar: campos.deitar.value, horaAcordar: campos.acordar.value, latencia: Number(campos.latencia.value) || 0 });
  el("rs-resumo").innerHTML = `
    <div><dt>Na cama</dt><dd>${formatarDuracao(n.naCama)}</dd></div>
    <div><dt>Sono estimado</dt><dd>${formatarDuracao(n.dormindo)}</dd></div>
    <div><dt>Eficiência</dt><dd>${n.eficiencia}%</dd></div>`;
}

function mensagemSono(texto, tipo = "") {
  const m = el("rs-msg");
  m.textContent = texto;
  m.className = "form-msg " + tipo;
}

async function salvarRegistroDoForm(e) {
  e.preventDefault();
  if (!estado.usuario) return;
  const campos = el("form-sono").elements;
  const reg = {
    data: el("rs-data").value,
    horaDeitar: campos.deitar.value,
    horaAcordar: campos.acordar.value,
    latencia: Math.round(Number(campos.latencia.value)),
    despertares: Math.round(Number(campos.despertares.value)),
    energia: Number(el("rs-energia").dataset.nivel),
    humor: Number(el("rs-humor").dataset.nivel) || null, // opcional
  };
  if (!dataValida(reg.data) || reg.data > hojeChave()) return mensagemSono("Escolha o dia em que você acordou (hoje ou antes).", "erro");
  if (!horaValida(reg.horaDeitar) || !horaValida(reg.horaAcordar)) return mensagemSono("Faltou dizer a que horas você deitou e a que horas acordou.", "erro");
  if (!Number.isFinite(reg.latencia) || reg.latencia < 0 || reg.latencia > 240) return mensagemSono("O tempo para adormecer precisa ficar entre 0 e 240 minutos.", "erro");
  if (!Number.isFinite(reg.despertares) || reg.despertares < 0 || reg.despertares > 30) return mensagemSono("As vezes que acordou à noite precisam ficar entre 0 e 30.", "erro");
  if (!(reg.energia >= 1 && reg.energia <= 5)) return mensagemSono("Faltou marcar a sua energia ao acordar, de 1 a 5.", "erro");
  const noite = calcularNoite(reg);
  if (noite.naCama < 60 || noite.naCama > 960) return mensagemSono("Confira os horários: o tempo na cama ficou fora do esperado (entre 1 e 16 horas).", "erro");
  if (reg.latencia >= noite.naCama) return mensagemSono("O tempo para pegar no sono ficou maior que o tempo na cama. Confira os números.", "erro");

  const antes = calcularSequencia().atual;
  const botao = el("rs-salvar");
  botao.disabled = true;
  mensagemSono("Salvando…");
  try {
    const salvo = normalizarRegistro(await DB.salvarRegistroSono(estado.usuario, reg));
    estado.registros = [salvo, ...estado.registros.filter((r) => r.data !== salvo.data)].sort((a, b) => (a.data < b.data ? 1 : -1));
    estado.formSono = { data: salvo.data, sujo: false };
    renderizarSono();
    mensagemSono(`Noite registrada: ${formatarDuracao(noite.dormindo)} de sono, mais ou menos.${avisoGuardado()}`, "ok");
    const depois = calcularSequencia().atual;
    if (depois > antes && MARCOS_SEQUENCIA.includes(depois)) mostrarToast(`${depois} dias seguidos! Continue no seu ritmo.`, 5000);
    else mostrarToast("Noite registrada. Bom dia!");
    // Dicas ligadas ao que a pessoa registrou
    if (reg.latencia > 30) mostrarDica("cama");
    else if (reg.despertares >= 3) mostrarDica("quarto");
    else if (reg.energia <= 2) mostrarDica("horario");
  } catch (err) {
    mensagemSono(err instanceof ErroAmigavel ? err.message : "Não deu para salvar a noite agora. Tente de novo em instantes.", "erro");
  }
  botao.disabled = false;
}

/* --- Sequência (streak) ---
   Conta dias seguidos com o diário preenchido. Dias de descanso planejados
   pausam a contagem sem zerar. Hoje ainda pode ser preenchido, então não quebra. */
function calcularSequencia() {
  const feitos = new Set(estado.registros.map((r) => r.data));
  const descanso = new Set(Object.keys(estado.checkins).filter((d) => estado.checkins[d].diaDescanso));
  const hoje = hojeChave();
  if (!feitos.size) return { atual: 0, recorde: 0, feitos, descanso };
  const primeiro = [...feitos].sort()[0];

  let atual = 0;
  let dia = feitos.has(hoje) || descanso.has(hoje) ? hoje : somarDias(hoje, -1);
  while (dia >= primeiro) {
    if (feitos.has(dia)) atual += 1;
    else if (!descanso.has(dia)) break;
    dia = somarDias(dia, -1);
  }

  let recorde = 0;
  let corrida = 0;
  for (let d = primeiro; d <= hoje; d = somarDias(d, 1)) {
    if (feitos.has(d)) {
      corrida += 1;
      recorde = Math.max(recorde, corrida);
    } else if (!descanso.has(d) && d !== hoje) {
      corrida = 0;
    }
  }
  return { atual, recorde: Math.max(recorde, atual), feitos, descanso };
}

function renderizarSequencia() {
  const s = calcularSequencia();
  const hoje = hojeChave();
  el("streak-atual").textContent = s.atual;
  el("streak-texto").textContent = s.atual === 1 ? "dia seguido" : "dias seguidos";
  el("streak-recorde").textContent = `Recorde: ${plural(s.recorde, "dia", "dias")}`;

  const dias = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = somarDias(hoje, -i);
    const situacao = s.feitos.has(d) ? "feito" : s.descanso.has(d) ? "descanso" : "vazio";
    const texto = { feito: "diário preenchido", descanso: "dia de descanso", vazio: "sem registro" }[situacao];
    const rotulo = `${formatarDataCurta(d)}${d === hoje ? " (hoje)" : ""}: ${texto}`;
    dias.push(`<li data-estado="${situacao}"${d === hoje ? ' data-hoje="true"' : ""} title="${rotulo}" aria-label="${rotulo}"></li>`);
  }
  el("dias-trilha").innerHTML = dias.join("");

  const futuros = [...s.descanso].filter((d) => d >= hoje).sort();
  el("descanso-lista").innerHTML = futuros.map((d) => `
    <li>${formatarDataSemana(d)}<button type="button" data-remover-descanso="${d}" aria-label="Remover descanso de ${formatarDataLonga(d)}">×</button></li>`).join("");
  const campo = el("descanso-data");
  campo.min = hoje;
  if (!campo.value || campo.value < hoje) campo.value = somarDias(hoje, 1);
}

/* --- Tendências (semana e mês) --- */
function renderizarTendencias() {
  const dias = estado.tendDias;
  const hoje = hojeChave();
  const inicio = somarDias(hoje, -(dias - 1));
  document.querySelectorAll(".segmentado [data-dias]").forEach((b) => b.setAttribute("aria-selected", String(Number(b.dataset.dias) === dias)));

  const datas = [];
  for (let i = dias - 1; i >= 0; i -= 1) datas.push(somarDias(hoje, -i));
  const porData = new Map(estado.registros.map((r) => [r.data, r]));
  const noites = datas.filter((d) => porData.has(d)).map((d) => ({ ...porData.get(d), ...calcularNoite(porData.get(d)) }));
  const media = (lista) => (lista.length ? lista.reduce((a, b) => a + b, 0) / lista.length : null);

  const mediaSono = media(noites.map((n) => n.dormindo));
  const mediaDeitar = horarioMedio(noites.map((n) => paraMinutos(n.horaDeitar)));
  const energias = noites.map((n) => n.energia).filter(Boolean);
  const mediaEnergia = media(energias);
  // Ritual: dias do período desde a criação da conta, sem contar os de descanso
  const criadoEm = estado.usuario.criadoEm ? chaveData(new Date(estado.usuario.criadoEm)) : inicio;
  const diasRitual = datas.filter((d) => d >= criadoEm && !(estado.checkins[d] || {}).diaDescanso);
  const taxaRitual = diasRitual.length
    ? Math.round(media(diasRitual.map((d) => { const p = progressoRitual(d); return p.feitos / p.total; })) * 100)
    : null;

  el("tend-intervalo").textContent = noites.length
    ? `${formatarDataCurta(inicio)} a ${formatarDataCurta(hoje)} · ${noites.length} de ${dias} noites registradas`
    : `${formatarDataCurta(inicio)} a ${formatarDataCurta(hoje)} · nenhuma noite anotada ainda. Comece pelo registro rápido, logo acima.`;

  const kpi = (rotulo, valor, detalhe) => `<div><dt>${rotulo}</dt><dd>${valor}<small>${detalhe}</small></dd></div>`;
  el("tend-kpis").innerHTML =
    kpi("Média de sono", mediaSono == null ? "—" : formatarDuracao(Math.round(mediaSono)), "sono estimado por noite") +
    kpi("Horário médio de deitar", mediaDeitar == null ? "—" : formatarHora(mediaDeitar), "nas noites registradas") +
    kpi("Ritual concluído", taxaRitual == null ? "—" : `${taxaRitual}%`, "dos passos, por dia") +
    kpi("Energia média", mediaEnergia == null ? "—" : `${formatarMedia(mediaEnergia)}<span style="font-size:.6em"> de 5</span>`, "ao acordar");

  desenharGraficoSono(datas, porData, mediaSono);

  el("tend-tabela").innerHTML = noites.length
    ? [...noites].reverse().map((n) => `
      <tr>
        <td>${formatarDataSemana(n.data)}${n.origem !== "manual" ? ` <span class="origem">${ORIGENS[n.origem]}</span>` : ""}</td>
        <td>${n.horaDeitar}</td>
        <td>${n.horaAcordar}</td>
        <td>${n.latencia} min</td>
        <td>${n.despertares}</td>
        <td>${formatarDuracao(n.dormindo)}</td>
        <td>${energiaHtml(n.energia)}</td>
        <td>${n.humor ? `${n.humor} · ${NIVEIS_HUMOR[n.humor]}` : "—"}</td>
        <td><div class="acoes">
          <button type="button" class="link-botao" data-editar-sono="${n.data}">Editar</button>
          <button type="button" class="link-botao" data-excluir-sono="${n.data}">Excluir</button>
        </div></td>
      </tr>`).join("")
    : '<tr><td colspan="9">Nenhuma noite registrada neste período.</td></tr>';
}

/* Gráfico de barras: horas dormidas por noite, com a faixa indicada de 7h a 9h.
   Um azul só (uma série), cantos arredondados só na ponta e dica ao passar o mouse. */
function desenharGraficoSono(datas, porData, mediaSono) {
  const L = 640;
  const A = 230;
  const m = { topo: 18, dir: 10, base: 28, esq: 34 };
  const largura = L - m.esq - m.dir;
  const altura = A - m.topo - m.base;
  const maxH = 12;
  const y = (h) => m.topo + altura - (h / maxH) * altura;
  const banda = largura / datas.length;
  const barra = Math.min(24, banda * 0.62);

  let svg = `<svg viewBox="0 0 ${L} ${A}" role="img" aria-label="Horas dormidas em cada noite do período${mediaSono == null ? "" : `, média de ${formatarDuracao(Math.round(mediaSono))}`}. Os valores estão na tabela abaixo.">`;
  svg += `<rect class="gr-faixa" x="${m.esq}" y="${y(9)}" width="${largura}" height="${y(7) - y(9)}" />`;
  [0, 3, 6, 9, 12].forEach((h) => {
    svg += `<line class="gr-grade" x1="${m.esq}" x2="${L - m.dir}" y1="${y(h)}" y2="${y(h)}" />`;
    svg += `<text class="gr-eixo" x="${m.esq - 6}" y="${y(h) + 4}" text-anchor="end">${h}h</text>`;
  });
  svg += `<text class="gr-faixa-rotulo" x="${L - m.dir - 4}" y="${y(9) - 5}" text-anchor="end">Faixa indicada: 7h a 9h</text>`;

  datas.forEach((d, i) => {
    const cx = m.esq + banda * i + banda / 2;
    const data = lerData(d);
    const rotulo = datas.length <= 7
      ? `${data.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")} ${data.getDate()}`
      : (i % 5 === 0 || i === datas.length - 1 ? String(data.getDate()) : "");
    if (rotulo) svg += `<text class="gr-eixo" x="${cx.toFixed(1)}" y="${A - 8}" text-anchor="middle">${rotulo}</text>`;

    const reg = porData.get(d);
    if (reg) {
      const n = calcularNoite(reg);
      const topo = y(Math.min(maxH, n.dormindo / 60));
      const base = y(0);
      const r = Math.min(4, (base - topo) / 2);
      const x0 = cx - barra / 2;
      const caminho = `M${x0.toFixed(1)},${base} V${(topo + r).toFixed(1)} Q${x0.toFixed(1)},${topo.toFixed(1)} ${(x0 + r).toFixed(1)},${topo.toFixed(1)} H${(x0 + barra - r).toFixed(1)} Q${(x0 + barra).toFixed(1)},${topo.toFixed(1)} ${(x0 + barra).toFixed(1)},${(topo + r).toFixed(1)} V${base} Z`;
      const dica = `${formatarDataSemana(d)}: ${formatarDuracao(n.dormindo)} de sono · deitou às ${reg.horaDeitar}`;
      svg += `<rect class="gr-alvo" x="${(cx - banda / 2).toFixed(1)}" y="${m.topo}" width="${banda.toFixed(1)}" height="${altura}" data-tip="${escaparHtml(dica)}" data-x="${cx.toFixed(1)}" data-y="${topo.toFixed(1)}" />`;
      svg += `<path class="gr-barra" d="${caminho}" />`;
    } else {
      svg += `<rect class="gr-alvo" x="${(cx - banda / 2).toFixed(1)}" y="${m.topo}" width="${banda.toFixed(1)}" height="${altura}" data-tip="${escaparHtml(`${formatarDataSemana(d)}: sem registro`)}" data-x="${cx.toFixed(1)}" data-y="${y(0) - 6}" />`;
      svg += `<circle class="gr-vazio" cx="${cx.toFixed(1)}" cy="${y(0) - 3}" r="2.5" />`;
    }
  });
  svg += "</svg>";
  el("tend-grafico").innerHTML = `${svg}<div class="dica-grafico" id="dica-grafico" hidden></div>`;
}

/* --- Lembretes ---
   No navegador, os avisos funcionam enquanto o site estiver aberto em uma aba.
   E-mail, WhatsApp e Telegram precisam de um serviço no servidor (Edge Function
   agendada lendo lembrete_* e canais_lembrete da tabela perfis). */
const CHAVE_AVISOS = "ritmo_avisos";

function notificacoesDisponiveis() {
  return "Notification" in window;
}

function atualizarEstadoNotificacao() {
  const texto = el("lb-estado");
  const botao = el("lb-permitir");
  if (!notificacoesDisponiveis()) {
    botao.hidden = true;
    texto.textContent = "Este navegador não mostra notificações. Os avisos aparecem dentro do próprio Ritmo.";
    return;
  }
  const permissao = Notification.permission;
  botao.hidden = permissao !== "default";
  texto.textContent = permissao === "granted"
    ? "Pronto, as notificações estão liberadas neste navegador."
    : permissao === "denied"
      ? "As notificações estão bloqueadas. Para receber, libere nas configurações do navegador. Os avisos também aparecem dentro do Ritmo."
      : "";
}

async function pedirPermissaoNotificacao() {
  if (notificacoesDisponiveis() && Notification.permission === "default") {
    try { await Notification.requestPermission(); } catch (e) { /* o navegador recusou o pedido */ }
  }
  atualizarEstadoNotificacao();
}

function renderizarLembretes() {
  const u = estado.usuario;
  el("lb-ritual").checked = u.lembreteRitual;
  el("lb-diario").checked = u.lembreteDiario;
  el("lb-hora-diario").value = u.horaLembreteDiario;
  el("lb-canal-navegador").checked = u.canaisLembrete.includes("navegador");
  const inicio = (resumoDoDia(hojeChave()).deitar - RITUAL_MINUTOS + 1440) % 1440;
  el("lb-ritual-hora").textContent = `Hoje às ${formatarHora(inicio)}, ${RITUAL_MINUTOS} minutos antes de deitar`;
  atualizarEstadoNotificacao();
}

async function salvarLembretes(campos) {
  const msg = el("lb-msg");
  Object.assign(estado.usuario, campos);
  try {
    await DB.salvarPerfil(estado.usuario, campos);
    msg.className = "form-msg ok";
    msg.textContent = "Lembretes salvos.";
  } catch (err) {
    msg.className = "form-msg erro";
    msg.textContent = err instanceof ErroAmigavel ? err.message : "Não deu para salvar os lembretes agora. Tente de novo em instantes.";
  }
}

function jaAvisou(chave) {
  return Boolean(armazenamento.ler(CHAVE_AVISOS, {})[chave]);
}

function marcarAviso(chave) {
  const hoje = hojeChave();
  const avisos = armazenamento.ler(CHAVE_AVISOS, {});
  Object.keys(avisos).forEach((k) => { if (!k.endsWith(hoje)) delete avisos[k]; }); // guarda só os de hoje
  avisos[chave] = true;
  armazenamento.gravar(CHAVE_AVISOS, avisos);
}

function avisar(titulo, texto, pagina) {
  const u = estado.usuario;
  if (u.canaisLembrete.includes("navegador") && notificacoesDisponiveis() && Notification.permission === "granted") {
    try {
      const n = new Notification(titulo, { body: texto, tag: `ritmo-${pagina}` });
      n.onclick = () => { window.focus(); irPara(pagina); n.close(); };
    } catch (e) { /* alguns navegadores só notificam por service worker */ }
  }
  mostrarToast(`${titulo} ${texto}`, 9000);
}

/* Roda a cada 30 s: ritual (até 15 min depois do início) e diário da manhã (até 3 h depois) */
function verificarLembretes() {
  const u = estado.usuario;
  if (!estado.pronto || !u) return;
  const agora = new Date();
  const hoje = hojeChave();
  const minutos = agora.getHours() * 60 + agora.getMinutes();

  if (u.lembreteRitual) {
    const inicio = (resumoDoDia(hoje).deitar - RITUAL_MINUTOS + 1440) % 1440;
    const passou = (minutos - inicio + 1440) % 1440;
    if (passou < 15 && !jaAvisou(`ritual-${hoje}`)) {
      marcarAviso(`ritual-${hoje}`);
      avisar("Hora de desacelerar", `Faltam ${RITUAL_MINUTOS} minutos para deitar. Que tal diminuir as luzes e deixar o celular de lado?`, "sono");
    }
  }
  if (u.lembreteDiario && !estado.registros.some((r) => r.data === hoje)) {
    const passou = minutos - paraMinutos(u.horaLembreteDiario);
    if (passou >= 0 && passou < 180 && !jaAvisou(`diario-${hoje}`)) {
      marcarAviso(`diario-${hoje}`);
      avisar("Bom dia! Como foi a noite?", "Conte no registro rápido. Leva menos de um minuto.", "sono");
    }
  }
}

function iniciarSono() {
  const form = el("form-sono");

  /* Registro rápido */
  form.addEventListener("input", (e) => {
    if (e.target.id === "rs-data") return;
    estado.formSono.sujo = true;
    atualizarResumoNoite();
  });
  el("rs-data").addEventListener("change", (e) => {
    if (dataValida(e.target.value)) {
      mensagemSono("");
      preencherFormSono(e.target.value);
    }
  });
  form.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-ajuste]");
    if (!botao) return;
    const campo = el(botao.dataset.ajuste);
    campo.value = Math.min(Number(campo.max), Math.max(Number(campo.min), (Number(campo.value) || 0) + Number(botao.dataset.passo)));
    estado.formSono.sujo = true;
    atualizarResumoNoite();
  });
  el("rs-energia").addEventListener("change", (e) => {
    if (e.target.name === "energia") definirEnergia(Number(e.target.value));
  });
  form.addEventListener("submit", salvarRegistroDoForm);

  /* Tabela: editar ou excluir (a exclusão pede um segundo toque para confirmar) */
  el("tend-tabela").addEventListener("click", async (e) => {
    const editar = e.target.closest("[data-editar-sono]");
    if (editar) {
      mensagemSono("");
      preencherFormSono(editar.dataset.editarSono);
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      el("rs-deitar").focus({ preventScroll: true });
      return;
    }
    const excluir = e.target.closest("[data-excluir-sono]");
    if (!excluir || !estado.usuario) return;
    if (excluir.dataset.confirmar !== "1") {
      excluir.dataset.confirmar = "1";
      excluir.textContent = "Confirmar exclusão";
      setTimeout(() => {
        if (excluir.isConnected) { excluir.dataset.confirmar = ""; excluir.textContent = "Excluir"; }
      }, 4000);
      return;
    }
    const data = excluir.dataset.excluirSono;
    try {
      await DB.excluirRegistroSono(estado.usuario, data);
      estado.registros = estado.registros.filter((r) => r.data !== data);
      if (estado.formSono.data === data) estado.formSono.sujo = false;
      renderizarSono();
      mostrarToast("Noite apagada do diário.");
    } catch (err) {
      mostrarToast(err instanceof ErroAmigavel ? err.message : "Não deu para apagar agora. Tente de novo em instantes.");
    }
  });

  /* Tendências: semana ou mês, e dica ao passar o mouse no gráfico */
  document.querySelectorAll(".segmentado [data-dias]").forEach((b) => b.addEventListener("click", () => {
    estado.tendDias = Number(b.dataset.dias);
    renderizarTendencias();
  }));
  const grafico = el("tend-grafico");
  grafico.addEventListener("pointermove", (e) => {
    const dica = el("dica-grafico");
    if (!dica) return;
    const alvo = e.target.closest("[data-tip]");
    if (!alvo) { dica.hidden = true; return; }
    const caixa = grafico.getBoundingClientRect();
    const escala = caixa.width / 640;
    dica.textContent = alvo.dataset.tip;
    dica.style.left = `${Math.min(caixa.width - 90, Math.max(90, Number(alvo.dataset.x) * escala))}px`;
    dica.style.top = `${Number(alvo.dataset.y) * escala}px`;
    dica.hidden = false;
  });
  grafico.addEventListener("pointerleave", () => { const d = el("dica-grafico"); if (d) d.hidden = true; });

  /* Dias de descanso */
  el("descanso-add").addEventListener("click", async () => {
    const msg = el("descanso-msg");
    const d = el("descanso-data").value;
    const hoje = hojeChave();
    msg.className = "form-msg erro";
    if (!dataValida(d)) { msg.textContent = "Escolha o dia de descanso."; return; }
    if (d < hoje) { msg.textContent = "Dias de descanso são planejados: escolha hoje ou um dia mais para frente."; return; }
    if ((estado.checkins[d] || {}).diaDescanso) { msg.textContent = "Esse dia já está reservado para descansar."; return; }
    const inicioSemana = somarDias(d, -lerData(d).getDay());
    const fimSemana = somarDias(inicioSemana, 6);
    const naSemana = Object.keys(estado.checkins).filter((x) => estado.checkins[x].diaDescanso && x >= inicioSemana && x <= fimSemana).length;
    if (naSemana >= LIMITE_DESCANSO_SEMANA) { msg.textContent = `Você já reservou ${LIMITE_DESCANSO_SEMANA} dias de descanso nessa semana, o máximo permitido.`; return; }
    try {
      await DB.salvarCheckin(estado.usuario, d, { diaDescanso: true });
      estado.checkins[d] = { ritualConcluidos: [], diaDescanso: false, ...estado.checkins[d], diaDescanso: true };
      msg.textContent = "";
      renderizarSequencia();
      mostrarToast(`Combinado: ${formatarDataLonga(d).toLowerCase()} é dia de descanso.`);
    } catch (err) {
      msg.textContent = err instanceof ErroAmigavel ? err.message : "Não deu para planejar o descanso agora. Tente de novo em instantes.";
    }
  });
  el("descanso-lista").addEventListener("click", async (e) => {
    const botao = e.target.closest("[data-remover-descanso]");
    if (!botao || !estado.usuario) return;
    const d = botao.dataset.removerDescanso;
    try {
      await DB.salvarCheckin(estado.usuario, d, { diaDescanso: false });
      estado.checkins[d] = { ...estado.checkins[d], diaDescanso: false };
      renderizarSequencia();
      mostrarToast("Dia de descanso desmarcado.");
    } catch (err) {
      mostrarToast(err instanceof ErroAmigavel ? err.message : "Não deu para desmarcar agora. Tente de novo em instantes.");
    }
  });

  /* Lembretes */
  el("lb-ritual").addEventListener("change", (e) => {
    salvarLembretes({ lembreteRitual: e.target.checked });
    if (e.target.checked) pedirPermissaoNotificacao();
  });
  el("lb-diario").addEventListener("change", (e) => {
    salvarLembretes({ lembreteDiario: e.target.checked });
    if (e.target.checked) pedirPermissaoNotificacao();
  });
  el("lb-hora-diario").addEventListener("change", (e) => {
    if (horaValida(e.target.value)) salvarLembretes({ horaLembreteDiario: e.target.value });
  });
  el("lb-canal-navegador").addEventListener("change", (e) => {
    const outros = estado.usuario.canaisLembrete.filter((c) => c !== "navegador");
    salvarLembretes({ canaisLembrete: e.target.checked ? ["navegador", ...outros] : outros });
  });
  el("lb-permitir").addEventListener("click", pedirPermissaoNotificacao);
}

/* =========================================================
   ESCALAS DE 1 A 5 EM BOLINHAS (tensão em lilás, humor em verde)
   ========================================================= */
const NIVEIS_TENSAO = { 1: "Nenhum", 2: "Baixo", 3: "Moderado", 4: "Alto", 5: "Muito alto" };
const NIVEIS_HUMOR = { 1: "Muito ruim", 2: "Ruim", 3: "Neutro", 4: "Bom", 5: "Muito bom" };
const ROTULOS_ESCALA = { tensao: NIVEIS_TENSAO, humor: NIVEIS_HUMOR };

/* Marca o nível n (0 = vazio) numa escala e atualiza o texto ao lado */
function definirEscala(id, n) {
  const grupo = el(id);
  grupo.dataset.nivel = n || 0;
  grupo.querySelectorAll('input[type="radio"]').forEach((r) => { r.checked = Number(r.value) === n; });
  const rotulos = ROTULOS_ESCALA[grupo.dataset.rotulos] || NIVEIS_TENSAO;
  const texto = el(`${id}-texto`);
  if (!texto) return;
  if (id === "rs-humor") texto.textContent = n ? `${n} de 5 · ${rotulos[n]}` : "Como você se sentiu emocionalmente ao acordar.";
  else texto.textContent = n ? `${n} · ${rotulos[n]}` : "—";
}

function bolinhasHtml(valor, classe) {
  const n = Math.round(valor);
  return `<span class="mini-bolas ${classe}" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "cheia" : ""}"></i>`).join("")}</span>`;
}

/* =========================================================
   CHECK-IN EMOCIONAL (pré e pós-sono)
   À noite: estresse, ansiedade e fadiga mental (1 a 5), salvos em
   checkins_diarios na data da noite. De manhã: humor ao acordar (1 a 5),
   no registro de sono da data em que acordou. A noite D é comparada
   com o registro da manhã D + 1.
   ========================================================= */
const ESCALAS_EMOCIONAIS = [
  { id: "estresse", campo: "estresseNoite", nome: "Estresse" },
  { id: "ansiedade", campo: "ansiedadeNoite", nome: "Ansiedade" },
  { id: "fadiga", campo: "fadigaNoite", nome: "Fadiga mental" },
];

/* Antes das 5h da manhã ainda conta como a noite anterior */
function noiteAtual() {
  return new Date().getHours() < 5 ? somarDias(hojeChave(), -1) : hojeChave();
}

/* Tensão da noite: média de estresse, ansiedade e fadiga mental */
function tensaoDaNoite(chave) {
  const c = estado.checkins[chave] || {};
  const valores = ESCALAS_EMOCIONAIS.map((e) => c[e.campo]).filter(Boolean);
  return valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
}

/* Noites com check-in à noite e humor na manhã seguinte, mais recentes primeiro */
function paresNoiteManha() {
  return estado.registros
    .map((r) => {
      const noite = somarDias(r.data, -1);
      return { r, noite, tensao: tensaoDaNoite(noite), humor: r.humor, sono: calcularNoite(r).dormindo };
    })
    .filter((p) => p.tensao != null && p.humor);
}

function renderizarEmocional() {
  const noite = noiteAtual();
  const c = estado.checkins[noite] || {};
  el("emo-noite-data").textContent = noite === hojeChave() ? "hoje à noite" : `noite de ${formatarDataSemana(noite)}`;
  if (!estado.emocionalSujo) ESCALAS_EMOCIONAIS.forEach((e) => definirEscala(`emo-${e.id}`, c[e.campo] || 0));
  const feito = ESCALAS_EMOCIONAIS.every((e) => c[e.campo]);
  el("emo-selo").textContent = feito ? "Check-in da noite feito" : "";
  el("emo-salvar").textContent = feito ? "Atualizar check-in da noite" : "Salvar check-in da noite";
  renderizarComparacao();
  renderizarHistoricoEmocional();
}

function renderizarComparacao() {
  const pares = paresNoiteManha();
  const alvo = el("emo-comparacao");
  if (!pares.length) {
    alvo.innerHTML = '<p class="secao-sub">Faça o check-in à noite e marque o humor ao acordar no registro rápido. Depois da primeira noite completa, a comparação aparece aqui.</p>';
    return;
  }
  const media = (lista) => lista.reduce((a, b) => a + b, 0) / lista.length;
  const itens = pares.slice(0, 1).map((p) => `
    <li class="par">
      <span class="par-data">${formatarDataSemana(p.noite)} → ${formatarDataSemana(p.r.data)}</span>
      <span class="par-valor">${bolinhasHtml(p.tensao, "tensao")} Tensão ${formatarMedia(p.tensao)}</span>
      <span class="seta" aria-hidden="true">→</span>
      <span class="par-valor">${bolinhasHtml(p.humor, "humor")} Humor ${p.humor}</span>
      <span class="par-sono">${formatarDuracao(p.sono)} de sono entre uma e outra</span>
    </li>`).join("");

  const insights = [
    `Em média, sua tensão antes de dormir foi <strong>${formatarMedia(media(pares.map((p) => p.tensao)))}</strong> e seu humor ao acordar foi <strong>${formatarMedia(media(pares.map((p) => p.humor)))}</strong>, na escala de 1 a 5.`,
  ];
  const comSono = pares.filter((p) => p.sono >= SONO_MINIMO_MINUTOS);
  const poucoSono = pares.filter((p) => p.sono < SONO_MINIMO_MINUTOS);
  if (comSono.length && poucoSono.length) {
    insights.push(`Depois de noites com 7h ou mais de sono, seu humor ao acordar foi <strong>${formatarMedia(media(comSono.map((p) => p.humor)))}</strong>. Com menos de 7h, foi <strong>${formatarMedia(media(poucoSono.map((p) => p.humor)))}</strong>.`);
  }
  const tensas = pares.filter((p) => p.tensao >= 4);
  if (tensas.length === 1) {
    const h = tensas[0].humor;
    insights.push(`Na noite em que você foi dormir com tensão alta (4 ou mais), acordou com humor <strong>${h}</strong> (${NIVEIS_HUMOR[h].toLowerCase()}) depois de ${formatarDuracao(tensas[0].sono)} de sono.`);
  } else if (tensas.length > 1) {
    const aliviou = tensas.filter((p) => p.humor >= 3).length;
    const quantas = aliviou === 0 ? "Em nenhuma delas" : aliviou === tensas.length ? "Em todas elas" : `Em ${aliviou} delas`;
    insights.push(`Em ${tensas.length} noites você foi dormir com tensão alta (4 ou mais). ${quantas}, o sono trouxe o humor de volta ao neutro ou melhor.`);
  }
  alvo.innerHTML = `
    <p class="rotulo-sec">Última noite completa</p>
    <ol class="pares" aria-label="Última noite com check-in completo">${itens}</ol>
    <ul class="insights">${insights.map((t) => `<li>${t}</li>`).join("")}</ul>
    ${pares.length < 3 ? '<p class="secao-sub" style="margin: 12px 0 0;">Com mais algumas noites anotadas, a comparação fica mais confiável.</p>' : ""}
    <p class="secao-sub" style="margin: 12px 0 0;">Tensão é a média de estresse, ansiedade e fadiga mental. São percepções suas, não um diagnóstico.</p>`;
}

function iniciarEmocional() {
  /* Qualquer escala de bolinhas: marca o nível ao tocar */
  document.addEventListener("change", (e) => {
    const grupo = e.target.closest(".escala-bolas");
    if (grupo && e.target.type === "radio") definirEscala(grupo.id, Number(e.target.value));
  });
  el("form-emocional").addEventListener("change", () => { estado.emocionalSujo = true; });
  el("form-emocional").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!estado.usuario) return;
    const msg = el("emo-msg");
    const campos = {};
    ESCALAS_EMOCIONAIS.forEach((esc) => { campos[esc.campo] = Number(el(`emo-${esc.id}`).dataset.nivel) || null; });
    if (Object.values(campos).some((v) => !v)) {
      msg.className = "form-msg erro";
      msg.textContent = "Faltou marcar algum: estresse, ansiedade e fadiga mental.";
      return;
    }
    const botao = el("emo-salvar");
    botao.disabled = true;
    const ok = await atualizarCheckin(noiteAtual(), campos, () => {});
    botao.disabled = false;
    if (!ok) return;
    estado.emocionalSujo = false;
    renderizarEmocional();
    msg.className = "form-msg ok";
    msg.textContent = `Check-in salvo. Boa noite! Amanhã, conte como acordou no registro rápido.${avisoGuardado()}`;
    if (campos.ansiedadeNoite >= 4 || campos.estresseNoite >= 4) mostrarDica("respiracao");
  });
}

/* =========================================================
   HISTÓRICO EMOCIONAL (tabela do check-in, ligada ao registro rápido)
   Cada linha é uma noite com check-in. A manhã seguinte vem do registro rápido
   (registros_sono da data seguinte): sono, humor e energia ao acordar.
   Resultado da noite: compara a calma ao deitar (6 − tensão) com o humor ao
   acordar, na mesma escala de 1 a 5.
   - Melhorou: acordou 1 ponto ou mais acima de como foi dormir.
   - Estável: diferença menor que 1 ponto.
   - Piorou: acordou 1 ponto ou mais abaixo.
   ========================================================= */
const LIMITE_LINHAS_EMOCIONAIS = 60;

function resultadoNoite(tensao, humor) {
  if (tensao == null || !humor) return null;
  const variacao = Math.round((humor - (6 - tensao)) * 10) / 10;
  if (variacao >= 1) return { variacao, tipo: "melhorou", texto: "Melhorou", seta: "↑" };
  if (variacao <= -1) return { variacao, tipo: "piorou", texto: "Piorou", seta: "↓" };
  return { variacao, tipo: "estavel", texto: "Estável", seta: "→" };
}

/* +1,3 / −0,7 / ±0,0 */
function comSinal(valor) {
  return (valor > 0 ? "+" : valor < 0 ? "−" : "±") + formatarMedia(Math.abs(valor));
}

function resultadoHtml(res) {
  return `<span class="resultado ${res.tipo}"><span aria-hidden="true">${res.seta}</span> ${res.texto} <b>${comSinal(res.variacao)}</b></span>`;
}

function linhasEmocionais(dias) {
  const inicio = dias ? somarDias(hojeChave(), -dias) : "0000-00-00";
  return Object.keys(estado.checkins)
    .filter((noite) => noite >= inicio && tensaoDaNoite(noite) != null)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((noite) => {
      const manha = somarDias(noite, 1);
      const registro = estado.registros.find((r) => r.data === manha) || null;
      const tensao = tensaoDaNoite(noite);
      const n = registro ? calcularNoite(registro) : null;
      return {
        noite, manha, registro, tensao,
        checkin: estado.checkins[noite],
        sono: n ? n.dormindo : null,
        eficiencia: n ? n.eficiencia : null,
        humor: registro ? registro.humor : null,
        energia: registro ? registro.energia : null,
        resultado: resultadoNoite(tensao, registro && registro.humor),
      };
    });
}

function renderizarHistoricoEmocional() {
  const dias = estado.emoPeriodo;
  document.querySelectorAll("[data-emo-periodo]").forEach((b) => b.setAttribute("aria-selected", String(Number(b.dataset.emoPeriodo) === dias)));
  const linhas = linhasEmocionais(dias);
  const completas = linhas.filter((l) => l.resultado);
  const media = (lista) => (lista.length ? lista.reduce((a, b) => a + b, 0) / lista.length : null);

  // Números do período
  const melhorou = completas.filter((l) => l.resultado.tipo === "melhorou").length;
  const variacaoMedia = media(completas.map((l) => l.resultado.variacao));
  const comSono = media(completas.filter((l) => l.sono >= SONO_MINIMO_MINUTOS).map((l) => l.resultado.variacao));
  const poucoSono = media(completas.filter((l) => l.sono < SONO_MINIMO_MINUTOS).map((l) => l.resultado.variacao));
  el("emo-kpis").innerHTML = `
    <div><dt>Noites com check-in</dt><dd>${linhas.length}</dd><small>${plural(completas.length, "com a manhã registrada", "com a manhã registrada")}</small></div>
    <div><dt>Acordou melhor</dt><dd>${completas.length ? `${melhorou} de ${completas.length}` : "—"}</dd><small>${completas.length ? `${Math.round((melhorou / completas.length) * 100)}% das noites completas` : "Registre a manhã seguinte"}</small></div>
    <div><dt>Resultado médio</dt><dd>${variacaoMedia == null ? "—" : comSinal(variacaoMedia)}</dd><small>humor ao acordar − calma ao deitar</small></div>
    <div><dt>Depois de 7h ou mais</dt><dd>${comSono == null ? "—" : comSinal(comSono)}</dd><small>${poucoSono == null ? "sem noites curtas para comparar" : `com menos de 7h: ${comSinal(poucoSono)}`}</small></div>`;

  const corpo = el("emo-tabela");
  if (!linhas.length) {
    corpo.innerHTML = `<tr><td colspan="7" class="tabela-vazia">Nenhum check-in ${dias ? `nos últimos ${dias} dias` : "ainda"}. Faça o check-in à noite e conte como acordou na manhã seguinte: o resultado aparece aqui.</td></tr>`;
    el("emo-tabela-nota").textContent = "";
    return;
  }
  const hoje = hojeChave();
  corpo.innerHTML = linhas.slice(0, LIMITE_LINHAS_EMOCIONAIS).map((l) => {
    const c = l.checkin;
    const valor = (v) => (v ? v : "—");
    const registrar = (texto) => `<button class="link-acao" type="button" data-registrar-manha="${l.manha}">${texto}</button>`;
    const sono = l.registro
      ? `${formatarDuracao(l.sono)}<small>${l.eficiencia}% · ${l.registro.horaDeitar} às ${l.registro.horaAcordar}</small>`
      : (l.manha > hoje ? '<span class="tabela-espera">Amanhã de manhã</span>' : registrar("Registrar a manhã"));
    const humor = l.humor
      ? `${bolinhasHtml(l.humor, "humor")} ${l.humor}<small>${NIVEIS_HUMOR[l.humor]}</small>`
      : (l.registro ? registrar("Marcar o humor") : "—");
    const resultado = l.resultado
      ? resultadoHtml(l.resultado)
      : `<span class="resultado pendente">${l.registro ? "Falta o humor" : "Aguardando a manhã"}</span>`;
    return `
      <tr>
        <th scope="row">${formatarDataSemana(l.noite)}<small>manhã de ${formatarDataSemana(l.manha)}</small></th>
        <td>${valor(c.estresseNoite)} · ${valor(c.ansiedadeNoite)} · ${valor(c.fadigaNoite)}</td>
        <td>${bolinhasHtml(l.tensao, "tensao")} ${formatarMedia(l.tensao)}</td>
        <td>${sono}</td>
        <td>${humor}</td>
        <td>${l.energia ? `${l.energia} de 5` : "—"}</td>
        <td>${resultado}</td>
      </tr>`;
  }).join("");
  el("emo-tabela-nota").textContent = linhas.length > LIMITE_LINHAS_EMOCIONAIS
    ? `Mostrando as ${LIMITE_LINHAS_EMOCIONAIS} noites mais recentes de ${linhas.length}.`
    : "";
}

/* No registro rápido: mostra o check-in da noite anterior e o resultado com o humor marcado */
function atualizarLigacaoCheckin() {
  const alvo = el("rs-checkin");
  const data = el("rs-data").value;
  if (!estado.usuario || !dataValida(data)) { alvo.hidden = true; return; }
  const noite = somarDias(data, -1);
  const tensao = tensaoDaNoite(noite);
  alvo.hidden = false;
  if (tensao == null) {
    alvo.dataset.estado = "sem";
    alvo.innerHTML = `Sem check-in emocional na noite de ${formatarDataSemana(noite)}. Na próxima, faça o check-in antes de dormir para ver, de manhã, o efeito da noite no seu humor.`;
    return;
  }
  const c = estado.checkins[noite];
  const marcado = el("form-sono").querySelector('input[name="humor"]:checked');
  const res = resultadoNoite(tensao, marcado ? Number(marcado.value) : 0);
  alvo.dataset.estado = "com";
  alvo.innerHTML = `<strong>Check-in da noite anterior:</strong> tensão ${formatarMedia(tensao)} (estresse ${c.estresseNoite || "—"}, ansiedade ${c.ansiedadeNoite || "—"}, fadiga mental ${c.fadigaNoite || "—"}). ` +
    (res ? `Com o humor marcado, o resultado da noite é ${resultadoHtml(res)}.` : "Marque como você acordou para ver o resultado da noite.");
}

function iniciarHistoricoEmocional() {
  document.querySelectorAll("[data-emo-periodo]").forEach((b) => b.addEventListener("click", () => {
    estado.emoPeriodo = Number(b.dataset.emoPeriodo);
    renderizarHistoricoEmocional();
  }));
  // "Registrar a manhã" / "Marcar o humor": abre o registro rápido na data certa
  el("emo-tabela").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-registrar-manha]");
    if (!botao) return;
    preencherFormSono(botao.dataset.registrarManha);
    mensagemSono(`Registrando a manhã de ${formatarDataSemana(botao.dataset.registrarManha)}.`);
    el("titulo-registro").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    const humor = el("form-sono").querySelector('input[name="humor"]');
    const reg = estado.registros.find((r) => r.data === botao.dataset.registrarManha);
    (reg ? humor : el("rs-deitar")).focus({ preventScroll: true });
  });
}

/* =========================================================
   RELATÓRIO DE SONO (PDF e CSV)
   PDF: o relatório é montado em HTML e impresso pelo navegador
   ("Salvar como PDF"); o CSS de impressão esconde o resto do site.
   CSV: separado por ponto e vírgula e com vírgula decimal, como o Excel
   em português espera, e com BOM para manter os acentos.
   ========================================================= */
const numeroBR = (valor, casas = 1) => valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

function periodoRelatorio() {
  const dias = Number((document.querySelector('input[name="rel-periodo"]:checked') || {}).value || 30);
  const hoje = hojeChave();
  const maisAntigo = estado.registros.length ? estado.registros[estado.registros.length - 1].data : hoje;
  const inicio = dias ? somarDias(hoje, -(dias - 1)) : maisAntigo;
  const rotulo = `${dias ? `últimos ${dias} dias` : "todo o histórico"} (${formatarDataCurta(inicio)} a ${formatarDataCurta(hoje)})`;
  return { inicio, rotulo };
}

/* Uma linha por noite, da mais antiga para a mais recente.
   A noite que terminou na data D começa no dia D − 1: dele vêm o check-in (emoções, ritual,
   rotina mínima, água, descanso) e o sono recomendado pela rotina daquele dia. */
function linhasRelatorio(inicio) {
  return estado.registros
    .filter((r) => r.data >= inicio)
    .sort((a, b) => (a.data < b.data ? -1 : 1))
    .map((r) => {
      const noite = somarDias(r.data, -1);
      const c = estado.checkins[noite] || {};
      const ritual = estado.checkins[noite] ? progressoRitual(noite) : null;
      const n = calcularNoite(r);
      const dia = resumoDoDia(noite);
      const tensao = tensaoDaNoite(noite);
      return {
        r, n, c,
        ritual: ritual ? Math.round((ritual.feitos / ritual.total) * 100) : null,
        recomendado: dia.sono,                  // minutos de sono que a rotina do dia pedia
        diferenca: n.dormindo - dia.sono,       // + dormiu mais, − dormiu menos que o recomendado
        cargaDia: dia.total ? dia.media : null, // esforço médio dos eventos do dia (1 a 3)
        tensao,
        resultado: resultadoNoite(tensao, r.humor),
      };
    });
}

/* Minutos com sinal: +15 min, −1h05 */
function duracaoComSinal(min) {
  const sinal = min > 0 ? "+" : min < 0 ? "−" : "±";
  const abs = Math.abs(Math.round(min));
  return sinal + (abs < 60 ? `${abs} min` : formatarDuracao(abs));
}

function gerarCsv(linhas) {
  const cabecalho = [
    "Data em que acordou", "Hora de deitar", "Hora de acordar", "Tempo na cama (min)", "Tempo para adormecer (min)",
    "Despertares", "Sono estimado (min)", "Sono estimado (h)", "Sono recomendado pela rotina (min)",
    "Diferença para o recomendado (min)", "Eficiência (%)", "Energia ao acordar (1-5)", "Humor ao acordar (1-5)",
    "Estresse antes de dormir (1-5)", "Ansiedade antes de dormir (1-5)", "Fadiga mental antes de dormir (1-5)",
    "Tensão antes de dormir (média 1-5)", "Resultado da noite", "Resultado (pontos)", "Ritual concluído na noite (%)",
    "Rotina mínima no dia", "Dia de descanso planejado", "Copos de água no dia", "Esforço médio da rotina no dia (1-3)", "Origem",
  ];
  // Protege a planilha contra fórmulas (texto que começa com = + - @); números negativos passam
  const celula = (valor) => {
    let t = valor == null ? "" : String(valor);
    if (/^[=+@]/.test(t) || /^-(?![\d,.]+$)/.test(t)) t = `'${t}`;
    return /[;"\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const simNao = (v) => (v ? "Sim" : "Não");
  const corpo = linhas.map((l) => {
    const { r, n, c } = l;
    return [
      formatarDataCurta(r.data), r.horaDeitar, r.horaAcordar, n.naCama, r.latencia, r.despertares, n.dormindo,
      numeroBR(n.dormindo / 60, 2), l.recomendado, l.diferenca, n.eficiencia, r.energia, r.humor,
      c.estresseNoite, c.ansiedadeNoite, c.fadigaNoite, l.tensao == null ? null : numeroBR(l.tensao, 1),
      l.resultado ? l.resultado.texto : null, l.resultado ? numeroBR(l.resultado.variacao, 1) : null, l.ritual,
      simNao(c.modoMinimo), simNao(c.diaDescanso), c.aguaCopos || null,
      l.cargaDia == null ? null : numeroBR(l.cargaDia, 1), ORIGENS[r.origem],
    ].map(celula).join(";");
  });
  return "﻿" + [cabecalho.map(celula).join(";"), ...corpo].join("\r\n");
}

function resumoRelatorio(linhas) {
  const media = (lista) => {
    const v = lista.filter((x) => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const completas = linhas.filter((l) => l.resultado);
  const comSono = completas.filter((l) => l.n.dormindo >= SONO_MINIMO_MINUTOS).map((l) => l.resultado.variacao);
  const poucoSono = completas.filter((l) => l.n.dormindo < SONO_MINIMO_MINUTOS).map((l) => l.resultado.variacao);
  const sequencia = calcularSequencia();
  const comAgua = linhas.filter((l) => l.c.aguaCopos > 0).map((l) => l.c.aguaCopos);
  return {
    noites: linhas.length,
    sono: media(linhas.map((l) => l.n.dormindo)),
    recomendado: media(linhas.map((l) => l.recomendado)),
    diferenca: media(linhas.map((l) => l.diferenca)),
    atingiu: linhas.filter((l) => l.diferenca >= 0).length,
    deitar: horarioMedio(linhas.map((l) => paraMinutos(l.r.horaDeitar))),
    acordar: horarioMedio(linhas.map((l) => paraMinutos(l.r.horaAcordar))),
    latencia: media(linhas.map((l) => l.r.latencia)),
    despertares: media(linhas.map((l) => l.r.despertares)),
    eficiencia: media(linhas.map((l) => l.n.eficiencia)),
    energia: media(linhas.map((l) => l.r.energia)),
    humor: media(linhas.map((l) => l.r.humor)),
    tensao: media(linhas.map((l) => l.tensao)),
    checkins: linhas.filter((l) => l.tensao != null).length,
    completas: completas.length,
    melhorou: completas.filter((l) => l.resultado.tipo === "melhorou").length,
    piorou: completas.filter((l) => l.resultado.tipo === "piorou").length,
    resultado: media(completas.map((l) => l.resultado.variacao)),
    resultadoComSono: media(comSono),
    resultadoPoucoSono: media(poucoSono),
    ritual: media(linhas.map((l) => l.ritual)),
    diasMinimo: linhas.filter((l) => l.c.modoMinimo).length,
    diasDescanso: linhas.filter((l) => l.c.diaDescanso).length,
    agua: media(comAgua),
    diasAgua: comAgua.length,
    carga: media(linhas.map((l) => l.cargaDia)),
    sequencia: sequencia.atual,
    recorde: sequencia.recorde,
  };
}

function htmlRelatorio(linhas, rotuloPeriodo) {
  const s = resumoRelatorio(linhas);
  const ou = (valor, formato) => (valor == null ? "—" : formato(valor));
  const item = (rotulo, valor, nota = "") => `<div><dt>${rotulo}</dt><dd>${valor}</dd>${nota ? `<small>${nota}</small>` : ""}</div>`;
  const agora = new Date();
  const notas = (l) => [
    l.c.modoMinimo ? "Rotina mínima" : "",
    l.c.diaDescanso ? "Descanso" : "",
    l.c.aguaCopos ? `${l.c.aguaCopos} copos` : "",
  ].filter(Boolean).join(" · ") || "—";
  const corpo = linhas.length
    ? linhas.slice().reverse().map((l) => {
      const { r, n, c } = l;
      return `
      <tr>
        <td>${formatarDataSemana(r.data)}</td>
        <td>${r.horaDeitar} → ${r.horaAcordar}</td>
        <td>${r.latencia} min</td>
        <td>${r.despertares}</td>
        <td><b>${formatarDuracao(n.dormindo)}</b></td>
        <td>${formatarDuracao(l.recomendado)} <span class="rel-dif">(${duracaoComSinal(l.diferenca)})</span></td>
        <td>${n.eficiencia}%</td>
        <td>${r.energia || "—"}</td>
        <td>${r.humor || "—"}</td>
        <td>${c.estresseNoite ? `${c.estresseNoite} · ${c.ansiedadeNoite} · ${c.fadigaNoite}` : "—"}</td>
        <td>${l.resultado ? `${l.resultado.seta} ${l.resultado.texto} ${comSinal(l.resultado.variacao)}` : "—"}</td>
        <td>${l.ritual == null ? "—" : `${l.ritual}%`}</td>
        <td>${notas(l)}</td>
      </tr>`;
    }).join("")
    : '<tr><td colspan="13">Nenhuma noite registrada nesse período.</td></tr>';
  return `
    <article class="rel">
      <p class="rel-selo">${escaparHtml(CONFIG.nome)} · Relatório de sono</p>
      <h1>${escaparHtml(estado.usuario.nome)}</h1>
      <p>Período: ${rotuloPeriodo} · Gerado em ${agora.toLocaleDateString("pt-BR")} às ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>

      <h2>Sono</h2>
      <dl class="rel-resumo">
        ${item("Noites registradas", s.noites)}
        ${item("Sono estimado médio", ou(s.sono, (v) => formatarDuracao(Math.round(v))))}
        ${item("Sono recomendado pela rotina", ou(s.recomendado, (v) => formatarDuracao(Math.round(v))), "média do período")}
        ${item("Diferença para o recomendado", ou(s.diferenca, duracaoComSinal), s.noites ? `${s.atingiu} de ${s.noites} noites atingiram` : "")}
        ${item("Horário médio de deitar", ou(s.deitar, formatarHora))}
        ${item("Horário médio de acordar", ou(s.acordar, formatarHora), `planejado: ${escaparHtml(estado.usuario.horaAcordar)}`)}
        ${item("Tempo médio para adormecer", ou(s.latencia, (v) => `${Math.round(v)} min`))}
        ${item("Despertares por noite", ou(s.despertares, (v) => numeroBR(v)))}
        ${item("Eficiência média do sono", ou(s.eficiencia, (v) => `${Math.round(v)}%`))}
        ${item("Energia ao acordar (1 a 5)", ou(s.energia, (v) => numeroBR(v)))}
      </dl>

      <h2>Equilíbrio emocional</h2>
      <dl class="rel-resumo">
        ${item("Noites com check-in", s.checkins, `${s.completas} com o humor da manhã`)}
        ${item("Tensão antes de dormir (1 a 5)", ou(s.tensao, (v) => numeroBR(v)))}
        ${item("Humor ao acordar (1 a 5)", ou(s.humor, (v) => numeroBR(v)))}
        ${item("Acordou melhor", s.completas ? `${s.melhorou} de ${s.completas}` : "—", s.completas ? `piorou em ${s.piorou}` : "")}
        ${item("Resultado médio da noite", ou(s.resultado, comSinal), "humor ao acordar − calma ao deitar")}
        ${item("Resultado com 7h ou mais", ou(s.resultadoComSono, comSinal), `com menos de 7h: ${ou(s.resultadoPoucoSono, comSinal)}`)}
      </dl>

      <h2>Rotina e hábitos</h2>
      <dl class="rel-resumo">
        ${item("Ritual noturno concluído", ou(s.ritual, (v) => `${Math.round(v)}%`), "média das noites com check-in")}
        ${item("Esforço médio da rotina", ou(s.carga, (v) => `${rotuloMedia(v)} (${numeroBR(v)})`), "1 leve · 2 médio · 3 pesado")}
        ${item("Dias em rotina mínima", s.diasMinimo, "dias de sobrecarga")}
        ${item("Dias de descanso planejados", s.diasDescanso)}
        ${item("Água (copos por dia)", ou(s.agua, (v) => numeroBR(v)), s.diasAgua ? `em ${plural(s.diasAgua, "dia marcado", "dias marcados")}` : "não marcado")}
        ${item("Sequência do diário", plural(s.sequencia, "dia", "dias"), `recorde: ${plural(s.recorde, "dia", "dias")}`)}
      </dl>

      <h2>Noites</h2>
      <div class="rel-tabela-rolagem">
        <table class="rel-tabela">
          <thead><tr>
            <th>Noite até</th><th>Deitou → acordou</th><th>Adormecer</th><th>Despert.</th><th>Sono</th>
            <th>Recomendado</th><th>Eficiência</th><th>Energia</th><th>Humor</th><th>Estresse · ansiedade · fadiga</th>
            <th>Resultado</th><th>Ritual</th><th>Dia anterior</th>
          </tr></thead>
          <tbody>${corpo}</tbody>
        </table>
      </div>
      <section class="rel-notas">
        <h2>Como ler</h2>
        <ul>
          <li>Cada linha é uma noite, identificada pela data em que a pessoa acordou. Emoções, ritual e hábitos são do dia anterior, antes de dormir.</li>
          <li>Sono estimado = tempo na cama menos o tempo para adormecer. Eficiência = sono estimado ÷ tempo na cama.</li>
          <li>Sono recomendado: 7h mais 5, 10 ou 20 minutos por evento leve, médio ou pesado do dia, entre 7h e 9h. Calculado com a rotina cadastrada no site; entre parênteses, quanto a pessoa dormiu a mais (+) ou a menos (−).</li>
          <li>Energia e humor ao acordar vão de 1 (muito baixo, muito ruim) a 5 (ótimo, muito bom). Estresse, ansiedade e fadiga mental, de 1 (nenhum) a 5 (muito alto); a tensão é a média dos três.</li>
          <li>Resultado da noite = humor ao acordar − calma ao deitar (6 − tensão). Melhorou: +1 ou mais; piorou: −1 ou menos; estável: entre os dois.</li>
          <li>Rotina mínima: dia em que a pessoa reduziu a rotina ao essencial por sobrecarga. Descanso: pausa planejada do diário.</li>
          <li>Dados registrados pela própria pessoa no site ${escaparHtml(CONFIG.nome)}. Não é um exame nem um diagnóstico.</li>
        </ul>
      </section>
    </article>`;
}

/* A pré-visualização do Claude roda dentro de outra página e bloqueia downloads e impressão */
function emPreVisualizacao() {
  try { return window.self !== window.top; } catch (e) { return true; }
}

function baixarArquivo(nome, conteudo, tipo) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function mensagemEm(id, texto, tipo = "") {
  const m = el(id);
  m.textContent = texto;
  m.className = "form-msg " + tipo;
}

/* Na pré-visualização do Claude, o download passa pela confirmação do próprio
   Claude (capacidade "downloads"). No site publicado, window.claude não existe
   e o download é o normal do navegador. */
let downloadsClaude = null;
function prepararDownloadsClaude() {
  if (!window.claude || typeof window.claude.use !== "function") return;
  window.claude.use("downloads").then((d) => { downloadsClaude = d; }).catch(() => {});
}

async function baixarCsv(idMensagem) {
  const linhas = linhasRelatorio(periodoRelatorio().inicio);
  if (!linhas.length) { mensagemEm(idMensagem, "Ainda não tem noites anotadas nesse período.", "erro"); return; }
  const nome = `ritmo-relatorio-sono-${hojeChave()}.csv`;
  const conteudo = gerarCsv(linhas);
  const pronto = `CSV com ${plural(linhas.length, "noite", "noites")} baixado.`;
  if (downloadsClaude) {
    try {
      await downloadsClaude.save({ filename: nome, data: conteudo });
      mensagemEm(idMensagem, pronto, "ok");
    } catch (err) {
      if (err && err.code === "declined") mensagemEm(idMensagem, "Download cancelado.");
      else mensagemEm(idMensagem, "Não deu para baixar aqui. Use Copiar CSV.", "erro");
    }
    return;
  }
  baixarArquivo(nome, conteudo, "text/csv;charset=utf-8");
  mensagemEm(idMensagem, emPreVisualizacao()
    ? "A pré-visualização bloqueia downloads. Use Copiar CSV ou abra o site publicado."
    : pronto, emPreVisualizacao() ? "" : "ok");
}

function iniciarRelatorio() {
  prepararDownloadsClaude();
  el("rel-ver").addEventListener("click", () => {
    if (!estado.usuario) return;
    const { inicio, rotulo } = periodoRelatorio();
    const html = htmlRelatorio(linhasRelatorio(inicio), rotulo);
    el("relatorio-previa").innerHTML = html;
    el("relatorio-impressao").innerHTML = html;
    mensagemEm("relatorio-msg", "");
    el("relatorio-dialog").showModal();
  });
  el("relatorio-imprimir").addEventListener("click", () => {
    if (emPreVisualizacao()) mensagemEm("relatorio-msg", "Se a janela de impressão não abrir, é a pré-visualização bloqueando. No site publicado ela abre normalmente.");
    window.print();
  });
  el("rel-csv").addEventListener("click", () => baixarCsv("rel-msg"));
  el("relatorio-csv").addEventListener("click", () => baixarCsv("relatorio-msg"));
  el("rel-copiar").addEventListener("click", async () => {
    const linhas = linhasRelatorio(periodoRelatorio().inicio);
    if (!linhas.length) { mensagemEm("rel-msg", "Ainda não tem noites anotadas nesse período.", "erro"); return; }
    try {
      await navigator.clipboard.writeText(gerarCsv(linhas).replace(/^﻿/, ""));
      mensagemEm("rel-msg", "Copiado! Agora é só colar numa planilha ou num e-mail.", "ok");
    } catch (e) {
      mensagemEm("rel-msg", "Não deu para copiar automaticamente. Use Baixar CSV.", "erro");
    }
  });
  ["relatorio-fechar", "relatorio-fechar-x"].forEach((id) => el(id).addEventListener("click", () => el("relatorio-dialog").close()));
}

/* =========================================================
   SUA CONTA: SAIR E EXCLUIR
   A exclusão pede a senha (para ninguém apagar a conta num aparelho
   esquecido aberto) e a confirmação de que é definitiva.
   ========================================================= */
function iniciarConta() {
  const form = el("form-excluir");
  const abrir = el("pf-excluir-abrir");
  const msg = (texto, tipo = "") => mensagemEm("pf-excluir-msg", texto, tipo);

  abrir.addEventListener("click", () => {
    form.hidden = false;
    abrir.hidden = true;
    el("pf-excluir-senha").focus();
  });
  el("pf-excluir-cancelar").addEventListener("click", () => {
    form.reset();
    form.hidden = true;
    abrir.hidden = false;
    msg("");
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!estado.usuario) return;
    const senha = el("pf-excluir-senha").value;
    if (!senha) { msg("Digite sua senha.", "erro-forte"); return; }
    if (!el("pf-excluir-ciente").checked) { msg("Antes, marque que você entende que a exclusão é definitiva.", "erro-forte"); return; }
    const espera = segundosDeEspera();
    if (espera) { msg(`Muitas tentativas de senha. Aguarde ${espera} s para tentar de novo.`, "erro-forte"); return; }
    const botao = el("pf-excluir");
    botao.disabled = true;
    msg("Excluindo a sua conta…");
    try {
      try {
        await DB.confirmarSenha(estado.usuario, senha);
      } catch (err) {
        if (err instanceof ErroAmigavel && /senha incorreta/i.test(err.message)) registrarFalhaLogin();
        throw err;
      }
      zerarTentativas();
      await DB.excluirConta(estado.usuario);
      pararTudo();
      await definirUsuario(null);
      limparFormularios();
      abrir.hidden = false;
      msg("");
      irPara("inicio");
      atualizarTela();
      mostrarToast("Sua conta e todos os seus dados foram excluídos. Obrigado por ter usado o Ritmo.", 6000);
    } catch (err) {
      msg(err instanceof ErroAmigavel ? err.message : "Não deu para excluir a conta agora. Tente de novo em instantes.", "erro-forte");
    }
    botao.disabled = false;
  });
}

/* =========================================================
   MUDAR SENHA (Meu perfil > Sua conta)
   Pede a senha atual antes (com o mesmo limite de tentativas do login), usa o mesmo
   medidor do cadastro na senha nova e, depois de trocar, encerra a sessão nos outros aparelhos.
   ========================================================= */
function fecharMudarSenha() {
  const form = el("form-senha");
  form.reset();
  form.hidden = true;
  el("pf-senha-abrir").hidden = false;
}

function iniciarMudarSenha() {
  const form = el("form-senha");
  const abrir = el("pf-senha-abrir");
  const msg = (texto, tipo = "") => mensagemEm("pf-senha-msg", texto, tipo);
  const dadosDaConta = () => ({ email: estado.usuario ? estado.usuario.email : "", nome: estado.usuario ? estado.usuario.nome : "" });

  ligarMedidorSenha({ form, medidor: el("forca-senha-perfil"), confirmarMsg: el("pf-senha-confirmar-msg"), dados: dadosDaConta });

  abrir.addEventListener("click", () => {
    form.hidden = false;
    abrir.hidden = true;
    form.elements.usuario.value = estado.usuario ? estado.usuario.email : ""; // para o gerenciador de senhas
    msg("");
    form.elements.atual.focus();
  });
  el("pf-senha-cancelar").addEventListener("click", () => {
    fecharMudarSenha();
    msg("");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!estado.usuario) return;
    const atual = form.elements.atual.value;
    const nova = form.elements.senha.value;
    if (!atual) { msg("Digite a sua senha atual para continuar.", "erro"); form.elements.atual.focus(); return; }
    const espera = segundosDeEspera();
    if (espera) { msg(`Muitas tentativas de senha. Aguarde ${espera} s para tentar de novo.`, "erro"); return; }
    const problema = problemaSenhaNova(nova, form.elements.confirmar.value, dadosDaConta());
    if (problema) { msg(problema, "erro"); return; }
    if (nova === atual) { msg("A senha nova precisa ser diferente da atual.", "erro"); return; }

    ocupado(form, true);
    msg("Conferindo a sua senha atual…");
    try {
      try {
        await DB.mudarSenha(estado.usuario, atual, nova);
      } catch (err) {
        if (err instanceof ErroAmigavel && /senha incorreta/i.test(err.message)) {
          registrarFalhaLogin();
          const bloqueio = segundosDeEspera() ? ` Por segurança, aguarde ${segundosDeEspera()} s antes de tentar de novo.` : "";
          throw new ErroAmigavel(`A senha atual não confere. Confira e tente de novo.${bloqueio}`);
        }
        throw err;
      }
      zerarTentativas();
      fecharMudarSenha();
      msg(DB.tipo === "supabase"
        ? "Senha alterada! Por segurança, saímos da sua conta nos outros aparelhos. Neste, você continua conectado."
        : "Senha alterada!", "ok");
      mostrarToast("Senha alterada com sucesso.");
    } catch (err) {
      msg(err instanceof ErroAmigavel ? err.message : "Não deu para mudar a senha agora. Tente de novo em instantes.", "erro");
    }
    ocupado(form, false);
  });
}

/* =========================================================
   PÁGINA RELAXAR: RESPIRAÇÃO GUIADA
   Cada fase: texto, duração (s), tamanho da forma (1 = cheia,
   0,55 = vazia) e a nota do som suave opcional.
   ========================================================= */
const TECNICAS_RESPIRACAO = [
  {
    id: "478", nome: "Respiração 4-7-8", resumo: "Inspire 4 s, segure 7 s e solte o ar em 8 s", forma: "circulo", ciclos: 4,
    fases: [{ texto: "Inspire", seg: 4, escala: 1, nota: 72 }, { texto: "Segure", seg: 7, escala: 1, nota: 67 }, { texto: "Solte o ar", seg: 8, escala: 0.55, nota: 64 }],
  },
  {
    id: "quadrada", nome: "Respiração quadrada", resumo: "Inspire, segure, solte e segure, 4 s cada", forma: "quadrada", ciclos: 5,
    fases: [{ texto: "Inspire", seg: 4, escala: 1, nota: 72 }, { texto: "Segure", seg: 4, escala: 1, nota: 67 }, { texto: "Solte o ar", seg: 4, escala: 0.55, nota: 64 }, { texto: "Segure", seg: 4, escala: 0.55, nota: 60 }],
  },
  {
    id: "46", nome: "Calma 4-6", resumo: "Inspire 4 s e solte o ar devagar em 6 s", forma: "circulo", ciclos: 8,
    fases: [{ texto: "Inspire", seg: 4, escala: 1, nota: 72 }, { texto: "Solte o ar", seg: 6, escala: 0.55, nota: 64 }],
  },
];
const respiracao = { tecnica: TECNICAS_RESPIRACAO[0], ativa: false, timers: [] };

function duracaoTexto(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return m ? `${m} min${s ? ` e ${s} s` : ""}` : `${s} s`;
}

function ciclosEscolhidos() {
  return Math.min(20, Math.max(1, Math.round(Number(el("resp-ciclos").value) || respiracao.tecnica.ciclos)));
}

function atualizarResumoRespiracao() {
  const ciclos = ciclosEscolhidos();
  const total = ciclos * respiracao.tecnica.fases.reduce((soma, f) => soma + f.seg, 0);
  el("resp-ciclo").textContent = `${plural(ciclos, "ciclo", "ciclos")} · cerca de ${duracaoTexto(total)}`;
}

function limparTimersRespiracao() {
  respiracao.timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
  respiracao.timers = [];
}

function somDaFase(nota) {
  if (!el("resp-som").checked) return;
  let ctx;
  try { ctx = prepararAudio(); } catch (e) { return; }
  const saida = ctx.createGain();
  saida.gain.value = 0.6;
  saida.connect(ctx.destination);
  notaPiano(ctx, saida, nota, ctx.currentTime + 0.02, 0.35, 1.8);
  setTimeout(() => saida.disconnect(), 2500);
}

function mostrarFase(texto, segundos, escala) {
  const forma = el("resp-forma");
  forma.style.transitionDuration = `${segundos}s`;
  forma.style.transform = `scale(${escala})`;
  el("resp-fase").textContent = texto;
  let resta = segundos;
  el("resp-contagem").textContent = resta;
  respiracao.timers.push(setInterval(() => {
    resta -= 1;
    if (resta > 0) el("resp-contagem").textContent = resta;
  }, 1000));
}

function pararRespiracao(mensagem) {
  limparTimersRespiracao();
  respiracao.ativa = false;
  el("resp-iniciar").textContent = mensagem ? "Começar de novo" : "Começar";
  const forma = el("resp-forma");
  forma.style.transitionDuration = "1.5s";
  forma.style.transform = "scale(0.55)";
  el("resp-fase").textContent = mensagem || "Pronto?";
  el("resp-contagem").textContent = "";
  if (!mensagem) atualizarResumoRespiracao();
}

function comecarRespiracao() {
  limparTimersRespiracao();
  const t = respiracao.tecnica;
  const ciclos = ciclosEscolhidos();
  el("resp-ciclos").value = ciclos;
  respiracao.ativa = true;
  el("resp-iniciar").textContent = "Parar";
  // No celular a forma fica abaixo dos botões: rola até ela para acompanhar
  const palco = el("resp-palco").getBoundingClientRect();
  if (palco.top < 60 || palco.bottom > window.innerHeight - 70) {
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el("resp-palco").scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "center" });
  }
  let ciclo = 0;
  let fase = -1;
  const proxima = () => {
    limparTimersRespiracao();
    fase += 1;
    if (fase >= t.fases.length) { fase = 0; ciclo += 1; }
    if (ciclo >= ciclos) {
      pararRespiracao("Muito bem");
      el("resp-ciclo").textContent = "Respire normalmente por alguns instantes antes de deitar.";
      return;
    }
    const f = t.fases[fase];
    mostrarFase(f.texto, f.seg, f.escala);
    somDaFase(f.nota);
    el("resp-ciclo").textContent = `Ciclo ${ciclo + 1} de ${ciclos}`;
    respiracao.timers.push(setTimeout(proxima, f.seg * 1000));
  };
  // Três segundos para se ajeitar antes do primeiro ciclo
  mostrarFase("Prepare-se", 3, 0.55);
  el("resp-ciclo").textContent = `${t.nome} · ${plural(ciclos, "ciclo", "ciclos")}`;
  respiracao.timers.push(setTimeout(proxima, 3000));
}

function iniciarRespiracao() {
  el("resp-tecnicas").innerHTML = TECNICAS_RESPIRACAO.map((t, i) => `
    <label class="tecnica">
      <input type="radio" id="resp-tec-${t.id}" name="resp-tecnica" value="${t.id}"${i === 0 ? " checked" : ""} />
      <strong>${escaparHtml(t.nome)}</strong>
      <small>${escaparHtml(t.resumo)}</small>
    </label>`).join("");
  el("resp-tecnicas").addEventListener("change", (e) => {
    const t = TECNICAS_RESPIRACAO.find((x) => x.id === e.target.value);
    if (!t) return;
    respiracao.tecnica = t;
    el("resp-palco").dataset.forma = t.forma;
    el("resp-ciclos").value = t.ciclos;
    pararRespiracao();
  });
  el("resp-ciclos").addEventListener("change", () => { if (!respiracao.ativa) atualizarResumoRespiracao(); });
  el("resp-iniciar").addEventListener("click", () => {
    if (respiracao.ativa) pararRespiracao();
    else comecarRespiracao();
  });
  atualizarResumoRespiracao();
}

/* =========================================================
   PÁGINA INICIAL (landing page)
   - Abas (recursos e passos de instalação): clique, setas, Home e End.
   - Elementos .revelar aparecem suavemente ao rolar a página.
   - Chamadas com data-texto-logado trocam de texto para quem já entrou.
   - As perguntas frequentes viram dados estruturados (FAQPage) para buscadores.
   ========================================================= */
function textoDoLink(link) {
  return [...link.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());
}

/* Chamadas da página inicial e botão "Criar conta" do topo, conforme o login */
function atualizarCtas() {
  const logado = Boolean(estado.usuario);
  document.querySelectorAll("[data-texto-logado]").forEach((link) => {
    const no = textoDoLink(link);
    if (!no) return;
    if (link.dataset.textoVisitante === undefined) link.dataset.textoVisitante = no.nodeValue;
    const espaco = /\s$/.test(link.dataset.textoVisitante) ? " " : "";
    no.nodeValue = logado ? link.dataset.textoLogado + espaco : link.dataset.textoVisitante;
  });
  const criarTopo = el("btn-criar-topo");
  if (criarTopo) criarTopo.hidden = logado;
}

/* Abas acessíveis: qualquer [role="tablist"][data-abas] com botões role="tab" e aria-controls */
function iniciarAbas(lista) {
  const abas = [...lista.querySelectorAll('[role="tab"]')];
  const ativar = (aba, focar) => {
    abas.forEach((a) => {
      const ativa = a === aba;
      a.setAttribute("aria-selected", String(ativa));
      a.tabIndex = ativa ? 0 : -1;
      el(a.getAttribute("aria-controls")).hidden = !ativa;
    });
    if (focar) aba.focus({ preventScroll: true });
    // No celular a lista de abas rola de lado: centraliza a aba escolhida
    lista.scrollTo({ left: aba.offsetLeft - (lista.clientWidth - aba.offsetWidth) / 2, behavior: "smooth" });
  };
  lista.addEventListener("click", (e) => {
    const aba = e.target.closest('[role="tab"]');
    if (aba) ativar(aba, false);
  });
  lista.addEventListener("keydown", (e) => {
    const i = abas.indexOf(document.activeElement);
    const destino = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: abas.length - 1 }[e.key];
    if (i < 0 || destino === undefined) return;
    e.preventDefault();
    ativar(abas[(destino + abas.length) % abas.length], true);
  });
}

function iniciarRevelar() {
  const poucoMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (poucoMovimento || !("IntersectionObserver" in window)) return; // tudo aparece direto
  document.documentElement.classList.add("js-revelar");
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("visivel");
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
  document.querySelectorAll(".revelar").forEach((item) => {
    // Cartões lado a lado entram um pouco depois do anterior
    const irmaos = [...item.parentElement.children].filter((n) => n.classList.contains("revelar"));
    item.style.setProperty("--atraso", `${Math.min(irmaos.indexOf(item), 4) * 80}ms`);
    observador.observe(item);
  });
}

/* Dados estruturados das perguntas frequentes, montados a partir do próprio HTML */
function publicarFaqParaBuscadores() {
  const perguntas = [...document.querySelectorAll("#perguntas .faq-item")].map((item) => ({
    "@type": "Question",
    name: item.querySelector("summary").textContent.trim(),
    acceptedAnswer: { "@type": "Answer", text: item.querySelector(".faq-resposta").textContent.trim() },
  }));
  if (!perguntas.length) return;
  const dados = document.createElement("script");
  dados.type = "application/ld+json";
  dados.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: perguntas });
  document.head.appendChild(dados);
}

function iniciarLanding() {
  document.querySelectorAll('[role="tablist"][data-abas]').forEach(iniciarAbas);
  iniciarRevelar();
  atualizarCtas();
  publicarFaqParaBuscadores();
}

/* =========================================================
   INSTALAR NO CELULAR (app na tela inicial / PWA)
   O site vira app com manifest.webmanifest, os ícones da pasta icons/ e o
   service worker sw.js (que faz o site abrir sem internet).
   Cada navegador instala de um jeito:
   - Chrome, Edge e Samsung Internet (Android e computador): o navegador avisa
     que dá para instalar (evento beforeinstallprompt) e o botão "Instalar"
     abre a janela de instalação do próprio navegador.
   - iPhone e iPad: não existe botão automático; o site mostra os passos do Safari.
   - Aberto pelo ícone (já instalado): os convites somem.
   Onde o convite aparece: seção "Leve o Ritmo no bolso" da página inicial,
   cartão "App no celular" do perfil, aviso no topo do celular (a partir da
   2ª visita ou com login; fechado, some por 30 dias) e logo depois do cadastro.
   ========================================================= */
const CHAVE_AVISO_INSTALAR = "ritmo_aviso_instalar";      // quando o aviso do celular foi fechado
const CHAVE_VISITAS = "ritmo_visitas";                    // quantas vezes o site foi aberto
const CHAVE_SUGERIR_INSTALAR = "ritmo_sugerir_instalar";  // cadastro com confirmação por e-mail: sugere no 1º acesso
const DIAS_SEM_AVISO = 30;

const ICONE_COMPARTILHAR = '<svg class="ic ic-inline" viewBox="0 0 24 24" role="img" aria-label="(quadrado com uma seta para cima)"><path d="M12 3v12M8 7l4-4 4 4M7 10H5v11h14V10h-2" /></svg>';

/* Passos de cada aparelho (texto fixo do site, por isso pode ter HTML) */
const PASSOS_INSTALACAO = {
  android: {
    passos: [
      "Abra este site no <b>Chrome</b> do celular.",
      "Toque em <b>Instalar</b> ou abra o menu <b>⋮</b> e escolha <b>Instalar app</b> (em alguns aparelhos, <b>Adicionar à tela inicial</b>).",
      "Confirme. O ícone do Ritmo aparece na tela inicial.",
    ],
  },
  ios: {
    passos: [
      "Abra este site no <b>Safari</b>.",
      `Toque em <b>Compartilhar</b> ${ICONE_COMPARTILHAR}. Se não aparecer, toque antes em <b>⋯</b> na barra do Safari.`,
      "Escolha <b>Adicionar à Tela de Início</b> e toque em <b>Adicionar</b>.",
    ],
    nota: "No iPhone, o app instalado pede para você entrar na conta uma vez.",
  },
  computador: {
    passos: [
      "Abra o site no <b>Chrome</b> ou no <b>Edge</b>.",
      "Clique no ícone de instalar na barra de endereço ou, no menu, em <b>Instalar Ritmo</b>.",
      "O Ritmo abre em uma janela própria, como um programa.",
    ],
  },
};

const TEXTOS_INSTALACAO = {
  instalado: "App instalado. Você já está usando o Ritmo pelo ícone.",
  pronto: "Pronto para instalar neste aparelho, em um toque.",
  ios: "No iPhone, a instalação é pelo Safari, em três passos.",
  android: "Instale pelo menu do navegador, em três passos.",
  computador: "Instale no computador ou abra o site no celular.",
  previa: "A instalação funciona no site publicado. Aqui é só uma prévia.",
};

const instalacao = { pedido: null };

/* O navegador avisa que o site pode ser instalado: guarda o aviso para o botão "Instalar" */
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  instalacao.pedido = e;
  atualizarInstalacao();
});
window.addEventListener("appinstalled", () => {
  instalacao.pedido = null;
  armazenamento.remover(CHAVE_SUGERIR_INSTALAR);
  if (el("instalar-dialog").open) el("instalar-dialog").close();
  atualizarInstalacao();
  mostrarToast("Ritmo instalado! Agora é só abrir pelo ícone na tela inicial.", 5000);
});

function plataformaDoAparelho() {
  const ua = navigator.userAgent || "";
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) return "ios";
  return /Android/.test(ua) ? "android" : "computador";
}

function appInstalado() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true;
}

/* instalado | pronto (um toque) | previa | ios | android | computador */
function situacaoInstalacao() {
  if (appInstalado()) return "instalado";
  if (instalacao.pedido) return "pronto";
  if (emPreVisualizacao() || location.protocol === "file:") return "previa";
  return plataformaDoAparelho();
}

function htmlPassos(plataforma) {
  const p = PASSOS_INSTALACAO[plataforma];
  return `<ol class="passos-instalar">${p.passos.map((t) => `<li><span>${t}</span></li>`).join("")}</ol>` +
    (p.nota ? `<p class="passos-nota">${p.nota}</p>` : "");
}

function enderecoDoSite() {
  return location.origin + location.pathname.replace(/index\.html$/, "");
}

function deveMostrarAviso(situacao) {
  if (situacao !== "pronto" && situacao !== "ios") return false;
  if (!window.matchMedia("(max-width: 760px)").matches) return false;
  const fechado = armazenamento.ler(CHAVE_AVISO_INSTALAR, 0);
  if (fechado && Date.now() - fechado < DIAS_SEM_AVISO * 86400000) return false;
  return Boolean(estado.usuario) || armazenamento.ler(CHAVE_VISITAS, 0) >= 2;
}

/* Atualiza todos os convites de instalação conforme o aparelho e o navegador */
function atualizarInstalacao() {
  const situacao = situacaoInstalacao();
  const texto = TEXTOS_INSTALACAO[situacao];
  el("instalar-status").textContent = texto;
  el("btn-instalar").hidden = situacao !== "pronto";
  el("instalar-caixa").dataset.situacao = situacao;
  el("pf-instalar-status").textContent = texto;
  el("pf-instalar").hidden = situacao === "instalado";
  el("pf-instalar").textContent = situacao === "pronto" ? "Instalar o app" : "Ver como instalar";
  el("banner-instalar").hidden = !deveMostrarAviso(situacao);
  document.querySelectorAll("[data-esconder-instalado]").forEach((n) => { n.hidden = situacao === "instalado"; });
}

/* Botões "Instalar": abre a janela do navegador ou, sem ela, os passos */
async function pedirInstalacao() {
  const pedido = instalacao.pedido;
  if (!pedido) { abrirDialogoInstalar("manual"); return; }
  instalacao.pedido = null; // cada aviso do navegador só pode ser usado uma vez
  try {
    await pedido.prompt();
    const escolha = await pedido.userChoice;
    if (escolha.outcome !== "accepted") mostrarToast("Tudo bem. Quando quiser, dá para instalar pelo seu perfil.");
  } catch (err) {
    abrirDialogoInstalar("manual");
  }
  atualizarInstalacao();
}

/* Diálogo de instalação. motivo: "cadastro" (logo após criar a conta) ou "manual" */
function abrirDialogoInstalar(motivo) {
  const situacao = situacaoInstalacao();
  if (situacao === "instalado") return;
  const dialogo = el("instalar-dialog");
  const plataforma = plataformaDoAparelho();
  const aposCadastro = motivo === "cadastro";
  el("instalar-dialog-selo").hidden = !aposCadastro;
  el("instalar-dialog-titulo").textContent = aposCadastro ? "Agora, instale o Ritmo no celular" : "Instale o Ritmo no seu aparelho";
  el("instalar-dialog-texto").textContent = aposCadastro
    ? `${primeiroNome() ? primeiroNome() + ", sua" : "Sua"} conta está pronta. Com o app na tela inicial, sua rotina abre em um toque e em tela cheia.`
    : "Com o app na tela inicial, sua rotina abre em um toque e em tela cheia, sem procurar o site no navegador.";

  const passos = el("instalar-dialog-passos");
  const acao = el("instalar-dialog-acao");
  if (situacao === "pronto") {
    passos.hidden = true;
    passos.innerHTML = "";
    acao.textContent = "Instalar agora";
    acao.dataset.modo = "instalar";
  } else {
    let extra = "";
    if (situacao === "previa") extra = `<p class="instalar-celular">${TEXTOS_INSTALACAO.previa}</p>`;
    else if (plataforma === "computador") extra = `<p class="instalar-celular">No celular, abra <strong>${escaparHtml(enderecoDoSite())}</strong> e siga os passos do seu aparelho.</p>`;
    passos.hidden = false;
    passos.innerHTML = htmlPassos(plataforma) + extra;
    acao.textContent = "Entendi";
    acao.dataset.modo = "fechar";
  }
  if (!dialogo.open) dialogo.showModal();
}

/* Logo depois do cadastro: espera o diálogo da conta fechar e sugere a instalação */
function sugerirInstalacaoAposCadastro(tentativas = 0) {
  armazenamento.remover(CHAVE_SUGERIR_INSTALAR);
  if (situacaoInstalacao() === "instalado" || !estado.usuario) return;
  if (el("auth-dialog").open && tentativas < 20) {
    setTimeout(() => sugerirInstalacaoAposCadastro(tentativas + 1), 250);
    return;
  }
  setTimeout(() => abrirDialogoInstalar("cadastro"), 400);
}

function registrarServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext || emPreVisualizacao() || location.protocol === "file:") return;
  const registrar = () => navigator.serviceWorker.register("sw.js").catch(() => {
    /* sem service worker o site funciona igual, só não abre sem internet */
  });
  if (document.readyState === "complete") registrar();
  else window.addEventListener("load", registrar);
}

function iniciarInstalacao() {
  registrarServiceWorker();

  // Conta as visitas (uma por sessão do navegador) para não insistir na primeira
  try {
    if (!sessionStorage.getItem("ritmo_sessao")) {
      sessionStorage.setItem("ritmo_sessao", "1");
      armazenamento.gravar(CHAVE_VISITAS, armazenamento.ler(CHAVE_VISITAS, 0) + 1);
    }
  } catch (e) { /* sem armazenamento: o aviso só aparece com login */ }

  // Passos de cada aparelho na página inicial, já com a aba do aparelho atual aberta
  document.querySelectorAll("[data-passos]").forEach((painel) => { painel.innerHTML = htmlPassos(painel.dataset.passos); });
  const abaAtual = el(`aba-inst-${plataformaDoAparelho()}`);
  if (abaAtual && abaAtual.getAttribute("aria-selected") !== "true") abaAtual.click();

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-instalar]")) { e.preventDefault(); pedirInstalacao(); }
    if (e.target.closest("[data-fechar-instalar]")) el("instalar-dialog").close();
  });
  el("instalar-dialog-acao").addEventListener("click", () => {
    const instalar = el("instalar-dialog-acao").dataset.modo === "instalar";
    el("instalar-dialog").close();
    if (instalar) pedirInstalacao();
  });
  el("banner-instalar-fechar").addEventListener("click", () => {
    armazenamento.gravar(CHAVE_AVISO_INSTALAR, Date.now());
    el("banner-instalar").hidden = true;
  });
  window.matchMedia("(display-mode: standalone)").addEventListener("change", atualizarInstalacao);
  window.matchMedia("(max-width: 760px)").addEventListener("change", atualizarInstalacao);
  atualizarInstalacao();
}

/* =========================================================
   DICAS DE DESCANSO (popup)
   Aparecem uma vez por dia ao abrir Minha rotina ou Sono, quando o
   registro ou um evento sugere um hábito que atrapalha o sono, e no
   botão "Dicas de descanso". Para incluir uma dica, adicione na lista.
   ========================================================= */
const DICAS = [
  { id: "cafeina", titulo: "Cafeína tem efeito longo", texto: "O efeito do café pode durar várias horas. Prefira deixar café, chá preto, mate, energéticos e refrigerantes de cola para antes das 14h." },
  { id: "telas", titulo: "Luz de telas à noite", texto: "A luz forte do celular e da TV perto da hora de dormir atrasa o sono. Diminua o brilho e afaste as telas na última hora antes de deitar." },
  { id: "horario", titulo: "Horários regulares", texto: "Deitar e acordar em horários parecidos todos os dias, inclusive nos fins de semana, ajuda o relógio biológico e melhora a disposição." },
  { id: "quarto", titulo: "Quarto escuro, silencioso e fresco", texto: "Um ambiente escuro, silencioso e com temperatura amena facilita pegar no sono e reduz os despertares durante a noite." },
  { id: "alcool", titulo: "Álcool atrapalha o descanso", texto: "A bebida pode dar sono no começo, mas deixa a noite mais fragmentada e diminui a qualidade do descanso." },
  { id: "exercicio", titulo: "Exercício pesado perto de dormir", texto: "Atividade física faz bem ao sono, mas treinos intensos nas últimas horas antes de deitar podem deixar o corpo agitado. Se puder, treine mais cedo." },
  { id: "refeicao", titulo: "Jantar leve e mais cedo", texto: "Refeições pesadas ou muito tarde podem causar desconforto. Tente jantar de 2 a 3 horas antes de deitar." },
  { id: "cochilo", titulo: "Cochilos curtos", texto: "Se precisar cochilar, prefira até 20 ou 30 minutos e no começo da tarde, para não roubar o sono da noite." },
  { id: "cama", titulo: "Sem sono? Levante um pouco", texto: "Se não pegar no sono em cerca de 20 minutos, levante, faça algo calmo com luz baixa e volte para a cama quando sentir sono." },
  { id: "luzmanha", titulo: "Luz natural pela manhã", texto: "Pegar luz do dia logo cedo ajuda a ajustar o relógio biológico e a sentir sono na hora certa à noite." },
  { id: "respiracao", titulo: "Cabeça cheia antes de dormir", texto: "Alguns minutos de respiração lenta, com a saída do ar mais longa, ajudam a desacelerar. Experimente a respiração guiada na página Relaxar." },
];
const CHAVE_DICA_DIA = "ritmo_dica_dia";
const CHAVE_DICAS_AUTO = "ritmo_dicas_auto";
let indiceDica = Math.floor(Math.random() * DICAS.length);

function dicasAutomaticas() {
  return armazenamento.ler(CHAVE_DICAS_AUTO, true) !== false;
}

function mostrarDica(id) {
  const especifica = id ? DICAS.findIndex((d) => d.id === id) : -1;
  indiceDica = especifica >= 0 ? especifica : (indiceDica + 1) % DICAS.length;
  const dica = DICAS[indiceDica];
  el("dica-titulo").textContent = dica.titulo;
  el("dica-texto").textContent = dica.texto;
  el("dica-popup").hidden = false;
}

function fecharDica() {
  el("dica-popup").hidden = true;
}

/* Uma dica por dia, alguns segundos depois de abrir Minha rotina ou Sono */
function agendarDicaDoDia() {
  if (!dicasAutomaticas() || !estado.usuario) return;
  const hoje = hojeChave();
  if (armazenamento.ler(CHAVE_DICA_DIA, "") === hoje) return;
  clearTimeout(agendarDicaDoDia.espera);
  agendarDicaDoDia.espera = setTimeout(() => {
    const pagina = location.hash.slice(1);
    if (pagina !== "rotina" && pagina !== "sono") return;
    if (el("instalar-dialog").open) { agendarDicaDoDia(); return; } // espera o convite de instalação fechar
    armazenamento.gravar(CHAVE_DICA_DIA, hoje);
    mostrarDica();
  }, 2500);
}

function iniciarDicas() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-dicas]")) mostrarDica();
  });
  el("dica-proxima").addEventListener("click", () => mostrarDica());
  el("dica-fechar").addEventListener("click", fecharDica);
  el("dica-x").addEventListener("click", fecharDica);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el("dica-popup").hidden) fecharDica();
  });
  el("pf-dicas").addEventListener("change", (e) => {
    armazenamento.gravar(CHAVE_DICAS_AUTO, e.target.checked);
    mostrarToast(e.target.checked ? "Combinado: uma dica por dia." : "Dicas automáticas desligadas. Quando quiser uma, é só tocar em Dicas de descanso.");
  });

  /* "Pular para o conteúdo": vai para o título da página aberta */
  document.querySelector(".pular").addEventListener("click", (e) => {
    e.preventDefault();
    focarTitulo(paginaAtual || "inicio");
  });
}

/* =========================================================
   INTEGRAÇÕES COM WEARABLES E APPS DE SAÚDE (escala futura)
   Arquitetura prevista, para cada provedor:
     1. Login OAuth feito por uma Edge Function do Supabase; os tokens ficam
        no servidor (Vault), nunca no navegador.
     2. Uma função agendada busca as noites e grava em registros_sono com
        origem = id do provedor e id_externo = id da noite no provedor
        (upsert por usuario_id + data; o registro manual tem prioridade).
     3. A tabela integracoes guarda o status e o último sincronismo, e o site
        mostra a origem de cada noite na tabela de tendências.
   O formato de cada noite importada é o mesmo do registro manual:
     { data, horaDeitar, horaAcordar, latencia, despertares, energia: null }
   ========================================================= */
const INTEGRACOES = [
  { id: "apple_health", sigla: "AH", nome: "Apple Health", requisito: "Precisa de um app próprio para iPhone, porque a Apple não libera esses dados para sites." },
  { id: "google_fit", sigla: "GF", nome: "Google Fit / Health Connect", requisito: "O Google está encerrando o Google Fit até o fim de 2026. A conexão vai ser pelo Health Connect, no Android." },
  { id: "garmin", sigla: "GA", nome: "Garmin", requisito: "Depende de uma aprovação da própria Garmin, que já está nos planos." },
  { id: "oura", sigla: "OU", nome: "Oura Ring", requisito: "Tem conexão oficial com os dados de sono e é a primeira da fila." },
];

function renderizarIntegracoes() {
  el("integracoes").innerHTML = INTEGRACOES.map((i) => `
    <article class="integracao">
      <span class="integracao-icone" aria-hidden="true">${escaparHtml(i.sigla)}</span>
      <strong>${escaparHtml(i.nome)} <span class="selo">Em breve</span></strong>
      <p>${escaparHtml(i.requisito)}</p>
    </article>`).join("");
}

/* =========================================================
   FAIXA ANIMADA (marquee) DA PÁGINA INICIAL
   Monta dois grupos iguais de frases; o CSS desliza o trilho sem emenda.
   ========================================================= */
function montarMarquee() {
  const frases = [...FRASES_MARQUEE, ...FRASES_MARQUEE]; // repete para cobrir telas largas
  const grupo = frases.map((frase, i) =>
    `<span class="marquee-frase${i % 2 ? " destaque" : ""}">${escaparHtml(frase)}</span><span class="marquee-sep"></span>`
  ).join("");
  el("marquee-trilho").innerHTML = `<div class="marquee-grupo">${grupo}</div><div class="marquee-grupo">${grupo}</div>`;
  el("marquee-texto").textContent = FRASES_MARQUEE.join(" · ");
}

/* =========================================================
   TEMA (modo claro / escuro)
   "sistema" segue o aparelho; "claro" e "escuro" fixam o tema.
   A escolha fica neste navegador (localStorage) e, com login, na conta
   (coluna "tema" da tabela perfis), para valer em qualquer aparelho.
   ========================================================= */
const CHAVE_TEMA = "ritmo_tema";
const TEMAS = ["sistema", "claro", "escuro"];

function temaSalvo() {
  try {
    const tema = localStorage.getItem(CHAVE_TEMA);
    return TEMAS.includes(tema) ? tema : "sistema";
  } catch (e) {
    return "sistema";
  }
}

function aplicarTema(tema) {
  if (!TEMAS.includes(tema)) tema = "sistema";
  const raiz = document.documentElement;
  if (tema === "sistema") {
    // Só tira o atributo se foi o site que colocou
    if (raiz.dataset.temaSite) {
      raiz.removeAttribute("data-theme");
      delete raiz.dataset.temaSite;
    }
  } else {
    raiz.setAttribute("data-theme", tema === "escuro" ? "dark" : "light");
    raiz.dataset.temaSite = "1";
  }
  try { localStorage.setItem(CHAVE_TEMA, tema); } catch (e) { /* segue sem salvar */ }
}

/* =========================================================
   PÁGINA MEU PERFIL
   ========================================================= */
function iniciais(nome) {
  const partes = String(nome).trim().split(/\s+/).filter(Boolean);
  const letras = partes.length > 1 ? partes[0][0] + partes[partes.length - 1][0] : (partes[0] || "?").slice(0, 2);
  return letras.toUpperCase();
}

function mensagemPerfil(texto, tipo = "") {
  const m = el("pf-msg");
  m.textContent = texto;
  m.className = "form-msg " + tipo;
}

function renderizarPerfil() {
  const logado = Boolean(estado.usuario);
  el("perfil-carregando").hidden = estado.pronto;
  el("perfil-bloqueio").hidden = !estado.pronto || logado;
  el("perfil-app").hidden = !estado.pronto || !logado;
  if (!estado.pronto || !logado) return;

  const u = estado.usuario;
  el("perfil-avatar").textContent = iniciais(u.nome);
  el("perfil-titulo").textContent = u.nome;
  el("perfil-subtitulo").textContent = u.criadoEm
    ? `Conta criada em ${new Date(u.criadoEm).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}`
    : u.email;

  const campos = el("form-perfil").elements;
  el("pf-email").textContent = u.email;
  campos.nome.value = u.nome;
  campos.celular.value = formatarCelular(u.celular || "");
  campos.sexo.value = u.sexo || "";
  campos.acordar.value = u.horaAcordar;

  const tema = u.tema || temaSalvo();
  document.querySelectorAll('#pf-temas input[name="tema"]').forEach((r) => { r.checked = r.value === tema; });

  el("pf-dicas").checked = dicasAutomaticas();

  const hoje = resumoDoDia(hojeChave());
  const sequencia = calcularSequencia();
  el("perfil-resumo").innerHTML = `
    <div><dt>Eventos cadastrados</dt><dd>${estado.eventos.length}</dd></div>
    <div><dt>Noites registradas</dt><dd>${estado.registros.length}</dd></div>
    <div><dt>Sequência atual</dt><dd>${plural(sequencia.atual, "dia", "dias")}</dd></div>
    <div><dt>Deitar hoje às</dt><dd>${formatarHora(hoje.deitar)}</dd></div>`;
}

function iniciarPerfil() {
  const form = el("form-perfil");
  form.elements.celular.addEventListener("input", (e) => { e.target.value = formatarCelular(e.target.value); });

  /* Salvar dados da conta */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!estado.usuario) return;
    const campos = form.elements;
    const dados = {
      nome: limparTexto(campos.nome.value),
      celular: campos.celular.value.replace(/\D/g, ""),
      sexo: campos.sexo.value,
      horaAcordar: campos.acordar.value,
    };
    if (dados.nome.length < 2) return mensagemPerfil("Digite seu nome.", "erro");
    if (dados.celular.length < 10) return mensagemPerfil("Digite o celular com DDD, por exemplo (81) 91234-5678.", "erro");
    if (!dados.sexo) return mensagemPerfil("Selecione o sexo.", "erro");
    if (!horaValida(dados.horaAcordar)) return mensagemPerfil("Faltou a hora em que você acorda.", "erro");

    const botao = el("pf-salvar");
    botao.disabled = true;
    mensagemPerfil("Salvando…");
    try {
      await DB.salvarPerfil(estado.usuario, dados);
      Object.assign(estado.usuario, dados);
      renderizarPerfil();
      mensagemPerfil(`Pronto, perfil atualizado.${avisoGuardado()}`, "ok");
    } catch (err) {
      mensagemPerfil(err instanceof ErroAmigavel ? err.message : "Não deu para salvar o perfil agora. Tente de novo em instantes.", "erro");
    }
    botao.disabled = false;
  });

  /* Tema: aplica na hora e salva na conta */
  el("pf-temas").addEventListener("change", async (e) => {
    if (e.target.name !== "tema") return;
    const tema = e.target.value;
    aplicarTema(tema);
    if (!estado.usuario) return;
    estado.usuario.tema = tema;
    const msg = el("pf-tema-msg");
    msg.textContent = "Salvando na sua conta…";
    try {
      await DB.salvarPerfil(estado.usuario, { tema });
      msg.textContent = DB.tipo === "supabase"
        ? "Preferência salva na sua conta: vale em qualquer aparelho."
        : "Preferência salva neste navegador.";
    } catch (err) {
      msg.textContent = "O tema mudou neste aparelho, mas não foi salvo na conta. Tente de novo.";
    }
  });

  el("pf-sair").addEventListener("click", pedirSaida);
}

/* =========================================================
   PÁGINA RELAXAR: RELÓGIO
   Relógio analógico em SVG (ponteiros girados a cada segundo) e hora digital.
   Com login, mostra quanto falta para a hora de deitar de hoje.
   ========================================================= */
const RELOGIO_CENTRO = 120;

function montarRelogio() {
  const C = RELOGIO_CENTRO;
  const ponto = (graus, raio) => {
    const a = (graus * Math.PI) / 180;
    return [+(C + raio * Math.sin(a)).toFixed(2), +(C - raio * Math.cos(a)).toFixed(2)];
  };
  let marcas = "";
  for (let i = 0; i < 60; i += 1) {
    const longa = i % 5 === 0;
    const [x1, y1] = ponto(i * 6, longa ? 92 : 97);
    const [x2, y2] = ponto(i * 6, 103);
    marcas += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ra-marca${longa ? " longa" : ""}" />`;
  }
  const numeros = [12, 3, 6, 9].map((n, i) => {
    const [x, y] = ponto(i * 90, 76);
    return `<text x="${x}" y="${y}" class="ra-num">${n}</text>`;
  }).join("");
  el("relogio-analogico").innerHTML = `
    <circle cx="${C}" cy="${C}" r="112" class="ra-aro" />
    ${marcas}
    ${numeros}
    <line id="ra-h" x1="${C}" y1="${C + 12}" x2="${C}" y2="${C - 52}" class="ra-h" />
    <line id="ra-m" x1="${C}" y1="${C + 14}" x2="${C}" y2="${C - 80}" class="ra-m" />
    <line id="ra-s" x1="${C}" y1="${C + 20}" x2="${C}" y2="${C - 90}" class="ra-s" />
    <circle cx="${C}" cy="${C}" r="6" class="ra-centro" />`;
}

/* 45 -> "45 min"; 135 -> "2h15" */
function formatarFalta(minutos) {
  return minutos < 60 ? `${minutos} min` : formatarDuracao(minutos);
}

function atualizarRelogio() {
  const agora = new Date();
  const horas = agora.getHours();
  const minutos = agora.getMinutes();
  const segundos = agora.getSeconds();
  const C = RELOGIO_CENTRO;
  const girar = (id, graus) => el(id).setAttribute("transform", `rotate(${graus.toFixed(2)} ${C} ${C})`);

  girar("ra-h", ((horas % 12) + minutos / 60) * 30);
  girar("ra-m", (minutos + segundos / 60) * 6);
  girar("ra-s", segundos * 6);
  el("hora-digital").innerHTML = `${pad2(horas)}:${pad2(minutos)}<span>:${pad2(segundos)}</span>`;
  el("data-hoje").textContent = formatarDataLonga(hojeChave());
  el("relogio-analogico").setAttribute("aria-label", `Relógio marcando ${pad2(horas)}:${pad2(minutos)}`);

  const aviso = el("relaxar-deitar");
  if (!estado.pronto || !estado.usuario) {
    aviso.hidden = true;
  } else {
    const r = resumoDoDia(hojeChave());
    const agoraMin = horas * 60 + minutos;
    const janela = (r.acordar - r.deitar + 1440) % 1440;
    const desdeDeitar = (agoraMin - r.deitar + 1440) % 1440;
    aviso.hidden = false;
    aviso.textContent = desdeDeitar < janela
      ? `Hora de descansar. Deitando agora, você acorda às ${formatarHora(r.acordar)}.`
      : `Hora de deitar hoje: ${formatarHora(r.deitar)} · faltam ${formatarFalta((r.deitar - agoraMin + 1440) % 1440)}`;
  }
  atualizarRestante();
}

/* =========================================================
   PÁGINA RELAXAR: SONS
   Os sons são gerados pela Web Audio API do navegador, sem arquivos,
   então funcionam em qualquer hospedagem.
   Para criar um som novo: escreva uma função criar(ctx, saida) que liga
   os nós de áudio em "saida" e devolve uma função que para o som,
   e inclua o som na lista SONS.
   ========================================================= */
/* grupo: rótulo no cartão. reverb: quanto do eco de sala compartilhado o som recebe (0 a 1). */
const SONS = [
  { id: "piano-noturno", grupo: "Piano", nome: "Piano noturno", descricao: "Acordes lentos com uma melodia suave", reverb: 0.55, criar: somPianoNoturno },
  { id: "piano-ninar", grupo: "Piano", nome: "Piano de ninar", descricao: "Valsa calma, como uma canção de ninar", reverb: 0.5, criar: somPianoNinar },
  { id: "piano", grupo: "Piano", nome: "Piano contemplativo", descricao: "Notas soltas sobre um fundo calmo", reverb: 0.6, criar: somPiano },
  { id: "chuva", grupo: "Natureza", nome: "Chuva suave", descricao: "Chuva constante com gotas leves", reverb: 0, criar: somChuva },
  { id: "mar", grupo: "Natureza", nome: "Ondas do mar", descricao: "Ondas que vêm e vão devagar", reverb: 0.1, criar: somMar },
  { id: "marrom", grupo: "Ruído", nome: "Ruído marrom", descricao: "Som grave e contínuo para dormir", reverb: 0, criar: somRuidoMarrom },
];

/* Misturas prontas: som e volume (0 a 100) */
const MISTURAS = [
  { nome: "Piano na chuva", sons: { "piano-noturno": 70, chuva: 45 } },
  { nome: "Beira-mar", sons: { mar: 70, piano: 40 } },
  { nome: "Sono profundo", sons: { marrom: 55, "piano-ninar": 40 } },
  { nome: "Noite completa", sons: { "piano-noturno": 60, chuva: 35, marrom: 25 } },
];

const MAX_SONS = 3; // quantos sons podem tocar juntos

const player = {
  ctx: null,
  mestre: null,
  reverb: null,
  ativos: new Map(), // id do som → nós de áudio e função para parar
  volumes: {},       // volume escolhido em cada som (0 a 100)
  ruidos: {},
  timer: null,
  timerFade: null,
  fim: 0,
  total: 0,
  ultimoAviso: "",
};

/* Cria o áudio no primeiro toque (os navegadores só liberam som após um clique) */
function prepararAudio() {
  const Contexto = window.AudioContext || window.webkitAudioContext;
  if (!Contexto) throw new ErroAmigavel("Este navegador não consegue tocar os sons.");
  if (!player.ctx) {
    player.ctx = new Contexto();
    player.mestre = player.ctx.createGain();
    player.mestre.gain.value = 0;
    player.mestre.connect(player.ctx.destination);
    // Eco de sala compartilhado pelos sons (principalmente os pianos)
    player.reverb = player.ctx.createConvolver();
    player.reverb.buffer = respostaReverb(player.ctx, 3.2);
    player.reverb.connect(player.mestre);
  }
  if (player.ctx.state === "suspended") player.ctx.resume();
  return player.ctx;
}

/* Ruído de 6 s em loop: "branco", "rosa" (mais suave) ou "marrom" (mais grave).
   O fim é misturado com o começo para o loop não estalar. */
function bufferRuido(ctx, tipo) {
  if (player.ruidos[tipo]) return player.ruidos[tipo];
  const tamanho = Math.floor(ctx.sampleRate * 6);
  const mistura = Math.floor(ctx.sampleRate * 0.5);
  const buffer = ctx.createBuffer(2, tamanho, ctx.sampleRate);
  for (let canal = 0; canal < 2; canal += 1) {
    const bruto = new Float32Array(tamanho + mistura);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, ultimo = 0;
    for (let i = 0; i < bruto.length; i += 1) {
      const branco = Math.random() * 2 - 1;
      if (tipo === "marrom") {
        ultimo = (ultimo + 0.02 * branco) / 1.02;
        bruto[i] = ultimo * 3.5;
      } else if (tipo === "rosa") {
        b0 = 0.99886 * b0 + branco * 0.0555179;
        b1 = 0.99332 * b1 + branco * 0.0750759;
        b2 = 0.969 * b2 + branco * 0.153852;
        b3 = 0.8665 * b3 + branco * 0.3104856;
        b4 = 0.55 * b4 + branco * 0.5329522;
        b5 = -0.7616 * b5 - branco * 0.016898;
        bruto[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + branco * 0.5362) * 0.11;
        b6 = branco * 0.115926;
      } else {
        bruto[i] = branco;
      }
    }
    const dados = buffer.getChannelData(canal);
    for (let i = 0; i < tamanho; i += 1) {
      dados[i] = i < mistura
        ? bruto[i] * Math.sqrt(i / mistura) + bruto[tamanho + i] * Math.sqrt(1 - i / mistura)
        : bruto[i];
    }
  }
  player.ruidos[tipo] = buffer;
  return buffer;
}

function fonteRuido(ctx, tipo) {
  const fonte = ctx.createBufferSource();
  fonte.buffer = bufferRuido(ctx, tipo);
  fonte.loop = true;
  fonte.start(0, Math.random() * fonte.buffer.duration);
  return fonte;
}

function somChuva(ctx, saida) {
  const fonte = fonteRuido(ctx, "rosa");
  const tiraGrave = ctx.createBiquadFilter();
  tiraGrave.type = "highpass";
  tiraGrave.frequency.value = 350;
  const tiraAgudo = ctx.createBiquadFilter();
  tiraAgudo.type = "lowpass";
  tiraAgudo.frequency.value = 4500;
  const volume = ctx.createGain();
  volume.gain.value = 0.8;
  fonte.connect(tiraGrave).connect(tiraAgudo).connect(volume).connect(saida);

  // Gotas: estalos curtos de ruído filtrado em intervalos aleatórios
  let ativo = true;
  let espera;
  const gota = () => {
    if (!ativo) return;
    const t = ctx.currentTime;
    const ruido = ctx.createBufferSource();
    ruido.buffer = bufferRuido(ctx, "branco");
    const filtro = ctx.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.frequency.value = 1800 + Math.random() * 3500;
    filtro.Q.value = 6;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, t);
    envelope.gain.exponentialRampToValueAtTime(0.08 + Math.random() * 0.25, t + 0.004);
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + 0.06 + Math.random() * 0.05);
    ruido.connect(filtro).connect(envelope).connect(saida);
    ruido.start(t, Math.random() * 5);
    ruido.stop(t + 0.15);
    espera = setTimeout(gota, 30 + Math.random() * 220);
  };
  gota();
  return () => { ativo = false; clearTimeout(espera); fonte.stop(); };
}

function somMar(ctx, saida) {
  const fundo = fonteRuido(ctx, "marrom");
  const espumaFonte = fonteRuido(ctx, "rosa");
  const filtro = ctx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = 700;
  filtro.Q.value = 0.7;
  const espuma = ctx.createGain();
  espuma.gain.value = 0.12;
  const onda = ctx.createGain();
  onda.gain.value = 0.5;
  fundo.connect(filtro);
  espumaFonte.connect(espuma).connect(filtro);
  filtro.connect(onda).connect(saida);

  // Uma oscilação lenta (cerca de 11 s por onda) abre o filtro e aumenta o volume
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.09;
  const lfoFiltro = ctx.createGain();
  lfoFiltro.gain.value = 500;
  const lfoVolume = ctx.createGain();
  lfoVolume.gain.value = 0.4;
  lfo.connect(lfoFiltro).connect(filtro.frequency);
  lfo.connect(lfoVolume).connect(onda.gain);
  lfo.start();
  return () => { fundo.stop(); espumaFonte.stop(); lfo.stop(); };
}

function somRuidoMarrom(ctx, saida) {
  const fonte = fonteRuido(ctx, "marrom");
  const filtro = ctx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = 900;
  const volume = ctx.createGain();
  volume.gain.value = 0.9;
  fonte.connect(filtro).connect(volume).connect(saida);
  return () => fonte.stop();
}

/* Eco de sala para o piano */
function respostaReverb(ctx, segundos) {
  const tamanho = Math.floor(ctx.sampleRate * segundos);
  const buffer = ctx.createBuffer(2, tamanho, ctx.sampleRate);
  for (let canal = 0; canal < 2; canal += 1) {
    const dados = buffer.getChannelData(canal);
    for (let i = 0; i < tamanho; i += 1) dados[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / tamanho, 3);
  }
  return buffer;
}

/* Frequência de uma nota MIDI (60 = dó central) */
const freqMidi = (nota) => 440 * 2 ** ((nota - 69) / 12);

/* Pequeno desvio de tempo, como num pianista de verdade */
const humano = () => (Math.random() - 0.5) * 0.024;

/* Nota de piano sintetizada: harmônicos levemente desafinados (como numa corda real),
   brilho que diminui com o tempo e queda longa. quando: tempo do relógio do áudio. */
function notaPiano(ctx, saida, midi, quando, intensidade = 0.5, duracao = 4) {
  const freq = freqMidi(midi);
  const inicio = Math.max(quando, ctx.currentTime);
  const filtro = ctx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.setValueAtTime(Math.min(9000, freq * 6 + 2000 * intensidade), inicio);
  filtro.frequency.exponentialRampToValueAtTime(Math.max(400, freq * 1.5), inicio + duracao);
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0.0001, inicio);
  envelope.gain.exponentialRampToValueAtTime(0.2 * intensidade, inicio + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.07 * intensidade, inicio + 0.5);
  envelope.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  filtro.connect(envelope).connect(saida);
  [[1, 1], [2, 0.45], [3, 0.2], [4, 0.1]].forEach(([n, nivel]) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = freq * n * Math.sqrt(1 + 0.0004 * n * n);
    const ganho = ctx.createGain();
    ganho.gain.setValueAtTime(nivel, inicio);
    ganho.gain.exponentialRampToValueAtTime(nivel * 0.02, inicio + duracao / Math.sqrt(n)); // agudos somem antes
    osc.connect(ganho).connect(filtro);
    osc.start(inicio);
    osc.stop(inicio + duracao + 0.05);
  });
}

/* Agenda as notas com antecedência no relógio do áudio, para o ritmo não falhar
   mesmo com a aba em segundo plano. Devolve a função que para a música. */
function sequenciador(ctx, segundosPorPasso, aoPasso) {
  let passo = 0;
  let proximo = ctx.currentTime + 0.15;
  const agendar = () => {
    while (proximo < ctx.currentTime + 1.5) {
      aoPasso(passo, proximo);
      passo += 1;
      proximo += segundosPorPasso;
    }
  };
  agendar();
  const id = setInterval(agendar, 200);
  return () => clearInterval(id);
}

/* Piano noturno: acordes arpejados bem devagar (dó com sétima, lá menor, fá com
   sétima e sol) e uma melodia que caminha por notas próximas da escala pentatônica */
function somPianoNoturno(ctx, saida) {
  const acordes = [
    { baixo: 36, notas: [60, 64, 67, 71] }, // Dó com 7ª maior
    { baixo: 45, notas: [57, 60, 64, 67] }, // Lá menor com 7ª
    { baixo: 41, notas: [53, 57, 60, 64] }, // Fá com 7ª maior
    { baixo: 43, notas: [55, 59, 62, 64] }, // Sol com 6ª
  ];
  const escalaMelodia = [72, 74, 76, 79, 81, 84];
  const arpejo = [0, 1, 2, 3, 2, 1, 2, 1];
  const chanceMelodia = { 0: 0.75, 3: 0.35, 4: 0.55, 6: 0.3 };
  let melodia = 76;
  return sequenciador(ctx, 60 / 64 / 2, (passo, t) => { // colcheias a 64 batidas por minuto
    const acorde = acordes[Math.floor(passo / 16) % acordes.length]; // cada acorde dura 2 compassos
    const p = passo % 8;
    if (passo % 16 === 0) notaPiano(ctx, saida, acorde.baixo, t + humano(), 0.55, 6);
    notaPiano(ctx, saida, acorde.notas[arpejo[p]], t + humano(), 0.2 + Math.random() * 0.08, 3.2);
    if (Math.random() < (chanceMelodia[p] || 0)) {
      const vizinhas = escalaMelodia.filter((n) => n !== melodia && Math.abs(n - melodia) <= 5);
      melodia = vizinhas[Math.floor(Math.random() * vizinhas.length)] || 76;
      notaPiano(ctx, saida, melodia, t + humano(), 0.38 + Math.random() * 0.1, 3.6);
    }
  });
}

/* Piano de ninar: valsa lenta em compasso de três, com melodia original.
   Baixo no primeiro tempo e acorde suave nos outros dois. A melodia alterna
   entre a altura normal e uma oitava acima, mais delicada, como uma caixinha de música. */
function somPianoNinar(ctx, saida) {
  // Cada posição é um tempo: [nota MIDI, duração em tempos]; null continua a nota anterior
  const melodia = [
    [76, 2], null, [74, 1], [72, 2], null, [74, 1],
    [76, 1], [79, 1], [76, 1], [74, 3], null, null,
    [72, 2], null, [74, 1], [76, 2], null, [72, 1],
    [74, 1], [71, 1], [74, 1], [72, 3], null, null,
  ];
  const compassos = [
    { baixo: 48, notas: [55, 60, 64] }, { baixo: 43, notas: [55, 59, 62] },
    { baixo: 48, notas: [55, 60, 64] }, { baixo: 43, notas: [55, 59, 62] },
    { baixo: 41, notas: [57, 60, 65] }, { baixo: 48, notas: [55, 60, 64] },
    { baixo: 43, notas: [55, 59, 62] }, { baixo: 48, notas: [55, 60, 64] },
  ];
  const segundosPorTempo = 60 / 76;
  return sequenciador(ctx, segundosPorTempo, (passo, t) => {
    const volta = Math.floor(passo / melodia.length);
    const tempo = passo % melodia.length;
    const compasso = compassos[Math.floor(tempo / 3)];
    if (tempo % 3 === 0) notaPiano(ctx, saida, compasso.baixo, t + humano(), 0.42, 4.5);
    else compasso.notas.forEach((n, i) => notaPiano(ctx, saida, n, t + humano() + i * 0.012, 0.12, 2.2));
    const nota = melodia[tempo];
    if (nota) {
      const oitava = volta % 2 === 1 ? 12 : 0;
      notaPiano(ctx, saida, nota[0] + oitava, t + humano(), oitava ? 0.26 : 0.4, Math.max(2.5, nota[1] * segundosPorTempo + 1.5));
    }
  });
}

/* Piano contemplativo: notas soltas da pentatônica de dó sobre um acorde contínuo */
function somPiano(ctx, saida) {
  const entrada = saida; // o eco de sala vem do envio compartilhado (SONS[].reverb)

  // Fundo: acorde grave e contínuo (dó, sol e dó)
  const fundo = [130.81, 196.0, 261.63].map((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = (i - 1) * 5;
    const ganho = ctx.createGain();
    ganho.gain.value = 0.03;
    osc.connect(ganho).connect(entrada);
    osc.start();
    return osc;
  });

  // Melodia: notas da escala pentatônica de dó, sorteadas sem pressa
  const escala = [60, 62, 64, 67, 69, 72, 74, 76];
  let ativo = true;
  let espera;
  const proxima = () => {
    if (!ativo) return;
    const nota = escala[Math.floor(Math.random() * escala.length)];
    notaPiano(ctx, entrada, nota, ctx.currentTime + 0.02, 0.5, 4.5);
    if (Math.random() < 0.25) notaPiano(ctx, entrada, nota - 12, ctx.currentTime + 0.02, 0.3, 5);
    espera = setTimeout(proxima, 1300 + Math.random() * 2400);
  };
  espera = setTimeout(proxima, 600);
  return () => { ativo = false; clearTimeout(espera); fundo.forEach((osc) => osc.stop()); };
}

/* Volume geral em curva quadrática, que soa mais natural ao ouvido */
function aplicarVolume() {
  if (!player.ctx) return;
  const v = Number(el("som-volume").value) / 100;
  const t = player.ctx.currentTime;
  player.mestre.gain.cancelScheduledValues(t);
  player.mestre.gain.setTargetAtTime(v * v, t, 0.1);
}

function volumeDoSom(id) {
  return (player.volumes[id] ?? 60) / 100;
}

/* Liga um som no mixer. Cada som tem: entrada (aparece e some devagar) →
   volume próprio → volume geral, e um envio opcional para o eco de sala. */
function ligarSom(id, volume) {
  if (player.ativos.has(id)) return true;
  if (player.ativos.size >= MAX_SONS) {
    player.ultimoAviso = `Dá para misturar até ${MAX_SONS} sons. Desligue um para ligar outro.`;
    return false;
  }
  let ctx;
  try {
    ctx = prepararAudio();
  } catch (err) {
    player.ultimoAviso = err.message;
    return false;
  }
  const som = SONS.find((s) => s.id === id);
  if (volume != null) player.volumes[id] = volume;
  const t = ctx.currentTime;
  const entrada = ctx.createGain();
  entrada.gain.setValueAtTime(0, t);
  entrada.gain.linearRampToValueAtTime(1, t + 2.5);
  const volumeNo = ctx.createGain();
  volumeNo.gain.value = volumeDoSom(id) ** 2;
  entrada.connect(volumeNo).connect(player.mestre);
  let envio = null;
  if (som.reverb) {
    envio = ctx.createGain();
    envio.gain.value = som.reverb;
    volumeNo.connect(envio).connect(player.reverb);
  }
  player.ativos.set(id, { entrada, volumeNo, envio, parar: som.criar(ctx, entrada) });
  if (player.ativos.size === 1) {
    aplicarVolume();
    reiniciarTimerSom(); // o tempo começa a contar com o primeiro som
  }
  return true;
}

function desligarSom(id) {
  const faixa = player.ativos.get(id);
  if (!faixa) return;
  player.ativos.delete(id);
  const t = player.ctx.currentTime;
  faixa.entrada.gain.cancelScheduledValues(t);
  faixa.entrada.gain.setValueAtTime(faixa.entrada.gain.value, t);
  faixa.entrada.gain.linearRampToValueAtTime(0, t + 1.5);
  setTimeout(() => {
    faixa.parar();
    faixa.volumeNo.disconnect();
    if (faixa.envio) faixa.envio.disconnect();
  }, 1700);
  if (!player.ativos.size) limparTimerSom();
}

function alternarSom(id) {
  player.ultimoAviso = "";
  const ok = player.ativos.has(id) ? (desligarSom(id), true) : ligarSom(id);
  renderizarPlayer();
  if (!ok && player.ultimoAviso) el("som-status").textContent = player.ultimoAviso;
}

function pararTudo() {
  [...player.ativos.keys()].forEach(desligarSom);
  limparTimerSom();
  renderizarPlayer();
}

/* Mistura pronta: desliga o que não faz parte dela e ajusta os volumes */
function aplicarMistura(indice) {
  const mistura = MISTURAS[indice];
  [...player.ativos.keys()].filter((id) => !(id in mistura.sons)).forEach(desligarSom);
  Object.entries(mistura.sons).forEach(([id, volume]) => {
    player.volumes[id] = volume;
    const faixa = player.ativos.get(id);
    if (faixa) faixa.volumeNo.gain.setTargetAtTime((volume / 100) ** 2, player.ctx.currentTime, 0.1);
    else ligarSom(id, volume);
  });
  renderizarPlayer();
}

/* --- Tempo: opções prontas ou "Outro tempo" (horas e minutos, até 12h59) --- */
function minutosEscolhidos() {
  const opcao = document.querySelector('input[name="tempo"]:checked');
  if (!opcao) return 0;
  if (opcao.value !== "livre") return Number(opcao.value);
  const horas = Math.min(12, Math.max(0, Math.floor(Number(el("tempo-horas").value) || 0)));
  const minutos = Math.min(59, Math.max(0, Math.floor(Number(el("tempo-minutos").value) || 0)));
  return horas * 60 + minutos;
}

function limparTimerSom() {
  clearTimeout(player.timer);
  clearTimeout(player.timerFade);
  player.timer = null;
  player.timerFade = null;
  player.fim = 0;
  player.total = 0;
  aplicarVolume(); // desfaz um fade final que estivesse em andamento
  atualizarRestante();
}

/* Conta o tempo escolhido; nos últimos segundos o volume desce devagar até parar */
function reiniciarTimerSom() {
  limparTimerSom();
  const minutos = minutosEscolhidos();
  if (!player.ativos.size || !minutos) return;
  const ms = minutos * 60000;
  const fade = Math.min(30000, ms / 4);
  player.total = ms;
  player.fim = Date.now() + ms;
  player.timerFade = setTimeout(() => {
    const t = player.ctx.currentTime;
    player.mestre.gain.cancelScheduledValues(t);
    player.mestre.gain.setValueAtTime(player.mestre.gain.value, t);
    player.mestre.gain.linearRampToValueAtTime(0.0001, t + fade / 1000);
  }, ms - fade);
  player.timer = setTimeout(() => {
    pararTudo();
    mostrarToast("O tempo acabou e os sons se despediram. Boa noite!", 5000);
  }, ms);
  atualizarRestante();
}

function atualizarRestante() {
  const texto = el("som-restante");
  const barra = el("som-progresso");
  if (!player.ativos.size) {
    texto.textContent = "";
    barra.style.width = "0%";
    return;
  }
  if (!player.fim) {
    texto.textContent = "· sem limite de tempo";
    barra.style.width = "0%";
    return;
  }
  const restante = Math.max(0, player.fim - Date.now());
  const s = Math.round(restante / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  texto.textContent = `· desliga em ${h ? `${h}h${pad2(m)}` : `${m}:${pad2(s % 60)}`}`;
  barra.style.width = `${Math.min(100, (1 - restante / player.total) * 100)}%`;
}

function nomesTocando() {
  return [...player.ativos.keys()].map((id) => SONS.find((s) => s.id === id).nome);
}

function renderizarPlayer() {
  el("faixas").querySelectorAll(".faixa").forEach((cartao) => {
    const id = cartao.dataset.som;
    const ativo = player.ativos.has(id);
    cartao.dataset.ativo = String(ativo);
    cartao.querySelector(".faixa-botao").setAttribute("aria-pressed", String(ativo));
    cartao.querySelector("[data-volume-som]").value = player.volumes[id] ?? 60;
  });
  const nomes = nomesTocando();
  el("som-parar").disabled = !nomes.length;
  el("som-status").textContent = nomes.length ? `Tocando: ${juntarLista(nomes)}` : "Silêncio por enquanto. Escolha um som para começar.";
  el("mixer-contagem").textContent = `${nomes.length} de ${MAX_SONS} sons ligados`;
  atualizarRestante();
  atualizarMiniPlayer();
}

/* Mini player: fora da página Relaxar, mostra o que está tocando e permite parar */
function atualizarMiniPlayer() {
  const nomes = nomesTocando();
  el("mini-player").hidden = !nomes.length || paginaAtual === "relaxar";
  el("mini-player-texto").textContent = `Tocando: ${juntarLista(nomes)}`;
}

function iniciarRelaxar() {
  el("faixas").innerHTML = SONS.map((s) => `
    <div class="faixa" data-som="${s.id}" data-ativo="false">
      <button type="button" class="faixa-botao" aria-pressed="false" data-alternar="${s.id}">
        <span class="barras" aria-hidden="true"><span></span><span></span><span></span></span>
        <span class="faixa-grupo">${escaparHtml(s.grupo)}</span>
        <strong>${escaparHtml(s.nome)}</strong>
        <small>${escaparHtml(s.descricao)}</small>
      </button>
      <label class="faixa-volume">Volume
        <input type="range" id="vol-${s.id}" min="0" max="100" value="${player.volumes[s.id] ?? 60}" data-volume-som="${s.id}" aria-label="Volume de ${escaparHtml(s.nome)}" />
      </label>
    </div>`).join("");
  el("misturas").innerHTML = MISTURAS.map((m, i) => `<button type="button" class="chip-noite" data-mistura="${i}">${escaparHtml(m.nome)}</button>`).join("");

  el("faixas").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-alternar]");
    if (botao) alternarSom(botao.dataset.alternar);
  });
  el("faixas").addEventListener("input", (e) => {
    const controle = e.target.closest("[data-volume-som]");
    if (!controle) return;
    const id = controle.dataset.volumeSom;
    player.volumes[id] = Number(controle.value);
    const faixa = player.ativos.get(id);
    if (faixa) faixa.volumeNo.gain.setTargetAtTime((Number(controle.value) / 100) ** 2, player.ctx.currentTime, 0.1);
  });
  el("misturas").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-mistura]");
    if (botao) aplicarMistura(Number(botao.dataset.mistura));
  });
  el("som-parar").addEventListener("click", pararTudo);
  el("mini-player-parar").addEventListener("click", pararTudo);
  el("som-volume").addEventListener("input", () => {
    // Durante o fade final, o volume geral fica com o fade
    if (!player.fim || player.fim - Date.now() > 30000) aplicarVolume();
  });
  el("tempo-opcoes").addEventListener("change", () => {
    el("tempo-livre").hidden = document.querySelector('input[name="tempo"]:checked').value !== "livre";
    reiniciarTimerSom();
  });
  ["tempo-horas", "tempo-minutos"].forEach((id) => el(id).addEventListener("change", reiniciarTimerSom));

  montarRelogio();
  atualizarRelogio();
  setInterval(() => { if (!el("view-relaxar").hidden) atualizarRelogio(); }, 1000);
}

/* =========================================================
   NAVEGAÇÃO ENTRE AS PÁGINAS (pelo # do endereço)
   #rotina, #sono, #relaxar e #perfil abrem essas páginas. Qualquer outro #
   mostra a página inicial e rola até a seção com aquele id.
   Para uma página nova: crie <div id="view-NOME" hidden> e inclua NOME em PAGINAS.
   ========================================================= */
const PAGINAS = ["inicio", "rotina", "sono", "relaxar", "perfil"];
const PAGINAS_SO_VISITANTES = ["inicio"];   // somem depois do login
const PAGINA_INICIAL_LOGADO = "rotina";     // para onde vai quem já entrou
let paginaAtual = null;

/* Redesenha o que depende do login, sem mudar de página */
function atualizarTela() {
  renderizarRotina();
  renderizarSono();
  renderizarPerfil();
  if (!el("view-relaxar").hidden) atualizarRelogio();
  atualizarMiniPlayer();
}

/* Leva o foco ao título da página (ajuda quem usa teclado ou leitor de tela) */
function focarTitulo(pagina) {
  const titulo = [...el(`view-${pagina}`).querySelectorAll("h1")].find((h) => h.offsetParent !== null);
  if (!titulo) return;
  titulo.setAttribute("tabindex", "-1");
  titulo.focus({ preventScroll: true });
}

function irPara(rota) {
  if (location.hash === "#" + rota) mostrarRota();
  else location.hash = rota;
}

function mostrarRota() {
  const rota = location.hash.slice(1);
  const pagina = PAGINAS.includes(rota) ? rota : "inicio";
  // Quem já entrou não vê a página inicial (nem as seções dela): vai direto para a rotina
  if (estado.usuario && PAGINAS_SO_VISITANTES.includes(pagina)) {
    try {
      history.replaceState(null, "", "#" + PAGINA_INICIAL_LOGADO);
    } catch (e) {
      location.hash = PAGINA_INICIAL_LOGADO; // o hashchange chama mostrarRota de novo
      return;
    }
    mostrarRota();
    return;
  }
  const mudou = paginaAtual !== pagina;
  paginaAtual = pagina;
  PAGINAS.forEach((p) => { el(`view-${p}`).hidden = p !== pagina; });

  document.querySelectorAll("#nav-links a, #abas a").forEach((a) => {
    if (a.getAttribute("href") === `#${pagina}`) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  if (pagina === "rotina") renderizarRotina();
  if (pagina === "sono") renderizarSono();
  if (pagina === "perfil") renderizarPerfil();
  if (pagina === "relaxar") atualizarRelogio();
  atualizarMiniPlayer();
  if (pagina !== "relaxar" && respiracao.ativa) pararRespiracao(); // a respiração para ao sair da página
  if (pagina === "rotina" || pagina === "sono") agendarDicaDoDia();

  if (pagina !== "inicio" || rota === "inicio") {
    window.scrollTo(0, 0);
    if (mudou && pagina !== "inicio") focarTitulo(pagina);
  } else if (/^[\w-]+$/.test(rota)) {
    const alvo = document.getElementById(rota);
    if (alvo) alvo.scrollIntoView();
  }
}

/* =========================================================
   INICIALIZAÇÃO (não precisa editar)
   ========================================================= */
(async function iniciar() {
  // Cada página cuida da própria rolagem (ao recarregar, não volta para o meio da página anterior)
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  document.querySelectorAll("[data-site-name]").forEach((n) => { n.textContent = CONFIG.nome; });
  montarNavegacao();
  el("ano").textContent = new Date().getFullYear();

  montarMarquee();
  iniciarLanding();
  iniciarInstalacao();
  iniciarModoOffline();
  iniciarCalculadora();
  iniciarAutenticacao();
  iniciarForcaSenha();
  iniciarRotina();
  iniciarHoje();
  iniciarSono();
  iniciarPerfil();
  iniciarRelaxar();
  iniciarRespiracao();
  iniciarEmocional();
  iniciarHistoricoEmocional();
  iniciarRelatorio();
  iniciarConta();
  iniciarMudarSenha();
  iniciarDicas();
  renderizarIntegracoes();
  window.addEventListener("hashchange", mostrarRota);

  // Link de confirmação do e-mail volta com o token no endereço
  // (fluxo PKCE: ?code=...; tokens no #endereço são recusados e apagados da barra de endereço)
  const veioDoEmail = /[?&]code=/.test(location.search);
  if (/access_token|refresh_token|provider_token/.test(location.hash)) {
    history.replaceState(null, "", location.pathname + location.search);
  }
  // Link de "Esqueci minha senha": ?token_hash=...&type=recovery. Sai do endereço na hora
  // (não fica no histórico nem em links copiados) e é validado depois que o banco conecta.
  const parametros = new URLSearchParams(location.search);
  const tokenRecuperacao = parametros.get("type") === "recovery" && /^[\w-]{10,200}$/.test(parametros.get("token_hash") || "")
    ? parametros.get("token_hash") : null;
  if (parametros.has("token_hash") || parametros.get("type") === "recovery") {
    parametros.delete("token_hash");
    parametros.delete("type");
    const resto = parametros.toString();
    history.replaceState(null, "", location.pathname + (resto ? `?${resto}` : "") + location.hash);
  }
  mostrarRota();

  DB = await escolherBanco();
  bancoDefinido = true;
  atualizarStatusDados();
  if (DB.tipo === "local") {
    const texto = DB_CONFIG.provedor === "supabase"
      ? "Modo demonstração: não deu para conectar ao servidor, então os seus dados ficam só neste navegador."
      : "Modo demonstração: seus dados ficam só neste navegador.";
    document.querySelectorAll(".aviso-modo").forEach((aviso) => {
      aviso.hidden = false;
      aviso.textContent = texto;
    });
  }

  if (DB.tipo === "indisponivel") {
    const aviso = "Sem conexão com o servidor agora. Confira a sua internet e recarregue a página para entrar.";
    el("rotina-bloqueio").querySelector("p").textContent = aviso;
    el("perfil-bloqueio").querySelector("p").textContent = aviso;
    el("sono-bloqueio").querySelector("p").textContent = aviso;
  }

  // Esqueci minha senha: valida o link. A sessão dele só serve para trocar a senha,
  // por isso o site não entra na conta com ela (nem se a página for recarregada no meio).
  let recuperacao = null;
  let erroRecuperacao = "";
  if (tokenRecuperacao && DB.tipo === "supabase") {
    try { recuperacao = await DB.validarLinkRecuperacao(tokenRecuperacao); }
    catch (err) { erroRecuperacao = err instanceof ErroAmigavel ? err.message : "Esse link expirou ou já foi usado. Peça um novo aqui embaixo."; }
  } else if (veioDoEmail && DB.tipo === "supabase" && DB.cliente) {
    // E-mail padrão do Supabase: a troca do ?code= acontece ao iniciar a biblioteca
    try { await DB.cliente.auth.getSession(); } catch (e) { /* segue */ }
    await new Promise((ok) => setTimeout(ok, 50)); // o aviso PASSWORD_RECOVERY chega logo depois
    if (DB_SUPABASE.recuperacaoPorLink) {
      recuperacao = DB_SUPABASE.recuperacaoPorLink;
      DB_SUPABASE.recuperacaoPorLink = null;
    } else if (/[?&]code=/.test(location.search)) {
      erroRecuperacao = "Esse link não abriu aqui. Abra o link no mesmo navegador em que você pediu a senha nova, ou peça um novo aqui embaixo.";
    }
  } else if (recuperacaoFicouPendente()) {
    marcarRecuperacaoPendente(false);
    await DB.cancelarRecuperacao().catch(() => {});
  }

  if (!recuperacao) {
    try {
      const usuario = await DB.usuarioAtual();
      if (usuario) await definirUsuario(usuario);
    } catch (e) { /* segue sem usuário conectado */ }
  }
  vigiarSessao();

  estado.pronto = true;
  atualizarAreasVisitante(); // corrige a marca de sessão se ela expirou
  atualizarBarraConexao();
  document.documentElement.removeAttribute("data-sessao");
  if (veioDoEmail && /[?&]code=/.test(location.search)) {
    // Código já usado ou de outro aparelho: tira do endereço (o e-mail já foi confirmado; é só entrar)
    const endereco = new URL(location.href);
    endereco.searchParams.delete("code");
    history.replaceState(null, "", endereco.pathname + endereco.search + endereco.hash);
  }
  if (veioDoEmail && estado.usuario) irPara("rotina");
  else if (estado.usuario && paginaAtual === "inicio") mostrarRota(); // leva para Minha rotina
  else atualizarTela();
  if (recuperacao) abrirRedefinirSenha(recuperacao);
  else if (erroRecuperacao) {
    abrirConta("recuperar");
    mensagemConta(erroRecuperacao, "erro");
  }
  if (paginaAtual === "rotina" || paginaAtual === "sono") agendarDicaDoDia();

  // Lembretes: confere agora e a cada 30 segundos
  verificarLembretes();
  setInterval(verificarLembretes, 30000);
})();
