import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

const ToggleButton = () => {
  const [isToggled, setIsToggled] = useState(false);

  const toggle = () => setIsToggled(prev => !prev);

  return (
    <TouchableOpacity style={[styles.button, isToggled && styles.active]} onPress={toggle}>
      <Text style={styles.text}>{isToggled ? 'ON' : 'OFF'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
    width: 100,
  },
  active: {
    backgroundColor: '#4caf50',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ToggleButton;
