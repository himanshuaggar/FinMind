import { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Text 
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';


export default function ChatInput({ onSend, disabled, placeholder }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder || "Ask me about your finances..."}
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
      <Text style={styles.hint}>Try asking about savings, investments, or financial goals</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginRight: SIZES.small,
    color: COLORS.textPrimary,
    maxHeight: 100,
    minHeight: 50,
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
  hint: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    marginTop: SIZES.small,
    textAlign: 'center',
  }
});
