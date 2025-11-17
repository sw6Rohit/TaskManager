// components/WelcomeModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    userName?: string;
    apiData?: any; // <-- new prop to display API data
};


const WelcomeModal: React.FC<Props> = ({ visible, onClose, userName, apiData }) => {
    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.message}>
                        Welcome {userName || 'User'}! You have successfully logged in.
                    </Text>

                    {apiData ? (
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.message}>Status: {apiData?.status || 'N/A'}</Text>
                            <Text style={styles.message}>Task: {apiData?.task || 'N/A'}</Text>
                            {/* Add more fields as per your API response */}
                        </View>
                    ) : (
                        <Text style={styles.message}>Fetching status...</Text>
                    )}

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Ok</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default WelcomeModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#555',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
