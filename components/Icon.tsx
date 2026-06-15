import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IoniconsName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 22, color = Colors.foregroundBody }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
