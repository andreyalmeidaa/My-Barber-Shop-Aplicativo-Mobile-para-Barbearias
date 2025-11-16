import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, get, update } from 'firebase/database';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { database, storage } from '../servicos/firebaseConfig';

export default function PerfilCliente({ route, navigation }) {
  const { userId } = route.params;
  const [dados, setDados] = useState({});
  const [novaFoto, setNovaFoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Carrega dados do cliente
  useEffect(() => {
    const carregar = async () => {
      try {
        const snap = await get(ref(database, `usuarios/${userId}`));
        if (snap.exists()) {
          setDados(snap.val());
        }
      } catch (error) {
        console.log('Erro ao carregar perfil:', error);
      }
    };
    carregar();
  }, []);

  // 🔹 Escolher imagem da galeria
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
        setNovaFoto(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Erro ao escolher imagem:', error);
    }
  };

  // 🔹 Upload da imagem e exclusão da antiga
  const uploadImagem = async (uriLocal, antigaUrl) => {
    try {
      const blob = await (await fetch(uriLocal)).blob();
      const caminho = storageRef(storage, `clientes/${userId}_${Date.now()}.jpg`);
      await uploadBytes(caminho, blob);
      const urlPublica = await getDownloadURL(caminho);

      // apaga a antiga
      if (antigaUrl && antigaUrl.includes('firebasestorage')) {
        try {
          const antigaRef = storageRef(
            storage,
            decodeURIComponent(antigaUrl.split('/o/')[1].split('?')[0])
          );
          await deleteObject(antigaRef);
        } catch (err) {
          console.log('Erro ao apagar imagem antiga:', err);
        }
      }

      return urlPublica;
    } catch (error) {
      console.log('Erro no upload da imagem:', error);
      return null;
    }
  };

  // 🔹 Salvar alterações no Firebase
  const salvar = async () => {
    try {
      setLoading(true);
      let fotoFinal = dados.fotoUrl || '';

      if (novaFoto) {
        const url = await uploadImagem(novaFoto, dados.fotoUrl);
        if (url) fotoFinal = url;
      }

      const novosDados = {
        ...dados,
        fotoUrl: fotoFinal,
      };

      await update(ref(database, `usuarios/${userId}`), novosDados);
      setDados(novosDados);
      setNovaFoto(null);

      Alert.alert('✅ Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.log('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Meu Perfil</Text>

      {/* FOTO DE PERFIL */}
      <View style={styles.fotoContainer}>
        <TouchableOpacity onPress={escolherImagem}>
          {novaFoto || dados.fotoUrl ? (
            <Image
              source={{ uri: novaFoto || dados.fotoUrl }}
              style={styles.foto}
            />
          ) : (
            <View style={styles.semFoto}>
              <Ionicons name="camera-outline" size={40} color="#666" />
              <Text style={{ color: '#666', marginTop: 4 }}>Selecionar foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* CAMPOS DE EDIÇÃO */}
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={dados.nome || ''}
        placeholder="Seu nome"
        onChangeText={(t) => setDados({ ...dados, nome: t })}
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={dados.telefone || ''}
        keyboardType="phone-pad"
        placeholder="(XX) XXXXX-XXXX"
        onChangeText={(t) => setDados({ ...dados, telefone: t })}
      />

      <Text style={styles.label}>E-mail</Text>
      <View style={styles.emailBox}>
        <Text style={styles.emailText}>{dados.email || 'email@exemplo.com'}</Text>
        <Text style={styles.emailHint}>E-mail não pode ser alterado</Text>
      </View>

      {/* BOTÃO DE SALVAR */}
      <TouchableOpacity
        style={[styles.botao, loading && { opacity: 0.6 }]}
        onPress={salvar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.botaoTexto}>Salvar Alterações</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  titulo: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111',
  },
  fotoContainer: { alignItems: 'center', marginBottom: 25 },
  foto: { width: 130, height: 130, borderRadius: 65 },
  semFoto: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    marginBottom: 15,
  },
  emailBox: {
    backgroundColor: '#EEE',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 25,
  },
  emailText: { fontWeight: '600', color: '#555' },
  emailHint: { fontSize: 12, color: '#888' },
  botao: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  botaoTexto: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
