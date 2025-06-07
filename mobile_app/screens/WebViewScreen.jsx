import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function WebViewScreen() {
  const route = useRoute();
  const { url } = route.params;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState={true}
        scalesPageToFit={true}
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