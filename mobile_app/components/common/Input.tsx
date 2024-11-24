import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor={COLORS.gray}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.small,
  },
  label: {
    fontSize: SIZES.small,
    color: COLORS.textPrimary,
    marginBottom: SIZES.xSmall,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.small,
    padding: SIZES.medium,
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.gray2,
  },
  inputError: {
    borderColor: COLORS.tertiary,
  },
  error: {
    color: COLORS.tertiary,
    fontSize: SIZES.small,
    marginTop: SIZES.xSmall,
  },
});
