import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
} from 'react-native';
import { auth, database } from '../servicos/firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set } from 'firebase/database';

export default function TelaCadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('cliente'); // padrão

  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Envia verificação de e-mail
      await sendEmailVerification(user);
      Alert.alert(
        'Conta criada com sucesso!',
        `Verifique seu e-mail (${email}) para ativar sua conta.`
      );

      // Salva dados básicos do usuário
      await set(ref(database, `usuarios/${user.uid}`), {
        nome: nome,
        email: email,
        tipo: tipo,
      });

      // Redireciona conforme o tipo de conta
      if (tipo === 'barbearia') {
        navigation.navigate('CadastroBarbearia', { userId: user.uid });
      } else {
        navigation.navigate('TelaLogin');
      }
    } catch (error) {
      console.log('Erro ao criar usuário:', error.code);
      if (error.code === 'auth/email-already-in-use')
        Alert.alert('Erro', 'Este e-mail já está em uso.');
      else if (error.code === 'auth/invalid-email')
        Alert.alert('Erro', 'E-mail inválido.');
      else if (error.code === 'auth/weak-password')
        Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      else Alert.alert('Erro', 'Não foi possível criar a conta.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Text style={styles.title}>Criar Conta 💈</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <Text style={styles.subtitulo}>Tipo de Conta</Text>

        <View style={styles.tipoContainer}>
          <TouchableOpacity
            onPress={() => setTipo('cliente')}
            style={[styles.tipoCard, tipo === 'cliente' && styles.tipoCardSelecionado]}
          >
            <Text style={[styles.tipoText, tipo === 'cliente' && styles.tipoTextSelecionado]}>
              Cliente 💇‍♂️
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTipo('barbearia')}
            style={[styles.tipoCard, tipo === 'barbearia' && styles.tipoCardSelecionado]}
          >
            <Text style={[styles.tipoText, tipo === 'barbearia' && styles.tipoTextSelecionado]}>
              Barbearia ✂️
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('TelaLogin')}>
          <Text style={styles.linkText}>
            Já possui conta? <Text style={styles.linkBold}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F4' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#FFF',
    fontSize: 15,
    color: '#111',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111',
  },
  tipoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  tipoCard: {
    flex: 1,
    padding: 20,
    marginHorizontal: 5,
    backgroundColor: '#EEE',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  tipoCardSelecionado: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  tipoText: {
    fontSize: 16,
    color: '#555',
    fontWeight: 'bold',
  },
  tipoTextSelecionado: {
    color: '#FFF',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  link: { alignItems: 'center', marginVertical: 10 },
  linkText: { color: '#555', fontSize: 15 },
  linkBold: { color: '#111', fontWeight: '700' },
});
