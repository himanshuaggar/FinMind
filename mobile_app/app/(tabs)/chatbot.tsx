import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FinancialDataForm from '../../components/chatbot/FinancialDataForm';
import ChatInput from '../../components/chatbot/ChatInput';
import ChatMessage from '../../components/chatbot/ChatMessage';
import GoalsTracker from '../../components/chatbot/GoalsTracker';
import { chatWithAdvisor } from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const data = await AsyncStorage.getItem('financialData');
      if (data) {
        setFinancialData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const handleFinancialDataSubmit = async (data) => {
    try {
      await AsyncStorage.setItem('financialData', JSON.stringify(data));
      setFinancialData(data);
    } catch (error) {
      console.error('Error saving financial data:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!financialData) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await chatWithAdvisor(financialData, text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!financialData) {
    return <FinancialDataForm onSubmit={handleFinancialDataSubmit} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <GoalsTracker />
        <View style={styles.messagesContainer}>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
        </View>
      </ScrollView>
      <ChatInput onSend={handleSendMessage} disabled={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    height: "100%",
  },
  messagesContainer: {
    padding: SIZES.medium,
  },
});
