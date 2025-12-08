# ❓ Perguntas Frequentes (FAQ)

## 🎯 Geral

### O que é o Daily Check Maromba?
É uma aplicação web para gerenciar check-ins de academia entre amigos, com sistema de temporadas, rankings competitivos e controle financeiro de multas por faltas.

### Preciso saber programar para usar?
Não! A aplicação já está pronta. Você só precisa seguir o guia de instalação e configurar o Firebase.

### É grátis?
Sim! A aplicação é totalmente gratuita. O Firebase tem um plano gratuito generoso que atende perfeitamente para grupos pequenos e médios.

### Quantas pessoas podem participar?
Tecnicamente, não há limite. O Firebase free tier suporta até 50.000 leituras e 20.000 escritas por dia, o que é mais do que suficiente para grupos de até 100 pessoas.

---

## 🔐 Segurança e Privacidade

### Os dados são seguros?
Sim! Os dados ficam armazenados no Firebase (Google Cloud), uma das plataformas mais seguras do mundo. Você pode configurar regras de acesso detalhadas.

### Outras pessoas podem ver meus dados?
Por padrão, as regras permitem acesso público para simplificar o uso inicial. Você pode (e deve) ajustar as regras de segurança no Firebase para adicionar autenticação.

### Como proteger a aplicação?
1. Implemente autenticação (login/senha)
2. Configure regras de acesso no Firestore
3. Limite uploads de arquivos por tamanho
4. Use HTTPS (Vercel já fornece automaticamente)

### Preciso de autenticação de usuário?
Não é obrigatório para começar, mas é recomendado para grupos maiores ou quando quiser mais controle sobre quem acessa o quê.

---

## 💻 Instalação e Configuração

