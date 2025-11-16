import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { database } from '../servicos/firebaseConfig';
import { ref, onValue, push } from 'firebase/database';

export default function ConversasTab({ route, navigation }) {
  const clientId = route?.params?.userId;
  const [barbeariasComChat, setBarbeariasComChat] = useState([]);
  const [barbeariaSelecionada, setBarbeariaSelecionada] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const flatListRef = useRef(null);

  //  Buscar barbearias com quem o cliente já conversou
  useEffect(() => {
    if (!clientId) return;

    const chatsRef = ref(database, 'chats/');
    const unsub = onValue(chatsRef, (snap) => {
      const data = snap.val() || {};
      const barbearias = [];

      Object.keys(data).forEach((barbId) => {
        if (data[barbId] && data[barbId][clientId]) {
          barbearias.push(barbId);
        }
      });

      const barbeariasRef = ref(database, 'barbearias/');
      onValue(barbeariasRef, (snap2) => {
        const info = snap2.val() || {};
        const filtradas = barbearias.map((id) => ({
          id,
          nomeBarbearia: info[id]?.nomeBarbearia || 'Barbearia',
          fotoUrl: info[id]?.fotoUrl || null,
        }));
        setBarbeariasComChat(filtradas);
      });
    });

    return () => unsub();
  }, [clientId]);

  //  Ouvir mensagens
  useEffect(() => {
    if (!barbeariaSelecionada) return;
    const chatRef = ref(database, `chats/${barbeariaSelecionada.id}/${clientId}`);
    const unsub = onValue(chatRef, (snap) => {
      const data = snap.val() || {};
      const lista = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
      setMensagens(lista.reverse());
    });
    return () => unsub();
  }, [barbeariaSelecionada]);

  //  Enviar mensagem
  const enviarMensagem = async () => {
    if (!texto.trim() || !barbeariaSelecionada) return;
    const chatRef = ref(database, `chats/${barbeariaSelecionada.id}/${clientId}`);
    const msg = { texto, autor: 'Cliente', timestamp: Date.now() };
    await push(chatRef, msg);
    setTexto('');
  };

  //  Formatador de hora
  const formatarHora = (timestamp) => {
    if (!timestamp) return '';
    const data = new Date(timestamp);
    const h = data.getHours().toString().padStart(2, '0');
    const m = data.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  // ==================== LISTA DE CONVERSAS ====================
  if (!barbeariaSelecionada) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack?.()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minhas Conversas</Text>
          <View style={{ width: 40 }} />
        </View>

        {barbeariasComChat.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Você ainda não conversou com nenhuma barbearia.</Text>
          </View>
        ) : (
          <FlatList
            data={barbeariasComChat}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cardCliente}
                activeOpacity={0.8}
                onPress={() => setBarbeariaSelecionada(item)}
              >
                {item.fotoUrl ? (
                  <Image source={{ uri: item.fotoUrl }} style={styles.avatar} />
                ) : (
                  <Ionicons name="cut-outline" size={50} color="#555" />
                )}
                <View style={styles.infoCliente}>
                  <Text style={styles.nomeCliente}>{item.nomeBarbearia}</Text>
                  <Text style={styles.ultimaMensagem}>Toque para abrir o chat</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  // ==================== CHAT INDIVIDUAL ====================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
      <View style={styles.headerChat}>
        <TouchableOpacity onPress={() => setBarbeariaSelecionada(null)}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.chatTitle}>{barbeariaSelecionada.nomeBarbearia}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={mensagens}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.balao,
                item.autor === 'Cliente' ? styles.balaoRight : styles.balaoLeft,
              ]}
            >
              <Text
                style={[
                  styles.texto,
                  item.autor === 'Cliente' && { color: '#fff' },
                ]}
              >
                {item.texto}
              </Text>
              <Text
                style={[
                  styles.hora,
                  item.autor === 'Cliente' ? styles.horaRight : styles.horaLeft,
                ]}
              >
                {formatarHora(item.timestamp)}
              </Text>
            </View>
          )}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mensagem..."
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={enviarMensagem}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.botaoEnviar} onPress={enviarMensagem}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f7f7' },

  // HEADER PRINCIPAL
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 3,
  },
  voltarBtn: { paddingRight: 10 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },

  // LISTA DE BARBEARIAS
  cardCliente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  infoCliente: { marginLeft: 12, flex: 1 },
  nomeCliente: { fontSize: 17, fontWeight: '700', color: '#111' },
  ultimaMensagem: { color: '#666', marginTop: 3, fontSize: 14 },

  // CHAT
  headerChat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  balao: {
    padding: 10,
    borderRadius: 16,
    marginVertical: 5,
    maxWidth: '75%',
  },
  balaoLeft: { backgroundColor: '#e9e9e9', alignSelf: 'flex-start' },
  balaoRight: { backgroundColor: '#1E1E1E', alignSelf: 'flex-end' },
  texto: { fontSize: 16, color: '#222' },
  hora: { fontSize: 11, marginTop: 4, opacity: 0.6 },
  horaLeft: { color: '#555', alignSelf: 'flex-end' },
  horaRight: { color: '#ccc', alignSelf: 'flex-end' },

  // INPUT
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  botaoEnviar: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 50,
    marginLeft: 5,
    alignItems: 'center',
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#444', fontWeight: '600' },
});
