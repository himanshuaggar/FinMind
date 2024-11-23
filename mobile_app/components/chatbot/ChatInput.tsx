import { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Ask me anything about your finances..."
        placeholderTextColor={COLORS.textSecondary}
        multiline
        maxLength={500}
        editable={!disabled}
      />
      <TouchableOpacity 
        style={[styles.sendButton, disabled && styles.disabledButton]} 
        onPress={handleSend}
        disabled={disabled || !message.trim()}
      >
        {disabled ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <FontAwesome5 name="paper-plane" size={20} color={COLORS.white} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SIZES.medium,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBackground,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginRight: SIZES.small,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
});
