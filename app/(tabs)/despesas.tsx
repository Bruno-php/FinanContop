import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
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
import { despesasRepository } from "../../database/despesasRepository";
import { Despesa } from "../../types/despesa";

export default function DespesasScreen() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [despesasFiltradas, setDespesasFiltradas] = useState<Despesa[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [ordenacao, setOrdenacao] = useState<
    "todos" | "recente" | "maior" | "menor"
  >("todos");
  const [modalVisible, setModalVisible] = useState(false);

  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Alimentação");
  const [descricao, setDescricao] = useState("");

  useFocusEffect(
    useCallback(() => {
      carregarDespesas();
    }, []),
  );

  const carregarDespesas = () => {
    const lista = despesasRepository.buscarTodas();
    setDespesas(lista);
    aplicarFiltros(lista, pesquisa, ordenacao);
  };

  const aplicarFiltros = (lista: Despesa[], termo: string, ordem: string) => {
    const resultado = lista.filter(
      (item) =>
        item.titulo.toLowerCase().includes(termo.toLowerCase()) ||
        item.categoria.toLowerCase().includes(termo.toLowerCase()) ||
        (item.descricao &&
          item.descricao.toLowerCase().includes(termo.toLowerCase())),
    );

    if (ordem === "recente") resultado.sort((a, b) => b.id! - a.id!);
    if (ordem === "maior") resultado.sort((a, b) => b.valor - a.valor);
    if (ordem === "menor") resultado.sort((a, b) => a.valor - b.valor);

    setDespesasFiltradas(resultado);
  };

  const handlePesquisa = (texto: string) => {
    setPesquisa(texto);
    aplicarFiltros(despesas, texto, ordenacao);
  };

  const handleLimparPesquisa = () => {
    setPesquisa("");
    aplicarFiltros(despesas, "", ordenacao);
  };

  const handleOrdenacao = (ordem: "todos" | "recente" | "maior" | "menor") => {
    setOrdenacao(ordem);
    aplicarFiltros(despesas, pesquisa, ordem);
  };

  const resumoFinanceiro = useMemo(() => {
    const totalItens = despesas.length;
    const valorTotal = despesas.reduce((acc, item) => acc + item.valor, 0);

    let maiorCat = "--";
    if (despesas.length > 0) {
      const mapaCat: { [key: string]: number } = {};
      despesas.forEach((i) => {
        mapaCat[i.categoria] = (mapaCat[i.categoria] || 0) + i.valor;
      });
      maiorCat = Object.keys(mapaCat).reduce((a, b) =>
        mapaCat[a] > mapaCat[b] ? a : b,
      );
    }

    return { totalItens, valorTotal, maiorCat };
  }, [despesas]);

  const resumoFiltrado = useMemo(() => {
    const qtd = despesasFiltradas.length;
    const total = despesasFiltradas.reduce((acc, item) => acc + item.valor, 0);
    return { qtd, total };
  }, [despesasFiltradas]);

  const formatarDataInteligente = (dataStr: string) => {
    if (!dataStr) return "--";
    const [ano, mes, dia] = dataStr.split("-").map(Number);
    if (!ano || !mes || !dia) return dataStr;

    const dataObj = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    if (
      dataObj.getDate() === hoje.getDate() &&
      dataObj.getMonth() === hoje.getMonth() &&
      dataObj.getFullYear() === hoje.getFullYear()
    ) {
      return "Hoje";
    }

    if (
      dataObj.getDate() === ontem.getDate() &&
      dataObj.getMonth() === ontem.getMonth() &&
      dataObj.getFullYear() === ontem.getFullYear()
    ) {
      return "Ontem";
    }

    const diasSemana = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    const diffDias = Math.floor(
      (hoje.getTime() - dataObj.getTime()) / (1000 * 3600 * 24),
    );

    if (diffDias > 0 && diffDias < 7) {
      return diasSemana[dataObj.getDay()];
    }

    return `${dia.toString().padStart(2, "0")}/${mes.toString().padStart(2, "0")}/${ano}`;
  };

  const getCorCategoria = (cat: string) => {
    return (
      COLORS.categorias[cat as keyof typeof COLORS.categorias] ||
      COLORS.categorias.Outros
    );
  };

  const getIconeCategoria = (cat: string): keyof typeof Ionicons.glyphMap => {
    if (cat === "Alimentação") return "fast-food-outline";
    if (cat === "Transporte") return "bus-outline";
    if (cat === "Saúde") return "medical-outline";
    if (cat === "Estudos") return "school-outline";
    if (cat === "Casa") return "home-outline";
    if (cat === "Lazer") return "game-controller-outline";
    return "pricetag-outline";
  };

  const abrirModalNovo = () => {
    setIdEditando(null);
    setTitulo("");
    setValor("");
    setCategoria("Alimentação");
    setDescricao("");
    setModalVisible(true);
  };

  const abrirModalEditar = (item: Despesa) => {
    setIdEditando(item.id!);
    setTitulo(item.titulo);
    setValor(item.valor.toString());
    setCategoria(item.categoria);
    setDescricao(item.descricao || "");
    setModalVisible(true);
  };

  const handleSalvar = () => {
    if (!titulo.trim()) {
      Alert.alert("Erro", "O título da despesa não pode estar vazio.");
      return;
    }

    const valorNum = parseFloat(valor.replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) {
      Alert.alert("Erro", "Insira um valor numérico positivo maior que zero.");
      return;
    }

    const dataAtual = new Date().toISOString().split("T")[0];

    if (idEditando) {
      despesasRepository.atualizar({
        id: idEditando,
        titulo: titulo.trim(),
        valor: valorNum,
        categoria: categoria.trim() || "Alimentação",
        descricao: descricao.trim(),
        data: dataAtual,
      });
      Alert.alert("Sucesso 🎉", "Despesa atualizada com sucesso!");
    } else {
      despesasRepository.adicionar({
        titulo: titulo.trim(),
        valor: valorNum,
        categoria: categoria.trim() || "Alimentação",
        descricao: descricao.trim(),
        data: dataAtual,
      });
      Alert.alert("Sucesso 🎉", "Despesa cadastrada com sucesso!");
    }

    setModalVisible(false);
    carregarDespesas();
  };

  const handleExcluir = (id: number) => {
    Alert.alert("Confirmar Exclusão", "Deseja realmente apagar esta despesa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          despesasRepository.deletar(id);
          carregarDespesas();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={despesasFiltradas}
        keyExtractor={(item) => item.id!.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>💳 Minhas Despesas</Text>
              <Text style={styles.headerSubtitle}>
                Gerencie e acompanhe todos os seus gastos.
              </Text>
            </View>

            <Card style={styles.resumoCard}>
              <Text style={styles.resumoCardTitle}>📊 Resumo Financeiro</Text>
              <View style={styles.resumoGrid}>
                <View style={styles.resumoCol}>
                  <Text style={styles.resumoLabel}>Lançamentos</Text>
                  <Text style={styles.resumoValue}>
                    {resumoFinanceiro.totalItens} despesas
                  </Text>
                </View>
                <View style={styles.resumoDivider} />
                <View style={styles.resumoCol}>
                  <Text style={styles.resumoLabel}>Valor Total</Text>
                  <Text style={styles.resumoValueRed}>
                    R${" "}
                    {resumoFinanceiro.valorTotal.toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              </View>
              <View style={styles.resumoFooter}>
                <Text style={styles.resumoFooterLabel}>Maior Categoria: </Text>
                <Text style={styles.resumoFooterValue}>
                  {resumoFinanceiro.maiorCat}
                </Text>
              </View>
            </Card>

            <View style={styles.searchWrapper}>
              <Input
                placeholder="Pesquisar por título, categoria ou descrição..."
                iconName="search-outline"
                value={pesquisa}
                onChangeText={handlePesquisa}
              />
              {pesquisa.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearchBtn}
                  onPress={handleLimparPesquisa}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={COLORS.grayText}
                  />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
            >
              <TouchableOpacity
                style={[
                  styles.chip,
                  ordenacao === "todos" && styles.chipActive,
                ]}
                onPress={() => handleOrdenacao("todos")}
              >
                <Text
                  style={[
                    styles.chipText,
                    ordenacao === "todos" && styles.chipTextActive,
                  ]}
                >
                  Todos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.chip,
                  ordenacao === "recente" && styles.chipActive,
                ]}
                onPress={() => handleOrdenacao("recente")}
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={
                    ordenacao === "recente" ? COLORS.white : COLORS.grayText
                  }
                />
                <Text
                  style={[
                    styles.chipText,
                    ordenacao === "recente" && styles.chipTextActive,
                  ]}
                >
                  Recentes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.chip,
                  ordenacao === "maior" && styles.chipActive,
                ]}
                onPress={() => handleOrdenacao("maior")}
              >
                <Ionicons
                  name="arrow-up-outline"
                  size={14}
                  color={ordenacao === "maior" ? COLORS.white : COLORS.grayText}
                />
                <Text
                  style={[
                    styles.chipText,
                    ordenacao === "maior" && styles.chipTextActive,
                  ]}
                >
                  Maior valor
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.chip,
                  ordenacao === "menor" && styles.chipActive,
                ]}
                onPress={() => handleOrdenacao("menor")}
              >
                <Ionicons
                  name="arrow-down-outline"
                  size={14}
                  color={ordenacao === "menor" ? COLORS.white : COLORS.grayText}
                />
                <Text
                  style={[
                    styles.chipText,
                    ordenacao === "menor" && styles.chipTextActive,
                  ]}
                >
                  Menor valor
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </>
        }
        renderItem={({ item }) => (
          <Card
            style={[
              styles.despesaCard,
              {
                borderLeftColor: getCorCategoria(item.categoria),
                borderLeftWidth: 6,
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name={getIconeCategoria(item.categoria)}
                size={22}
                color={getCorCategoria(item.categoria)}
              />
            </View>

            <View style={styles.despesaContent}>
              <Text style={styles.despesaNome}>{item.titulo}</Text>
              <Text style={styles.despesaCategory}>🏷️ {item.categoria}</Text>
              {item.descricao ? (
                <Text style={styles.despesaDesc} numberOfLines={1}>
                  {item.descricao}
                </Text>
              ) : null}
              <Text style={styles.despesaData}>
                📅 {formatarDataInteligente(item.data)}
              </Text>
              <Text style={styles.despesaValor}>
                R$ {item.valor.toFixed(2).replace(".", ",")}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editCircleBtn}
                onPress={() => abrirModalEditar(item)}
              >
                <Ionicons name="pencil" size={16} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteCircleBtn}
                onPress={() => handleExcluir(item.id!)}
              >
                <Ionicons name="trash" size={16} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListFooterComponent={
          despesasFiltradas.length > 0 ? (
            <View style={styles.listFooter}>
              <Text style={styles.listFooterText}>
                Exibindo {resumoFiltrado.qtd} de {despesas.length} lançamento(s)
              </Text>
              <Text style={styles.listFooterTotal}>
                Total Filtrado: R${" "}
                {resumoFiltrado.total.toFixed(2).replace(".", ",")}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={styles.emptyTitle}>
              Você ainda não cadastrou nenhuma despesa.
            </Text>
            <Button
              title="+ Adicionar Primeira Despesa"
              onPress={abrirModalNovo}
            />
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={abrirModalNovo}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {idEditando ? "✏️ Editar Despesa" : "➕ Nova Despesa"}
            </Text>

            <Input
              label="Título *"
              placeholder="Ex: Mercado"
              value={titulo}
              onChangeText={setTitulo}
            />
            <Input
              label="Valor (R$) *"
              placeholder="Ex: 150.00"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />
            <Input
              label="Categoria *"
              placeholder="Alimentação, Transporte, Saúde, Casa, Estudos, Lazer"
              value={categoria}
              onChangeText={setCategoria}
            />
            <Input
              label="Descrição (Opcional)"
              placeholder="Detalhes adicionais"
              value={descricao}
              onChangeText={setDescricao}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Salvar Despesa"
                variant="success"
                onPress={handleSalvar}
              />
              <Button
                title="Cancelar"
                variant="danger"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayBackground,
    paddingHorizontal: 16,
  },
  header: { marginTop: 12, marginBottom: 14 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 16, color: COLORS.grayText, marginTop: 4 },
  resumoCard: { padding: 18, borderRadius: 18, marginBottom: 12 },
  resumoCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 12,
  },
  resumoGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  resumoCol: { alignItems: "center" },
  resumoLabel: { fontSize: 12, color: COLORS.grayText },
  resumoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
    marginTop: 2,
  },
  resumoValueRed: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.danger,
    marginTop: 2,
  },
  resumoDivider: { width: 1, height: "80%", backgroundColor: COLORS.border },
  resumoFooter: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resumoFooterLabel: { fontSize: 13, color: COLORS.grayText },
  resumoFooterValue: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  searchWrapper: { position: "relative", marginBottom: 8 },
  clearSearchBtn: { position: "absolute", right: 14, top: 22, zIndex: 2 },
  chipsScroll: { marginBottom: 12, paddingBottom: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.grayText, fontWeight: "600" },
  chipTextActive: { color: COLORS.white, fontWeight: "700" },
  despesaCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.grayBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  despesaContent: { flex: 1 },
  despesaNome: { fontSize: 18, fontWeight: "800", color: COLORS.black },
  despesaCategory: { fontSize: 14, color: COLORS.grayText, marginTop: 2 },
  despesaDesc: {
    fontSize: 12,
    color: COLORS.grayText,
    fontStyle: "italic",
    marginTop: 1,
  },
  despesaData: { fontSize: 13, color: COLORS.grayText, marginTop: 4 },
  despesaValor: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.danger,
    marginTop: 6,
  },
  actionButtons: { gap: 8, marginLeft: 8 },
  editCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.dangerLight,
    justifyContent: "center",
    alignItems: "center",
  },
  listFooter: {
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
  },
  listFooterText: { fontSize: 13, color: COLORS.grayText },
  listFooterTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
    marginTop: 2,
  },
  emptyState: { alignItems: "center", padding: 24, marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    color: COLORS.grayText,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 16,
  },
  modalBtnRow: { marginTop: 12, gap: 8 },
});
