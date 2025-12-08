# 🚀 Guia de Instalação e Configuração

## Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Firebase

## 📋 Passo a Passo

### 1. Instalar Dependências

```powershell
npm install
```

### 2. Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative os seguintes serviços:
   - **Firestore Database** (modo produção ou teste)
   - **Storage** (para uploads de fotos)
   - **Authentication** (opcional, para futuras implementações)

4. Nas configurações do projeto, copie as credenciais do Firebase

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```powershell
Copy-Item .env.example .env
```

2. Edite o arquivo `.env` e preencha com suas credenciais:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 4. Configurar Regras do Firestore

No Firebase Console, vá em **Firestore Database > Regras** e adicione:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Atletas
    match /athletes/{athleteId} {
      allow read, write: if true; // Ajuste conforme necessário
    }
    
    // Temporadas
    match /seasons/{seasonId} {
      allow read, write: if true;
      
      // Check-ins
      match /checkins/{checkinId} {
        allow read, write: if true;
      }
      
      // Pagamentos
      match /payments/{paymentId} {
        allow read, write: if true;
      }
    }
  }
}
```

### 5. Configurar Regras do Storage

No Firebase Console, vá em **Storage > Regras** e adicione:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /athletes/{athleteId}/{allPaths=**} {
      allow read, write: if true;
    }
    match /seasons/{seasonId}/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### 6. Iniciar Servidor de Desenvolvimento

```powershell
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🎯 Primeiros Passos na Aplicação

### 1. Cadastrar Atletas
- Acesse **Atletas** no menu
- Clique em **Novo Atleta**
- Preencha nome, nível de experiência e foto (opcional)

### 2. Criar uma Temporada
- Acesse **Temporadas** no menu
- Clique em **Nova Temporada**
- Preencha:
  - Título da temporada
  - Datas de início e fim
  - Multa por falta (ex: R$ 10,00)
  - Folgas semanais permitidas (ex: 2)
  - Selecione os participantes
  - Upload do logo (opcional)

### 3. Registrar Check-ins
- Acesse **Check-in** no menu
- Selecione a data
- Marque o status de cada atleta:
  - ✅ Presente
  - 🛌 Folga
  - ❌ Falta
  - 🏥 Hospital
  - 📄 Justificado
  - ⭐ Extra
- Clique em **Salvar Check-ins**

### 4. Registrar Pagamentos
- Acesse **Pagamentos** no menu
- Clique em **Registrar Pagamento**
- Selecione o atleta, data e valor
- Clique em **Registrar Pagamento**

### 5. Visualizar Dashboard
- Acesse **Dashboard** no menu
- Veja o ranking dos atletas
- Acompanhe os dados financeiros

## 🏗️ Build para Produção

```powershell
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

## 🚀 Deploy no Vercel

### Método 1: Via GitHub (Recomendado)

1. Crie um repositório no GitHub
2. Faça push do código:
```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

3. Acesse [Vercel](https://vercel.com)
4. Clique em **New Project**
5. Importe o repositório do GitHub
6. Configure as variáveis de ambiente (mesmas do arquivo `.env`)
7. Clique em **Deploy**

### Método 2: Via CLI

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 📱 Estrutura de Dados do Firebase

### Collections

#### athletes/
```javascript
{
  id: "auto-generated",
  name: "Nome do Atleta",
  experienceLevel: "PRO" | "Intermediário" | "Iniciante",
  photoUrl: "url-da-foto",
  history: [
    {
      seasonId: "id-da-temporada",
      stats: { present: 0, rest: 0, absence: 0, ... },
      amountPaid: 0,
      amountOwed: 0
    }
  ],
  createdAt: Timestamp
}
```

#### seasons/
```javascript
{
  id: "auto-generated",
  title: "Temporada Verão 2025",
  startDate: Timestamp,
  endDate: Timestamp,
  participants: ["athleteId1", "athleteId2"],
  finePerAbsence: 10.00,
  weeklyRestLimit: 2,
  logoUrl: "url-do-logo",
  neutralDays: ["2024-12-25", "2025-01-01"],
  active: true,
  createdAt: Timestamp
}
```

#### seasons/{seasonId}/checkins/
```javascript
{
  date: "2024-12-08",
  athletes: {
    "athleteId1": { status: "present" },
    "athleteId2": { status: "rest" }
  },
  updatedAt: Timestamp
}
```

#### seasons/{seasonId}/payments/
```javascript
{
  id: "auto-generated",
  athleteId: "id-do-atleta",
  date: Timestamp,
  value: 20.00,
  createdAt: Timestamp
}
```

## 🐛 Troubleshooting

### Erro: Firebase não inicializado
- Verifique se o arquivo `.env` existe e está preenchido corretamente
- Certifique-se de que todas as variáveis começam com `VITE_`

### Erro: Permissão negada no Firestore
- Verifique as regras do Firestore
- Para testes, você pode usar `allow read, write: if true;`

### Erro ao fazer upload de imagens
- Verifique as regras do Storage
- Certifique-se de que o Storage está ativado no Firebase

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do React](https://react.dev/)

## 📝 Próximos Passos (Melhorias Futuras)

- [ ] Autenticação de usuários (admin vs membros)
- [ ] Notificações push
- [ ] Exportação de relatórios em PDF
- [ ] Gráficos de evolução
- [ ] Sistema de gamificação com medalhas
- [ ] App mobile (React Native)
- [ ] Integração com WhatsApp para notificações

## 🎉 Bom uso!

Agora você está pronto para usar o Daily Check Maromba e gerenciar o desempenho dos atletas de forma profissional!
