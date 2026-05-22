import { useState, useEffect } from 'react';
import { Film, Download, AlertCircle, CheckCircle, Loader, ChevronDown } from 'lucide-react';
import { getAllSeasons } from '../services/seasons';
import { getAllAthletes } from '../services/athletes';
import { getAllCheckins } from '../services/checkins';
import { getAllPayments } from '../services/payments';
import { calculateWrappedData } from '../utils/calculateWrappedData';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  'Buscando temporadas...',
  'Buscando atletas...',
  'Buscando check-ins...',
  'Buscando pagamentos...',
  'Calculando dados...',
  'Gerando arquivo JSON...',
];

export default function GymWrapped() {
  const { isAdmin } = useAuth();
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const loadSeasons = async () => {
    try {
      const all = await getAllSeasons();
      setSeasons(all);
      if (all.length > 0) setSelectedSeason(all[0]);
    } catch (e) {
      setError('Erro ao carregar temporadas: ' + e.message);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const handleGenerate = async () => {
    if (!selectedSeason) return;
    setLoading(true);
    setError(null);
    setDone(false);

    try {
      setStep(0); // seasons (already loaded)
      await new Promise((r) => setTimeout(r, 200));

      setStep(1);
      const athletes = await getAllAthletes();

      setStep(2);
      const checkins = await getAllCheckins(selectedSeason.id);

      setStep(3);
      const payments = selectedSeason.finePerAbsence > 0
        ? await getAllPayments(selectedSeason.id)
        : [];

      setStep(4);
      const wrappedData = calculateWrappedData(selectedSeason, athletes, checkins, payments);

      setStep(5);
      const json = JSON.stringify(wrappedData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gym-wrapped-${selectedSeason.id}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setDone(true);
    } catch (e) {
      console.error(e);
      setError('Erro ao gerar dados: ' + e.message);
    } finally {
      setLoading(false);
      setStep(-1);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-xl text-gray-600">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🎬</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Gym Wrapped</h1>
        <p className="text-gray-500 text-lg">
          Gere a retrospectiva automática em vídeo da temporada.
        </p>
      </div>

      {/* Season selector */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">1. Selecione a temporada</h2>
        {seasons.length === 0 ? (
          <p className="text-gray-400 italic">Carregando temporadas...</p>
        ) : (
          <div className="relative">
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 appearance-none text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={selectedSeason?.id || ''}
              onChange={(e) => {
                const s = seasons.find((s) => s.id === e.target.value);
                setSelectedSeason(s || null);
              }}
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} {s.active ? '(ativa)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-700 mb-3">2. Como funciona</h2>
        <ol className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span className="font-bold shrink-0">1.</span>
            Clique em <strong>Gerar e Baixar JSON</strong> — o arquivo com todos os dados será baixado.
          </li>
          <li className="flex gap-2">
            <span className="font-bold shrink-0">2.</span>
            Coloque o arquivo baixado em <code className="bg-blue-100 px-1 rounded">remotion/public/gym-wrapped-data.json</code>
          </li>
          <li className="flex gap-2">
            <span className="font-bold shrink-0">3.</span>
            No terminal, acesse a pasta <code className="bg-blue-100 px-1 rounded">remotion/</code> e instale as dependências:
            <br /><code className="bg-blue-100 px-1 rounded">npm install</code>
          </li>
          <li className="flex gap-2">
            <span className="font-bold shrink-0">4.</span>
            Para preview interativo: <code className="bg-blue-100 px-1 rounded">npm run studio</code>
          </li>
          <li className="flex gap-2">
            <span className="font-bold shrink-0">5.</span>
            Para renderizar o MP4: <code className="bg-blue-100 px-1 rounded">npm run render</code>
          </li>
        </ol>
      </div>

      {/* Progress */}
      {loading && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="space-y-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                {i < step ? (
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                ) : i === step ? (
                  <Loader className="w-5 h-5 text-blue-500 shrink-0 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                )}
                <span className={`text-sm ${i === step ? 'text-blue-600 font-medium' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success */}
      {done && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
          <div>
            <p className="font-semibold text-green-700">JSON gerado e baixado com sucesso!</p>
            <p className="text-sm text-green-600 mt-1">
              Mova o arquivo para <code className="bg-green-100 px-1 rounded">remotion/public/gym-wrapped-data.json</code> e execute o render.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !selectedSeason}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-lg transition-all"
      >
        {loading ? (
          <>
            <Loader className="w-6 h-6 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Download className="w-6 h-6" />
            Gerar e Baixar JSON
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        O vídeo é renderizado localmente com Remotion. O JSON contém os dados calculados da temporada.
      </p>
    </div>
  );
}
