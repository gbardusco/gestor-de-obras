### Prompt Elaborado: Canteiro Digital – Central de Inteligência de Suprimentos (INSUMOS)

**Contexto do Sistema:**
Atue como Product Designer e Engenheiro de Software Sênior. O objetivo é projetar a visão global de **INSUMOS** para o Canteiro Digital, uma plataforma de gestão de obras de alta complexidade. Esta tela deve consolidar dados financeiros e quantitativos de todos os materiais adquiridos pela instância (Prefeitura/Empresa), servindo como ferramenta de apoio para o **Departamento de Compras** e a **Gestão Financeira**.

**Diretrizes de Design e UX:**

* **Estética:** Dashboard técnico com alta densidade de dados, utilizando **Institutional Dark Mode** e componentes `lucide-react`.
* **Modelo de Dados:** Simule a agregação de dados das entidades `ProjectExpense` (Despesas), `Supplier` (Fornecedores) e `WorkItem` (Itens de Trabalho).

---

### Estrutura da Tela: Global Suprimentos & Insumos

#### 1. Header e Filtros de Governança

* **Título:** Central de Inteligência de Suprimentos.
* **Filtros Avançados:** Filtro por período, por **Categoria de Material** (ex: Insumos Básicos, Acabamento, Elétrica), por **Fornecedor** e por **Grupo de Projetos**.

#### 2. Painel de Indicadores de Performance (Analytics)

* **Variação de Preço Médio:** Gráfico de linha comparando o preço pago em insumos críticos (Cimento, Aço, Areia) contra índices de referência (ex: SINAPI).
* **Índice de Economia (Saving):** Diferença entre o valor total orçado vs. valor real de compra em toda a instância.
* **Volume de Compras por Categoria:** Gráfico de rosca exibindo onde o orçamento está sendo mais alocado financeiramente.

#### 3. Tabela Mestra de Insumos (Market Intelligence)

Exiba uma lista consolidada de materiais com as seguintes colunas técnicas:

* **Descrição do Insumo:** Nome padronizado do material (ex: Areia Média Lavada).
* **Volume Total Adquirido:** Soma de todas as notas fiscais em todas as obras.
* **Preço Médio Global:** Média ponderada dos valores pagos pela instância.
* **Benchmark (Melhor Compra):** Exibição do menor preço unitário já obtido e em qual fornecedor/obra ele ocorreu.
* **Status de Flutuação:** Badge indicando se o preço do item subiu ou desceu em relação à última compra.

#### 4. Log de Transações e Rastreabilidade Financeira

Uma timeline detalhada para auditoria de suprimentos:

* **Dados da Transação:** Data, Número da Nota Fiscal (NF), Fornecedor e Obra de Destino.
* **Status do Ciclo de Vida:** Badge indicando o estado da despesa (`PENDING`, `PAID` ou `DELIVERED`).
* **Anexo de Comprovante:** Ícone indicando a presença de Nota Fiscal ou Comprovante de Pagamento vinculados.

#### 5. Módulo de Apoio à Decisão (Features Estratégicas)

* **Sugestão de Fornecedor:** Ao selecionar um insumo, o sistema deve destacar qual fornecedor possui o melhor histórico de preço e pontualidade na entrega para a prefeitura.
* **Alerta de Preço Excessivo:** Sinalizar visualmente (em vermelho) compras que ficaram 10% acima do preço médio histórico da instância.
* **Fila de Solicitações:** Espaço para visualizar requisições de compra urgentes vindas de obras com estoque crítico.

