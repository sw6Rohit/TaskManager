import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DropdownModal from '../components/DropdownModal';
import { axiosRequest } from '../utils/ApiRequest';
import Constant from '../utils/Constant';
import { showMessage } from 'react-native-flash-message';
import TreeView from '../components/TreeNode';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import CampaignTree from '../components/CampaignModal';
import TreeNode from '../components/TreeNode';
import CourseTreeModal from '../components/CourseTreeModal';
import CampaignModal from '../components/CampaignModal';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string(),
  lastName: Yup.string().required('Last name is required'),
  birthMonth: Yup.string().required('Birth month is required'),
  birthDay: Yup.string().required('Birth day is required'),
  birthYear: Yup.string().required('Birth year is required'),
  gender: Yup.string().required('Gender is required'),
  address1: Yup.string().required('Address is required'),
  address2: Yup.string(),
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobile1: Yup.string().required('Mobile number is required'),
  mobile2: Yup.string(),
  course: Yup.string().required('Please select a course'),
});

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const months = monthNames.map((name, index) => ({
  label: name,
  value: (index + 1).toString(),
}));
const days = [...Array(31).keys()].map((d) => ({
  label: (d + 1).toString(),
  value: (d + 1).toString(),
}));
const years = [...Array(50).keys()].map((y) => ({
  label: (2025 - y).toString(),
  value: (2025 - y).toString(),
}));

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const courses = ['Math', 'Science', 'History', 'English'].map((c) => ({
  label: c,
  value: c,
}));



