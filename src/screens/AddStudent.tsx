import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DropdownModal from '../components/DropdownModal';
import { axiosRequest } from '../utils/ApiRequest';
import Constant from '../utils/Constant';
import { showMessage } from 'react-native-flash-message';
import TreeView from '../components/TreeNode';

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

const months = [...Array(12).keys()].map((m) => ({
  label: (m + 1).toString(),
  value: (m + 1).toString(),
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
  const [course,setCourse]=useState();
  useEffect(()=>{
    getCourse();
  },[])
  const getCourse=async ()=>{
     await axiosRequest('http://61.246.33.108:8069/api/course/hierarchy', Constant.API_REQUEST_METHOD.GET)
              .then(({ data }) => {
                console.log(data);
      
                if (data) {
                  setCourse(data)
                } else {
                }
              })
              .catch(() => {
                // addOfflinePic(param);
              });
  }
  return (
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
          pipeline:'',
          stages:'',
          userId:'',
          campaign:''
        }}
        // validationSchema={validationSchema}
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
              data={courses}
              onSelect={(item) => setFieldValue('pipeline', item.value)}
            />
            {touched.course && errors.course && (
              <Text style={styles.error}>{errors.pipeline}</Text>
            )}
             <Text style={styles.label}>Select Stages</Text>
            <DropdownModal
            placeholder={'Select Stages'}
              data={courses}
              onSelect={(item) => setFieldValue('stages', item.value)}
            />
            {touched.course && errors.course && (
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
            <Text style={styles.label}>Campaign</Text>
             <DropdownModal
            placeholder={'Select Campaign'}
              data={courses}
              onSelect={(item) => setFieldValue('campaign', item.value)}
            />
            {touched.campaign && errors.campaign && (
              <Text style={styles.error}>{errors.campaign}</Text>
            )}
            <Text style={styles.label}>User</Text>
             <DropdownModal
            placeholder={'Select User'}
              data={courses}
              onSelect={(item) => setFieldValue('userId', item.value)}
            />
            {touched.userId && errors.campaign && (
              <Text style={styles.error}>{errors.userId}</Text>
            )}

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

            <Text style={styles.label}>Courses</Text>
           <TreeView data={course} selectedId={(it)=>console.log(it)
           } />
            {touched.course && errors.course && (
              <Text style={styles.error}>{errors.course}</Text>
            )}

            <Button title="Submit" onPress={handleSubmit} />
            <View style={{ marginTop: 10 }}>
              <Button title="Cancel" onPress={onCancel} color="gray" />
            </View>
          </>
        )}
      </Formik>
    </ScrollView>
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
});

export default AddStudent;
