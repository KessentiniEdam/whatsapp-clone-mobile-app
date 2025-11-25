import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Authentification from './Screens/Authentification';
import Home from './Screens/Home';
import SignUp from './Screens/SignUp';
import Chat from './Screens/Chat';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Authentification" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Authentification" component={Authentification} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Chat" component={Chat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}