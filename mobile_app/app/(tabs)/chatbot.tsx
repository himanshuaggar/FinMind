import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FinancialDataForm from '../../components/chatbot/FinancialDataForm';
import ChatInput from '../../components/chatbot/ChatInput';
import ChatMessage from '../../components/chatbot/ChatMessage';
import GoalsTracker from '../../components/chatbot/GoalsTracker';
import { chatWithAdvisor, analyzeStock, analyzeNews, FinancialData } from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadFinancialData();
    addWelcomeMessage();
  }, []);

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hello! I'm your AI Financial Advisor. I can help you with:\n\n" +
           "• Financial planning and advice\n" +
           "• Stock analysis (just type 'analyze SYMBOL')\n" +
           "• News analysis (share news URLs)\n" +
           "• Goal tracking and recommendations\n\n" +
           "How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

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

  const handleFinancialDataSubmit = async (data: FinancialData) => {
    try {
      await AsyncStorage.setItem('financialData', JSON.stringify(data));
      setFinancialData(data);
    } catch (error) {
      console.error('Error saving financial data:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!financialData) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      let response;
      
      // Check if it's a stock analysis request
      if (text.toLowerCase().startsWith('analyze ')) {
        const symbol = text.split(' ')[1];
        response = await analyzeStock(symbol);
      }
      // Check if it's a news analysis request (contains URLs)
      else if (text.includes('http')) {
        const urls = text.match(/(https?:\/\/[^\s]+)/g) || [];
        const query = text.replace(/(https?:\/\/[^\s]+)/g, '').trim();
        response = await analyzeNews(urls, query);
      }
      // Regular financial advice
      else {
        response = await chatWithAdvisor(financialData, text);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.result || response.response || response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!financialData) {
    return <FinancialDataForm onSubmit={handleFinancialDataSubmit} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <GoalsTracker goals={financialData.goals} />
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
  },
  scrollContent: {
    padding: SIZES.medium,
    paddingBottom: SIZES.xxLarge,
  },
  messagesContainer: {
    flex: 1,
  },
});
