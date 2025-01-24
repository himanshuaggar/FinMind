import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

export default function WebViewScreen() {
  const { url } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: decodeURIComponent(url) }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webview: {
    flex: 1,
  },
});
