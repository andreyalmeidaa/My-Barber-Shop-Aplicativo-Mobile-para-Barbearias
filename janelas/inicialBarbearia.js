import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { ref, onValue, set, get } from 'firebase/database';
import * as Notifications from 'expo-notifications';
import { database } from '../servicos/firebaseConfig';

// Configurações de comportamento de notificações (importante para iOS)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function InicialBarbearia({ route, navigation }) {
  const userId = route?.params?.userId;
  const [barbearia, setBarbearia] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [aberta, setAberta] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientesAtendidos, setClientesAtendidos] = useState(0);
  const [novasMensagens, setNovasMensagens] = useState({});
  const alertaMostrado = useRef(false);


  useEffect(() => {
    const barbeariaRef = ref(database, `barbearias/${userId}`);
    const unsub = onValue(barbeariaRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setBarbearia(data);
        setAberta(data.aberta || false);
      } else {
        Alert.alert('Ops!', 'Você precisa cadastrar sua barbearia primeiro.');
        navigation.replace('CadastroBarbearia', { userId });
      }
      setCarregando(false);
    });
    return () => unsub();
  }, []);


  const toggleAberta = async () => {
    try {
      const novoStatus = !aberta;
      setAberta(novoStatus);
      await set(ref(database, `barbearias/${userId}/aberta`), novoStatus);
    } catch (error) {
      Alert.alert('Erro ao alterar status da barbearia.');
      console.log(error);
    }
  };

  useEffect(() => {
    const agRef = ref(database, `agendamentos/${userId}`);
    const unsub = onValue(agRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val());
        setAgendamentos(data);
        const finalizados = data.filter((a) => a.status === 'finalizado').length;
        setClientesAtendidos(finalizados);
      } else {
        setAgendamentos([]);
        setClientesAtendidos(0);
      }
    });
    return () => unsub();
  }, []);


  useEffect(() => {
    const chatsRef = ref(database, `chats/${userId}`);
    const unsub = onValue(chatsRef, async (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();
      const novos = { ...novasMensagens };
      let houveNova = false;
      let clienteComNovaMsg = null;

      for (const clienteId in data) {
        const mensagens = Object.values(data[clienteId]);
        if (mensagens.length > 0) {
          const ultima = mensagens[mensagens.length - 1];
          if (ultima.autor === 'Cliente' && !novos[clienteId]) {
            novos[clienteId] = true;
            houveNova = true;
            clienteComNovaMsg = clienteId;
          }
        }
      }

      if (houveNova && !alertaMostrado.current) {
        setNovasMensagens(novos);
        alertaMostrado.current = true;
        try {
          const nomeSnap = await get(ref(database, `usuarios/${clienteComNovaMsg}/nome`));
          const nomeCliente = nomeSnap.exists() ? nomeSnap.val() : 'Cliente';

          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '💬 Nova mensagem!',
              body: `${nomeCliente} enviou uma mensagem.`,
              sound: true,
            },
            trigger: null,
          });
        } catch (e) {
          console.log('Erro ao notificar:', e);
        }
        setTimeout(() => (alertaMostrado.current = false), 8000);
      }
    });

    return () => unsub();
  }, []);

  const agendamentosAtivos = agendamentos.filter(
    (a) => a.status === 'pendente' || a.status === 'aceito'
  ).length;

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Carregando informações...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{barbearia?.nomeBarbearia || 'Minha Barbearia'}</Text>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: aberta ? '#2ecc71' : '#e74c3c' }]}>
              {aberta ? 'ABERTA' : 'FECHADA'}
            </Text>
            <Switch
              value={aberta}
              onValueChange={toggleAberta}
              trackColor={{ false: '#ccc', true: '#111' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* INFOS */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoNumber}>{agendamentosAtivos}</Text>
            <Text style={styles.infoLabel}>Agendamentos Ativos</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoNumber}>{clientesAtendidos}</Text>
            <Text style={styles.infoLabel}>Clientes Atendidos</Text>
          </View>
        </View>

        {/* AÇÕES */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TelaAgendamentos', { userId })}
          >
            <Text style={styles.actionText}>📅 Ver Agendamentos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setNovasMensagens({});
              navigation.navigate('TelaMensagens', { userId });
            }}
          >
            <Text style={styles.actionText}>
              💬 Ver Mensagens
              {Object.keys(novasMensagens).length > 0 && <Text style={styles.badge}> 🔴</Text>}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TelaConfiguracoes', { userId })}
          >
            <Text style={styles.actionText}>⚙️ Configurações</Text>
          </TouchableOpacity>
        </View>

        {/* DADOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Barbearia</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.text}>{barbearia?.endereco}</Text>

            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.text}>{barbearia?.telefone}</Text>

            <Text style={styles.label}>Serviços:</Text>
            <Text style={styles.text}>{barbearia?.servicos}</Text>

            <Text style={styles.label}>Formas de Pagamento:</Text>
            <Text style={styles.text}>{barbearia?.formasPagamento}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ====== ESTILOS ======
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },
  container: { flex: 1, backgroundColor: '#F4F4F4', paddingHorizontal: 20, paddingTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#111', flex: 1 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontWeight: '700', fontSize: 15, marginRight: 8 },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFF',
    marginHorizontal: 5,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoNumber: { fontSize: 22, fontWeight: '800', color: '#111' },
  infoLabel: { color: '#555', fontWeight: '600', marginTop: 4 },
  section: { marginTop: 25, marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { fontWeight: '700', fontSize: 15, marginTop: 10 },
  text: { fontSize: 15, color: '#333', marginTop: 2 },
  actionContainer: { marginBottom: 20 },
  actionButton: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionText: { fontSize: 16, fontWeight: '700', color: '#111' },
  badge: { fontSize: 14 },
});
