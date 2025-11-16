# 💈📱 My Barber Shop  
### Aplicativo Mobile para Agendamento e Gestão de Barbearias

<div align="center">
<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzIyeG8wczRyZDlya3ZpZnkzc3Z3a3IwNHQ3MnRvZHcxYjEwcTZhNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qgQUggAC3Pfv687qPC/giphy.gif" width="280">
</div>

---

## 📌 **Sobre o Projeto**

**My Barber Shop** é um aplicativo mobile criado para facilitar o agendamento e comunicação entre clientes e barbearias.  
O sistema conta com chat em tempo real, agendamento, cadastro de serviços, upload de fotos e gerenciamento completo da barbearia.

---

## 🧩 **Funcionalidades**

### 👤 Cliente
- Cadastro/login  
- Buscar barbearias  
- Ver fotos, serviços e horários  
- Agendar horário  
- Chat com a barbearia  
- Editar perfil  

### 💈 Barbearia
- Completar cadastro profissional  
- Definir horários de funcionamento  
- Cadastrar serviços e pagamento  
- Receber agendamentos  
- Aceitar/recusar/finalizar  
- Conversar com clientes  

---

## 🛠 **Tecnologias Usadas**

- React Native  
- Expo  
- Firebase Authentication  
- Firebase Realtime Database  
- Firebase Storage  
- Google Places API  
- React Navigation  
- AsyncStorage  
- Expo ImagePicker  

---

## 📁 **Estrutura do Projeto**

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

## 🎞 **Demonstração (GIF)**

<div align="center">
<img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXJzN2FrMmo3YmUzaDJsM3M2dGc4bnR4bWhhNjlvc2lzMHFoOWMxYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/W7bLz4VJD2xWssciWg/giphy.gif" width="270">
</div>

---

## 🚀 **Como Rodar**

### 1️⃣ Clonar
```bash
git clone https://github.com/andreyalmeidaa/MyBarberShop.git
```

### 2️⃣ Instalar dependências
```bash
npm install
```

### 3️⃣ Iniciar projeto
```bash
npx expo start
```

Abra no **Expo Go**.

---

## 🔥 **Configuração Firebase**

No arquivo:

`/servicos/firebaseConfig.js`

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

# 🙌 **Créditos**

## 👨‍💻 Desenvolvimento
| Nome | Função | Contribuição |
|------|--------|--------------|
| **Andrey Cavalcante** | Desenvolvedor Full Stack | Desenvolveu 100% do código, arquitetura, Firebase, telas, navegação, chat e agendamentos. |
| **Guilherme Freire** | Requisitos & QA | Coleta de requisitos, testes, feedback e validação com usuários reais. |
| **Gabriella Nunes** | Documentação & Pesquisa | Entrevistas e organização do relatório. |
| **Renata Alves** | Documentação & Pesquisa | Apoio na coleta de dados e redação. |
| **Victoria Molledo** | Apoio Administrativo | Organização de reuniões e cronograma. |

---

## 📄 Licença

Projeto acadêmico — uso livre para fins educacionais.

---

<div align="center">

### 💈✂️ Obrigado por apoiar o My Barber Shop!

</div>
