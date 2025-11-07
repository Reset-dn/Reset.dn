'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Zap, Target, Trophy, Brain } from 'lucide-react';

export default function BoasVindasPage() {
  const router = useRouter();

  const handleIniciarJornada = () => {
    router.push('/questionario');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/90 border-blue-500/30 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Zap className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">REBOOT</h1>
              <p className="text-blue-300">O Plano de 90 Dias para Recuperar o Controle</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold text-blue-100">
              Bem-vindo ao REBOOT
            </h2>
            
            <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
              <p className="text-blue-100 text-lg leading-relaxed">
                Durante as próximas semanas, você vai <span className="text-blue-400 font-semibold">reconstruir sua mente</span>, 
                sua <span className="text-blue-400 font-semibold">energia</span> e seu <span className="text-blue-400 font-semibold">propósito</span>.
              </p>
              
              <p className="text-blue-100 text-lg leading-relaxed">
                Cada dia é uma <span className="text-yellow-400 font-semibold">missão</span>. 
                Cada desafio, uma <span className="text-green-400 font-semibold">vitória</span>.
              </p>
              
              <p className="text-blue-100 text-lg leading-relaxed">
                E no fim, você descobrirá que a liberdade não é ausência de desejo — 
                é o <span className="text-purple-400 font-semibold">domínio sobre ele</span>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/20 rounded-lg p-4 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-blue-100 font-semibold mb-1">90 Dias</h3>
              <p className="text-slate-300 text-sm">Programa estruturado</p>
            </div>
            
            <div className="bg-slate-700/20 rounded-lg p-4 text-center">
              <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-blue-100 font-semibold mb-1">Reprogramação</h3>
              <p className="text-slate-300 text-sm">Mental e emocional</p>
            </div>
            
            <div className="bg-slate-700/20 rounded-lg p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-blue-100 font-semibold mb-1">Liberdade</h3>
              <p className="text-slate-300 text-sm">Controle total</p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleIniciarJornada}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 text-lg"
              size="lg"
            >
              Iniciar Minha Jornada
            </Button>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Sua transformação começa agora. Prepare-se para descobrir seu verdadeiro potencial.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}