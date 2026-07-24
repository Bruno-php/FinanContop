import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { COLORS } from "../../constants/colors";
import { buscarCotacoes } from "../../services/api";
import { CotacaoMoeda } from "../../types/despesa";

export default function CotacaoScreen() {
  const [cotacoes, setCotacoes] = useState<CotacaoMoeda[]>([]);
  const [loading, setLoading] = useState(true);
  const [valorBrl, setValorBrl] = useState("1000");
  const [moedaSelecionada, setMoedaSelecionada] = useState<
    "USD" | "EUR" | "BTC"
  >("USD");
  const [horaAtualizacao, setHoraAtualizacao] = useState("--:--");
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    carregarApi();
  }, []);

  const carregarApi = async () => {
    setLoading(true);
    try {
      const dados = await buscarCotacoes();
      setCotacoes(dados);
      setIsOffline(false);

      const agora = new Date();
      setHoraAtualizacao(
        `${agora.getHours().toString().padStart(2, "0")}:${agora
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
      );
    } catch {
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const getBandeiraEIcone = (code: string) => {
    if (code === "USD")
      return { nome: "Dólar Comercial", flag: "🇺🇸", simbolo: "US$" };
    if (code === "EUR") return { nome: "Euro", flag: "🇪🇺", simbolo: "€" };
    if (code === "BTC") return { nome: "Bitcoin", flag: "₿", simbolo: "BTC" };
    return { nome: code, flag: "💵", simbolo: "$" };
  };

  const resultadoConversao = useMemo(() => {
    const valorNum = parseFloat(valorBrl.replace(",", ".")) || 0;
    const itemMoeda = cotacoes.find((c) => c.code === moedaSelecionada);
    const taxa = parseFloat(itemMoeda?.bid || "1");

    if (valorNum <= 0 || taxa <= 0) return "0,00";

    const valorConvertido = valorNum / taxa;
    return moedaSelecionada === "BTC"
      ? valorConvertido.toFixed(6)
      : valorConvertido.toFixed(2).replace(".", ",");
  }, [valorBrl, moedaSelecionada, cotacoes]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.rowHeader}>
        <View>
          <Text style={styles.sectionTitle}>Mercado de Moedas</Text>
          <Text style={styles.sectionSubtitle}>
            Cotações em tempo real via AwesomeAPI
          </Text>
        </View>
        <TouchableOpacity
          style={styles.reloadBtn}
          onPress={carregarApi}
          disabled={loading}
        >
          <Ionicons name="refresh" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="wifi-outline" size={16} color={COLORS.warning} />
          <Text style={styles.offlineText}>
            Exibindo cotações de referência offline.
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Atualizando cotações...</Text>
        </View>
      ) : (
        cotacoes.map((item) => {
          const info = getBandeiraEIcone(item.code);
          const pct = parseFloat(item.pctChange);
          const isPositivo = pct >= 0;

          return (
            <Card key={item.code} style={styles.currencyCard}>
              <View style={styles.currencyLeft}>
                <Text style={styles.currencyFlag}>{info.flag}</Text>
                <View>
                  <Text style={styles.currencyCode}>{item.code}</Text>
                  <Text style={styles.currencyName}>{info.nome}</Text>
                </View>
              </View>

              <View style={styles.currencyRight}>
                <Text style={styles.currencyBid}>R$ {item.bid}</Text>
                <View
                  style={[
                    styles.pctBadge,
                    {
                      backgroundColor: isPositivo
                        ? COLORS.successLight
                        : COLORS.dangerLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pctText,
                      { color: isPositivo ? COLORS.success : COLORS.danger },
                    ]}
                  >
                    {isPositivo ? "▲ +" : "▼ "}
                    {item.pctChange}%
                  </Text>
                </View>
              </View>
            </Card>
          );
        })
      )}

      <Card style={styles.converterCard}>
        <View style={styles.rowTitle}>
          <Ionicons name="swap-horizontal" size={22} color={COLORS.primary} />
          <Text style={styles.converterTitle}>Conversor Financeiro</Text>
        </View>

        <Input
          label="Digite um valor em Reais (R$)"
          placeholder="Ex: 1000"
          value={valorBrl}
          onChangeText={setValorBrl}
          keyboardType="numeric"
          iconName="cash-outline"
        />

        <Text style={styles.selectLabel}>Converter para:</Text>
        <View style={styles.moedasGroup}>
          <TouchableOpacity
            style={[
              styles.moedaChip,
              moedaSelecionada === "USD" && styles.moedaChipActive,
            ]}
            onPress={() => setMoedaSelecionada("USD")}
          >
            <Text
              style={[
                styles.moedaText,
                moedaSelecionada === "USD" && styles.moedaTextActive,
              ]}
            >
              🇺🇸 Dólar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.moedaChip,
              moedaSelecionada === "EUR" && styles.moedaChipActive,
            ]}
            onPress={() => setMoedaSelecionada("EUR")}
          >
            <Text
              style={[
                styles.moedaText,
                moedaSelecionada === "EUR" && styles.moedaTextActive,
              ]}
            >
              🇪🇺 Euro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.moedaChip,
              moedaSelecionada === "BTC" && styles.moedaChipActive,
            ]}
            onPress={() => setMoedaSelecionada("BTC")}
          >
            <Text
              style={[
                styles.moedaText,
                moedaSelecionada === "BTC" && styles.moedaTextActive,
              ]}
            >
              ₿ Bitcoin
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Valor Estimado Convertido:</Text>
          <Text style={styles.resultValue}>
            {getBandeiraEIcone(moedaSelecionada).simbolo} {resultadoConversao}
          </Text>
        </View>

        <Button
          title="Atualizar Cotações"
          iconName="refresh-outline"
          onPress={carregarApi}
          loading={loading}
        />
      </Card>

      <Text style={styles.footerText}>
        Última atualização às {horaAtualizacao} • Fonte: AwesomeAPI
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.grayBackground, padding: 16 },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: COLORS.black },
  sectionSubtitle: { fontSize: 13, color: COLORS.grayText, marginTop: 2 },
  reloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  offlineText: { fontSize: 12, color: "#92400E", fontWeight: "600" },
  loadingContainer: { padding: 24, alignItems: "center" },
  loadingText: { fontSize: 13, color: COLORS.grayText, marginTop: 8 },
  currencyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    marginBottom: 8,
  },
  currencyLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  currencyFlag: { fontSize: 30 },
  currencyCode: { fontSize: 16, fontWeight: "800", color: COLORS.black },
  currencyName: { fontSize: 12, color: COLORS.grayText, marginTop: 2 },
  currencyRight: { alignItems: "flex-end" },
  currencyBid: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  pctText: { fontSize: 12, fontWeight: "800" },
  converterCard: { marginTop: 12, padding: 20, borderRadius: 20 },
  rowTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  converterTitle: { fontSize: 18, fontWeight: "800", color: COLORS.black },
  selectLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.black,
    marginTop: 10,
    marginBottom: 6,
  },
  moedasGroup: { flexDirection: "row", gap: 8, marginBottom: 12 },
  moedaChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.grayBackground,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moedaChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  moedaText: { fontSize: 13, color: COLORS.grayText, fontWeight: "600" },
  moedaTextActive: { color: COLORS.white, fontWeight: "800" },
  resultBox: {
    backgroundColor: COLORS.primaryLight,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 12,
  },
  resultLabel: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  resultValue: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.primary,
    marginTop: 4,
  },
  footerText: {
    textAlign: "center",
    color: COLORS.grayText,
    fontSize: 12,
    marginVertical: 20,
  },
});
