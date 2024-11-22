import { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
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
        placeholder="Type your message..."
        multiline
        disabled={disabled}
      />
      <FontAwesome
        name="send"
        size={24}
        color={COLORS.primary}
        onPress={handleSend}
        style={[styles.sendButton, disabled && styles.disabled]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SIZES.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray2,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    marginRight: SIZES.small,
    padding: SIZES.small,
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.small,
  },
  sendButton: {
    alignSelf: 'flex-end',
    padding: SIZES.small,
  },
  disabled: {
    opacity: 0.5,
  },
});
