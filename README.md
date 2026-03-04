# ProMeasure - Sistema de Gestão de Obras e Engenharia

O **ProMeasure** é uma plataforma robusta e integrada para gestão 360º de obras, desde a fase de licitação até o encerramento da construção. O sistema combina inteligência de mercado, controle financeiro rigoroso e gestão de canteiro em tempo real.

---

## 🏗️ Estrutura do Sistema

O sistema é dividido em dois grandes ecossistemas: **Gestão Global (Corporativa)** e **Gestão de Obra (Workspace)**.

### 1. Gestão Global (Nível Corporativo)
Focada na visão estratégica da empresa e no suporte compartilhado entre todas as obras.

*   **Portal de Obras (Dashboard):** Visão consolidada de todos os projetos ativos, agrupados por categorias ou regiões. Permite a criação de novas obras e monitoramento de KPIs globais.
*   **Setor de Licitações:** Gestão de editais, elaboração de propostas e conversão automática de licitações vencidas em projetos operacionais.
*   **Inteligência de Suprimentos:** Central de análise de mercado com histórico de preços, catálogo consolidado de insumos e analytics de economia (saving).
*   **Estoque Central & Rastreabilidade:** Controle de pátio centralizado, gestão de requisições das obras e rastreio completo do material (da compra ao consumo final).
*   **Base de Fornecedores e Empreiteiros:** Cadastro unificado de parceiros com histórico de performance, documentos de conformidade e avaliações.
*   **Dicionário Global de Tarefas:** Padronização de processos e tags para garantir que todas as obras falem a mesma língua técnica.
*   **Centro de Soberania de Dados (Backup):** Localizado nas configurações, permite exportar e importar todo o banco de dados do sistema em arquivos criptografados `.canteiro`.

### 2. Gestão de Obra (Workspace do Engenheiro)
Ambiente dedicado à operação diária de um projeto específico, com ferramentas de controle de campo e escritório.

*   **Planilha EAP (WBS):** Gestão da Estrutura Analítica do Projeto, controle de quantidades contratuais e medições periódicas com congelamento de histórico.
*   **Canteiro Ágil (Planejamento):** Cronograma de curto prazo, previsão de insumos críticos e gestão de marcos (milestones).
*   **Fluxo Financeiro:** Gestão de despesas (materiais, mão de obra, administrativo), controle de pagamentos e fluxo de caixa da obra.
*   **Diário de Obra Digital:** Registro diário de atividades, condições climáticas, fotos de progresso e ocorrências técnicas.
*   **Estoque de Obra:** Controle de entradas e saídas no almoxarifado local, integrado às requisições do estoque central.
*   **Contratos de Mão de Obra:** Gestão de contratos de empreitada ou diária, vinculados a itens da EAP e controle de pagamentos.
*   **Checklist de Campo:** Verificação técnica de serviços executados para garantia de qualidade e liberação de medições.
*   **Repositório de Documentos:** Armazenamento de projetos, ARTs, alvarás e outros ativos críticos da obra.
*   **Quantitativos e Memória:** Detalhamento técnico de como os quantitativos foram calculados, servindo de base para auditorias.

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** React 18 com TypeScript.
*   **Estilização:** Tailwind CSS para uma interface moderna, responsiva e com suporte a Dark Mode.
*   **Animações:** Framer Motion para transições fluidas e modais imersivos.
*   **Ícones:** Lucide React.
*   **Estado:** Hook customizado `useProjectState` com persistência local e suporte a Undo/Redo.
*   **Relatórios:** Sistema de impressão customizado para geração de PDFs técnicos (EAP, Financeiro, Planejamento).

---

## 🔒 Segurança e Dados

*   **Offline-First:** O sistema opera primariamente no navegador, garantindo velocidade e disponibilidade.
*   **Privacidade:** Não há armazenamento em nuvem de terceiros por padrão; os dados pertencem ao usuário e podem ser salvos via Centro de Backup.
*   **Integridade:** Verificações de similaridade no cadastro de insumos e travas de segurança em medições encerradas.

---

## 🚀 Como Começar

1.  **Configurações:** Defina o nome da sua empresa e preferências no menu de configurações.
2.  **Fornecedores:** Cadastre seus parceiros principais para alimentar a inteligência de preços.
3.  **Nova Obra:** Crie um projeto do zero ou importe de uma licitação.
4.  **EAP:** Monte sua planilha de orçamento e comece a lançar as medições de progresso.

---
*ProMeasure v0.8 - Gestão de Engenharia de Alta Performance*