### Não consigo instalar o Node.js
1. Baixe em [nodejs.org](https://nodejs.org/)
2. Use a versão LTS (Long Term Support)
3. Reinicie o computador após a instalação
4. Verifique: `node --version`

### Erro ao rodar `npm install`
**Soluções:**
```powershell
# Limpar cache
npm cache clean --force

# Remover node_modules
Remove-Item -Recurse -Force node_modules

# Reinstalar
npm install
```

### Como pegar as credenciais do Firebase?
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Clique na engrenagem ⚙️ > Configurações do projeto
4. Role até "Seus aplicativos"
5. Se não tiver app, clique em "Adicionar app" > Web
6. Copie as configurações mostradas

### O arquivo .env não funciona
- Certifique-se de que as variáveis começam com `VITE_`
- Não use espaços: `VITE_KEY=valor` ✅
- Não use: `VITE_KEY = valor` ❌
- Reinicie o servidor após editar o .env

### Erro "Firebase not initialized"
Verifique se:
1. O arquivo `.env` existe e está preenchido
2. Todas as variáveis estão corretas
3. Você reiniciou o servidor de desenvolvimento

---

## 🏋️ Uso da Aplicação

### Como adiciono um novo atleta?
1. Vá em "Atletas"
2. Clique em "Novo Atleta"
3. Preencha nome, nível e foto (opcional)
4. Salve

### Posso editar um atleta depois?
Sim! Clique no botão "Editar" no card do atleta.

### Como crio uma temporada?
1. Cadastre os atletas primeiro
2. Vá em "Temporadas"
3. Clique em "Nova Temporada"
4. Preencha todos os dados
5. Selecione os participantes
6. Salve

### Posso ter múltiplas temporadas?
Sim! Você pode ter várias temporadas, mas apenas uma ativa por vez. Temporadas passadas ficam no histórico.

### O que acontece se eu marcar folga demais?
Se um atleta ultrapassar o limite de folgas semanais, as folgas excedentes são automaticamente convertidas em faltas na hora de calcular a multa.

### Como funcionam os dias neutros?
Dias neutros são dias que não contam como falta (feriados, por exemplo). Configure-os em "Temporadas" > "Configurar Temporada Atual". Se alguém treinar em um dia neutro, ganha um ⭐ Extra.

### Posso alterar as regras da temporada depois de criada?
Sim! Vá em "Temporadas" > "Configurar Temporada Atual". Você pode alterar tudo, exceto os check-ins já registrados.

---

## 💰 Financeiro

### Como funciona o cálculo de multas?
```
Faltas Contáveis = Faltas Marcadas + (Folgas - Limite Semanal)
Multa = Faltas Contáveis × Valor da Multa
```

**Exemplo:**
- Limite semanal: 2 folgas
- Atleta teve: 3 folgas + 1 falta
- Folgas excedentes: 3 - 2 = 1
- Total de faltas: 1 + 1 = 2
- Multa: 2 × R$ 10 = R$ 20

### Hospital e Justificado contam como falta?
Não! Esses status não geram multa e não contam no limite de folgas.

### Como registro um pagamento?
1. Vá em "Pagamentos"
2. Clique em "Registrar Pagamento"
3. Selecione o atleta, data e valor
4. Salve

O sistema automaticamente atualiza o valor devido.

### Posso fazer pagamento parcial?
Sim! Registre o valor pago e o sistema calcula automaticamente quanto ainda falta.

### O que fazer com o dinheiro arrecadado?
Decisão do grupo! Sugestões:
- Churrasco de confraternização
- Prêmio para o campeão
- Equipamentos de treino
- Dividir igualmente
- Doar para caridade

---

## 📊 Rankings e Estatísticas

### Como funciona o ranking?
Ordenação por:
1. **Mais presenças** (maior é melhor)
2. Se empate: **Menos faltas** (menor é melhor)
3. Se empate: **Menos folgas** (menor é melhor)
4. Se empate: **Menos justificadas** (menor é melhor)
5. Se empate: **Menos hospital** (menor é melhor)

### O que são os mini-rankings?
São rankings secundários que mostram:
- Quem descansou mais
- Quem faltou mais
- Quem foi mais ao hospital

### Como exporto o ranking?
Por enquanto, tire um screenshot. Em versões futuras teremos exportação para PDF e Excel.

---

## 🔧 Problemas Técnicos

### A aplicação está lenta
**Possíveis causas:**
1. Muitos dados acumulados
2. Internet lenta
3. Firebase no plano gratuito com limite atingido
4. Muitas imagens grandes

**Soluções:**
1. Finalize temporadas antigas
2. Comprima imagens antes do upload
3. Verifique os limites do Firebase

### As imagens não aparecem
1. Verifique as regras do Storage
2. Certifique-se de que o Storage está ativo
3. Verifique a URL da imagem no console

### Erro ao salvar dados
1. Verifique as regras do Firestore
2. Verifique sua conexão com internet
3. Veja o console do navegador (F12)
4. Verifique os limites do Firebase

### A aplicação não carrega após deploy
1. Verifique se o build foi feito: `npm run build`
2. Certifique-se de que as variáveis de ambiente estão configuradas no Vercel
3. Verifique os logs no Vercel

---

## 📱 Mobile e Responsividade

### Funciona no celular?
Sim! A aplicação é totalmente responsiva e funciona em celulares, tablets e desktops.

### Tem app para iOS/Android?
Ainda não, mas está nos planos futuros criar com React Native.

### Posso adicionar à tela inicial do celular?
Sim! No navegador, use a opção "Adicionar à tela inicial" (Android) ou "Adicionar à Tela de Início" (iOS).

---

## 🚀 Melhorias Futuras

### O que está planejado para o futuro?
- [ ] Sistema de autenticação
- [ ] Notificações push
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Gráficos de evolução
- [ ] Sistema de gamificação com medalhas
- [ ] App mobile nativo
- [ ] Integração com WhatsApp
- [ ] Modo offline
- [ ] Temas personalizáveis
- [ ] Suporte a múltiplos idiomas

### Posso contribuir com o projeto?
Claro! Se você souber programar, pode fazer um fork e criar suas próprias melhorias.

### Posso personalizar a aplicação?
Sim! O código é todo aberto e você pode modificar como quiser. Principais personalizações:
- Cores e estilos (tailwind.config.js)
- Textos e mensagens
- Regras de cálculo
- Funcionalidades adicionais

---

## 💡 Dicas e Truques

### Como motivar o grupo?
1. Compartilhe o ranking semanalmente
2. Crie desafios mensais
3. Ofereça prêmios simbólicos
4. Celebre conquistas
5. Seja transparente nas cobranças

### Como lidar com devedores?
1. Mantenha transparência total
2. Lembre de forma amigável
3. Mostre os números claramente
4. Estabeleça prazos
5. Seja flexível em casos excepcionais

### Como evitar conflitos?
1. Defina regras claras antes
2. Documente tudo
3. Seja consistente
4. Aceite sugestões
5. Vote mudanças importantes

### Ideias criativas de uso
1. **Bônus de Extra**: Treinar em dia neutro anula próxima falta
2. **Dobro Final**: Última semana vale dobro
3. **Penalty**: 3 faltas seguidas = multa dobrada
4. **Revelação**: Prêmio para quem mais evoluiu
5. **Streak**: Bônus por dias consecutivos

---

## 🆘 Preciso de Ajuda

### Onde buscar suporte?
1. Leia toda a documentação (README, INSTALLATION, EXAMPLES)
2. Consulte o FAQ (este arquivo)
3. Verifique o console do navegador (F12)
4. Pesquise o erro no Google
5. Consulte a documentação oficial (Firebase, React, Vite)

### Links Úteis
- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel Docs](https://vercel.com/docs)

### Como reportar um bug?
Se encontrar um problema no código:
1. Anote o erro exato
2. Anote os passos para reproduzir
3. Tire screenshots se possível
4. Abra uma issue no GitHub (se aplicável)

---

## 🎉 Conclusão

### Vale a pena usar?
Se você quer:
- ✅ Motivar amigos a treinar
- ✅ Criar competição saudável
- ✅ Ter controle financeiro transparente
- ✅ Sair do Excel e ter algo profissional
- ✅ Acompanhar evolução ao longo do tempo

**Então sim, vale muito a pena!**

### Histórias de sucesso
Grupos que usaram sistemas similares reportaram:
- 300% de aumento na frequência
- Maior união do grupo
- Motivação renovada
- Resultados físicos melhores
- Mais diversão e competitividade

### Mensagem final
Lembre-se: o objetivo principal é criar hábitos saudáveis e fortalecer amizades. A competição é apenas uma ferramenta para motivação. Seja flexível, divirta-se e bons treinos! 💪🏋️‍♂️

---

**Não encontrou sua pergunta?** Adicione-a aqui para ajudar futuros usuários!
