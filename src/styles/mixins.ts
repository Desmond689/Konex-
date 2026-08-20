import { ViewStyle } from 'react-native';

export const flexCenter: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
};

export const flexRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
};

export function shadow(elevation = 4): ViewStyle {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: 0.25,
    shadowRadius: elevation,
    elevation,
  };
}
