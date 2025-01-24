import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../constants/theme";

export default function StockSearch({ onSearch, loading }) {
  const [symbol, setSymbol] = useState("");

  const handleSearch = () => {
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={symbol}
          onChangeText={setSymbol}
          placeholder="Enter stock symbol..."
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <FontAwesome5 name="search" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>
        Example: RELIANCE.NS, HDFCBANK.NS, TATAMOTORS.NS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.small,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    color: COLORS.textPrimary,
    fontSize: SIZES.medium,
    marginRight: SIZES.small,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.small,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
    marginTop: SIZES.xSmall,
  },
});
