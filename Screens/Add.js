// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
// import { auth, database } from '../config/config';

// export default function Add({ navigation }) {
//   const [nom, setNom] = useState('');
//   const [prenom, setPrenom] = useState('');
//   const [numero, setNumero] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleAdd = async () => {
//     if (!nom.trim() || !prenom.trim() || !numero.trim()) {
//       Alert.alert('Champs manquants', "Veuillez remplir tous les champs");
//       return;
//     }

//     const owner = auth.currentUser?.uid ?? null;
//     if (!owner) {
//       Alert.alert('Non authentifié', "Vous devez être connecté pour ajouter un profil");
//       return;
//     }

//     setLoading(true);
//     try {
//       const ref_base = database.ref();
//       const ref_profils = ref_base.child('profils');
//       const newRef = ref_profils.push();
//       const key = newRef.key;

//       const payload = {
//         id: key,
//         nom: nom.trim(),
//         prenom: prenom.trim(),
//         numero: numero.trim(),
//         owner: owner,
//         createdAt: Date.now(),
//       };

//       await newRef.set(payload);

//       Alert.alert('Inséré', 'Profil ajouté avec succès');
//       // reset inputs
//       setNom('');
//       setPrenom('');
//       setNumero('');

//       // optional: navigate back to list
//       if (navigation && navigation.navigate) navigation.navigate('List');
//     } catch (err) {
//       console.error('Error inserting profil', err);
//       Alert.alert('Erreur', "Impossible d'ajouter le profil");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Ajouter un profil</Text>

//       <TextInput value={nom} onChangeText={setNom} placeholder="Nom" style={styles.input} />
//       <TextInput value={prenom} onChangeText={setPrenom} placeholder="Prénom" style={styles.input} />
//       <TextInput value={numero} onChangeText={setNumero} placeholder="Numéro" style={styles.input} keyboardType="phone-pad" />

//       <TouchableOpacity
//         activeOpacity={0.7}
//         disabled={loading}
//         onPress={handleAdd}
//         style={[styles.button, loading && { opacity: 0.6 }]}
//       >
//         <Text style={styles.buttonText}>{loading ? 'Ajout...' : "Ajouter"}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: '#fff', alignItems: 'center' },
//   title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
//   input: { width: '100%', height: 44, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, marginTop: 8 },
//   button: { marginTop: 16, backgroundColor: '#007aff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
//   buttonText: { color: '#fff', fontWeight: '600' },
// });
