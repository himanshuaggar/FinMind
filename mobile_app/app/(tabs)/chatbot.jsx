import { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FinancialDataForm from "../../components/chatbot/FinancialDataForm";
import ChatInput from "../../components/chatbot/ChatInput";
import ChatMessage from "../../components/chatbot/ChatMessage";
import FinancialMetrics from "../../components/chatbot/FinancialMetrics";
import { chatWithAdvisor } from "../../services/api";
import { COLORS, SIZES } from "../../constants/theme";
import { FinancialData } from "../../types";
import Button from "../../components/common/Button";


export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadFinancialData();
    addWelcomeMessage();
  }, []);

  const addWelcomeMessage = () => {
    const welcomeMessage = {
      id: "welcome",
      text:
        "Hello! I'm your AI Financial Advisor. To get started:\n\n" +
        "1. Enter your financial information using the 'Update Financial Data' button\n" +
        "2. Ask me questions about:\n" +
        "   • Budgeting and savings\n" +
        "   • Investment advice\n" +
        "   • Debt management\n" +
        "   • Financial goal planning\n\n" +
        "How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const loadFinancialData = async () => {
    try {
      const data = await AsyncStorage.getItem("financialData");
      if (data) {
        setFinancialData(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading financial data:", error);
    }
  };

  const handleFinancialDataSubmit = async (data) => {
    try {
      await AsyncStorage.setItem("financialData", JSON.stringify(data));
      setFinancialData(data);
      setShowForm(false);

      const confirmMessage = {
        id: Date.now().toString(),
        text: "Financial data updated successfully! You can now ask me questions about your finances.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, confirmMessage]);
    } catch (error) {
      console.error("Error saving financial data:", error);
    }
  };

  const generateFinancialAdvice = async (query) => {
    if (!financialData) return;

    const userMessage = {
      id: Date.now().toString(),
      text: query,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await chatWithAdvisor(financialData, query);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating advice:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text:
          error instanceof Error
            ? error.message
            : "I apologize, but I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {showForm ? (
        <FinancialDataForm
          onSubmit={handleFinancialDataSubmit}
          initialData={financialData || undefined}
        />
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
          >
            {financialData && (
              <FinancialMetrics financialData={financialData} />
            )}
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
          <View style={styles.inputContainer}>
            <Button
              title="Update Financial Data"
              onPress={() => setShowForm(true)}
              type="secondary"
              style={styles.updateButton}
            />
            <ChatInput
              onSend={generateFinancialAdvice}
              disabled={loading || !financialData}
              placeholder={
                financialData
                  ? "Ask about your finances..."
                  : "Please update your financial data first"
              }
            />
          </View>
        </>
      )}
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
    paddingBottom: SIZES.xxLarge,
  },
  messagesContainer: {
    flex: 1,
    padding: SIZES.medium,
  },
  inputContainer: {
    padding: SIZES.xSmall,
    backgroundColor: COLORS.background,
    paddingBottom: 0,
  },
  updateButton: {
    marginBottom: SIZES.small,
  },
});
