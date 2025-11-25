import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { auth, database } from '../config/config';

export default function SignUp({ navigation }) {
  const [name, setName] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const pwdRef = useRef();

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      alert('Please provide name, email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      // write profile to Realtime Database under all_users/{uid}
      const refAll = database.ref().child('all_users').child(uid);
      try {
        await refAll.set({ id: uid, name, pseudo, numero, email });
      } catch (dbErr) {
        console.error('RTDB write error after signup', dbErr);
        // If DB write fails due to permissions, inform the user and rollback auth user to avoid orphan account
        Alert.alert(
          'Erreur base de données',
          'Impossible d\u2019écrire les données de profil (permission refusée). Vérifiez les règles Realtime Database dans la console Firebase.',
          [{ text: 'OK' }]
        );

        // Attempt to delete the just-created auth user to avoid orphaned accounts
        try {
          if (userCredential.user) await userCredential.user.delete();
        } catch (delErr) {
          console.error('Failed to delete auth user after DB failure', delErr);
        }

        navigation.reset({ index: 0, routes: [{ name: 'Authentification' }] });
        return;
      }

      // After signup the user is already authenticated by Firebase compat;
      // navigate directly to Home and pass the uid so tabs receive initial params.
      navigation.reset({ index: 0, routes: [{ name: 'Home', params: { uid } }] });
    } catch (err) {
      console.error('SignUp error', err);
      // Handle common Firebase auth errors
      if (err && err.code === 'auth/email-already-in-use') {
        Alert.alert('Compte existant', 'Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse.');
      } else if (err && err.code === 'auth/invalid-email') {
        Alert.alert('Email invalide', 'L\'adresse e-mail fournie est invalide.');
      } else if (err && err.code === 'auth/weak-password') {
        Alert.alert('Mot de passe faible', 'Le mot de passe est trop faible. Choisissez-en un plus long.');
      } else {
        Alert.alert('Erreur', err.message || 'Impossible de créer le compte');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Pseudo" value={pseudo} onChangeText={setPseudo} style={styles.input} />
      <TextInput placeholder="Numero" value={numero} onChangeText={setNumero} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
      <TextInput ref={pwdRef} placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 12 }} />
      ) : (
        <View style={{ width: '80%', marginTop: 12 }}>
          <Button title="Create account" onPress={handleSignUp} />
        </View>
      )}

      <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#333' }}>Back to sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: {
    width: '80%',
    height: 44,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
