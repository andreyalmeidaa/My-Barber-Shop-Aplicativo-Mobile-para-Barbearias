import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import { database } from "../servicos/firebaseConfig";
import { ref, onValue, get } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function AgendamentosTab({ route }) {
  const clientId = route?.params?.userId;
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const agendamentosRef = ref(database, "agendamentos/");
    const unsub = onValue(agendamentosRef, async (snapshot) => {
      const data = snapshot.val() || {};
      const lista = [];

      for (const barbId of Object.keys(data)) {
        const barbAgs = data[barbId];
        if (!barbAgs) continue;

        const nomeSnap = await get(ref(database, `barbearias/${barbId}/nomeBarbearia`));
        const nomeBarbearia = nomeSnap.exists()
          ? nomeSnap.val()
          : "Barbearia desconhecida";

        Object.keys(barbAgs).forEach((agId) => {
          const ag = barbAgs[agId];
          if (ag.clienteId === clientId) {
            lista.push({
              ...ag,
              id: agId,
              barbeariaId: barbId,
              nomeBarbearia,
            });
          }
        });
      }

      // Mantém todos (inclusive cancelados)
      lista.sort((a, b) => b.criadoEm - a.criadoEm);
      setAgendamentos(lista);
      setCarregando(false);
    });

    return () => unsub();
  }, [clientId]);

  const getStatusColor = (status) => {
    if (!status) return "#999";
    const lower = status.toLowerCase();
    if (lower.includes("pendente")) return "#f1c40f";
    if (lower.includes("confirmado")) return "#27ae60";
    if (lower.includes("finalizado")) return "#2980b9";
    if (lower.includes("cancelado")) return "#c0392b";
    return "#888";
  };

  if (carregando) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Carregando agendamentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 20 : 80}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Agendamentos</Text>
          <Text style={styles.headerSubtitle}>Acompanhe seu histórico completo</Text>
        </View>

        <View style={styles.container}>
          {agendamentos.length === 0 ? (
            <View style={styles.semAgendamentosBox}>
              <Ionicons name="calendar-outline" size={60} color="#aaa" />
              <Text style={styles.semAgendamentosTitulo}>
                Nenhum agendamento encontrado
              </Text>
              <Text style={styles.semAgendamentosTexto}>
                Quando você fizer um agendamento, ele aparecerá aqui.
              </Text>
            </View>
          ) : (
            <FlatList
              data={agendamentos}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={[styles.card, { borderLeftColor: getStatusColor(item.status) }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeBarbearia}>{item.nomeBarbearia}</Text>

                    <View style={styles.row}>
                      <Ionicons name="calendar-outline" size={15} color="#888" />
                      <Text style={styles.data}>
                        {item.data} às {item.hora}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Ionicons name="cut-outline" size={15} color="#888" />
                      <Text style={styles.servico}>
                        {item.servico || "Serviço não informado"}
                      </Text>
                    </View>

                    <View style={[styles.row, { marginTop: 6 }]}>
                      <Ionicons name="information-circle-outline" size={15} color="#888" />
                      <Text
                        style={[
                          styles.status,
                          { color: getStatusColor(item.status) },
                        ]}
                      >
                        {item.status
                          ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                          : "Pendente"}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  nomeBarbearia: {
    fontWeight: "800",
    fontSize: 16,
    color: "#111",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  data: {
    fontSize: 14,
    color: "#333",
    marginLeft: 6,
  },
  servico: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  semAgendamentosBox: {
    alignItems: "center",
    marginTop: 80,
  },
  semAgendamentosTitulo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginTop: 10,
  },
  semAgendamentosTexto: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    marginHorizontal: 40,
    marginTop: 6,
  },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
