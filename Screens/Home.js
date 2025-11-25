import React from 'react';
import { View } from 'react-native';
import { auth } from '../config/config';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import List from './List';
import MyProfil from './MyProfil';
import { Ionicons } from '@expo/vector-icons';  // ✅ le bon import pour Expo

const Tab = createBottomTabNavigator();

export default function Home({ route, navigation }) {
  const params = route?.params ?? {};
  const currentid = params.currentid ?? params.uid ?? null;

  const signOut = () => {
    auth
      .signOut()
      .then(() => navigation.reset({ index: 0, routes: [{ name: 'Authentification' }] }))
      .catch((err) => console.error('Sign out error', err));
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true, 
          headerStyle: { backgroundColor: '#075E54' }, 
          headerTintColor: '#fff',                     


          
          headerRight: () => (
            <Ionicons
              name="log-out-outline"
              size={26}
              color="green"
              onPress={signOut}
              style={{ marginRight: 15 }}
            />
          ),
          headerRightContainerStyle: { paddingRight: 12 },
 tabBarActiveTintColor: '#128C7E',   
  tabBarInactiveTintColor: 'gray',          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tab.Screen

          name="List"
          component={List}
          initialParams={{ currentid }}
        />
        <Tab.Screen
          name="MyProfil"
          component={MyProfil}
          initialParams={{ currentid }}
        />
      </Tab.Navigator>
    </View>
  );
}
