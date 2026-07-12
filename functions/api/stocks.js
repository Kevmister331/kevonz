export async function onRequest(context) {
  var key = context.env.FINNHUB_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "no key" }), { status: 500 });
  }

  var url = new URL(context.request.url);
  var symbol = url.searchParams.get("symbol");
  if (!symbol) {
    return new Response(JSON.stringify({ error: "no symbol" }), { status: 400 });
  }

  var res = await fetch(
    "https://finnhub.io/api/v1/quote?symbol=" + encodeURIComponent(symbol) + "&token=" + key
  );
  var data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
