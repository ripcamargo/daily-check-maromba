# 🎯 Exemplos de Uso - Daily Check Maromba

Este documento contém exemplos práticos de como usar a aplicação.

## 📋 Cenário de Uso Completo

### Contexto
Você tem um grupo de 5 amigos que querem se motivar a ir à academia. Vocês decidiram criar uma competição trimestral com as seguintes regras:

- **Período**: 01/01/2025 a 31/03/2025 (3 meses)
- **Multa por falta**: R$ 10,00
- **Folgas semanais permitidas**: 2 dias
- **Feriados não contam como falta**: 25/12, 01/01
- **Objetivo**: Incentivar frequência e criar competição saudável

---

## 🏃 Passo 1: Cadastrar os Atletas

### Atletas do Grupo:
1. **João Silva** - PRO (frequenta academia há 3 anos)
2. **Maria Santos** - Intermediário (frequenta há 1 ano)
3. **Pedro Costa** - Iniciante (começou recentemente)
4. **Ana Oliveira** - Intermediário
5. **Carlos Souza** - PRO

**Como fazer:**
1. Clique em "Atletas" no menu
2. Para cada pessoa, clique em "Novo Atleta"
3. Preencha nome, nível e faça upload de uma foto

---

## 🎮 Passo 2: Criar a Temporada

**Configurações:**
- **Título**: "Temporada Verão 2025"
- **Início**: 01/01/2025
- **Fim**: 31/03/2025
- **Multa**: R$ 10,00
- **Folgas semanais**: 2
- **Participantes**: Todos os 5 atletas
- **Logo**: Upload de uma imagem do grupo (opcional)

**Como fazer:**
1. Clique em "Temporadas" no menu
2. Clique em "Nova Temporada"
3. Preencha todos os campos
4. Selecione os 5 participantes
5. Clique em "Criar Temporada"

---

## ✅ Passo 3: Registrar Check-ins

### Exemplo - Semana 1 (01/01 a 07/01)

#### Segunda-feira (01/01) - Feriado
- Marque o dia 01/01 como "Dia Neutro" nas Configurações
- Alguns atletas foram treinar mesmo assim:
  - João: ⭐ Extra (foi mesmo sendo feriado)
  - Maria: ⭐ Extra
  - Pedro: - (não registrado)
  - Ana: - (não registrado)
  - Carlos: ⭐ Extra

#### Terça-feira (02/01)
- João: ✅ Presente
- Maria: ✅ Presente
- Pedro: ✅ Presente
- Ana: 🛌 Folga (estava cansada)
- Carlos: ✅ Presente

#### Quarta-feira (03/01)
- João: ✅ Presente
- Maria: 🛌 Folga (treinou ontem)
- Pedro: ❌ Falta (esqueceu)
- Ana: ✅ Presente
- Carlos: ✅ Presente

#### Quinta-feira (04/01)
- João: ✅ Presente
- Maria: ✅ Presente
- Pedro: ✅ Presente (compensou a falta)
- Ana: 🛌 Folga
- Carlos: 🏥 Hospital (machucou o joelho)

#### Sexta-feira (05/01)
- João: 🛌 Folga
- Maria: ✅ Presente
- Pedro: ❌ Falta (trabalho)
- Ana: ✅ Presente
- Carlos: 🏥 Hospital (ainda machucado)

#### Sábado (06/01)
- João: ✅ Presente
- Maria: 🛌 Folga
- Pedro: ✅ Presente
- Ana: ❌ Falta (compromisso familiar)
- Carlos: 📄 Justificado (funeral)

#### Domingo (07/01)
- João: 🛌 Folga
- Maria: ✅ Presente
- Pedro: 🛌 Folga
- Ana: 🛌 Folga
- Carlos: 📄 Justificado (ainda de luto)

---

## 📊 Resultados da Semana 1

### Ranking após 1 semana:

| Pos | Atleta | Presença | Folga | Falta | Extra |
|-----|--------|----------|-------|-------|-------|
| 🥇 | João   | 4        | 2     | 0     | 1     |
| 🥈 | Maria  | 5        | 2     | 0     | 1     |
| 🥉 | Pedro  | 4        | 1     | 2     | 0     |
| 4º  | Ana    | 3        | 3     | 1     | 0     |
| 5º  | Carlos | 2        | 0     | 0     | 1     |

### Cálculo de Multas:
- **João**: 2 folgas (dentro do limite) = R$ 0,00
- **Maria**: 2 folgas (dentro do limite) = R$ 0,00
- **Pedro**: 2 faltas = R$ 20,00 (deve pagar)
- **Ana**: 3 folgas (1 excedente) = R$ 10,00 (deve pagar)
- **Carlos**: 0 faltas (hospital e justificado não contam) = R$ 0,00

---

## 💰 Passo 4: Registrar Pagamentos

### Pedro pagou sua multa
- **Data**: 08/01/2025
- **Valor**: R$ 20,00
- **Atleta**: Pedro Costa

