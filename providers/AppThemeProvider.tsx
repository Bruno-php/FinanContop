import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { APP_COLORS, AppColorPalette } from "../constants/colors";

type TemaApp = "claro" | "escuro";

interface AppThemeContextData {
  tema: TemaApp;
  cores: AppColorPalette;
  setTema: (tema: TemaApp) => Promise<void>;
  alternarTema: () => Promise<void>;
}

const STORAGE_KEY = "@financontop_theme";

const AppThemeContext = createContext<AppThemeContextData | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<TemaApp>("claro");

  useEffect(() => {
    const carregarTema = async () => {
      try {
        const salvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (salvo === "claro" || salvo === "escuro") {
          setTemaState(salvo);
        }
      } catch {
        // Se falhar, segue com tema padrão.
      }
    };

    carregarTema();
  }, []);

  const setTema = useCallback(async (novoTema: TemaApp) => {
    setTemaState(novoTema);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, novoTema);
    } catch {
      // Se falhar ao salvar, mantém tema em memória.
    }
  }, []);

  const alternarTema = useCallback(async () => {
    const proximo: TemaApp = tema === "claro" ? "escuro" : "claro";
    await setTema(proximo);
  }, [setTema, tema]);

  const value = useMemo(
    () => ({
      tema,
      cores: APP_COLORS[tema],
      setTema,
      alternarTema,
    }),
    [alternarTema, setTema, tema],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

function useAppThemeContext() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme deve ser usado dentro de AppThemeProvider");
  }

  return context;
}

export function useAppTheme() {
  const { tema, setTema, alternarTema } = useAppThemeContext();
  return { tema, setTema, alternarTema };
}

export function useAppColors() {
  const { cores } = useAppThemeContext();
  return cores;
}
