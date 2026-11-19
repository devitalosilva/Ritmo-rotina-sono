/* =========================================================
   SERVICE WORKER DO RITMO
   Deixa o site instalável como app e faz ele abrir mesmo sem internet.

   - A página (index.html), o script (js/) e o estilo (css/) vêm sempre da rede
     primeiro, para página, script e estilo serem sempre da mesma versão. Sem
     internet, usam a última cópia guardada.
   - Biblioteca (vendor/, com a versão no nome), ícones e capturas respondem com a
     cópia guardada e se atualizam em segundo plano.
   - Pedidos para outros endereços (Supabase, Google Fonts) não passam por aqui:
     dados da conta nunca ficam guardados no cache.

   Ao mudar a lista ARQUIVOS, troque também VERSAO (ex.: "ritmo-v2"): o cache
   antigo é apagado quando a versão nova assume.
   ========================================================= */
const VERSAO = "ritmo-v2";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/app.css",
  "./js/tema.js",
  "./js/app.js",
  "./vendor/supabase-js-2.117.3.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSAO)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(
        nomes.filter((nome) => nome.startsWith("ritmo-") && nome !== VERSAO).map((nome) => caches.delete(nome))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return; // Supabase e fontes: direto pela rede

  // Página: rede primeiro; sem internet, a última cópia
  if (pedido.mode === "navigate") {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone();
            caches.open(VERSAO).then((cache) => cache.put("./index.html", copia));
          }
          return resposta;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Script, estilo e manifesto: rede primeiro (mesma versão da página); sem internet, a cópia
  if (!/\/(vendor|icons|screenshots)\//.test(url.pathname)) {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone();
            caches.open(VERSAO).then((cache) => cache.put(pedido, copia));
          }
          return resposta;
        })
        .catch(() => caches.match(pedido, { ignoreSearch: true }))
    );
    return;
  }

  // Biblioteca, ícones e capturas: cópia guardada na hora e atualização em segundo plano
  evento.respondWith(
    caches.match(pedido).then((guardado) => {
      const daRede = fetch(pedido)
        .then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone();
            caches.open(VERSAO).then((cache) => cache.put(pedido, copia));
          }
          return resposta;
        })
        .catch(() => guardado);
      return guardado || daRede;
    })
  );
});
