export interface RecaidaData {
  id: string;
  user_id: string;
  datetime: string;
  tipo: 'pornografia' | 'masturbação' | 'sexo_casual' | 'outro';
  dias_limpo: number;
  periodo: 'manhã' | 'tarde' | 'noite' | 'madrugada';
  dia_semana: string;
  local: 'casa' | 'trabalho' | 'público' | 'outro';
  gatilhos_externos: string[];
  gatilhos_internos: string[];
  emoc_before: string[];
  emoc_after: string[];
  urgencia: number; // 0-10
  sono: number; // 0-10
  cansaco: number; // 0-10
  estresse: number; // 0-10
  motivacao: number; // 0-10
  prevencao: string;
  aprendizado: string;
  acoes: string[];
  acoes_outras: string;
  lembrete: boolean;
  tipo_lembrete: 'push' | 'email' | 'sms' | '';
  texto_livre: string;
  created_at: string;
  updated_at: string;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: {
    labels: string[];
    datasets: Array<{
      label?: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string | string[];
    }>;
  };
}

export interface AnalysisInsight {
  title: string;
  description: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
}