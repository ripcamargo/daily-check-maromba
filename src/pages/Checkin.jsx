import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { Avatar } from '../components/Avatar';
import { useSeason } from '../context/SeasonContext';
import { useAthletes } from '../context/AthletesContext';
import { 
  CheckinStatus, 
  StatusEmoji, 
  StatusColor,
  getCheckinsByDate,
  saveCheckins 
} from '../services/checkins';
import { formatDate } from '../utils/formatters';

// Função helper para obter data no formato yyyy-MM-dd sem conversão UTC
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Checkin() {
  const { currentSeason } = useSeason();
  const { athletes, getAthleteById } = useAthletes();
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [checkins, setCheckins] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [hasSavedData, setHasSavedData] = useState(false);

  useEffect(() => {
    if (currentSeason) {
      loadCheckins();
    }
  }, [selectedDate, currentSeason]);

  const loadCheckins = async () => {
    if (!currentSeason) return;

    setLoading(true);
    try {
      const data = await getCheckinsByDate(currentSeason.id, selectedDate);
      
      // Inicializa com todos os participantes
      const initialCheckins = {};
      currentSeason.participants?.forEach(athleteId => {
        initialCheckins[athleteId] = { status: CheckinStatus.NOT_SET };
      });

      // Aplica dados salvos
      let hasData = false;
      if (data?.athletes) {
        Object.keys(data.athletes).forEach(athleteId => {
          const athleteData = data.athletes[athleteId];
          
          // Sempre carrega o status calculado para visualização
          // Quando clicar em "Editar", vamos mostrar o original
          initialCheckins[athleteId] = {
            status: athleteData.status,
            originalStatus: athleteData.originalStatus
          };
          
          if (athleteData.status !== CheckinStatus.NOT_SET) {
            hasData = true;
          }
        });
      }

      setCheckins(initialCheckins);
      setHasSavedData(hasData);
      setIsEditing(!hasData);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao carregar check-ins' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (athleteId, status) => {
    setCheckins(prev => ({
      ...prev,
      [athleteId]: { status }
    }));
  };

  const handleStartEditing = () => {
    // Ao clicar em editar, troca para mostrar os status originais
    const editableCheckins = {};
    Object.keys(checkins).forEach(athleteId => {
      const athleteData = checkins[athleteId];
      editableCheckins[athleteId] = {
        status: athleteData.originalStatus || athleteData.status
      };
    });
    setCheckins(editableCheckins);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentSeason) return;

    setSaving(true);

    try {
      await saveCheckins(currentSeason.id, selectedDate, checkins, currentSeason);
      
      // Recarregar para mostrar status processados
      await loadCheckins();
      
      setHasSavedData(true);
      setIsEditing(false);
      setAlert({ type: 'success', message: 'Check-ins salvos com sucesso!' });
      
      // Auto-fechar alerta após 3 segundos
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao salvar: ${error.message}` });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (!currentSeason) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Nenhuma temporada ativa. Crie uma temporada para começar.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const participants = currentSeason.participants || [];
  
  // Status que o usuário pode marcar manualmente
  const statusOptions = [
    { value: CheckinStatus.PRESENT, emoji: StatusEmoji[CheckinStatus.PRESENT], label: 'Presente' },
    { value: CheckinStatus.ABSENT, emoji: StatusEmoji[CheckinStatus.ABSENT], label: 'Ausente' },
    { value: CheckinStatus.HOSPITAL, emoji: StatusEmoji[CheckinStatus.HOSPITAL], label: 'Hospital' },
    { value: CheckinStatus.JUSTIFIED, emoji: StatusEmoji[CheckinStatus.JUSTIFIED], label: 'Justificado' }
  ];

  const changeDate = (days) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setDate(currentDate.getDate() + days);
    const newDate = getLocalDateString(currentDate);
    
    // Verifica se a data está dentro da temporada
    const seasonStart = formatDate(currentSeason.startDate, 'yyyy-MM-dd');
    const seasonEnd = formatDate(currentSeason.endDate, 'yyyy-MM-dd');
    
    if (newDate >= seasonStart && newDate <= seasonEnd) {
      setSelectedDate(newDate);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Registro de Check-in</h1>
        <p className="text-gray-600">Registre a presença dos atletas</p>
      </div>

      {/* Toast/Pop-up de notificação */}
      {alert && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <Card className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => changeDate(-1)}
              disabled={selectedDate <= formatDate(currentSeason.startDate, 'yyyy-MM-dd')}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Dia Anterior
            </Button>
            
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600 mb-1">Data Selecionada</p>
              <p className="text-2xl font-bold text-gray-800">
                {(() => {
                  const [year, month, day] = selectedDate.split('-').map(Number);
                  const dateObj = new Date(year, month - 1, day);
                  return formatDate(dateObj, 'dd/MM/yyyy');
                })()}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => changeDate(1)}
              disabled={selectedDate >= formatDate(currentSeason.endDate, 'yyyy-MM-dd')}
              className="flex items-center gap-2"
            >
              Próximo Dia
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ou selecione uma data específica:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={formatDate(currentSeason.startDate, 'yyyy-MM-dd')}
              max={formatDate(currentSeason.endDate, 'yyyy-MM-dd')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <Loading text="Carregando check-ins..." />
      ) : participants.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600">
              Nenhum participante cadastrado nesta temporada.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 mb-6">
            {participants.map((athleteId) => {
              const athlete = getAthleteById(athleteId);
              if (!athlete) return null;

              const athleteData = checkins[athleteId] || { status: CheckinStatus.NOT_SET };
              const currentStatus = athleteData.status;
              
              // Quando não está editando, usa o originalStatus para mostrar o botão correto
              const displayStatus = !isEditing && athleteData.originalStatus 
                ? athleteData.originalStatus 
                : currentStatus;

              return (
                <Card key={athleteId} className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar
                        name={athlete.name}
                        photoUrl={athlete.photoUrl}
                        size="lg"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {athlete.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {athlete.experienceLevel}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(athleteId, option.value)}
                          disabled={!isEditing}
                          className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                            displayStatus === option.value
                              ? 'ring-4 ring-offset-2 scale-105'
                              : isEditing ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'
                          }`}
                          style={{
                            backgroundColor: displayStatus === option.value 
                              ? StatusColor[option.value] 
                              : '#f3f4f6',
                            color: displayStatus === option.value ? '#fff' : '#374151',
                            ringColor: StatusColor[option.value]
                          }}
                          title={option.label}
                        >
                          <span className="text-xl">{option.emoji}</span>
                          <span className="hidden md:inline">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end gap-3">
            {!isEditing && (
              <Button
                variant="secondary"
                onClick={handleStartEditing}
                className="flex items-center gap-2"
              >
                Editar Check-ins
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  variant="secondary"
                  onClick={loadCheckins}
                  disabled={saving}
                >
                  Resetar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    'Salvando...'
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Salvar Check-ins
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
