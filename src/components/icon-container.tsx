import { StyleSheet, View, type ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Radii } from '@/constants/theme';

interface IconContainerProps extends ViewProps {
  icon: string;
  color: string;
  size?: number;
}

export function IconContainer({ icon, color, size = 40, style, ...rest }: IconContainerProps) {
  const backgroundColor = hexToRgba(color, 0.12);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: Radii.icon,
          backgroundColor,
        },
        style,
      ]}
      {...rest}
    >
      <ThemedText style={[styles.icon, { fontSize: size * 0.5 }]}>{icon}</ThemedText>
    </View>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {},
});
