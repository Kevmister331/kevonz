(function () {
  var dark = localStorage.getItem("theme") === "dark";
  if (dark) document.documentElement.classList.add("dark");

  var path = window.location.pathname;
  var links = [
    { href: "/", label: "home", match: function (p) { return p === "/" || p === "/index.html"; } },
    { href: "/investing-philosophy/", label: "investing philosophy", match: function (p) { return p.startsWith("/investing-philosophy"); } },
    { href: "/writing/", label: "essays", match: function (p) { return p.startsWith("/writing"); } },
    { href: "/reading/", label: "books & blurbs", match: function (p) { return p.startsWith("/reading"); } },
    { href: "/the-room/", label: "the room", match: function (p) { return p.startsWith("/the-room"); } },
  ];

  var nav = document.querySelector("nav");
  if (!nav) return;

  var items = links
    .map(function (l) {
      var active = l.match(path) ? ' class="active"' : "";
      return '<li><a href="' + l.href + '"' + active + ">" + l.label + "</a></li>";
    })
    .join("");

  nav.innerHTML =
    '<div class="name">' +
      "Kevin Hu" +
      '<div class="alias"><em>Kevonz</em></div>' +
    "</div>" +
    "<ul>" + items + "</ul>" +
    '<button class="theme-toggle">' + (dark ? "light mode" : "dark mode") + "</button>";

  nav.querySelector(".theme-toggle").addEventListener("click", function () {
    var isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    this.textContent = isDark ? "light mode" : "dark mode";
  });
})();
