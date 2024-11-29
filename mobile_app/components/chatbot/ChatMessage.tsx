import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import RenderHtml from 'react-native-render-html';
import { COLORS, SIZES } from '../../constants/theme';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { width } = useWindowDimensions();

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

  // Convert markdown to HTML
  const convertMarkdownToHtml = (markdown: string) => {
    return markdown
      // Convert bullet points
      .replace(/^\s*[-*+]\s+/gm, '• ')
      // Convert numbered lists
      .replace(/^\s*(\d+)\.\s+/gm, '$1. ')
      // Convert bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert code blocks
      .replace(/```(.*?)```/gs, '<pre>$1</pre>')
      // Convert inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Convert links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      // Convert newlines to breaks
      .replace(/\n/g, '<br>');
  };

  const htmlContent = {
    html: convertMarkdownToHtml(message)
  };

  const tagsStyles = {
    body: {
      color: isUser ? COLORS.white : COLORS.textPrimary,
      fontSize: SIZES.medium,
      fontFamily: 'System',
    },
    p: {
      marginVertical: 0,
      color: isUser ? COLORS.white : COLORS.textPrimary,
    },
    strong: {
      color: isUser ? COLORS.white : COLORS.primary,
      fontWeight: 'bold',
    },
    em: {
      color: isUser ? COLORS.white : COLORS.textSecondary,
      fontStyle: 'italic',
    },
    a: {
      color: COLORS.primary,
      textDecorationLine: 'underline',
    },
    code: {
      backgroundColor: isUser ? COLORS.white + '20' : COLORS.cardBackground,
      color: isUser ? COLORS.white : COLORS.primary,
      borderRadius: SIZES.xSmall,
      paddingHorizontal: SIZES.xSmall,
      fontFamily: 'System',
    },
    pre: {
      backgroundColor: isUser ? COLORS.white + '20' : COLORS.cardBackground,
      borderRadius: SIZES.small,
      padding: SIZES.small,
      marginVertical: SIZES.xSmall,
      fontFamily: 'System',
    },
  };

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
      <View style={styles.messageContent}>
        <RenderHtml
          contentWidth={width * 0.7}
          source={htmlContent}
          tagsStyles={tagsStyles}
        />
      </View>
      <View style={styles.timestampContainer}>
        <View style={styles.timestamp}>
          {new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </View>
      </View>
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
  messageContent: {
    flexDirection: 'column',
  },
  timestampContainer: {
    marginTop: SIZES.xSmall,
    alignSelf: 'flex-end',
  },
  timestamp: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
  }
});
