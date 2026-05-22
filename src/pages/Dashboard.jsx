import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, DollarSign, Users, Download, Share2, Filter, Calendar, FileSpreadsheet } from 'lucide-react';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Loading } from '../components/Loading';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { useSeason } from '../context/SeasonContext';
import { useThemeColor } from '../context/ThemeColorContext';
import { useAthletes } from '../context/AthletesContext';
import { useAuth } from '../context/AuthContext';
import { getAllCheckins } from '../services/checkins';
import { getAllSeasons } from '../services/seasons';
import { getAllPayments, calculateTotalPaid } from '../services/payments';
import { calculateStats, calculateFine } from '../utils/calculator';
import { 
  sortByRanking, 
  sortByMostRest, 
  sortByMostAbsence, 
  sortByMostHospital 
} from '../utils/ranking';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { generateWeeklyImage, downloadWeeklyImage, shareWeeklyImage, generateRankingImage } from '../utils/imageGenerator';
import { StatusEmoji, CheckinStatus, CalculatedStatus } from '../services/checkins';
import { format, parseISO, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const { currentSeason, loading: seasonLoading } = useSeason();
  const { primary } = useThemeColor();
  const { athletes, getAthleteById, loading: athletesLoading } = useAthletes();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [activeTab, setActiveTab] = useState('ranking');
  const [alert, setAlert] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [allSeasons, setAllSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredCheckins, setFilteredCheckins] = useState([]);
  const [logDateFilter, setLogDateFilter] = useState('');
  const [logAthleteFilter, setLogAthleteFilter] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('');
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [imageDate, setImageDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [imageType, setImageType] = useState('weekly');

  useEffect(() => {
    loadSeasons();
  }, []);

  useEffect(() => {
    if (currentSeason) {
      setSelectedSeasonId(currentSeason.id);
      loadDashboardData(currentSeason.id);
    } else {
      setLoading(false);
    }
  }, [currentSeason, athletes]);

  // Quando não há temporada ativa, auto-seleciona a mais recente
  useEffect(() => {
    if (!currentSeason && !selectedSeasonId && allSeasons.length > 0) {
      const latest = allSeasons[0]; // já vem ordenado por startDate desc
      setSelectedSeasonId(latest.id);
      loadDashboardData(latest.id);
    }
  }, [allSeasons, currentSeason]);

  useEffect(() => {
    applyDateFilter();
  }, [startDate, endDate, checkins]);

  const loadSeasons = async () => {
    try {
      const seasons = await getAllSeasons();
      setAllSeasons(seasons);
    } catch (error) {
      console.error('Erro ao carregar temporadas:', error);
    }
  };

  const applyDateFilter = () => {
    if (!startDate && !endDate) {
      setFilteredCheckins(checkins);
      return;
    }

    const filtered = checkins.filter(checkin => {
      if (startDate && checkin.date < startDate) return false;
      if (endDate && checkin.date > endDate) return false;
      return true;
    });

    setFilteredCheckins(filtered);
  };

  const handleSeasonChange = async (seasonId) => {
    setSelectedSeasonId(seasonId);
    await loadDashboardData(seasonId);
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setShowDateFilter(false);
  };

  const handleShowDateFilter = () => {
    // Calcular semana anterior
    const today = new Date();
    const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1, locale: ptBR });
    const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1, locale: ptBR });
    
    // Formatar para yyyy-MM-dd
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setStartDate(formatDate(lastWeekStart));
    setEndDate(formatDate(lastWeekEnd));
    setShowDateFilter(true);
  };

  const loadDashboardData = async (seasonId = currentSeason?.id) => {
    if (!seasonId) return;
    
    setLoading(true);
    try {
      const selectedSeason = allSeasons.find(s => s.id === seasonId) || currentSeason;
      
      const [checkinsData, paymentsData] = await Promise.all([
        getAllCheckins(seasonId),
        getAllPayments(seasonId)
      ]);

      console.log('Check-ins carregados no Dashboard:', checkinsData.length, 'registros');
      if (checkinsData.length > 0) {
        console.log('Exemplo de check-in:', checkinsData[0]);
      }

      setCheckins(checkinsData);
      setPayments(paymentsData);

      // Preparar log de presença
      const log = [];
      const sortedCheckins = [...checkinsData].sort((a, b) => a.date.localeCompare(b.date));
      
      sortedCheckins.forEach((checkin, idx) => {
        const participants = selectedSeason.participants || [];
        participants.forEach(athleteId => {
          const athlete = getAthleteById(athleteId);
          if (!athlete) return;
          
          const athleteCheckin = checkin.athletes?.[athleteId];
          const status = athleteCheckin?.status || CheckinStatus.NOT_SET;
          
          log.push({
            date: checkin.date,
            athleteId,
            athleteName: athlete.name,
            status,
            emoji: StatusEmoji[status]
          });
        });
      });
      
      // Ordenar do mais recente para o mais antigo
      log.sort((a, b) => b.date.localeCompare(a.date));

      setAttendanceLog(log);

      // Calcula dados de ranking
      const athletesData = (selectedSeason.participants || []).map(athleteId => {
        const athlete = getAthleteById(athleteId);
        if (!athlete) return null;

        const withdrawal = selectedSeason.withdrawals?.[athleteId];
        const stats = calculateStats(checkinsData, athleteId, selectedSeason.bonusBenefit);
        const fineInfo = calculateFine(
          stats,
          selectedSeason.finePerAbsence,
          selectedSeason.weeklyRestLimit,
          checkinsData,
          selectedSeason.neutralDays
        );

        // Calcula total pago
        const athletePayments = paymentsData.filter(p => p.athleteId === athleteId);
        const totalPaid = athletePayments.reduce((sum, p) => sum + p.value, 0);

        return {
          id: athlete.id,
          name: athlete.name,
          photoUrl: athlete.photoUrl,
          stats,
          fineInfo,
          totalPaid,
          debt: Math.max(0, fineInfo.fineAmount - totalPaid),
          withdrawn: !!withdrawal,
          withdrawalDate: withdrawal?.date || null
        };
      }).filter(Boolean);

      setRankingData(athletesData);
      setFinancialData(athletesData);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao carregar dados do dashboard' });
    } finally {
      setLoading(false);
    }
  };

  if (seasonLoading || athletesLoading || loading) {
    return <Loading text="Carregando dashboard..." />;
  }

  const selectedSeason = allSeasons.find(s => s.id === selectedSeasonId) || currentSeason;

  if (!selectedSeason) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Bem-vindo ao Daily Check Maromba!
            </h2>
            <p className="text-gray-600 mb-6">
              Crie uma temporada para começar a acompanhar o desempenho dos atletas.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const rankedAthletes = sortByRanking(rankingData);
  const dataToUse = filteredCheckins.length > 0 ? filteredCheckins : checkins;
  const totalExpected = financialData.reduce((sum, a) => sum + a.fineInfo.fineAmount, 0);
  const totalPaid = financialData.reduce((sum, a) => sum + a.totalPaid, 0);
  const totalDebt = totalExpected - totalPaid;

  const handleGenerateRankingImage = async () => {
    try {
      setGeneratingImage(true);
      const sorted = sortByRanking(rankingData);
      const blob = await generateRankingImage(selectedSeason, sorted, checkins);
      downloadWeeklyImage(blob, `${selectedSeason.title}_classificacao`);
      setAlert({ type: 'success', message: 'Imagem de classificação baixada com sucesso!' });
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao gerar imagem: ${error.message}` });
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGenerateWeeklyImage = async (shouldShare = false) => {
    if (!imageDate) {
      setAlert({ type: 'error', message: 'Por favor, selecione uma data' });
      return;
    }

    try {
      setGeneratingImage(true);
      
      // Calcular início e fim da semana baseado na data selecionada
      const selectedDate = parseISO(imageDate);
      const weekStartsOn = selectedSeason?.weekStartsOn || 1; // 1 = segunda-feira
      const weekStart = startOfWeek(selectedDate, { weekStartsOn });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn });

      const weekStartDate = format(weekStart, 'yyyy-MM-dd');
      const weekEndDate = format(weekEnd, 'yyyy-MM-dd');

      // Filtrar apenas atletas participantes da temporada
      const participantAthletes = athletes.filter(athlete =>
        selectedSeason.participants?.includes(athlete.id)
      );

      // Usar background da temporada se existir
      const backgroundUrl = selectedSeason.backgroundUrl || null;

      const blob = await generateWeeklyImage(
        selectedSeason,
        participantAthletes,
        backgroundUrl,
        weekStartDate,
        weekEndDate
      );

      if (shouldShare) {
        await shareWeeklyImage(blob, selectedSeason.title);
        setAlert({ type: 'success', message: 'Imagem gerada com sucesso!' });
      } else {
        downloadWeeklyImage(blob, selectedSeason.title);
        setAlert({ type: 'success', message: 'Imagem baixada com sucesso!' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao gerar imagem: ${error.message}` });
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      // Preparar dados para exportação
      const statusLabels = {
        [CheckinStatus.NOT_SET]: 'Não Marcado',
        [CheckinStatus.PRESENT]: 'Presente',
        [CheckinStatus.ABSENT]: 'Ausente',
        [CheckinStatus.HOSPITAL]: 'Hospital',
        [CheckinStatus.JUSTIFIED]: 'Justificado',
        [CalculatedStatus.REST]: 'Folga',
        [CalculatedStatus.ABSENCE]: 'Falta',
        [CalculatedStatus.EXTRA]: 'Presença Bônus'
      };

      const statusLabelsExcel = {
        [CheckinStatus.NOT_SET]: 'Não Marcado',
        [CheckinStatus.PRESENT]: 'Presente',
        [CheckinStatus.ABSENT]: 'Ausente',
        [CheckinStatus.HOSPITAL]: 'Hospital',
        [CheckinStatus.JUSTIFIED]: 'Justificado',
        [CalculatedStatus.REST]: 'Folga',
        [CalculatedStatus.BONUS_REST]: 'Folga Bônus (Vale-folga)',
        [CalculatedStatus.ABSENCE]: 'Falta',
        [CalculatedStatus.EXTRA]: 'Presença Bônus'
      };

      const excelData = attendanceLog.map(log => ({
        'Data': format(parseISO(log.date), 'dd/MM/yyyy (EEEE)', { locale: ptBR }),
        'Atleta': log.athleteName,
        'Status': statusLabelsExcel[log.status],
        'Emoji': StatusEmoji[log.status],
        'Descrição': log.description
      }));

      // Criar worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Definir largura das colunas
      ws['!cols'] = [
        { wch: 25 }, // Data
        { wch: 20 }, // Atleta
        { wch: 20 }, // Status
        { wch: 8 },  // Emoji
        { wch: 50 }  // Descrição
      ];

      // Criar workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Log de Presença');

      // Gerar nome do arquivo
      const fileName = `log-presenca-${selectedSeason.title.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

      // Fazer download
      XLSX.writeFile(wb, fileName);
      
      setAlert({ type: 'success', message: 'Planilha exportada com sucesso!' });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      setAlert({ type: 'error', message: 'Erro ao exportar planilha' });
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
          <Button
            onClick={() => setShowImageGenerator(!showImageGenerator)}
            variant="outline"
            className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5"
          >
            <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            Gerar Imagem
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          {/* Filtro de Temporada */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="font-medium text-gray-700 text-sm sm:text-base sm:min-w-[120px]">Temporada:</label>
            <select
              value={selectedSeasonId || currentSeason?.id || ''}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:border-transparent"
              style={{ focusRing: `2px ${primary}` }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.boxShadow = `0 0 0 3px ${primary}40`;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              {allSeasons.map(season => (
                <option key={season.id} value={season.id}>
                  {season.title} {season.active ? '(Ativa)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gerador de Imagem */}
      {showImageGenerator && (
        <div className="mb-4 sm:mb-6">
          <Card title="📸 Gerar Imagem" className="bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="space-y-3">
              {/* Type selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setImageType('weekly')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    imageType === 'weekly'
                      ? 'text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                  style={imageType === 'weekly' ? { backgroundColor: primary } : {}}
                >
                  📅 Semanal
                </button>
                <button
                  onClick={() => setImageType('ranking')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    imageType === 'ranking'
                      ? 'text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                  style={imageType === 'ranking' ? { backgroundColor: primary } : {}}
                >
                  🏆 Classificação
                </button>
              </div>

              {imageType === 'weekly' ? (
                <>
                  <p className="text-xs sm:text-sm text-gray-600">Selecione a data para gerar a imagem semanal</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="font-medium text-gray-700 text-sm">Data:</label>
                    <input
                      type="date"
                      value={imageDate}
                      onChange={(e) => setImageDate(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 flex-1"
                    />
                    <Button
                      onClick={() => handleGenerateWeeklyImage(false)}
                      disabled={generatingImage}
                      className="flex items-center gap-2 text-sm px-4 py-2 justify-center"
                    >
                      <Download className="w-4 h-4" />
                      {generatingImage ? 'Gerando...' : 'Baixar Imagem'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Gera imagem com a classificação atual — posição, foto, total de presenças e últimos 7 check-ins de cada atleta.
                  </p>
                  <Button
                    onClick={handleGenerateRankingImage}
                    disabled={generatingImage}
                    className="flex items-center gap-2 text-sm px-4 py-2 justify-center w-full sm:w-auto"
                  >
                    <Trophy className="w-4 h-4" />
                    {generatingImage ? 'Gerando...' : 'Gerar Classificação'}
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {alert && (
        <div className="mb-4 sm:mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {selectedSeason.id !== currentSeason?.id && (
        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Visualizando temporada encerrada: <strong>{selectedSeason.title}</strong></span>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-500 rounded-lg">
              <Users className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-600">Participantes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {selectedSeason.participants?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-green-500 rounded-lg">
              <DollarSign className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-600">Total Pago</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-yellow-500 rounded-lg">
              <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-600">Previsto</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {formatCurrency(totalExpected)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="p-2 sm:p-3 bg-red-500 rounded-lg">
              <DollarSign className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-600">Devendo</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {formatCurrency(totalDebt)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all ${
            activeTab === 'ranking'
              ? 'text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          style={activeTab === 'ranking' ? { backgroundColor: primary } : {}}
        >
          🏆 Ranking
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all ${
            activeTab === 'financial'
              ? 'text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          style={activeTab === 'financial' ? { backgroundColor: primary } : {}}
        >
          💰 Financeiro
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all ${
            activeTab === 'attendance'
              ? 'text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          style={activeTab === 'attendance' ? { backgroundColor: primary } : {}}
        >
          📋 Log de Presença
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'ranking' && (
        <>
          <Card title="🏆 Ranking Principal" subtitle="Classificação geral dos atletas">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-1 sm:py-3 sm:px-4 font-semibold text-gray-700 text-xs sm:text-base">Pos</th>
                    <th className="text-left py-2 px-1 sm:py-3 sm:px-4 font-semibold text-gray-700 text-xs sm:text-base">Atleta</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2 font-semibold text-gray-700 text-xs sm:text-base">✅</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2 font-semibold text-gray-700 text-xs sm:text-base">❌</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2 font-semibold text-gray-700 text-xs sm:text-base">🔷</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2 font-semibold text-gray-700 text-xs sm:text-base">📄</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2 font-semibold text-gray-700 text-xs sm:text-base">🚑</th>
                    <th className="text-center py-2 px-1 sm:py-3 sm:px-2 font-semibold text-gray-700 text-xs sm:text-base">⭐</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedAthletes.map((athlete, index) => {
                    const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                    const activeCount = rankedAthletes.filter(a => !a.withdrawn).length;
                    const activeIndex = index; // visual position
                    const isTop3 = !athlete.withdrawn && index < 3;
                    const bgColor = isTop3 ? 'bg-yellow-50' : athlete.withdrawn ? 'bg-gray-50 opacity-60' : '';

                    return (
                      <tr key={athlete.id} className={`border-b border-gray-100 ${bgColor}`}>
                        <td className="py-2 px-1 sm:py-4 sm:px-4">
                          {athlete.withdrawn ? (
                            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold text-white text-xs sm:text-base bg-gray-300">
                              —
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold text-white text-xs sm:text-base"
                                 style={{ backgroundColor: isTop3 ? medalColors[index] : '#6b7280' }}>
                              {index + 1}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-1 sm:py-4 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-3">
                            <Avatar name={athlete.name} photoUrl={athlete.photoUrl} size="sm" className="hidden sm:block" style={athlete.withdrawn ? { filter: 'grayscale(1)' } : {}} />
                            <Avatar name={athlete.name} photoUrl={athlete.photoUrl} size="xs" className="sm:hidden" style={athlete.withdrawn ? { filter: 'grayscale(1)' } : {}} />
                            <div className="flex flex-col">
                              <span className={`font-bold text-xs sm:text-base truncate max-w-[80px] sm:max-w-none ${athlete.withdrawn ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                {athlete.name}
                              </span>
                              {athlete.withdrawn && (
                                <span className="text-[10px] text-red-400 font-medium">
                                  Desistiu em {athlete.withdrawalDate?.split('-').reverse().join('/')}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`py-2 px-1 sm:py-4 sm:px-2 text-center font-bold text-xs sm:text-base ${athlete.withdrawn ? 'text-gray-400' : 'text-green-600'}`}>
                          {athlete.stats.present}
                        </td>
                        <td className={`py-2 px-1 sm:py-4 sm:px-2 text-center font-bold text-xs sm:text-base ${athlete.withdrawn ? 'text-gray-400' : 'text-red-600'}`}>
                          {athlete.stats.absence}
                        </td>
                        <td className="py-2 px-1 sm:py-4 sm:px-2 text-center font-bold text-xs sm:text-base" style={{ color: athlete.withdrawn ? '#9ca3af' : primary }}>
                          {athlete.stats.rest}
                        </td>
                        <td className={`py-2 px-1 sm:py-4 sm:px-2 text-center font-bold text-xs sm:text-base ${athlete.withdrawn ? 'text-gray-400' : 'text-indigo-600'}`}>
                          {athlete.stats.justified}
                        </td>
                        <td className={`py-2 px-1 sm:py-4 sm:px-2 text-center font-bold text-xs sm:text-base ${athlete.withdrawn ? 'text-gray-400' : 'text-orange-600'}`}>
                          {athlete.stats.hospital}
                        </td>
                        <td className={`py-2 px-1 sm:py-4 sm:px-2 text-center font-bold text-xs sm:text-base ${athlete.withdrawn ? 'text-gray-400' : 'text-yellow-600'}`}>
                          {athlete.stats.extra}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1">
              {[
                { icon: '✅', label: 'Presenças' },
                { icon: '❌', label: 'Faltas' },
                { icon: '🔷', label: 'Folgas' },
                { icon: '📄', label: 'Justificativas' },
                { icon: '🚑', label: 'Hospital' },
                { icon: '⭐', label: 'Bônus' },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1 text-[11px] text-gray-400">
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>
              ))}
            </div>
          </Card>

          {/* Mini Rankings — exclui desistentes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card title="🛌 Quem Descansou Mais">
              <div className="space-y-3">
                {sortByMostRest(rankingData.filter(a => !a.withdrawn)).slice(0, 5).map((athlete, index) => (
                  <div key={athlete.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <span className="font-bold text-gray-600 w-6">{index + 1}º</span>
                    <Avatar name={athlete.name} photoUrl={athlete.photoUrl} size="sm" />
                    <span className="flex-1 font-medium text-gray-800">{athlete.name}</span>
                    <span className="font-bold" style={{ color: primary }}>{athlete.stats.rest}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="❌ Quem Faltou Mais">
              <div className="space-y-3">
                {sortByMostAbsence(rankingData.filter(a => !a.withdrawn)).slice(0, 5).map((athlete, index) => (
                  <div key={athlete.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <span className="font-bold text-gray-600 w-6">{index + 1}º</span>
                    <Avatar name={athlete.name} photoUrl={athlete.photoUrl} size="sm" />
                    <span className="flex-1 font-medium text-gray-800">{athlete.name}</span>
                    <span className="font-bold text-red-600">{athlete.stats.absence}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="🏥 Quem Foi Mais ao Hospital">
              <div className="space-y-3">
                {sortByMostHospital(rankingData.filter(a => !a.withdrawn)).slice(0, 5).map((athlete, index) => (
                  <div key={athlete.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <span className="font-bold text-gray-600 w-6">{index + 1}º</span>
                    <Avatar name={athlete.name} photoUrl={athlete.photoUrl} size="sm" />
                    <span className="flex-1 font-medium text-gray-800">{athlete.name}</span>
                    <span className="font-bold text-orange-600">{athlete.stats.hospital}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'financial' && (
        <>
          <Card title="💰 Lista de Devedores" subtitle="Controle financeiro da temporada">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Atleta</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor a Pagar</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor Pago</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Valor Devendo</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData
                    .sort((a, b) => b.debt - a.debt)
                    .map((athlete) => {
                      const isPaid = athlete.debt === 0 && athlete.fineInfo.fineAmount > 0;
                      const hasDebt = athlete.debt > 0;
                      
                      return (
                        <tr key={athlete.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={athlete.name} photoUrl={athlete.photoUrl} size="md" />
                              <span className="font-medium text-gray-800">{athlete.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-gray-800">
                            {formatCurrency(athlete.fineInfo.fineAmount)}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-green-600">
                            {formatCurrency(athlete.totalPaid)}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-red-600">
                            {formatCurrency(athlete.debt)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {isPaid ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                                ✓ PAGO
                              </span>
                            ) : hasDebt ? (
                              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-bold rounded-full">
                                DEVENDO
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-bold rounded-full">
                                SEM MULTA
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="py-4 px-4 font-bold text-gray-800">TOTAL</td>
                    <td className="py-4 px-4 text-right font-bold text-gray-800 text-lg">
                      {formatCurrency(totalExpected)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-green-600 text-lg">
                      {formatCurrency(totalPaid)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-red-600 text-lg">
                      {formatCurrency(totalDebt)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <h3 className="font-bold text-gray-700 mb-2">💵 Valor Total Previsto</h3>
              <p className="text-3xl font-bold" style={{ color: primary }}>{formatCurrency(totalExpected)}</p>
              <p className="text-sm text-gray-600 mt-2">Se todos pagarem suas multas</p>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <h3 className="font-bold text-gray-700 mb-2">💰 Valor Atual em Caixa</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              <p className="text-sm text-gray-600 mt-2">
                {formatPercentage(totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0)} arrecadado
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <h3 className="font-bold text-gray-700 mb-2">🔴 Pendente</h3>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
              <p className="text-sm text-gray-600 mt-2">Valor ainda não pago</p>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'attendance' && (
        <Card 
          title="📋 Log de Presença" 
          subtitle="Histórico detalhado de check-ins"
          actions={
            <Button
              onClick={handleExportToExcel}
              variant="secondary"
              className="flex items-center gap-2 text-sm px-3 py-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </Button>
          }
        >
          {/* Filtros */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Data
              </label>
              <input
                type="date"
                value={logDateFilter}
                onChange={(e) => setLogDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Todas as datas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Atleta
              </label>
              <input
                type="text"
                value={logAthleteFilter}
                onChange={(e) => setLogAthleteFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Digite o nome..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Status
              </label>
              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Todos os status</option>
                <option value={CheckinStatus.PRESENT}>Presente</option>
                <option value={CheckinStatus.ABSENT}>Ausente</option>
                <option value={CheckinStatus.HOSPITAL}>Hospital</option>
                <option value={CheckinStatus.JUSTIFIED}>Justificado</option>
                <option value={CalculatedStatus.REST}>Folga</option>
                <option value={CalculatedStatus.BONUS_REST}>🔶 Folga Bônus (Vale-folga)</option>
                <option value={CalculatedStatus.ABSENCE}>Falta</option>
                <option value={CalculatedStatus.EXTRA}>Presença Bônus</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Atleta</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLog
                  .filter(log => {
                    // Filtro por data
                    if (logDateFilter && log.date !== logDateFilter) return false;
                    
                    // Filtro por atleta (case insensitive)
                    if (logAthleteFilter && !log.athleteName.toLowerCase().includes(logAthleteFilter.toLowerCase())) return false;
                    
                    // Filtro por status
                    if (logStatusFilter && log.status !== logStatusFilter) return false;
                    
                    return true;
                  })
                  .map((log, index) => {
                  const statusColors = {
                    [CheckinStatus.NOT_SET]: 'bg-gray-50 text-gray-600',
                    [CheckinStatus.PRESENT]: 'bg-green-50 text-green-800',
                    [CheckinStatus.ABSENT]: 'bg-blue-50 text-blue-800',
                    [CheckinStatus.HOSPITAL]: 'bg-orange-50 text-orange-800',
                    [CheckinStatus.JUSTIFIED]: 'bg-indigo-50 text-indigo-800',
                    [CalculatedStatus.REST]: 'bg-blue-50 text-blue-800',
                    [CalculatedStatus.BONUS_REST]: 'bg-orange-50 text-orange-800',
                    [CalculatedStatus.ABSENCE]: 'bg-red-50 text-red-800',
                    [CalculatedStatus.EXTRA]: 'bg-yellow-50 text-yellow-800'
                  };

                  const statusLabels = {
                    [CheckinStatus.NOT_SET]: 'Não Marcado',
                    [CheckinStatus.PRESENT]: 'Presente',
                    [CheckinStatus.ABSENT]: 'Ausente (marcado)',
                    [CheckinStatus.HOSPITAL]: 'Hospital',
                    [CheckinStatus.JUSTIFIED]: 'Justificado',
                    [CalculatedStatus.REST]: 'Folga',
                    [CalculatedStatus.BONUS_REST]: 'Folga Bônus 🔶 (Vale-folga)',
                    [CalculatedStatus.ABSENCE]: 'Falta',
                    [CalculatedStatus.EXTRA]: 'Extra (bônus)'
                  };
                  
                  const bgClass = statusColors[log.status] || 'bg-gray-50';
                  
                  try {
                    // Formatar data manualmente sem usar Date object para evitar problemas de timezone
                    const [year, month, day] = log.date.split('-');
                    
                    // Criar date object apenas para obter o dia da semana
                    const dateForWeekday = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    const weekdayNames = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
                    const weekday = weekdayNames[dateForWeekday.getDay()];
                    
                    const formattedDate = `${day}/${month}/${year} (${weekday})`;
                    
                    return (
                      <tr key={`${log.date}-${log.athleteId}-${index}`} className={`border-b border-gray-100 ${bgClass}`}>
                        <td className="py-3 px-4 font-medium">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar 
                              name={log.athleteName} 
                              photoUrl={athletes.find(a => a.id === log.athleteId)?.photoUrl} 
                              size="sm" 
                            />
                            <span className="font-medium">{log.athleteName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-2xl">{log.emoji}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{statusLabels[log.status] || log.status}</span>
                        </td>
                      </tr>
                    );
                  } catch (error) {
                    console.error('Erro ao formatar data:', log.date, error);
                    return null;
                  }
                })}
              </tbody>
            </table>
            
            {attendanceLog.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Nenhum registro de presença encontrado.
              </div>
            )}
            
            {attendanceLog.length > 0 && attendanceLog.filter(log => {
              if (logDateFilter && log.date !== logDateFilter) return false;
              if (logAthleteFilter && !log.athleteName.toLowerCase().includes(logAthleteFilter.toLowerCase())) return false;
              if (logStatusFilter && log.status !== logStatusFilter) return false;
              return true;
            }).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Nenhum registro encontrado com os filtros aplicados.
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
