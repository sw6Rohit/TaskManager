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

const CampaignModal = ({
  visible,
  onClose,
  treeData,
  onSelect,
  selectedPoint,
}: {
  visible: boolean;
  onClose: () => void;
  treeData: any[];
  onSelect: (node: any) => void;
  selectedPoint?: { points: number; Unit: string };
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedNode, setselectedNode] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // console.log(treeData);
  

  const toggleCheck = (id: number) => {
    setSelectedId(prevId => {
      const newId = prevId === id ? null : id;
      if (newId) {
        const selectedNode = findNode(treeData, newId);
        console.log(selectedNode);
        
        if (selectedNode) onSelect(selectedNode);
      } else {
        onSelect(null);
      }
      return newId;
    });
  };

  const findNode = (nodes: any[], id: number): any | null => {
    for (const node of nodes) {
      if (node.ID === id) return node;
      if (node.Children) {
        const found = findNode(node.Children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const filterTree = (nodes: any[], query: string) =>
    nodes
      .map((node: any) => {
        const children = node.Children ? filterTree(node.Children, query) : [];
        const match = node.CompaginName?.toLowerCase().includes(query.toLowerCase()) || 
                      node.CourseName?.toLowerCase().includes(query.toLowerCase());
        return (match || children.length > 0) 
          ? { ...node, children, expanded: true } 
          : null;
      })
      .filter(Boolean);

  const filteredTree = search ? filterTree(treeData, search) : treeData;

  const TreeNode = ({ node, level }: { node: any; level: number }) => {
    const isExpanded = expandedNodes[node.ID] || false;
    const isSelected = selectedId === node.ID;
    const hasChildren = node.Children?.length > 0

    return (
      <View style={{ marginLeft: level * 15 }}>
        <TouchableOpacity onPress={() => hasChildren ? toggleExpand(node.ID) : toggleCheck(node.ID)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {hasChildren ? (
              <Text style={styles.nodeText}>
                {isExpanded ? '▼   ' : '▶ '}
                {node.CompaginName || node.CourseName}
              </Text>
            ) : (
              <>
                <Checkbox checked={isSelected} onPress={() => {setselectedNode(node);toggleCheck(node.ID)}} />
                <Text style={styles.nodeText}>{node.CompaginName || node.CourseName}</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && hasChildren && (
          node.Children.map((child: any) => (
            <TreeNode key={child.ID} node={child} level={level + 1} />
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

        <Text style={styles.title}>{selectedNode?.CompaginName || 'Select Campaign'}</Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search campaign"
          value={search}
          onChangeText={setSearch}
        />
        
        <ScrollView contentContainerStyle={styles.treeContainer}>
          {filteredTree?.map((node: any) => (
            <TreeNode key={node.ID} node={node} level={0} />
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
    // position: 'absolute',
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

export default CampaignModal;