import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type BackButtonProps = {
  label?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconSize?: number;
  iconColor?: string;
  onPress?: () => void;
};

const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  style,
  textStyle,
  iconSize = 22,
  iconColor = '#007AFF',
  onPress,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.button, style]}>
      <Ionicons name="arrow-back" size={iconSize} color={iconColor} />
      {/* <Text style={[styles.text, textStyle]}>{label}</Text> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    marginLeft: 6,
    color: '#007AFF',
  },
});

export default BackButton;
