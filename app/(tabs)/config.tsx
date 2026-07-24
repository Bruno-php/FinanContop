import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { useAppColors, useAppTheme } from "../../providers/AppThemeProvider";

export default function ConfigScreen() {
  const [nome, setNome] = useState("Bruno Milhomem");
  const [email, setEmail] = useState("");
  const { tema, setTema } = useAppTheme();
  const COLORS = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    const nomeSalvo = await AsyncStorage.getItem("@financontop_user");
    if (nomeSalvo) setNome(nomeSalvo);

    const authSalvo = await AsyncStorage.getItem("@financontop_auth");
    if (authSalvo) {
      try {
        const dados = JSON.parse(authSalvo);
        if (dados.email) setEmail(dados.email);
      } catch {
        // Ignora JSON inválido para não quebrar a tela.
      }
    }
  };

  const handleSalvarNome = async () => {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Digite um nome válido.");
      return;
    }
    await AsyncStorage.setItem("@financontop_user", nome.trim());
    Alert.alert("Sucesso 🎉", "Nome alterado com sucesso!");
  };

  const handleMudarTema = (novoTema: "claro" | "escuro") => {
    void setTema(novoTema);
  };

  const handleLogout = async () => {
    Alert.alert("Sair da Conta", "Deseja encerrar sua sessão no FinanContop?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("@financontop_user");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const primeiraLetra = nome ? nome.charAt(0).toUpperCase() : "B";

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.grayBackground, padding: 16 },
    profileHeaderCard: {
      alignItems: "center",
      padding: 22,
      borderRadius: 20,
      marginBottom: 14,
    },
    avatarWrap: { marginBottom: 12 },
    avatarCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    avatarStatus: {
      position: "absolute",
      right: 2,
      bottom: 2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: COLORS.success,
      borderWidth: 2,
      borderColor: COLORS.white,
    },
    avatarText: { color: COLORS.white, fontSize: 30, fontWeight: "900" },
    profileName: { fontSize: 20, fontWeight: "800", color: COLORS.black },
    profileEmail: {
      fontSize: 13,
      color: COLORS.grayText,
      marginTop: 2,
      marginBottom: 12,
    },
    inputWrapper: { width: "100%", marginVertical: 4 },
    sectionCard: { padding: 18, borderRadius: 20, marginBottom: 14 },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.black },
    sectionSub: { fontSize: 12, color: COLORS.grayText, marginTop: 1 },
    themeSelectorGroup: {
      flexDirection: "row",
      backgroundColor: COLORS.grayBackground,
      padding: 4,
      borderRadius: 14,
      gap: 4,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    themeTab: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
    },
    themeTabActive: {
      backgroundColor: COLORS.primary,
    },
    themeTabText: { fontSize: 13, fontWeight: "600", color: COLORS.grayText },
    themeTabTextActive: { color: COLORS.white, fontWeight: "800" },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 6,
    },
    infoLabel: { fontSize: 13, color: COLORS.grayText, fontWeight: "500" },
    infoValue: {
      fontSize: 13,
      fontWeight: "700",
      color: COLORS.black,
      maxWidth: "62%",
      textAlign: "right",
    },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
    devBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    },
    devName: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
    iftoBadge: {
      backgroundColor: COLORS.successLight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    iftoBadgeText: { fontSize: 12, fontWeight: "700", color: COLORS.success },
    logoutWrap: {
      marginTop: 8,
      marginBottom: Math.max(insets.bottom + 16, 30),
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.profileHeaderCard}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{primeiraLetra}</Text>
          </View>
          <View style={styles.avatarStatus} />
        </View>

        <Text style={styles.profileName}>{nome}</Text>
        <Text style={styles.profileEmail}>{email || "bruno@email.com"}</Text>

        <View style={styles.inputWrapper}>
          <Input
            label="Nome de Exibição"
            value={nome}
            onChangeText={setNome}
            iconName="person-outline"
          />
        </View>

        <Button
          title="Salvar Nome"
          iconName="checkmark-circle-outline"
          onPress={handleSalvarNome}
        />
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View
            style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}
          >
            <Ionicons
              name="color-palette-outline"
              size={20}
              color={COLORS.primary}
            />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Aparência & Tema</Text>
            <Text style={styles.sectionSub}>
              Personalize as cores do aplicativo
            </Text>
          </View>
        </View>

        <View style={styles.themeSelectorGroup}>
          <TouchableOpacity
            style={[styles.themeTab, tema === "claro" && styles.themeTabActive]}
            onPress={() => handleMudarTema("claro")}
          >
            <Ionicons
              name="sunny-outline"
              size={18}
              color={tema === "claro" ? COLORS.white : COLORS.grayText}
            />
            <Text
              style={[
                styles.themeTabText,
                tema === "claro" && styles.themeTabTextActive,
              ]}
            >
              Claro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeTab,
              tema === "escuro" && styles.themeTabActive,
            ]}
            onPress={() => handleMudarTema("escuro")}
          >
            <Ionicons
              name="moon-outline"
              size={18}
              color={tema === "escuro" ? COLORS.white : COLORS.grayText}
            />
            <Text
              style={[
                styles.themeTabText,
                tema === "escuro" && styles.themeTabTextActive,
              ]}
            >
              Escuro
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.iconBox, { backgroundColor: "#E0F2FE" }]}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#0284C7"
            />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Sobre o Aplicativo</Text>
            <Text style={styles.sectionSub}>
              Informações técnicas do FinanContop
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Versão</Text>
          <Text style={styles.infoValue}>1.0.0 (Build Final)</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tecnologias</Text>
          <Text style={styles.infoValue}>
            React Native, Expo, SQLite & TypeScript
          </Text>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
            <Ionicons
              name="code-slash-outline"
              size={20}
              color={COLORS.success}
            />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Desenvolvedor</Text>
            <Text style={styles.sectionSub}>
              Projeto acadêmico de desenvolvimento
            </Text>
          </View>
        </View>

        <View style={styles.devBox}>
          <Text style={styles.devName}>Bruno Milhomem</Text>
          <View style={styles.iftoBadge}>
            <Text style={styles.iftoBadgeText}>🎓 IFTO • Ano 2026</Text>
          </View>
        </View>
      </Card>

      <View style={styles.logoutWrap}>
        <Button
          title="Sair da Conta"
          iconName="log-out-outline"
          variant="danger"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
}