const AddStudent = ({ onSubmit, onCancel }) => {
  const [course, setCourse] = useState([]);
  const [stages, setStages] = useState([]);
  const [pipeLine, setPipeLine] = useState([]);
  const [userList, setUserList] = useState([]);
  const [campaignList, setCampaignList] = useState<any>();
  const [selectedPipeline, setSelectedPipeline] = useState();
  const [selectedCourse, setSelectedCourse] = useState();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state?.user);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getCourse();
    getSalespipeline();
    const users = user?.taskMaster?.userList?.map((item) => {
      return {
        label: item?.AgentName,
        value: item?.AgentId
      }
    })
    // console.log(users,user);

    setUserList(users);
  }, [])
  useEffect(() => {
    const getCampaign = async () => {
      try {
        const { data } = await axiosRequest('http://61.246.33.108:8069/api/compagin/hierarchy', Constant.API_REQUEST_METHOD.GET);
        const tree = buildCampaignTree(data);
        setCampaignList(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    getCampaign();
  }, []);
  const buildCampaignTree = (data: any[]) => {
    const map = {};
    const roots: any[] = [];

    data.forEach(item => {
      map[item.ID] = { ...item, Children: [], expanded: false, checked: false };
    });

    data.forEach(item => {
      if (!item.ParentID || item.ParentID === 0) {
        roots.push(map[item.ID]);
      } else {
        map[item.ParentID].Children.push(map[item.ID]);
      }
    });
    console.log(roots);

    return roots;
  };

  const toggleNode = (id: any) => {

    const toggleRecursive = (nodes: any) =>
      nodes.map((node: any) => {
        if (node.ID === id) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.Children.length > 0) {
          return { ...node, Children: toggleRecursive(node.Children) };
        }
        return node;
      });

    setCampaignList(prev => toggleRecursive(prev));
  };

  const toggleCheck = id => {


    const toggleRecursive = nodes =>
      nodes.map(node => {
        if (node.ID === id) {
          setSelectedCampaign(node);
          console.log(id, node);

          return { ...node, checked: !node.checked };
        }
        return {
          ...node, checked: false,
          children: toggleRecursive(node.Children),
        };
      });

    setCampaignList(prev => toggleRecursive(prev));
  };




  const getCourse = async () => {
    await axiosRequest('http://61.246.33.108:8069/api/course/hierarchy', Constant.API_REQUEST_METHOD.GET)
      .then(({ data }) => {
        if (data) {
          setCourse(data)
        } else {
        }
      })
      .catch(() => {
        // addOfflinePic(param);
      });
  }

  const getSalespipeline = async () => {
    await axiosRequest('http://61.246.33.108:8069/api/salespipeline/all', Constant.API_REQUEST_METHOD.GET)
      .then(({ data }) => {
        if (data) {
          const dataforDropdown = data?.map((item: any) => {
            return {
              label: item?.SalesPipLineName,
              value: item?.SalesPipLineID
            }
          })
          setPipeLine(dataforDropdown)
        } else {
        }
      })
      .catch(() => {
      });
  }

  const getStages = async (pipelineId: any) => {
    await axiosRequest(`http://61.246.33.108:8069/api/stages/by-pipeline/${pipelineId}`, Constant.API_REQUEST_METHOD.GET)
      .then(({ data }) => {
        if (data) {
          const dataforDropdown = data?.map((item: any) => {
            return {
              label: item?.StatusName,
              value: item?.Id
            }
          })
          setStages(dataforDropdown)
        } else {
        }
      })
      .catch(() => {
      });
  }

  return (
    <>
      <TouchableOpacity onPress={onCancel} style={styles.crossButton}>
        <Text style={styles.crossText}>×</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            F_firstName: '',
            F_lastName: '',
            birthMonth: '',
            birthDay: '',
            birthYear: '',
            gender: '',
            address1: '',
            address2: '',
            email: '',
            mobile1: '',
            mobile2: '',
            course: '',
            pipeline: '',
            stages: '',
            userId: '',
            campaign: ''
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            onSubmit(values);
            resetForm();
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <>
              <Text style={styles.label}>Select Sales Pipeline</Text>
              <DropdownModal
                placeholder={'Select Sales Pipeline'}
                data={pipeLine}
                onSelect={(item) => {
                  setFieldValue('pipeline', item.value);
                  setSelectedPipeline(item?.value)
                  getStages(item?.value)
                }}
              />
              {touched.pipeline && errors.pipeline && (
                <Text style={styles.error}>{errors.pipeline}</Text>
              )}
              <Text style={styles.label}>Select Stages</Text>
              <DropdownModal
                placeholder={'Select Stages'}
                data={stages}
                onSelect={(item) => setFieldValue('stages', item.value)}
              />
              {touched.stages && errors.stages && (
                <Text style={styles.error}>{errors.stages}</Text>
              )}
              <Text style={styles.label}>Student Name</Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor={'grey'}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  value={values.firstName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor={'grey'}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  value={values.lastName}
                />
              </View>
              {touched.firstName && errors.firstName && (
                <Text style={styles.error}>{errors.firstName}</Text>
              )}
              {touched.lastName && errors.lastName && (
                <Text style={styles.error}>{errors.lastName}</Text>
              )}
              <Text style={styles.label}>Father Name</Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor={'grey'}
                  onChangeText={handleChange('F_firstName')}
                  onBlur={handleBlur('F_firstName')}
                  value={values.F_firstName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor={'grey'}
                  onChangeText={handleChange('F_lastName')}
                  onBlur={handleBlur('F_lastName')}
                  value={values.F_lastName}
                />
              </View>
              {touched.firstName && errors.F_firstName && (
                <Text style={styles.error}>{errors.F_firstName}</Text>
              )}
              {touched.lastName && errors.F_lastName && (
                <Text style={styles.error}>{errors.F_lastName}</Text>
              )}

              <Text style={styles.label}>Birth Date</Text>
              <View style={styles.row}>
                <View style={styles.flex1}>

                  <DropdownModal
                    placeholder={'Date'}
                    data={days}
                    onSelect={(item) => setFieldValue('birthDay', item.value)}
                  />
                </View>
                <View style={styles.flex1}>
                  <DropdownModal
                    placeholder={'Month'}
                    data={months}
                    onSelect={(item) => setFieldValue('birthMonth', item.value)}
                  />
                </View>
                <View style={styles.flex1}>
                  <DropdownModal
                    placeholder={'Year'}
                    data={years}
                    onSelect={(item) => setFieldValue('birthYear', item.value)}
                  />
                </View>
              </View>

              <Text style={styles.label}>Gender</Text>
              <DropdownModal
                data={genderOptions}
                onSelect={(item) => setFieldValue('gender', item.value)}
              />
              {touched.gender && errors.gender && (
                <Text style={styles.error}>{errors.gender}</Text>
              )}

              {/* <Text style={styles.label}>User</Text>
            <DropdownModal
              placeholder={'Select User'}
              data={userList}
              onSelect={(item) => setFieldValue('userId', item.value)}
            />
            {touched.userId && errors.campaign && (
              <Text style={styles.error}>{errors.userId}</Text>
            )} */}

              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.inputFull}
                placeholder="Street Address"
                onChangeText={handleChange('address1')}
                onBlur={handleBlur('address1')}
                value={values.address1}
              />
              <TextInput
                style={styles.inputFull}
                placeholder="Street Address Line 2"
                onChangeText={handleChange('address2')}
                onBlur={handleBlur('address2')}
                value={values.address2}
              />
              {touched.address1 && errors.address1 && (
                <Text style={styles.error}>{errors.address1}</Text>
              )}

              <Text style={styles.label}>Student E-mail</Text>
              <TextInput
                style={styles.inputFull}
                placeholder="example@example.com"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
              />
              {touched.email && errors.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}

              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.inputFull}
                placeholder="(000) 000-0000"
                onChangeText={handleChange('mobile1')}
                onBlur={handleBlur('mobile1')}
                value={values.mobile1}
                keyboardType="phone-pad"
              />
              {touched.mobile1 && errors.mobile1 && (
                <Text style={styles.error}>{errors.mobile1}</Text>
              )}

              <Text style={styles.label}>Mobile No (Alternate)</Text>
              <TextInput
                style={styles.inputFull}
                placeholder="(000) 000-0000"
                onChangeText={handleChange('mobile2')}
                onBlur={handleBlur('mobile2')}
                value={values.mobile2}
                keyboardType="phone-pad"
              />

              <View>

                <Text style={styles.label}>Course</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Text style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5 }}>
                    {values.course?.CourseName || 'Select Course'}</Text>
                </TouchableOpacity>
                <CourseTreeModal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  data={course}
                  selectedId={selectedCourse?.CourseId}
                  onSelect={(course) => {
                    setSelectedCourse(course);
                    setFieldValue('course', course?.CourseId); // if using Formik
                  }}
                />
              </View>
              {touched.course && errors.course && (
                <Text style={styles.error}>{errors.course}</Text>
              )}

              <Text style={styles.label}>Campaign</Text>
              <TouchableOpacity onPress={() => setCampaignModalVisible(true)}>
                <Text style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5 }}>{values.campaign?.CompaginName || 'Select Campaign'}</Text>
              </TouchableOpacity>

              <CampaignModal treeData={campaignList} onClose={() => setCampaignModalVisible(false)}
                visible={campaignModalVisible}
                onSelect={(selectedNode) => { setSelectedCampaign(selectedNode); setFieldValue('campaign', selectedNode) }}
                selectedPoint={{ points: 10, Unit: 'pts' }} />
              {touched.campaign && errors.campaign && (
                <Text style={styles.error}>{errors.campaign}</Text>
              )}

              <Button title="Submit" onPress={handleSubmit} />
              <View style={{ marginTop: 10 }}>
                <Button title="Cancel" onPress={onCancel} color="gray" />
              </View>
            </>
          )}
        </Formik>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  inputFull: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  flex1: {
    flex: 1,
    marginRight: 8,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  crossButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: '#eee',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  crossText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
  },

});

export default AddStudent;
