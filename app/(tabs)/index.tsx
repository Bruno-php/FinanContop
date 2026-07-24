import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
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

export default function DashboardScreen() {
  const [usuario, setUsuario] = useState("Bruno Milhomem");
  const [saudacao, setSaudacao] = useState("Olá");
  const [totalGasto, setTotalGasto] = useState(0);
  const [metaMensal, setMetaMensal] = useState(2000); // Meta padrão inicial R$ 2.000,00
  const [maiorGasto, setMaiorGasto] = useState(0);
  const [qtdDespesas, setQtdDespesas] = useState(0);
  const [categoriaMaisUsada, setCategoriaMaisUsada] = useState({
    nome: "--",
    icone: "pricetag-outline",
  });
  const [ultimasDespesas, setUltimasDespesas] = useState<Despesa[]>([]);
  const [horaAtualizacao, setHoraAtualizacao] = useState("--:--");

  // Modal para Alterar Meta Mensal
  const [modalMetaVisible, setModalMetaVisible] = useState(false);
  const [novaMetaInput, setNovaMetaInput] = useState("");

  // Modal para Despesa Selecionada
  const [despesaSelecionada, setDespesaSelecionada] = useState<Despesa | null>(
    null,
  );
  const [modalAcoesVisible, setModalAcoesVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);

  // Form de edição de despesa
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      carregarDashboard();
    }, []),
  );

  const formatarMoeda = (val: number) => {
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const capitalizar = (texto: string) => {
    if (!texto) return "";
    return texto
      .toLowerCase()
      .split(" ")
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(" ");
  };

  const carregarDashboard = async () => {
    // 1. Carregar Saudação
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaudacao("Bom dia");
    else if (hora >= 12 && hora < 18) setSaudacao("Boa tarde");
    else setSaudacao("Boa noite");

    // 2. Carregar Usuário
    const nomeSalvo = await AsyncStorage.getItem("@financontop_user");
    if (nomeSalvo) setUsuario(capitalizar(nomeSalvo));

    // 3. Carregar Meta Mensal Salva no AsyncStorage
    const metaSalva = await AsyncStorage.getItem("@financontop_meta");
    if (metaSalva) {
      const valorMetaNum = parseFloat(metaSalva);
      if (!isNaN(valorMetaNum) && valorMetaNum > 0) {
        setMetaMensal(valorMetaNum);
      }
    }

    // 4. Carregar Dados de Despesas
    const lista = despesasRepository.buscarTodas();
    const total = lista.reduce((acc, item) => acc + item.valor, 0);
    const maior = lista.length > 0 ? Math.max(...lista.map((i) => i.valor)) : 0;

    setTotalGasto(total);
    setQtdDespesas(lista.length);
    setMaiorGasto(maior);
    setUltimasDespesas(lista.slice(0, 5));

    if (lista.length > 0) {
      const mapaCat: { [key: string]: number } = {};
      lista.forEach((item) => {
        const cat = item.categoria || "Outros";
        mapaCat[cat] = (mapaCat[cat] || 0) + 1;
      });
      const topCat = Object.keys(mapaCat).reduce((a, b) =>
        mapaCat[a] > mapaCat[b] ? a : b,
      );
      setCategoriaMaisUsada({
        nome: capitalizar(topCat),
        icone: getIconeCategoria(topCat),
      });
    } else {
      setCategoriaMaisUsada({ nome: "Nenhuma", icone: "pricetag-outline" });
    }

    const agora = new Date();
    setHoraAtualizacao(
      `${agora.getHours().toString().padStart(2, "0")}:${agora.getMinutes().toString().padStart(2, "0")}`,
    );
  };

  // Função para Salvar a Nova Meta
  const handleSalvarMeta = async () => {
    const valorNum = parseFloat(novaMetaInput.replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) {
      Alert.alert(
        "Atenção",
        "Por favor, digite um valor de meta válido e maior que zero.",
      );
      return;
    }

    try {
      await AsyncStorage.setItem("@financontop_meta", valorNum.toString());
      setMetaMensal(valorNum);
      setModalMetaVisible(false);
      Alert.alert(
        "Sucesso 🎉",
        `Sua nova meta mensal de R$ ${formatarMoeda(valorNum)} foi salva!`,
      );
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar a nova meta.");
    }
  };

  const percentualMeta = useMemo(() => {
    if (metaMensal <= 0) return 0;
    return Math.min((totalGasto / metaMensal) * 100, 100);
  }, [totalGasto, metaMensal]);

  const corMeta = useMemo(() => {
    if (percentualMeta < 70) return COLORS.success;
    if (percentualMeta <= 90) return COLORS.warning;
    return COLORS.danger;
  }, [percentualMeta]);

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
    const chave = capitalizar(cat);
    return (
      COLORS.categorias[chave as keyof typeof COLORS.categorias] ||
      COLORS.categorias.Outros
    );
  };

  function getIconeCategoria(cat: string): keyof typeof Ionicons.glyphMap {
    const c = cat.toLowerCase();
    if (c.includes("aliment")) return "fast-food-outline";
    if (c.includes("transp") || c.includes("abastec") || c.includes("combust"))
      return "bus-outline";
    if (c.includes("saúde") || c.includes("saude")) return "medical-outline";
    if (c.includes("estud")) return "school-outline";
    if (c.includes("casa")) return "home-outline";
    if (c.includes("lazer")) return "game-controller-outline";
    return "pricetag-outline";
  }

  const handleAbrirOpcoesDespesa = (item: Despesa) => {
    setDespesaSelecionada(item);
    setModalAcoesVisible(true);
  };

  const handleAbrirEdicao = () => {
    if (!despesaSelecionada) return;
    setTitulo(despesaSelecionada.titulo);
    setValor(despesaSelecionada.valor.toString());
    setCategoria(despesaSelecionada.categoria);
    setDescricao(despesaSelecionada.descricao || "");
    setModalAcoesVisible(false);
    setModalEditVisible(true);
  };

  const handleSalvarEdicao = () => {
    if (!despesaSelecionada || !titulo.trim() || !valor.trim()) {
      Alert.alert("Erro", "Preencha Título e Valor.");
      return;
    }

    const valorNum = parseFloat(valor.replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) {
      Alert.alert("Erro", "Informe um valor válido.");
      return;
    }

    despesasRepository.atualizar({
      id: despesaSelecionada.id!,
      titulo: titulo.trim(),
      valor: valorNum,
      categoria: categoria.trim() || "Geral",
      descricao: descricao.trim(),
      data: despesaSelecionada.data,
    });

    setModalEditVisible(false);
    carregarDashboard();
    Alert.alert("Sucesso 🎉", "Despesa atualizada com sucesso!");
  };

  const handleExcluirDespesa = () => {
    if (!despesaSelecionada) return;
    Alert.alert("Excluir Despesa", "Deseja realmente apagar esta despesa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          despesasRepository.deletar(despesaSelecionada.id!);
          setModalAcoesVisible(false);
          carregarDashboard();
        },
      },
    ]);
  };

  const primeiraLetra = usuario ? usuario.charAt(0).toUpperCase() : "B";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho do App */}
      <View style={styles.header}>
        <View style={styles.greetingCol}>
          <Text style={styles.subGreeting}>👋 {saudacao},</Text>
          <Text style={styles.userName}>{usuario}</Text>
          <Text style={styles.headerSubtitle}>Seu resumo financeiro</Text>
        </View>

        <TouchableOpacity
          style={styles.avatarCircle}
          onPress={() => router.push("/(tabs)/config")}
        >
          <Text style={styles.avatarText}>{primeiraLetra}</Text>
        </TouchableOpacity>
      </View>

      {/* Card Principal: Total Gasto */}
      <Card style={styles.cardMain}>
        <View style={styles.rowBetween}>
          <Text style={styles.mainLabel}>💰 Total gasto</Text>
          <Ionicons name="stats-chart" size={22} color={COLORS.white} />
        </View>

        <Text style={styles.mainValue}>R$ {formatarMoeda(totalGasto)}</Text>

        <Text style={styles.updateText}>
          Última atualização às {horaAtualizacao}
        </Text>

        <View style={styles.cardMainBarBg}>
          <View
            style={[
              styles.cardMainBarFill,
              { width: `${Math.min(percentualMeta, 100)}%` },
            ]}
          />
        </View>
      </Card>

      {/* Meta Mensal Dinâmica e Editável */}
      <Card style={styles.metaCard}>
        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.metaTitleGroup}
            onPress={() => {
              setNovaMetaInput(metaMensal.toString());
              setModalMetaVisible(true);
            }}
          >
            <Text style={styles.cardHeaderTitle}>🎯 Meta Mensal</Text>
            <View style={styles.editMetaBadge}>
              <Ionicons name="pencil" size={12} color={COLORS.primary} />
              <Text style={styles.editMetaText}>Alterar</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.metaPercentBadge, { color: corMeta }]}>
            {percentualMeta.toFixed(0)}%
          </Text>
        </View>

        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${percentualMeta}%`, backgroundColor: corMeta },
            ]}
          />
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Meta</Text>
            <Text style={styles.metaVal}>R$ {formatarMoeda(metaMensal)}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Gasto</Text>
            <Text style={[styles.metaVal, { color: COLORS.danger }]}>
              R$ {formatarMoeda(totalGasto)}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Restante</Text>
            <Text style={[styles.metaVal, { color: COLORS.success }]}>
              R$ {formatarMoeda(Math.max(metaMensal - totalGasto, 0))}
            </Text>
          </View>
        </View>
      </Card>

      {/* Cards de Resumo */}
      <View style={styles.cardsRow}>
        <Card style={styles.smallCard}>
          <Text style={styles.iconTag}>🔥</Text>
          <Text style={styles.smallCardLabel}>Maior gasto</Text>
          <Text style={styles.smallCardValueRed}>
            R$ {formatarMoeda(maiorGasto)}
          </Text>
        </Card>

        <Card style={styles.smallCard}>
          <Text style={styles.iconTag}>🧾</Text>
          <Text style={styles.smallCardLabel}>Lançamentos</Text>
          <Text style={styles.smallCardValue}>{qtdDespesas} itens</Text>
        </Card>

        <Card style={styles.smallCard}>
          <Ionicons
            name={categoriaMaisUsada.icone as any}
            size={20}
            color={COLORS.primary}
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.smallCardLabel}>Mais Usada</Text>
          <Text style={styles.smallCardValueCat} numberOfLines={1}>
            {categoriaMaisUsada.nome}
          </Text>
        </Card>
      </View>

      {/* Botão Nova Despesa */}
      <View style={{ marginVertical: 8 }}>
        <Button
          title="Nova Despesa"
          iconName="add-circle"
          onPress={() => router.push("/(tabs)/despesas")}
        />
      </View>

      {/* Seção Últimas Despesas */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Últimas Despesas</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/despesas")}>
          <Text style={styles.linkVerTodas}>Ver Todas →</Text>
        </TouchableOpacity>
      </View>

      {ultimasDespesas.length === 0 ? (
        <Card style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💸</Text>
          <Text style={styles.emptyText}>
            Você ainda não cadastrou nenhuma despesa.
          </Text>
          <Button
            title="Cadastrar primeira despesa"
            onPress={() => router.push("/(tabs)/despesas")}
          />
        </Card>
      ) : (
        ultimasDespesas.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => handleAbrirOpcoesDespesa(item)}
          >
            <Card
              style={[
                styles.despesaCard,
                {
                  borderLeftColor: getCorCategoria(item.categoria),
                  borderLeftWidth: 6,
                },
              ]}
            >
              <View style={styles.despesaIconCol}>
                <Ionicons
                  name={getIconeCategoria(item.categoria)}
                  size={22}
                  color={getCorCategoria(item.categoria)}
                />
              </View>

              <View style={styles.despesaInfoCol}>
                <Text style={styles.despesaTitulo}>{item.titulo}</Text>
                {item.descricao ? (
                  <Text style={styles.despesaDescricao} numberOfLines={1}>
                    {item.descricao}
                  </Text>
                ) : null}
                <Text style={styles.despesaMeta}>
                  {capitalizar(item.categoria)} •{" "}
                  {formatarDataInteligente(item.data)}
                </Text>
              </View>

              <Text style={styles.despesaValor}>
                R$ {formatarMoeda(item.valor)}
              </Text>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 30 }} />

      {/* Modal para Definir Nova Meta Mensal */}
      <Modal visible={modalMetaVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎯 Definir Meta Mensal</Text>
            <Text style={styles.modalSubtitle}>
              Informe o limite máximo de gastos que você deseja ter no mês:
            </Text>

            <Input
              label="Valor da Meta (R$)"
              placeholder="Ex: 1500.00"
              value={novaMetaInput}
              onChangeText={setNovaMetaInput}
              keyboardType="numeric"
              iconName="cash-outline"
            />

            <View style={{ marginTop: 12, gap: 8 }}>
              <Button
                title="Salvar Nova Meta"
                variant="success"
                onPress={handleSalvarMeta}
              />
              <Button
                title="Cancelar"
                variant="danger"
                onPress={() => setModalMetaVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Ações da Despesa Selecionada */}
      <Modal visible={modalAcoesVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🧾 Detalhes da Despesa</Text>
            {despesaSelecionada && (
              <View style={styles.modalBody}>
                <Text style={styles.modalDetailLabel}>
                  Título:{" "}
                  <Text style={styles.modalDetailValue}>
                    {despesaSelecionada.titulo}
                  </Text>
                </Text>
                <Text style={styles.modalDetailLabel}>
                  Valor:{" "}
                  <Text style={styles.modalDetailValueRed}>
                    R$ {formatarMoeda(despesaSelecionada.valor)}
                  </Text>
                </Text>
                <Text style={styles.modalDetailLabel}>
                  Categoria:{" "}
                  <Text style={styles.modalDetailValue}>
                    {capitalizar(despesaSelecionada.categoria)}
                  </Text>
                </Text>
                <Text style={styles.modalDetailLabel}>
                  Data:{" "}
                  <Text style={styles.modalDetailValue}>
                    {formatarDataInteligente(despesaSelecionada.data)}
                  </Text>
                </Text>
                {despesaSelecionada.descricao ? (
                  <Text style={styles.modalDetailLabel}>
                    Descrição:{" "}
                    <Text style={styles.modalDetailValue}>
                      {despesaSelecionada.descricao}
                    </Text>
                  </Text>
                ) : null}
              </View>
            )}

            <View style={styles.modalBtnGroup}>
              <Button
                title="Editar Despesa"
                iconName="pencil"
                onPress={handleAbrirEdicao}
              />
              <Button
                title="Excluir Despesa"
                iconName="trash"
                variant="danger"
                onPress={handleExcluirDespesa}
              />
              <Button
                title="Fechar"
                variant="primary"
                onPress={() => setModalAcoesVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Edição */}
      <Modal visible={modalEditVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Editar Despesa</Text>
            <Input label="Título" value={titulo} onChangeText={setTitulo} />
            <Input
              label="Valor (R$)"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />
            <Input
              label="Categoria"
              value={categoria}
              onChangeText={setCategoria}
            />
            <Input
              label="Descrição"
              value={descricao}
              onChangeText={setDescricao}
            />

            <View style={{ marginTop: 12 }}>
              <Button
                title="Salvar Alterações"
                variant="success"
                onPress={handleSalvarEdicao}
              />
              <Button
                title="Cancelar"
                variant="danger"
                onPress={() => setModalEditVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.grayBackground, padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 36,
    marginBottom: 20,
  },
  greetingCol: { flex: 1 },
  subGreeting: { fontSize: 16, color: COLORS.grayText, fontWeight: "500" },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 14, color: COLORS.grayText, marginTop: 2 },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  avatarText: { color: COLORS.white, fontSize: 22, fontWeight: "800" },
  cardMain: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainLabel: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    fontWeight: "600",
  },
  mainValue: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.white,
    marginTop: 10,
  },
  updateText: { fontSize: 12, color: COLORS.white, opacity: 0.8, marginTop: 6 },
  cardMainBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    marginTop: 16,
    overflow: "hidden",
  },
  cardMainBarFill: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },
  metaCard: { borderRadius: 18, padding: 18, marginBottom: 16 },
  metaTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardHeaderTitle: { fontSize: 16, fontWeight: "700", color: COLORS.black },
  editMetaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  editMetaText: { fontSize: 11, fontWeight: "700", color: COLORS.primary },
  metaPercentBadge: { fontSize: 16, fontWeight: "800" },
  barBg: {
    height: 10,
    backgroundColor: COLORS.grayBackground,
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 12,
  },
  barFill: { height: "100%", borderRadius: 5 },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  metaCol: { alignItems: "center" },
  metaLabel: { fontSize: 12, color: COLORS.grayText, fontWeight: "500" },
  metaVal: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
    marginTop: 2,
  },
  cardsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  smallCard: { flex: 1, padding: 12, borderRadius: 18, alignItems: "center" },
  iconTag: { fontSize: 20, marginBottom: 4 },
  smallCardLabel: {
    fontSize: 12,
    color: COLORS.grayText,
    fontWeight: "600",
    textAlign: "center",
  },
  smallCardValueRed: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.danger,
    marginTop: 4,
  },
  smallCardValue: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.black,
    marginTop: 4,
  },
  smallCardValueCat: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: COLORS.black },
  linkVerTodas: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  despesaCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
  },
  despesaIconCol: { marginRight: 12 },
  despesaInfoCol: { flex: 1 },
  despesaTitulo: { fontSize: 16, fontWeight: "700", color: COLORS.black },
  despesaDescricao: {
    fontSize: 12,
    color: COLORS.grayText,
    fontStyle: "italic",
    marginVertical: 1,
  },
  despesaMeta: { fontSize: 12, color: COLORS.grayText, marginTop: 2 },
  despesaValor: { fontSize: 18, fontWeight: "800", color: COLORS.danger },
  emptyContainer: { padding: 24, alignItems: "center", borderRadius: 18 },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyText: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: "center",
    marginBottom: 16,
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
    marginBottom: 4,
  },
  modalSubtitle: { fontSize: 13, color: COLORS.grayText, marginBottom: 14 },
  modalBody: { marginBottom: 16 },
  modalDetailLabel: { fontSize: 14, color: COLORS.grayText, marginVertical: 4 },
  modalDetailValue: { color: COLORS.black, fontWeight: "700" },
  modalDetailValueRed: {
    color: COLORS.danger,
    fontWeight: "800",
    fontSize: 16,
  },
  modalBtnGroup: { gap: 8 },
});
