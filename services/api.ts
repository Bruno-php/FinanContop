import { CotacaoMoeda } from "../types/despesa";

export async function buscarCotacoes(): Promise<CotacaoMoeda[]> {
  try {
    const response = await fetch(
      "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL",
      { method: "GET", headers: { Accept: "application/json" } },
    );

    if (!response.ok) {
      throw new Error("Falha na resposta da API");
    }

    const data = await response.json();

    return [
      {
        code: "USD",
        name: "Dólar Comercial",
        bid: parseFloat(data.USDBRL.bid).toFixed(2),
        pctChange: parseFloat(data.USDBRL.pctChange).toFixed(2),
      },
      {
        code: "EUR",
        name: "Euro",
        bid: parseFloat(data.EURBRL.bid).toFixed(2),
        pctChange: parseFloat(data.EURBRL.pctChange).toFixed(2),
      },
      {
        code: "BTC",
        name: "Bitcoin",
        bid: parseFloat(data.BTCBRL.bid).toFixed(2),
        pctChange: parseFloat(data.BTCBRL.pctChange).toFixed(2),
      },
    ];
  } catch (error) {
    console.warn(
      "Conexão offline ou falha na API. Usando cotações de fallback:",
      error,
    );

    return [
      { code: "USD", name: "Dólar Comercial", bid: "5.45", pctChange: "0.25" },
      { code: "EUR", name: "Euro", bid: "6.15", pctChange: "-0.10" },
      { code: "BTC", name: "Bitcoin", bid: "380000.00", pctChange: "1.20" },
    ];
  }
}
