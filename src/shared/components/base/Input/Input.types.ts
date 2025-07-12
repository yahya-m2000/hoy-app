/**
 * Base Input component types
 */

import {
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
} from "react-native";

export interface BaseInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  style?: any;
  inputStyle?: any;
  labelStyle?: any;
  errorStyle?: any;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: RNTextInputProps["keyboardType"];
  autoCapitalize?: RNTextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  maxLength?: number;
  // Password suggestion props
  textContentType?: RNTextInputProps["textContentType"];
  autoComplete?: RNTextInputProps["autoComplete"];
  passwordRules?: string;
}

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  required?: boolean;
}
