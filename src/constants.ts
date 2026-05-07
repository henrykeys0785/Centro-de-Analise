export const CATEGORIES = [
  "Assuntos de interesse - Rel. Gov.",
  "CPIs Vale - Pará",
  "Envio automático - CULTURA",
  "Campanha publicitária",
  "Projetos patrocinados",
  "Vale",
  "Segurança – Outros",
  "Segurança – Fatalidades",
  "Segurança - Estruturas Geotécnicas",
  "Pessoas – Outros",
  "Pessoas - Transformação cultural",
  "Pessoas – Recrutamento",
  "Pessoas – Diversidade",
  "Reparação Brumadinho – Outros",
  "Reparação Brumadinho - Desenvolvimento Econômico",
  "Reparação Brumadinho – Social",
  "Reparação Brumadinho - Meio Ambiente",
  "Reparação Brumadinho - Municípios Evacuados",
  "Reparação Brumadinho - Acordo Reparação Integral",
  "Reparação Brumadinho - Relações Legais",
  "Sustentabilidade – Outros",
  "Sustentabilidade – Patrocínio",
  "Sustentabilidade – Espaços Culturais",
  "Sustentabilidade - Meio Ambiente",
  "Pó Preto",
  "TCA Camburi",
  "Sustentabilidade - Social",
  "Fundação Vale",
  "Sustentabilidade - Balanço Vale Mais",
  "Sustentabilidade - Fundo Vale",
  "Sustentabilidade – Governança",
  "Sustentabilidade – Descarbonização",
  "Sustentabilidade - Mineração Circular",
  "Sustentabilidade - Relação com Comunidades",
  "Sustentabilidade - Comunidades Tradicionais",
  "Negócios – Outros",
  "Negócios - Relações Institucionais",
  "Negócios - Metais de Transição Energética",
  "Negócios - Mínério de Ferro",
  "Negócios – Fornecedores",
  "Negócios – Ferrovias",
  "Negócios – Portos",
  "Negócios - Controladas e coligadas",
  "Negócios – Finanças",
  "Negócios - Inovação e Tecnologia",
  "Negócios - Bolsa de Valores",
  "Reparação Mariana – Outros",
  "Reparação Mariana – Social",
  "Reparação Mariana - Relações legais",
  "Vale - Internacional",
  "Indonésia",
  "Omã",
  "Malásia",
  "Argentina",
  "Austrália",
  "Canadá",
  "China",
  "Nova Caledônia",
  "Moçambique",
  "Corporativo - Vale",
  "Recursos Humanos - Vale",
  "Mineração - Vale",
  "Logística - Vale",
  "Desenvolvimento Social - Vale",
  "Saúde e Segurança - Vale",
  "Meio Ambiente - Vale",
  "Finanças - Vale",
  "Sustentabilidade - Vale",
  "Inovação e Tecnologia - Vale",
  "Energia - Vale",
  "Reassentamento - Vale",
  "Meio Ambiente",
  "Concessionárias",
  "Sociedade",
  "Economia",
  "Política",
  "Anúncios Vale (impresso)",
  "Samarco (sem Vale)",
  "Concorrentes",
  "BHP",
  "Rio Tinto",
  "Fortescue Metals Group",
  "Anglo American",
  "Setor",
  "Setor Controladas e Coligadas",
  "Setor Patrocínios Culturais",
  "Setor Finanças",
  "Setor Mineração",
  "Setor Siderurgia",
  "Setor Energia",
  "Setor Logística",
  "Setor Fertilizantes",
  "Setor Inovação e Tecnologia",
  "Setor Sustentabilidade",
  "CPIs",
  "Senado Federal",
  "Câmara dos Deputados",
  "Assembleia Legislativa de MG",
  "Câmara de Vereadores de BH",
  "Assembleia Legislativa do ES",
  "Câmara de Vereadores de Parauapebas",
  "Outros - Colunistas",
  "Outros - 1ª página",
  "Renovação das concessões ferroviárias",
  "Arquivo",
  "Reparação - Obras e Infraestrutura",
  "Sustentabilidade - Samarco / Renova",
  "Negócios - Carvão",
  "Barragens",
  "Abrace Brumadinho",
  "Negócios - Ativos de energia",
  "Projetos de Capital",
  "Energia/Siderurgia/Participações",
  "Samarco (com Vale)",
  "Recursos Humanos",
  "Relação com Governos/Regulação",
  "Institucional",
  "Vale Corporativo",
  "Vale Mineração",
  "Vale Siderurgia",
  "Vale Energia",
  "Vale Logística",
  "Vale Fertilizantes",
  "Vale Inovação & Tecnologia",
  "Vale Sustentabilidade"
];

export const CLASSIFICATION_MANUAL = `
Manual de Classificação Vale AI Insight Hub:

1. Segurança – Outros: Saúde, casos/problemas segurança Vale (não trabalhadores), projetos segurança.
2. Segurança – Fatalidades: Fatalidades ou acidentes com funcionários.
3. Segurança - Estruturas Geotécnicas: Segurança barragens (não Brumadinho focado), fiscalização, simulados.
4. Pessoas: Recrutamento, Diversidade (Mulheres na mineração), Transformação Cultural.
5. Reparação Brumadinho: Desenvolvimento Econômico (turismo), Social (vítimas), Meio Ambiente (rio Paraopeba), Municípios Evacuados (Barão de Cocais, etc), Acordo Reparação, Relações Legais (multas, CFEM).
6. Sustentabilidade: Patrocínio (Cultura Vale), Espaços Culturais (Memorial), Meio Ambiente (Pó Preto Vitória), Social (Fundação Vale), Governança (ESG), Descarbonização (Sol do Cerrado), Mineração Circular, Comunidades.
7. Negócios: Institucional (Ibram, impostos), Metais de Transição (Níquel/Cobre), Minério de Ferro (preço, S11D), Fornecedores, Ferrovias (VLI citando Carajás/Vitória-Minas), Portos, Controladas, Finanças (Ebitda), Inovação (ITV).
8. Reparação Mariana: Social, Relações Legais (Acordo judicial).

Regras Específicas:
- Ibram -> Negócios – Relações Institucionais.
- Reuters Internacional -> Categoria específica se houver, ou Negócios.
- Julgamento Brumadinho -> Reparação Brumadinho – Relações Legais.
- VLI citando ferrovia Vale -> Negócios – Ferrovias.
- Maranhão/Produtores rurais -> Sustentabilidade - Relação com Comunidades.
- Campanha publicitária -> Negócios – Outros.
- Lei incentivo esporte -> Sustentabilidade - Social + Fundação Vale.
- Manutenções preventivas -> Sustentabilidade - Relação com Comunidades (Positivo).
- Itabira (não relacionado a Brumadinho) -> Categoria específica da cidade/negócio.
- Memorial Brumadinho -> Reparação Brumadinho – Social (Positivo).
- Balanço de produção -> Negócios - Mínério de Ferro (não Finanças).

Sentimentos: "Positivo" ou "Negativo" (NÃO EXISTE NEUTRO).
Se a matéria não se encaixar em NENHUMA categoria, deve ser marcada como 'rejected'.
`;
