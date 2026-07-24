import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppColors } from "../providers/AppThemeProvider";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "danger" | "success";
  loading?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  iconName,
}: ButtonProps) {
  const COLORS = useAppColors();

  const getBackgroundColor = () => {
    if (variant === "danger") return COLORS.danger;
    if (variant === "success") return COLORS.success;
    return COLORS.primary;
  };

  const styles = StyleSheet.create({
    button: {
      height: 52,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      marginVertical: 8,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 2,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "700",
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: getBackgroundColor() }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <View style={styles.content}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={20}
              color={COLORS.white}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={styles.text}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
