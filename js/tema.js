/* =========================================================
   RITMO · tema e sessão antes de desenhar a página
   Roda no <head>, antes do CSS, para a página não piscar no tema errado.
   Fica num arquivo separado porque a política de segurança (CSP, em _headers)
   não deixa rodar nenhum script escrito dentro do HTML.
   ========================================================= */
(function () {
  try {
    var tema = localStorage.getItem("ritmo_tema");
    if (tema === "claro" || tema === "escuro") {
      document.documentElement.setAttribute("data-theme", tema === "escuro" ? "dark" : "light");
      document.documentElement.setAttribute("data-tema-site", "1");
    }
  } catch (e) { /* sem armazenamento: segue o aparelho */ }
  // Quem já entrou neste aparelho não vê a página inicial piscar enquanto a sessão carrega
  try {
    if (localStorage.getItem("ritmo_sessao_ativa") === "true") {
      document.documentElement.setAttribute("data-sessao", "1");
      // Visual de app no celular desde o primeiro desenho (js/app.js confirma ou desfaz com o login)
      document.documentElement.setAttribute("data-app", "");
      setTimeout(function () { document.documentElement.removeAttribute("data-sessao"); }, 4000);
    }
  } catch (e) { /* sem armazenamento: mostra normalmente */ }
})();
