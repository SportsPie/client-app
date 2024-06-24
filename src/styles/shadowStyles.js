import { Platform, StyleSheet } from 'react-native';
import { COLORS } from './colors';

const shadowStyles = StyleSheet.create({
  shadowBottom: {
    ...Platform.select({
      android: {
        elevation: 10, // Android only
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2, // offset is only applied on Y-axis as per your CSS box-shadow
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  shadowToast: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.46,
    shadowRadius: 11.14,

    elevation: 17,
  },
  shadow1: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
});

export default shadowStyles;
