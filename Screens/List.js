import React, { useEffect, useState, useMemo } from 'react';
import { View,ImageBackground, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { database, auth } from '../config/config';

export default function List({ navigation, route }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const currentUid = auth.currentUser?.uid ?? null;
    const ref_profils = database.ref().child('all_users');

    // If not authenticated, just read nothing
    if (!currentUid) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const handleValue = (snapshot) => {
      const all = [];
      snapshot.forEach((one) => {
        all.push({ id: one.key, ...one.val() });
      });

      // We want to list other users (contacts). Filter out the current user by uid.
      const visible = all.filter((p) => p && p.id !== currentUid);

      setProfiles(visible);
      setLoading(false);
    };

    const handleError = (error) => {
      console.error('Error fetching profils (RTDB):', error);
      // show an error message in the UI
      setProfiles([]);
      setLoading(false);
      // optionally inform the user
      if (error && error.code === 'PERMISSION_DENIED') {
        // permission denied from RTDB rules
        // We avoid Alert spam when first rendering; set a visible message instead
        setErrorMessage('Accès refusé à la base de données. Vérifiez les règles Realtime Database.');
      } else if (error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erreur lors de la lecture des profils');
      }
    };

    ref_profils.on('value', handleValue, handleError);

    return () => {
      ref_profils.off('value', handleValue);
    };
  }, []);

  const [errorMessage, setErrorMessage] = useState('');

  // filter profiles using the query (client-side)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => {
      const name = (p.name || p.displayName || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      const pseudo = (p.pseudo || '').toLowerCase();
      return name.includes(q) || email.includes(q) || pseudo.includes(q);
    });
  }, [profiles, query]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Chat', { otherId: item.id, currentid: auth.currentUser?.uid })}
    >
<Text style={styles.title}>
  {(typeof item.name === 'string' ? item.name : 'Sans nom') +
   (item.pseudo && typeof item.pseudo === 'string' ? ` (${item.pseudo})` : '')}
</Text>

      <Text style={styles.sub}>{item.numero ?? ''}</Text>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (errorMessage) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#c00', padding: 12, textAlign: 'center' }}>{errorMessage}</Text>
      </View>
    );
  }

  return (
<ImageBackground 
      source={require('../assets/wts.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search users by name, email or pseudo"
          style={styles.search}
          clearButtonMode="while-editing"
        />
      </View>

      {filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>aucun profil trouvé...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  searchWrap: { padding: 8, backgroundColor: '#075E54' },
  search: { height: 40, backgroundColor: '#f1f1f1', borderRadius: 8, paddingHorizontal: 12 },
  item: {
  padding: 12,
  borderRadius: 8,
  backgroundColor: '#fff',
  marginBottom: 10,
  elevation: 2,
  borderLeftWidth: 4,
  borderLeftColor: '#25D366'
},
title: { fontSize: 16, fontWeight: '600', color: '#000' },
sub: { fontSize: 12, color: '#128C7E', marginTop: 4 }
});
