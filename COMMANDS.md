# 🚀 Guia Rápido de Comandos

## 📦 Instalação

```powershell
# Instalar todas as dependências
npm install

# Ou usando yarn
yarn install
```

## 🛠️ Desenvolvimento

```powershell
# Iniciar servidor de desenvolvimento
npm run dev

# A aplicação estará disponível em http://localhost:3000
```

## 🏗️ Build

```powershell
# Criar build de produção
npm run build

# Os arquivos otimizados estarão na pasta dist/
```

## 👀 Preview

```powershell
# Visualizar build de produção localmente
npm run preview
```

## 🔍 Linting

```powershell
# Verificar problemas no código
npm run lint
```

## 🔥 Firebase

### Inicializar Firebase (primeira vez)

```powershell
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Fazer login no Firebase
firebase login

# Inicializar projeto
firebase init
```

### Deploy das Regras

```powershell
# Deploy apenas das regras do Firestore
firebase deploy --only firestore:rules

# Deploy apenas das regras do Storage
firebase deploy --only storage:rules

# Deploy de tudo
firebase deploy
```

## 📊 Estrutura de Pastas

```
DailyCheckMaromba/
├── public/                  # Arquivos estáticos
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Alert.jsx
│   │   ├── Avatar.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Loading.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   └── Select.jsx
│   ├── context/           # Contextos do React
│   │   ├── AthletesContext.jsx
│   │   └── SeasonContext.jsx
│   ├── pages/             # Páginas da aplicação
│   │   ├── Athletes.jsx
│   │   ├── Checkin.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Payments.jsx
│   │   └── Seasons.jsx
│   ├── services/          # Serviços do Firebase
│   │   ├── athletes.js
│   │   ├── checkins.js
│   │   ├── firebase.js
│   │   ├── payments.js
│   │   └── seasons.js
│   ├── utils/             # Utilitários
│   │   ├── calculator.js
│   │   ├── formatters.js
│   │   └── ranking.js
│   ├── styles/            # Estilos
│   │   └── global.css
│   ├── App.jsx            # Componente principal
│   └── main.jsx           # Ponto de entrada
├── .env                   # Variáveis de ambiente
├── .env.example           # Exemplo de variáveis
├── .gitignore            # Arquivos ignorados pelo Git
├── EXAMPLES.md           # Exemplos de uso
├── INSTALLATION.md       # Guia de instalação
├── README.md             # Documentação principal
├── firestore.rules       # Regras do Firestore
├── index.html            # HTML principal
├── package.json          # Dependências do projeto
├── postcss.config.js     # Configuração do PostCSS
├── storage.rules         # Regras do Storage
├── tailwind.config.js    # Configuração do Tailwind
└── vite.config.js        # Configuração do Vite
```

## 🔧 Comandos Git

```powershell
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit"

# Adicionar remote do GitHub
git remote add origin https://github.com/seu-usuario/seu-repo.git

# Push para o GitHub
git push -u origin main
```

## 🌐 Deploy no Vercel

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

## 🐛 Troubleshooting

### Limpar cache e reinstalar dependências

```powershell
# Remover node_modules e package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Limpar cache do npm
npm cache clean --force

# Reinstalar
npm install
```

### Resolver conflitos de versão

```powershell
# Atualizar todas as dependências
npm update

# Verificar pacotes desatualizados
npm outdated
```

### Verificar portas em uso

```powershell
# Ver o que está usando a porta 3000
netstat -ano | findstr :3000

# Matar processo (substitua PID pelo número encontrado)
taskkill /PID [número] /F
```

## 📝 Scripts Úteis

### Criar arquivo .env a partir do exemplo

```powershell
Copy-Item .env.example .env
```

### Abrir projeto no VS Code

```powershell
code .
```

### Verificar versão do Node

```powershell
node --version
```

### Verificar versão do npm

```powershell
npm --version
```

## 🎯 Atalhos no VS Code

- `Ctrl + P` - Buscar arquivo
- `Ctrl + Shift + F` - Buscar em todo o projeto
- `Ctrl + B` - Toggle sidebar
- `Ctrl + J` - Toggle terminal
- `Ctrl + K + S` - Salvar todos os arquivos

## 📚 Comandos Firebase Úteis

```powershell
# Listar projetos
firebase projects:list

# Selecionar projeto
firebase use [project-id]

# Ver informações do projeto
firebase projects:list

# Abrir console do Firebase
firebase open

# Ver logs
firebase functions:log
```

## 🔄 Atualizar Dependências

```powershell
# Atualizar todas as dependências minor/patch
npm update

# Atualizar dependência específica
npm install [pacote]@latest

# Verificar dependências desatualizadas
npm outdated
```

## 💡 Dicas

1. **Sempre rode `npm install` após clonar o projeto**
2. **Configure o `.env` antes de iniciar o servidor**
3. **Use `npm run dev` para desenvolvimento**
4. **Use `npm run build` antes de fazer deploy**
5. **Teste o build localmente com `npm run preview`**
6. **Faça commits frequentes**
7. **Mantenha o `.env` privado (nunca faça commit)**

## 🆘 Links Úteis

- [Documentação React](https://react.dev/)
- [Documentação Vite](https://vitejs.dev/)
- [Documentação Firebase](https://firebase.google.com/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação Vercel](https://vercel.com/docs)

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Verifique os logs no terminal
3. Consulte a documentação oficial
4. Verifique as issues no GitHub (se aplicável)
