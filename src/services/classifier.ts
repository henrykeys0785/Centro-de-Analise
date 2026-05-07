import { CATEGORIES } from '../constants';

export type Sentiment = 'Positivo' | 'Negativo';

export interface ClassificationResult {
  category: string;
  sentiment: Sentiment;
  explanation: string;
  isRejected: boolean;
}

const KEYWORDS_MAP: Record<string, string[]> = {
  "Segurança - Outros": ["acidente de trabalho", "furto", "roubo", "cabo de cobre", "ferrovia carajás", "incêndio", "brigada", "segurança do trabalho", "atropelamento", "ferrovia"],
  "Segurança - Fatalidades": ["morte", "vítima fatal", "faleceu", "óbito", "fatalidade", "acidente fatal"],
  "Segurança - Estruturas Geotécnicas": ["barragem", "geotécnica", "rompimento", "emergência", "esvaziamento", "simulado de evacuação", "descaracterização", "mar de lama nunca mais", "lei mar de lama"],
  "Pessoas - Outros": ["metabase", "sindicato", "acordo trabalhista", "plr", "participação nos lucros", "aposvale", "eliezer batista", "ex-funcionário", "rh", "recursos humanos"],
  "Pessoas - Transformação Cultural": ["home office", "trabalho remoto", "cultura organizacional", "transformação cultural"],
  "Pessoas - Recrutamento": ["processo seletivo", "vagas de emprego", "estágio", "jovem aprendiz", "formação profissional", "contratando", "trainee", "seleção de candidatos"],
  "Pessoas - Diversidade": ["mineração por elas", "lgbtq", "diversidade", "violência doméstica", "canal de denúncia", "assédio", "racial", "equidade de gênero", "mulheres na mineração"],
  "Reparação - Outros": ["brumadinho", "tragédia", "exemplo de brito"],
  "Reparação - Desenvolvimento Econômico": ["inhotim", "turismo brumadinho", "arrecadação brumadinho", "queda de receita brumadinho", "céu de montanhas"],
  "Reparação - Social": ["memorial brumadinho", "ansiedade brumadinho", "depressão brumadinho", "saúde mental brumadinho", "buscas por vítimas brumadinho", "resgate de animais brumadinho"],
  "Reparação - Meio Ambiente": ["rio paraopeba", "resgate de animais brumadinho", "lama brumadinho", "contaminado brumadinho", "rejeito de minério brumadinho"],
  "Reparação - Municípios Evacuados": ["antônio pereira", "ouro preto", "macacos", "comunidade evacuada", "barão de cocais", "nova lima", "saída de casa"],
  "Reparação - Acordo Reparação Integral": ["rodoanel", "obras contra enchentes", "dinheiro do acordo", "reparação integral", "acordo judicial"],
  "Reparação - Relações Legais": ["indenização brumadinho", "julgamento brumadinho", "cpi brumadinho", "réu brumadinho", "multa ibama brumadinho", "cfem brumadinho"],
  "Sustentabilidade - Outros": ["doação", "epas", "combate ao coronavírus", "testes rápidos", "hospital de campanha"],
  "Sustentabilidade - Patrocínio": ["patrocínio", "festival de cinema", "edital de cultura", "festival", "feira", "prêmio da música", "osb", "orquestra", "círio de nazaré", "vale festejar", "instituto cultural vale"],
  "Sustentabilidade - Espaços Culturais": ["centro cultural vale", "ccvm", "museu vale", "memorial vale", "casa da cultura", "parque botânico", "memorial minas gerais", "trem turístico"],
  "Sustentabilidade - Meio Ambiente": ["licença ambiental", "desmatamento", "parque ambiental", "preservação", "mudanças climáticas", "recursos hídricos", "biodiversidade", "reserva natural vale", "zoobotânico"],
  "Sustentabilidade - Pó Preto": ["pó preto", "tubarão", "poluição do ar", "espírito santo", "tca camburi"],
  "Sustentabilidade - Relação com as Comunidades": ["agricultores", "abastecimento de água", "comunidade local", "manifestação", "direitos humanos", "usinas da paz", "escola", "praça"],
  "Sustentabilidade - Comunidades Tradicionais": ["indígena", "xikrin", "quilombola", "tribo"],
  "Sustentabilidade - Fundação Vale": ["fundação vale", "estação conhecimento", "partilhar", "ciclo saúde"],
  "Negócios - Relações Institucionais": ["royalties", "cfem", "imposto", "governo", "compensação financeira", "institucional", "ibram"],
  "Negócios - Metais de Transição Energética": ["cobre", "níquel", "transição energética", "onça puma", "nova caledônia", "indonésia", "sossego", "salobo", "metais básicos", "base metals"],
  "Negócios - Minério de Ferro": ["minério de ferro", "recorde de produção", "s11d", "preço do minério", "pelotas", "manganês", "valemax", "mbr", "simandou"],
  "Negócios - Fornecedores": ["fornecedor", "prestador de serviço", "terceirizada", "suprimentos", "disputa judicial fornecedor"],
  "Negócios - Ferrovias": ["efc", "efvm", "estrada de ferro carajás", "estrada de ferro vitória a minas", "ferrovia", "ef-118", "trem de passageiros"],
  "Negócios - Portos": ["porto de tubarão", "ponta da madeira", "porto", "complexo de tubarão", "terminal ilha guaíba", "tig", "cpbs"],
  "Negócios - Controladas e Coligadas": ["vli", "samarco", "mrn", "aliança energia", "biopalma", "aço laminado", "alpa", "csp", "usina de candonga", "ferrovia centro atlântica"],
  "Negócios - Finanças": ["lucro", "prejuízo", "dividendo", "acionista", "ebitda", "balanço", "investimento", "rating", "bndes"],
  "Negócios - Bolsa de Valores": ["cotação", "ibovespa", "ação da vale", "vale3", "bolsa", "valor de mercado"],
  "Negócios - Governança": ["esg", "conselho de administração", "conselho fiscal", "ceo", "diretoria", "assembléia", "reputação", "desinvestimento"],
  "Negócios - Descarbonização": ["diesel sustentável", "caminhão elétrico", "descarbonização", "metas de carbono", "sol do cerrado", "energia hidrelétrica", "belo monte"],
  "Negócios - Inovação e Tecnologia": ["itv", "instituto tecnológico vale", "autônomo", "robô", "digitalização", "startup", "cdm", "desenvolver", "locomotiva elétrica"],
  "Negócios - Mineração Circular": ["areia de rejeito", "mineração circular", "rejeito", "asfalto", "garrafa pet", "reaproveitamento"]
};

