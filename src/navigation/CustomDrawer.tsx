import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { clearUser } from '../redux/slices/userSlice';

export default function CustomDrawer(props: any) {
  const {menus, userInfo} = useSelector((state: RootState) => state.user);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);
    const userData = useSelector((state: RootState) => state?.user);
  
    useEffect(() => {
      if (!userData.userInfo) {
        setLoading(false);
        navigation.reset({index: 0, routes: [{name: 'Login'}]});
      }
    }, [userData]);
  
    const logout = () => {
      dispatch(clearUser());
      setLoading(true);
    };

  const toggleMenu = (menuId: number) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId],
    );
  };

  const treeMenus = buildMenuTree(menus || []);

  const handleNavigation = (item: any) => {
    console.log(item);
    // props.navigation.navigate('WebViewScreen', {
    //   url: item?.menuUrl,
    // });

    switch (item.menuUrl) {
      case '/admin/students':
        props.navigation.navigate('StudentList');
        break;

      case '/attendance':
        props.navigation.navigate('AttendanceScreen');
        break;

      case '/attendance-history':
        props.navigation.navigate('AttendanceHistory');
        break;

      case '/profile':
        props.navigation.navigate('UserProfile');
        break;
      
      case '/admin/LeadDashboard':
        props.navigation.navigate('LeadDashboardScreen');
        break;

      default:
        console.log('No route mapped for:', item.menuUrl);
        break;
    }
  };

  const renderMenu = (item: any, level = 0) => {
    const hasChildren = item.children?.length > 0;
    const isExpanded = expandedMenus.includes(item.menuId);

    return (
      <View key={item.menuId}>
        <TouchableOpacity
          style={[
            styles.menuRow,
            {
              paddingLeft: 20 + level * 25,
            },
          ]}
          onPress={() => {
            if (hasChildren) {
              toggleMenu(item.menuId);
            } else {
              handleNavigation(item);
            }
          }}>
          <View style={styles.leftContainer}>
            <Icon name="menu" size={20} color="#344054" />

            <Text style={styles.menuText}>{item.menuName}</Text>
          </View>

          {hasChildren && (
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#344054"
            />
          )}
        </TouchableOpacity>

        {isExpanded &&
          item.children?.map((child: any) => renderMenu(child, level + 1))}
      </View>
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>BERRY</Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => props.navigation.closeDrawer()}>
          <Icon name="menu" size={22} color="#6C4CF1" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />
      {treeMenus.map(menu => renderMenu(menu))}
      {/* {Number(userInfo?.entityTypeId) === 4 && (
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => props.navigation.navigate('StudentFees')}>
          <View style={styles.leftContainer}>
            <Icon name="credit-card" size={20} color="#344054" />
            <Text style={styles.menuText}>My Fees</Text>
          </View>
        </TouchableOpacity>
      )} */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.logoutButtonText}>Log Out</Text>
              )}
            </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const buildMenuTree = (menus: any[]) => {
  const map: {[key: number]: any} = {};
  const roots: any[] = [];

  menus.forEach(menu => {
    map[menu.menuId] = {
      ...menu,
      children: [],
    };
  });

  menus.forEach(menu => {
    if (menu.parentMenuId === null || menu.parentMenuId === 0) {
      roots.push(map[menu.menuId]);
    } else {
      map[menu.parentMenuId]?.children.push(map[menu.menuId]);
    }
  });

  return roots;
};

const styles = StyleSheet.create({
  drawerContainer: {
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },

  header: {
    height: 110,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 38,
    height: 38,
  },

  logoText: {
    marginLeft: 10,
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1ECFB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuButtonIcon: {
    fontSize: 22,
    color: '#6C4CF1',
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  menuRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuIcon: {
    fontSize: 20,
    color: '#344054',
    marginRight: 18,
  },

  menuText: {
    fontSize: 18,
    color: '#344054',
    fontWeight: '400',
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
});
