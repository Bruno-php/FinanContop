import { StyleSheet, View, ViewStyle } from "react-native";
import { useAppColors } from "../providers/AppThemeProvider";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function Card({ children, style }: CardProps) {
  const COLORS = useAppColors();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: COLORS.grayCard,
      borderRadius: 20,
      padding: 18,
      marginVertical: 6,
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
  });

  return <View style={[styles.card, style]}>{children}</View>;
}
