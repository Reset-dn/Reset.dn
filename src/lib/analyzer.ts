import { RecaidaData, ChartData, AnalysisInsight } from './types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class DataAnalyzer {
  private data: RecaidaData[];

  constructor(data: RecaidaData[]) {
    this.data = data;
  }

  // Gráfico de linha: Evolução dos dias limpos
  getDiasLimposChart(): ChartData {
    const sortedData = [...this.data].sort((a, b) => 
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

    return {
      type: 'line',
      data: {
        labels: sortedData.map(item => format(parseISO(item.datetime), 'dd/MM', { locale: ptBR })),
        datasets: [{
          label: 'Dias Limpos Antes da Recaída',
          data: sortedData.map(item => item.dias_limpo),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76,175,80,0.2)'
        }]
      }
    };
  }

  // Gráfico de barras: Períodos do dia
  getPeriodosChart(): ChartData {
    const periodos = ['manhã', 'tarde', 'noite', 'madrugada'];
    const counts = periodos.map(periodo => 
      this.data.filter(item => item.periodo === periodo).length
    );

    return {
      type: 'bar',
      data: {
        labels: periodos,
        datasets: [{
          label: 'Ocorrências',
          data: counts,
          backgroundColor: ['#36A2EB', '#FFCE56', '#4CAF50', '#FF6384']
        }]
      }
    };
  }

  // Gráfico de pizza: Emoções antes
  getEmocoesAntesChart(): ChartData {
    const emocoes = this.data.flatMap(item => item.emoc_before);
    const emocoesCount = emocoes.reduce((acc, emocao) => {
      acc[emocao] = (acc[emocao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(emocoesCount);
    const data = Object.values(emocoesCount);

    return {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
      }
    };
  }

  // Gráfico de rosca: Emoções depois
  getEmocoesDepoisChart(): ChartData {
    const emocoes = this.data.flatMap(item => item.emoc_after);
    const emocoesCount = emocoes.reduce((acc, emocao) => {
      acc[emocao] = (acc[emocao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(emocoesCount);
    const data = Object.values(emocoesCount);

    return {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#FF9F40', '#9966FF', '#FF6384', '#4BC0C0', '#36A2EB', '#FFCE56']
        }]
      }
    };
  }

  // Gráfico de barras: Gatilhos mais comuns
  getGatilhosChart(): ChartData {
    const todosGatilhos = [
      ...this.data.flatMap(item => item.gatilhos_externos),
      ...this.data.flatMap(item => item.gatilhos_internos)
    ];

    const gatilhosCount = todosGatilhos.reduce((acc, gatilho) => {
      acc[gatilho] = (acc[gatilho] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Pegar os 8 gatilhos mais comuns
    const sortedGatilhos = Object.entries(gatilhosCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    return {
      type: 'bar',
      data: {
        labels: sortedGatilhos.map(([gatilho]) => gatilho),
        datasets: [{
          label: 'Frequência',
          data: sortedGatilhos.map(([, count]) => count),
          backgroundColor: '#FF6384'
        }]
      }
    };
  }

  // Gráfico de barras: Correlação sono vs urgência
  getSonoUrgenciaChart(): ChartData {
    const avgUrgenciaBySono = this.data.reduce((acc, item) => {
      const sonoRange = Math.floor(item.sono / 2) * 2; // Agrupa em faixas de 2
      if (!acc[sonoRange]) {
        acc[sonoRange] = { total: 0, count: 0 };
      }
      acc[sonoRange].total += item.urgencia;
      acc[sonoRange].count += 1;
      return acc;
    }, {} as Record<number, { total: number; count: number }>);

    const labels = Object.keys(avgUrgenciaBySono).map(key => `${key}-${parseInt(key) + 1}`);
    const data = Object.values(avgUrgenciaBySono).map(({ total, count }) => total / count);

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Urgência Média',
          data,
          backgroundColor: '#9966FF'
        }]
      }
    };
  }

  // Análise de insights
  generateInsights(): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];

    // Análise de períodos críticos
    const periodosCounts = this.data.reduce((acc, item) => {
      acc[item.periodo] = (acc[item.periodo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const periodoMaisComum = Object.entries(periodosCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (periodoMaisComum) {
      insights.push({
        title: 'Período Crítico Identificado',
        description: `${periodoMaisComum[1]} recaídas ocorreram durante a ${periodoMaisComum[0]}`,
        recommendation: `Crie uma rotina específica para o período da ${periodoMaisComum[0]} com atividades preventivas`,
        severity: 'high'
      });
    }

    // Análise de gatilhos
    const todosGatilhos = [
      ...this.data.flatMap(item => item.gatilhos_externos),
      ...this.data.flatMap(item => item.gatilhos_internos)
    ];

    const gatilhoMaisComum = todosGatilhos.reduce((acc, gatilho) => {
      acc[gatilho] = (acc[gatilho] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const principalGatilho = Object.entries(gatilhoMaisComum)
      .sort(([,a], [,b]) => b - a)[0];

    if (principalGatilho) {
      insights.push({
        title: 'Gatilho Principal Detectado',
        description: `"${principalGatilho[0]}" aparece em ${principalGatilho[1]} recaídas`,
        recommendation: this.getRecommendationForTrigger(principalGatilho[0]),
        severity: 'high'
      });
    }

    // Análise de correlação sono-urgência
    const avgSono = this.data.reduce((sum, item) => sum + item.sono, 0) / this.data.length;
    const avgUrgencia = this.data.reduce((sum, item) => sum + item.urgencia, 0) / this.data.length;

    if (avgSono < 5 && avgUrgencia > 6) {
      insights.push({
        title: 'Correlação Sono-Urgência',
        description: `Sono médio baixo (${avgSono.toFixed(1)}) correlacionado com alta urgência (${avgUrgencia.toFixed(1)})`,
        recommendation: 'Priorize higiene do sono: durma 7-8h, evite telas 1h antes de dormir',
        severity: 'medium'
      });
    }

    // Análise de progresso
    if (this.data.length >= 2) {
      const sortedData = [...this.data].sort((a, b) => 
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );
      
      const primeiraDiasLimpo = sortedData[0].dias_limpo;
      const ultimaDiasLimpo = sortedData[sortedData.length - 1].dias_limpo;

      if (ultimaDiasLimpo > primeiraDiasLimpo) {
        insights.push({
          title: 'Progresso Positivo',
          description: `Aumento de ${primeiraDiasLimpo} para ${ultimaDiasLimpo} dias limpos`,
          recommendation: 'Continue com as estratégias atuais, você está no caminho certo!',
          severity: 'low'
        });
      }
    }

    return insights;
  }

  private getRecommendationForTrigger(gatilho: string): string {
    const recommendations: Record<string, string> = {
      'tédio': 'Mantenha uma lista de atividades prontas: exercício, hobby, contato social',
      'solidão': 'Conecte-se com sua rede de apoio: mentor, amigos, grupos de apoio',
      'ansiedade': 'Pratique técnicas de relaxamento: respiração profunda, meditação',
      'redes_sociais': 'Use bloqueadores de conteúdo e limite tempo nas redes sociais',
      'estresse': 'Implemente técnicas de gestão de estresse: exercício, meditação',
      'tristeza': 'Busque atividades que elevem o humor: música, exercício, natureza'
    };

    return recommendations[gatilho.toLowerCase()] || 'Identifique padrões e crie estratégias específicas para este gatilho';
  }

  // Dados de exemplo baseados no esquema fornecido
  static getSampleData(): RecaidaData[] {
    return [
      {
        id: "1",
        user_id: "u123",
        datetime: "2025-01-01T22:00:00Z",
        tipo: "pornografia",
        dias_limpo: 14,
        periodo: "noite",
        dia_semana: "quarta",
        local: "casa",
        gatilhos_externos: ["redes_sociais", "tédio"],
        gatilhos_internos: ["ansiedade"],
        emoc_before: ["ansioso"],
        emoc_after: ["arrependido", "envergonhado"],
        urgencia: 8,
        sono: 5,
        cansaco: 6,
        estresse: 7,
        motivacao: 9,
        prevencao: "sair do quarto e fazer exercícios",
        aprendizado: "entendi que ficar no celular à noite me expõe a gatilhos",
        acoes: ["meditacao", "exercicio"],
        acoes_outras: "",
        lembrete: true,
        tipo_lembrete: "push",
        texto_livre: "",
        created_at: "2025-01-01T22:05:00Z",
        updated_at: "2025-01-01T22:05:00Z"
      },
      {
        id: "2",
        user_id: "u123",
        datetime: "2025-01-10T23:00:00Z",
        tipo: "masturbação",
        dias_limpo: 9,
        periodo: "madrugada",
        dia_semana: "sexta",
        local: "casa",
        gatilhos_externos: ["solidão"],
        gatilhos_internos: ["tristeza"],
        emoc_before: ["triste"],
        emoc_after: ["culpado"],
        urgencia: 9,
        sono: 4,
        cansaco: 8,
        estresse: 6,
        motivacao: 7,
        prevencao: "ligar para um amigo ou mentor",
        aprendizado: "percebi que o isolamento aumenta minhas chances de recaída",
        acoes: ["contatar_mentor"],
        acoes_outras: "",
        lembrete: false,
        tipo_lembrete: "",
        texto_livre: "",
        created_at: "2025-01-10T23:10:00Z",
        updated_at: "2025-01-10T23:10:00Z"
      },
      {
        id: "3",
        user_id: "u123",
        datetime: "2025-01-20T15:30:00Z",
        tipo: "pornografia",
        dias_limpo: 10,
        periodo: "tarde",
        dia_semana: "segunda",
        local: "trabalho",
        gatilhos_externos: ["estresse", "redes_sociais"],
        gatilhos_internos: ["ansiedade", "frustração"],
        emoc_before: ["estressado", "frustrado"],
        emoc_after: ["envergonhado", "arrependido"],
        urgencia: 7,
        sono: 6,
        cansaco: 7,
        estresse: 9,
        motivacao: 8,
        prevencao: "fazer uma pausa e sair para caminhar",
        aprendizado: "estresse no trabalho é um gatilho forte para mim",
        acoes: ["exercicio", "meditacao", "evitar_redes"],
        acoes_outras: "conversar com supervisor sobre carga de trabalho",
        lembrete: true,
        tipo_lembrete: "push",
        texto_livre: "dia muito difícil no trabalho, muita pressão",
        created_at: "2025-01-20T15:35:00Z",
        updated_at: "2025-01-20T15:35:00Z"
      },
      {
        id: "4",
        user_id: "u123",
        datetime: "2025-01-28T08:15:00Z",
        tipo: "masturbação",
        dias_limpo: 8,
        periodo: "manhã",
        dia_semana: "domingo",
        local: "casa",
        gatilhos_externos: ["tédio", "fim_de_semana"],
        gatilhos_internos: ["baixa_autoestima"],
        emoc_before: ["entediado", "desmotivado"],
        emoc_after: ["culpado", "triste"],
        urgencia: 6,
        sono: 7,
        cansaco: 4,
        estresse: 5,
        motivacao: 6,
        prevencao: "ter atividades planejadas para o fim de semana",
        aprendizado: "fins de semana sem estrutura são perigosos",
        acoes: ["exercicio", "sair_de_casa", "contatar_amigos"],
        acoes_outras: "planejar atividades para próximos fins de semana",
        lembrete: true,
        tipo_lembrete: "email",
        texto_livre: "preciso estruturar melhor meus fins de semana",
        created_at: "2025-01-28T08:20:00Z",
        updated_at: "2025-01-28T08:20:00Z"
      }
    ];
  }
}