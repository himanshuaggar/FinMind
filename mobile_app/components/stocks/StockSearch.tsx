import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Input from '../common/Input';
import Button from '../common/Button';
import { COLORS, SIZES } from '../../constants/theme';

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  loading?: boolean;
}

export default function StockSearch({ onSearch, loading }: StockSearchProps) {
  const [symbol, setSymbol] = useState('');

  const handleSearch = () => {
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase());
    }
  };

  return (
    <View style={styles.container}>
      <Input
        value={symbol}
        onChangeText={setSymbol}
        placeholder="Enter stock symbol (e.g., RELIANCE.NS)"
        autoCapitalize="characters"
      />
      <Button
        title="Search"
        onPress={handleSearch}
        loading={loading}
        disabled={!symbol.trim()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.small,
    gap: SIZES.small,
  },
});
