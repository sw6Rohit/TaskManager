// CategoryModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Checkbox from './Checkbox';

const screenHeight = Dimensions.get('window').height;

const CategoryModal = ({
  visible,
  onClose,
  treeData,
  toggleNode,
  toggleCheck,
  selectedPoint,
}: any) => {
  const [search, setSearch] = useState('');

  const filterTree = (nodes: any, query: string) =>
    nodes
      .map((node: any) => {
        const children = node.children ? filterTree(node.children, query) : [];
        const match = node.CourseName.toLowerCase().includes(query.toLowerCase());
        // console.log(node,children,match,query);

        if (match || children.length > 0) {
          return { ...node, children, expanded: true };
        }
        return null;
      })
      .filter(Boolean);

  const filteredTree = search ? filterTree(treeData, search) : treeData;


  const getMaxDepth = (nodes) => {
    let maxDepth = 0;

    const traverse = (node, depth) => {
      maxDepth = Math.max(maxDepth, depth);
      node.children?.forEach(child => traverse(child, depth + 1));
    };

    nodes.forEach(root => traverse(root, 1)); // Start depth at 1 for root

    return maxDepth;
  };

  const TreeNode = ({ node, level, toggleCheck, toggleNode }) => {
    const maxlev = getMaxDepth(node.children)
    // console.log(maxlev, node?.LevelID);

    return (
      <View style={{ marginLeft: level * 15 }}>
        {<TouchableOpacity onPress={() => toggleNode(node.ID)}>
          {node.children.length > 0 && maxlev > node?.LevelID ? (
            <Text style={styles.nodeText}>
              {node.expanded ? '▼ ' : '▶ '}
              {node.CourseName}
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox checked={node?.checked} onPress={() => toggleCheck(node.ID)} />
              <Text>{node.CourseName}</Text>
            </View>
          )}
        </TouchableOpacity>}

        {node.expanded && maxlev > node?.LevelID &&
          node.children.map(child => (
            <TreeNode
              key={child.ID}
              node={child}
              level={level + 1}
              toggleNode={toggleNode}
              toggleCheck={toggleCheck}
            />
          ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} >
      </TouchableOpacity>

      <View style={styles.modalContent}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Select Category</Text>
        <Text style={styles.title}>Points  :- {selectedPoint?.points}{' '}{selectedPoint?.Unit}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search category"
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView contentContainerStyle={styles.treeContainer}>
          {filteredTree.map((node: any) => (
            <TreeNode
              key={node.ID}
              node={node}
              level={0}
              toggleNode={toggleNode}
              toggleCheck={toggleCheck}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    height: screenHeight * 0.8,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  searchInput: {
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  treeContainer: {
    paddingBottom: 20,
  },
  nodeText: {
    fontSize: 14,
    marginVertical: 4,
  },
   closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff4d4d', // red background
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  closeText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 22,
  },
});

export default CategoryModal;
