import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';

interface StockChartProps {
  data: {
    dates: string[];
    prices: number[];
  };
  symbol: string;
}

export default function StockChart({ data, symbol }: StockChartProps) {
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
  };

  const chartData = {
    labels: data.dates,
    datasets: [
      {
        data: data.prices,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <LineChart
      data={chartData}
      width={screenWidth - SIZES.medium * 2}
      height={220}
      chartConfig={chartConfig}
      bezier
      style={{
        marginVertical: SIZES.medium,
        borderRadius: SIZES.small,
      }}
      yAxisLabel="₹"
      yAxisInterval={1}
    />
  );
}
