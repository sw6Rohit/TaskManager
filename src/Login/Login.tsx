import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Alert, ActivityIndicator, StatusBar, Dimensions, Animated, Image } from 'react-native';

import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../utils/Colors';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../redux/store';
import { setUser } from '../redux/slices/userSlice';
import { axiosRequest } from '../utils/ApiRequest';
import Constant from '../utils/Constant';
import Url from '../utils/Url';
import { showMessage } from 'react-native-flash-message';

const LoginSchema = Yup.object().shape({
    User_Email_Id: Yup.string().required('Mobile No is required'),
    Password: Yup.string()
        .required('Password is required'),
});

const Login: React.FC = () => {
    const navigation: any = useNavigation();
    // const dispatch = useDispatch();
    // const { response, userData, loading, loginTime } = useSelector((state: RootState) => state.user);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const width = Dimensions.get("screen").width;
    const [state, setValueState] = useState({
        typing_email: false,
        typing_password: false,
        animation_login: new Animated.Value(width - 40),
        enable: true,
    });
    // console.log(userData,loginTime);

    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state?.user);

    useEffect(() => {
        if(user?.userInfo)
            navigation.navigate('DashBoard', {});
    }, [user]);




    const handleLogin = async (values: { User_Email_Id: string; Password: string }) => {
        const param = {
            ...values,
            "RememberMe": true,
            "IsRemoteLogin": true
        }
        setLoading(true)
        await axiosRequest('http://61.246.33.108:8069/login', Constant.API_REQUEST_METHOD.POST, param)
            .then(({ data }) => {
                if (data) {
                    setLoading(false)
                    showMessage({ message: 'Login Successfully', type: 'success' });
                    dispatch(setUser(data));
                    navigation.navigate('DashBoard', {});
                } else {
                    showMessage({ message: 'Something went wrong', type: 'danger' });
                    setLoading(false)
                }
            })
            .catch(() => {
                setLoading(false)
            });


    };
    function foucus(value: any) {
        if (value == "email") {
            setValueState((prev) => ({ ...prev, typing_email: true, typing_password: false }))
        }
        else {
            setValueState((prev) => ({ ...prev, typing_email: false, typing_password: true }))

        }
    }


    return (
        <LinearGradient colors={Colors.colorGradient} style={styles.background}>

            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* <Animated.Text entering={FadeInDown.duration(1000)} style={styles.title}>
                        Samvad
                    </Animated.Text> */}
                    <View style={styles.topImageContainer}>
                        {/* <Image
                            source={require("./assets/login_header.png")}
                            style={styles.topImage}
                        /> */}
                    </View>
                    {/* <Animated.Image
                        source={Images.LOGO} // Change to your image path
                        style={styles.logo}
                    /> */}


                    <Text style={styles.title}>{"Login"}</Text>
                    <Text style={styles.subtitle}>{"Task Management"}</Text>

                    <Formik initialValues={{ User_Email_Id: '', Password: '' }} onSubmit={handleLogin}
                        validationSchema={LoginSchema}>
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                            <Animated.View style={styles.inputContainer}>
                                <TextInput
                                    placeholder="Please enter Email Id/ mobile no"
                                    style={styles.input}
                                    value={values.User_Email_Id}
                                    onChangeText={handleChange('User_Email_Id')}
                                    onBlur={handleBlur('User_Email_Id')}
                                    placeholderTextColor="#ccc"
                                />
                                {touched.User_Email_Id && errors.User_Email_Id && (
                                    <Text style={styles.errorText}>{errors.User_Email_Id}</Text>
                                )}

                                {/* Password Input with Eye Icon */}
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        placeholder="Please input password"
                                        style={styles.passwordInput}
                                        value={values.Password}
                                        secureTextEntry={!showPassword}
                                        onChangeText={handleChange('Password')}
                                        onBlur={handleBlur('Password')}
                                        placeholderTextColor="#ccc"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#666" />
                                    </TouchableOpacity>
                                </View>

                                {touched.Password && errors.Password && (
                                    <Text style={styles.errorText}>{errors.Password}</Text>
                                )}

                                {/* Login Button */}
                                <TouchableOpacity style={styles.loginButton} onPress={() => handleSubmit()} >
                                    {
                                        loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : 
                                        (
                                            <Text style={styles.loginButtonText}>{"Login"}</Text>
                                        )}
                                </TouchableOpacity>

                            </Animated.View>
                        )}
                    </Formik>
                </View>
            </View>
            <View style={styles.leftVectorContainer}>
                {/* <ImageBackground
                    source={require("./assets/login_left.png")}
                    style={styles.leftVectorImage}
                /> */}
            </View>
        </LinearGradient>


    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    loginButtonGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    inputContainer: {
        width: '80%',
    },
    overlay: {
        flex: 1,
        width: '100%',
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.99)',
        // padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    input: {
        color: '#000',
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 25,
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 15,
        elevation: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 25,
        backgroundColor: '#fff',
        marginBottom: 15,
        elevation: 10,
    },
    passwordInput: {
        flex: 1,
        padding: 15,
        fontSize: 16,
        color: '#000',
    },
    eyeIcon: {
        padding: 15,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
    },
    loginButton: {
        backgroundColor: Colors.grad1,
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        shadowColor: Colors.grad1,
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 8,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logo: {
        width: 150,
        height: 120,
        alignSelf: 'center',
        marginVertical: 10,
        resizeMode: 'contain'
    },
    animation: {
        backgroundColor: '#93278f',
        paddingVertical: 10,
        marginTop: 30,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    topImageContainer: { width: '100%', position: 'absolute', top: 0 },
    topImage: {
        width: '100%',
        height: 150,
    },
    leftVectorContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: 0,
        borderTopRightRadius: 25,
        width: 50,
    },

    leftVectorImage: {
        height: 250,
        width: 150,
    },

});

export default Login;
