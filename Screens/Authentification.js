import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  ImageBackground,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import initApp, { auth } from '../config/config';
const styles = StyleSheet.create({
  container: {
    flex: 1, //el flex howa kobr el espace disponible par rapport l parent
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    // Ajoutez vos styles pour TextInput ici
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  }
  ,
  signIn: {
   color: 'white',
   marginTop: 20,
  },
});

export default function Authentification({ navigation }) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const refinput2 = useRef();

  const signIn = () => {
    if (!email || !pwd) {
      alert('Please provide email and password');
      return;
    }

    // Using compat auth instance exported from config
    auth
      .signInWithEmailAndPassword(email, pwd)
      .then((userCredential) => {
        const uid = userCredential.user.uid;
        // navigate to Home and pass uid
        navigation.navigate('Home', { uid }); // navigation.replace tna77i el possibilité de retour l page d'authentification ya3ni tna7iha mel stack
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View
        style={{ height: 40, width: "100%", backgroundColor: "#800040" }}
      ></View>
      <ImageBackground
        style={{
          marginTop: -70,
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          height: "100%",
          width: "100%",
        }}  
        resizeMode='cover'
        source={require("../assets/whatsapp.jpg")}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "flex-start",
            borderRadius: 8,
            backgroundColor: "#0005",
            width: "85%",
            height: 300,
          }}
        >
          <Text
            style={{
              marginTop: 15,
              fontSize: 32,
              fontWeight: "bold",
              color: "white",
            }}
          >
            Authentification
          </Text>
          <TextInput
            onChangeText={(text) => {
              setEmail(text);
            }}
            onSubmitEditing={()=>{refinput2.current.focus();}}
            blurOnSubmit={false}
            keyboardType="email-address"
            placeholder="email"
            placeholderTextColor="gray"
            style={styles.input}
          />
          <TextInput
          ref={refinput2}
            onChangeText={(text) => setPwd(text)}
            keyboardType="default"
            placeholder="password"
            placeholderTextColor="gray"
            secureTextEntry={true}
            style={styles.input}
          />
<TouchableOpacity
  onPress={signIn}
  style={{
    backgroundColor: '#0d381eff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 30,
  }}
>
  <Text
    style={{
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18,
      textShadowColor: '#000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 4,
    }}
  >
    Sign In
  </Text>
</TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingRight: 10,
              width: '100%',
              alignItems: 'flex-end',
            }}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={{ fontWeight: 'bold', color: 'white' }}>
              Create new user
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
