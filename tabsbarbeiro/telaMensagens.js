import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { database } from '../servicos/firebaseConfig';
import { ref, onValue, push, get, update } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

export default function TelaMensagens({ route, navigation }) {
  const { userId } = route.params;
  const [clientes, setClientes] = useState([]);
  const [chatAtual, setChatAtual] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [mensagemAtual, setMensagemAtual] = useState('');
  const [carregando, setCarregando] = useState(true);

  //  Carrega lista de clientes com chat
  useEffect(() => {
    const chatsRef = ref(database, `chats/${userId}`);
    onValue(chatsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const lista = [];

        for (const clienteId in data) {
          const mensagensCliente = Object.values(data[clienteId]);
          const ultimaMensagem = mensagensCliente[mensagensCliente.length - 1];

          let nomeCliente = clienteId;
          try {
            const snapUser = await get(ref(database, `usuarios/${clienteId}/nome`));
            if (snapUser.exists()) nomeCliente = snapUser.val();
          } catch (e) {}

          const temNovaMsg = ultimaMensagem?.autor === 'Cliente' && !ultimaMensagem?.lido;

          lista.push({
            id: clienteId,
            nome: nomeCliente,
            ultimaMensagem: ultimaMensagem?.texto || '',
            novaMensagem: temNovaMsg,
          });
        }

        lista.sort((a, b) => (a.novaMensagem === b.novaMensagem ? 0 : a.novaMensagem ? -1 : 1));
        setClientes(lista);
      } else {
        setClientes([]);
      }
      setCarregando(false);
    });
  }, []);

  //  Escuta mensagens do cliente selecionado e marca como lidas em tempo real
  useEffect(() => {
    if (!chatAtual) return;
    const chatRef = ref(database, `chats/${userId}/${chatAtual.id}`);

    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (!snapshot.exists()) {
        setMensagens([]);
        return;
      }

      const data = snapshot.val();
      const listaMensagens = Object.entries(data).map(([id, msg]) => ({ id, ...msg })).reverse();
      setMensagens(listaMensagens);

      //  Marca todas mensagens do cliente como lidas assim que chegam
      const updates = {};
      Object.entries(data).forEach(([key, msg]) => {
        if (msg.autor === 'Cliente' && !msg.lido) {
          updates[`chats/${userId}/${chatAtual.id}/${key}/lido`] = true;
        }
      });

      if (Object.keys(updates).length > 0) {
        update(ref(database), updates).catch((err) => console.log('Erro ao marcar lidas:', err));
      }
    });

    return () => unsubscribe();
  }, [chatAtual]);

  //  Enviar mensagem
  const enviarMensagem = async () => {
    if (!mensagemAtual.trim() || !chatAtual) return;
    const chatRef = ref(database, `chats/${userId}/${chatAtual.id}`);
    await push(chatRef, {
      texto: mensagemAtual,
      autor: 'Barbearia',
      timestamp: Date.now(),
      lido: true,
    });
    setMensagemAtual('');
  };

  //  Função auxiliar para formatar hora
  const formatarHora = (timestamp) => {
    const data = new Date(timestamp);
    const h = data.getHours().toString().padStart(2, '0');
    const m = data.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  // ==================== LISTA DE CLIENTES ====================
  if (!chatAtual) {
    if (carregando) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>Carregando mensagens...</Text>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mensagens</Text>
          <View style={{ width: 40 }} />
        </View>

        {clientes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum cliente enviou mensagem ainda.</Text>
          </View>
        ) : (
          <FlatList
            data={clientes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cardCliente}
                activeOpacity={0.8}
                onPress={() => {
                  setChatAtual(item);
                  const novaLista = clientes.map((c) =>
                    c.id === item.id ? { ...c, novaMensagem: false } : c
                  );
                  setClientes(novaLista);
                }}
              >
                <Ionicons name="person-circle-outline" size={50} color="#555" />
                <View style={styles.infoCliente}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.nomeCliente}>{item.nome}</Text>
                    {item.novaMensagem && <View style={styles.badgeDot} />}
                  </View>
                  <Text style={styles.ultimaMensagem} numberOfLines={1}>
                    {item.ultimaMensagem || '⠀'}
                  </Text>
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
        <TouchableOpacity onPress={() => setChatAtual(null)}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.chatTitle}>{chatAtual.nome}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={mensagens}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.balao,
                item.autor === 'Barbearia' ? styles.balaoRight : styles.balaoLeft,
              ]}
            >
              <Text
                style={[
                  styles.texto,
                  item.autor === 'Barbearia' && { color: '#fff' },
                ]}
              >
                {item.texto}
              </Text>
              <Text
                style={[
                  styles.hora,
                  item.autor === 'Barbearia' ? styles.horaRight : styles.horaLeft,
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
            value={mensagemAtual}
            onChangeText={setMensagemAtual}
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#111' },

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
  infoCliente: { marginLeft: 12, flex: 1 },
  nomeCliente: { fontSize: 17, fontWeight: '700', color: '#111' },
  ultimaMensagem: { color: '#666', marginTop: 3, fontSize: 14 },
  badgeDot: {
    width: 10,
    height: 10,
    backgroundColor: '#ff2d55',
    borderRadius: 5,
    marginLeft: 6,
  },

  headerChat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111' },

  balao: { padding: 10, borderRadius: 16, marginVertical: 5, maxWidth: '75%' },
  balaoLeft: { backgroundColor: '#e9e9e9', alignSelf: 'flex-start' },
  balaoRight: { backgroundColor: '#1E1E1E', alignSelf: 'flex-end' },
  texto: { fontSize: 16, color: '#222' },
  hora: { fontSize: 11, marginTop: 4, opacity: 0.6 },
  horaLeft: { color: '#555', alignSelf: 'flex-end' },
  horaRight: { color: '#ccc', alignSelf: 'flex-end' },

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
