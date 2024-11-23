import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <FontAwesome5 name="exclamation-circle" size={48} color={COLORS.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
    alignItems: 'center',
  },
  message: {
    color: COLORS.textPrimary,
    fontSize: SIZES.medium,
    textAlign: 'center',
    marginTop: SIZES.small,
  },
  retryButton: {
    marginTop: SIZES.medium,
    padding: SIZES.small,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.small,
  },
  retryText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
});
