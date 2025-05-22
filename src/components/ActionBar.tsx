import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';

interface HeaderProps {
    title: any;
    subtitle?: string;
    showBackButton?: boolean;
    rightIcon?: string;
    onMenuIconPress?: () => void;
    showSearch?: boolean;
    onChangeText?: (text: string) => void;
    onCloseSearch?: () => void;
}

const ActionBar: React.FC<HeaderProps> = ({ title, subtitle, showBackButton, rightIcon, onMenuIconPress,showSearch,onChangeText,onCloseSearch }) => {
    // const navigation = useNavigation();
    const [isSearching, setIsSearching] = useState<any>(false);
    const [searchQuery, setSearchQuery] = useState('');

    // const onRightPress = () => {
    //     navigation.navigate('UserProfile');
    // };

    const toggleSearch = () => {
        setIsSearching(true);
    };

    const closeSearch = () => {
        setIsSearching(false);
        setSearchQuery('');
    };

    return (
            <View style={styles.container}>
                {isSearching ? (
                    <View style={styles.searchContainer}>
                        {/* <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} /> */}
                        <TextInput
                            autoFocus
                            placeholder="होर्डिंग आईडी डाले"
                            placeholderTextColor="#ccc"
                            style={styles.searchInput}
                            // value={searchQuery}
                            onChangeText={(value) => onChangeText(value)}
                        />
                        <TouchableOpacity onPress={()=>{closeSearch();onCloseSearch()}}>
                            {/* <Ionicons name="close" size={24} color="#fff" /> */}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* {showBackButton ? (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={onMenuIconPress} style={styles.iconButton}>
                                <Ionicons name="menu" size={28} color="#fff" />
                            </TouchableOpacity>
                        )} */}

                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{title}</Text>
                            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                        </View>

                        {/* {showSearch&& <TouchableOpacity onPress={toggleSearch} style={styles.iconButton}>
                            <Ionicons name="search" size={24} color="#fff" />
                        </TouchableOpacity>} */}

                        {/* <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                            {rightIcon ? (
                                <Ionicons name={rightIcon} size={24} color="#fff" />
                            ) : (
                                <Image
                                    source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar6.png' }}
                                    style={styles.profileImage}
                                />
                            )}
                        </TouchableOpacity> */}
                    </>
                )}
            </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        elevation: 8,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconButton: {
        padding: 5,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#fdd',
        marginTop: 2,
    },
    profileImage: {
        width: 35,
        height: 35,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        paddingHorizontal: 10,
        flex: 1,
        height: 40,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
    },
});

export default ActionBar;
