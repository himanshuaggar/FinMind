import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function Button({ 
  title, 
  onPress, 
  loading = false, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: SIZES.small,
    borderRadius: SIZES.small,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SIZES.medium,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
});
