import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, TouchableHighlight } from 'react-native';
import { auth, db, database } from '../config/config';

export default function MyProfil({ route, navigation }) {
  const uid = route?.params?.currentid ?? route?.params?.uid ?? auth.currentUser?.uid;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // editable fields
  const [name, setName] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const refUser = database.ref().child('all_users').child(uid);
    
    const handleValue = (snapshot) => {
      const data = snapshot.val();
      const p = data ? { id: uid, ...data } : null;
      setProfile(p);
      if (p) {
        setName(p.name ?? '');
        setPseudo(p.pseudo ?? '');
        setNumero(p.numero ?? '');
        setEmail(p.email ?? auth.currentUser?.email ?? '');
      }
      setLoading(false);
    };

    const handleError = (err) => {
      console.error('Profile fetch error (RTDB)', err);
      setLoading(false);
    };

    refUser.on('value', handleValue, handleError);

    return () => refUser.off('value', handleValue);
  }, [uid]);

  const signOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Authentification' }] });
      })
      .catch((err) => console.error('Sign out error', err));
  };

  const deleteAccount = async () => {
    Alert.alert('Supprimer le compte', 'Voulez‑vous vraiment supprimer votre compte ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            // Remove profile entry in Realtime Database if exists
            if (uid) await database.ref().child('all_users').child(uid).remove();

            // Delete auth user (may require recent login)
            if (auth.currentUser) {
              await auth.currentUser.delete();
            }

            // After complete deletion, reset to Authentification
            navigation.reset({ index: 0, routes: [{ name: 'Authentification' }] });
          } catch (err) {
            console.error('Delete account error', err);
            // Handle the common requires-recent-login error
            if (err && err.code === 'auth/requires-recent-login') {
              Alert.alert(
                'Ré-authentification requise',
                'Pour supprimer votre compte, reconnectez-vous puis réessayez.',
                [
                  {
                    text: 'Se déconnecter',
                    style: 'default',
                    onPress: async () => {
                      try {
                        await auth.signOut();
                      } catch (e) {
                        console.error('Sign out after requires-recent-login error', e);
                      }
                      navigation.reset({ index: 0, routes: [{ name: 'Authentification' }] });
                    },
                  },
                  { text: 'Annuler', style: 'cancel' },
                ],
              );
            } else {
              Alert.alert('Erreur', err.message || "Impossible de supprimer le compte. Réessayez plus tard.");
            }
          }
        },
      },
    ]);
  };

  if (loading) return (
    <View style={styles.container}><Text>Loading...</Text></View>
  );


  const handleUpdateProfile = async () => {
    if (!uid) {
      Alert.alert('No UID', 'Cannot update profile without a user id');
      return;
    }

    const refUser = database.ref().child('all_users').child(uid);
    try {
      await refUser.update({ id: uid, name, pseudo, numero, email });
      Alert.alert('Updated', 'Profile updated successfully');
    } catch (err) {
      console.error('Update profile error', err);
      Alert.alert('Error', err.message || 'Could not update profile');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 20, fontWeight: '700', marginTop: -10}}>Profile</Text>
      <Text style={{marginBottom: 70,marginTop:40}} ></Text>

      <TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.input} />
      <TextInput value={pseudo} onChangeText={setPseudo} placeholder="Pseudo" style={styles.input} />
      <TextInput value={numero} onChangeText={setNumero} placeholder="Numero" style={styles.input} keyboardType="phone-pad" />

      <TouchableHighlight style={{ marginTop: 30 }} onPress={handleUpdateProfile}>
        <Text style={{color:"#441e95"}}>Mettre à jour le profil</Text>
      </TouchableHighlight>

      <View style={{ marginTop: 20, width: '80%',Color:"#591840ff" }}>
        <Button title="Se déconnecter" onPress={signOut} />
      </View>

      <View style={{ marginTop: 12, width: '80%' }}>
        <Button title="Supprimer le compte" color="#c62828" onPress={deleteAccount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#234a2d1e' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { width: '80%', height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, marginTop: 12 },
});
// 