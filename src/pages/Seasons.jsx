import { useState } from 'react';
import { Plus, Settings, CheckCircle, Calendar as CalendarIcon, RefreshCw, Eye, Trash2, Trophy, Award } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { useAthletes } from '../context/AthletesContext';
import { useSeason } from '../context/SeasonContext';
import { useThemeColor } from '../context/ThemeColorContext';
import { useAuth } from '../context/AuthContext';
import { 
  createSeason, 
  updateSeason, 
  uploadSeasonLogo,
  getAllSeasons,
  finalizeSeason,
  deleteSeason,
  DEFAULT_XP_CONFIG
} from '../services/seasons';
import { getAllCheckins, processCheckins, saveCheckins, CheckinStatus } from '../services/checkins';
import { formatDate, formatCurrency } from '../utils/formatters';
import { calculateStats } from '../utils/calculator';
import { sortByRanking } from '../utils/ranking';
import { useEffect } from 'react';

const getXPFormFields = (xpConfig = DEFAULT_XP_CONFIG) => ({
  xpPresent: String(xpConfig.present),
  xpAbsence: String(xpConfig.absence),
  xpRest: String(xpConfig.rest),
  xpJustified: String(xpConfig.justified),
  xpHospital: String(xpConfig.hospital),
  xpExtra: String(xpConfig.extra),
  xpChampionBonus: String(xpConfig.championBonus),
  xpRunnerUpBonus: String(xpConfig.runnerUpBonus)
});

