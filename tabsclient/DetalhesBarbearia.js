import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ref, push, onValue, get } from "firebase/database";
import { database } from "../servicos/firebaseConfig";

export default function DetalhesBarbearia({ route, navigation }) {
  const { barbearia, clientId } = route.params;
  const [tela, setTela] = useState("detalhes");
  const [mensagens, setMensagens] = useState([]);
  const [mensagemAtual, setMensagemAtual] = useState("");
  const [diaSelecionado, setDiaSelecionado] = useState("");
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState("");
  const [carregando, setCarregando] = useState(false);
  const flatListRef = useRef(null);

  const { width } = Dimensions.get("window");

  //  Ouvir mensagens
  useEffect(() => {
    if (!barbearia?.id || !clientId) return;
    const chatRef = ref(database, `chats/${barbearia.id}/${clientId}`);
    const unsub = onValue(chatRef, (snap) => {
      const data = snap.val() || {};
      const lista = Object.keys(data)
        .map((key) => ({ id: key, ...data[key] }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setMensagens(lista);
    });
    return () => unsub();
  }, [barbearia, clientId]);

  // 🔹 Enviar mensagem
  const enviarMensagem = async () => {
    if (!mensagemAtual.trim()) return;
    const chatRef = ref(database, `chats/${barbearia.id}/${clientId}`);
    const novaMensagem = {
      texto: mensagemAtual,
      autor: "Cliente",
      timestamp: Date.now(),
    };
    await push(chatRef, novaMensagem);
    setMensagemAtual("");
  };

  // 🔹 Gerar horários
  const gerarHorarios = () => {
    const horarios = [];
    for (let h = 9; h <= 17; h++) {
      horarios.push(`${h.toString().padStart(2, "0")}:00`);
      horarios.push(`${h.toString().padStart(2, "0")}:30`);
    }
    horarios.push("18:00");
    return horarios;
  };

  // 🔹 Confirmar agendamento
  const confirmarAgendamento = async () => {
    if (!diaSelecionado || !horaSelecionada || !pagamentoSelecionado) {
      Alert.alert("Atenção", "Selecione dia, hora e forma de pagamento.");
      return;
    }
    try {
      setCarregando(true);
      let nomeCliente = "Cliente";
      const snap = await get(ref(database, `usuarios/${clientId}/nome`));
      if (snap.exists()) nomeCliente = snap.val();

      const novoAgendamento = {
        clienteId: clientId,
        clienteNome: nomeCliente,
        data: diaSelecionado,
        hora: horaSelecionada,
        pagamento: pagamentoSelecionado,
        status: "pendente",
        criadoEm: Date.now(),
      };

      await push(ref(database, `agendamentos/${barbearia.id}`), novoAgendamento);
      Alert.alert("✅ Sucesso", `Agendado para ${diaSelecionado} às ${horaSelecionada}.`);
      setDiaSelecionado("");
      setHoraSelecionada("");
      setPagamentoSelecionado("");
      setTela("detalhes");
    } catch (e) {
      console.log(e);
      Alert.alert("Erro", "Não foi possível confirmar o agendamento.");
    } finally {
      setCarregando(false);
    }
  };

  // ==========================
  //  TELA DE DETALHES
  // ==========================
  if (tela === "detalhes") {
    let listaServicos = [];
    const serv = barbearia?.servicos;
    if (typeof serv === "string") {
      listaServicos = serv.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (Array.isArray(serv)) {
      listaServicos = serv.map((s) => String(s).trim()).filter(Boolean);
    } else if (serv && typeof serv === "object") {
      listaServicos = Object.values(serv).map((s) => String(s).trim()).filter(Boolean);
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerImageWrapper}>
          {barbearia.fotoUrl && (
            <Image source={{ uri: barbearia.fotoUrl }} style={styles.fotoGrande} />
          )}
          <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.overlay} />
        </View>

        <View style={styles.card}>
          <Text style={styles.nome}>{barbearia.nomeBarbearia}</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color="#777" />
            <Text style={styles.endereco}>{barbearia.endereco}</Text>
          </View>

          {barbearia.descricao && (
            <Text style={styles.descricao}>{barbearia.descricao}</Text>
          )}

          <View style={styles.servicosContainer}>
            <Text style={styles.servicosTitulo}>💈 Serviços Disponíveis</Text>
            {listaServicos.length > 0 ? (
              listaServicos.map((servico, index) => (
                <View key={index} style={styles.servicoItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#111" />
                  <Text style={styles.servicoTexto}>{servico}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#777" }}>Nenhum serviço cadastrado.</Text>
            )}
          </View>

          {barbearia.formasPagamento && (
            <Text style={styles.pagamento}>💳 Aceita: {barbearia.formasPagamento}</Text>
          )}
        </View>

        <View style={styles.botoes}>
          <TouchableOpacity
            style={[styles.botaoPrimario, { backgroundColor: "#111" }]}
            onPress={() => setTela("agendar")}
          >
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.botaoTxt}>Agendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoPrimario, { backgroundColor: "#E0B84B" }]}
            onPress={() => setTela("chat")}
          >
            <Ionicons name="chatbubbles" size={20} color="#111" />
            <Text style={[styles.botaoTxt, { color: "#111" }]}>Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ==========================
  //  TELA DE AGENDAMENTO
  // ==========================
  if (tela === "agendar") {
    const formasPagamento = Array.isArray(barbearia.formasPagamento)
      ? barbearia.formasPagamento
      : (barbearia.formasPagamento || "").split(",").map((p) => p.trim());

    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerAgendar}>
          <TouchableOpacity onPress={() => setTela("detalhes")}>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>Agendar Horário</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitulo}>Selecione o Dia:</Text>
          <View style={styles.chipsContainer}>
            {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((dia) => (
              <TouchableOpacity
                key={dia}
                style={[styles.chip, dia === diaSelecionado && styles.chipSelecionado]}
                onPress={() => setDiaSelecionado(dia)}
              >
                <Text style={dia === diaSelecionado ? styles.chipTextSel : styles.chipText}>
                  {dia}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {diaSelecionado && (
            <>
              <Text style={styles.subtitulo}>Selecione a Hora:</Text>
              <View style={styles.chipsContainer}>
                {gerarHorarios().map((hora) => (
                  <TouchableOpacity
                    key={hora}
                    style={[styles.chip, hora === horaSelecionada && styles.chipSelecionado]}
                    onPress={() => setHoraSelecionada(hora)}
                  >
                    <Text style={hora === horaSelecionada ? styles.chipTextSel : styles.chipText}>
                      {hora}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.subtitulo}>Forma de Pagamento:</Text>
          <View style={styles.chipsContainer}>
            {formasPagamento.map((fp) => (
              <TouchableOpacity
                key={fp}
                style={[styles.chip, fp === pagamentoSelecionado && styles.chipSelecionado]}
                onPress={() => setPagamentoSelecionado(fp)}
              >
                <Text style={fp === pagamentoSelecionado ? styles.chipTextSel : styles.chipText}>
                  {fp}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={confirmarAgendamento} style={styles.botaoConfirmar}>
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>Confirmar Agendamento</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ==========================
  //  TELA DE CHAT (NOVO)
  // ==========================
  if (tela === "chat") {
    const formatarHora = (timestamp) => {
      if (!timestamp) return "";
      const data = new Date(timestamp);
      const h = data.getHours().toString().padStart(2, "0");
      const m = data.getMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
        <View style={styles.headerChat}>
          <TouchableOpacity onPress={() => setTela("detalhes")}>
            <Ionicons name="arrow-back" size={26} color="#222" />
          </TouchableOpacity>
          <Text style={styles.chatTitle}>{barbearia.nomeBarbearia}</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                  item.autor === "Cliente" ? styles.balaoRight : styles.balaoLeft,
                ]}
              >
                <Text
                  style={[
                    styles.texto,
                    item.autor === "Cliente" && { color: "#fff" },
                  ]}
                >
                  {item.texto}
                </Text>
                <Text
                  style={[
                    styles.hora,
                    item.autor === "Cliente" ? styles.horaRight : styles.horaLeft,
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
}

// ====================== STYLES ======================
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  headerImageWrapper: { position: "relative", width: "100%", height: width * 0.6 },
  fotoGrande: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  voltarBtn: {
    position: "absolute",
    top: 45,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    padding: 8,
    zIndex: 2,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -25,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
  nome: { fontSize: width * 0.06, fontWeight: "900", color: "#111" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  endereco: { fontSize: width * 0.04, color: "#555", marginLeft: 5 },
  descricao: { color: "#666", marginTop: 8, fontSize: width * 0.04, lineHeight: 20 },
  pagamento: { color: "#222", marginTop: 10, fontWeight: "600" },
  servicosContainer: { marginTop: 15, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 },
  servicosTitulo: { fontSize: width * 0.045, fontWeight: "700", marginBottom: 8, color: "#111" },
  servicoItem: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  servicoTexto: { fontSize: width * 0.04, color: "#333", marginLeft: 8 },
  botoes: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 25,
    marginHorizontal: 16,
  },
  botaoPrimario: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    marginHorizontal: 6,
    elevation: 3,
  },
  botaoTxt: { color: "#fff", fontWeight: "700", marginLeft: 8, fontSize: width * 0.04 },
  headerAgendar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerTitulo: { fontSize: width * 0.045, fontWeight: "900", color: "#111" },
  subtitulo: { fontSize: width * 0.045, fontWeight: "700", marginTop: 15, marginBottom: 10, color: "#111" },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  chip: {
    borderWidth: 1,
    borderColor: "#AAA",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 5,
    backgroundColor: "#FFF",
  },
  chipSelecionado: { backgroundColor: "#111", borderColor: "#111" },
  chipText: { color: "#111", fontWeight: "500" },
  chipTextSel: { color: "#fff", fontWeight: "700" },
  botaoConfirmar: {
    backgroundColor: "#111",
    marginTop: 20,
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  botaoTexto: { color: "#fff", fontSize: width * 0.045, fontWeight: "700" },

  // CHAT NOVO
  safeArea: { flex: 1, backgroundColor: "#f7f7f7" },
  headerChat: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  chatTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  balao: {
    padding: 10,
    borderRadius: 16,
    marginVertical: 5,
    maxWidth: "75%",
  },
  balaoLeft: { backgroundColor: "#e9e9e9", alignSelf: "flex-start" },
  balaoRight: { backgroundColor: "#1E1E1E", alignSelf: "flex-end" },
  texto: { fontSize: 16, color: "#222" },
  hora: { fontSize: 11, marginTop: 4, opacity: 0.6 },
  horaLeft: { color: "#555", alignSelf: "flex-end" },
  horaRight: { color: "#ccc", alignSelf: "flex-end" },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
  },
  botaoEnviar: {
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 50,
    marginLeft: 5,
    alignItems: "center",
  },
});
