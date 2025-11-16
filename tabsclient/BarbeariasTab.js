import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ref, onValue } from "firebase/database";
import { database } from "../servicos/firebaseConfig";

const { width } = Dimensions.get("window");

export default function BarbeariasTab({ navigation, route }) {
  const userId = route?.params?.userId || null;
  const [barbearias, setBarbearias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const barbeariasRef = ref(database, "barbearias/");
    const unsub = onValue(barbeariasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setBarbearias(lista);
      } else {
        setBarbearias([]);
      }
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  const filtradas = barbearias.filter((b) => {
    const termo = busca.toLowerCase();
    return (
      b.nomeBarbearia?.toLowerCase().includes(termo) ||
      b.endereco?.toLowerCase().includes(termo) ||
      b.descricao?.toLowerCase().includes(termo)
    );
  });

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={{ marginTop: 10, color: "#333" }}>Carregando barbearias...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/*  Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Barbearias</Text>
        <Text style={styles.headerSubtitle}>As melhores perto de você ✂️</Text>
      </View>

      {/*  Barra de busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#777" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Buscar barbearia..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/*  Lista de barbearias */}
      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() =>
              navigation.navigate("DetalhesBarbearia", {
                barbearia: item,
                clientId: userId,
              })
            }
          >
            {/* Imagem */}
            {item.fotoUrl ? (
              <Image
                source={{ uri: item.fotoUrl }}
                style={styles.foto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.semFoto}>
                <Ionicons name="cut-outline" size={width * 0.12} color="#bbb" />
              </View>
            )}

            {/* Informações */}
            <View style={styles.info}>
              <Text style={styles.nome} numberOfLines={1}>
                {item.nomeBarbearia}
              </Text>

              <View style={styles.row}>
                <Ionicons name="location-outline" size={14} color="#888" />
                <Text numberOfLines={1} style={styles.endereco}>
                  {item.endereco || "Endereço não informado"}
                </Text>
              </View>

              {item.descricao && (
                <Text numberOfLines={2} style={styles.descricao}>
                  {item.descricao}
                </Text>
              )}

              {/* Rodapé */}
              <View style={styles.footer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: item.aberta ? "#2ecc71" : "#e74c3c" },
                  ]}
                >
                  <Ionicons
                    name={item.aberta ? "checkmark-circle" : "close-circle"}
                    size={14}
                    color="#fff"
                  />
                  <Text style={styles.statusTexto}>
                    {item.aberta ? "Aberta" : "Fechada"}
                  </Text>
                </View>

                {item.avaliacao ? (
                  <View style={styles.rating}>
                    <Ionicons name="star" size={14} color="#f1c40f" />
                    <Text style={styles.ratingText}>
                      {item.avaliacao.toFixed(1)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="search" size={50} color="#bbb" />
            <Text style={{ marginTop: 10, color: "#777" }}>
              Nenhuma barbearia encontrada
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

//  Estilos 100% responsivos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === "ios" ? 20 : 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: width * 0.07,
    fontWeight: "900",
    color: "#111",
  },
  headerSubtitle: {
    fontSize: width * 0.035,
    color: "#777",
    marginTop: 2,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: width * 0.05,
    marginTop: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    height: width * 0.12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: width * 0.04,
    color: "#333",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginHorizontal: width * 0.05,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: "hidden",
  },
  foto: {
    width: "100%",
    height: width * 0.45,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  semFoto: {
    width: "100%",
    height: width * 0.45,
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { padding: width * 0.04 },
  nome: {
    fontSize: width * 0.045,
    fontWeight: "800",
    color: "#111",
    marginBottom: 4,
  },
  row: { flexDirection: "row", alignItems: "center" },
  endereco: {
    color: "#666",
    fontSize: width * 0.035,
    marginLeft: 4,
    flexShrink: 1,
  },
  descricao: {
    color: "#777",
    fontSize: width * 0.034,
    lineHeight: width * 0.045,
    marginTop: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusTexto: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: width * 0.03,
  },
  rating: { flexDirection: "row", alignItems: "center" },
  ratingText: {
    marginLeft: 4,
    fontSize: width * 0.035,
    fontWeight: "600",
    color: "#111",
  },
});