export default function Seasons() {
  const { athletes } = useAthletes();
  const { currentSeason, refreshSeason } = useSeason();
  const { primary } = useThemeColor();
  const { isAdmin } = useAuth();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingSeason, setViewingSeason] = useState(null);
  const [alert, setAlert] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [importFromSeasonId, setImportFromSeasonId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    finePerAbsence: '',
    weeklyRestLimit: '',
    weekStartsOn: '1',
    participants: [],
    logoFile: null,
    backgroundFile: null,
    neutralDays: [],
    bonusDates: [],
    bonusBenefit: '-',
    ...getXPFormFields()
  });

  const parseXPNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const buildXPConfigFromForm = () => ({
    present: parseXPNumber(formData.xpPresent, DEFAULT_XP_CONFIG.present),
    absence: parseXPNumber(formData.xpAbsence, DEFAULT_XP_CONFIG.absence),
    rest: parseXPNumber(formData.xpRest, DEFAULT_XP_CONFIG.rest),
    justified: parseXPNumber(formData.xpJustified, DEFAULT_XP_CONFIG.justified),
    hospital: parseXPNumber(formData.xpHospital, DEFAULT_XP_CONFIG.hospital),
    extra: parseXPNumber(formData.xpExtra, DEFAULT_XP_CONFIG.extra),
    championBonus: parseXPNumber(formData.xpChampionBonus, DEFAULT_XP_CONFIG.championBonus),
    runnerUpBonus: parseXPNumber(formData.xpRunnerUpBonus, DEFAULT_XP_CONFIG.runnerUpBonus)
  });

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      const seasonsList = await getAllSeasons();
      setSeasons(seasonsList);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao carregar temporadas' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      title: '',
      startDate: '',
      endDate: '',
      finePerAbsence: '10',
      weeklyRestLimit: '2',
      weekStartsOn: '1',
      participants: [],
      logoFile: null,
      backgroundFile: null,
      neutralDays: [],
      bonusDates: [],
      bonusBenefit: '-',
      ...getXPFormFields()
    });
    setImportFromSeasonId('');
    setIsModalOpen(true);
  };

  const handleImportFromSeason = (seasonId) => {
    const season = seasons.find(s => s.id === seasonId);
    if (season) {
      setFormData(prev => ({
        ...prev,
        finePerAbsence: season.finePerAbsence.toString(),
        weeklyRestLimit: season.weeklyRestLimit.toString(),
        weekStartsOn: (season.weekStartsOn || 1).toString(),
        participants: season.participants || [],
        neutralDays: season.neutralDays || [],
        bonusDates: [],
        bonusBenefit: season.bonusBenefit || '-',
        ...getXPFormFields(season.xpConfig)
      }));
    }
  };

  const handleOpenViewModal = (season) => {
    setViewingSeason(season);
    setIsViewModalOpen(true);
  };

  const handleDeleteSeason = async (seasonId) => {
    if (!window.confirm('Deseja excluir esta temporada? Esta ação não pode ser desfeita.')) return;

    try {
      await deleteSeason(seasonId);
      setAlert({ type: 'success', message: 'Temporada excluída com sucesso!' });
      await loadSeasons();
      setIsViewModalOpen(false);
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao excluir temporada: ${error.message}` });
    }
  };

  const handleRecalculateChampions = async (season) => {
    if (!window.confirm('Deseja recalcular os campeões desta temporada baseado nos check-ins registrados?')) return;

    try {
      setUploading(true);
      
      // Buscar todos os check-ins da temporada
      const checkinsData = await getAllCheckins(season.id);

      // Calcular ranking final
      const athletesData = (season.participants || []).map(athleteId => {
        const athlete = athletes.find(a => a.id === athleteId);
        if (!athlete) return null;

        const stats = calculateStats(checkinsData, athleteId, season.bonusBenefit);

        return {
          id: athlete.id,
          name: athlete.name,
          stats
        };
      }).filter(Boolean);

      // Ordenar por ranking
      const rankedAthletes = sortByRanking(athletesData);

      // Salvar campeões (1º e 2º lugares)
      const champions = {
        first: rankedAthletes[0] ? { 
          athleteId: rankedAthletes[0].id, 
          athleteName: rankedAthletes[0].name 
        } : null,
        second: rankedAthletes[1] ? { 
          athleteId: rankedAthletes[1].id, 
          athleteName: rankedAthletes[1].name 
        } : null
      };

      // Atualizar temporada com os campeões
      await updateSeason(season.id, { champions });
      
      setAlert({ type: 'success', message: 'Campeões recalculados com sucesso!' });
      await loadSeasons();
      
      // Atualizar o viewingSeason com os novos dados
      const updatedSeasons = await getAllSeasons();
      const updatedSeason = updatedSeasons.find(s => s.id === season.id);
      setViewingSeason(updatedSeason);
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao recalcular campeões: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };
  const handleOpenConfigModal = () => {
    if (currentSeason) {
      setFormData({
        title: currentSeason.title,
        startDate: formatDate(currentSeason.startDate, 'yyyy-MM-dd'),
        endDate: formatDate(currentSeason.endDate, 'yyyy-MM-dd'),
        finePerAbsence: currentSeason.finePerAbsence.toString(),
        weeklyRestLimit: currentSeason.weeklyRestLimit.toString(),
        weekStartsOn: (currentSeason.weekStartsOn || 1).toString(),
        participants: currentSeason.participants || [],
        logoFile: null,
        backgroundFile: null,
        neutralDays: currentSeason.neutralDays || [],
        bonusDates: currentSeason.bonusDates || [],
        bonusBenefit: currentSeason.bonusBenefit || '-',
        ...getXPFormFields(currentSeason.xpConfig)
      });
      setIsConfigModalOpen(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setAlert(null);

    try {
      const seasonData = {
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
        finePerAbsence: parseFloat(formData.finePerAbsence),
        weeklyRestLimit: parseInt(formData.weeklyRestLimit),
        weekStartsOn: parseInt(formData.weekStartsOn),
        participants: formData.participants,
        neutralDays: formData.neutralDays,
        bonusDates: formData.bonusDates,
        bonusBenefit: formData.bonusBenefit,
        xpConfig: buildXPConfigFromForm(),
        logoUrl: '',
        backgroundUrl: ''
      };

      const newSeason = await createSeason(seasonData);

      // Upload logo e background
      const updates = {};
      if (formData.logoFile) {
        const logoUrl = await uploadSeasonLogo(formData.logoFile, newSeason.id);
        updates.logoUrl = logoUrl;
      }
      if (formData.backgroundFile) {
        const backgroundUrl = await uploadSeasonLogo(formData.backgroundFile, newSeason.id);
        updates.backgroundUrl = backgroundUrl;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateSeason(newSeason.id, updates);
      }

      setAlert({ type: 'success', message: 'Temporada criada com sucesso!' });
      await loadSeasons();
      await refreshSeason();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar temporada:', error);
      setAlert({ type: 'error', message: 'Erro ao criar temporada. Tente novamente.' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    setUploading(true);
    setAlert(null);

    try {
      const updates = {
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
        finePerAbsence: parseFloat(formData.finePerAbsence),
        weeklyRestLimit: parseInt(formData.weeklyRestLimit),
        weekStartsOn: parseInt(formData.weekStartsOn),
        participants: formData.participants,
        neutralDays: formData.neutralDays,
        bonusDates: formData.bonusDates,
        bonusBenefit: formData.bonusBenefit,
        xpConfig: buildXPConfigFromForm()
      };

      if (formData.logoFile) {
        const logoUrl = await uploadSeasonLogo(formData.logoFile, currentSeason.id);
        updates.logoUrl = logoUrl;
      }
      
      if (formData.backgroundFile) {
        const backgroundUrl = await uploadSeasonLogo(formData.backgroundFile, currentSeason.id);
        updates.backgroundUrl = backgroundUrl;
      }

      await updateSeason(currentSeason.id, updates);
      setAlert({ type: 'success', message: 'Configurações atualizadas com sucesso!' });
      await loadSeasons();
      await refreshSeason();
      setIsConfigModalOpen(false);
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao atualizar: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleFinalizeSeason = async (seasonId) => {
    if (!window.confirm('Deseja finalizar esta temporada? Ela ficará inativa.')) return;

    try {
      // Buscar a temporada sendo finalizada
      const season = seasons.find(s => s.id === seasonId);
      if (!season) {
        throw new Error('Temporada não encontrada');
      }

      // Buscar todos os check-ins da temporada
      const checkinsData = await getAllCheckins(seasonId);

      // Calcular ranking final
      const athletesData = (season.participants || []).map(athleteId => {
        const athlete = athletes.find(a => a.id === athleteId);
        if (!athlete) return null;

        const stats = calculateStats(checkinsData, athleteId, season.bonusBenefit);

        return {
          id: athlete.id,
          name: athlete.name,
          stats
        };
      }).filter(Boolean);

      // Ordenar por ranking
      const rankedAthletes = sortByRanking(athletesData);

      // Salvar campeões (1º e 2º lugares)
      const champions = {
        first: rankedAthletes[0] ? { 
          athleteId: rankedAthletes[0].id, 
          athleteName: rankedAthletes[0].name 
        } : null,
        second: rankedAthletes[1] ? { 
          athleteId: rankedAthletes[1].id, 
          athleteName: rankedAthletes[1].name 
        } : null
      };

      // Finalizar temporada com os campeões
      await finalizeSeason(seasonId, champions);
      setAlert({ type: 'success', message: 'Temporada finalizada com sucesso!' });
      await loadSeasons();
      await refreshSeason();
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao finalizar temporada: ${error.message}` });
    }
  };

  const handleParticipantToggle = (athleteId) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(athleteId)
        ? prev.participants.filter(id => id !== athleteId)
        : [...prev.participants, athleteId]
    }));
  };

  const handleReprocessCheckins = async () => {
    if (!currentSeason) {
      setAlert({ type: 'error', message: 'Nenhuma temporada ativa encontrada' });
      return;
    }

    if (!window.confirm(
      'Deseja reprocessar todos os check-ins da temporada atual?\n\n' +
      'Isso irá recalcular o status de todos os atletas (folgas/faltas) ' +
      'baseado nas regras atuais. Esta ação pode levar alguns minutos.'
    )) return;

    try {
      setReprocessing(true);
      setAlert({ type: 'info', message: 'Reprocessando check-ins... Aguarde.' });

      // Buscar todos os check-ins da temporada
      const allCheckins = await getAllCheckins(currentSeason.id);
      
      // Ordenar por data para processar em ordem cronológica
      const sortedCheckins = allCheckins.sort((a, b) => a.date.localeCompare(b.date));
      
      let processedCount = 0;

      // Garantir que a temporada tem todos os campos necessários
      const seasonWithDefaults = {
        id: currentSeason.id,
        title: currentSeason.title,
        weekStartsOn: currentSeason.weekStartsOn ?? 1,
        weeklyRestLimit: currentSeason.weeklyRestLimit ?? 2,
        bonusDates: currentSeason.bonusDates || [],
        participants: currentSeason.participants || []
      };

      console.log('Temporada para reprocessamento:', seasonWithDefaults);
      console.log('Total de check-ins:', sortedCheckins.length);

      // Reprocessar cada check-in
      for (const checkin of sortedCheckins) {
        console.log(`Processando ${checkin.date}...`);
        
        // Preparar dados no formato que processCheckins espera
        const rawCheckins = {};
        for (const [athleteId, athleteData] of Object.entries(checkin.athletes || {})) {
          rawCheckins[athleteId] = {
            status: athleteData.originalStatus || athleteData.status
          };
        }

        // Reprocessar com as regras atuais
        const processedCheckins = await processCheckins(seasonWithDefaults, checkin.date, rawCheckins);
        
        // Salvar de volta (passando rawCheckins e season para que saveCheckins possa reprocessar)
        await saveCheckins(currentSeason.id, checkin.date, rawCheckins, seasonWithDefaults);
        processedCount++;
      }

      setAlert({ 
        type: 'success', 
        message: `✅ Reprocessamento concluído! ${processedCount} check-ins atualizados.` 
      });
    } catch (error) {
      console.error('Erro ao reprocessar:', error);
      setAlert({ 
        type: 'error', 
        message: `Erro ao reprocessar check-ins: ${error.message}` 
      });
    } finally {
      setReprocessing(false);
    }
  };

  if (loading) {
    return <Loading text="Carregando temporadas..." />;
  }

  return (
    <>
      {/* Pop-up de notificação fixo no topo */}
      {alert && (
        <div className="fixed top-4 right-4 z-[10000] animate-slide-in">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Temporadas</h1>
          <p className="text-gray-600 mt-2">Gerencie as temporadas do projeto</p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenModal} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Temporada
          </Button>
        )}
      </div>



      <Card title="Todas as Temporadas">
        {seasons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhuma temporada criada ainda.</p>
            <Button onClick={handleOpenModal}>Criar Primeira Temporada</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {seasons.map((season) => (
              <div
                key={season.id}
                className={`p-4 rounded-lg border-2 ${
                  season.active
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {season.title}
                      </h3>
                      {season.active && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                          ATIVA
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <CalendarIcon className="w-4 h-4 inline mr-1 text-gray-500" />
                        {formatDate(season.startDate)} - {formatDate(season.endDate)}
                      </div>
                      <div>
                        Multa: {formatCurrency(season.finePerAbsence)}
                      </div>
                      <div>
                        {season.participants?.length || 0} participantes
                      </div>
                      <div>
                        {season.weeklyRestLimit} folgas/semana
                      </div>
                    </div>
                  </div>
                  {season.active && isAdmin && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        onClick={handleOpenConfigModal}
                        className="flex items-center gap-1 px-3"
                        title="Configurar Temporada"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleFinalizeSeason(season.id)}
                      >
                        Finalizar
                      </Button>
                    </div>
                  )}
                  {!season.active && isAdmin && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenViewModal(season)}
                        className="flex items-center gap-1 px-3"
                        title="Visualizar Temporada"
                      >
                        <Eye className="w-4 h-4" />
                        Visualizar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal Nova Temporada */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Temporada"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importar Configurações de Temporada Anterior
            </label>
            <select
              value={importFromSeasonId}
              onChange={(e) => {
                setImportFromSeasonId(e.target.value);
                if (e.target.value) {
                  handleImportFromSeason(e.target.value);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.boxShadow = `0 0 0 3px ${primary}40`;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Começar do zero</option>
              {seasons.filter(s => !s.active).map((season) => (
                <option key={season.id} value={season.id}>
                  {season.title} ({formatDate(season.startDate)} - {formatDate(season.endDate)})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Importa participantes e configurações (multa, folgas, XP, etc.) de uma temporada finalizada
            </p>
          </div>

          <Input
            label="Título da Temporada"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Temporada Verão 2025"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de Início"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Data de Término"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Multa por Falta (R$)"
              type="number"
              step="0.01"
              value={formData.finePerAbsence}
              onChange={(e) => setFormData({ ...formData, finePerAbsence: e.target.value })}
              required
            />
            <Input
              label="Folgas Semanais Permitidas"
              type="number"
              value={formData.weeklyRestLimit}
              onChange={(e) => setFormData({ ...formData, weeklyRestLimit: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dia de Início da Semana
            </label>
            <select
              value={formData.weekStartsOn}
              onChange={(e) => setFormData({ ...formData, weekStartsOn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="0">Domingo</option>
              <option value="1">Segunda-feira</option>
              <option value="2">Terça-feira</option>
              <option value="3">Quarta-feira</option>
              <option value="4">Quinta-feira</option>
              <option value="5">Sexta-feira</option>
              <option value="6">Sábado</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Escolha o dia em que a semana útil começa para cálculo de faltas</p>
          </div>

          <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Configuração de XP da Temporada</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="XP Presença"
                type="number"
                value={formData.xpPresent}
                onChange={(e) => setFormData({ ...formData, xpPresent: e.target.value })}
                required
              />
              <Input
                label="XP Falta"
                type="number"
                value={formData.xpAbsence}
                onChange={(e) => setFormData({ ...formData, xpAbsence: e.target.value })}
                required
              />
              <Input
                label="XP Folga"
                type="number"
                value={formData.xpRest}
                onChange={(e) => setFormData({ ...formData, xpRest: e.target.value })}
                required
              />
              <Input
                label="XP Justificado"
                type="number"
                value={formData.xpJustified}
                onChange={(e) => setFormData({ ...formData, xpJustified: e.target.value })}
                required
              />
              <Input
                label="XP Hospital"
                type="number"
                value={formData.xpHospital}
                onChange={(e) => setFormData({ ...formData, xpHospital: e.target.value })}
                required
              />
              <Input
                label="XP Extra"
                type="number"
                value={formData.xpExtra}
                onChange={(e) => setFormData({ ...formData, xpExtra: e.target.value })}
                required
              />
              <Input
                label="Bônus Campeão"
                type="number"
                value={formData.xpChampionBonus}
                onChange={(e) => setFormData({ ...formData, xpChampionBonus: e.target.value })}
                required
              />
              <Input
                label="Bônus Vice"
                type="number"
                value={formData.xpRunnerUpBonus}
                onChange={(e) => setFormData({ ...formData, xpRunnerUpBonus: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo da Temporada
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, logoFile: e.target.files[0] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-1">Logo circular que aparece no rodapé da imagem semanal</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background para Imagem Semanal
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, backgroundFile: e.target.files[0] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-1">Imagem de fundo para o status semanal (recomendado: 720x1280px)</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Participantes <span className="text-red-500">*</span>
            </label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
              {athletes.map((athlete) => (
                <label key={athlete.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(athlete.id)}
                    onChange={() => handleParticipantToggle(athlete.id)}
                    className="w-5 h-5"
                    style={{ accentColor: primary }}
                  />
                  <span className="font-medium">{athlete.name}</span>
                  <span className="text-sm text-gray-500">({athlete.experienceLevel})</span>
                </label>
              ))}
            </div>
            {formData.participants.length === 0 && (
              <p className="text-red-500 text-sm mt-1">Selecione pelo menos um participante</p>
            )}
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading || formData.participants.length === 0}>
              {uploading ? 'Criando...' : 'Criar Temporada'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Configurações */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configurações da Temporada"
        size="lg"
      >
        <form onSubmit={handleUpdateConfig}>
          <Input
            label="Título da Temporada"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de Início"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Data de Término"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Multa por Falta (R$)"
              type="number"
              step="0.01"
              value={formData.finePerAbsence}
              onChange={(e) => setFormData({ ...formData, finePerAbsence: e.target.value })}
              required
            />
            <Input
              label="Folgas Semanais Permitidas"
              type="number"
              value={formData.weeklyRestLimit}
              onChange={(e) => setFormData({ ...formData, weeklyRestLimit: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dia de Início da Semana
            </label>
            <select
              value={formData.weekStartsOn}
              onChange={(e) => setFormData({ ...formData, weekStartsOn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="0">Domingo</option>
              <option value="1">Segunda-feira</option>
              <option value="2">Terça-feira</option>
              <option value="3">Quarta-feira</option>
              <option value="4">Quinta-feira</option>
              <option value="5">Sexta-feira</option>
              <option value="6">Sábado</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Escolha o dia em que a semana útil começa para cálculo de faltas</p>
          </div>

          <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Configuração de XP da Temporada</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="XP Presença"
                type="number"
                value={formData.xpPresent}
                onChange={(e) => setFormData({ ...formData, xpPresent: e.target.value })}
                required
              />
              <Input
                label="XP Falta"
                type="number"
                value={formData.xpAbsence}
                onChange={(e) => setFormData({ ...formData, xpAbsence: e.target.value })}
                required
              />
              <Input
                label="XP Folga"
                type="number"
                value={formData.xpRest}
                onChange={(e) => setFormData({ ...formData, xpRest: e.target.value })}
                required
              />
              <Input
                label="XP Justificado"
                type="number"
                value={formData.xpJustified}
                onChange={(e) => setFormData({ ...formData, xpJustified: e.target.value })}
                required
              />
              <Input
                label="XP Hospital"
                type="number"
                value={formData.xpHospital}
                onChange={(e) => setFormData({ ...formData, xpHospital: e.target.value })}
                required
              />
              <Input
                label="XP Extra"
                type="number"
                value={formData.xpExtra}
                onChange={(e) => setFormData({ ...formData, xpExtra: e.target.value })}
                required
              />
              <Input
                label="Bônus Campeão"
                type="number"
                value={formData.xpChampionBonus}
                onChange={(e) => setFormData({ ...formData, xpChampionBonus: e.target.value })}
                required
              />
              <Input
                label="Bônus Vice"
                type="number"
                value={formData.xpRunnerUpBonus}
                onChange={(e) => setFormData({ ...formData, xpRunnerUpBonus: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo da Temporada
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, logoFile: e.target.files[0] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-1">Logo circular que aparece no rodapé da imagem semanal</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background para Imagem Semanal
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, backgroundFile: e.target.files[0] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-sm text-gray-500 mt-1">Imagem de fundo para o status semanal (recomendado: 720x1280px)</p>
            {currentSeason?.backgroundUrl && !formData.backgroundFile && (
              <p className="text-sm text-green-600 mt-1">✓ Background atual configurado</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Participantes
            </label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
              {athletes.map((athlete) => (
                <label key={athlete.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(athlete.id)}
                    onChange={() => handleParticipantToggle(athlete.id)}
                    className="w-5 h-5"
                    style={{ accentColor: primary }}
                  />
                  <span className="font-medium">{athlete.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datas Bônus ⭐ (Presenças nestes dias ganham Extra automaticamente)
            </label>
            <div className="space-y-2">
              {formData.bonusDates.map((date, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      const newDates = [...formData.bonusDates];
                      newDates[index] = e.target.value;
                      setFormData({ ...formData, bonusDates: newDates });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newDates = formData.bonusDates.filter((_, i) => i !== index);
                      setFormData({ ...formData, bonusDates: newDates });
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, bonusDates: [...formData.bonusDates, ''] })}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 transition-colors"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = primary;
                  e.currentTarget.style.color = primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#4b5563';
                }}
              >
                + Adicionar Data Bônus
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefício da Data Extra ⭐
            </label>
            <select
              value={formData.bonusBenefit}
              onChange={(e) => setFormData({ ...formData, bonusBenefit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.boxShadow = `0 0 0 3px ${primary}40`;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="-">- (Não definido)</option>
              <option value="vale-folga">Vale-folga</option>
            </select>
            {formData.bonusBenefit === 'vale-folga' && (
              <p className="text-sm mt-2 p-3 rounded-lg" style={{ color: primary, backgroundColor: `${primary}15`, borderWidth: '1px', borderColor: primary }}>
                ℹ️ <strong>Vale-folga:</strong> Cada estrela (⭐) conquistada permite que o atleta tenha uma falta anulada, 
                transformando-a em uma folga simples (🔷). As estrelas são utilizadas automaticamente para compensar faltas.
              </p>
            )}
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Reprocessar Check-ins
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                Use esta função para recalcular todos os status de presença (folgas/faltas) 
                baseado nas regras atuais da temporada. Útil quando você altera o limite de 
                folgas ou o dia de início da semana.
              </p>
              <Button
                type="button"
                onClick={handleReprocessCheckins}
                disabled={reprocessing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${reprocessing ? 'animate-spin' : ''}`} />
                {reprocessing ? 'Reprocessando...' : 'Reprocessar Todos os Check-ins'}
              </Button>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsConfigModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Visualização de Temporada Antiga */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Visualizar Temporada: ${viewingSeason?.title || ''}`}
        size="lg"
      >
        {viewingSeason && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                ⚠️ Esta é uma temporada finalizada. Não é possível editar as configurações, apenas visualizar ou excluir.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título da Temporada</label>
              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                {viewingSeason.title}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {formatDate(viewingSeason.startDate)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Término</label>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {formatDate(viewingSeason.endDate)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Multa por Falta</label>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {formatCurrency(viewingSeason.finePerAbsence)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Folgas Semanais Permitidas</label>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {viewingSeason.weeklyRestLimit}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dia de Início da Semana</label>
              <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                {['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][viewingSeason.weekStartsOn || 1]}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Configuração de XP</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">Presença: {viewingSeason.xpConfig?.present}</div>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">Falta: {viewingSeason.xpConfig?.absence}</div>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">Folga: {viewingSeason.xpConfig?.rest}</div>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">Justificado: {viewingSeason.xpConfig?.justified}</div>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">Hospital: {viewingSeason.xpConfig?.hospital}</div>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">Extra: {viewingSeason.xpConfig?.extra}</div>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">Bônus campeão: {viewingSeason.xpConfig?.championBonus}</div>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">Bônus vice: {viewingSeason.xpConfig?.runnerUpBonus}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Participantes</label>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {viewingSeason.participants?.length > 0 ? (
                  <div className="space-y-2">
                    {viewingSeason.participants.map((participantId) => {
                      const athlete = athletes.find(a => a.id === participantId);
                      return athlete ? (
                        <div key={participantId} className="flex items-center gap-2 p-2 bg-white rounded border">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{athlete.name}</span>
                          <span className="text-sm text-gray-500">({athlete.experienceLevel})</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum participante cadastrado</p>
                )}
              </div>
            </div>

            {viewingSeason.bonusDates && viewingSeason.bonusDates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Datas Bônus ⭐</label>
                <div className="space-y-2">
                  {viewingSeason.bonusDates.map((date, index) => (
                    <div key={index} className="px-4 py-2 bg-yellow-50 border border-yellow-300 rounded-lg text-gray-700">
                      {formatDate(new Date(date))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewingSeason.bonusBenefit && viewingSeason.bonusBenefit !== '-' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefício da Data Extra</label>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {viewingSeason.bonusBenefit === 'vale-folga' ? 'Vale-folga' : viewingSeason.bonusBenefit}
                </div>
              </div>
            )}

            {/* Seção de Campeões */}
            <div className="border-t pt-6 mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">🏆 Campeões da Temporada</label>
              
              {viewingSeason.champions ? (
                <div className="space-y-3">
                  {viewingSeason.champions.first && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-lg shadow-md">
                      <Trophy className="w-6 h-6" />
                      <div>
                        <div className="font-bold text-sm">1º Lugar - Campeão</div>
                        <div className="text-lg font-bold">{viewingSeason.champions.first.athleteName}</div>
                      </div>
                    </div>
                  )}
                  
                  {viewingSeason.champions.second && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 rounded-lg shadow-md">
                      <Award className="w-6 h-6" />
                      <div>
                        <div className="font-bold text-sm">2º Lugar - Vice-campeão</div>
                        <div className="text-lg font-bold">{viewingSeason.champions.second.athleteName}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 mb-3">
                    Esta temporada não tem campeões registrados. Clique no botão abaixo para calcular automaticamente 
                    baseado nos check-ins registrados.
                  </p>
                  <Button
                    type="button"
                    onClick={() => handleRecalculateChampions(viewingSeason)}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    {uploading ? 'Calculando...' : 'Calcular Campeões'}
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t pt-6 mt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Zona de Perigo
                </h4>
                <p className="text-sm text-red-700 mb-3">
                  Excluir esta temporada removerá permanentemente todos os dados associados a ela. Esta ação não pode ser desfeita.
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleDeleteSeason(viewingSeason.id)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Temporada
                </Button>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </>
  );
}
