'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Trophy, Target, BookOpen, Users, Heart, Calendar, Star, Flame, Shield, Brain, BarChart3, TrendingUp, AlertTriangle, RotateCcw, CheckCircle, Clock, Award, Zap, Eye, Snowflake, Moon, HandHeart, Volume2, Puzzle, Mirror, Sunrise, Crown, ChevronDown, ChevronUp, Lock, PenTool, Edit3, Bell, Plus, Trash2, Activity, Play, Pause } from 'lucide-react'

interface UserProgress {
  level: number
  points: number
  cleanDays: number
  currentStreak: number
  longestStreak: number
  challengesCompleted: number
  reflectionsCount: number
  currentDay: number
  totalDays: number
  medals: string[]
  unlockedRituals: string[]
  completedRituals: { [key: string]: number }
  isFirstTime: boolean
  unlockedEducation: string[]
}

interface DailyReflection {
  date: string
  content: string
  mood: string
}

interface RelapseData {
  date: string
  triggers: string
  feelings: string
  timeOfDay: string
  situation: string
  reflection: string
  lesson: string
}

interface Ritual {
  id: string
  name: string
  icon: string
  unlockDay: number
  points: number
  phase: string
  unlockMessage: string
  description: string
}

interface Motivation {
  id: string
  text: string
  createdAt: string
}

interface MotivationSettings {
  frequency: number // 1, 2 ou 3 dias
  lastNotification: string
  usedMotivations: string[]
  enabled: boolean // Nova propriedade para controlar se os lembretes estão ativos
}

interface DayProgressInfo {
  title: string
  description: string
  phase: string
  color: string
  bgColor: string
  borderColor: string
}

const RITUALS: Ritual[] = [
  // FASE 1 - FUNDAÇÃO (Dias 1-10)
  {
    id: 'reading',
    name: 'Leitura diária',
    icon: '📘',
    unlockDay: 1,
    points: 10,
    phase: 'Fundação',
    unlockMessage: 'O conhecimento é seu combustível. A leitura treina sua mente para buscar profundidade, não estímulo fácil.',
    description: 'Leia por pelo menos 20 minutos diariamente'
  },
  {
    id: 'exercise',
    name: 'Exercício físico',
    icon: '💪',
    unlockDay: 3,
    points: 10,
    phase: 'Fundação',
    unlockMessage: 'Seu corpo é o templo da sua disciplina. O movimento físico estabiliza a dopamina e libera força interior.',
    description: 'Pratique atividade física por 30 minutos'
  },
  {
    id: 'meditation',
    name: 'Meditação',
    icon: '🪷',
    unlockDay: 5,
    points: 15,
    phase: 'Fundação',
    unlockMessage: 'Silencie o mundo por 10 minutos. Aprenda a observar, não reagir. O autocontrole começa na respiração.',
    description: 'Medite por 10 minutos em silêncio'
  },
  {
    id: 'morning_ritual',
    name: 'Ritual matinal',
    icon: '🌤️',
    unlockDay: 9,
    points: 10,
    phase: 'Fundação',
    unlockMessage: 'Acorde com propósito. Arrume a cama, beba água e reflita sobre suas motivações. Pequenos rituais constroem grandes resultados.',
    description: 'Cumpra sua rotina matinal completa'
  },
  
  // FASE 2 - CONSOLIDAÇÃO (Dias 11-30)
  {
    id: 'mental_vigilance',
    name: 'Vigilância Mental',
    icon: '👁️',
    unlockDay: 11,
    points: 15,
    phase: 'Consolidação',
    unlockMessage: 'Observe seus gatilhos — horários, emoções, redes, tédio. Nomear o inimigo é o primeiro passo para dominá-lo.',
    description: 'Identifique e registre seus gatilhos mentais'
  },
  {
    id: 'cold_shower',
    name: 'Banho gelado',
    icon: '❄️',
    unlockDay: 21,
    points: 15,
    phase: 'Consolidação',
    unlockMessage: 'Enfrente o desconforto de frente. Cada segundo sob a água fria é uma vitória contra o instinto de fuga.',
    description: 'Tome banho frio por pelo menos 2 minutos'
  },
  {
    id: 'night_detox',
    name: 'Detox noturno',
    icon: '🌙',
    unlockDay: 31,
    points: 15,
    phase: 'Consolidação',
    unlockMessage: 'Desconecte-se 1h antes de dormir. A mente em paz recupera o controle e equilibra sua dopamina natural.',
    description: 'Desligue dispositivos 1h antes de dormir'
  },
  
  // FASE 3 - EXPANSÃO (Dias 31-60)
  {
    id: 'service_act',
    name: 'Ato de serviço',
    icon: '❤️',
    unlockDay: 41,
    points: 15,
    phase: 'Expansão',
    unlockMessage: 'Transforme energia em empatia. Faça algo por alguém, sem esperar retorno. Servir cura o ego e dá propósito.',
    description: 'Faça algo gentil por outra pessoa'
  },
  {
    id: 'voluntary_silence',
    name: 'Silêncio voluntário',
    icon: '🔕',
    unlockDay: 51,
    points: 10,
    phase: 'Expansão',
    unlockMessage: 'Fale menos, perceba mais. O silêncio te reconecta ao presente e revela o que realmente importa.',
    description: 'Pratique 30 minutos de silêncio voluntário'
  },
  {
    id: 'mental_challenge',
    name: 'Desafio mental',
    icon: '🧠',
    unlockDay: 61,
    points: 10,
    phase: 'Expansão',
    unlockMessage: 'Aprenda algo novo. Substitua curiosidade por conhecimento, e dopamina por sabedoria.',
    description: 'Aprenda algo novo por 30 minutos'
  },
  
  // FASE 4 - ASCENSÃO (Dias 61-90)
  {
    id: 'deep_reflection',
    name: 'Reflexão profunda',
    icon: '🌙',
    unlockDay: 71,
    points: 15,
    phase: 'Ascensão',
    unlockMessage: 'Revise seu diário. Veja o quanto evoluiu. Você não está apenas parando um vício — está nascendo de novo.',
    description: 'Reflita profundamente sobre sua jornada'
  },
  {
    id: 'visualization',
    name: 'Visualização',
    icon: '🌄',
    unlockDay: 81,
    points: 10,
    phase: 'Ascensão',
    unlockMessage: 'Feche os olhos e imagine seu novo eu. A mente cria primeiro, o corpo apenas segue.',
    description: 'Visualize seu futuro por 15 minutos'
  },
  {
    id: 'final_ritual',
    name: 'Ritual Final — Renascimento',
    icon: '🏆',
    unlockDay: 90,
    points: 30,
    phase: 'Ascensão',
    unlockMessage: 'Escreva: "Quem eu era e quem me tornei". Hoje você conclui o REBOOT. A liberdade agora é sua rotina.',
    description: 'Complete sua transformação final'
  }
]

const MOTIVATIONAL_QUOTES = [
  "A liberdade não é a ausência de desejo — é o domínio sobre ele.",
  "Cada dia limpo é uma vitória sobre seu eu anterior.",
  "Você não precisa lutar contra o desejo. Precisa entendê-lo.",
  "Sua força não vem de nunca cair, mas de sempre se levantar.",
  "O autocontrole é um músculo. Quanto mais você usa, mais forte fica.",
  "Toda mudança começa no momento em que você encara a verdade.",
  "Você está mais forte que ontem. Continue avançando.",
  "O fracasso só existe quando você para de tentar."
]

const DEEP_REFLECTIONS = [
  "Você está enfrentando a resistência natural do cérebro à mudança. Neuroplasticidade é um processo, não um evento instantâneo. Cada vez que você recomeça, está literalmente reescrevendo os circuitos neurais que foram formados ao longo de anos. Esta queda mostra que você está no meio de uma batalha real - uma batalha entre o velho eu e o novo eu que está emergindo. O fato de você estar aqui, registrando e refletindo, já é uma vitória em si.",
  "A recaída revela a profundidade dos padrões neurais antigos. Seu cérebro está lutando para manter os caminhos familiares, mas cada tentativa de mudança fortalece sua capacidade de resistência. Esta não é uma falha - é parte do processo de reprogramação. Você está aprendendo sobre seus gatilhos mais profundos e desenvolvendo estratégias mais eficazes.",
  "Esta queda mostra que você está enfrentando um desafio real, mas também que você não desiste. Cada queda ensina algo novo sobre seus padrões e vulnerabilidades. Você está construindo resiliência emocional e autoconhecimento. A persistência em continuar tentando é, por si só, uma transformação profunda.",
  "Esta recaída pode parecer desanimadora, mas na verdade demonstra sua determinação inabalável. Muitos desistem nas primeiras tentativas. Você está aqui, aprendendo, crescendo e se tornando mais forte a cada ciclo. Cada recaída refina sua compreensão sobre si mesmo e suas estratégias de enfrentamento.",
  "Esta jornada revela uma determinação extraordinária. Cada recaída é um capítulo na sua história de transformação, não o fim dela. Você está desenvolvendo uma compreensão profunda sobre mudança comportamental e crescimento pessoal. Esta experiência está te preparando para uma liberdade mais duradoura e consciente.",
  "Você está mapeando os territórios mais complexos da sua mente e emoções. Esta persistência em face da adversidade está forjando um caráter mais forte. Você não está falhando - está aprendendo a arte da recuperação e da resiliência.",
  "Cada tentativa de mudança é um ato de coragem. Você está desafiando padrões profundamente enraizados e isso requer uma força interior extraordinária. O processo de transformação nunca é linear - é uma espiral ascendente de crescimento e autodescoberta.",
  "Sua jornada demonstra uma compreensão madura sobre mudança real. Você entende que a transformação genuína leva tempo e paciência. Cada recomeço é uma oportunidade de aplicar o que aprendeu e se tornar mais sábio sobre si mesmo.",
  "Esta experiência está te ensinando sobre compaixão própria e perdão. Você está aprendendo que a mudança não é sobre perfeição, mas sobre persistência. Cada dia que você escolhe tentar novamente é um dia que você escolhe crescer.",
  "Você está desenvolvendo uma relação mais madura com o fracasso e o sucesso. Esta jornada está te ensinando que a verdadeira força não vem de nunca cair, mas de sempre se levantar com mais sabedoria e determinação."
]

const SELF_COMPASSION_PHRASES = [
  "Trate-se com a mesma gentileza que trataria um bom amigo passando pela mesma situação.",
  "Você é humano e merece compaixão, especialmente de si mesmo.",
  "Esta dificuldade não define quem você é - define quem você está se tornando.",
  "Seja gentil consigo mesmo. O crescimento acontece no ritmo certo para você.",
  "Você merece amor e paciência, principalmente vindos de você mesmo.",
  "Cada tentativa é um ato de coragem. Reconheça sua bravura.",
  "Fale consigo mesmo como falaria com alguém que você ama profundamente.",
  "Sua jornada é única. Não se compare com outros, honre seu próprio processo.",
  "Você está fazendo o melhor que pode com os recursos que tem agora.",
  "O amor próprio não é um luxo, é uma necessidade para sua cura e crescimento."
]

// Mensagens de parabéns para cada nova fase
const PHASE_CELEBRATION_MESSAGES = {
  'Consolidação': {
    title: '🎉 PARABÉNS! NOVA FASE DESBLOQUEADA! 🎉',
    subtitle: '💪 FASE: CONSOLIDAÇÃO',
    message: 'Você superou os primeiros 10 dias e provou que tem força interior! Agora é hora de consolidar seus novos hábitos e fortalecer sua disciplina. Os próximos 20 dias vão testar sua determinação, mas você já mostrou que é capaz de vencer!',
    motivation: 'Você não é mais a mesma pessoa que começou essa jornada. Continue firme - a liberdade está cada vez mais próxima! 🔥'
  },
  'Expansão': {
    title: '🌟 INCRÍVEL! VOCÊ ALCANÇOU UMA NOVA FASE! 🌟',
    subtitle: '🌱 FASE: EXPANSÃO',
    message: 'Você completou 30 dias de transformação! Sua mente está mais clara, sua disciplina mais forte. Agora é hora de expandir seus horizontes e descobrir todo o seu potencial. Os próximos 30 dias vão revelar quem você realmente pode se tornar!',
    motivation: 'Você está florescendo! Cada dia que passa, você se torna mais livre, mais forte, mais você mesmo. Continue crescendo! 🚀'
  },
  'Ascensão': {
    title: '👑 EXTRAORDINÁRIO! VOCÊ ATINGIU O NÍVEL MÁXIMO! 👑',
    subtitle: '🏔️ FASE: ASCENSÃO',
    message: 'Você completou 60 dias de pura determinação! Você não é mais quem era - você se transformou em um guerreiro da autodisciplina. Agora, nos últimos 30 dias, você vai consolidar sua ascensão e se tornar a melhor versão de si mesmo!',
    motivation: 'Você é um exemplo de força e determinação! Estes últimos dias vão coroar sua jornada de libertação. Você já venceu - agora é só celebrar sua vitória! ⚡'
  }
}

// Informações detalhadas para cada faixa de dias
const DAY_PROGRESS_INFO: { [key: string]: DayProgressInfo } = {
  '0': {
    title: 'Dia 0 — O Ponto de Partida',
    description: 'Você decidiu mudar. Esse é o momento mais importante da jornada. Seu cérebro ainda está condicionado aos estímulos artificiais. O desafio começa agora: reaprender a sentir prazer com a vida real.',
    phase: 'Início',
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/30',
    borderColor: 'border-gray-500/30'
  },
  '1-3': {
    title: 'Dias 1-3 — Desintoxicação Inicial',
    description: 'A dopamina ainda está desregulada. Você pode sentir ansiedade, irritação e falta de energia. Isso é esperado. Seu cérebro está reagindo à ausência do estímulo. 💡 Dica: mantenha-se ocupado. Hidrate-se, durma bem e evite telas desnecessárias.',
    phase: 'Fundação',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-500/30'
  },
  '4-7': {
    title: 'Dias 4-7 — Desconforto e Tentação',
    description: 'O sistema de recompensa está confuso. Seu cérebro quer o "pico fácil". Esses dias costumam trazer pensamentos intrusivos e vontade forte de recaída. Mas cada vez que você resiste, uma nova conexão neural começa a se fortalecer. 🔒 Você está treinando autocontrole real.',
    phase: 'Fundação',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
    borderColor: 'border-orange-500/30'
  },
  '8-14': {
    title: 'Dias 8-14 — Início da Clareza Mental',
    description: 'A névoa começa a dissipar. A concentração melhora e as emoções ficam mais estáveis. Seu cérebro está ajustando os níveis de dopamina. 🧠 As conexões ligadas à disciplina estão se reforçando — você começa a recuperar o senso de direção.',
    phase: 'Consolidação',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
    borderColor: 'border-yellow-500/30'
  },
  '15-21': {
    title: 'Dias 15-21 — Retomada da Energia',
    description: 'O corpo e a mente entram em equilíbrio. Você sente mais disposição, melhora no sono e mais motivação. ⚙️ A neuroplasticidade está ativa: seu cérebro está literalmente se reorganizando.',
    phase: 'Consolidação',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
    borderColor: 'border-green-500/30'
  },
  '22-30': {
    title: 'Dias 22-30 — Primeira Fase de Reprogramação',
    description: 'O comportamento automático começa a perder força. A vontade ainda aparece, mas agora você a observa com distância. Isso é um sinal de que o vício está deixando de controlar suas decisões. 🌱 A liberdade começa a criar raízes.',
    phase: 'Consolidação',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/30',
    borderColor: 'border-emerald-500/30'
  },
  '31-45': {
    title: 'Dias 31-45 — Estabilização',
    description: 'Seu cérebro está aprendendo novos padrões de prazer e recompensa. Você percebe alegria em coisas simples, foco maior e menor ansiedade. 🔁 Agora, a manutenção é essencial: continue com hábitos saudáveis e evite gatilhos.',
    phase: 'Expansão',
    color: 'text-teal-400',
    bgColor: 'bg-teal-900/30',
    borderColor: 'border-teal-500/30'
  },
  '46-60': {
    title: 'Dias 46-60 — Consolidação Neural',
    description: 'As redes neurais antigas estão se enfraquecendo. A dopamina volta a responder a estímulos naturais — exercício, socialização, propósito. 💪 Sua mente está mais estável, suas emoções mais controladas. Você começa a perceber: a liberdade é real.',
    phase: 'Expansão',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/30',
    borderColor: 'border-cyan-500/30'
  },
  '61-75': {
    title: 'Dias 61-75 — Fase de Poder Pessoal',
    description: 'A mente está mais clara. A autoconfiança cresce. O impulso de recaída ainda pode surgir, mas agora você o encara com maturidade. 🌞 Você não foge mais do desconforto — você o domina. O cérebro está mais resistente ao vício.',
    phase: 'Ascensão',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-500/30'
  },
  '76-89': {
    title: 'Dias 76-89 — Reprogramação Profunda',
    description: 'A neuroplasticidade está consolidada. Seu sistema de recompensa opera de forma natural. Você sente prazer em viver, não em se esconder. 🔥 Seu novo padrão está sendo selado: disciplina, foco e controle emocional.',
    phase: 'Ascensão',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-900/30',
    borderColor: 'border-indigo-500/30'
  },
  '90': {
    title: 'Dia 90 — Liberdade Real',
    description: 'Você venceu o ciclo. Seu cérebro se reconfigurou. A dopamina voltou ao equilíbrio, e sua identidade foi reconstruída. 🌎 Agora você não é alguém tentando parar — você é alguém livre. Continue. Transforme 90 dias em um novo estilo de vida.',
    phase: 'Vitória',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    borderColor: 'border-purple-500/30'
  }
}

