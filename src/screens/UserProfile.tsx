import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { sagaActions } from '../redux/saga/sagaActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Colors from '../utils/Colors';
import { clearUser } from '../redux/slices/userSlice';

const UserProfile: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const userData = useSelector((state: RootState) => state?.user);

  useEffect(() => {
    if (!userData.userInfo) {
      setLoading(false);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [userData]);

  const logout = () => {
   dispatch(clearUser());
    setLoading(true);
  };

  const ProfileSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    contact: Yup.string()
      .matches(/^[0-9]{10}$/, 'Contact must be 10 digits')
      .required('Contact is required'),
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Picture and Edit Icon */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: userData?.userInfo?.profilePicture || 'https://bootdey.com/img/Content/avatar/avatar6.png' }}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editIcon} onPress={() => setIsEditing(true)}>
          <MaterialIcons name="edit" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {
        isEditing ? 
        <Formik
        enableReinitialize
        initialValues={{
          name: userData?.userInfo?.AgentName || '',
          contact: userData?.userInfo?.number || '',
          email: userData?.userInfo?.Email_id_Offical || '',
        }}
        validationSchema={ProfileSchema}
        onSubmit={(values) => {
          console.log('Updated Profile:', values);
          setIsEditing(false);
          // You can dispatch an update profile action here
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              editable={isEditing}
            />
            {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              editable={isEditing}
            />
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Contact"
              value={values.contact}
              onChangeText={handleChange('contact')}
              onBlur={handleBlur('contact')}
              keyboardType="phone-pad"
              editable={isEditing}
            />
            {touched.contact && errors.contact && <Text style={styles.error}>{errors.contact}</Text>}

              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
          </>
        )}
      </Formik>
      :
      <View style={styles.profileSection}>
      <Text style={styles.name}>{userData?.userInfo?.AgentName}</Text>
      <Text style={styles.email}>{userData?.userInfo?.Email_id_Offical}</Text>
      <Text style={styles.email}>{userData?.userInfo?.contact}</Text>
  </View>

      }

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.logoutButtonText}>Log Out</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: Colors.grad1,
    paddingVertical: 25,
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 10,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ff6f61',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 135,
    backgroundColor: '#ff6f61',
    borderRadius: 20,
    padding: 5,
  },
  input: {
    width: '80%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 15,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginLeft: '10%',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff6f61',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
},
email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
},
});

export default UserProfile;
