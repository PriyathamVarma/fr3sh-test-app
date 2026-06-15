import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
): string {
  return props.light ?? (Colors[colorName] as string) ?? '#065f46';
}
