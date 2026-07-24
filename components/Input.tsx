import { Ionicons } from "@expo/vector-icons";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import { useAppColors } from "../providers/AppThemeProvider";

interface InputProps extends TextInputProps {
  label?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function Input({ label, iconName, ...props }: InputProps) {
  const COLORS = useAppColors();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      marginVertical: 6,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: COLORS.black,
      marginBottom: 6,
      marginLeft: 2,
    },
    inputWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    icon: {
      position: "absolute",
      left: 14,
      zIndex: 1,
    },
    input: {
      height: 52,
      backgroundColor: COLORS.grayBackground,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      fontSize: 15,
      color: COLORS.black,
    },
  });

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrapper}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={COLORS.grayText}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, iconName ? { paddingLeft: 42 } : null]}
          placeholderTextColor={COLORS.grayTextLight}
          {...props}
        />
      </View>
    </View>
  );
}
