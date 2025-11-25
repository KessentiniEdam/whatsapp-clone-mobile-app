import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { auth, database } from '../config/config';

// Helper: deterministic chat id for two users
function makeChatId(a, b) {
  if (!a || !b) return null;
  return a < b ? `${a}_${b}` : `${b}_${a}`;
}

export default function Chat({ route }) {
  // route.params should provide `otherId` (the other user's uid)
  const currentUid = route?.params?.currentid ?? auth.currentUser?.uid ?? route?.params?.uid ?? null;
  const otherUid = route?.params?.otherId ?? route?.params?.uid2 ?? null;

  const chatId = makeChatId(currentUid, otherUid);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const flatRef = useRef();

  useEffect(() => {
    if (!chatId) return;

    const ref = database.ref().child('chats').child(chatId).child('messages');

    const onChild = (snap) => {
      const m = snap.val();
      if (!m) return;
      setMessages((prev) => {
        const exists = prev.find((p) => p._id === snap.key);
        if (exists) return prev;
        return [...prev, { _id: snap.key, ...m }].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      });
    };

    ref.on('child_added', onChild);

    return () => ref.off('child_added', onChild);
  }, [chatId]);

  // listen for other user's typing flag
  useEffect(() => {
    if (!chatId || !otherUid) {
      setOtherTyping(false);
      return;
    }
    const ref_other_typing = database.ref().child('chats').child(chatId).child('typing').child(otherUid);
    const onTyping = (snap) => setOtherTyping(Boolean(snap.val()));
    ref_other_typing.on('value', onTyping);
    return () => ref_other_typing.off('value', onTyping);
  }, [chatId, otherUid]);

  const sendMessage = async () => {
    if (!text.trim() || !chatId || !currentUid) return;
    const ref = database.ref().child('chats').child(chatId).child('messages');
    const newRef = ref.push();
    const msg = {
      text: text.trim(),
      sender: currentUid,
      receiver: otherUid,
      createdAt: Date.now(),
    };
    try {
      await newRef.set(msg);
      setText('');
      // optional: scroll to end
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('sendMessage error', err);
    }
  };

  const renderItem = ({ item }) => {
    const mine = item.sender === currentUid;
    return (
      <View style={[styles.messageRow, mine ? styles.rightRow : styles.leftRow]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.composerWrap}>
        {otherTyping ? (
          <View style={styles.typingIndicator}><Text>En train d'écrire...</Text></View>
        ) : null}
        <View style={styles.composer}>
          <TextInput
            value={text}
            onFocus={() => {
              if (!chatId || !currentUid) return;
              const ref_me_typing = database.ref().child('chats').child(chatId).child('typing').child(currentUid);
              ref_me_typing.set(true).catch((e) => console.error('set typing true error', e));
            }}
            onBlur={() => {
              if (!chatId || !currentUid) return;
              const ref_me_typing = database.ref().child('chats').child(chatId).child('typing').child(currentUid);
              ref_me_typing.set(false).catch((e) => console.error('set typing false error', e));
            }}

            onChangeText={setText}
            placeholder="Type a message..."
            style={styles.input}
            multiline
          />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  list: { padding: 12, paddingBottom: 8 },
  messageRow: { marginVertical: 6, flexDirection: 'row' },
  leftRow: { justifyContent: 'flex-start' },
  rightRow: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12 },
  bubbleMine: { backgroundColor: '#4f93ff', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#e5e5ea', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { color: '#000' },
  timeText: { fontSize: 10, color: '#333', marginTop: 6, textAlign: 'right' },
  composer: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#ddd', alignItems: 'flex-end', backgroundColor: '#fff' },
  composerWrap: { backgroundColor: '#fff' },
  typingIndicator: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff' },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  sendButton: { marginLeft: 8, backgroundColor: '#007aff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '600' },
});
