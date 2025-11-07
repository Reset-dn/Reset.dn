'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Zap, Sparkles, Target, Trophy } from 'lucide-react';

export default function MotivacionalPage() {
  const router = useRouter();

  const handleEstouPronto = () => {
    // Marcar que o usuário completou a jornada inicial
    localStorage.setItem('reboot_onboarding_completed', 'true');
    
    // Redirecionar para o app principal
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-slate-800/90 border-blue-500/30 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-full animate-pulse">
              <Zap className="w-12 h-12 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">REBOOT</h1>
              <p className="text-blue-300">O Jogo da Liberdade</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-8 space-y-6">
              <div className="flex justify-center">
                <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" />
              </div>
              
              <div className="space-y-4">
                <p className="text-blue-100 text-xl leading-relaxed">
                  <span className="text-yellow-400 font-semibold">Toda mudança começa</span> no momento em que você decide 
                  <span className="text-blue-400 font-semibold"> encarar a verdade</span> — e você acabou de dar esse passo.
                </p>
                
                <p className="text-blue-100 text-xl leading-relaxed">
                  Não se trata de <span className="text-red-400 font-semibold line-through">perfeição</span>, 
                  e sim de <span className="text-green-400 font-semibold">progresso</span>.
                </p>
                
                <p className="text-blue-100 text-xl leading-relaxed">
                  Durante os próximos <span className="text-purple-400 font-semibold">90 dias</span>, você vai 
                  <span className="text-blue-400 font-semibold"> reprogramar sua mente</span>, conquistar 
                  <span className="text-yellow-400 font-semibold"> autocontrole</span> e recuperar o que o vício te tirou:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="text-blue-100 font-semibold">Energia</h3>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="text-blue-100 font-semibold">Clareza</h3>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <h3 className="text-blue-100 font-semibold">Propósito</h3>
                  </div>
                </div>
                
                <p className="text-blue-100 text-2xl font-semibold mt-8">
                  Bem-vindo à sua <span className="text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">nova fase</span>.
                </p>
                
                <p className="text-blue-100 text-xl">
                  Está pronto?
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <Button 
              onClick={handleEstouPronto}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-6 px-12 text-xl rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              Sim, estou pronto para mudar 💪
            </Button>
            
            <p className="text-slate-400 text-sm">
              Sua jornada de 90 dias começa agora. Prepare-se para a transformação.
            </p>
          </div>

          <div className="bg-slate-700/20 rounded-lg p-6 text-center">
            <p className="text-blue-200 text-lg font-medium">
              "A liberdade não é a ausência de desejo — é o domínio sobre ele."
            </p>
            <p className="text-slate-400 text-sm mt-2">— REBOOT</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}