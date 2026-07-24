import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { initDatabase } from "../database/database";
import { AppThemeProvider, useAppTheme } from "../providers/AppThemeProvider";

function RootNavigator() {
  const { tema } = useAppTheme();

  return (
    <>
      <StatusBar style={tema === "escuro" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    try {
      initDatabase();
    } catch (error) {
      console.error("Erro ao inicializar o banco de dados:", error);
    }
  }, []);

  return (
    <AppThemeProvider>
      <RootNavigator />
    </AppThemeProvider>
  );
}
