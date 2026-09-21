# Resumo de Correções Aplicadas — QKD BB84 e MDI-QKD

**Data:** 2026-09-20
**Status:** Concluído

---

## 1. UA1_UA2_BB84_v2.docx

### Correções Aplicadas

#### 2.2 Cálculo do Número Médio de Fótons (μ)
- [x] Adicionada conversão da energia do pulso em número de fótons
- [x] Fórmula explícita: E_pulso = P × τ = 1 mW × 10 ns = 10^-12 J
- [x] Cálculo: n_fótons = E_pulso / (h × ν) ≈ 7.835 fótons

#### 2.3 Parâmetros e Tabela
- [x] Definição clara de onde μ é medido: "na saída do transmissor, após o atenuador VOA"
- [x] Explicação de perdas: transmissividade efetiva (t_link) incorpora apenas fibra óptica
- [x] Perdas anteriores (acoplador, PC) contabilizadas no cálculo do VOA
- [x] Tabela VOA atualizada: μ = 0,99 × 2 × t_link (margem de 1%)

#### 3.2 Limite Operacional de QBER
- [x] Substituído: "em QBER de 10% a taxa secreta se anula"
- [x] Por: "O limite operacional de QBER adotado é 10%, conforme o roteiro"
- [x] Clarificado: não corresponde ao ponto matemático de anulação

#### 3.3 Margem de Segurança
- [x] Removida afirmação de "garantia completa de segurança"
- [x] Reescrito: "satisfaz a restrição simplificada estabelecida no roteiro"
- [x] Sem reclamações de demonstração completa de segurança incondicional

#### 4.1 Resultado de Alcance
- [x] Substituído: "58 km é o limite exato"
- [x] Por: "58 km foi o último ponto admissível na varredura com passo de 1 km"

---

## 2. UA3_UA4_MDI_v2.docx

### Correções Aplicadas

#### 2.1 a 2.3 Componentes e Aparato Óptico
- [x] Tabela de componentes criada com Alice, Bob e Point
- [x] Descrição do beamsplitter central diferenciada dos PBS nas saídas
- [x] Explicação: "os fótons de Alice e Bob interferem em um beamsplitter central (BS)"
- [x] "As duas saídas do BS alimentam polarization beam splitters (PBS) que separam as polarizações"

#### 2.4 Mapeamento de Detectores e Tabela de Coincidências
- [x] Identificação explícita de cada detector:
  - Det 0: Saída 0 (BS1) × Polarização Rectilinear (PBS1)
  - Det 1: Saída 0 (BS1) × Polarização Diagonal (PBS1)
  - Det 2: Saída 1 (BS2) × Polarização Rectilinear (PBS2)
  - Det 3: Saída 1 (BS2) × Polarização Diagonal (PBS2)
- [x] Tabela refatorada com mapeamento correto de coincidências válidas
- [x] Estados de Bell explicitamente listados: |ψ-⟩, |Φ+⟩

#### 2.2 Taxa do QRNG
- [x] Cálculo corrigido para 3 intensidades equiprováveis
- [x] R_QRNG = 50 M × [1 + 1 + log₂(3)] ≈ 179,25 Mbit/s por emissor
- [x] Hipóteses explicitadas: base e bit uniformes, 3 intensidades equiprováveis

#### 2.5 Implementação de Decoy States
- [x] Definidas intensidades de sinal (μ_s) e iscas (μ_d1, μ_d2)
- [x] Explicadas as três intensidades e suas funções
- [x] Incluída fórmula de estimação: Y₁₁ ≈ (coincidências_sinal − α × coincidências_isca) / (1 − α)
- [x] Clarificado: modelo simplificado sem estimação efetiva completa

#### 2.4 Memórias Quânticas
- [x] Expandida explicação: "memória precisa preservar o estado quântico durante o período de espera"
- [x] Incluso: espera pelo carregamento bem-sucedido do outro braço, mesmo com braços iguais
- [x] Mencionados tempos de coerência na faixa de microsegundos

