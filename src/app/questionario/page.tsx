'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Zap, ArrowLeft, ArrowRight } from 'lucide-react';

interface Question {
  id: string;
  type: 'radio' | 'textarea' | 'input';
  question: string;
  options?: string[];
  placeholder?: string;
}

const questions: Question[] = [
  {
    id: 'frequencia',
    type: 'radio',
    question: 'Com que frequência você assiste pornografia ou se masturba?',
    options: [
      'Diariamente',
      'Algumas vezes por semana',
      'Raramente',
      'Já estou tentando parar'
    ]
  },
  {
    id: 'gatilhos',
    type: 'textarea',
    question: 'Quais situações ou emoções mais te levam a isso?',
    placeholder: 'Ex: solidão, tédio, ansiedade, curiosidade, rotina noturna...'
  },
  {
    id: 'sentimentos',
    type: 'radio',
    question: 'Como você se sente logo após?',
    options: [
      'Culpa',
      'Vazio',
      'Indiferença',
      'Outra'
    ]
  },
  {
    id: 'sentimentos_outro',
    type: 'input',
    question: 'Se escolheu "Outra", especifique como se sente:',
    placeholder: 'Descreva seu sentimento...'
  },
  {
    id: 'motivacao',
    type: 'textarea',
    question: 'Por que você quer abandonar esse vício?',
    placeholder: 'Ex: foco, energia, relacionamentos, espiritualidade, saúde mental...'
  },
  {
    id: 'expectativas',
    type: 'textarea',
    question: 'O que você acredita que seria diferente na sua vida se conseguisse parar?',
    placeholder: 'Descreva as mudanças que espera ver em sua vida...'
  }
];

export default function QuestionarioPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: value
    }));
  };

  const canProceed = () => {
    const currentAnswer = answers[question.id];
    
    // Se é a pergunta sobre "outro sentimento", só é obrigatória se a anterior foi "Outra"
    if (question.id === 'sentimentos_outro') {
      return answers.sentimentos !== 'Outra' || (currentAnswer && currentAnswer.trim() !== '');
    }
    
    return currentAnswer && currentAnswer.trim() !== '';
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      // Se a pergunta atual é sobre sentimentos e não foi "Outra", pular a próxima
      if (question.id === 'sentimentos' && answers.sentimentos !== 'Outra') {
        setCurrentQuestion(currentQuestion + 2);
      } else {
        setCurrentQuestion(currentQuestion + 1);
      }
    } else {
      // Salvar respostas e ir para a mensagem motivacional
      localStorage.setItem('reboot_questionario', JSON.stringify(answers));
      router.push('/motivacional');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      // Se a pergunta atual é sobre "outro sentimento", voltar 2 posições
      if (question.id === 'sentimentos_outro') {
        setCurrentQuestion(currentQuestion - 2);
      } else if (currentQuestion === 4 && answers.sentimentos !== 'Outra') {
        // Se estamos na pergunta 4 e pulamos a pergunta sobre "outro", voltar 2 posições
        setCurrentQuestion(currentQuestion - 2);
      } else {
        setCurrentQuestion(currentQuestion - 1);
      }
    }
  };

  // Não mostrar a pergunta sobre "outro sentimento" se não foi selecionado "Outra"
  if (question.id === 'sentimentos_outro' && answers.sentimentos !== 'Outra') {
    handleNext();
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/90 border-blue-500/30 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">REBOOT</CardTitle>
              <p className="text-blue-300 text-sm">Questionário Personalizado</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-300">
              <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-700" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl text-blue-100 font-medium leading-relaxed">
              {question.question}
            </h2>

            {question.type === 'radio' && question.options && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={option} 
                      id={`option-${index}`}
                      className="border-blue-400 text-blue-400"
                    />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="text-blue-100 cursor-pointer flex-1 py-2"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'textarea' && (
              <Textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={question.placeholder}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 min-h-[120px]"
              />
            )}

            {question.type === 'input' && (
              <Input
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={question.placeholder}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
              />
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white disabled:opacity-50"
            >
              {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}