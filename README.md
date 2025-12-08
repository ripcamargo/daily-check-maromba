# 🏋️ Daily Check Maromba

Aplicação web para gerenciar check-ins de academia entre amigos, com sistema de temporadas, rankings e controle financeiro de multas.

## 🚀 Funcionalidades

- ✅ Cadastro de atletas com níveis de experiência
- 📅 Sistema de temporadas com configuração personalizada
- ✓ Registro de check-ins diários (Presente, Folga, Falta, Hospital, Justificado, Extra)
- 🏆 Ranking automático com critérios de desempate
- 💰 Controle financeiro de multas e pagamentos
- 📊 Dashboard com estatísticas e mini-rankings
- 📜 Histórico completo por atleta

## 🛠️ Tecnologias

- React 18
- Vite
- Firebase (Firestore, Storage, Auth)
- React Router
- date-fns
- Lucide React (ícones)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Copie .env.example para .env e preencha com suas credenciais do Firebase
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔥 Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Firestore Database
3. Ative o Storage
4. Ative o Authentication (opcional, para futuras melhorias)
5. Copie as credenciais para o arquivo `.env`

## 📁 Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
├── pages/            # Páginas da aplicação
├── context/          # Contextos do React
├── services/         # Serviços do Firebase
├── utils/            # Utilitários e cálculos
└── styles/           # Estilos globais
```

## 📊 Modelagem de Dados

### Athletes
- Dados permanentes dos atletas
- Histórico de participação em temporadas

### Seasons
- Configuração de temporadas
- Participantes e regras
- Dias neutros do calendário

### Check-ins
- Registro diário de presença por temporada
- Status: Presente, Folga, Falta, Hospital, Justificado, Extra

### Payments
- Histórico de pagamentos de multas por temporada

## 🎯 Lógica de Multas

- Cada falta acima do limite de folgas semanais gera multa
- Dias neutros não contam como falta
- Hospital e Justificado não geram multa
- Extra pode dar benefícios (configurável)

## 🏆 Sistema de Ranking

Critérios de desempate em ordem:
1. Maior número de presenças
2. Menor número de faltas
3. Menor número de folgas
4. Menor número de ausências justificadas
5. Menor número de idas ao hospital

## 📱 Deploy

O projeto está configurado para deploy no Vercel:

```bash
# Deploy
vercel --prod
```

## 📝 Licença

Projeto pessoal entre amigos.
