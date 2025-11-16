import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { database, storage } from "../servicos/firebaseConfig";
import { ref, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

export default function CadastroBarbearia({ route, navigation }) {
  const userId = route?.params?.userId || "";
  const barbeiroResponsavel = route?.params?.barbeiroResponsavel || "";

  const [pagina, setPagina] = useState(1);
  const [nomeBarbearia, setNomeBarbearia] = useState("");
  const [fotoUri, setFotoUri] = useState(null);
  const [endereco, setEndereco] = useState("");
  const [enderecosSugestao, setEnderecosSugestao] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [pagamentosSelecionados, setPagamentosSelecionados] = useState([]);
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  const [horarios, setHorarios] = useState({});

  const GOOGLE_API_KEY = "AIzaSyDyKVj0rWr44F9ZX9K_-9vo_plQDBrJ7Xo";
  const diasSemana = [
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
    "domingo",
  ];

  // Escolher foto
  const escolherFoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada para acessar as imagens!");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled) setFotoUri(result.assets[0].uri);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro ao escolher imagem");
    }
  };

  // Buscar endereço
  const buscarEndereco = async (text) => {
    setEndereco(text);
    if (text.length < 3) return setEnderecosSugestao([]);

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&key=${GOOGLE_API_KEY}&language=pt-BR&types=address`
      );
      const data = await res.json();
      setEnderecosSugestao(
        data?.predictions?.map((p) => ({
          description: p.description,
          id: p.place_id,
        })) || []
      );
    } catch (err) {
      console.log("Erro ao buscar endereços:", err);
    }
  };

  const selecionarEndereco = (item) => {
    setEndereco(item.description);
    setEnderecosSugestao([]);
  };

  const toggleDia = (dia) =>
    setDiasSelecionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );

  const formatarHorario = (texto) => {
    let v = texto.replace(/[^0-9]/g, "");
    if (v.length >= 3 && v.length <= 4) v = v.slice(0, 2) + ":" + v.slice(2);
    else if (v.length >= 5)
      v =
        v.slice(0, 2) +
        ":" +
        v.slice(2, 4) +
        " - " +
        v.slice(4, 6) +
        (v.length > 6 ? ":" + v.slice(6, 8) : "");
    return v.slice(0, 14);
  };

  const atualizarHorario = (dia, valor) =>
    setHorarios((prev) => ({ ...prev, [dia]: valor }));

  const salvarBarbearia = async () => {
    if (!nomeBarbearia || !endereco || !telefone) {
      Alert.alert("Preencha os campos obrigatórios: nome, endereço e telefone");
      return;
    }

    try {
      let fotoUrl = "";
      if (fotoUri) {
        const blob = await (await fetch(fotoUri)).blob();
        const storageReference = storageRef(storage, `fotosbarbearias/${userId}.jpg`);
        await uploadBytes(storageReference, blob);
        fotoUrl = await getDownloadURL(storageReference);
      }

      const diasFuncionamento = {};
      diasSelecionados.forEach(
        (dia) => (diasFuncionamento[dia] = horarios[dia] || "")
      );

      const dados = {
        nomeBarbearia,
        endereco,
        barbeiroResponsavel,
        diasFuncionamento,
        fotoUrl,
        descricao,
        telefone,
        instagram,
        servicos: servicosSelecionados,
        formasPagamento: pagamentosSelecionados,
      };

      await set(ref(database, `barbearias/${userId}`), dados);
      Alert.alert("✅ Barbearia cadastrada com sucesso!");
      navigation.navigate("TelaLogin");
    } catch (err) {
      console.log(err);
      Alert.alert("Erro ao salvar barbearia");
    }
  };

  // ============================ TELAS ============================
  const renderPagina = () => {
    const next = (n) => setPagina(n);
    const back = (n) => setPagina(n);

    const scrollProps = {
      keyboardShouldPersistTaps: "handled",
      showsVerticalScrollIndicator: false,
      contentContainerStyle: styles.scroll,
    };

    const toggleSelecionado = (lista, setLista, item) => {
      if (lista.includes(item)) setLista(lista.filter((i) => i !== item));
      else setLista([...lista, item]);
    };

    const listaServicos = [
      "Corte de Cabelo",
      "Corte + Barba",
      "Barba Tradicional",
      "Sobrancelha",
      "Pigmentação Capilar",
      "Relaxamento",
      "Corte Infantil",
      "Hidratação",
      "Corte Navalhado",
      "Platinado",
    ];

    const metodosPagamento = [
      "Dinheiro",
      "Pix",
      "Cartão de Crédito",
      "Cartão de Débito",
      "PicPay",
    ];

    switch (pagina) {
      case 1:
        return (
          <ScrollView {...scrollProps}>
            <Text style={styles.title}>Cadastro da Barbearia</Text>
            <TouchableOpacity style={styles.fotoBtn} onPress={escolherFoto}>
              <Text style={styles.fotoBtnText}>
                {fotoUri ? "Alterar Foto" : "Adicionar Foto"}
              </Text>
            </TouchableOpacity>
            {fotoUri && <Image source={{ uri: fotoUri }} style={styles.foto} />}
            <View style={styles.card}>
              <Text style={styles.label}>Nome da Barbearia</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o nome"
                value={nomeBarbearia}
                onChangeText={setNomeBarbearia}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={() => next(2)}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 2:
        return (
          <ScrollView {...scrollProps}>
            <Text style={styles.title}>Endereço</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                placeholder="Digite o endereço completo"
                value={endereco}
                onChangeText={buscarEndereco}
              />
              {enderecosSugestao.length > 0 && (
                <View style={styles.sugestoesContainer}>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {enderecosSugestao.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.sugestao}
                        onPress={() => selecionarEndereco(item)}
                      >
                        <Text>{item.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            <View style={styles.navButtons}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={() => back(1)}>
                <Text style={styles.buttonTextAlt}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => next(3)}>
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case 3:
        return (
          <ScrollView {...scrollProps}>
            <Text style={styles.title}>Detalhes e Contato</Text>
            <TextInput
              style={[styles.input, { height: 90 }]}
              multiline
              placeholder="Descrição"
              value={descricao}
              onChangeText={setDescricao}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone (XX) XXXXX-XXXX"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Instagram (opcional)"
              value={instagram}
              onChangeText={setInstagram}
            />
            <View style={styles.navButtons}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={() => back(2)}>
                <Text style={styles.buttonTextAlt}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => next(4)}>
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case 4:
        return (
          <ScrollView {...scrollProps}>
            <Text style={styles.title}>Serviços e Pagamento</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Serviços Oferecidos</Text>
              <View style={styles.tagContainer}>
                {listaServicos.map((servico) => (
                  <TouchableOpacity
                    key={servico}
                    style={[
                      styles.tag,
                      servicosSelecionados.includes(servico) && styles.tagSelecionado,
                    ]}
                    onPress={() =>
                      toggleSelecionado(
                        servicosSelecionados,
                        setServicosSelecionados,
                        servico
                      )
                    }
                  >
                    <Text
                      style={
                        servicosSelecionados.includes(servico)
                          ? styles.tagTextSelecionado
                          : styles.tagText
                      }
                    >
                      {servico}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Formas de Pagamento</Text>
              <View style={styles.tagContainer}>
                {metodosPagamento.map((pag) => (
                  <TouchableOpacity
                    key={pag}
                    style={[
                      styles.tag,
                      pagamentosSelecionados.includes(pag) && styles.tagSelecionado,
                    ]}
                    onPress={() =>
                      toggleSelecionado(
                        pagamentosSelecionados,
                        setPagamentosSelecionados,
                        pag
                      )
                    }
                  >
                    <Text
                      style={
                        pagamentosSelecionados.includes(pag)
                          ? styles.tagTextSelecionado
                          : styles.tagText
                      }
                    >
                      {pag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.navButtons}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={() => back(3)}>
                <Text style={styles.buttonTextAlt}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => next(5)}>
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case 5:
        return (
          <ScrollView {...scrollProps}>
            <Text style={styles.title}>Dias e Horários</Text>
            <View style={styles.diasContainer}>
              {diasSemana.map((dia) => (
                <TouchableOpacity
                  key={dia}
                  style={[
                    styles.diaBtn,
                    diasSelecionados.includes(dia) && styles.diaBtnSelecionado,
                  ]}
                  onPress={() => toggleDia(dia)}
                >
                  <Text
                    style={
                      diasSelecionados.includes(dia)
                        ? styles.diaTextSelecionado
                        : styles.diaText
                    }
                  >
                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {diasSelecionados.map((dia) => (
              <View key={dia} style={styles.card}>
                <Text style={styles.label}>
                  {dia.toUpperCase()} (HH:MM - HH:MM)
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 09:00 - 17:30"
                  value={horarios[dia] || ""}
                  onChangeText={(t) => atualizarHorario(dia, formatarHorario(t))}
                />
              </View>
            ))}

            <View style={styles.navButtons}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={() => back(4)}>
                <Text style={styles.buttonTextAlt}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={salvarBarbearia}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === "ios" ? 20 : 100}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {renderPagina()}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F4F4" },
  scroll: { padding: 20, paddingBottom: 80 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
  },
  label: { fontWeight: "700", fontSize: 15, marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FAFAFA",
    color: "#111",
    marginBottom: 10,
  },
  fotoBtn: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 15,
  },
  fotoBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  foto: { width: "100%", height: 200, borderRadius: 16, marginBottom: 15 },
  button: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    flex: 1,
  },
  buttonSecondary: {
    backgroundColor: "#E0E0E0",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  buttonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  buttonTextAlt: { color: "#111", fontWeight: "600", fontSize: 16 },
  navButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  tag: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    backgroundColor: "#FFF",
  },
  tagSelecionado: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  tagText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  tagTextSelecionado: {
    color: "#FFF",
    fontWeight: "700",
  },
  diasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  diaBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 6,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
  },
  diaBtnSelecionado: { backgroundColor: "#111" },
  diaText: { color: "#333", fontWeight: "500" },
  diaTextSelecionado: { color: "#FFF", fontWeight: "700" },
});
