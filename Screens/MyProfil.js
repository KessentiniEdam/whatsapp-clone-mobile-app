import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TextInput,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { auth, db, database, supabase } from "../config/config";
import * as ImagePicker from "expo-image-picker";

export default function MyProfil({ route, navigation }) {
  const uid =
    route?.params?.currentid ??
    route?.params?.uid ??
    auth.currentUser?.uid;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // editable fields
  const [name, setName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [numero, setNumero] = useState("");
  const [email, setEmail] = useState("");

  // ---- FETCH PROFILE ---- //
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const refUser = database.ref(`all_users/${uid}`);

    const handleValue = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProfile({ id: uid, ...data });
        setName(data.name ?? "");
        setPseudo(data.pseudo ?? "");
        setNumero(data.numero ?? "");
        setEmail(data.email ?? auth.currentUser?.email ?? "");
        setPhotoUrl(data.photoURL ?? data.image ?? data.UserImage ?? null);
      }
      setLoading(false);
    };

    refUser.on("value", handleValue);
    return () => refUser.off("value", handleValue);
  }, [uid]);

  // ---- SIGNOUT ---- //
  const signOut = () => {
    auth
      .signOut()
      .then(() =>
        navigation.reset({ index: 0, routes: [{ name: "Authentification" }] })
      )
      .catch((err) => console.error("Sign out error", err));
  };

  // ---- IMAGE PICKER ---- //
  const pickImageAndUpload = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert(
          "Permission requise",
          "Autorisez l'accès à la galerie pour sélectionner une image."
        );
      }

      const mediaTypes =
        ImagePicker.MediaType?.Images ||
        ImagePicker.MediaTypeOptions?.Images ||
        ImagePicker.MediaTypeOptions.All;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      await uploadImageToSupabase(uri);
    } catch (err) {
      console.error("pickImage error", err);
      Alert.alert("Erreur", err.message || "Impossible de sélectionner l'image.");
    }
  };

  // ---- UPLOAD TO SUPABASE ---- //
  const uploadImageToSupabase = async (uri) => {
    if (!uid) {
      return Alert.alert("Erreur", "Utilisateur introuvable");
    }

    setUploading(true);

    try {
      // Convert to binary
      const res = await fetch(uri);
      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Extension detection
      let ext = uri.split(".").pop().split("?")[0].toLowerCase();
      if (!ext || ext.length > 5) ext = "jpg";

      const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

      // Correct bucket name: "eric"
      const filePath = `profiles/${uid}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("eric")
        .upload(filePath, bytes, {
          upsert: true,
          contentType: mime,
        });

      if (uploadError) throw uploadError;

      // get public URL
      const { data: publicData, error: urlError } = supabase.storage
        .from("eric")
        .getPublicUrl(filePath);

      if (urlError) throw urlError;

      const publicUrl = publicData?.publicUrl;

      // Save in Firebase RTDB
      await database.ref(`all_users/${uid}`).update({
        photoURL: publicUrl,
      });

      setPhotoUrl(publicUrl);
    } catch (err) {
      console.error("uploadImageToSupabase error", err);
      Alert.alert("Erreur", err.message || "Upload impossible.");
    } finally {
      setUploading(false);
    }
  };

  // ---- UPDATE PROFILE ---- //
  const handleUpdateProfile = async () => {
    if (!uid) {
      return Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    }

    try {
      await database.ref(`all_users/${uid}`).update({
        id: uid,
        name,
        pseudo,
        numero,
        email,
      });

      Alert.alert("Succès", "Profil mis à jour");
    } catch (err) {
      console.error("Update error", err);
      Alert.alert("Erreur", err.message || "Échec de la mise à jour");
    }
  };

  // ---- DELETE ACCOUNT ---- //
  const deleteAccount = async () => {
    Alert.alert(
      "Supprimer le compte",
      "Voulez-vous vraiment supprimer votre compte ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await database.ref(`all_users/${uid}`).remove();
              if (auth.currentUser) await auth.currentUser.delete();

              navigation.reset({
                index: 0,
                routes: [{ name: "Authentification" }],
              });
            } catch (err) {
              if (err.code === "auth/requires-recent-login") {
                Alert.alert(
                  "Ré-authentification requise",
                  "Reconnectez-vous pour supprimer le compte.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        auth.signOut();
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Authentification" }],
                        });
                      },
                    },
                    { text: "Annuler" },
                  ]
                );
              } else {
                Alert.alert("Erreur", err.message);
              }
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Profile</Text>

      <TouchableOpacity onPress={pickImageAndUpload} style={{ marginTop: 20 }}>
        {uploading ? (
          <ActivityIndicator size="small" />
        ) : photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              marginBottom: 12,
            }}
          />
        ) : (
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#e6e6e6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text>Ajouter</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={styles.input}
      />
      <TextInput
        value={pseudo}
        onChangeText={setPseudo}
        placeholder="Pseudo"
        style={styles.input}
      />
      <TextInput
        value={numero}
        onChangeText={setNumero}
        placeholder="Numero"
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TouchableHighlight
        style={{ marginTop: 30 }}
        onPress={handleUpdateProfile}
      >
        <Text style={{ color: "#441e95" }}>Mettre à jour</Text>
      </TouchableHighlight>

      <View style={{ marginTop: 20, width: "80%" }}>
        <Button title="Se déconnecter" onPress={signOut} />
      </View>

      <View style={{ marginTop: 12, width: "80%" }}>
        <Button
          title="Supprimer le compte"
          onPress={deleteAccount}
          color="#c62828"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#234a2d1e",
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 12,
  },
});
