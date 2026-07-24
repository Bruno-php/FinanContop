import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { COLORS } from "../../constants/colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert(
        "Campos Obrigatórios",
        "Por favor, informe seu e-mail e senha.",
      );
      return;
    }

    try {
      setLoading(true);
      const cadastroSalvo = await AsyncStorage.getItem("@financontop_auth");

      if (!cadastroSalvo) {
        Alert.alert(
          "Conta não encontrada",
          'Nenhum cadastro local foi encontrado. Clique em "Criar Conta" para registrar seu acesso.',
        );
        return;
      }

      const usuario = JSON.parse(cadastroSalvo);

      if (
        email.trim().toLowerCase() === usuario.email.toLowerCase() &&
        senha === usuario.senha
      ) {
        await AsyncStorage.setItem("@financontop_user", usuario.nome);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Acesso Negado", "E-mail ou senha incorretos.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível realizar o login local.");
    } finally {
      setLoading(false);
    }
  };

  const handleEsqueceuSenha = () => {
    Alert.alert(
      "Recuperação de Senha",
      'Como este é um aplicativo local offline, se você esqueceu sua senha, acesse "Criar Conta" para redefinir seu cadastro local.',
    );
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
        <View style={styles.contentContainer}>
          {/* Header da Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.logoEmoji}>💰</Text>
            </View>
            <Text style={styles.logoTitle}>FinanContop</Text>
            <Text style={styles.sloganText}>
              Controle suas despesas de forma simples.
            </Text>
          </View>

          {/* Card Principal */}
          <View style={styles.card}>
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

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={handleEsqueceuSenha}
            >
              <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            <Button
              title="Entrar"
              iconName="arrow-forward-outline"
              onPress={handleLogin}
              loading={loading}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupQuestion}>Ainda não possui conta?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/cadastro")}>
                <Text style={styles.signupText}>Criar Conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.footerText}>© 2026 FinanContop</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  keyboardView: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  logoEmoji: { fontSize: 44 },
  logoTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  sloganText: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: "center",
    marginTop: 4,
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
  },
  passwordWrapper: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 38,
    zIndex: 2,
    padding: 4,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 16,
    marginTop: 2,
  },
  forgotText: {
    fontSize: 13,
    color: "#1E40AF",
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: COLORS.grayTextLight,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  signupQuestion: { fontSize: 14, color: COLORS.grayText },
  signupText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "800",
  },
  footerText: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
  },
});
