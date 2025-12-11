<div align="center">

# 💈📱 My Barber Shop  
### Aplicativo Mobile para Agendamento e Gestão de Barbearias

<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzIyeG8wczRyZDlya3ZpZnkzc3Z3a3IwNHQ3MnRvZHcxYjEwcTZhNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qgQUggAC3Pfv687qPC/giphy.gif" width="260">

---

### 🚀 *Modernize sua barbearia com um app simples, rápido e funcional!*

[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)]()
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)]()
[![Google Maps API](https://img.shields.io/badge/Google%20Places%20API-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)]()
[![License](https://img.shields.io/badge/License-Academic-blue?style=for-the-badge)]()

</div>

---

## 📌 Sobre o Projeto

O **My Barber Shop** é um aplicativo mobile desenvolvido em **React Native + Firebase**, criado para facilitar o agendamento e comunicação entre **clientes** e **barbearias**.

O sistema oferece:

- ✔ Chat em tempo real  
- ✔ Agendamentos em tempo real  
- ✔ Cadastro completo da barbearia  
- ✔ Upload de imagens via Firebase Storage  
- ✔ Integração com Google Places e Maps  
- ✔ Painel do cliente e painel da barbearia  

---

# 🛠 **Tecnologias e Bibliotecas Utilizadas**

### 📦 React / React Native / Expo
- react  
- react-native  
- expo  

---

### 🧭 Navegação (React Navigation)
- @react-navigation/native  
- @react-navigation/native-stack  
- @react-navigation/bottom-tabs  
- react-native-screens  
- react-native-safe-area-context  

---

### 🔥 Firebase
- firebase (Auth, Realtime Database, Storage)

---

### 🗺 Google Places & Maps
- react-native-maps  
- react-native-google-places-autocomplete  

---

### 📦 Outras Bibliotecas
- @react-native-async-storage/async-storage  
- react-native-mask-input  
- react-native-keyboard-aware-scroll-view  
- @react-native-community/datetimepicker  
- @react-native-picker/picker  
- expo-image-picker  
- expo-image-manipulator  
- expo-file-system  
- expo-location  
- expo-notifications  
- expo-linear-gradient  

---

# 📁 Estrutura do Projeto

```
_my_barber_shop/
|
├── App.js
├── index.js
|
├── servicos/
│   └── firebaseConfig.js
|
├── janelas/
│   ├── telaLogin.js
│   ├── telaCadastro.js
│   ├── cadastroBarbearia2.js
│   ├── inicialClient.js
│   └── inicialBarbearia.js
|
├── tabsclient/
│   ├── BarbeariasTab.js
│   ├── AgendamentosTab.js
│   ├── ConversasTab.js
│   ├── ConfigClienteTab.js
│   └── DetalhesBarbearia.js
|
└── tabsbarbeiro/
    ├── telaAgendamentos.js
    ├── telaMensagens.js
    └── telaConfiguracoes.js
```

---

## 📱 Screenshots

<div align="center">

### 🔐 Login / Cadastro / Home
<img src="https://github.com/user-attachments/assets/d0c0cd36-0e1f-4d0f-9bd7-034bf15373d7" width="250">
<img src="https://github.com/user-attachments/assets/a6dfb31e-aa8d-4531-b3b6-8a404c01c929" width="250">
<img src="https://github.com/user-attachments/assets/f00560cd-ce78-45e8-bbdd-7157deabd805" width="250">

<img src="https://github.com/user-attachments/assets/12c3ad2d-6ec0-46c4-9e5f-b80fd585654c" width="250">
<img src="https://github.com/user-attachments/assets/593d9e82-90ff-43bb-8e7d-fac2fd890244" width="250">
<img src="https://github.com/user-attachments/assets/c9a1bcfe-2aae-4948-9060-fc639a0e8ddd" width="250">

---

### 💈 Cadastro da Barbearia / Endereço
<img src="https://github.com/user-attachments/assets/187ade24-b248-47f4-b052-a81c0bfaf8b3" width="250">
<img src="https://github.com/user-attachments/assets/e81014c3-dcea-4c7e-bbda-da9f0866f8fa" width="250">
<img src="https://github.com/user-attachments/assets/b226145d-d6de-4357-914f-dedc2ab43093" width="250">

---

### 📅 Agendamentos
<img src="https://github.com/user-attachments/assets/5fa2d5e3-0000-4f2c-9f87-2a831f0d9b6a" width="250">
<img src="https://github.com/user-attachments/assets/30e18a09-106a-4d03-98bc-8e26073f1a21" width="250">
<img src="https://github.com/user-attachments/assets/f4049fab-4acc-4922-b84d-af3eb02c887c" width="250">

---

### 🗺️ Localização / Mapa
<img src="https://github.com/user-attachments/assets/b0252eb0-140e-45d8-a26f-df7aab720624" width="250">

</div>

---

# 🚀 Como Rodar o Projeto

### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/andreyalmeidaa/My-Barber-Shop-Aplicativo-Mobile-para-Barbearias
cd My-Barber-Shop-Aplicativo-Mobile-para-Barbearias
```

### 2️⃣ Instalar dependências
```bash
npm install
```

### 3️⃣ Executar
```bash
npx expo start
```

---

# 🔥 Configuração do Firebase

No arquivo:

```
/servicos/firebaseConfig.js
```

Insira:

```javascript
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
```

---

# 🙌 Créditos

## 👨‍💻 Desenvolvimento
| Nome | Função | Contribuição |
|------|--------|--------------|
| **Andrey Cavalcante** | Desenvolvedor Full Stack | Criou 100% do código, telas, Firebase, navegação, chat, agendamento, lógica, arquitetura. |
| **Guilherme Freire** | Requisitos & QA | Coleta de requisitos, testes e validação com usuários reais. |
| **Gabriella Nunes** | Documentação | Pesquisa com público-alvo e relatório. |
| **Renata Alves** | Documentação | Apoio na organização e escrita. |
| **Victoria Molledo** | Apoio | Organização de reuniões e suporte administrativo. |

---

# 📄 Licença
Projeto acadêmico — livre para fins educativos.

---

<div align="center">

### 💈✂️ Obrigado por apoiar o My Barber Shop!

</div>
