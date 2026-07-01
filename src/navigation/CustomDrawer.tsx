import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import Icon from 'react-native-vector-icons/Feather';

export default function CustomDrawer(props: any) {
  const {menus} = useSelector((state: RootState) => state.user);

  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);

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
          {/* <Image source={require('../assets/logo.png')} style={styles.logo} /> */}

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
});
