import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      <Text style={[styles.message, isUser ? styles.userMessage : styles.botMessage]}>
        {message}
      </Text>
      <Text style={styles.timestamp}>
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: SIZES.small,
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  botContainer: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondary,
  },
  message: {
    fontSize: SIZES.medium,
  },
  userMessage: {
    color: COLORS.white,
  },
  botMessage: {
    color: COLORS.white,
  },
  timestamp: {
    fontSize: SIZES.small,
    color: COLORS.lightWhite,
    alignSelf: 'flex-end',
    marginTop: SIZES.small,
  },
});
