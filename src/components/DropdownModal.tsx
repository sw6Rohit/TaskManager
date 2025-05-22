import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const DropdownModal = ({ data, onSelect }:any) => {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSelect = (item:any) => {
    setSelected(item);
    onSelect?.(item);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.buttonText}>
          {selected ? selected.label : 'Select'}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.bottomSheet}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderWidth:0.3,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color:'gray'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    height: screenHeight * 0.33,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
  },
});

export default DropdownModal;
