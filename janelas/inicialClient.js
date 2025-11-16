import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import BarbeariasTab from '../tabsclient/BarbeariasTab';
import AgendamentosTab from '../tabsclient/AgendamentosTab';
import ConversasTab from '../tabsclient/ConversasTab';
import ConfigClienteTab from '../tabsclient/ConfigClienteTab';

const Tab = createBottomTabNavigator();

export default function InicialClient({ route }) {
  const userId = route?.params?.userId;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#111',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
        },
        tabBarLabelStyle: { paddingBottom: 4, fontSize: 12 },
      }}
    >
      {/*  Barbearias */}
      <Tab.Screen
        name="BarbeariasTab"
        component={BarbeariasTab}
        initialParams={{ userId }}
        options={{
          tabBarLabel: 'Barbearias',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cut-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Agendamentos */}
      <Tab.Screen
        name="AgendamentosTab"
        component={AgendamentosTab}
        initialParams={{ userId }}
        options={{
          tabBarLabel: 'Agendamentos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Conversas */}
      <Tab.Screen
        name="ConversasTab"
        component={ConversasTab}
        initialParams={{ userId }}
        options={{
          tabBarLabel: 'Mensagens',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Perfil / Configurações */}
      <Tab.Screen
        name="ConfigClienteTab"
        component={ConfigClienteTab}
        initialParams={{ userId }}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
