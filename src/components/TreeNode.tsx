import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TreeNode = ({ node, level = 0, selectedId, onSelect }: any) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.Children && node.Children.length > 0;
  const isLeaf = !hasChildren;
  const isSelected = selectedId === node.CourseId;

  return (
    <View style={{ marginLeft: level * 16 }}>
      <TouchableOpacity
        style={styles.nodeRow}
        onPress={() => {
          if (hasChildren) setExpanded(!expanded);
          else onSelect(node);
        }}
      >
        {hasChildren ? (
          <Icon
            name={expanded ? 'expand-more' : 'chevron-right'}
            size={20}
            style={styles.icon}
          />
        ) : (
          <View style={{ width: 20 }} />
        )}

        {isLeaf && (
          <Icon
            name={isSelected ? 'check-box' : 'check-box-outline-blank'}
            size={20}
            color={isSelected ? '#00796b' : '#888'}
            style={{ marginRight: 6 }}
          />
        )}

        <Text style={[styles.nodeText, isSelected && styles.selectedText]}>
          {node.CourseName}
        </Text>
      </TouchableOpacity>

      {expanded &&
        node.Children.map((child: any) => (
          <TreeNode
            key={child.CourseId}
            node={child}
            level={level + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  icon: {
    marginRight: 6,
  },
  nodeText: {
    fontSize: 16,
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#00796b',
  },
  selectedContainer: {
    padding: 10,
    backgroundColor: '#e0f2f1',
    marginBottom: 8,
    borderRadius: 6,
  },
  selectedLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#00796b',
  },
  selectedValue: {
    fontSize: 16,
    marginTop: 2,
  },
});

export default TreeNode;
