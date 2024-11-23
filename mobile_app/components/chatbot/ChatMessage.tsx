import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { COLORS, SIZES } from '../../constants/theme';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.botContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[styles.message, isUser ? styles.userMessage : styles.botMessage]}>
        {message}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </Animated.View>
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
    backgroundColor: COLORS.cardBackground,
  },
  message: {
    fontSize: SIZES.medium,
  },
  userMessage: {
    color: COLORS.white,
  },
  botMessage: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
    marginTop: SIZES.xSmall,
    alignSelf: 'flex-end',
  },
});
