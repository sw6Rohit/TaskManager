// StudentList.js
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import AddStudent from './AddStudent';
import Constant from '../utils/Constant';
import { axiosRequest } from '../utils/ApiRequest';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';


const initialStudents = [
  { id: '1', name: 'John Doe', class: '10th Grade' },
  { id: '2', name: 'Jane Smith', class: '9th Grade' },
];

const StudentList = () => {
  const [students, setStudents] = useState(initialStudents);
  const [showForm, setShowForm] = useState(false);
       const {userInfo,taskMaster} = useSelector((state: RootState) => state?.user);
const navigation =useNavigation()
  const handleAddStudent = (newData) => {
    const newStudent = {
      id: Date.now().toString(),
      name: newData.fullName,
      class: newData.message || 'Unspecified',
      ...newData,
    };
    setStudents([...students, newStudent]);
    setShowForm(false);
  };

  const getStudentList=()=>{
    
  }
  const saveStudent=async (params:any)=>{
    console.log(params);
  const param={
  "UserID": userInfo?.AgentId,
  "FirstName": params?.firstName,
  "FathersName": params?.F_firstName,
  "MothersName": "",
  "Gender": params?.gender,
  "DOB": `${params?.birthDay}-${params?.birthMonth}-${params?.birthYear}T00:00:00`,//"1992-05-15T00:00:00",
  "CasteCategortyId": 2,
  "RefID": null,
  "CompaignID": params?.campaign?.ID,
  "SubCompaignID": params?.campaign?.ParentID,
  "LeadStatusID": params?.stages,
  "CollegeId": null,
  "AssignedUserId": null,
  "InstitutionID": -1,
  "CommentId": null,
  "ExamID": null,
  "Examscore": null,
  "Status": "1",
  "Archive": false,
  "BestCallTime": null,
  "CreationDate": "2020-09-13T00:00:00",
  "ModifyDate": "2020-09-14T00:00:00",
  "Family_Income": 300000,
  "Qualification": "Graduate",
  "Stream": "Commerce",
  "WorkExperience": "2 years",
  "Cand_App_ID": null,
  "Heard_About_DDUGKY_Details": "Newspaper",
  "Registered_By": "admin",
  "Registration_Type": "Walk-in",
  "Training_Status": "Not started",
  "Verification_Status": "Pending",
  "CourseTypeId": 1,
  "CourseId": params?.course?.CourseId,
  "Remarks": "Looking for EPBA Only",
  "FollowDate": null,
  "FcampaignID": 37,
  "FUser": 3,
  "Mobile_Personal": params?.mobile1,
  "Mobile_Work": null,
  "Mobile_Home": null,
  "FCourseID": 25,
  "Email_Personal": params?.email,
  "Email_Work": null,
  "Email_Home": null,
  "PortalID": "L905598",
  "LeadHistoryID": null,
  "SalesPipelineID": 2,
  "ChangeUserFlag": null,
  "LeadProcessFlag": null,
  "LeadProcessDate": null,
  "RoleID": null,
  "City": "Delhi",
  "LeadInsertionDate": "2020-09-13T00:00:00",
  "PoolFlag": false,
  "SocialMediaFlag": false,
  "Mobile_Whatsup": params?.mobile2,
  "DataInsertSource": "Portal",
  "ActionTakenByLastUser": null,
  "VisitCount": 0,
  "LastVisitDate": null,
  "LastVisitSource": null
}

   await axiosRequest('http://61.246.33.108:8069/savelead', Constant.API_REQUEST_METHOD.POST, param)
          .then(({ data }) => {
            console.log(data);
  
            if (data) {
              // showMessage({ message: "Record Saved Successfully Now Capture Image", type: 'success' });
              navigation.navigate('TakePicture')
              Alert.alert("Record Saved Successfully Now Capture Image")
              // navigation.goBack();
            } else {
              // showMessage({ message: data?.message, type: 'danger' });
              // addOfflinePic(param);
            }
          })
          .catch(() => {
            // addOfflinePic(param);
          });
}

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this student?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setStudents(students.filter((student) => student.id !== id));
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.classText}>{item.class}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Text style={styles.btnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
  <Text style={styles.backButtonText}>← Back</Text>
</TouchableOpacity>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
        <Text style={styles.addText}>+ Add Student</Text>
      </TouchableOpacity>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <Modal visible={showForm} animationType="slide">
        <AddStudent
          onSubmit={saveStudent}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  backButton: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  alignSelf: 'flex-start',
  backgroundColor: '#ddd',
  borderRadius: 8,
  marginBottom: 10,
},
backButtonText: {
  fontSize: 16,
  color: '#333',
},

  addBtn: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  classText: {
    fontSize: 14,
    color: '#666',
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  btnText: {
    color: 'white',
    fontSize: 14,
  },
});

export default StudentList;
