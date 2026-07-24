import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "../../components/Card";
import { AppColorPalette } from "../../constants/colors";
import { despesasRepository } from "../../database/despesasRepository";
import { useAppColors } from "../../providers/AppThemeProvider";

interface CategoriaStat {
  nome: string;
  total: number;
  porcentagem: number;
}

export default function RelatoriosScreen() {
  const COLORS = useAppColors();
  const styles = createStyles(COLORS);

  const [totalMes, setTotalMes] = useState(0);
  const [qtdDespesas, setQtdDespesas] = useState(0);
  const [maiorCategoria, setMaiorCategoria] = useState("--");
  const [maiorDespesaNome, setMaiorDespesaNome] = useState("--");
  const [maiorDespesaValor, setMaiorDespesaValor] = useState(0);
  const [mediaDiaria, setMediaDiaria] = useState(0);
  const [categorias, setCategorias] = useState<CategoriaStat[]>([]);

  useFocusEffect(
    useCallback(() => {
      calcularRelatorios();
    }, []),
  );

  const calcularRelatorios = () => {
    const lista = despesasRepository.buscarTodas();
    const total = lista.reduce((acc, item) => acc + item.valor, 0);

    setTotalMes(total);
    setQtdDespesas(lista.length);
    setMediaDiaria(total > 0 ? total / 30 : 0);

    if (lista.length > 0) {
      const maior = [...lista].sort((a, b) => b.valor - a.valor)[0];
      setMaiorDespesaNome(maior.titulo);
      setMaiorDespesaValor(maior.valor);

      const mapaCat: { [key: string]: number } = {};
      lista.forEach((i) => {
        mapaCat[i.categoria] = (mapaCat[i.categoria] || 0) + i.valor;
      });

      const maiorCat = Object.keys(mapaCat).reduce((a, b) =>
        mapaCat[a] > mapaCat[b] ? a : b,
      );
      setMaiorCategoria(maiorCat);

      const statsArr: CategoriaStat[] = Object.keys(mapaCat).map((cat) => ({
        nome: cat,
        total: mapaCat[cat],
        porcentagem: total > 0 ? (mapaCat[cat] / total) * 100 : 0,
      }));

      statsArr.sort((a, b) => b.total - a.total);
      setCategorias(statsArr);
      return;
    }

    setMaiorCategoria("--");
    setMaiorDespesaNome("--");
    setMaiorDespesaValor(0);
    setCategorias([]);
  };

  const getCorCategoria = (cat: string) => {
    return (
      COLORS.categorias[cat as keyof typeof COLORS.categorias] ||
      COLORS.categorias.Outros
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Dashboard Financeiro</Text>

      <View style={styles.grid}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Total do Mês</Text>
          <Text style={styles.statValuePrimary}>
            R$ {totalMes.toFixed(2).replace(".", ",")}
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Média por Dia</Text>
          <Text style={styles.statValue}>
            R$ {mediaDiaria.toFixed(2).replace(".", ",")}
          </Text>
        </Card>
      </View>

      <Card style={styles.cardInfo}>
        <Text style={styles.statLabel}>Quantidade de Despesas</Text>
        <Text style={styles.highlightText}>{qtdDespesas}</Text>
      </Card>

      <Card style={styles.cardInfo}>
        <Text style={styles.statLabel}>Maior Categoria</Text>
        <Text style={styles.highlightText}>{maiorCategoria}</Text>
      </Card>

      <Card style={styles.cardInfo}>
        <Text style={styles.statLabel}>Maior Despesa Registrada</Text>
        <Text style={styles.highlightText}>{maiorDespesaNome}</Text>
        <Text style={styles.subHighlight}>
          R$ {maiorDespesaValor.toFixed(2).replace(".", ",")}
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
      {categorias.length === 0 ? (
        <Card style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: COLORS.grayText }}>
            Sem dados para gerar gráfico por categoria.
          </Text>
        </Card>
      ) : (
        categorias.map((item) => (
          <Card key={item.nome} style={styles.barCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.catName}>{item.nome}</Text>
              <Text style={styles.catValue}>
                R$ {item.total.toFixed(2).replace(".", ",")} (
                {item.porcentagem.toFixed(1)}%)
              </Text>
            </View>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(item.porcentagem, 100)}%`,
                    backgroundColor: getCorCategoria(item.nome),
                  },
                ]}
              />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const createStyles = (COLORS: AppColorPalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.grayBackground, padding: 16 },
    pageTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: COLORS.black,
      marginVertical: 12,
    },
    grid: { flexDirection: "row", gap: 12 },
    statCard: { flex: 1, padding: 16 },
    statLabel: { fontSize: 12, color: COLORS.grayText, fontWeight: "600" },
    statValuePrimary: {
      fontSize: 18,
      fontWeight: "800",
      color: COLORS.primary,
      marginTop: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "800",
      color: COLORS.black,
      marginTop: 4,
    },
    cardInfo: { padding: 16 },
    highlightText: {
      fontSize: 18,
      fontWeight: "700",
      color: COLORS.black,
      marginTop: 2,
    },
    subHighlight: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.danger,
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: COLORS.black,
      marginTop: 16,
      marginBottom: 8,
    },
    barCard: { marginBottom: 8, padding: 14 },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    catName: { fontSize: 14, fontWeight: "700", color: COLORS.black },
    catValue: { fontSize: 13, fontWeight: "700", color: COLORS.grayText },
    barBg: {
      height: 8,
      backgroundColor: COLORS.grayBackground,
      borderRadius: 4,
      overflow: "hidden",
    },
    barFill: { height: "100%", borderRadius: 4 },
  });