const POSITIVE_WORDS = [
  "lucro", "recorde", "investimento", "doação", "patrocínio", "inaugura", "contrata", "reforma",
  "estabilidade", "avanço", "sustentável", "positivo", "dobra", "cresce", "acordo", "Memorial Brumadinho",
  "parceria", "benefício", "apoio", "conquista", "sucesso"
];

const NEGATIVE_WORDS = [
  "morte", "fatalidade", "acidente", "prejuízo", "queda", "rompimento", "lama", "contaminado",
  "poluição", "pó preto", "multa", "ibama", "justiça", "réu", "cpi", "greve", "protesto",
  "ansiedade", "depressão", "roubo", "furto", "incêndio", "assédio", "denúncia", "interdição",
  "atraso", "crise", "risco", "emergência"
];

export function ruleBasedClassifier(title: string, content: string, url?: string): ClassificationResult {
  const textTitle = title.toLowerCase();
  const textContent = content.toLowerCase();
  const fullText = `${textTitle} ${textContent}`;
  
  // 1. Passo a Passo de Rotina (O Dia)
  if (url && (url.includes("odia.ig.com.br") || url.includes("odia.com.br"))) {
    const isApprovedRegion = url.includes("/mangaratiba") || url.includes("/itaguai");
    if (!isApprovedRegion) {
      return {
        category: "Negócios - Outros",
        sentiment: "Negativo",
        explanation: "Descartado automaticamente: Notícia do jornal 'O Dia' fora das regiões de Mangaratiba ou Itaguaí.",
        isRejected: true
      };
    }
  }

  // Determine Category - Prioritize Title
  let detectedCategory = "Negócios - Outros";
  let maxMatches = 0;
  let matchesTitle = false;

  for (const [category, keywords] of Object.entries(KEYWORDS_MAP)) {
    let titleMatches = 0;
    let contentMatches = 0;

    keywords.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (textTitle.includes(lowerWord)) titleMatches++;
      if (textContent.includes(lowerWord)) contentMatches++;
    });
    
    // Rule from manual: "A classificação e avaliação devem ser feitas de acordo com o foco da matéria. Quando vários assuntos são citados, vamos considerar o que está no título."
    if (titleMatches > 0) {
      if (!matchesTitle || titleMatches > maxMatches) {
        maxMatches = titleMatches;
        detectedCategory = category;
        matchesTitle = true;
      }
    } else if (!matchesTitle && contentMatches > maxMatches) {
      maxMatches = contentMatches;
      detectedCategory = category;
    }
  }

  // Rule: Fundação Vale must be flagged if mentioned
  if (fullText.includes("fundação vale")) {
    detectedCategory = "Sustentabilidade - Fundação Vale";
  }

  // Special Case: Ibram
  if (fullText.includes("ibram")) {
    detectedCategory = "Negócios - Relações Institucionais";
  }

  // Determine Sentiment
  let posMatches = 0;
  let negMatches = 0;
  
  // Prioritize sentiment based on title too
  POSITIVE_WORDS.forEach(word => {
    const lowerWord = word.toLowerCase();
    if (textTitle.includes(lowerWord)) posMatches += 2;
    if (textContent.includes(lowerWord)) posMatches += 1;
  });

  NEGATIVE_WORDS.forEach(word => {
    const lowerWord = word.toLowerCase();
    if (textTitle.includes(lowerWord)) negMatches += 2;
    if (textContent.includes(lowerWord)) negMatches += 1;
  });

  let sentiment: Sentiment = negMatches >= posMatches ? "Negativo" : "Positivo";

  // Reparação Acordo is usually positive unless "manchado de sangue"
  if (detectedCategory === "Reparação - Acordo Reparação Integral" && !fullText.includes("manchado de sangue")) {
    sentiment = "Positivo";
  }

  return {
    category: detectedCategory,
    sentiment,
    explanation: `Classificado via Manual Oficial: Prioridade ao Título (${matchesTitle ? 'Sim' : 'Não'}). Termos identificados correlacionam à categoria '${detectedCategory}'.`,
    isRejected: maxMatches === 0 && !fullText.includes("vale")
  };
}
