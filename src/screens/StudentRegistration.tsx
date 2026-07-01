import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {axiosRequest} from '../utils/ApiRequest';
import Constant from '../utils/Constant';

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required'),
  middleName: Yup.string(),
  lastName: Yup.string().required('Last Name is required'),

  mobileNo: Yup.string()
    .required('Mobile Number is required')
    .min(10, 'Invalid Mobile Number')
    .max(10, 'Invalid Mobile Number'),

  emailId: Yup.string().email('Invalid Email').required('Email is required'),

  password: Yup.string()
    .required('Password is required')
    .min(6, 'Minimum 6 characters'),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Confirm Password is required'),
});

const StudentRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        actionBy: 0,
        email: values.emailId,
        emailId: values.emailId,

        entityTypeId: 4,

        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,

        loginId: values.mobileNo,
        mobileNo: values.mobileNo,

        oldPassword: '',
        newPassword: '',

        password: values.password,

        roleIds: '8',
        type: 0,
        userId: 0,

        userName: `${values.firstName} ${values.middleName} ${values.lastName}`
          .replace(/\s+/g, ' ')
          .trim(),

        isSystem: false,
      };

      console.log('Registration Payload =>', payload);

      await axiosRequest(
        'https://studentapinew.university99.com/api/user/A01User/register ',
        Constant.API_REQUEST_METHOD.POST,
        payload,
      ).then(({data}) => {
        console.log('Attendance Response:', data);
        if (data?.isSuccess) {
          Alert.alert('Success', 'Registration Created Successfully');
        }
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderError = (error?: string) => {
    if (!error) {
      return null;
    }

    return <Text style={styles.error}>{error}</Text>;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Create Account</Text>

      <Text style={styles.subHeading}>Fill in your details to continue.</Text>

      <Text style={styles.sectionTitle}>Student Registration</Text>

      <Text style={styles.sectionSubTitle}>
        Your email ID or mobile no will be used as your login ID.
      </Text>

      <Formik
        initialValues={{
          firstName: '',
          middleName: '',
          lastName: '',
          mobileNo: '',
          emailId: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleRegister}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          touched,
          errors,
        }) => (
          <>
            {/* First Name */}

            <Text style={styles.label}>First Name</Text>

            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={24} color="#64748B" />

              <TextInput
                style={styles.input}
                placeholder="Enter First Name"
                value={values.firstName}
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
              />
            </View>

            {touched.firstName && renderError(errors.firstName)}

            {/* Middle Name */}

            <Text style={styles.label}>Middle Name</Text>

            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={24} color="#64748B" />

              <TextInput
                style={styles.input}
                placeholder="Enter Middle Name"
                value={values.middleName}
                onChangeText={handleChange('middleName')}
              />
            </View>

            {/* Last Name */}

            <Text style={styles.label}>Last Name</Text>

            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={24} color="#64748B" />

              <TextInput
                style={styles.input}
                placeholder="Enter Last Name"
                value={values.lastName}
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
              />
            </View>

            {touched.lastName && renderError(errors.lastName)}

            {/* Mobile */}

            <Text style={styles.label}>Mobile No</Text>

            <View style={styles.inputBox}>
              <Ionicons name="call-outline" size={24} color="#64748B" />

              <TextInput
                keyboardType="phone-pad"
                style={styles.input}
                placeholder="Enter Mobile Number"
                value={values.mobileNo}
                onChangeText={handleChange('mobileNo')}
                onBlur={handleBlur('mobileNo')}
              />
            </View>

            {touched.mobileNo && renderError(errors.mobileNo)}

            {/* Email */}

            <Text style={styles.label}>Email ID</Text>

            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={24} color="#64748B" />

              <TextInput
                keyboardType="email-address"
                style={styles.input}
                placeholder="Enter Email ID"
                value={values.emailId}
                onChangeText={handleChange('emailId')}
                onBlur={handleBlur('emailId')}
              />

              {values.emailId.length > 0 && (
                <Ionicons name="checkmark-circle" size={24} color="green" />
              )}
            </View>

            {touched.emailId && renderError(errors.emailId)}

            {/* Password */}

            <Text style={styles.label}>Password</Text>

            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={24} color="#64748B" />

              <TextInput
                secureTextEntry={!showPassword}
                style={styles.input}
                placeholder="Enter Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

            {touched.password && renderError(errors.password)}

            {/* Confirm Password */}

            <Text style={styles.label}>Re-enter Password</Text>

            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={24} color="#64748B" />

              <TextInput
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                placeholder="Re-enter Password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
              />

              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

            {touched.confirmPassword && renderError(errors.confirmPassword)}

            <TouchableOpacity
              style={styles.button}
              disabled={loading}
              onPress={() => handleSubmit()}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#fff',
    flexGrow: 1,
  },

  heading: {
    fontSize: 42,
    fontWeight: '700',
    color: '#002B5B',
  },

  subHeading: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 5,
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#002B5B',
  },

  sectionSubTitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 5,
    marginBottom: 25,
  },

  label: {
    marginBottom: 8,
    marginTop: 10,
    color: '#475569',
    fontWeight: '600',
  },

  inputBox: {
    height: 60,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: '#000',
    fontSize: 16,
  },

  error: {
    color: 'red',
    marginTop: 4,
  },

  button: {
    height: 60,
    backgroundColor: '#0B5ED7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default StudentRegistration;
