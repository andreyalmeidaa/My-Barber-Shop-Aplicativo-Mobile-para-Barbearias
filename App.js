  import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createNativeStackNavigator } from '@react-navigation/native-stack';
  import TelaLogin from './janelas/telaLogin';
  import TelaCadastro from './janelas/telaCadastro';
  import CadastroBarbearia from './janelas/cadastroBarbearia2';
  import InicialClient from './janelas/inicialClient';
  import InicialBarbearia from './janelas/inicialBarbearia';
  import TelaAgendamentos from './tabsbarbeiro/telaAgendamentos';
  import TelaMensagens from './tabsbarbeiro/telaMensagens';
  import TelaConfiguracoes from './tabsbarbeiro/telaConfiguracoes';
  import DetalhesBarbearia from './tabsclient/DetalhesBarbearia';
  import PerfilCliente from './tabsclient/PerfilCliente'; 

  const Stack = createNativeStackNavigator();

  export default function App() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="TelaLogin"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >

          <Stack.Screen name="TelaLogin" component={TelaLogin} />

          <Stack.Screen name="TelaCadastro" component={TelaCadastro} />

          <Stack.Screen
            name="CadastroBarbearia"
            component={CadastroBarbearia}
            options={{ title: 'Mais Detalhes da Barbearia' }}
          />

          <Stack.Screen name="InicialClient" component={InicialClient} />
          <Stack.Screen name="InicialBarbearia" component={InicialBarbearia} />

          <Stack.Screen name="TelaAgendamentos" component={TelaAgendamentos} />
          <Stack.Screen name="TelaMensagens" component={TelaMensagens} />
          <Stack.Screen name="TelaConfiguracoes" component={TelaConfiguracoes} />

          <Stack.Screen name="DetalhesBarbearia" component={DetalhesBarbearia} />


          <Stack.Screen
            name="PerfilCliente"
            component={PerfilCliente}
            options={{
              title: 'Meu Perfil',
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
