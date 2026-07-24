import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { COLORS } from "../../constants/colors";

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleCadastrar = async () => {
    if (
      !nome.trim() ||
      !email.trim() ||
      !senha.trim() ||
      !confirmarSenha.trim()
    ) {
      Alert.alert(
        "Campos Obrigatórios",
        "Preencha todos os campos do formulário.",
      );
      return;
    }

    if (senha.length < 4) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(
        "Atenção",
        "As senhas digitadas não coincidem. Verifique e tente novamente.",
      );
      return;
    }

    try {
      setLoading(true);

      const novoUsuario = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha,
      };

      await AsyncStorage.setItem(
        "@financontop_auth",
        JSON.stringify(novoUsuario),
      );
      await AsyncStorage.setItem("@financontop_user", novoUsuario.nome);

      Alert.alert("Sucesso 🎉", "Sua conta local foi criada!", [
        {
          text: "Entrar no App",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar seu cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#1E40AF", "#2563EB", "#60A5FA"]}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            <Text style={styles.backText}>Voltar ao Login</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.title}>Criar Nova Conta</Text>
            <Text style={styles.subtitle}>
              Cadastre seus dados para acesso local seguro.
            </Text>

            <Input
              label="Seu Nome"
              placeholder="Ex: Bruno Milhomem"
              iconName="person-outline"
              value={nome}
              onChangeText={setNome}
            />

            <Input
              label="E-mail"
              placeholder="seuemail@exemplo.com"
              iconName="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.passwordWrapper}>
              <Input
                label="Senha"
                placeholder="••••••••"
                iconName="lock-closed-outline"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setMostrarSenha(!mostrarSenha)}
              >
                <Ionicons
                  name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.grayText}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordWrapper}>
              <Input
                label="Confirmar Senha"
                placeholder="••••••••"
                iconName="lock-closed-outline"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!mostrarSenha}
              />
            </View>

            <View style={{ marginTop: 8 }}>
              <Button
                title="Cadastrar e Entrar"
                iconName="checkmark-circle-outline"
                variant="success"
                onPress={handleCadastrar}
                loading={loading}
              />
            </View>
          </View>

          <Text style={styles.footerText}>© 2026 FinanContop</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  keyboardView: { flex: 1, padding: 20 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: Platform.OS === "android" ? 36 : 16,
    marginBottom: 16,
  },
  backText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderRadius: 22,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.grayText,
    marginBottom: 18,
  },
  passwordWrapper: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 38,
    zIndex: 2,
    padding: 4,
  },
  footerText: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 12,
    textAlign: "center",
    marginVertical: 12,
    fontWeight: "500",
  },
});
