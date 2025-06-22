import React, { useState, useEffect } from 'react';
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

const CourseTreeModal = ({
  visible,
  onClose,
  data,
  selectedId,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  data: any[];
  selectedId: number | null;
  onSelect: (node: any) => void;
}) => {
  const [search, setSearch] = useState('');
  const [filteredTree, setFilteredTree] = useState(data);
  const [selectedNode, setselectedNode] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!search) {
      setFilteredTree(data);
    } else {
      const filterTree = (nodes: any[]) => {
        return nodes
          .map((node) => {
            const children = node.Children ? filterTree(node.Children) : [];
            const match = node.CourseName?.toLowerCase().includes(search.toLowerCase());
            if (match || children.length > 0) {
              return {
                ...node,
                Children: children,
                expanded: true
              };
            }
            return null;
          })
          .filter(Boolean);
      };
      setFilteredTree(filterTree(data));
    }
  }, [search, data]);

  const toggleExpand = (id: number) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const findNode = (nodes: any[], id: number): any | null => {
    for (const node of nodes) {
      if (node.CourseId === id) return node;
      if (node.Children) {
        const found = findNode(node.Children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const TreeNode = ({ node, level }: { node: any; level: number }) => {
    const isExpanded = expandedNodes[node.CourseId] || false;
    const isSelected = selectedId === node.CourseId;
    const hasChildren = node.Children?.length > 0;

    return (
      <View style={{ marginLeft: level * 15 }}>
        <TouchableOpacity onPress={() => hasChildren ? toggleExpand(node.CourseId) : onSelect(node)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {hasChildren ? (
              <Text style={styles.nodeText}>
                {isExpanded ? '▼ ' : '▶ '}
                {node.CourseName}
              </Text>
            ) : (
              <>
                <Checkbox checked={isSelected} onPress={() => {setselectedNode(node);onSelect(node)}} />
                <Text style={styles.nodeText}>{node.CourseName}</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && hasChildren && (
          node.Children.map((child: any) => (
            <TreeNode key={child.CourseId} node={child} level={level + 1} />
          ))
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{selectedNode?.CourseName || 'Select Course'}</Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search course"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#888"
        />
        
        <ScrollView contentContainerStyle={styles.treeContainer}>
          {filteredTree?.map((node: any) => (
            <TreeNode key={node.CourseId} node={node} level={0} />
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
    bottom: 0,
    height: screenHeight * 0.7,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
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
    marginLeft: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff4d4d',
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

export default CourseTreeModal;