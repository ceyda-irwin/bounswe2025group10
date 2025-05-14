import { ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#4CAF50', // Green
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#757575',
  lightGray: '#EEEEEE',
  error: '#D32F2F',
  success: '#388E3C',
  text: '#333333', // Adding text color
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontWeight: '700',
  } as TextStyle,
  body: {
    fontSize: 16,
  } as TextStyle,
  caption: {
    fontSize: 14,
  } as TextStyle,
};

export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
  } as ViewStyle,
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  } as ViewStyle,
  button: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.md,
  } as ViewStyle,
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  } as TextStyle,
}; 