### Ana pagou parcial
- **Data**: 10/01/2025
- **Valor**: R$ 5,00
- **Atleta**: Ana Oliveira

**Status Financeiro:**
- Total em Caixa: R$ 25,00
- Valor Previsto: R$ 30,00
- Pendente: R$ 5,00 (Ana ainda deve R$ 5,00)

---

## 🎯 Cenários Especiais

### Cenário 1: Atleta passou do limite de folgas
**Situação**: Maria tirou 3 folgas em uma semana (limite é 2)

**Resultado**:
- As 2 primeiras folgas são válidas
- A 3ª folga é convertida em FALTA automaticamente
- Maria deve pagar R$ 10,00 de multa

**Como registrar**:
- Registre normalmente as 3 folgas no sistema
- O sistema calculará automaticamente na aba Financeiro

### Cenário 2: Dia Neutro
**Situação**: Todos concordaram que o Natal (25/12) não deve contar

**Como configurar**:
1. Vá em "Temporadas"
2. Clique em "Configurar Temporada Atual"
3. Na seção "Dias Neutros", adicione 25/12/2024
4. Salve

**Efeito**:
- Não marcar presença no dia 25/12 não gera falta
- Quem treinar no dia 25/12 e marcar presença ganha ⭐ Extra

### Cenário 3: Atleta ficou doente
**Situação**: Carlos pegou COVID e ficou 5 dias sem treinar

**Como registrar**:
- Marque os 5 dias como 🏥 Hospital
- Não haverá multa para esses dias
- Isso aparecerá no ranking separadamente

### Cenário 4: Atleta teve imprevisto sério
**Situação**: Ana teve um falecimento na família

**Como registrar**:
- Marque os dias como 📄 Justificado
- Não haverá multa
- Mostra empatia no grupo

---

## 📈 Acompanhamento Mensal

### Final do Mês 1 (Janeiro)

#### Ranking Final:
1. 🥇 João - 25 presenças, 8 folgas, 0 faltas
2. 🥈 Maria - 24 presenças, 8 folgas, 1 falta
3. 🥉 Carlos - 22 presenças, 6 folgas, 0 faltas
4. 4º Ana - 20 presenças, 10 folgas, 2 faltas
5. 5º Pedro - 18 presenças, 8 folgas, 5 faltas

#### Financeiro:
- Total Previsto: R$ 80,00
- Total Pago: R$ 60,00
- Pendente: R$ 20,00

---

## 🎨 Dicas de Uso no WhatsApp

### 1. Compartilhar Ranking Semanal
- Tire um print da tela do Dashboard
- Poste no grupo toda segunda-feira
- Adicione uma mensagem motivacional

### 2. Cobrar Devedores
- Tire print da aba Financeira
- Marque os devedores no grupo
- Lembre de forma amigável

### 3. Comemorar Conquistas
- Destaque quem completou uma semana perfeita
- Comemore quem está em 1º lugar
- Reconheça melhorias individuais

### 4. Transparência Total
- Compartilhe todas as decisões sobre dias neutros
- Explique mudanças nas regras
- Mantenha todos informados

---

## 🏆 Final da Temporada

### Ao encerrar a temporada (31/03):

1. **Finalizar Temporada**:
   - Vá em "Temporadas"
   - Clique em "Finalizar" na temporada atual
   - Isso preserva todos os dados históricos

2. **Distribuir o Caixa**:
   - Use o dinheiro arrecadado para:
     - Churrasco de confraternização
     - Prêmio para o 1º lugar
     - Equipamentos de treino
     - Dividir igualmente

3. **Criar Nova Temporada**:
   - Clique em "Nova Temporada"
   - Ajuste as regras se necessário
   - Comece tudo de novo!

4. **Histórico**:
   - Cada atleta terá seu histórico salvo
   - Podem comparar temporadas
   - Ver evolução ao longo do tempo

---

## 💡 Ideias Criativas

### Regras Customizadas:
- **Bônus de Extra**: Quem treinar em dia neutro não paga próxima falta
- **Dobro no Final**: Última semana vale em dobro
- **Desafio Mensal**: Quem completar 25 dias ganha isenção
- **Penalty**: 3 faltas seguidas = dobra a multa

### Premiações:
- **Campeão**: Jantar pago pelo grupo
- **Vice**: Suplemento à escolha
- **Revelação**: Iniciante que mais evoluiu
- **Ferro**: Maior frequência absoluta

### Penalizações Criativas:
- **Último Lugar**: Organiza o churrasco
- **Mais Faltas**: Limpa os equipamentos do grupo
- **Devedor**: Não pode reclamar por 1 semana 😄

---

## 🎉 Resultado Esperado

Após 3 meses usando o sistema:
- ✅ Frequência na academia aumentou 300%
- ✅ Grupo mais motivado e unido
- ✅ Competição saudável e divertida
- ✅ Transparência total nas cobranças
- ✅ Evolução física de todos
- ✅ Melhor gestão do que planilhas Excel

**Boa sorte na jornada fitness! 💪🏋️‍♂️**
