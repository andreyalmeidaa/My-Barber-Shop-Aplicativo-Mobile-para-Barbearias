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

# 📱 Screenshots

<div align="center">

<img src="https://github.com/user-attachments/assets/fd4fd81a-b5ba-4ac1-ad3a-9f8d06c65291" width="320">
<img src="https://github.com/user-attachments/assets/dcd0b473-43e7-445d-ba00-a6e0e68d41af" width="320">

<br><br>

<img src="https://github.com/user-attachments/assets/554ca01e-444c-4ced-8d4a-3caa1e8f42fe" width="260">
<img src="https://github.com/user-attachments/assets/14a3960f-9292-4165-bc87-759fb32de7d3" width="260">
<img src="https://github.com/user-attachments/assets/15ccc32a-5610-4543-9a41-9981cf76e8aa" width="260">

<br><br>

<img src="https://github.com/user-attachments/assets/cc758843-6ec1-434e-8efc-60e693d7d417" width="260">
<img src="https://github.com/user-attachments/assets/1487bc5e-aed0-4624-84b9-ed71eda8d865" width="260">
<img src="https://github.com/user-attachments/assets/a0c0ea72-d632-4b54-95ab-70b6394ee208" width="260">

<br><br>

<img src="https://github.com/user-attachments/assets/d01b8af3-598a-482f-9450-cc4f9da57669" width="260">
<img src="https://github.com/user-attachments/assets/26edeeef-a103-4064-8738-09c881ad42ff" width="260">
<img src="https://github.com/user-attachments/assets/8895219b-6b19-492e-8ea5-82efc459aa49" width="260">

<br><br>

<img src="https://github.com/user-attachments/assets/03740b01-6c67-4555-911a-532668d82857" width="260">
<br><br>
<img width="277" height="598" alt="HISTORICO OCONVERSAS" src="https://github.com/user-attachments/assets/931338d2-ebf1-4ed1-bb06-70008ab6feda" />
<img src="https://github.com/user-attachments/assets/931338d2-ebf1-4ed1-bb06-70008ab6feda" width="260">

</div>

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
