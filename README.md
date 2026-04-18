# Dashboard de Gestão de Qualidade - Degust PDV Delphi

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Recharts](https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge)

Um dashboard moderno e em tempo real para gestão de qualidade do **Degust PDV Delphi**, desenvolvido para transformar métricas brutas em decisões estratégicas.

Esse Dashboard é uma ferramenta **Serverless e Reativa** 📊

## ✨ O que este projeto resolve

- **Visibilidade em Tempo Real** — Adeus planilhas estáticas!
- **Gestão de Retorno (To Return DEV)** — Monitoramento preciso de issues que voltam para desenvolvimento
- **Consolidação de Dados** — Métricas por versão ou consolidadas
- **Colaboração** — Toda a equipe edita e visualiza os dados simultaneamente via Firebase
- **Destaque** — O QA que apresenta esse Dashboard, se destaca em sua Equipe de trabalho 💡

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js + Tailwind CSS
- **Gráficos**: Recharts
- **Banco de Dados**: Firebase Firestore (Realtime)
- **Criação**: Gemini + Canvas

## 🌐 Modelo de Implantação e Acesso

Diferente de aplicações tradicionais que exigem instalação local, este Dashboard foi concebido como uma **Solução Reativa via Nuvem**. 

- **Plataforma de Execução:** O dashboard opera diretamente sobre uma infraestrutura de IA Generativa (Gemini), funcionando como um "Live Artifact".
- **Persistência:** Todos os dados são sincronizados em tempo real com o **Firebase Firestore**, garantindo que, mesmo sendo acessado via link dinâmico, as informações de QA sejam mantidas e compartilhadas entre a equipe.
- **Acesso:** O acesso é realizado através de um link de visualização reativo, eliminando a necessidade de configuração de ambientes locais (Node.js, Webpack, etc.) para os usuários finais (QA's e Gestores).


## ⚙️ Como Replicar este Projeto

O código-fonte (`dashboard_qa.tsx`) ou (`dashboard_qa-1.tsx`) contido neste repositório pode ser:

1. Inserido em um ambiente que suporte **React + Tailwind**.
2. Utilizado como um script em plataformas de IA com suporte a artefatos dinâmicos.
3. Configurado para apontar para sua própria instância do Firebase.

## 📊 Como Usar o Dashboard

### Forma Rápida (Recomendada)
1. Abra um dos links acima
2. Peça para a Gemini atualizar os dados conforme sua necessidade
3. Compartilhe o link com o time

## 🔧 Como Criar o seu próprio Dashboard

### Utilizando a IA de sua preferência + Ferramenta Canvas
1. Faça download do código-fonte (`dashboard_qa.tsx`) ou (`dashboard_qa-1.tsx`)
2. Peça para a IA ou Gemini atualizar os dados conforme sua necessidade
3. Compartilhe o link com o time

## 🎲 Configuração Firebase

1. Crie um projeto no Firebase Console
2. Ative Firestore Database
3. Adicione as credenciais no arquivo ```.env```


## 💡 Funcionalidades Principais

* ✅ Cadastro e monitoramento de versões
* ✅ Acompanhamento de issues "To Return DEV"
* ✅ Gráficos de estabilidade por versão
* ✅ Filtros e consolidação de métricas
* ✅ Atualização em tempo real (Firebase)
* ✅ As apresentações Review jamais serão as mesmas com esse Dashboard 🛫
* ✅ Confiabilidade na Equipe de QA

## 💡OBSERVAÇÃO IMPORTANTE🧩

Este dashboard foi projetado sob o conceito de **Zero Infrastructure**. Ele utiliza a capacidade de processamento de IA para renderizar a interface (React) em tempo real, enquanto o **Firebase** cuida da camada de dados na nuvem. Isso permite que a equipe de QA acesse o relatório atualizado de qualquer lugar, via link, sem precisar de deploys complexos ou servidores dedicados.

## 🎥 Demonstração do Dashboard em Execução com Dados Fictícios

![Dashboard em funcionamento](Dashboard-JananaMayaraValerio.gif)


## 🔗 Versões Ativas (Gemini Canvas)
[Versão Principal](https://gemini.google.com/share/c47be9ad5208)

[Versão Inicial](https://gemini.google.com/share/1e3897c9541f)

[Versão com separação por Versões](https://gemini.google.com/share/ee3bbd85bff4)

## 🧩 Dica de milhões 
* A IA utilizada nesse projeto foi a **Gemini**
* Foi utilizado a ferramenta **Canvas** em conjunto com a Gemini
* **A IA não consegue gerar NENHUM Dashboard editáveis sem o Canvas**
* Prompt de comando precisa ser assim:
*"Crie um Dashboard editável com os dados a seguir"* E informe os dados que deseja e precisa que sejam exibidos no seu Dashboard.

## ⚙️ Como Executar Localmente

```bash
git clone https://github.com/janaina-valerio/qa-dashboard-gestao-qualidade.git
cd qa-dashboard-gestao-qualidade
npm install
cp .env.example .env
npm run dev
```


## 👤 Autora
Desenvolvido por Janaína com muito carinho e ❤️

📧: [jm.janainamayara@hotmail.com](jm.janainamayara@hotmail.com)

GitHub: [@janaina-valerio](https://github.com/janaina-valerio)
  
  
⭐ **Se este projeto te ajudou, deixe uma estrela! 💜**
