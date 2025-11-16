import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../servicos/firebaseConfig';

export default function TelaLogin() {
  const navigation = useNavigation();
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [lembrar, setLembrar] = useState(false);

  // =============================
  //  Carregar login salvo
  // =============================
  useEffect(() => {
    const carregarEmail = async () => {
      const emailSalvo = await AsyncStorage.getItem('@emailSalvo');
      if (emailSalvo) {
        setEmail(emailSalvo);
        setLembrar(true);
      }
    };
    carregarEmail();
  }, []);

  // =============================
  //  LOGIN
  // =============================
  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      if (lembrar) {
        await AsyncStorage.setItem('@emailSalvo', email);
      } else {
        await AsyncStorage.removeItem('@emailSalvo');
      }

      //  Verifica se é barbeiro
      let snapshot = await get(ref(database, `barbearias/${user.uid}`));
      if (snapshot.exists()) {
        navigation.replace('InicialBarbearia', { userId: user.uid });
        return;
      }

      //  Se não for barbeiro, verifica se é cliente
      snapshot = await get(ref(database, `usuarios/${user.uid}`));
      if (snapshot.exists()) {
        navigation.replace('InicialClient', { userId: user.uid });
        return;
      }

      Alert.alert('Erro', 'Usuário não encontrado. Faça seu cadastro.');
    } catch (error) {
      console.log(error);
      Alert.alert('Erro ao fazer login', 'Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  // =============================
  //  RECUPERAR SENHA
  // =============================
  const handleRecuperarSenha = async () => {
    if (!email) {
      Alert.alert('Aviso', 'Por favor, digite seu e-mail para recuperar a senha.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'Um link de redefinição de senha foi enviado para seu e-mail.');
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível enviar o e-mail. Verifique o endereço.');
    }
  };

  // =============================
  //  INTERFACE
  // =============================
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Bem-vindo</Text>

          {/* Campo de e-mail */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Campo de senha */}
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#888"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          {/* Lembrar login */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setLembrar(!lembrar)}
          >
            <View style={[styles.checkbox, lembrar && styles.checkboxAtivo]} />
            <Text style={styles.checkboxTexto}>Lembrar login</Text>
          </TouchableOpacity>

          {/* Botão de login */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Botão Esqueci Senha */}
          <TouchableOpacity
            style={styles.btnEsqueci}
            onPress={handleRecuperarSenha}
          >
            <Text style={styles.btnEsqueciTexto}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* Link para cadastro */}
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('TelaCadastro')}
          >
            <Text style={styles.linkText}>
              Não tem uma conta? <Text style={styles.linkBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =============================
//  ESTILOS
// =============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  innerContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFF',
    color: '#111',
    marginBottom: 15,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1E1E1E',
    borderRadius: 6,
    marginRight: 8,
  },
  checkboxAtivo: {
    backgroundColor: '#1E1E1E',
  },
  checkboxTexto: {
    fontSize: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    elevation: 2,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  btnEsqueci: {
    width: '100%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  btnEsqueciTexto: {
    color: '#1E1E1E',
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 10,
  },
  linkText: {
    color: '#555',
    fontSize: 15,
  },
  linkBold: {
    color: '#1E1E1E',
    fontWeight: '700',
  },
});
