import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
}

export default function Loading({ 
  size = 'large', 
  color = COLORS.primary 
}: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});