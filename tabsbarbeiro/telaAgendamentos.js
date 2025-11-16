import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { database } from '../servicos/firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

export default function TelaAgendamentos({ route, navigation }) {
  const { userId } = route.params;
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const refAg = ref(database, `agendamentos/${userId}`);
    onValue(refAg, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.entries(snapshot.val()).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setAgendamentos(data.reverse());
      } else {
        setAgendamentos([]);
      }
      setCarregando(false);
    });
  }, []);

  const atualizarStatus = async (id, status) => {
    try {
      await update(ref(database, `agendamentos/${userId}/${id}`), { status });
      Alert.alert('Sucesso', `Agendamento ${status}!`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
      console.log(error);
    }
  };

  // 🔹 Filtragem por status
  const agendamentosFiltrados = agendamentos.filter((item) => {
    if (filtro === 'todos') return true;
    if (filtro === 'pendente') return !item.status || item.status === 'pendente';
    return item.status === filtro;
  });

  if (carregando)
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Carregando agendamentos...</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      {/* HEADER CORRIGIDO */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.voltarBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
          <Text style={styles.voltarTexto}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>📅 Meus Agendamentos</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* FILTROS */}
      <View style={styles.filtrosContainer}>
        {[
          { label: 'Todos', value: 'todos' },
          { label: 'Pendentes', value: 'pendente' },
          { label: 'Aceitos', value: 'aceito' },
          { label: 'Finalizados', value: 'finalizado' },
          { label: 'Cancelados', value: 'cancelado' },
        ].map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.filtroBotao,
              filtro === item.value && styles.filtroAtivo,
            ]}
            onPress={() => setFiltro(item.value)}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtro === item.value && styles.filtroTextoAtivo,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTA DE AGENDAMENTOS */}
      {agendamentosFiltrados.length === 0 ? (
        <Text style={styles.msgVazio}>Nenhum agendamento encontrado.</Text>
      ) : (
        <FlatList
          data={agendamentosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle-outline" size={36} color="#111" />
                <Text style={styles.nomeCliente}>{item.clienteNome || 'Cliente'}</Text>
              </View>

              <View style={styles.infoLinha}>
                <Ionicons name="calendar-outline" size={18} color="#555" />
                <Text style={styles.text}> {item.data}</Text>
              </View>

              <View style={styles.infoLinha}>
                <Ionicons name="time-outline" size={18} color="#555" />
                <Text style={styles.text}> {item.hora}</Text>
              </View>

              <View style={styles.infoLinha}>
                <Ionicons name="cash-outline" size={18} color="#555" />
                <Text style={styles.text}> {item.pagamento}</Text>
              </View>

              {item.servico && (
                <View style={styles.infoLinha}>
                  <Ionicons name="cut-outline" size={18} color="#555" />
                  <Text style={styles.text}> {item.servico}</Text>
                </View>
              )}

              {/* STATUS */}
              <View style={styles.statusContainer}>
                <Text
                  style={[
                    styles.status,
                    item.status === 'aceito'
                      ? { color: '#27ae60' }
                      : item.status === 'finalizado'
                      ? { color: '#2980b9' }
                      : item.status === 'cancelado'
                      ? { color: '#e74c3c' }
                      : { color: '#f39c12' },
                  ]}
                >
                  {item.status ? item.status.toUpperCase() : 'PENDENTE'}
                </Text>
              </View>

              {/* BOTÕES DE AÇÃO */}
              <View style={styles.botoesContainer}>
                {(!item.status || item.status === 'pendente') && (
                  <>
                    <TouchableOpacity
                      style={[styles.botao, { backgroundColor: '#27ae60' }]}
                      onPress={() => atualizarStatus(item.id, 'aceito')}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                      <Text style={styles.botaoTexto}>Aceitar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.botao, { backgroundColor: '#e74c3c' }]}
                      onPress={() => atualizarStatus(item.id, 'cancelado')}
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#fff" />
                      <Text style={styles.botaoTexto}>Cancelar</Text>
                    </TouchableOpacity>
                  </>
                )}

                {item.status === 'aceito' && (
                  <TouchableOpacity
                    style={[styles.botao, { backgroundColor: '#2980b9' }]}
                    onPress={() => atualizarStatus(item.id, 'finalizado')}
                  >
                    <Ionicons name="cut-outline" size={18} color="#fff" />
                    <Text style={styles.botaoTexto}>Finalizar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

// ====== ESTILOS ======
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f7f7f7',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // 🔹 Garante que o botão não suba
  },
  titulo: { fontSize: 18, fontWeight: '800', color: '#111' },
  voltarBtn: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  voltarTexto: { marginLeft: 6, fontSize: 16, color: '#222', fontWeight: '600' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  msgVazio: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 50 },
  list: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  nomeCliente: { fontSize: 17, fontWeight: '700', marginLeft: 8, color: '#111' },
  infoLinha: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  text: { fontSize: 15, color: '#333' },
  statusContainer: { marginTop: 10 },
  status: { fontWeight: '700', fontSize: 15 },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 5,
  },
  filtrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
    paddingVertical: 10,
  },
  filtroBotao: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filtroAtivo: { backgroundColor: '#111', borderColor: '#111' },
  filtroTexto: { color: '#333', fontWeight: '600' },
  filtroTextoAtivo: { color: '#fff' },
});