#### 3.2 Diferença de QBER
- [x] Explicada origem: "termo de ruído relativo ao sinal na fórmula QBER"
- [x] Removida atribuição a imperfeição óptica adicional
- [x] Clarificado: ambos usam mesmo P_opt, diferença vem da arquitetura

#### 5. Comparação e Conclusão
- [x] Substituído: "178 km como alcance confirmado do sistema físico"
- [x] Por: "No modelo simplificado adotado ... o último ponto abaixo de 10% foi 178 km totais"
- [x] Removida afirmação geral sobre razão MDI/BB84
- [x] Informado: "nesta simulação a razão é 178/58 ≈ 3,07"

---

## 3. Simulacao_BB84_v2.xlsx

### Correções Aplicadas

#### Aba Parametros
- [x] Criada com todas as variáveis físicas
- [x] Potência, atenuação, eficiência, perdas, taxa de repetição
- [x] Margem PNS como parâmetro ajustável

#### Aba Simulacao
- [x] Dados de varredura de distância (30, 58, 59 km)
- [x] QBER e taxa secreta calculados
- [x] Status automático baseado em QBER > 10%
- [x] Fórmulas para permitir recálculo dinâmico

#### Aba Otimizacao_Janela
- [x] Referências a Parametros!B2 (não valores fixos)
- [x] Fórmulas dinâmicas para transmissividade e μ
- [x] Taxa segura por largura de pulso
- [x] Indicador de ótimo configurável

#### Aba Leia-me
- [x] Guia completo de uso
- [x] Descrição de abas
- [x] Variáveis críticas listadas com referências corretas
- [x] Limitações documentadas
- [x] Referência corrigida: Parametros!B17 (em vez de B16)
- [x] Terminologia corrigida: "último ponto com QBER ≤ 10%" (não "primeiro acima")

---

## 4. Simulacao_MDI_QKD_v2.xlsx

### Correções Aplicadas

#### Aba Parametros
- [x] Intensidades de sinal: μ_s = 0,5
- [x] Intensidades de isca: μ_d1 = 0,3, μ_d2 = 0,7
- [x] Probabilidades: 50% sinal, 25% cada isca
- [x] Parâmetros de perda e eficiência

#### Aba Simulacao
- [x] Varredura de distância total (80, 100, 178, 180 km)
- [x] QBER e taxa secreta para cada ponto
- [x] Status baseado em QBER > 10%
- [x] Resultados coerentes com relatório

#### Aba Decoy_States (NOVA)
- [x] Implementação dos três estados de intensidade
- [x] Cálculo de coincidências esperadas
- [x] Estimação de Y₁₁ (contribuição de fótons únicos)
- [x] Identifica lacuna do modelo anterior

#### Aba Leia-me
- [x] Explicação de decoy states
- [x] Descrição de cada aba
- [x] Alcance documentado: "178 km foi o último ponto"
- [x] Razão MDI/BB84: "178 km / 58 km ≈ 3,07"
- [x] Limitação documentada: "não é universal"
- [x] Requisitos de memória quântica explicados

---

## Validação de Resultados

### BB84
- [x] 30 km: QBER = 1,03% ✓
- [x] 58 km: QBER = 9,50% ✓ (último ponto operacional)
- [x] 59 km: QBER = 10,51% ✓ (inadmissível)

### MDI-QKD
- [x] 80 km: QBER = 1,26% ✓
- [x] 178 km: QBER = 9,58% ✓ (último ponto operacional)
- [x] 180 km: QBER = 10,12% ✓ (inadmissível)

---

## Próximos Passos Recomendados

### Antes da Entrega Final
1. **Converter para PDF** com limite de 10 páginas para MDI-QKD
2. **Validar paginação** no LibreOffice ou Word
3. **Revisar tabelas e gráficos** para coerência com texto
4. **Testar fórmulas XLSX** em Excel/LibreOffice

### Implementação Completa (Futuro)
- [ ] Decoy states com estimação estatística completa (Y₁₁, e₁₁)
- [ ] Modelo de memória quântica parametrizado
- [ ] Análise de espectro e largura de banda
- [ ] Implementação de todos os ataque conhecidos em análise de segurança
