import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Trophy, Award } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Loading } from '../components/Loading';
import { Alert } from '../components/Alert';
import { useAthletes } from '../context/AthletesContext';
import { useThemeColor } from '../context/ThemeColorContext';
import { useAuth } from '../context/AuthContext';
import { 
  createAthlete, 
  updateAthlete, 
  deleteAthlete, 
  uploadAthletePhoto 
} from '../services/athletes';
import { calculateAthleteGlobalStats, getAthleteRankWithXP } from '../services/checkins';
import { getAthleteTitles } from '../services/seasons';
import { formatRankWithXP } from '../utils/formatters';

export default function Athletes() {
  const { athletes, loading, refreshAthletes } = useAthletes();
  const { primary } = useThemeColor();
  const { isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedStatsAthlete, setSelectedStatsAthlete] = useState(null);
  const [athleteGlobalStats, setAthleteGlobalStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [athleteTitles, setAthleteTitles] = useState({});
  const [athleteRanks, setAthleteRanks] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    photoFile: null
  });
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const loadAthleteMetadata = async () => {
      if (loading) return;

      setPageLoading(true);

      try {
        const [titlesMap, ranksMap] = await Promise.all([
          buildAthleteTitlesMap(),
          buildAthleteRanksMap()
        ]);

        if (isCancelled) return;

        setAthleteTitles(titlesMap);
        setAthleteRanks(ranksMap);
      } catch (error) {
        console.error('Erro ao carregar dados dos atletas:', error);
      } finally {
        if (!isCancelled) {
          setPageLoading(false);
        }
      }
    };

    loadAthleteMetadata();

    return () => {
      isCancelled = true;
    };
  }, [athletes, loading]);

  const buildAthleteTitlesMap = async () => {
    const titlesMap = {};
    for (const athlete of athletes) {
      const titles = await getAthleteTitles(athlete.id);
      if (titles.length > 0) {
        titlesMap[athlete.id] = titles;
      }
    }
    return titlesMap;
  };

  const buildAthleteRanksMap = async () => {
    const ranksMap = {};
    for (const athlete of athletes) {
      try {
        const stats = await calculateAthleteGlobalStats(athlete.id);
        const rankData = getAthleteRankWithXP(stats);
        ranksMap[athlete.id] = rankData;
      } catch (error) {
        console.error(`Erro ao calcular rank para ${athlete.name}:`, error);
      }
    }
    return ranksMap;
  };

  const handleOpenModal = (athlete = null) => {
    if (athlete) {
      setSelectedAthlete(athlete);
      setFormData({
        name: athlete.name,
        photoFile: null
      });
    } else {
      setSelectedAthlete(null);
      setFormData({
        name: '',
        photoFile: null
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAthlete(null);
    setFormData({ name: '', photoFile: null });
  };

  const handleOpenStatsModal = async (athlete) => {
    setSelectedStatsAthlete(athlete);
    setAthleteGlobalStats(null);
    setLoadingStats(true);
    setIsStatsModalOpen(true);

    try {
      const stats = await calculateAthleteGlobalStats(athlete.id);
      const rankData = getAthleteRankWithXP(stats);
      setAthleteGlobalStats({ ...stats, rankData });
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao carregar estatísticas do atleta: ${error.message}` });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCloseStatsModal = () => {
    setIsStatsModalOpen(false);
    setSelectedStatsAthlete(null);
    setAthleteGlobalStats(null);
    setLoadingStats(false);
  };

  const handleEditFromStatsModal = () => {
    if (!selectedStatsAthlete) return;
    handleCloseStatsModal();
    handleOpenModal(selectedStatsAthlete);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setAlert(null);

    try {
      let photoUrl = selectedAthlete?.photoUrl || '';

      if (selectedAthlete) {
        // Atualizar atleta existente
        const updates = {
          name: formData.name
        };

        if (formData.photoFile) {
          photoUrl = await uploadAthletePhoto(formData.photoFile, selectedAthlete.id);
          updates.photoUrl = photoUrl;
        }

        await updateAthlete(selectedAthlete.id, updates);
        setAlert({ type: 'success', message: 'Atleta atualizado com sucesso!' });
      } else {
        // Criar novo atleta
        const newAthlete = await createAthlete({
          name: formData.name,
          photoUrl: ''
        });

        if (formData.photoFile) {
          photoUrl = await uploadAthletePhoto(formData.photoFile, newAthlete.id);
          await updateAthlete(newAthlete.id, { photoUrl });
        }

        setAlert({ type: 'success', message: 'Atleta cadastrado com sucesso!' });
      }

      await refreshAthletes();
      handleCloseModal();
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao salvar atleta: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (athleteId, athleteName) => {
    if (!window.confirm(`Deseja realmente excluir ${athleteName}?`)) return;

    try {
      await deleteAthlete(athleteId);
      setAlert({ type: 'success', message: 'Atleta excluído com sucesso!' });
      await refreshAthletes();
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao excluir atleta: ${error.message}` });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photoFile: file });
    }
  };

  if (loading || pageLoading) {
    return <Loading text="Carregando atletas..." />;
  }

  const statsSummary = athleteGlobalStats ? [
    { label: 'Presenças', value: athleteGlobalStats.present },
    { label: 'Faltas', value: athleteGlobalStats.absence },
    { label: 'Descansos', value: athleteGlobalStats.rest },
    { label: 'Hospital', value: athleteGlobalStats.hospital },
    { label: 'Justificados', value: athleteGlobalStats.justified },
    { label: 'Extras', value: athleteGlobalStats.extra },
    { label: 'Não marcados', value: athleteGlobalStats.notSet }
  ] : [];

  const rankOrder = [
    'Deus do Shape',
    'Lenda',
    'Monstro',
    'Tanque de Guerra',
    'Maromba',
    'Braçudinho',
    'Atleta',
    'Saudável',
    'Franguinho'
  ];

  const rankSectionStyles = {
    'Franguinho': 'bg-slate-50 border-slate-200',
    'Saudável': 'bg-emerald-50 border-emerald-200',
    'Atleta': 'bg-blue-50 border-blue-200',
    'Braçudinho': 'bg-indigo-50 border-indigo-200',
    'Maromba': 'bg-violet-50 border-violet-200',
    'Tanque de Guerra': 'bg-amber-50 border-amber-200',
    'Monstro': 'bg-orange-50 border-orange-200',
    'Lenda': 'bg-fuchsia-50 border-fuchsia-200',
    'Deus do Shape': 'bg-rose-50 border-rose-200'
  };

  const groupedAthletesByRank = [...athletes].reduce((acc, athlete) => {
    const rankName = athleteRanks[athlete.id]?.name || 'Franguinho';

    if (!acc[rankName]) {
      acc[rankName] = [];
    }

    acc[rankName].push(athlete);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Atletas</h1>
          <p className="text-gray-600 mt-2">Gerencie os atletas cadastrados</p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Atleta
          </Button>
        )}
      </div>

      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {athletes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum atleta cadastrado ainda.</p>
            <Button onClick={() => handleOpenModal()}>
              Cadastrar Primeiro Atleta
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {rankOrder
            .filter((rankName) => groupedAthletesByRank[rankName]?.length)
            .map((rankName) => (
              <section
                key={rankName}
                className={`rounded-xl border p-3 ${rankSectionStyles[rankName] || 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-800">{rankName}</h2>
                  <span className="text-sm font-semibold text-gray-700">
                    {groupedAthletesByRank[rankName].length} atleta(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...groupedAthletesByRank[rankName]]
                    .sort((a, b) => {
                      const titlesCountA = athleteTitles[a.id]?.length || 0;
                      const titlesCountB = athleteTitles[b.id]?.length || 0;

                      if (titlesCountB !== titlesCountA) {
                        return titlesCountB - titlesCountA;
                      }

                      return a.name.localeCompare(b.name, 'pt-BR');
                    })
                    .map((athlete) => (
                      <div
                        key={athlete.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleOpenStatsModal(athlete)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenStatsModal(athlete);
                          }
                        }}
                      >
                        <Card className="relative cursor-pointer hover:shadow-lg transition-shadow !p-4">
                          <div className="flex flex-col items-center">
                            <Avatar
                              name={athlete.name}
                              photoUrl={athlete.photoUrl}
                              size="lg"
                              className="mb-3"
                            />
                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                              {athlete.name}
                            </h3>
                            <p className="text-xs text-gray-600 mb-3">
                              {athleteRanks[athlete.id] ? formatRankWithXP(athleteRanks[athlete.id]) : 'Carregando...'}
                            </p>

                            {athleteTitles[athlete.id] && athleteTitles[athlete.id].length > 0 && (
                              <div className="w-full mb-1 space-y-1">
                                {athleteTitles[athlete.id].map((title, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-[11px] ${
                                      title.type === 'champion'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    {title.type === 'champion' ? (
                                      <>
                                        <Trophy className="w-3 h-3" />
                                        <span>Campeão {title.seasonTitle}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Award className="w-3 h-3" />
                                        <span>Vice {title.seasonTitle}</span>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    ))}
                </div>
              </section>
            ))}
        </div>
      )}

      <Modal
        isOpen={isStatsModalOpen}
        onClose={handleCloseStatsModal}
        title={selectedStatsAthlete ? `Opções e Estatísticas - ${selectedStatsAthlete.name}` : 'Opções e Estatísticas'}
        size="md"
      >
        {loadingStats ? (
          <Loading text="Carregando estatísticas gerais..." />
        ) : (
          <div className="space-y-6">
            {selectedStatsAthlete && (
              <div className="flex items-center gap-4">
                <Avatar
                  name={selectedStatsAthlete.name}
                  photoUrl={selectedStatsAthlete.photoUrl}
                  size="lg"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedStatsAthlete.name}</h3>
                  <p className="text-sm text-gray-600">
                    {athleteGlobalStats?.rankData ? formatRankWithXP(athleteGlobalStats.rankData) : 'Carregando...'}
                  </p>
                </div>
              </div>
            )}

            {athleteGlobalStats && athleteGlobalStats.total > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {statsSummary.map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600">{item.label}</p>
                      <p className="text-xl font-bold text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-1">
                  <p className="text-sm text-gray-600">Total de registros</p>
                  <p className="text-2xl font-bold text-gray-800">{athleteGlobalStats.total}</p>
                  <p className="text-sm text-gray-600">
                    Temporadas com registro: {athleteGlobalStats.seasonsWithRecords}
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-600">Este atleta ainda não possui registros de check-in em temporadas.</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              {isAdmin && selectedStatsAthlete && (
                <Button onClick={handleEditFromStatsModal} className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editar Atleta
                </Button>
              )}
              <Button variant="secondary" onClick={handleCloseStatsModal}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedAthlete ? 'Editar Atleta' : 'Novo Atleta'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nome do Atleta"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Digite o nome completo"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto do Atleta
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.boxShadow = `0 0 0 3px ${primary}40`;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            />
            {selectedAthlete?.photoUrl && !formData.photoFile && (
              <p className="text-sm text-gray-500 mt-2">
                Deixe em branco para manter a foto atual
              </p>
            )}
          </div>

          {selectedAthlete && (
            <div className="border-t pt-6 mt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Zona de Perigo
                </h4>
                <p className="text-sm text-red-700 mb-3">
                  Excluir este atleta removerá permanentemente todos os dados associados a ele. Esta ação não pode ser desfeita.
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    handleDelete(selectedAthlete.id, selectedAthlete.name);
                    handleCloseModal();
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Atleta
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