// Textos reflexivos para a tela de crise
const CRISIS_REFLECTIONS = [
  "Você está lutando pela liberdade. Cada crise vencida é um treino de autocontrole.",
  "Esta vontade é temporária. Sua força é permanente. Respire e deixe passar.",
  "Você já superou 100% das suas crises anteriores. Esta não será diferente.",
  "O desconforto que você sente agora é o preço da sua liberdade amanhã.",
  "Cada 'não' que você diz ao impulso é um 'sim' à pessoa que você quer se tornar.",
  "A tentação é forte, mas sua determinação é mais forte. Você já provou isso antes.",
  "Este momento difícil é temporário. Sua transformação é permanente.",
  "Você não está fugindo de algo - está correndo em direção à sua melhor versão.",
  "A dor de resistir hoje é menor que a dor de se arrepender amanhã.",
  "Cada crise superada adiciona uma camada de força à sua armadura mental."
]

// Exercícios rápidos de alta intensidade - SEQUÊNCIA CORRIGIDA
const QUICK_EXERCISES = [
  {
    id: 1,
    name: "Polichinelos",
    duration: "60 segundos",
    description: "Pule abrindo pernas e braços simultaneamente, depois feche. Movimento completo que acelera o coração."
  },
  {
    id: 2,
    name: "Flexões",
    duration: "60 segundos", 
    description: "Posição de prancha, desça o peito até o chão e suba. Se for difícil, apoie os joelhos."
  },
  {
    id: 3,
    name: "Agachamentos",
    duration: "60 segundos",
    description: "Desça como se fosse sentar numa cadeira, mantenha o peito ereto e suba explosivamente."
  },
  {
    id: 4,
    name: "Corrida Estacionária",
    duration: "60 segundos",
    description: "Corrida no lugar elevando os joelhos até a altura do quadril, mantendo ritmo acelerado."
  },
  {
    id: 5,
    name: "Agachamentos com Saltos",
    duration: "60 segundos",
    description: "Faça um agachamento normal e, ao subir, salte explosivamente para cima. Aterrisse suavemente e repita."
  },
  {
    id: 6,
    name: "Mountain Climbers",
    duration: "60 segundos",
    description: "Posição de prancha, alterne trazendo os joelhos ao peito rapidamente como se estivesse escalando."
  }
]

