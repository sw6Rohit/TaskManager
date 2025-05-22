// Checkbox.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Checkbox = ({ checked, onPress }) => {
  return (
    <TouchableOpacity style={styles.checkbox} onPress={onPress}>
      <Text style={styles.checkboxIcon}>{checked ? '☑️' : '⬜'}</Text>
    </TouchableOpacity>
  );
};
       {/* <TextInput
        style={styles.searchInput}
        placeholder="Search by Course Name"
        value={searchText}
        onChangeText={setSearchText}
        />
        searchText ? filterTree(treeData, searchText) :  */}

const styles = StyleSheet.create({
  checkbox: {
    marginRight: 8,
  },
  checkboxIcon: {
    fontSize: 18,
  },
});

export default Checkbox;
