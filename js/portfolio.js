(function () {
  var FINNHUB_KEY = (typeof CONFIG !== "undefined" && CONFIG.FINNHUB_KEY) || "";

  var holdings = [
    { symbol: "NVDA", buy: 18.54, type: "stock" },
    { symbol: "TSLA", buy: 35, type: "stock" },
    { symbol: "PLTR", buy: 16, type: "stock" },
    { symbol: "AMD", buy: 123, type: "stock" },
    { symbol: "BTC", buy: 6000, type: "crypto", coinId: "bitcoin" },
    { symbol: "ETH", buy: 200, type: "crypto", coinId: "ethereum" },
  ];

  function loadCachedPrices() {
    try {
      var cached = JSON.parse(localStorage.getItem("portfolioPrices"));
      if (!cached) return;
      holdings.forEach(function (h) {
        if (cached[h.symbol] != null) h.current = cached[h.symbol];
      });
    } catch (e) {}
  }

  function savePrices() {
    var prices = {};
    holdings.forEach(function (h) {
      if (h.current != null) prices[h.symbol] = h.current;
    });
    try { localStorage.setItem("portfolioPrices", JSON.stringify(prices)); } catch (e) {}
  }

  function isMarketOpen() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(new Date());

    var vals = {};
    parts.forEach(function (p) { vals[p.type] = p.value; });

    var day = vals.weekday;
    var mins = parseInt(vals.hour) * 60 + parseInt(vals.minute);
    var weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    return weekdays.indexOf(day) !== -1 && mins >= 570 && mins < 960;
  }

  function fetchStockPrices() {
    if (!FINNHUB_KEY) return Promise.resolve();

    var stocks = holdings.filter(function (h) { return h.type === "stock"; });
    return Promise.all(
      stocks.map(function (h) {
        return fetch(
          "https://finnhub.io/api/v1/quote?symbol=" + h.symbol + "&token=" + FINNHUB_KEY
        )
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d.c) h.current = d.c; })
          .catch(function () {});
      })
    );
  }

  function fetchCryptoPrices() {
    return fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"
    )
      .then(function (r) { return r.json(); })
      .then(function (d) {
        holdings.forEach(function (h) {
          if (h.type === "crypto" && d[h.coinId]) h.current = d[h.coinId].usd;
        });
      })
      .catch(function () {});
  }

  function render() {
    holdings.forEach(function (h) {
      var el = document.querySelector('[data-symbol="' + h.symbol + '"]');
      if (!el) return;

      var priceEl = el.querySelector(".current-price");
      var gainEl = el.querySelector(".gain");

      if (h.current == null) {
        priceEl.textContent = "—";
        gainEl.textContent = "";
        return;
      }

      priceEl.textContent = formatPrice(h.current);
      var pct = ((h.current - h.buy) / h.buy) * 100;
      var sign = pct >= 0 ? "+" : "";
      gainEl.textContent = sign + pct.toFixed(0) + "%";
      gainEl.className = "gain " + (pct >= 0 ? "positive" : "negative");
    });
  }

  function formatPrice(n) {
    return "$" + n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function update() {
    return Promise.all([fetchStockPrices(), fetchCryptoPrices()]).then(function () {
      savePrices();
      render();
    });
  }

  function tick() {
    update().then(function () {
      var delay = isMarketOpen() ? 5000 : 60000;
      setTimeout(tick, delay);
    });
  }

  loadCachedPrices();
  render();
  tick();
})();
