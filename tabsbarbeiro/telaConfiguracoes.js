import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import MaskInput from 'react-native-mask-input';
import { ref, get, update } from 'firebase/database';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { database, storage } from '../servicos/firebaseConfig';

export default function TelaConfiguracoes({ route, navigation }) {
  const { userId } = route.params;
  const [dados, setDados] = useState({});
  const [pagamentos, setPagamentos] = useState([]);
  const [enderecosSugestao, setEnderecosSugestao] = useState([]);
  const [loading, setLoading] = useState(false);

  const GOOGLE_API_KEY = 'AIzaSyDyKVj0rWr44F9ZX9K_-9vo_plQDBrJ7Xo';

  //  Carrega dados da barbearia
  useEffect(() => {
    const carregar = async () => {
      try {
        const snap = await get(ref(database, `barbearias/${userId}`));
        if (snap.exists()) {
          const info = snap.val() || {};
          setDados(info);
          if (info.formasPagamento) {
            setPagamentos(info.formasPagamento.split(',').map((p) => p.trim()));
          }
        }
      } catch (error) {
        console.log('Erro ao carregar configurações:', error);
      }
    };
    carregar();
  }, []);

  //  Escolher imagem da galeria
  const escolherImagem = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à galeria para escolher uma foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setDados({ ...dados, novaFoto: uri });
      }
    } catch (error) {
      console.log('Erro ao escolher imagem:', error);
    }
  };

  //  Faz upload da imagem e apaga a antiga
  const uploadImagem = async (uriLocal, antigaUrl) => {
    try {
      console.log('🚀 Iniciando upload da imagem:', uriLocal);

      // Converte imagem local em blob
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new TypeError('Erro ao converter imagem.'));
        xhr.responseType = 'blob';
        xhr.open('GET', uriLocal, true);
        xhr.send(null);
      });

      const caminho = storageRef(storage, `fotosbarbearias/${userId}_${Date.now()}.jpg`);
      await uploadBytes(caminho, blob);
      blob.close?.();

      const urlPublica = await getDownloadURL(caminho);
      console.log('✅ Upload concluído:', urlPublica);

      //  Deleta imagem antiga, se existir
      if (antigaUrl && antigaUrl.includes('firebasestorage')) {
        try {
          const antigaRef = storageRef(storage, decodeURIComponent(antigaUrl.split('/o/')[1].split('?')[0]));
          await deleteObject(antigaRef);
          console.log('🧹 Imagem antiga apagada!');
        } catch (err) {
          console.log('⚠️ Falha ao apagar imagem antiga:', err);
        }
      }

      return urlPublica;
    } catch (error) {
      console.log('❌ Erro ao enviar imagem:', error);
      Alert.alert('Erro', 'Falha ao enviar imagem para o servidor.');
      return null;
    }
  };

  //  Buscar endereço com Google Places
  const buscarEndereco = async (text) => {
    setDados({ ...dados, endereco: text });
    if (text.length < 3) {
      setEnderecosSugestao([]);
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&key=${GOOGLE_API_KEY}&language=pt-BR&types=address`
      );
      const data = await response.json();

      if (data.predictions) {
        setEnderecosSugestao(
          data.predictions.map((p) => ({
            description: p.description,
            id: p.place_id,
          }))
        );
      }
    } catch (err) {
      console.log('Erro ao buscar endereços:', err);
    }
  };

  const selecionarEndereco = (item) => {
    setDados({ ...dados, endereco: item.description });
    setEnderecosSugestao([]);
  };

  //  Alternar formas de pagamento
  const togglePagamento = (forma) => {
    const listaAtual = Array.isArray(pagamentos) ? [...pagamentos] : [];
    const novaLista = listaAtual.includes(forma)
      ? listaAtual.filter((f) => f !== forma)
      : [...listaAtual, forma];

    setPagamentos(novaLista);
    setDados({ ...dados, formasPagamento: novaLista.join(', ') });
  };

  //  Salvar alterações
  const salvar = async () => {
    try {
      setLoading(true);
      let fotoFinal = dados.fotoUrl || '';

      // Se tiver imagem nova, faz upload e apaga antiga
      if (dados.novaFoto) {
        console.log('📤 Subindo nova imagem...');
        const urlFirebase = await uploadImagem(dados.novaFoto, dados.fotoUrl);
        if (urlFirebase) fotoFinal = urlFirebase;
      }

      const novosDados = {
        ...dados,
        fotoUrl: fotoFinal,
        formasPagamento: pagamentos.join(', '),
      };

      //  Remove campo temporário antes de salvar (evita erro do update)
      delete novosDados.novaFoto;

      await update(ref(database, `barbearias/${userId}`), novosDados);
      setDados(novosDados);

      Alert.alert('✅ Sucesso', 'Configurações salvas com sucesso!');
    } catch (error) {
      console.log('❌ Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  const opcoesPagamento = ['Dinheiro', 'Cartão', 'Pix', 'Crédito', 'Débito'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
          <Text style={styles.voltarText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Configurações</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
          <Text style={styles.titulo}>Editar Informações da Barbearia</Text>

          {/* FOTO */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={escolherImagem}>
              {dados.novaFoto || dados.fotoUrl ? (
                <Image
                  source={{ uri: dados.novaFoto || dados.fotoUrl }}
                  style={{ width: 130, height: 130, borderRadius: 65 }}
                />
              ) : (
                <View style={styles.semFoto}>
                  <Ionicons name="camera-outline" size={40} color="#666" />
                  <Text style={{ color: '#666', marginTop: 4 }}>Selecionar foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nome da Barbearia"
            value={dados.nomeBarbearia || ''}
            onChangeText={(t) => setDados({ ...dados, nomeBarbearia: t })}
          />

          <Text style={styles.label}>Endereço</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={styles.input}
              placeholder="Digite o endereço"
              value={dados.endereco || ''}
              onChangeText={buscarEndereco}
            />
            {enderecosSugestao.length > 0 && (
              <ScrollView style={styles.sugestoesContainer} keyboardShouldPersistTaps="handled">
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
            )}
          </View>

          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            placeholder="Descrição"
            value={dados.descricao || ''}
            onChangeText={(t) => setDados({ ...dados, descricao: t })}
          />

          <MaskInput
            style={styles.input}
            placeholder="Telefone (XX) XXXXX-XXXX"
            keyboardType="numeric"
            value={dados.telefone || ''}
            onChangeText={(masked) => setDados({ ...dados, telefone: masked })}
            mask={[
              '(',
              /\d/,
              /\d/,
              ')',
              ' ',
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              '-',
              /\d/,
              /\d/,
              /\d/,
              /\d/,
            ]}
          />

          <TextInput
            style={styles.input}
            placeholder="Serviços oferecidos"
            value={dados.servicos || ''}
            onChangeText={(t) => setDados({ ...dados, servicos: t })}
          />

          <Text style={styles.subtitulo}>Formas de Pagamento:</Text>
          <View style={styles.pagamentosContainer}>
            {opcoesPagamento.map((op) => (
              <TouchableOpacity
                key={op}
                style={[styles.pagamentoChip, pagamentos.includes(op) && styles.pagamentoAtivo]}
                onPress={() => togglePagamento(op)}
              >
                <Text
                  style={{
                    color: pagamentos.includes(op) ? '#FFF' : '#333',
                    fontWeight: '600',
                  }}
                >
                  {op}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputBloqueado}>
            <Text style={{ color: '#888', fontWeight: '600' }}>
              {dados.email || 'email@barbearia.com'}
            </Text>
            <Text style={{ fontSize: 12, color: '#999' }}>E-mail não pode ser alterado</Text>
          </View>

          <TouchableOpacity style={styles.botao} onPress={salvar} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.botaoTexto}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ====== ESTILOS ======
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  voltarBtn: { flexDirection: 'row', alignItems: 'center' },
  voltarText: { fontSize: 16, color: '#222', marginLeft: 6, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#111' },
  container: { flex: 1, paddingHorizontal: 20 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#111', marginVertical: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 15,
  },
  semFoto: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagamentosContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  pagamentoChip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#999',
    margin: 5,
    backgroundColor: '#FFF',
  },
  pagamentoAtivo: { backgroundColor: '#222', borderColor: '#222' },
  subtitulo: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 8 },
  inputBloqueado: {
    backgroundColor: '#EEE',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 25,
  },
  botao: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoTexto: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  sugestoesContainer: {
    maxHeight: 140,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
    position: 'absolute',
    top: 55,
    width: '100%',
    zIndex: 10,
  },
  sugestao: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
});