export default function RebootApp() {
  const [isLoading, setIsLoading] = useState(true)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    points: 0,
    cleanDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    challengesCompleted: 0,
    reflectionsCount: 0,
    currentDay: 0,
    totalDays: 0,
    medals: [],
    unlockedRituals: [],
    completedRituals: {},
    isFirstTime: true,
    unlockedEducation: []
  })

  const [dailyReflection, setDailyReflection] = useState('')
  const [reflections, setReflections] = useState<DailyReflection[]>([])
  const [relapseData, setRelapseData] = useState<RelapseData[]>([])
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0])
  const [showRelapseMode, setShowRelapseMode] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showRecoveryMode, setShowRecoveryMode] = useState(false)
  const [recoveryStartTime, setRecoveryStartTime] = useState<number | null>(null)
  const [showDay0Dialog, setShowDay0Dialog] = useState(false)
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)
  const [newlyUnlockedRitual, setNewlyUnlockedRitual] = useState<Ritual | null>(null)
  const [reflectionTimer, setReflectionTimer] = useState(0)
  const [isReflectionPeriod, setIsReflectionPeriod] = useState(false)
  const [neuroplasticityExpanded, setNeuroplasticityExpanded] = useState(false)
  const [dopamineExpanded, setDopamineExpanded] = useState(false)
  const [autocontroleExpanded, setAutocontroleExpanded] = useState(false)
  const [gratificacaoExpanded, setGratificacaoExpanded] = useState(false)
  const [toleranciaExpanded, setToleranciaExpanded] = useState(false)
  const [breathingExpanded, setBreathingExpanded] = useState(false)
  const [showPhaseCelebration, setShowPhaseCelebration] = useState(false)
  const [celebrationPhase, setCelebrationPhase] = useState<string>('')
  const [showDay90Celebration, setShowDay90Celebration] = useState(false)
  const [showCrisisMode, setShowCrisisMode] = useState(false)
  const [crisisCountdown, setCrisisCountdown] = useState(60)
  const [currentScreen, setCurrentScreen] = useState<'crisis' | 'emotions' | 'response' | 'motivation' | 'action' | 'final'>('crisis')
  const [selectedEmotion, setSelectedEmotion] = useState<string>('')
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [day0Answers, setDay0Answers] = useState({
    feelings: '',
    expectations: '',
    lifeWithout: '',
    obstacles: '',
    newSelf: ''
  })
  const [relapseForm, setRelapseForm] = useState({
    triggers: '',
    feelings: '',
    timeOfDay: '',
    situation: '',
    reflection: '',
    lesson: ''
  })

  // Estados para Meus Motivos
  const [motivations, setMotivations] = useState<Motivation[]>([])
  const [motivationSettings, setMotivationSettings] = useState<MotivationSettings>({
    frequency: 1,
    lastNotification: '',
    usedMotivations: [],
    enabled: false // Padrão desabilitado
  })
  const [newMotivation, setNewMotivation] = useState('')
  const [showAddMotivation, setShowAddMotivation] = useState(false)
  const [showEditMotivations, setShowEditMotivations] = useState(false)
  const [editingMotivation, setEditingMotivation] = useState<Motivation | null>(null)
  const [editMotivationText, setEditMotivationText] = useState('')

  // Estados para Progresso de Dias
  const [showAllPhases, setShowAllPhases] = useState(false)

  // Estados para tela de motivação
  const [currentMotivationIndex, setCurrentMotivationIndex] = useState(0)
  const [shownMotivations, setShownMotivations] = useState<string[]>([])

  // Estados para exercícios e meditação - CORREÇÃO PRINCIPAL AQUI
  const [exerciseTimer, setExerciseTimer] = useState(60) // Sempre 60 segundos
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0) // Índice do exercício atual (0-5)
  const [isExercising, setIsExercising] = useState(false) // Se está no modo exercício
  const [exerciseStarted, setExerciseStarted] = useState(false) // Se iniciou a sequência
  const [meditationTimer, setMeditationTimer] = useState(300) // 5 minutos
  const [isMeditating, setIsMeditating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [meditationPhase, setMeditationPhase] = useState<'prepare' | 'breathe' | 'observe' | 'complete'>('prepare')
  const [currentReflectionIndex, setCurrentReflectionIndex] = useState(0)
  const [currentExerciseStarted, setCurrentExerciseStarted] = useState(false) // Se o exercício atual foi iniciado
  
  // NOVO ESTADO PARA TIMER DE DESCANSO
  const [restTimer, setRestTimer] = useState(30) // Timer de 30 segundos para descanso
  const [isResting, setIsResting] = useState(false) // Se está no período de descanso
  
  // NOVO ESTADO PARA TIMER DE DESCANSO NA TELA DE EXPLICAÇÃO - CORREÇÃO AQUI
  const [explanationRestTimer, setExplanationRestTimer] = useState(30) // Timer de 30 segundos na tela de explicação
  const [isExplanationResting, setIsExplanationResting] = useState(false) // Se está no período de descanso na explicação

  // NOVOS ESTADOS PARA RESPIRAÇÃO GUIADA
  const [breathingTimer, setBreathingTimer] = useState(300) // 5 minutos
  const [isBreathing, setIsBreathing] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [breathingCycleTimer, setBreatheingCycleTimer] = useState(5) // Timer do ciclo atual
  const [breathingCycleCount, setBreathingCycleCount] = useState(0) // Contador de ciclos

  // Mapeamento de emoções e respostas
  const emotionResponses = {
    'Ansiedade': 'A ansiedade neurobiologicamente representa uma hiperativação do sistema límbico, especificamente da amígdala, que interpreta estímulos neutros como ameaças potenciais. Essa resposta desregula os neurotransmissores GABA e serotonina, criando um estado de alerta constante. O cérebro busca mecanismos de autorregulação através de comportamentos compensatórios, frequentemente recorrendo a padrões conhecidos de alívio, mesmo quando estes são contraproducentes para o bem-estar a longo prazo.',
    'Tédio': 'O tédio neurobiologicamente representa uma desregulação do sistema de recompensa dopaminérgico. Quando os estímulos ambientais não conseguem ativar adequadamente os circuitos de motivação, o cérebro interpreta essa ausência como um sinal de necessidade de busca por novos estímulos. Essa sensação surge quando há uma discrepância entre a expectativa neural de recompensa e a realidade presente, levando a comportamentos compensatórios de busca por gratificação.',
    'Solidão': 'A solidão ativa o sistema de apego e busca por conexão social. Neurobiologicamente, o isolamento prolongado desregula a produção de oxitocina e aumenta os níveis de cortisol. O cérebro interpreta a solidão como uma ameaça à sobrevivência, gerando comportamentos compensatórios de busca por estímulos. A verdadeira necessidade não é de gratificação sexual, mas de vínculos sociais autênticos e significativos.',
    'Estresse': 'O estresse ativa o sistema nervoso simpático, liberando cortisol e adrenalina no organismo. Neurobiologicamente, essa resposta hormonal prepara o corpo para situações de emergência, mas quando cronicamente ativada, pode desregular os sistemas de recompensa cerebrais. A tensão acumulada busca válvulas de escape, frequentemente através de comportamentos compensatórios que prometem alívio imediato, mas que na realidade perpetuam o ciclo de desregulação neuroquímica.',
    'Vontade física': 'Quando você sente vontade física, é apenas seu corpo pedindo atenção. Não é uma emergência - é um sinal que pode ser observado com calma. Respire fundo e lembre-se: essa sensação vai passar naturalmente, como uma onda que vem e vai.',
    'Tristeza': 'A tristeza ativa o sistema límbico e altera os níveis de neurotransmissores como serotonina e dopamina. Neurobiologicamente, essa resposta emocional pode desregular os circuitos de recompensa, levando o cérebro a buscar mecanismos compensatórios para restaurar o equilíbrio neuroquímico. A tristeza não processada adequadamente pode resultar em comportamentos de automedicação emocional, onde o indivíduo busca estímulos externos para aliviar o desconforto interno, criando padrões de dependência comportamental.',
    'Raiva': 'A raiva ativa o sistema límbico, liberando adrenalina e cortisol. Neurobiologicamente, essa resposta emocional intensa pode desregular o córtex pré-frontal, responsável pelo controle executivo e tomada de decisões racionais. Quando o sistema de ativação emocional está hiperativo, o cérebro busca válvulas de escape através de comportamentos impulsivos. A raiva não processada adequadamente pode levar a ciclos de comportamentos compensatórios como forma de autorregulação emocional.',
    'Angústia': 'A angústia representa uma desregulação complexa do sistema nervoso autônomo, envolvendo a hiperativação da amígdala e do eixo hipotálamo-hipófise-adrenal. Neurobiologicamente, essa resposta emocional intensa altera os níveis de cortisol, adrenalina e neurotransmissores como serotonina e GABA. O cérebro interpreta essa desregulação como um sinal de necessidade urgente de alívio, frequentemente levando a comportamentos compensatórios. A angústia cria um ciclo de retroalimentação negativa onde a busca por alívio imediato pode perpetuar a própria desregulação emocional.',
    'Felicidade': 'A felicidade ativa o sistema de recompensa dopaminérgico, mas paradoxalmente pode criar vulnerabilidade ao vício. Quando estamos felizes, os níveis elevados de dopamina podem reduzir temporariamente nossa vigilância mental e autocontrole. Neurobiologicamente, estados de bem-estar intenso podem levar a decisões impulsivas, pois o córtex pré-frontal (responsável pelo julgamento) fica menos ativo. É nestes momentos de \"guarda baixa\" que muitas recaídas acontecem - quando nos sentimos confiantes demais ou celebrando conquistas, podemos subestimar nossa vulnerabilidade e ceder aos impulsos que normalmente resistiríamos.',
    'Euforia': 'A euforia representa uma elevação intensa dos níveis de dopamina e serotonina, criando um estado de bem-estar extremo. Neurobiologicamente, essa resposta pode ser tanto benéfica quanto problemática, dependendo de sua origem. Euforia natural, resultante de conquistas pessoais, exercícios ou conexões sociais, fortalece circuitos neurais saudáveis. No entanto, é importante estar atento para que estados eufóricos não levem a comportamentos impulsivos ou à busca por estímulos artificiais para manter essa sensação elevada.'
  }

  useEffect(() => {
    // Carregar dados do usuário
    const savedProgress = localStorage.getItem('reboot-progress')
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      // GARANTIR que unlockedRituals seja sempre um array
      if (!progress.unlockedRituals || !Array.isArray(progress.unlockedRituals)) {
        progress.unlockedRituals = []
      }
      if (!progress.unlockedEducation || !Array.isArray(progress.unlockedEducation)) {
        progress.unlockedEducation = []
      }
      setUserProgress(progress)
      
      // Mostrar diálogo do Dia 0 se for primeira vez
      if (progress.isFirstTime && progress.currentDay === 0) {
        setShowDay0Dialog(true)
      }
    } else {
      // Se não há dados salvos, mostrar diálogo do Dia 0
      setShowDay0Dialog(true)
    }

    const savedReflections = localStorage.getItem('reboot-reflections')
    if (savedReflections) {
      setReflections(JSON.parse(savedReflections))
    }

    const savedRelapseData = localStorage.getItem('reboot-relapse-data')
    if (savedRelapseData) {
      setRelapseData(JSON.parse(savedRelapseData))
    }

    // Carregar motivações
    const savedMotivations = localStorage.getItem('reboot-motivations')
    if (savedMotivations) {
      setMotivations(JSON.parse(savedMotivations))
    }

    // Carregar configurações de motivação
    const savedMotivationSettings = localStorage.getItem('reboot-motivation-settings')
    if (savedMotivationSettings) {
      const settings = JSON.parse(savedMotivationSettings)
      // Garantir que a propriedade enabled existe
      if (settings.enabled === undefined) {
        settings.enabled = false
      }
      setMotivationSettings(settings)
    }

    // Verificar modo recuperação
    const recoveryMode = localStorage.getItem('reboot-recovery-mode')
    const recoveryStart = localStorage.getItem('reboot-recovery-start')
    if (recoveryMode === 'true' && recoveryStart) {
      const startTime = parseInt(recoveryStart)
      const now = Date.now()
      const timeDiff = now - startTime
      
      if (timeDiff < 40 * 1000) { // 40 segundos
        setShowRecoveryMode(true)
        setRecoveryStartTime(startTime)
      } else {
        // Sair do modo recuperação
        localStorage.removeItem('reboot-recovery-mode')
        localStorage.removeItem('reboot-recovery-start')
      }
    }

    // Rotacionar frase motivacional
    const quoteInterval = setInterval(() => {
      setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
    }, 15000)

    setIsLoading(false)

    return () => clearInterval(quoteInterval)
  }, [])

  // Timer de reflexão de 40 segundos
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isReflectionPeriod && reflectionTimer > 0) {
      interval = setInterval(() => {
        setReflectionTimer(prev => {
          if (prev <= 1) {
            setIsReflectionPeriod(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isReflectionPeriod, reflectionTimer])

  // Timer para ocultar modo recuperação após 40 segundos
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null
    
    if (showRecoveryMode && recoveryStartTime) {
      const elapsed = Date.now() - recoveryStartTime
      const remaining = (40 * 1000) - elapsed
      
      if (remaining > 0) {
        timeout = setTimeout(() => {
          setShowRecoveryMode(false)
          localStorage.removeItem('reboot-recovery-mode')
          localStorage.removeItem('reboot-recovery-start')
        }, remaining)
      } else {
        setShowRecoveryMode(false)
        localStorage.removeItem('reboot-recovery-mode')
        localStorage.removeItem('reboot-recovery-start')
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [showRecoveryMode, recoveryStartTime])

  // Timer para contador decrescente da crise
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (showCrisisMode && currentScreen === 'crisis' && crisisCountdown > 0) {
      interval = setInterval(() => {
        setCrisisCountdown(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showCrisisMode, currentScreen, crisisCountdown])

  // Timer para exercícios - CORREÇÃO PRINCIPAL AQUI
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    // Só roda o timer se:
    // 1. Está no modo exercício
    // 2. O exercício atual foi iniciado
    // 3. Ainda tem tempo restante
    if (isExercising && currentExerciseStarted && exerciseTimer > 0) {
      interval = setInterval(() => {
        setExerciseTimer(prev => {
          if (prev <= 1) {
            // Exercício atual terminou
            setCurrentExerciseStarted(false) // Para o timer atual
            
            // Se é o último exercício (Mountain Climbers - índice 5), não avançar
            if (currentExerciseIndex === 5) {
              // Último exercício - finalizar tudo
              setIsExercising(false)
              setCurrentExerciseIndex(0)
              setExerciseStarted(false)
              // CORREÇÃO: Ir direto para tela final quando Mountain Climbers terminar
              setCurrentScreen('final')
              return 0
            } else {
              // Se não é o último exercício, avançar para o próximo
              // A partir do exercício 2 (flexões) em diante, iniciar período de descanso
              if (currentExerciseIndex >= 1) {
                setIsResting(true)
                setRestTimer(30)
                return 60 // Reset para 60 segundos para o próximo exercício
              } else {
                // Primeiro exercício (polichinelos) - vai direto para o próximo
                setCurrentExerciseIndex(currentExerciseIndex + 1)
                return 60 // Reset para 60 segundos para o próximo exercício
              }
            }
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isExercising, currentExerciseStarted, exerciseTimer, currentExerciseIndex])

  // NOVO TIMER PARA PERÍODO DE DESCANSO
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            // Período de descanso terminou
            setIsResting(false)
            setCurrentExerciseIndex(currentExerciseIndex + 1) // Avançar para próximo exercício
            return 30 // Reset para próximo descanso
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isResting, restTimer, currentExerciseIndex])

  // NOVO TIMER PARA PERÍODO DE DESCANSO NA TELA DE EXPLICAÇÃO - CORREÇÃO AQUI
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    // CORREÇÃO: Iniciar automaticamente o timer quando for exercício 2 ou superior
    if (currentExerciseIndex >= 1 && !currentExerciseStarted && !isExplanationResting && explanationRestTimer === 30) {
      setIsExplanationResting(true)
    }
    
    if (isExplanationResting && explanationRestTimer > 0) {
      interval = setInterval(() => {
        setExplanationRestTimer(prev => {
          if (prev <= 1) {
            // Período de descanso na explicação terminou - FICA EM 0
            return 0 // CORREÇÃO: fica em 0, não volta para 30
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isExplanationResting, explanationRestTimer, currentExerciseIndex, currentExerciseStarted])

  // Timer para meditação
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isMeditating && !isPaused && meditationTimer > 0) {
      interval = setInterval(() => {
        setMeditationTimer(prev => {
          if (prev <= 1) {
            setIsMeditating(false)
            setMeditationPhase('complete')
            return 0
          }
          
          // Mudança de fases durante a meditação
          const elapsed = 300 - prev
          if (elapsed === 60 && meditationPhase === 'prepare') {
            setMeditationPhase('breathe')
          } else if (elapsed === 180 && meditationPhase === 'breathe') {
            setMeditationPhase('observe')
          }
          
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isMeditating, isPaused, meditationTimer, meditationPhase])

  // NOVO TIMER PARA RESPIRAÇÃO GUIADA
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isBreathing && breathingTimer > 0) {
      interval = setInterval(() => {
        setBreathingTimer(prev => {
          if (prev <= 1) {
            setIsBreathing(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isBreathing, breathingTimer])

  // NOVO TIMER PARA CICLOS DE RESPIRAÇÃO
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isBreathing && breathingCycleTimer > 0) {
      interval = setInterval(() => {
        setBreatheingCycleTimer(prev => {
          if (prev <= 1) {
            // Mudar para próxima fase do ciclo
            if (breathingPhase === 'inhale') {
              setBreathingPhase('hold')
              return 7 // 7 segundos segurando
            } else if (breathingPhase === 'hold') {
              setBreathingPhase('exhale')
              return 8 // 8 segundos expirando
            } else {
              // Completou um ciclo
              setBreathingPhase('inhale')
              setBreathingCycleCount(prev => prev + 1)
              return 5 // 5 segundos inspirando
            }
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isBreathing, breathingCycleTimer, breathingPhase])

  // Sistema de notificações para motivações
  useEffect(() => {
    const checkNotifications = () => {
      if (motivations.length === 0 || !motivationSettings.enabled) return

      const now = new Date()
      const lastNotification = motivationSettings.lastNotification ? new Date(motivationSettings.lastNotification) : null
      
      if (!lastNotification) {
        // Primeira notificação
        showRandomMotivation()
        return
      }

      const daysDiff = Math.floor((now.getTime() - lastNotification.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff >= motivationSettings.frequency) {
        showRandomMotivation()
      }
    }

    const showRandomMotivation = () => {
      const availableMotivations = motivations.filter(m => !motivationSettings.usedMotivations.includes(m.id))
      
      if (availableMotivations.length === 0) {
        // Resetar ciclo se todas foram usadas
        const newSettings = {
          ...motivationSettings,
          usedMotivations: [],
          lastNotification: new Date().toISOString()
        }
        setMotivationSettings(newSettings)
        localStorage.setItem('reboot-motivation-settings', JSON.stringify(newSettings))
        
        // Mostrar uma motivação aleatória
        const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)]
        alert(`💪 Sua Motivação:\n\n"${randomMotivation.text}"\n\n- Volte às suas razões. É por elas que você começou.`)
        
        newSettings.usedMotivations = [randomMotivation.id]
        setMotivationSettings(newSettings)
        localStorage.setItem('reboot-motivation-settings', JSON.stringify(newSettings))
      } else {
        // Mostrar motivação não usada
        const randomMotivation = availableMotivations[Math.floor(Math.random() * availableMotivations.length)]
        alert(`💪 Sua Motivação:\n\n"${randomMotivation.text}"\n\n- Volte às suas razões. É por elas que você começou.`)
        
        const newSettings = {
          ...motivationSettings,
          usedMotivations: [...motivationSettings.usedMotivations, randomMotivation.id],
          lastNotification: new Date().toISOString()
        }
        setMotivationSettings(newSettings)
        localStorage.setItem('reboot-motivation-settings', JSON.stringify(newSettings))
      }
    }

    // Verificar notificações a cada hora
    const interval = setInterval(checkNotifications, 60 * 60 * 1000)
    
    // Verificar imediatamente
    checkNotifications()

    return () => clearInterval(interval)
  }, [motivations, motivationSettings])

  const saveProgress = (newProgress: UserProgress) => {
    // GARANTIR que unlockedRituals seja sempre um array antes de salvar
    if (!newProgress.unlockedRituals || !Array.isArray(newProgress.unlockedRituals)) {
      newProgress.unlockedRituals = []
    }
    if (!newProgress.unlockedEducation || !Array.isArray(newProgress.unlockedEducation)) {
      newProgress.unlockedEducation = []
    }
    setUserProgress(newProgress)
    localStorage.setItem('reboot-progress', JSON.stringify(newProgress))
  }

  const saveMotivations = (newMotivations: Motivation[]) => {
    setMotivations(newMotivations)
    localStorage.setItem('reboot-motivations', JSON.stringify(newMotivations))
  }

  const saveMotivationSettings = (newSettings: MotivationSettings) => {
    setMotivationSettings(newSettings)
    localStorage.setItem('reboot-motivation-settings', JSON.stringify(newSettings))
  }

  const addMotivation = () => {
    if (!newMotivation.trim()) return

    const motivation: Motivation = {
      id: Date.now().toString(),
      text: newMotivation.trim(),
      createdAt: new Date().toISOString()
    }

    const updatedMotivations = [...motivations, motivation]
    saveMotivations(updatedMotivations)
    setNewMotivation('')
    setShowAddMotivation(false)
  }

  const deleteMotivation = (id: string) => {
    const updatedMotivations = motivations.filter(m => m.id !== id)
    saveMotivations(updatedMotivations)
    
    // Remover da lista de usadas se estiver lá
    const updatedSettings = {
      ...motivationSettings,
      usedMotivations: motivationSettings.usedMotivations.filter(usedId => usedId !== id)
    }
    saveMotivationSettings(updatedSettings)
  }

  const startEditMotivation = (motivation: Motivation) => {
    setEditingMotivation(motivation)
    setEditMotivationText(motivation.text)
  }

  const saveEditMotivation = () => {
    if (!editingMotivation || !editMotivationText.trim()) return

    const updatedMotivations = motivations.map(m => 
      m.id === editingMotivation.id 
        ? { ...m, text: editMotivationText.trim() }
        : m
    )
    saveMotivations(updatedMotivations)
    setEditingMotivation(null)
    setEditMotivationText('')
  }

  const updateNotificationFrequency = (frequency: number) => {
    const updatedSettings = {
      ...motivationSettings,
      frequency
    }
    saveMotivationSettings(updatedSettings)
  }

  const toggleNotifications = (enabled: boolean) => {
    const updatedSettings = {
      ...motivationSettings,
      enabled
    }
    saveMotivationSettings(updatedSettings)
  }

  const completeDay0 = () => {
    if (!day0Answers.feelings || !day0Answers.expectations || !day0Answers.lifeWithout || !day0Answers.obstacles || !day0Answers.newSelf) {
      return
    }

    // Salvar respostas do Dia 0
    const day0Reflection: DailyReflection = {
      date: new Date().toLocaleDateString('pt-BR'),
      content: `DIA 0 — COMPROMISSO COM A VERDADE\n\nSentimentos sobre pornografia/masturbação: ${day0Answers.feelings}\n\nExpectativas para 90 dias: ${day0Answers.expectations}\n\nVida sem esses hábitos: ${day0Answers.lifeWithout}\n\nObstáculos até hoje: ${day0Answers.obstacles}\n\nQuem quero me tornar: ${day0Answers.newSelf}`,
      mood: 'determined'
    }

    const updatedReflections = [day0Reflection, ...reflections]
    setReflections(updatedReflections)
    localStorage.setItem('reboot-reflections', JSON.stringify(updatedReflections))

    // Atualizar progresso - MANTER NO DIA 0
    const newProgress = {
      ...userProgress,
      currentDay: 0, // Permanecer no Dia 0
      isFirstTime: false,
      points: userProgress.points + 20,
      reflectionsCount: userProgress.reflectionsCount + 1,
      unlockedRituals: userProgress.unlockedRituals || [],
      unlockedEducation: userProgress.unlockedEducation || []
    }

    // NÃO desbloquear rituais ainda - só no primeiro dia limpo

    saveProgress(newProgress)
    setShowDay0Dialog(false)
  }

  const addCleanDay = () => {
    if (isReflectionPeriod) return // Bloquear durante período de reflexão

    const previousPhase = getCurrentPhase()
    const newProgress = { ...userProgress }
    newProgress.cleanDays += 1
    newProgress.currentStreak += 1
    newProgress.currentDay += 1
    newProgress.totalDays += 1
    newProgress.longestStreak = Math.max(newProgress.longestStreak, newProgress.currentStreak)
    newProgress.points += 10

    // GARANTIR que unlockedRituals seja sempre um array
    if (!newProgress.unlockedRituals || !Array.isArray(newProgress.unlockedRituals)) {
      newProgress.unlockedRituals = []
    }

    // Verificar se subiu de nível
    const newLevel = Math.min(10, Math.floor(newProgress.points / 500) + 1)
    if (newLevel > userProgress.level) {
      newProgress.level = newLevel
      // Animação de nível
      setTimeout(() => {
        alert('🔥 Você subiu de nível no autodomínio. Continue firme.')
      }, 500)
    }

    // Verificar se mudou de fase
    const newPhase = getCurrentPhaseByDay(newProgress.currentDay)
    if (newPhase !== previousPhase && newPhase !== 'Fundação') {
      // Mostrar celebração da nova fase
      setCelebrationPhase(newPhase)
      setShowPhaseCelebration(true)
    }

    // Verificar novos rituais para desbloquear - CORREÇÃO AQUI
    const ritualsToUnlock = RITUALS.filter(ritual => 
      ritual.unlockDay === newProgress.currentDay && 
      !newProgress.unlockedRituals.includes(ritual.id)
    )

    if (ritualsToUnlock.length > 0) {
      ritualsToUnlock.forEach(ritual => {
        newProgress.unlockedRituals.push(ritual.id)
      })
      // Verificar se o ritual tem todas as propriedades necessárias
      const ritualToShow = ritualsToUnlock[0]
      if (ritualToShow && ritualToShow.name && ritualToShow.icon) {
        setNewlyUnlockedRitual(ritualToShow)
        setShowUnlockDialog(true)
      }
    }

    saveProgress(newProgress)

    // Verificar se completou os 90 dias
    if (newProgress.currentDay >= 90) {
      setShowDay90Celebration(true)
    }
  }

  const resetAllData = () => {
    const resetProgress: UserProgress = {
      level: 1,
      points: 0,
      cleanDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      challengesCompleted: 0,
      reflectionsCount: 0,
      currentDay: 0,
      totalDays: 0,
      medals: [],
      unlockedRituals: [],
      completedRituals: {},
      isFirstTime: true,
      unlockedEducation: []
    }
    
    setUserProgress(resetProgress)
    setReflections([])
    setRelapseData([])
    setDailyReflection('')
    setDay0Answers({ feelings: '', expectations: '', lifeWithout: '', obstacles: '', newSelf: '' })
    
    localStorage.removeItem('reboot-progress')
    localStorage.removeItem('reboot-reflections')
    localStorage.removeItem('reboot-relapse-data')
    localStorage.removeItem('reboot-recovery-mode')
    localStorage.removeItem('reboot-recovery-start')
    
    setShowResetConfirm(false)
    setShowRecoveryMode(false)
    setShowDay0Dialog(true)
  }

  const handleRelapse = () => {
    const newRelapseEntry: RelapseData = {
      date: new Date().toLocaleDateString('pt-BR'),
      triggers: `Qual foi o gatilho principal? ${relapseForm.triggers}`,
      feelings: `O que você sentiu antes da recaída? ${relapseForm.feelings}`,
      timeOfDay: `Que horas aconteceu? ${relapseForm.timeOfDay}`,
      situation: `Qual era a situação? ${relapseForm.situation}`,
      reflection: relapseForm.reflection,
      lesson: relapseForm.lesson
    }

    const updatedRelapseData = [newRelapseEntry, ...relapseData]
    setRelapseData(updatedRelapseData)
    localStorage.setItem('reboot-relapse-data', JSON.stringify(updatedRelapseData))

    // Aplicar penalidades da recaída (sem resetar progresso)
    const newProgress = {
      ...userProgress,
      currentStreak: 0, // Zerar apenas dias consecutivos
      points: Math.max(0, userProgress.points - 15), // Perder 15 pontos
      unlockedRituals: userProgress.unlockedRituals || [],
      unlockedEducation: userProgress.unlockedEducation || []
      // Manter dia atual, rituais desbloqueados e nível
    }
    saveProgress(newProgress)

    // Ativar modo recuperação por 40 segundos
    setShowRecoveryMode(true)
    const now = Date.now()
    setRecoveryStartTime(now)
    localStorage.setItem('reboot-recovery-mode', 'true')
    localStorage.setItem('reboot-recovery-start', now.toString())

    // Iniciar período de reflexão de 40 segundos
    setIsReflectionPeriod(true)
    setReflectionTimer(40)

    setShowRelapseMode(false)
    setRelapseForm({ triggers: '', feelings: '', timeOfDay: '', situation: '', reflection: '', lesson: '' })
  }

  const completeRitual = (ritualId: string) => {
    if (isReflectionPeriod) return // Bloquear durante período de reflexão

    const ritual = RITUALS.find(r => r.id === ritualId)
    if (!ritual) return

    const newProgress = {
      ...userProgress,
      points: userProgress.points + (ritual.points || 0),
      completedRituals: {
        ...userProgress.completedRituals,
        [ritualId]: (userProgress.completedRituals[ritualId] || 0) + 1
      },
      unlockedRituals: userProgress.unlockedRituals || [],
      unlockedEducation: userProgress.unlockedEducation || []
    }
    saveProgress(newProgress)
  }

  const saveReflection = () => {
    if (isReflectionPeriod) return // Bloquear durante período de reflexão

    if (dailyReflection.trim()) {
      const newReflection: DailyReflection = {
        date: new Date().toLocaleDateString('pt-BR'),
        content: dailyReflection,
        mood: 'neutral'
      }
      
      const updatedReflections = [newReflection, ...reflections.slice(0, 9)]
      setReflections(updatedReflections)
      localStorage.setItem('reboot-reflections', JSON.stringify(updatedReflections))
      
      const newProgress = {
        ...userProgress,
        reflectionsCount: userProgress.reflectionsCount + 1,
        points: userProgress.points + 5,
        unlockedRituals: userProgress.unlockedRituals || [],
        unlockedEducation: userProgress.unlockedEducation || []
      }
      saveProgress(newProgress)
      setDailyReflection('')
    }
  }

  const unlockEducationContent = (contentId: string) => {
    if (userProgress.points < 30) return

    const safeUnlockedEducation = userProgress.unlockedEducation || []
    const newProgress = {
      ...userProgress,
      unlockedEducation: [...safeUnlockedEducation, contentId],
      points: userProgress.points - 30,
      unlockedRituals: userProgress.unlockedRituals || []
    }
    saveProgress(newProgress)
  }

  const getCurrentPhase = () => {
    return getCurrentPhaseByDay(userProgress.currentDay)
  }

  const getCurrentPhaseByDay = (day: number) => {
    if (day <= 10) return 'Fundação'
    if (day <= 30) return 'Consolidação'
    if (day <= 60) return 'Expansão'
    return 'Ascensão'
  }

  const getPhaseProgress = () => {
    const phase = getCurrentPhase()
    if (phase === 'Fundação') return (userProgress.currentDay / 10) * 100
    if (phase === 'Consolidação') return ((userProgress.currentDay - 10) / 20) * 100
    if (phase === 'Expansão') return ((userProgress.currentDay - 30) / 30) * 100
    return ((userProgress.currentDay - 60) / 30) * 100
  }

  const getRemainingRecoveryTime = () => {
    if (!recoveryStartTime) return 0
    const elapsed = Date.now() - recoveryStartTime
    const remaining = (40 * 1000) - elapsed // 40 segundos
    return Math.max(0, remaining)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    return `${seconds}s`
  }

  const formatMeditationTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Função para obter informações do progresso atual
  const getCurrentDayInfo = (): DayProgressInfo => {
    const day = userProgress.currentDay
    
    if (day === 0) return DAY_PROGRESS_INFO['0']
    if (day >= 1 && day <= 3) return DAY_PROGRESS_INFO['1-3']
    if (day >= 4 && day <= 7) return DAY_PROGRESS_INFO['4-7']
    if (day >= 8 && day <= 14) return DAY_PROGRESS_INFO['8-14']
    if (day >= 15 && day <= 21) return DAY_PROGRESS_INFO['15-21']
    if (day >= 22 && day <= 30) return DAY_PROGRESS_INFO['22-30']
    if (day >= 31 && day <= 45) return DAY_PROGRESS_INFO['31-45']
    if (day >= 46 && day <= 60) return DAY_PROGRESS_INFO['46-60']
    if (day >= 61 && day <= 75) return DAY_PROGRESS_INFO['61-75']
    if (day >= 76 && day <= 89) return DAY_PROGRESS_INFO['76-89']
    if (day >= 90) return DAY_PROGRESS_INFO['90']
    
    return DAY_PROGRESS_INFO['0']
  }

  // Função para obter todas as fases anteriores
  const getPreviousPhases = (): DayProgressInfo[] => {
    const day = userProgress.currentDay
    const phases: DayProgressInfo[] = []
    
    if (day > 0) phases.push(DAY_PROGRESS_INFO['0'])
    if (day > 3) phases.push(DAY_PROGRESS_INFO['1-3'])
    if (day > 7) phases.push(DAY_PROGRESS_INFO['4-7'])
    if (day > 14) phases.push(DAY_PROGRESS_INFO['8-14'])
    if (day > 21) phases.push(DAY_PROGRESS_INFO['15-21'])
    if (day > 30) phases.push(DAY_PROGRESS_INFO['22-30'])
    if (day > 45) phases.push(DAY_PROGRESS_INFO['31-45'])
    if (day > 60) phases.push(DAY_PROGRESS_INFO['46-60'])
    if (day > 75) phases.push(DAY_PROGRESS_INFO['61-75'])
    if (day > 89) phases.push(DAY_PROGRESS_INFO['76-89'])
    if (day >= 90) phases.push(DAY_PROGRESS_INFO['90'])
    
    return phases
  }

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion)
    setCurrentScreen('response')
  }

  const handleContinueFromCrisis = () => {
    setCurrentScreen('emotions')
  }

  const handleContinueFromResponse = () => {
    setCurrentScreen('motivation')
  }

  const handleContinueFromMotivation = () => {
    setCurrentScreen('action')
  }

  const handleActionSelect = (action: string) => {
    setSelectedAction(action)
    
    if (action === 'breathing') {
      setBreathingTimer(300) // 5 minutos
      setBreathingPhase('inhale')
      setBreatheingCycleTimer(5)
      setBreathingCycleCount(0)
      setIsBreathing(false) // Não iniciar automaticamente
    } else if (action === 'exercise') {
      setExerciseTimer(60)
      setCurrentExerciseIndex(0)
      setIsExercising(false) // Não iniciar automaticamente
      setExerciseStarted(false)
      setCurrentExerciseStarted(false)
      setIsResting(false) // Reset estado de descanso
      setRestTimer(30) // Reset timer de descanso
      setIsExplanationResting(false) // Reset estado de descanso na explicação
      setExplanationRestTimer(30) // Reset timer de descanso na explicação
    } else if (action === 'reflection') {
      // Selecionar reflexão aleatória
      setCurrentReflectionIndex(Math.floor(Math.random() * CRISIS_REFLECTIONS.length))
    }
  }

  const handleStartBreathing = () => {
    setIsBreathing(true)
    setBreathingPhase('inhale')
    setBreatheingCycleTimer(5)
    setBreathingCycleCount(0)
  }

  const handleStartExercise = () => {
    setIsExercising(true)
    setExerciseStarted(true)
    setExerciseTimer(60)
    setCurrentExerciseIndex(0)
    setCurrentExerciseStarted(true) // Iniciar o primeiro exercício automaticamente
    setIsResting(false) // Garantir que não está em descanso
    setIsExplanationResting(false) // Garantir que não está em descanso na explicação
  }

  // NOVA FUNÇÃO PARA INICIAR EXERCÍCIO INDIVIDUAL
  const handleStartCurrentExercise = () => {
    setCurrentExerciseStarted(true)
    setExerciseTimer(60) // Reset para 60 segundos
    setIsExplanationResting(false) // Parar descanso na explicação se estiver ativo
  }

  // NOVA FUNÇÃO PARA INICIAR PRÓXIMO EXERCÍCIO APÓS DESCANSO
  const handleStartNextExercise = () => {
    setIsResting(false)
    setCurrentExerciseStarted(true)
    setExerciseTimer(60)
  }

  const handleFinishCrisis = () => {
    setCurrentScreen('final')
  }

  const handleFinalFinishCrisis = () => {
    setShowCrisisMode(false)
    setCurrentScreen('crisis')
    setCrisisCountdown(60)
    setSelectedEmotion('')
    setSelectedAction('')
    setShownMotivations([])
    setCurrentMotivationIndex(0)
    setIsExercising(false)
    setExerciseStarted(false)
    setCurrentExerciseStarted(false)
    setIsMeditating(false)
    setIsPaused(false)
    setMeditationPhase('prepare')
    setExerciseTimer(60) // Reset para 60
    setMeditationTimer(300)
    setCurrentExerciseIndex(0)
    setIsResting(false) // Reset estado de descanso
    setRestTimer(30) // Reset timer de descanso
    setIsExplanationResting(false) // Reset estado de descanso na explicação
    setExplanationRestTimer(30) // Reset timer de descanso na explicação
    // Reset respiração guiada
    setIsBreathing(false)
    setBreathingTimer(300)
    setBreathingPhase('inhale')
    setBreatheingCycleTimer(5)
    setBreathingCycleCount(0)
  }

  const getRandomMotivation = () => {
    if (motivations.length === 0) return null
    
    // Filtrar motivações não mostradas
    const availableMotivations = motivations.filter(m => !shownMotivations.includes(m.id))
    
    if (availableMotivations.length === 0) {
      // Se todas foram mostradas, resetar e começar novamente
      setShownMotivations([])
      return motivations[Math.floor(Math.random() * motivations.length)]
    }
    
    return availableMotivations[Math.floor(Math.random() * availableMotivations.length)]
  }

  // Função para formatar texto do diário com diferentes estilos
  const formatDiaryText = (content: string) => {
    // Verificar se é o texto específico do Dia 0
    if (content.includes('DIA 0 — COMPROMISSO COM A VERDADE')) {
      const lines = content.split('\n')
      return (
        <div className="space-y-4">
          {lines.map((line, index) => {
            if (line.includes('DIA 0 — COMPROMISSO COM A VERDADE')) {
              return (
                <div key={index} className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text mb-4">
                  {line}
                </div>
              )
            } else if (line.includes('Sentimentos sobre pornografia/masturbação:') || 
                      line.includes('Expectativas para 90 dias:') ||
                      line.includes('Vida sem esses hábitos:') ||
                      line.includes('Obstáculos até hoje:') ||
                      line.includes('Quem quero me tornar:')) {
              const [title, ...contentParts] = line.split(': ')
              return (
                <div key={index} className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 mb-3">
                  <div className="text-blue-400 font-semibold text-lg mb-2">{title}:</div>
                  <div className="text-gray-200 italic leading-relaxed">{contentParts.join(': ')}</div>
                </div>
              )
            } else if (line.trim()) {
              return (
                <div key={index} className="text-white leading-relaxed">
                  {line}
                </div>
              )
            }
            return null
          })}
        </div>
      )
    }
    
    // Para outros textos, usar formatação padrão
    return <div className="text-white whitespace-pre-wrap">{content}</div>
  }

  const handleShowAnotherMotivation = () => {
    const currentMotivation = getRandomMotivation()
    if (currentMotivation) {
      setShownMotivations(prev => [...prev, currentMotivation.id])
      // Forçar re-render para mostrar nova motivação
      setCurrentMotivationIndex(prev => prev + 1)
    }
  }

  // Mostrar loading enquanto carrega dados
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <div className="text-white text-xl">Carregando REBOOT...</div>
        </div>
      </div>
    )
  }

  // Tela de Crise
  if (showCrisisMode) {
    if (currentScreen === 'crisis') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-red-900 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="text-6xl mb-6">🫂</div>
              <h1 className="text-4xl font-bold text-orange-300">
                PARE E RESPIRE
              </h1>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 space-y-6">
              <div className="text-xl text-white leading-relaxed">
                "Pare agora. Respire fundo. Esse impulso não é você — é apenas um reflexo antigo. Espere 60 segundos antes de tomar qualquer atitude."
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 space-y-4">
              <div className="text-6xl font-bold text-orange-300">
                {crisisCountdown}
              </div>
              <div className="text-lg text-orange-200">
                segundos restantes
              </div>
              <div className="w-full bg-orange-900/30 rounded-full h-4">
                <div 
                  className="bg-orange-400 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${((60 - crisisCountdown) / 60) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleContinueFromCrisis}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-4"
                disabled={crisisCountdown > 0}
              >
                {crisisCountdown > 0 ? '⏱️ Aguarde...' : 'Continuar'}
              </Button>
              
              {crisisCountdown === 0 && (
                <div className="text-sm text-orange-200">
                  Você conseguiu! Agora pode continuar com mais clareza mental.
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (currentScreen === 'emotions') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 text-white flex items-center justify-center p-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="text-5xl mb-6">🤔</div>
              <h1 className="text-3xl font-bold text-blue-300">
                O que você sente agora?
              </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(emotionResponses).map((emotion) => (
                <Button
                  key={emotion}
                  onClick={() => handleEmotionSelect(emotion)}
                  className="bg-black/30 backdrop-blur-sm border border-blue-500/30 hover:bg-blue-600/20 text-white text-lg py-6 px-4 h-auto"
                >
                  {emotion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (currentScreen === 'response') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-green-900 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="text-5xl mb-6">💡</div>
              <h1 className="text-2xl font-bold text-green-300">
                {selectedEmotion}
              </h1>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 space-y-6">
              <div className="text-xl text-white leading-relaxed">
                "{emotionResponses[selectedEmotion as keyof typeof emotionResponses]}"
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleContinueFromResponse}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-4"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )
    }

    if (currentScreen === 'motivation') {
      const currentMotivation = getRandomMotivation()
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="text-5xl mb-6">💪</div>
              <h1 className="text-3xl font-bold text-purple-300">
                Relembrar o propósito
              </h1>
            </div>

            {motivations.length > 0 && currentMotivation ? (
              <>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 space-y-6">
                  <div className="text-lg text-purple-200 mb-4">
                    "Lembre-se: você escreveu isso por uma razão."
                  </div>
                  <div className="text-xl text-white leading-relaxed font-medium">
                    "{currentMotivation.text}"
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handleShowAnotherMotivation}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg py-4"
                  >
                    Ler outra motivação
                  </Button>
                  <Button 
                    onClick={handleContinueFromMotivation}
                    variant="outline"
                    className="w-full border-purple-500 text-purple-300 hover:bg-purple-500/10 text-lg py-4"
                  >
                    Continuar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 space-y-6">
                  <div className="text-xl text-white leading-relaxed">
                    Você não tem motivações registradas. Escreva suas motivações para que isto te dê forças para continuar em uma outra crise.
                  </div>
                </div>

                <div className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-bold text-indigo-300">Por que é importante ter motivações escritas?</h3>
                  <div className="text-sm text-indigo-200 leading-relaxed text-left">
                    <div className="mb-3">
                      Estudos em neurociência mostram que escrever nossos objetivos e motivações ativa áreas específicas do cérebro relacionadas ao comprometimento e à memória de longo prazo.
                    </div>
                    <div className="mb-3">
                      Quando você escreve suas razões para mudança, você cria um "âncora emocional" que pode ser acessada em momentos de fraqueza. O ato de reler suas próprias palavras reativa os circuitos neurais associados à sua decisão original.
                    </div>
                    <div>
                      Ter suas motivações registradas funciona como um lembrete tangível do "porquê" por trás da sua jornada, fortalecendo sua resistência em momentos críticos.
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handleContinueFromMotivation}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg py-4"
                  >
                    Continuar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )
    }

    if (currentScreen === 'action') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-cyan-900 text-white flex items-center justify-center p-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="text-5xl mb-6">⚡</div>
              <h1 className="text-3xl font-bold text-cyan-300">
                Ação Rápida
              </h1>
              <div className="text-cyan-200 lasy-highlight">
                Use este momento para se reconectar com o seu propósito. Direcione sua energia de volta para o controle.
              </div>
            </div>

            {!selectedAction ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button
                  onClick={() => handleActionSelect('breathing')}
                  className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 hover:bg-cyan-600/20 text-white text-lg py-8 px-6 h-auto flex flex-col gap-4"
                >
                  <div className="text-4xl">🫁</div>
                  <div className="font-bold">Respiração Guiada</div>
                  <div className="text-sm opacity-80">5 minutos de respiração 5-7-8</div>
                </Button>

                <Button
                  onClick={() => handleActionSelect('exercise')}
                  className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 hover:bg-cyan-600/20 text-white text-lg py-8 px-6 h-auto flex flex-col gap-4"
                >
                  <div className="text-4xl">💪</div>
                  <div className="font-bold">Exercício Rápido</div>
                  <div className="text-sm opacity-80">6 exercícios de alta intensidade</div>
                </Button>

                <Button
                  onClick={() => handleActionSelect('reflection')}
                  className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 hover:bg-cyan-600/20 text-white text-lg py-8 px-6 h-auto flex flex-col gap-4"
                >
                  <div className="text-4xl">🧠</div>
                  <div className="font-bold">Reflexão Guiada</div>
                  <div className="text-sm opacity-80">Texto motivacional profundo</div>
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {selectedAction === 'breathing' && (
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-cyan-300">🫁 Respiração Guiada - 5 Minutos</h2>
                    
                    <div className="text-6xl font-bold text-cyan-400">
                      {formatMeditationTime(breathingTimer)}
                    </div>
                    
                    <div className="w-full bg-cyan-900/30 rounded-full h-4">
                      <div 
                        className="bg-cyan-400 h-4 rounded-full transition-all duration-1000"
                        style={{ width: `${((300 - breathingTimer) / 300) * 100}%` }}
                      />
                    </div>

                    {isBreathing ? (
                      <div className="space-y-6">
                        <div className="text-lg text-white leading-relaxed">
                          <div className="mb-4">
                            <strong>
                              {breathingPhase === 'inhale' && '🌬️ Inspire profundamente'}
                              {breathingPhase === 'hold' && '⏸️ Segure a respiração'}
                              {breathingPhase === 'exhale' && '💨 Expire lentamente'}
                            </strong>
                          </div>
                          <div className="text-4xl font-bold text-cyan-400 mb-4">
                            {breathingCycleTimer}
                          </div>
                          <div>
                            {breathingPhase === 'inhale' && 'Inspire pelo nariz por 5 segundos...'}
                            {breathingPhase === 'hold' && 'Segure a respiração por 7 segundos...'}
                            {breathingPhase === 'exhale' && 'Expire pela boca por 8 segundos...'}
                          </div>
                        </div>

                        <div className="bg-cyan-900/30 p-4 rounded-lg">
                          <div className="text-cyan-300 text-sm">
                            Ciclo {breathingCycleCount + 1} • {breathingPhase === 'inhale' ? 'Inspirando' : breathingPhase === 'hold' ? 'Segurando' : 'Expirando'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg text-white leading-relaxed space-y-4">
                        <div><strong>🧘‍♂️ Preparação</strong></div>
                        <div>Sente-se confortavelmente, feche os olhos e relaxe os ombros — em silêncio ou ao som de uma música apropriada. Vamos começar uma jornada de cinco minutos para acalmar a mente e reconectar-se ao seu centro interior.</div>
                        <div className="bg-cyan-900/30 p-4 rounded-lg text-left">
                          <div>• <strong>5 segundos:</strong> Inspire profundamente pelo nariz</div>
                          <div>• <strong>7 segundos:</strong> Segure a respiração</div>
                          <div>• <strong>8 segundos:</strong> Expire lentamente pela boca</div>
                        </div>
                      </div>
                    )}

                    {/* Controles */}
                    <div className="flex justify-center gap-4">
                      {!isBreathing && breathingTimer > 0 && (
                        <Button 
                          onClick={handleStartBreathing}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-3 px-8 flex items-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Iniciar Respiração
                        </Button>
                      )}
                    </div>

                    {!isBreathing && breathingTimer === 0 && (
                      <div className="space-y-4">
                        <div className="text-lg text-white leading-relaxed">
                          <div className="mb-4">✨ <strong>Respiração Completa</strong></div>
                          <div>Parabéns! Você dedicou 5 minutos para reconectar consigo mesmo. Sinta essa sensação de calma e controle. Você tem o poder de escolher suas reações.</div>
                        </div>
                        <Button 
                          onClick={handleFinishCrisis}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-4"
                        >
                          ✅ Finalizar Crise
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {selectedAction === 'exercise' && (
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-cyan-300">💪 Exercício Rápido - Alta Intensidade</h2>

                    
                    {!exerciseStarted ? (
                      <>
                        <div className="text-lg text-white leading-relaxed space-y-4">
                          <div><strong>Prepare-se para 6 exercícios de alta intensidade!</strong></div>
                          <div>Cada exercício dura 60 segundos. Vamos trabalhar o corpo todo e liberar endorfinas naturais.</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {QUICK_EXERCISES.map((exercise, index) => (
                            <div key={exercise.id} className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                              <div className="font-bold text-blue-400">{exercise.id}. {exercise.name}</div>
                              <div className="text-blue-200 text-xs mt-1">{exercise.description}</div>
                              <div className="text-blue-300 text-xs mt-1">{exercise.duration}</div>
                            </div>
                          ))}
                        </div>

                        <Button 
                          onClick={handleStartExercise}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-4 flex items-center justify-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Iniciar Exercícios
                        </Button>
                      </>
                    ) : isExercising ? (
                      <>
                        {/* PERÍODO DE DESCANSO */}
                        {isResting ? (
                          <div className="space-y-4">
                            <div className="text-4xl font-bold text-blue-400">
                              Descanse
                            </div>
                            
                            <div className="text-6xl font-bold text-blue-400">
                              {restTimer}s
                            </div>
                            
                            <div className="w-full bg-blue-900/30 rounded-full h-4">
                              <div 
                                className="bg-blue-400 h-4 rounded-full transition-all duration-1000"
                                style={{ width: `${((30 - restTimer) / 30) * 100}%` }}
                              />
                            </div>

                            <div className="text-lg text-white leading-relaxed">
                              <div><strong>Exercício {currentExerciseIndex + 1} completo!</strong></div>
                              <div>Respire fundo e se prepare para o próximo exercício.</div>
                            </div>

                            <div className="text-sm text-cyan-200">
                              {restTimer === 0 ? (
                                <div className="text-green-400 font-bold">Inicie o próximo exercício!</div>
                              ) : (
                                <div>
                                  Próximo: {currentExerciseIndex + 1 < QUICK_EXERCISES.length ? QUICK_EXERCISES[currentExerciseIndex + 1].name : 'Finalizar'}
                                </div>
                              )}
                            </div>

                            {restTimer === 0 && (
                              <Button 
                                onClick={handleStartNextExercise}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-4 flex items-center justify-center gap-2"
                              >
                                <Play className="w-5 h-5" />
                                Inicie o próximo exercício
                              </Button>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="text-4xl font-bold text-cyan-400">
                              {QUICK_EXERCISES[currentExerciseIndex] ? QUICK_EXERCISES[currentExerciseIndex].name : 'Exercício'}
                            </div>
                            
                            {!currentExerciseStarted ? (
                              <>
                                <div className="text-lg text-white leading-relaxed space-y-4">
                                  <div><strong>Exercício {currentExerciseIndex + 1} de {QUICK_EXERCISES.length}</strong></div>
                                  <div>{QUICK_EXERCISES[currentExerciseIndex] ? QUICK_EXERCISES[currentExerciseIndex].description : 'Descrição do exercício'}</div>
                                </div>

                                {/* TIMER DE DESCANSO NA TELA DE EXPLICAÇÃO - A PARTIR DO EXERCÍCIO 2 - CORREÇÃO AQUI */}
                                {currentExerciseIndex >= 1 && (
                                  <div className="space-y-4">
                                    <div className="text-2xl font-bold text-blue-400">
                                      Descanse
                                    </div>
                                    
                                    <div className="text-4xl font-bold text-blue-400">
                                      {explanationRestTimer}s
                                    </div>
                                    
                                    <div className="w-full bg-blue-900/30 rounded-full h-4">
                                      <div 
                                        className="bg-blue-400 h-4 rounded-full transition-all duration-1000"
                                        style={{ width: `${((30 - explanationRestTimer) / 30) * 100}%` }}
                                      />
                                    </div>

                                    <div className="text-lg text-white leading-relaxed">
                                      <div>Respire fundo antes de iniciar o próximo exercício.</div>
                                    </div>

                                    <div className="text-sm text-cyan-200">
                                      {explanationRestTimer === 0 ? (
                                        <div className="text-green-400 font-bold">Inicie o próximo exercício!</div>
                                      ) : (
                                        <div>Preparando para: {QUICK_EXERCISES[currentExerciseIndex] ? QUICK_EXERCISES[currentExerciseIndex].name : 'Próximo exercício'}</div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* BOTÃO PARA INICIAR EXERCÍCIO - SÓ APARECE SE NÃO ESTÁ EM DESCANSO OU SE O DESCANSO TERMINOU */}
                                {(currentExerciseIndex === 0 || explanationRestTimer === 0) && (
                                  <Button 
                                    onClick={handleStartCurrentExercise}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-4 flex items-center justify-center gap-2"
                                  >
                                    <Play className="w-5 h-5" />
                                    Iniciar {QUICK_EXERCISES[currentExerciseIndex] ? QUICK_EXERCISES[currentExerciseIndex].name : 'Exercício'}
                                  </Button>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="text-6xl font-bold text-orange-400">
                                  {exerciseTimer}s
                                </div>
                                
                                <div className="w-full bg-orange-900/30 rounded-full h-4">
                                  <div 
                                    className="bg-orange-400 h-4 rounded-full transition-all duration-1000"
                                    style={{ width: `${((60 - exerciseTimer) / 60) * 100}%` }}
                                  />
                                </div>

                                <div className="text-lg text-white leading-relaxed">
                                  <div><strong>Exercício {currentExerciseIndex + 1} de {QUICK_EXERCISES.length}</strong></div>
                                  <div>{QUICK_EXERCISES[currentExerciseIndex] ? QUICK_EXERCISES[currentExerciseIndex].description : 'Descrição do exercício'}</div>
                                </div>

                                <div className="text-sm text-cyan-200">
                                  Próximo: {currentExerciseIndex < QUICK_EXERCISES.length - 1 ? (QUICK_EXERCISES[currentExerciseIndex + 1] ? QUICK_EXERCISES[currentExerciseIndex + 1].name : 'Próximo exercício') : 'Finalizar'}
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-lg text-white leading-relaxed">
                          <div className="mb-4">🎉 <strong>Exercícios Completos!</strong></div>
                          <div>Excelente! Você canalizou sua energia de forma positiva. Sinta a endorfina correndo pelo seu corpo. Você escolheu força em vez de fraqueza.</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {QUICK_EXERCISES.map((exercise, index) => (
                            <div key={exercise.id} className="bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                              <div className="font-bold text-green-400">✅ {exercise.name}</div>
                              <div className="text-green-200">{exercise.duration}</div>
                            </div>
                          ))}
                        </div>

                        <Button 
                          onClick={handleFinishCrisis}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-4"
                        >
                          ✅ Finalizar Crise
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {selectedAction === 'reflection' && (
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-cyan-300">🧠 Reflexão Guiada</h2>
                    
                    <div className="text-xl text-white leading-relaxed font-medium p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
                      "{CRISIS_REFLECTIONS[currentReflectionIndex]}"
                    </div>

                    <div className="space-y-4">
                      <Button 
                        onClick={() => setCurrentReflectionIndex(Math.floor(Math.random() * CRISIS_REFLECTIONS.length))}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg py-4"
                      >
                        🔄 Outra Reflexão
                      </Button>
                      
                      <Button 
                        onClick={handleFinishCrisis}
                        variant="outline"
                        className="w-full border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 text-lg py-4"
                      >
                        ✅ Finalizar Crise
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    if (currentScreen === 'final') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="text-6xl mb-6">🌟</div>
              <h1 className="text-4xl font-bold text-green-300">
                Você Venceu Esta Batalha
              </h1>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 space-y-6">
              <div className="text-xl text-white leading-relaxed">
                "Você acabou de vencer uma batalha invisível. Cada vez que resiste, o cérebro aprende um novo caminho. Isso é reprogramação real."
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-6 rounded-lg border border-green-500/30">
              <div className="text-green-200 font-medium text-lg space-y-4">
                <div>
                  🧠 Você fortaleceu suas conexões neurais de autocontrole
                </div>
                <div>
                  💪 Provou que tem poder sobre seus impulsos
                </div>
                <div>
                  🌱 Cada resistência constrói uma versão mais forte de você
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleFinalFinishCrisis}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-4"
              >
                Voltar ao Progresso
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }

  const currentPhase = getCurrentPhase()
  // CORREÇÃO PRINCIPAL AQUI - garantir que unlockedRituals seja sempre um array
  const safeUnlockedRituals = userProgress.unlockedRituals && Array.isArray(userProgress.unlockedRituals) ? userProgress.unlockedRituals : []
  const unlockedRituals = RITUALS.filter(ritual => 
    safeUnlockedRituals.includes(ritual.id)
  )
  const lockedRituals = RITUALS.filter(ritual => 
    !safeUnlockedRituals.includes(ritual.id)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              🧠 REBOOT
            </h1>
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-xl text-white mb-4">90 Dias para a Liberdade</div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <div className="text-cyan-300 italic text-lg">"{currentQuote}"</div>
          </div>
        </div>

        {/* Diálogo de Celebração do Dia 90 */}
        <Dialog open={showDay90Celebration} onOpenChange={setShowDay90Celebration}>
          <DialogContent className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 border-yellow-500/50 max-w-4xl max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <DialogHeader>
              <DialogTitle className="text-yellow-300 text-3xl sm:text-4xl text-center font-bold px-2">
                🏆 PARABÉNS! VOCÊ CONQUISTOU A LIBERDADE! 🏆
              </DialogTitle>
              <DialogDescription className="text-center">
                <div className="space-y-6 sm:space-y-8 mt-6 px-2">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-300">
                    🎉 90 DIAS DE TRANSFORMAÇÃO COMPLETOS! 🎉
                  </div>
                  
                  <div className="bg-black/30 p-6 sm:p-8 rounded-lg border border-yellow-500/30">
                    <div className="text-white text-lg sm:text-xl leading-relaxed space-y-4">
                      <div>
                        Você não apenas venceu um vício - você se tornou um guerreiro da autodisciplina!
                      </div>
                      <div>
                        Cada dia foi uma batalha vencida, cada ritual foi um passo em direção à sua melhor versão.
                      </div>
                      <div>
                        Você provou que tem o poder de dominar seus impulsos e criar a vida que sempre sonhou.
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-6 sm:p-8 rounded-lg border border-yellow-400/30">
                    <div className="text-yellow-200 font-medium text-lg sm:text-xl space-y-4">
                      <div>
                        🌟 Esta conquista é apenas o começo de uma jornada ainda mais extraordinária!
                      </div>
                      <div>
                        Você agora possui as ferramentas, a força e a sabedoria para enfrentar qualquer desafio.
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-yellow-300">
                        💪 Continue sendo essa versão poderosa de si mesmo - o mundo precisa da sua luz!
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="text-green-300 font-bold">DISCIPLINA</div>
                      <div className="text-green-200 text-sm">Conquistada</div>
                    </div>
                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                      <div className="text-2xl mb-2">🧠</div>
                      <div className="text-blue-300 font-bold">AUTOCONTROLE</div>
                      <div className="text-blue-200 text-sm">Dominado</div>
                    </div>
                    <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                      <div className="text-2xl mb-2">⚡</div>
                      <div className="text-purple-300 font-bold">LIBERDADE</div>
                      <div className="text-purple-200 text-sm">Alcançada</div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowDay90Celebration(false)}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-lg sm:text-xl py-4"
                  >
                    🚀 Continuar Sendo Livre
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Celebração de Nova Fase */}
        <Dialog open={showPhaseCelebration} onOpenChange={setShowPhaseCelebration}>
          <DialogContent className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 border-yellow-500/50 max-w-2xl max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <DialogHeader>
              <DialogTitle className="text-yellow-300 text-2xl sm:text-3xl text-center font-bold px-2">
                {PHASE_CELEBRATION_MESSAGES[celebrationPhase as keyof typeof PHASE_CELEBRATION_MESSAGES]?.title}
              </DialogTitle>
              <DialogDescription className="text-center">
                <div className="space-y-4 sm:space-y-6 mt-4 px-2">
                  <div className="text-xl sm:text-2xl font-bold text-orange-300">
                    {PHASE_CELEBRATION_MESSAGES[celebrationPhase as keyof typeof PHASE_CELEBRATION_MESSAGES]?.subtitle}
                  </div>
                  
                  <div className="bg-black/30 p-4 sm:p-6 rounded-lg border border-yellow-500/30">
                    <div className="text-white text-base sm:text-lg leading-relaxed">
                      {PHASE_CELEBRATION_MESSAGES[celebrationPhase as keyof typeof PHASE_CELEBRATION_MESSAGES]?.message}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-3 sm:p-4 rounded-lg border border-yellow-400/30">
                    <div className="text-yellow-200 font-medium text-base sm:text-lg">
                      {PHASE_CELEBRATION_MESSAGES[celebrationPhase as keyof typeof PHASE_CELEBRATION_MESSAGES]?.motivation}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowPhaseCelebration(false)}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-base sm:text-lg py-3"
                  >
                    🚀 Continuar Jornada
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Diálogo do Dia 0 */}
        <Dialog open={showDay0Dialog} onOpenChange={() => {}}>
          <DialogContent className="bg-slate-900 border-cyan-500/30 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 text-2xl">🎉 Parabéns pela sua decisão!</DialogTitle>
              <DialogDescription className="text-white text-lg">
                Hoje você inicia uma jornada de reconstrução e autodomínio.
                Durante os próximos 90 dias, você vai reprogramar sua mente, fortalecer sua vontade e se libertar de um ciclo que não define quem você é.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="text-cyan-400 font-bold mb-4">✍️ "O Diário da Verdade"</h3>
                <div className="text-white mb-4">Escreva suas respostas no diário do app:</div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-white mb-2">Quais são seus sentimentos sobre a pornografia e a masturbação?</div>
                    <Textarea 
                      value={day0Answers.feelings}
                      onChange={(e) => setDay0Answers({...day0Answers, feelings: e.target.value})}
                      placeholder="Seja honesto sobre seus sentimentos..."
                      className="bg-black/40 border-gray-600 text-white min-h-[60px]"
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm text-white mb-2">Quais são suas expectativas para os próximos 90 dias?</div>
                    <Textarea 
                      value={day0Answers.expectations}
                      onChange={(e) => setDay0Answers({...day0Answers, expectations: e.target.value})}
                      placeholder="O que você espera alcançar..."
                      className="bg-black/40 border-gray-600 text-white min-h-[60px]"
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm text-white mb-2">Como você imagina sua vida sem esses hábitos?</div>
                    <Textarea 
                      value={day0Answers.lifeWithout}
                      onChange={(e) => setDay0Answers({...day0Answers, lifeWithout: e.target.value})}
                      placeholder="Visualize sua nova vida..."
                      className="bg-black/40 border-gray-600 text-white min-h-[60px]"
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm text-white mb-2">O que tem te impedido de parar até hoje?</div>
                    <Textarea 
                      value={day0Answers.obstacles}
                      onChange={(e) => setDay0Answers({...day0Answers, obstacles: e.target.value})}
                      placeholder="Identifique os obstáculos..."
                      className="bg-black/40 border-gray-600 text-white min-h-[60px]"
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm text-white mb-2">Quem você quer se tornar após essa jornada?</div>
                    <Textarea 
                      value={day0Answers.newSelf}
                      onChange={(e) => setDay0Answers({...day0Answers, newSelf: e.target.value})}
                      placeholder="Descreva seu novo eu..."
                      className="bg-black/40 border-gray-600 text-white min-h-[60px]"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={completeDay0}
                  className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-lg py-3"
                  disabled={!day0Answers.feelings || !day0Answers.expectations || !day0Answers.lifeWithout || !day0Answers.obstacles || !day0Answers.newSelf}
                >
                  Iniciar Jornada (+20 pts)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Desbloqueio */}
        <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
          <DialogContent className="bg-slate-900 border-yellow-500/50 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-yellow-400 text-center text-2xl">🔓 Ritual Desbloqueado!</DialogTitle>
            </DialogHeader>
            {newlyUnlockedRitual && newlyUnlockedRitual.name && (
              <div className="text-center space-y-4">
                <div className="text-6xl">{newlyUnlockedRitual.icon || '🎯'}</div>
                <h3 className="text-xl font-bold text-white">{newlyUnlockedRitual.name}</h3>
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-cyan-300 italic">{newlyUnlockedRitual.unlockMessage || 'Novo ritual desbloqueado!'}</div>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  +{newlyUnlockedRitual.points || 0} pontos por dia
                </Badge>
                <Button 
                  onClick={() => setShowUnlockDialog(false)}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600"
                >
                  Começar Ritual
                </Button>
              </div>
            )}
            {(!newlyUnlockedRitual || !newlyUnlockedRitual.name) && (
              <div className="text-center space-y-4">
                <div className="text-6xl">🎯</div>
                <h3 className="text-xl font-bold text-white">Ritual Desbloqueado!</h3>
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-cyan-300 italic">Novo ritual desbloqueado!</div>
                </div>
                <Button 
                  onClick={() => setShowUnlockDialog(false)}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600"
                >
                  Continuar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modo Recuperação */}
        {showRecoveryMode && (
          <Card className="text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm mb-8 bg-red-900/40 border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-300 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Modo Recuperação Ativo
              </CardTitle>
              <CardDescription className="text-sm text-red-200">
                {relapseData.length === 1 && "Primeira Recaída - O Despertar"}
                {relapseData.length === 2 && "Segunda Recaída - A Resistência do Hábito"}
                {relapseData.length === 3 && "Terceira Recaída - A Persistência"}
                {relapseData.length === 4 && "Quarta Recaída - O Teste da Determinação"}
                {relapseData.length === 5 && "Quinta Recaída - A Batalha Interior"}
                {relapseData.length >= 6 && `${relapseData.length}ª Recaída - A Jornada Continua`}
                <br />
                {isReflectionPeriod ? (
                  <span className="text-orange-300 font-bold">
                    ⏱️ Período de reflexão: {reflectionTimer}s restantes
                  </span>
                ) : (
                  `Tempo restante: ${formatTime(getRemainingRecoveryTime())}`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isReflectionPeriod && (
                <div className="mb-6 p-4 bg-orange-900/40 border border-orange-500/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-orange-400" />
                    <h4 className="text-orange-300 font-bold">Momento de Reflexão</h4>
                  </div>
                  <div className="text-orange-200 text-sm mb-3">
                    Durante os próximos {reflectionTimer} segundos, todas as funções do app estão bloqueadas. 
                    Este é um momento sagrado para você refletir sobre o que aconteceu e se reconectar com seus objetivos.
                  </div>
                  <div className="w-full bg-orange-900/30 rounded-full h-2">
                    <div 
                      className="bg-orange-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((40 - reflectionTimer) / 40) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Reflexão Profunda */}
                <div className="bg-black/30 p-4 rounded-lg">
                  <h4 className="text-red-300 font-bold mb-3">🧠 Reflexão Profunda</h4>
                  <div className="text-red-100 text-sm leading-relaxed">
                    {DEEP_REFLECTIONS[Math.min(relapseData.length - 1, DEEP_REFLECTIONS.length - 1)]}
                  </div>
                </div>
                
                {/* Exercício de Respiração */}
                <div className="bg-black/30 p-4 rounded-lg">
                  <h4 className="text-red-300 font-bold mb-3">🫁 Exercício de Respiração</h4>
                  <div className="text-red-100 text-sm">
                    Respire fundo: 4 segundos inspirando, 7 segurando, 8 expirando. Repita 10 vezes. Isso acalma o sistema nervoso e reduz a ansiedade.
                  </div>
                </div>
                
                {/* Momento de Autocompaixão */}
                <div className="bg-black/30 p-4 rounded-lg">
                  <h4 className="text-red-300 font-bold mb-3">💝 Momento de Autocompaixão</h4>
                  <div className="text-red-100 text-sm">
                    {SELF_COMPASSION_PHRASES[Math.floor(Math.random() * SELF_COMPASSION_PHRASES.length)]}
                  </div>
                </div>
                
                {/* Mensagem de Recuperação */}
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="text-blue-300 font-bold mb-3">🌟 Mensagem de Recuperação</h4>
                  <div className="text-blue-200 text-sm mb-3">
                    Não se culpe, não pese mentalmente a situação, apenas relaxe.
                  </div>
                  <div className="text-blue-200 text-sm mb-3">
                    Tire esses próximos 40 segundos para refletir, aprender mais sobre si mesmo e colocar a mente no lugar. Este tempo não é uma punição - é um presente que você está dando a si mesmo para crescer e se fortalecer.
                  </div>
                  <div className="text-blue-200 text-sm font-medium">
                    Você é mais forte do que imagina, e esta experiência é parte da sua jornada de autodescoberta.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Phase */}
        <Card className="mb-8 bg-black/40 backdrop-blur-sm border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                {currentPhase === 'Fundação' && '🏗️'}
                {currentPhase === 'Consolidação' && '💪'}
                {currentPhase === 'Expansão' && '🌱'}
                {currentPhase === 'Ascensão' && '👑'}
              </div>
              <div>
                <h3 className="text-2xl text-white">Fase: {currentPhase}</h3>
                <div className="text-blue-300">Dia {userProgress.currentDay} de 90</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-blue-300 mb-2">
                  <span>Progresso da Fase</span>
                  <span>{Math.round(getPhaseProgress())}%</span>
                </div>
                <Progress value={getPhaseProgress()} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-sm border-cyan-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="leading-none font-semibold text-cyan-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Nível {getCurrentPhase() === 'Fundação' ? 1 : getCurrentPhase() === 'Consolidação' ? 2 : getCurrentPhase() === 'Expansão' ? 3 : 4}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">{userProgress.points}</div>
              <div className="text-sm text-white">pontos de autodomínio</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Sequência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{userProgress.currentStreak}</div>
              <div className="text-sm text-white">dias limpos</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-yellow-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Recorde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{userProgress.longestStreak}</div>
              <div className="text-sm text-white">melhor sequência</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{userProgress.currentDay}/90</div>
              <div className="text-sm text-white">dias completos</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Rituais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">{unlockedRituals.length}</div>
              <div className="text-sm text-white">desbloqueados</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 px-2">
          <Button 
            onClick={addCleanDay}
            disabled={isReflectionPeriod}
            className={`px-4 sm:px-8 py-3 text-base sm:text-lg ${
              isReflectionPeriod 
                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            } text-white`}
          >
            <span className="hidden sm:inline">{isReflectionPeriod ? '⏱️ Aguarde...' : '✅ Registrar Dia Limpo (+10 pts)'}</span>
            <span className="sm:hidden">{isReflectionPeriod ? '⏱️ Aguarde...' : '✅ Dia Limpo'}</span>
          </Button>
          
          <Dialog open={showRelapseMode} onOpenChange={setShowRelapseMode}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive"
                disabled={isReflectionPeriod}
                className={`px-4 sm:px-8 py-3 text-base sm:text-lg ${
                  isReflectionPeriod 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                }`}
              >
                <span className="hidden sm:inline">💔 Tive uma Recaída</span>
                <span className="sm:hidden">💔 Recaída</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-red-500/30 max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-red-400">Você teve uma recaída?</DialogTitle>
                <DialogDescription className="text-white">
                  O que te fez escorregar hoje? Reflita e escreva em uma linha. Lembre-se: a queda não apaga o caminho percorrido.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-white mb-2">O que você sentiu antes da recaída?</div>
                  <Textarea 
                    value={relapseForm.feelings}
                    onChange={(e) => setRelapseForm({...relapseForm, feelings: e.target.value})}
                    placeholder="Descreva suas emoções..."
                    className="bg-black/40 border-gray-600 text-white min-h-[60px]"
                  />
                </div>
                <div>
                  <div className="text-sm text-white mb-2">Qual foi o gatilho principal?</div>
                  <Textarea 
                    value={relapseForm.triggers}
                    onChange={(e) => setRelapseForm({...relapseForm, triggers: e.target.value})}
                    placeholder="Identifique os gatilhos e situações..."
                    className="bg-black/40 border-gray-600 text-white min-h-[60px]"
                  />
                </div>
                <div>
                  <div className="text-sm text-white mb-2">Que horas aconteceu?</div>
                  <Textarea 
                    value={relapseForm.timeOfDay}
                    onChange={(e) => setRelapseForm({...relapseForm, timeOfDay: e.target.value})}
                    placeholder="Horário da recaída..."
                    className="bg-black/40 border-gray-600 text-white min-h-[60px]"
                  />
                </div>
                <div>
                  <div className="text-sm text-white mb-2">Qual era a situação?</div>
                  <Textarea 
                    value={relapseForm.situation}
                    onChange={(e) => setRelapseForm({...relapseForm, situation: e.target.value})}
                    placeholder="Descreva a situação..."
                    className="bg-black/40 border-gray-600 text-white min-h-[60px]"
                  />
                </div>
                <Button 
                  onClick={handleRelapse}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                  disabled={!relapseForm.triggers || !relapseForm.feelings || !relapseForm.timeOfDay || !relapseForm.situation}
                >
                  Registrar e Iniciar Recuperação
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={() => {
              setShowCrisisMode(true)
              setCurrentScreen('crisis')
              setCrisisCountdown(60) // Reset contador quando abrir
            }}
            className="px-4 sm:px-8 py-3 text-base sm:text-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            disabled={isReflectionPeriod}
          >
            <span className="hidden sm:inline">🚨 Estou em Crise</span>
            <span className="sm:hidden">🚨 Crise</span>
          </Button>

          <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                disabled={isReflectionPeriod}
                className={`px-4 sm:px-8 py-3 text-base sm:text-lg ${
                  isReflectionPeriod 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'border-orange-500 text-orange-400 hover:bg-orange-500/10'
                }`}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Reiniciar Jornada</span>
                <span className="sm:hidden">Reiniciar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-orange-500/30">
              <DialogHeader>
                <DialogTitle className="text-orange-400">Confirmar Reinicialização</DialogTitle>
                <DialogDescription className="text-white">
                  Esta ação irá apagar TODOS os seus dados permanentemente. Esta ação não pode ser desfeita!
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-4 justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}
                  className="border-gray-500 text-gray-400"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={resetAllData}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  Sim, Reiniciar Tudo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content Tabs */}
        <div className="pb-20 sm:pb-0">
        <Tabs defaultValue="rituals" className="w-full">
          <TabsList className="fixed bottom-0 left-0 right-0 z-50 h-16 items-center justify-center rounded-none p-2 text-white grid w-full grid-cols-6 bg-black/90 backdrop-blur-sm border-t border-white/10 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:z-auto sm:h-9 sm:rounded-lg sm:p-[3px] sm:border-t-0 sm:bg-black/40">
            <TabsTrigger value="rituals" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-white">
              <Target className="w-4 h-4 sm:mr-2 text-white" />
              <span className="text-white hidden sm:inline">Rituais</span>
            </TabsTrigger>
            <TabsTrigger value="progresso" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white">
              <Activity className="w-4 h-4 sm:mr-2 text-white" />
              <span className="text-white hidden sm:inline">Progresso</span>
            </TabsTrigger>
            <TabsTrigger value="warrior" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-white">
              <BarChart3 className="w-4 h-4 sm:mr-2 text-white" />
              <span className="text-white hidden sm:inline">Mural</span>
            </TabsTrigger>
            <TabsTrigger value="diary" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white">
              <PenTool className="w-4 h-4 sm:mr-2 text-white" />
              <span className="text-white hidden sm:inline">Diário</span>
            </TabsTrigger>
            <TabsTrigger value="motivos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white">
              <Heart className="w-4 h-4 sm:mr-2 text-white" />
              <span className="text-white hidden sm:inline">Motivos</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-white">
              <BookOpen className="w-4 h-4 sm:mr-2 text-white" />
              <span className="text-white hidden sm:inline">Educação</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rituals" className="space-y-4">
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">Rituais Diários</CardTitle>
                <CardDescription className="text-white">
                  Complete os rituais desbloqueados para ganhar pontos e fortalecer sua disciplina
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rituais Desbloqueados */}
                {unlockedRituals.map((ritual) => (
                  <div key={ritual.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{ritual.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{ritual.name}</h4>
                        <div className="text-sm text-white">{ritual.description}</div>
                        <Badge variant="outline" className="mt-2 border-green-500 text-green-400">
                          {ritual.phase}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-400 font-bold">+{ritual.points} pts</div>
                      <Button
                        size="sm"
                        onClick={() => completeRitual(ritual.id)}
                        disabled={isReflectionPeriod}
                        className={`mt-2 ${
                          isReflectionPeriod 
                            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isReflectionPeriod ? '⏱️' : '✅'} Feito hoje
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Rituais Bloqueados */}
                {lockedRituals.map((ritual) => (
                  <div key={ritual.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-gray-600/30 opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl blur-sm">{ritual.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-400 blur-sm">{ritual.name}</h4>
                        <div className="text-sm text-gray-500 blur-sm">{ritual.description}</div>
                        <Badge variant="outline" className="mt-2 border-gray-600 text-gray-500">
                          {ritual.phase}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 font-bold">+{ritual.points} pts</div>
                      <div className="text-sm text-yellow-400 mt-2">🔒 Libera no Dia {ritual.unlockDay}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progresso" className="space-y-4">
            <Card className="bg-black/40 backdrop-blur-sm border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-indigo-400 flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Progresso de Dias
                </CardTitle>
                <CardDescription className="text-white">
                  Acompanhe sua evolução neurocientífica e emocional ao longo dos 90 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progresso Atual */}
                <div className={`p-6 rounded-lg border ${getCurrentDayInfo().borderColor} ${getCurrentDayInfo().bgColor}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                      {userProgress.currentDay}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${getCurrentDayInfo().color}`}>
                        {getCurrentDayInfo().title}
                      </h3>
                      <div className="text-white text-sm opacity-80">
                        Fase: {getCurrentDayInfo().phase}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${getCurrentDayInfo().color} text-lg leading-relaxed`}>
                    {getCurrentDayInfo().description}
                  </div>
                  
                  {/* Barra de Progresso Visual */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-white mb-2">
                      <span>Progresso Geral</span>
                      <span>{Math.round((userProgress.currentDay / 90) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${(userProgress.currentDay / 90) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Indicador Visual do Cérebro */}
                  <div className="mt-6 flex items-center justify-center">
                    <div className="relative">
                      <Brain className="w-20 h-20 text-indigo-400" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${
                          userProgress.currentDay < 30 ? 'bg-red-400' :
                          userProgress.currentDay < 60 ? 'bg-yellow-400' :
                          userProgress.currentDay < 90 ? 'bg-blue-400' : 'bg-green-400'
                        } animate-pulse`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão para Ver Todas as Fases */}
                <div className="text-center">
                  <Button
                    onClick={() => setShowAllPhases(!showAllPhases)}
                    variant="outline"
                    className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    {showAllPhases ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Ocultar Fases Anteriores
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Ver Todas as Fases da Jornada
                      </>
                    )}
                  </Button>
                </div>

                {/* Fases Anteriores */}
                {showAllPhases && (
                  <div className="space-y-4">
                    <h4 className="text-indigo-400 font-bold text-lg">📚 Revisão da Jornada</h4>
                    {getPreviousPhases().reverse().map((phase, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${phase.borderColor} ${phase.bgColor} opacity-80`}>
                        <h5 className={`font-bold ${phase.color} mb-2`}>
                          {phase.title}
                        </h5>
                        <div className="text-white text-sm opacity-90">
                          {phase.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Fase: {phase.phase} ✓ Concluída
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Próximas Fases (Preview) */}
                {userProgress.currentDay < 90 && (
                  <div className="space-y-4">
                    <h4 className="text-indigo-400 font-bold text-lg">🔮 Próximas Conquistas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(DAY_PROGRESS_INFO)
                        .filter(([key]) => {
                          if (key === '0') return false
                          const ranges = key.split('-')
                          if (ranges.length === 2) {
                            const start = parseInt(ranges[0])
                            return start > userProgress.currentDay
                          }
                          const day = parseInt(key)
                          return day > userProgress.currentDay
                        })
                        .slice(0, 4)
                        .map(([key, phase]) => (
                          <div key={key} className="p-4 bg-gray-800/30 rounded-lg border border-gray-600/30 opacity-60">
                            <h5 className="font-bold text-gray-400 mb-2">
                              {phase.title}
                            </h5>
                            <div className="text-gray-500 text-sm">
                              {phase.description}
                            </div>
                            <div className="text-xs text-gray-600 mt-2">
                              🔒 Desbloqueado em breve
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warrior" className="space-y-4">
            <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Mural do Guerreiro
                </CardTitle>
                <CardDescription className="text-white">
                  Acompanhe seu progresso individual em cada ritual desbloqueado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unlockedRituals.length > 0 ? (
                    unlockedRituals.map((ritual) => {
                      const completedCount = userProgress.completedRituals[ritual.id] || 0
                      return (
                        <div key={ritual.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{ritual.icon}</div>
                            <div>
                              <h4 className="font-semibold text-white">{ritual.name}</h4>
                              <div className="text-sm text-orange-300">
                                {ritual.icon} {completedCount} dias de {ritual.name.toLowerCase()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {completedCount >= 10 && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 mb-1">
                                🔥 {completedCount} dias seguidos
                              </Badge>
                            )}
                            <div className="text-orange-400 font-bold">
                              {completedCount * ritual.points} pts totais
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <div className="text-gray-400">Nenhum ritual desbloqueado ainda.</div>
                      <div className="text-gray-500 text-sm">Complete o Dia 0 para começar sua jornada!</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Estatísticas Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-white">Progresso Geral</span>
                      <span className="text-cyan-400 font-bold">{Math.round((userProgress.currentDay / 90) * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-white">Fase Atual</span>
                      <span className="text-purple-400 font-bold">{currentPhase}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-white">Rituais Ativos</span>
                      <span className="text-green-400 font-bold">{unlockedRituals.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-white">Reflexões Escritas</span>
                      <span className="text-blue-400 font-bold">{userProgress.reflectionsCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Histórico de Recaídas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relapseData.length > 0 ? (
                      <>
                        <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                          <span className="text-white">Total de Recaídas</span>
                          <Badge variant="destructive">{relapseData.length}</Badge>
                        </div>
                        <div className="space-y-2">
                          {relapseData.slice(0, 3).map((relapse, index) => (
                            <div key={index} className="p-3 bg-black/20 rounded-lg border border-red-500/20">
                              <div className="text-red-300 font-semibold mb-2">{relapse.date}</div>
                              <div className="space-y-2">
                                <div className="bg-red-900/20 p-2 rounded">
                                  <div className="text-red-200 font-medium text-xs mb-1">O que você sentiu antes da recaída?</div>
                                  <div className="text-white text-xs pl-2 border-l-2 border-red-400">{relapse.feelings.replace('O que você sentiu antes da recaída? ', '')}</div>
                                </div>
                                <div className="bg-red-900/20 p-2 rounded">
                                  <div className="text-red-200 font-medium text-xs mb-1">Qual foi o gatilho principal?</div>
                                  <div className="text-white text-xs pl-2 border-l-2 border-red-400">{relapse.triggers.replace('Qual foi o gatilho principal? ', '')}</div>
                                </div>
                                <div className="bg-red-900/20 p-2 rounded">
                                  <div className="text-red-200 font-medium text-xs mb-1">Que horas aconteceu?</div>
                                  <div className="text-white text-xs pl-2 border-l-2 border-red-400">{relapse.timeOfDay.replace('Que horas aconteceu? ', '')}</div>
                                </div>
                                <div className="bg-red-900/20 p-2 rounded">
                                  <div className="text-red-200 font-medium text-xs mb-1">Qual era a situação?</div>
                                  <div className="text-white text-xs pl-2 border-l-2 border-red-400">{relapse.situation.replace('Qual era a situação? ', '')}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-white text-center py-4">
                        Nenhuma recaída registrada. Continue forte! 💪
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="diary" className="space-y-4">
            <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">Diário Emocional</CardTitle>
                <CardDescription className="text-white">
                  Registre seus pensamentos e sentimentos para entender melhor seus padrões
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-white mb-2">Como você se sente hoje? O que aprendeu sobre si mesmo?</div>
                  <Textarea
                    value={dailyReflection}
                    onChange={(e) => setDailyReflection(e.target.value)}
                    disabled={isReflectionPeriod}
                    placeholder={isReflectionPeriod ? "Aguarde o período de reflexão terminar..." : "Escreva suas reflexões aqui..."}
                    className={`bg-black/40 border-gray-600 min-h-[120px] text-white ${
                      isReflectionPeriod ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <Button 
                    onClick={saveReflection}
                    disabled={!dailyReflection.trim() || isReflectionPeriod}
                    className={`mt-3 ${
                      isReflectionPeriod 
                        ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600'
                    }`}
                  >
                    {isReflectionPeriod ? '⏱️ Aguarde...' : 'Salvar Reflexão (+5 pts)'}
                  </Button>
                </div>
                
                {reflections.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-3">Reflexões Anteriores</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {reflections.map((reflection, index) => (
                        <div key={index} className="p-3 bg-black/30 rounded-lg">
                          <div className="text-sm text-white mb-1">{reflection.date}</div>
                          <div className="text-white whitespace-pre-wrap">
                            {formatDiaryText(reflection.content)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="motivos" className="space-y-4">
            <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  Meus Motivos
                </CardTitle>
                <CardDescription className="text-white">
                  <span className="text-lg font-medium text-blue-300 mb-2 block">
                    "Volte às suas razões. É por elas que você começou."
                  </span>
                  Escreva seus objetivos e motivações pessoais. Receba lembretes personalizados com suas próprias palavras.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configurações de Notificação */}
                <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-5 h-5 text-blue-400" />
                    <h4 className="text-blue-400 font-semibold">Receber Lembretes</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Ativar lembretes automáticos</div>
                        <div className="text-sm text-gray-400">Receba suas motivações pessoais como notificações</div>
                      </div>
                      <Switch
                        checked={motivationSettings.enabled}
                        onCheckedChange={toggleNotifications}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                    
                    {motivationSettings.enabled && (
                      <div>
                        <div className="text-sm text-white mb-2">Frequência dos lembretes:</div>
                        <Select value={motivationSettings.frequency.toString()} onValueChange={(value) => updateNotificationFrequency(parseInt(value))}>
                          <SelectTrigger className="bg-black/40 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-gray-600">
                            <SelectItem value="1" className="text-white hover:bg-slate-700">A cada 1 dia</SelectItem>
                            <SelectItem value="2" className="text-white hover:bg-slate-700">A cada 2 dias</SelectItem>
                            <SelectItem value="3" className="text-white hover:bg-slate-700">A cada 3 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Dialog open={showAddMotivation} onOpenChange={setShowAddMotivation}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {motivations.length === 0 ? 'Adicionar Primeira Motivação' : 'Adicionar Nova Motivação'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-blue-500/30 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-blue-400">Nova Motivação</DialogTitle>
                        <DialogDescription className="text-white">
                          Escreva algo que te inspire e te lembre por que você começou essa jornada.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          value={newMotivation}
                          onChange={(e) => setNewMotivation(e.target.value)}
                          placeholder="Ex: Quero ser um exemplo para meus filhos, quero ter relacionamentos mais saudáveis, quero me sentir no controle da minha vida..."
                          className="bg-black/40 border-gray-600 text-white min-h-[120px]"
                        />
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => setShowAddMotivation(false)}
                            variant="outline"
                            className="flex-1 border-gray-500 text-gray-400"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={addMotivation}
                            disabled={!newMotivation.trim()}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {motivations.length > 0 && (
                    <Dialog open={showEditMotivations} onOpenChange={setShowEditMotivations}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10 flex items-center gap-2">
                          <Edit3 className="w-4 h-4" />
                          Editar Meus Motivos
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-blue-500/30 max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-blue-400">Editar Motivações</DialogTitle>
                          <DialogDescription className="text-white">
                            Gerencie suas motivações pessoais. Você pode editar ou remover qualquer uma delas.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {motivations.map((motivation) => (
                            <div key={motivation.id} className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                              {editingMotivation?.id === motivation.id ? (
                                <div className="space-y-3">
                                  <Textarea
                                    value={editMotivationText}
                                    onChange={(e) => setEditMotivationText(e.target.value)}
                                    className="bg-black/40 border-gray-600 text-white min-h-[80px]"
                                  />
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm"
                                      onClick={saveEditMotivation}
                                      disabled={!editMotivationText.trim()}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Salvar
                                    </Button>
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingMotivation(null)}
                                      className="border-gray-500 text-gray-400"
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-white mb-3 leading-relaxed">{motivation.text}</div>
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-400">
                                      Criado em: {new Date(motivation.createdAt).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startEditMotivation(motivation)}
                                        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </Button>
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={() => deleteMotivation(motivation.id)}
                                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {/* Lista de Motivações */}
                <div>
                  <h4 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Suas Motivações ({motivations.length})
                  </h4>
                  
                  {motivations.length > 0 ? (
                    <div className="space-y-4">
                      {motivations.map((motivation, index) => (
                        <div key={motivation.id} className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-4 rounded-lg border border-blue-500/30">
                          <div className="flex items-start gap-3">
                            <div className="text-blue-400 font-bold text-lg mt-1">#{index + 1}</div>
                            <div className="flex-1">
                              <div className="text-white leading-relaxed text-lg">{motivation.text}</div>
                              <div className="text-xs text-blue-300 mt-2">
                                Criado em: {new Date(motivation.createdAt).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <div className="text-gray-400 text-lg mb-2">Nenhuma motivação adicionada ainda</div>
                      <div className="text-gray-500 text-sm mb-6">
                        Adicione suas razões pessoais para vencer o vício e transformar sua vida.
                        <br />
                        Você receberá lembretes com suas próprias palavras de motivação.
                      </div>
                      <Button 
                        onClick={() => setShowAddMotivation(true)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeira Motivação
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border-green-500/30 relative">
                <CardHeader>
                  <CardTitle className="leading-none font-semibold text-green-400 flex items-center gap-2">
                    🧠 Neuroplasticidade: o poder de reprogramar seu cérebro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white space-y-4 text-sm leading-relaxed">
                    <div>
                      Seu cérebro pode se reprogramar. Cada dia limpo fortalece novos caminhos neurais e enfraquece os antigos padrões viciantes.
                    </div>
                    
                    {(userProgress.unlockedEducation && Array.isArray(userProgress.unlockedEducation) && userProgress.unlockedEducation.includes('neuroplasticity')) ? (
                      <>
                        {neuroplasticityExpanded && (
                          <>
                            <div>
                              A neuroplasticidade é a capacidade do cérebro de se adaptar, mudar e se reestruturar ao longo do tempo. Diferente do que se acreditava no passado, o cérebro não é uma máquina fixa — ele é um organismo vivo e moldável. Cada pensamento repetido, cada comportamento recorrente, cada hábito diário, esculpe e reforça conexões neurais específicas.
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-green-400 font-bold mb-2">🔁 Hábito, Recompensa, Repetição</h4>
                              <div>
                                No contexto da pornografia e da masturbação compulsiva, o cérebro constrói verdadeiras autoestradas neurais ligadas ao prazer instantâneo. Cada vez que você repete esse ciclo, esses caminhos ficam mais fortes, mais automáticos, mais difíceis de evitar. É por isso que, mesmo quando você quer parar, parece ser levado por um impulso que escapa do controle racional.
                              </div>
                              <div className="mt-2">
                                Mas aqui está a chave: isso não é definitivo.
                              </div>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-green-400 font-bold mb-2">💡 Você pode reprogramar sua mente</h4>
                              <div>
                                A neuroplasticidade funciona para o bem ou para o mal — e você pode usar isso a seu favor. Quando você inicia o processo de reboot, começa a interromper esses caminhos automáticos. A cada dia em que você escolhe resistir ao impulso, seu cérebro enfraquece as conexões associadas ao vício e, ao mesmo tempo, começa a construir novas rotas.
                              </div>
                              <div className="mt-2">
                                Esses novos caminhos são formados por escolhas conscientes:
                              </div>
                              <div className="ml-4 space-y-1 mt-2">
                                <div>Praticar exercícios físicos.</div>
                                <div>Se conectar com pessoas reais.</div>
                                <div>Criar rotinas saudáveis.</div>
                                <div>Se concentrar em projetos, metas e sonhos.</div>
                                <div>Substituir o prazer fácil pela satisfação genuína do progresso.</div>
                              </div>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-green-400 font-bold mb-2">📉 No começo, é difícil — e isso é normal</h4>
                              <div>
                                Os velhos caminhos ainda estão lá. Nos primeiros dias, você pode sentir:
                              </div>
                              <div className="ml-4 space-y-1 mt-2">
                                <div>Ansiedade ou inquietação,</div>
                                <div>Vontade forte de voltar ao hábito,</div>
                                <div>Dificuldade em se concentrar,</div>
                                <div>Sensação de que nada mais dá prazer.</div>
                              </div>
                              <div className="mt-2">
                                Esses sinais são parte do processo. O cérebro está sendo remapeado. É como fechar uma estrada que você usou por anos e começar a construir uma trilha nova, passo a passo.
                              </div>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-green-400 font-bold mb-2">🔨 Consistência constrói novas conexões</h4>
                              <div>
                                Cada vez que você diz não ao impulso, você está dizendo sim à sua reprogramação. Cada dia limpo é um investimento em um novo padrão neural. E quanto mais você reforça essas novas rotas com ações conscientes e saudáveis, mais fortes elas se tornam — até se tornarem automáticas.
                              </div>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-green-400 font-bold mb-2">🌱 O cérebro começa a responder de forma diferente</h4>
                              <div>
                                Com o tempo, os benefícios aparecem:
                              </div>
                              <div className="ml-4 space-y-1 mt-2">
                                <div>A ansiedade diminui.</div>
                                <div>O foco volta.</div>
                                <div>As coisas simples da vida passam a ter valor de novo.</div>
                                <div>A motivação e o propósito reaparecem.</div>
                              </div>
                              <div className="mt-2">
                                Seu cérebro começa a associar prazer com o que realmente importa, e não com estímulos falsos e passageiros.
                              </div>
                            </div>
                            
                            <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/30">
                              <h4 className="text-green-400 font-bold mb-2">💪 Em resumo</h4>
                              <div>A neuroplasticidade é a sua aliada na jornada de libertação.</div>
                              <div>A pornografia fortalece caminhos neurais destrutivos, mas cada dia longe dela permite ao seu cérebro criar novas conexões mais saudáveis.</div>
                              <div className="ml-4 space-y-1 mt-2">
                                <div>O velho padrão não é mais seu destino.</div>
                                <div>Você pode reescrever o código mental que te prende.</div>
                                <div>A transformação começa com a repetição das decisões certas — todos os dias.</div>
                              </div>
                              <div className="mt-2 font-bold">
                                Reprograme seu cérebro. Reconstrua sua vida.
                              </div>
                            </div>
                          </>
                        )}
                        
                        <Button 
                          onClick={() => setNeuroplasticityExpanded(!neuroplasticityExpanded)}
                          variant="outline" 
                          className="border-green-500 text-green-400 hover:bg-green-500/10 flex items-center gap-2"
                        >
                          {neuroplasticityExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Ler menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Ler mais
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="bg-black/30 p-4 rounded-lg border border-orange-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-5 h-5 text-orange-400" />
                          <h4 className="text-orange-400 font-bold">Conteúdo Bloqueado</h4>
                        </div>
                        <div className="text-orange-200 text-sm">
                          Este conteúdo educativo completo será desbloqueado quando você tiver 30 pontos. 
                          Continue completando rituais e registrando dias limpos para acessar!
                        </div>
                        <div className="mt-3 bg-orange-900/20 rounded-lg p-3">
                          <div className="text-orange-300 text-xs">
                            💡 Você tem {userProgress.points} pontos. Precisa de mais {Math.max(0, 30 - userProgress.points)} pontos para desbloquear.
                          </div>
                        </div>
                        <Button 
                          onClick={() => unlockEducationContent('neuroplasticity')}
                          disabled={userProgress.points < 30}
                          className={`w-full mt-3 ${
                            userProgress.points >= 30 
                              ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white' 
                              : 'bg-orange-600/20 text-orange-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Desbloquear com 30 pontos
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30">
                <CardHeader>
                  <CardTitle className="leading-none font-semibold text-blue-400 flex items-center gap-2">
                    ⚡ Sistema de Dopamina
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white space-y-4 text-sm leading-relaxed">
                    <div>
                      A pornografia sequestra seu sistema de recompensa. Aprenda como restaurar o equilíbrio natural da dopamina.
                    </div>
                    
                    {(userProgress.unlockedEducation && Array.isArray(userProgress.unlockedEducation) && userProgress.unlockedEducation.includes('dopamine')) ? (
                      <>
                        {dopamineExpanded && (
                          <>
                            <div>
                              A dopamina é o neurotransmissor da motivação e do prazer.
                              É ela que te faz buscar recompensas, criar objetivos e agir.
                              Em um cérebro saudável, a dopamina funciona como um sinal natural de incentivo — uma pequena descarga que surge quando você faz algo bom para o corpo e para a mente: se exercita, come bem, vence um desafio, se conecta com alguém de verdade.
                            </div>
                            
                            <div>
                              Mas quando a pornografia entra em cena, esse sistema é sequestrado.
                              Cada vídeo explícito, cada clique, cada nova cena libera uma explosão artificial de dopamina — muito acima do que o cérebro foi projetado para lidar.
                              Com o tempo, isso embota os receptores dopaminérgicos: o cérebro se acostuma com níveis absurdos de estímulo e começa a precisar de doses cada vez maiores para sentir o mesmo prazer.
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-blue-400 font-bold mb-2">💣 O efeito colateral invisível</h4>
                              <div>
                                O resultado é devastador.
                                Atividades simples e naturais — como conversar, estudar, trabalhar, treinar ou até estar com uma pessoa real — passam a parecer sem graça, cansativas e sem motivação.
                                O cérebro, viciado em dopamina instantânea, começa a rejeitar qualquer prazer que exija esforço.
                              </div>
                              
                              <div className="mt-2">
                                Isso cria o ciclo da escravidão:
                              </div>
                              
                              <div className="ml-4 mt-2">
                                <div>Estímulo extremo → pico de dopamina.</div>
                                <div>Queda brusca → vazio, tédio, culpa.</div>
                                <div>Busca por mais estímulo → novo ciclo.</div>
                              </div>
                              
                              <div className="mt-2">
                                A pornografia não só rouba sua energia mental, como corrompe o sistema de motivação responsável por tudo o que te faz evoluir.
                              </div>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-blue-400 font-bold mb-2">🔄 Como restaurar o equilíbrio</h4>
                              <div>
                                A boa notícia é que o cérebro pode se regenerar — e o REBOOT é justamente o processo dessa cura.
                                Quando você se afasta da pornografia e da masturbação compulsiva, o sistema de dopamina entra em recalibração.
                                Nos primeiros dias, é comum sentir:
                              </div>
                              
                              <div className="ml-4 mt-2">
                                <div>falta de prazer,</div>
                                <div>apatia,</div>
                                <div>irritação,</div>
                                <div>dificuldade de concentração.</div>
                              </div>
                              
                              <div className="mt-2">
                                Mas isso não é retrocesso — é reconstrução.
                                Seu cérebro está reaprendendo a sentir prazer pelas coisas reais da vida, ajustando lentamente os níveis de dopamina ao equilíbrio natural.
                              </div>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-blue-400 font-bold mb-2">🌱 A dopamina natural</h4>
                              <div>
                                Com o passar dos dias, algo incrível acontece:
                                pequenas ações voltam a gerar satisfação genuína.
                              </div>
                              
                              <div className="ml-4 mt-2">
                                <div>Um treino intenso.</div>
                                <div>Uma conversa profunda.</div>
                                <div>Um objetivo cumprido.</div>
                                <div>Um banho frio.</div>
                                <div>Um novo hábito mantido por 7 dias.</div>
                              </div>
                              
                              <div className="mt-2">
                                Cada uma dessas experiências começa a reativar o sistema de recompensa natural, devolvendo o senso de propósito, prazer e direção.
                              </div>
                            </div>
                            
                            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
                              <h4 className="text-blue-400 font-bold mb-2">💪 Em resumo</h4>
                              <div>A pornografia desregula o sistema de dopamina, criando picos artificiais e apatia crônica.</div>
                              <div>A abstinência e a reconstrução diária restauram o equilíbrio, devolvendo prazer ao que é real.</div>
                              <div>Cada dia limpo é um passo na reprogramação bioquímica da sua motivação.</div>
                              <div className="mt-2">
                                A dopamina não é sua inimiga.
                                Ela é o combustível da vida — você só precisa reensinar seu cérebro a usá-la do jeito certo.
                              </div>
                            </div>
                          </>
                        )}
                        
                        <Button 
                          onClick={() => setDopamineExpanded(!dopamineExpanded)}
                          variant="outline" 
                          className="border-blue-500 text-blue-400 hover:bg-blue-500/10 flex items-center gap-2"
                        >
                          {dopamineExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Ler menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Ler mais
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="bg-black/30 p-4 rounded-lg border border-orange-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-5 h-5 text-orange-400" />
                          <h4 className="text-orange-400 font-bold">Conteúdo Bloqueado</h4>
                        </div>
                        <div className="text-orange-200 text-sm">
                          Este conteúdo educativo completo será desbloqueado quando você tiver 30 pontos. 
                          Continue completando rituais e registrando dias limpos para acessar!
                        </div>
                        <div className="mt-3 bg-orange-900/20 rounded-lg p-3">
                          <div className="text-orange-300 text-xs">
                            💡 Você tem {userProgress.points} pontos. Precisa de mais {Math.max(0, 30 - userProgress.points)} pontos para desbloquear.
                          </div>
                        </div>
                        <Button 
                          onClick={() => unlockEducationContent('dopamine')}
                          disabled={userProgress.points < 30}
                          className={`w-full mt-3 ${
                            userProgress.points >= 30 
                              ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white' 
                              : 'bg-orange-600/20 text-orange-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Desbloquear com 30 pontos
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ADICIONANDO OS CARDS EDUCATIVOS QUE ESTAVAM FALTANDO */}
              <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
                <CardHeader>
                  <CardTitle className="leading-none font-semibold text-purple-400 flex items-center gap-2">
                    🎯 Autocontrole e Força de Vontade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white space-y-4 text-sm leading-relaxed">
                    <div>
                      O autocontrole é como um músculo: quanto mais você treina, mais forte fica. Aprenda técnicas científicas para fortalecer sua disciplina.
                    </div>
                    
                    {(userProgress.unlockedEducation && Array.isArray(userProgress.unlockedEducation) && userProgress.unlockedEducation.includes('autocontrole')) ? (
                      <>
                        {autocontroleExpanded && (
                          <>
                            <div>
                              O autocontrole não é uma característica fixa da personalidade — é uma habilidade que pode ser desenvolvida e fortalecida através da prática deliberada. Pesquisas em neurociência mostram que o córtex pré-frontal, responsável pelo controle executivo, pode ser "treinado" como qualquer outro músculo do corpo.
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-purple-400 font-bold mb-2">🧠 A Ciência do Autocontrole</h4>
                              <div>
                                Quando você resiste a um impulso, está literalmente exercitando o córtex pré-frontal. Cada "não" que você diz ao vício fortalece as conexões neurais responsáveis pela tomada de decisões conscientes. É por isso que pessoas que praticam meditação, exercícios físicos e outras disciplinas tendem a ter maior autocontrole em todas as áreas da vida.
                              </div>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-purple-400 font-bold mb-2">⚡ Técnicas Práticas</h4>
                              <div className="space-y-2">
                                <div><strong>Técnica dos 10 segundos:</strong> Quando sentir o impulso, conte até 10 respirando profundamente. Isso ativa o córtex pré-frontal.</div>
                                <div><strong>Visualização do futuro:</strong> Imagine-se daqui a 1 ano tendo vencido o vício. Como você se sente? O que mudou?</div>
                                <div><strong>Substituição de hábito:</strong> Quando o impulso surgir, faça imediatamente outra atividade (flexões, caminhada, leitura).</div>
                                <div><strong>Autocompaixão:</strong> Trate-se com gentileza. Autocrítica excessiva enfraquece o autocontrole.</div>
                              </div>
                            </div>
                            
                            <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/30">
                              <h4 className="text-purple-400 font-bold mb-2">💪 Fortalecendo Diariamente</h4>
                              <div>
                                Pequenos atos de disciplina diária fortalecem seu autocontrole geral: fazer a cama, tomar banho frio, meditar 5 minutos, ou resistir a um doce. Cada vitória pequena constrói sua capacidade de vencer desafios maiores.
                              </div>
                            </div>
                          </>
                        )}
                        
                        <Button 
                          onClick={() => setAutocontroleExpanded(!autocontroleExpanded)}
                          variant="outline" 
                          className="border-purple-500 text-purple-400 hover:bg-purple-500/10 flex items-center gap-2"
                        >
                          {autocontroleExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Ler menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Ler mais
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="bg-black/30 p-4 rounded-lg border border-orange-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-5 h-5 text-orange-400" />
                          <h4 className="text-orange-400 font-bold">Conteúdo Bloqueado</h4>
                        </div>
                        <div className="text-orange-200 text-sm">
                          Este conteúdo educativo completo será desbloqueado quando você tiver 30 pontos.
                        </div>
                        <div className="mt-3 bg-orange-900/20 rounded-lg p-3">
                          <div className="text-orange-300 text-xs">
                            💡 Você tem {userProgress.points} pontos. Precisa de mais {Math.max(0, 30 - userProgress.points)} pontos para desbloquear.
                          </div>
                        </div>
                        <Button 
                          onClick={() => unlockEducationContent('autocontrole')}
                          disabled={userProgress.points < 30}
                          className={`w-full mt-3 ${
                            userProgress.points >= 30 
                              ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white' 
                              : 'bg-orange-600/20 text-orange-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Desbloquear com 30 pontos
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="leading-none font-semibold text-yellow-400 flex items-center gap-2">
                    🍯 Gratificação Adiada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white space-y-4 text-sm leading-relaxed">
                    <div>
                      A capacidade de adiar gratificação é um dos maiores preditores de sucesso na vida. Desenvolva essa habilidade fundamental.
                    </div>
                    
                    {(userProgress.unlockedEducation && Array.isArray(userProgress.unlockedEducation) && userProgress.unlockedEducation.includes('gratificacao')) ? (
                      <>
                        {gratificacaoExpanded && (
                          <>
                            <div>
                              O famoso "Teste do Marshmallow" de Stanford mostrou que crianças capazes de esperar por uma segunda recompensa (em vez de pegar uma imediatamente) tiveram melhor desempenho acadêmico, relacionamentos mais saudáveis e menor incidência de vícios na vida adulta. A gratificação adiada é uma superpotência.
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-yellow-400 font-bold mb-2">🎯 O Poder da Espera</h4>
                              <div>
                                Quando você adia uma gratificação, está treinando seu cérebro para valorizar recompensas maiores e mais duradouras. No contexto do vício, isso significa trocar o prazer instantâneo (e vazio) por satisfações reais: relacionamentos, conquistas, crescimento pessoal, saúde mental.
                              </div>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-yellow-400 font-bold mb-2">🏆 Estratégias Práticas</h4>
                              <div className="space-y-2">
                                <div><strong>Regra dos 24h:</strong> Quando quiser algo, espere 24 horas antes de decidir.</div>
                                <div><strong>Recompensas escalonadas:</strong> "Se eu ficar limpo por 7 dias, vou me dar X."</div>
                                <div><strong>Visualização de consequências:</strong> Imagine como se sentirá após ceder vs. após resistir.</div>
                                <div><strong>Foco no processo:</strong> Celebre o ato de esperar, não apenas o resultado final.</div>
                              </div>
                            </div>
                            
                            <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/30">
                              <h4 className="text-yellow-400 font-bold mb-2">⏰ Construindo Paciência</h4>
                              <div>
                                Pratique gratificação adiada em pequenas coisas: espere 5 minutos antes de checar o celular, termine uma tarefa antes de se divertir, ou economize para algo que quer em vez de comprar no impulso. Cada pequena espera fortalece sua capacidade de resistir a impulsos maiores.
                              </div>
                            </div>
                          </>
                        )}
                        
                        <Button 
                          onClick={() => setGratificacaoExpanded(!gratificacaoExpanded)}
                          variant="outline" 
                          className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-2"
                        >
                          {gratificacaoExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Ler menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Ler mais
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="bg-black/30 p-4 rounded-lg border border-orange-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-5 h-5 text-orange-400" />
                          <h4 className="text-orange-400 font-bold">Conteúdo Bloqueado</h4>
                        </div>
                        <div className="text-orange-200 text-sm">
                          Este conteúdo educativo completo será desbloqueado quando você tiver 30 pontos.
                        </div>
                        <div className="mt-3 bg-orange-900/20 rounded-lg p-3">
                          <div className="text-orange-300 text-xs">
                            💡 Você tem {userProgress.points} pontos. Precisa de mais {Math.max(0, 30 - userProgress.points)} pontos para desbloquear.
                          </div>
                        </div>
                        <Button 
                          onClick={() => unlockEducationContent('gratificacao')}
                          disabled={userProgress.points < 30}
                          className={`w-full mt-3 ${
                            userProgress.points >= 30 
                              ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white' 
                              : 'bg-orange-600/20 text-orange-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Desbloquear com 30 pontos
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-red-500/30">
                <CardHeader>
                  <CardTitle className="leading-none font-semibold text-red-400 flex items-center gap-2">
                    🛡️ Tolerância e Escalação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white space-y-4 text-sm leading-relaxed">
                    <div>
                      Entenda como o vício progride através da tolerância e por que é crucial quebrar esse ciclo antes que ele se aprofunde.
                    </div>
                    
                    {(userProgress.unlockedEducation && Array.isArray(userProgress.unlockedEducation) && userProgress.unlockedEducation.includes('tolerancia')) ? (
                      <>
                        {toleranciaExpanded && (
                          <>
                            <div>
                              A tolerância é um mecanismo de defesa do cérebro contra estímulos excessivos. Quando exposto repetidamente a altos níveis de dopamina (através da pornografia), o cérebro reduz a sensibilidade dos receptores para se proteger. O resultado? Você precisa de estímulos cada vez mais intensos para sentir o mesmo prazer.
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-red-400 font-bold mb-2">📈 O Ciclo da Escalação</h4>
                              <div>
                                O que começou como curiosidade inocente pode evoluir para conteúdos cada vez mais extremos. Isso não acontece por "perversão", mas por necessidade neurológica: o cérebro precisa de estímulos mais fortes para ativar o sistema de recompensa embotado. É um ciclo perigoso que pode levar a comportamentos que você nunca imaginou.
                              </div>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-red-400 font-bold mb-2">⚠️ Sinais de Alerta</h4>
                              <div className="space-y-2">
                                <div>• Necessidade de conteúdo mais extremo para se excitar</div>
                                <div>• Perda de interesse em parceiros reais</div>
                                <div>• Tempo cada vez maior consumindo pornografia</div>
                                <div>• Sentimentos de culpa e vergonha crescentes</div>
                                <div>• Dificuldade de parar mesmo querendo</div>
                              </div>
                            </div>
                            
                            <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/30">
                              <h4 className="text-red-400 font-bold mb-2">🔄 Reversão da Tolerância</h4>
                              <div>
                                A boa notícia é que a tolerância pode ser revertida. Durante o reboot, os receptores de dopamina gradualmente recuperam sua sensibilidade normal. Isso explica por que, após semanas ou meses limpo, você pode voltar a sentir prazer em atividades simples que antes pareciam "sem graça".
                              </div>
                            </div>
                          </>
                        )}
                        
                        <Button 
                          onClick={() => setToleranciaExpanded(!toleranciaExpanded)}
                          variant="outline" 
                          className="border-red-500 text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          {toleranciaExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Ler menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Ler mais
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="bg-black/30 p-4 rounded-lg border border-orange-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-5 h-5 text-orange-400" />
                          <h4 className="text-orange-400 font-bold">Conteúdo Bloqueado</h4>
                        </div>
                        <div className="text-orange-200 text-sm">
                          Este conteúdo educativo completo será desbloqueado quando você tiver 30 pontos.
                        </div>
                        <div className="mt-3 bg-orange-900/20 rounded-lg p-3">
                          <div className="text-orange-300 text-xs">
                            💡 Você tem {userProgress.points} pontos. Precisa de mais {Math.max(0, 30 - userProgress.points)} pontos para desbloquear.
                          </div>
                        </div>
                        <Button 
                          onClick={() => unlockEducationContent('tolerancia')}
                          disabled={userProgress.points < 30}
                          className={`w-full mt-3 ${
                            userProgress.points >= 30 
                              ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white' 
                              : 'bg-orange-600/20 text-orange-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Desbloquear com 30 pontos
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="leading-none font-semibold text-cyan-400 flex items-center gap-2">
                    🫁 Técnicas de Respiração
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white space-y-4 text-sm leading-relaxed">
                    <div>
                      A respiração consciente é uma ferramenta poderosa para controlar impulsos e reduzir ansiedade. Aprenda técnicas científicas.
                    </div>
                    
                    {(userProgress.unlockedEducation && Array.isArray(userProgress.unlockedEducation) && userProgress.unlockedEducation.includes('breathing')) ? (
                      <>
                        {breathingExpanded && (
                          <>
                            <div>
                              A respiração é a única função do sistema nervoso autônomo que podemos controlar conscientemente. Quando você muda seu padrão respiratório, você literalmente muda seu estado mental e emocional. Isso acontece porque a respiração está diretamente conectada ao nervo vago, que regula a resposta de "luta ou fuga".
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-cyan-400 font-bold mb-2">🌊 Técnica 4-7-8 (Relaxamento)</h4>
                              <div>
                                <div><strong>Como fazer:</strong></div>
                                <div>• Inspire pelo nariz por 4 segundos</div>
                                <div>• Segure a respiração por 7 segundos</div>
                                <div>• Expire pela boca por 8 segundos</div>
                                <div>• Repita 4 vezes</div>
                                <div className="mt-2"><strong>Quando usar:</strong> Momentos de ansiedade, antes de dormir, ou quando sentir impulsos.</div>
                              </div>
                            </div>
                            
                            <div className="bg-black/30 p-3 rounded-lg">
                              <h4 className="text-cyan-400 font-bold mb-2">⚡ Respiração de Caixa (Foco)</h4>
                              <div>
                                <div><strong>Como fazer:</strong></div>
                                <div>• Inspire por 4 segundos</div>
                                <div>• Segure por 4 segundos</div>
                                <div>• Expire por 4 segundos</div>
                                <div>• Segure vazio por 4 segundos</div>
                                <div className="mt-2"><strong>Quando usar:</strong> Para aumentar concentração e controle mental.</div>
                              </div>
                            </div>
                            
                            <div className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-500/30">
                              <h4 className="text-cyan-400 font-bold mb-2">🧘 Respiração de Emergência</h4>
                              <div>
                                Quando sentir um impulso forte, faça 10 respirações profundas e lentas, focando apenas no ar entrando e saindo. Isso ativa o sistema nervoso parassimpático, reduzindo imediatamente a intensidade do impulso.
                              </div>
                            </div>
                          </>
                        )}
                        
                        <Button 
                          onClick={() => setBreathingExpanded(!breathingExpanded)}
                          variant="outline" 
                          className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-2"
                        >
                          {breathingExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Ler menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Ler mais
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="bg-black/30 p-4 rounded-lg border border-orange-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-5 h-5 text-orange-400" />
                          <h4 className="text-orange-400 font-bold">Conteúdo Bloqueado</h4>
                        </div>
                        <div className="text-orange-200 text-sm">
                          Este conteúdo educativo completo será desbloqueado quando você tiver 30 pontos.
                        </div>
                        <div className="mt-3 bg-orange-900/20 rounded-lg p-3">
                          <div className="text-orange-300 text-xs">
                            💡 Você tem {userProgress.points} pontos. Precisa de mais {Math.max(0, 30 - userProgress.points)} pontos para desbloquear.
                          </div>
                        </div>
                        <Button 
                          onClick={() => unlockEducationContent('breathing')}
                          disabled={userProgress.points < 30}
                          className={`w-full mt-3 ${
                            userProgress.points >= 30 
                              ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white' 
                              : 'bg-orange-600/20 text-orange-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Desbloquear com 30 pontos
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  )
}