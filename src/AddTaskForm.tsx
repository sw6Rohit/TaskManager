import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropdownModal from './components/DropdownModal';
import CategoryModal from './components/CategoryModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import ToggleButton from './components/ToggleButton'
import moment from 'moment';
import { axiosRequest } from './utils/ApiRequest';
import Url from './utils/Url';
import Constant from './utils/Constant';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';

const AddTaskForm = ({ onSubmit, onClose }: any) => {
  const [showDescription, setShowDescription] = useState(false);
  const [showProjName, setShowProjName] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const titleInputRef = useRef<TextInput>(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [treeData, setTreeData] = useState([]);
  const [selectedNode, setselectedNode] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState({});
  const [showDateMenu, setShowDateMenu] = useState(false);
  const {projectList,userList} = useSelector((state: RootState) => state.user.taskMaster);
  const [showRepeatMenu, setShowRepeatMenu] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [repeatMenus, setRepeatMenus] = useState([
    { label: 'Daily', value: 'daily' },
    { label: 'Weekdays', value: 'weekdays' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Custom', value: 'custom' },
  ]);

  const [taskMetrics, setTaskMetrics] = useState({
    point: selectedNode?.CourseID.toString() || '',
    quantity: '1',
    unit: '/Unit',
    total: '0',
  });



  const [dueDate, setDueDate] = useState<string | null>(null);
  const now = new Date();
  const today = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));


  useEffect(() => {
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 500);
  }, []);

  useEffect(() => {

    const point = parseFloat(selectedPoint?.points) || 0;
    const quantity = parseFloat(taskMetrics.quantity) || 0;

    const total = (point * quantity).toString();
    // console.log(point, quantity, total);

    setTaskMetrics((prev) => ({ ...prev, total }));
  }, [selectedPoint, taskMetrics.quantity]);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    dueDate: Yup.string().required('Due Date is required'),
    assignedTo: Yup.string().required('Assigned To is required'),
  });

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const items = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 },
  ];
  const items2 = [
    { label: 'Project 1', value: 1 },
    { label: 'Project 2', value: 2 },
    { label: 'Project 3', value: 3 },
  ];



  useEffect(() => {
    const fetchAndBuildTree = async () => {
      try {
        const response = await axios.post(
          'https://atm.sunobhaiya.com/Task/GetTreeStructre',
          {
            TableName: 'TMS_M_Category',
            SalepipeLineID: 0,
          },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const rawData = response.data;
        const tree = buildTree(rawData);
        setTreeData(tree);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAndBuildTree();
  }, []);

  useEffect(() => {
    getPoints(selectedNode?.CourseName)
  }, [selectedNode])


  
  const getPoints = async (catName: any = '') => {
    try {
      const { data } = await axios.get(
        `https://atm.sunobhaiya.com/Task/GetCategorydetails?categoryName=${catName}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      setSelectedPoint(data)

    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleDateSelect = (option: string) => {
    let selected: string | null = null;

    if (option === 'Today') {
      selected = today.toISOString().split('T')[0];
      console.log(selected);
    } else if (option === 'Tomorrow') {
      today.setDate(today.getDate() + 1);

      selected = today.toISOString().split('T')[0];
    } else {
      selected = null;
      setShowDatePicker(true)
    }

    setDueDate(selected);
    setShowDateMenu(false);
  };

  const buildTree = data => {
    const map = {};
    const roots: any = [];

    data.forEach(item => {
      map[item.ID] = { ...item, children: [], expanded: false };
    });

    data.forEach(item => {
      if (item.CourseID === 0) {
        roots.push(map[item.ID]);
      } else if (map[item.CourseID]) {
        map[item.CourseID].children.push(map[item.ID]);
      }
    });

    // console.log(roots);

    return roots;
  };

  const toggleNode = (id: any) => {
    const toggleRecursive = (nodes: any) =>
      nodes.map((node: any) => {
        if (node.ID === id) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children.length > 0) {
          return { ...node, children: toggleRecursive(node.children) };
        }
        return node;
      });

    setTreeData(prev => toggleRecursive(prev));
  };

  const toggleCheck = id => {
    const toggleRecursive = nodes =>
      nodes.map(node => {
        if (node.ID === id) {
          setselectedNode(node);
          return { ...node, checked: !node.checked };
        }
        return {
          ...node, checked: false,
          children: toggleRecursive(node.children),
        };
      });

    setTreeData(prev => toggleRecursive(prev));
  };

  const toggleSwitch = (value: boolean) => {
    setIsAllDay(value);
    setShowDateMenu(false)
  }
  return (
    <View
      style={{ flex: 1, marginBottom: 5, paddingHorizontal: 10 }}
    >
      <Formik
        initialValues={{ p_name: '', description: '', dueDate: moment().add(1, 'day').format('YYYY-MM-DD'), assignedTo: '', title: '', category: '', }}
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          onSubmit(values);
          actions.resetForm();
          setShowDescription(false);
          setSelectedDate('');
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
        }) => (
          <View style={{ flex: 1 }} >
            <View style={{ width: '100%' }}>
              <Text style={styles.label}>Task Title</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Add Title"
                  value={values.title}
                  onChangeText={(text) => setFieldValue('title', text)}
                  style={styles.newTodoInput}
                  autoCorrect={false}
                />
                {/* <TouchableOpacity style={{ position: 'absolute', right: 15 }} >
                    <Text style={styles.inputIcon}>➕</Text>
                  </TouchableOpacity> */}
              </View>
              {touched.title && errors.title && (
                <Text style={styles.error}>{errors.title}</Text>
              )}
            </View>
            <>
              {!showDescription && (
                <TouchableOpacity onPress={() => setShowDescription(true)}>
                  <Text style={styles.linkText}>+ Add Description</Text>
                </TouchableOpacity>
              )}

              {showDescription && (
                <>
                  <TouchableOpacity onPress={() => setShowDescription(false)}>
                    <Text style={styles.linkText}>Description -</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter description"
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    multiline
                    numberOfLines={4}
                  />
                </>
              )}

              <Text style={styles.label}>Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.categoryBox}>
                <Text style={{ color: '#555' }}>{selectedNode?.CourseName || 'Select category'}</Text>
              </TouchableOpacity>

              <CategoryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                treeData={treeData}
                toggleNode={toggleNode}
                toggleCheck={(id: any) => { toggleCheck(id); setFieldValue('category', id) }}
                selectedPoint={selectedPoint}
              />
              {touched.category && errors.category && (
                <Text style={styles.error}>{errors.category}</Text>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {/* Point */}
                <View style={{ flex: 1, marginHorizontal: 5 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Point</Text>
                  <TextInput
                    value={selectedPoint?.points}
                    editable={false}
                    style={styles.disabledText}
                  />

                </View>
                <View style={{ flex: 1, marginHorizontal: 5 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Qty</Text>
                  <TextInput
                    value={taskMetrics.quantity}
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      setTaskMetrics((prev) => ({ ...prev, quantity: text }))
                    }
                    style={[styles.disabledText, {
                      backgroundColor: '#fff',
                      borderWidth: 1,
                      borderColor: '#ccc',
                    }]}
                  />
                </View>

                {/* Unit */}
                <View style={{ flex: 2, marginHorizontal: 5 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Unit</Text>
                  <TextInput
                    editable={false}
                    value={selectedPoint.Unit}
                    onChangeText={(text) =>
                      setTaskMetrics((prev) => ({ ...prev, unit: text }))
                    }
                    style={styles.disabledText}
                  />
                </View>

                {/* Total */}
                <View style={{ flex: 1.5, marginHorizontal: 5 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Total</Text>
                  <TextInput
                    editable={false}
                    value={taskMetrics.total}
                    keyboardType="numeric"
                    // onChangeText={(text) =>
                    //   setTaskMetrics((prev) => ({ ...prev, total: taskMetrics?.total}))
                    // }
                    style={styles.disabledText}
                  />
                </View>
              </View>

            </>
            {!showProjName && (
              <TouchableOpacity onPress={() => setShowProjName(true)}>
                <Text style={styles.linkText}>+ Add ProjName</Text>
              </TouchableOpacity>
            )}
            {showProjName && <>
              <TouchableOpacity onPress={() => setShowProjName(false)}>
                <Text style={styles.linkText}>Project Name -</Text>
              </TouchableOpacity>
              <DropdownModal
                data={projectList.map((item:any)=>{
                 return{
                   label:item?.projectName,
                  value:item?.projectId,
                 }
                })}
                value={values.p_name}
                onSelect={(val: any) => setFieldValue('p_name', val.value)}
              />
            </>}
            {touched.p_name && errors.p_name && (
              <Text style={styles.error}>{errors.p_name}</Text>
            )}

            <Text style={styles.label}>Assigned To</Text>
            <DropdownModal
               data={userList.map((item:any)=>{
                 return{
                   label:item?.AgentName,
                  value:item?.AgentId,
                 }
                })}
              value={values.assignedTo}
              onSelect={(val: any) => setFieldValue('assignedTo', val.value)}
            />
            {touched.assignedTo && errors.assignedTo && (
              <Text style={styles.error}>{errors.assignedTo}</Text>
            )}
            {/* <TouchableOpacity style={styles.setDueDateButton} onPress={() => setShowDateMenu(true)}>
                <Text style={styles.setDueDateIcon}>📅</Text>
                <Text style={styles.setDueDateText}>Set due date</Text>
              </TouchableOpacity> */}

            <Text style={styles.label}>Due Date</Text>

            {showDateMenu && (
              <View style={styles.dateMenu}>
                <TouchableOpacity onPress={() => {
                  const formatted = formatDate(today);
                  setFieldValue('dueDate', formatted);
                  setSelectedDate(formatted);
                  setShowDateMenu(false);
                }}>
                  <Text style={styles.dateOption}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  today.setDate(today.getDate() + 1);
                  const formatted = formatDate(today);
                  setFieldValue('dueDate', formatted);
                  setSelectedDate(formatted);
                  setShowDateMenu(false)
                }}>
                  <Text style={styles.dateOption}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDateSelect('Custom')}>
                  <Text style={styles.dateOption}>Custom</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* <TouchableOpacity
              onPress={() => setShowDateMenu(true)}
              style={styles.dateInput}
            >
              <Text style={{ color: values.dueDate ? '#000' : '#999' }}>
                {values.dueDate || 'Select due date'}
              </Text>
            </TouchableOpacity> */}

            <View style={styles.container}>
              <Ionicons name="alarm-outline" size={24} color="black" style={styles.icon} />

              <View style={styles.textContainer}>
                <Text style={styles.title}>Due Date</Text>
                <TouchableOpacity
                  onPress={() => !isAllDay ? setShowDateMenu(true) : setShowDateMenu(false)}
                // style={styles.dateInput}
                >
                  <Text style={styles.subtitle}>{values.dueDate || 'No reminder set'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.toggleContainer}>
                <Text style={styles.allDayText}>All Day</Text>
                <Switch
                  value={isAllDay}
                  onValueChange={(value) => {
                    toggleSwitch(value);
                    const formatted = formatDate(today);
                    value ? setFieldValue('dueDate', formatted)
                      : setFieldValue('dueDate', moment().add(1, 'day').format('YYYY-MM-DD hh:mm:ss'))
                  }}
                />
              </View>
            </View>


            {touched.dueDate && errors.dueDate && (
              <Text style={styles.error}>{errors.dueDate}</Text>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate ? new Date(selectedDate) : new Date()}
                mode={'date'}
                // mode={isAllDay? 'date' :'datetime'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) {
                    const formatted = formatDate(date);
                    setFieldValue('dueDate', formatted);
                    setSelectedDate(formatted);
                  }
                }}
              />
            )}

            <TouchableOpacity style={styles.setDueDateButton} onPress={() => setShowRepeatMenu(true)}>
              <Text style={styles.setDueDateIcon}>🔁</Text>
              <Text style={styles.setDueDateText}>Repeat</Text>
            </TouchableOpacity>
            {showRepeatMenu && repeatMenus.map((item: any, index: number) => {
              return (
                <TouchableOpacity style={{
                  flexDirection: 'column', backgroundColor: '#fff',

                  zIndex: 100,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  paddingHorizontal: 5,
                  shadowRadius: 4,
                  elevation: 5,
                }} key={index} onPress={() => setShowRepeatMenu(false)}>
                  <Text style={styles.dateOption}>{item.value}</Text>
                </TouchableOpacity>)
            })}
            <View style={styles.saveButtonWrapper}>
              <TouchableOpacity style={styles.saveButton} onPress={() => handleSubmit()}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: 'red' }]} onPress={() => onClose()}>
                <Text style={styles.saveButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

          </View>

        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({

  label: {
    marginBottom: 6,
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    fontSize: 12,
  },
  linkText: {
    color: '#007bff',
    marginBottom: 12,
    textDecorationLine: 'underline',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  inputWithButton: {
    flex: 1,
    paddingVertical: 12,
  },
  categoryBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  setDueDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6', // light gray background
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB', // light border
    marginTop: 10,
  },
  setDueDateIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  setDueDateText: {
    fontSize: 14,
    color: '#374151', // dark gray
    fontWeight: '500',
  },
  dateMenu: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    position: 'relative',
    // bottom: 60,
    width: '100%',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dateOption: {
    paddingVertical: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  newTodoInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: '#3A7DFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    width: '45%'
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  saveButtonWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 50,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  disabledText: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    borderRadius: 4,
    padding: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    color: '#555',
    fontSize: 13,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allDayText: {
    marginRight: 8,
    fontWeight: '600',
  },

});

export default AddTaskForm;
