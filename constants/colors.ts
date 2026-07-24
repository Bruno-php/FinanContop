const categorias = {
  Alimentação: "#F97316",
  Transporte: "#3B82F6",
  Saúde: "#EF4444",
  Estudos: "#A855F7",
  Casa: "#22C55E",
  Lazer: "#EAB308",
  Outros: "#64748B",
};

export const LIGHT_COLORS = {
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  success: "#22C55E",
  successLight: "#DCFCE7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  warning: "#F59E0B",
  black: "#0F172A",
  white: "#FFFFFF",
  grayBackground: "#F8FAFC",
  grayCard: "#FFFFFF",
  grayText: "#64748B",
  grayTextLight: "#94A3B8",
  border: "#E2E8F0",
  categorias,
};

export const DARK_COLORS = {
  primary: "#60A5FA",
  primaryLight: "#1E3A5F",
  success: "#4ADE80",
  successLight: "#064E3B",
  danger: "#F87171",
  dangerLight: "#7F1D1D",
  warning: "#FBBF24",
  black: "#F8FAFC",
  white: "#0F172A",
  grayBackground: "#020617",
  grayCard: "#0B1220",
  grayText: "#CBD5E1",
  grayTextLight: "#94A3B8",
  border: "#1E293B",
  categorias,
};

export type AppColorPalette = typeof LIGHT_COLORS;

export const APP_COLORS = {
  claro: LIGHT_COLORS,
  escuro: DARK_COLORS,
} as const;

// Compatibilidade com código legado que ainda importa COLORS diretamente.
export const COLORS = LIGHT_COLORS;
