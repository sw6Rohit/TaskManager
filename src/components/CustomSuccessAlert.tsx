import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Share from 'react-native-share';
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const CustomSuccessAlert = ({ visible, onClose, photoPath,shareImageToWhatsApp }) => {
  // const shareImageToWhatsApp = async () => {
  //   try {
  //     await Share.open({
  //       url: `file://${photoPath}`,
  //       type: 'image/jpeg',
  //       social: Share.Social.WHATSAPP,
  //       message: 'Check out my attendance!',
  //     });
  //   } catch (error) {
  //     console.log('Sharing failed', error);
  //   }
  // };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>✅ Attendance Marked!</Text>
          {/* <Text style={styles.subtitle}>What would you like to do next?</Text> */}

          <View style={{flexDirection:'row',justifyContent:'space-evenly',width:'100%'}}>
            <TouchableOpacity style={styles.shareBtn} onPress={shareImageToWhatsApp}>
            
            <FontAwesome size={25} name='whatsapp' color={'#fff'}/>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={onClose}>
            <Text style={styles.okText}>OK</Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomSuccessAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E7F4D',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  whatsappIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  shareText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  okBtn: {
    backgroundColor: '#1E7F4D',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  okText: {
    color: 'white',
    fontSize: 16,
  },
});
