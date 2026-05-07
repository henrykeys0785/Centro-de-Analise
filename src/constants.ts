export const CATEGORIES = [
  "Segurança - Outros",
  "Segurança - Fatalidades",
  "Segurança - Estruturas Geotécnicas",
  "Pessoas - Outros",
  "Pessoas - Transformação Cultural",
  "Pessoas - Recrutamento",
  "Pessoas - Diversidade",
  "Reparação - Outros",
  "Reparação - Desenvolvimento Econômico",
  "Reparação - Social",
  "Reparação - Meio Ambiente",
  "Reparação - Municípios Evacuados",
  "Reparação - Acordo Reparação Integral",
  "Reparação - Relações Legais",
  "Sustentabilidade - Outros",
  "Sustentabilidade - Patrocínio",
  "Sustentabilidade - Espaços Culturais",
  "Sustentabilidade - Meio Ambiente",
  "Sustentabilidade - Pó Preto",
  "Sustentabilidade - Relação com as Comunidades",
  "Sustentabilidade - Comunidades Tradicionais",
  "Sustentabilidade - Fundação Vale",
  "Negócios - Outros",
  "Negócios - Relações Institucionais",
  "Negócios - Metais de Transição Energética",
  "Negócios - Minério de Ferro",
  "Negócios - Fornecedores",
  "Negócios - Ferrovias",
  "Negócios - Portos",
  "Negócios - Controladas e Coligadas",
  "Negócios - Finanças",
  "Negócios - Bolsa de Valores",
  "Negócios - Governança",
  "Negócios - Descarbonização",
  "Negócios - Inovação e Tecnologia",
  "Negócios - Mineração Circular"
];

export const CLASSIFICATION_MANUAL = `
📘 Manual de Classificação de Notícias - Conta Vale

1. Módulo: SEGURANÇA
- Segurança - Outros: Acidentes sem morte, furtos/roubos (ex: cabos Carajás), incêndios com atuação da brigada.
- Segurança - Fatalidades: Apenas mortes em serviço (diretos ou terceiros). Exclui mortes fora do trabalho.
- Segurança - Estruturas Geotécnicas: Barragens, níveis de emergência, descaracterização, simulados. Inclui barragens de terceiros se o risco for genérico do setor.

2. Módulo: PESSOAS
- Pessoas - Outros: Foco em funcionários/ex-funcionários, sindicatos (Metabase), acordos trabalhistas, PLR, Aposvale, corridas/eventos.
- Pessoas - Transformação Cultural: Mudanças estruturais na forma de trabalhar (ex: Home Office).
- Pessoas - Recrutamento: Processos seletivos, vagas, estágio, aprendiz, formação.
- Pessoas - Diversidade: Mulheres ("Mineração por Elas"), LGBTQIA+, questões raciais, combate à violência doméstica, canais de assédio.

3. Módulo: REPARAÇÃO BRUMADINHO
- Reparação - Outros: Citações periféricas à tragédia (ex: bombeiro que virou candidato).
- Reparação - Desenvolvimento Econômico: Queda de arrecadação, impacto no turismo, Inhotim.
- Reparação - Social: Impacto na população (depressão/ansiedade), Memorial Brumadinho, buscas.
- Reparação - Meio Ambiente: Poluição do Rio Paraopeba, resgate/adoção de animais.
- Reparação - Municípios Evacuados: Comunidades esvaziadas por risco (Antônio Pereira, Macacos).
- Reparação - Acordo Reparação Integral: Menções ao dinheiro do acordo, obras financiadas (Rodoanel). Sentimento: Geralmente positivo.
- Reparação - Relações Legais: Justiça, indenizações, julgamentos, CPIs, réus, multas Ibama.

4. Módulo: SUSTENTABILIDADE
- Sustentabilidade - Outros: Ações de doação genéricas (EPIs na pandemia).
- Sustentabilidade - Patrocínio: Patrocínio a eventos culturais (Festivais, editais).
- Sustentabilidade - Espaços Culturais: CCVM, Museu Vale, Memorial Vale, Casa da Cultura, Parque Botânico.
- Sustentabilidade - Meio Ambiente: Licenças gerais, desmatamento, manutenção de parques (não Brumadinho).
- Sustentabilidade - Pó Preto: Poluição do ar por minério no Espírito Santo (Tubarão).
- Sustentabilidade - Relação com as Comunidades: Manutenção de água, ajuda a agricultores.
- Sustentabilidade - Comunidades Tradicionais: Indígenas (Xikrin) e Quilombolas.
- Sustentabilidade - Fundação Vale: Qualquer ação da Fundação Vale. Marcar também a categoria da ação.

5. Módulo: NEGÓCIOS
- Negócios - Outros: Categoria coringa. Privatizações anos 90, crimes sem relação com segurança.
- Negócios - Relações Institucionais: Governos, impostos, royalties, CFEM.
- Negócios - Metais de Transição Energética: Cobre e Níquel.
- Negócios - Minério de Ferro: Recordes, vendas, S11D.
- Negócios - Fornecedores: Terceirizadas, programas de capacitação.
- Negócios - Ferrovias: EFC (Carajás), EFVM (Vitória a Minas).
- Negócios - Portos: Tubarão (ES), Ponta da Madeira (MA).
- Negócios - Controladas e Coligadas: VLI, Samarco (negócios), MRN, Aliança Energia.
- Negócios - Finanças: Lucro, prejuízo, dividendos, investimentos bilionários.
- Negócios - Bolsa de Valores: Exclusivamente cotação (Ibovespa).
- Negócios - Governança: ESG, Conselho, AGO/AGE, trocas de CEO.
- Negócios - Descarbonização: Metas carbono, diesel sustentável, caminhões elétricos.
- Negócios - Inovação e Tecnologia: ITV, startups, digitalização, autônomos, robôs.
- Negócios - Mineração Circular: Rejeito em outros produtos (areia, asfalto).

📌 Passo a Passo de Rotina (Dica de Alertas)
- Jornal "O Dia" (RJ):
  - /mangaratiba ou /itaguai -> APROVAR (Enviar Alerta).
  - Outras cidades (ex: /teresopolis) -> DESCARTAR (Não enviar).
`;
