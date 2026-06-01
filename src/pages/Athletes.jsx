import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Trophy, Award, Crop, PowerOff, Power } from 'lucide-react';
import { ImageCropper } from '../components/ImageCropper';
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
  uploadAthletePhoto,
  uploadFullPhoto,
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
    photoFile: null,
    fullPhotoFile: null,
    croppedProfileUrl: null,
  });
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [fullPhotoPreviewUrl, setFullPhotoPreviewUrl] = useState(null);

  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadAthleteMetadata = async () => {
      if (loading) return;
      setPageLoading(true);
      try {
        // Lê cache de títulos e de XP/rank direto dos documentos — sem chamar checkins
        const titlesMap = await buildAthleteTitlesMap();
        const ranksMap = {};
        let anyCache = false;
        for (const athlete of athletes) {
          if (athlete.cachedRankData) {
            ranksMap[athlete.id] = athlete.cachedRankData;
            anyCache = true;
          }
        }
        if (isCancelled) return;
        setAthleteTitles(titlesMap);
        setAthleteRanks(ranksMap);

        // Primeira vez: nenhum atleta tem cache → calcula automaticamente
        if (!anyCache && athletes.length > 0) handleRecalcularXPs();
      } catch (error) {
        console.error('Erro ao carregar dados dos atletas:', error);
      } finally {
        if (!isCancelled) setPageLoading(false);
      }
    };

    loadAthleteMetadata();
    return () => { isCancelled = true; };
  }, [athletes, loading]);

  const buildAthleteTitlesMap = async () => {
    const titlesMap = {};
    for (const athlete of athletes) {
      const titles = await getAthleteTitles(athlete.id);
      if (titles.length > 0) titlesMap[athlete.id] = titles;
    }
    return titlesMap;
  };

  const handleRecalcularXPs = async () => {
    setRecalculating(true);
    setAlert(null);
    try {
      const ranksMap = {};
      for (const athlete of athletes) {
        try {
          const stats = await calculateAthleteGlobalStats(athlete.id);
          const rankData = getAthleteRankWithXP(stats);
          ranksMap[athlete.id] = rankData;
          await updateAthlete(athlete.id, { cachedRankData: rankData });
        } catch (error) {
          console.error(`Erro ao calcular rank para ${athlete.name}:`, error);
        }
      }
      setAthleteRanks(ranksMap);
      setAlert({ type: 'success', message: 'XPs recalculados com sucesso!' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao recalcular XPs.' });
    } finally {
      setRecalculating(false);
    }
  };

  const handleToggleDeactivate = async (athlete) => {
    const next = !athlete.deactivated;
    try {
      await updateAthlete(athlete.id, { deactivated: next });
      await refreshAthletes();
      setAlert({ type: 'success', message: next ? `${athlete.name} desativado.` : `${athlete.name} reativado!` });
      handleCloseStatsModal();
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao ${next ? 'desativar' : 'reativar'} atleta.` });
    }
  };

  const emptyForm = { name: '', titulo: '', photoFile: null, fullPhotoFile: null, croppedProfileUrl: null };

  const handleOpenModal = (athlete = null) => {
    if (athlete) {
      setSelectedAthlete(athlete);
      setFormData({ ...emptyForm, name: athlete.name, titulo: athlete.titulo || '' });
    } else {
      setSelectedAthlete(null);
      setFormData(emptyForm);
    }
    setFullPhotoPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAthlete(null);
    setFormData(emptyForm);
    setFullPhotoPreviewUrl(null);
    setIsCropperOpen(false);
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
      let fullPhotoUrl = selectedAthlete?.fullPhotoUrl || '';

      // Foto completa nova
      if (formData.fullPhotoFile) {
        fullPhotoUrl = await uploadFullPhoto(formData.fullPhotoFile);
      }

      // Perfil: recorte tem prioridade, senão usa upload direto
      if (formData.croppedProfileUrl) {
        photoUrl = formData.croppedProfileUrl;
      } else if (formData.photoFile) {
        photoUrl = await uploadAthletePhoto(formData.photoFile);
      }

      if (selectedAthlete) {
        const updates = { name: formData.name, titulo: formData.titulo || '' };
        if (photoUrl !== selectedAthlete.photoUrl) updates.photoUrl = photoUrl;
        if (fullPhotoUrl !== selectedAthlete.fullPhotoUrl) updates.fullPhotoUrl = fullPhotoUrl;

        await updateAthlete(selectedAthlete.id, updates);
        setAlert({ type: 'success', message: 'Atleta atualizado com sucesso!' });
      } else {
        const newAthlete = await createAthlete({ name: formData.name, titulo: formData.titulo || '', photoUrl: '', fullPhotoUrl: '' });
        const updates = {};
        if (photoUrl) updates.photoUrl = photoUrl;
        if (fullPhotoUrl) updates.fullPhotoUrl = fullPhotoUrl;
        if (Object.keys(updates).length) await updateAthlete(newAthlete.id, updates);

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
    if (file) setFormData(prev => ({ ...prev, photoFile: file, croppedProfileUrl: null }));
  };

  const handleFullPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, fullPhotoFile: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setFullPhotoPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const cropSource = fullPhotoPreviewUrl || selectedAthlete?.fullPhotoUrl || null;

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
    'Franguinho': 'bg-zinc-800/40 border-zinc-700',
    'Saudável': 'bg-emerald-400/5 border-emerald-400/20',
    'Atleta': 'bg-blue-400/5 border-blue-400/20',
    'Braçudinho': 'bg-indigo-400/5 border-indigo-400/20',
    'Maromba': 'bg-violet-400/5 border-violet-400/20',
    'Tanque de Guerra': 'bg-amber-400/5 border-amber-400/20',
    'Monstro': 'bg-orange-400/5 border-orange-400/20',
    'Lenda': 'bg-fuchsia-400/5 border-fuchsia-400/20',
    'Deus do Shape': 'bg-rose-400/5 border-rose-400/20'
  };

  const activeAthletes = athletes.filter(a => !a.deactivated);
  const deactivatedAthletes = athletes.filter(a => a.deactivated);

  const groupedAthletesByRank = activeAthletes.reduce((acc, athlete) => {
    const rankName = athleteRanks[athlete.id]?.name || 'Franguinho';
    if (!acc[rankName]) acc[rankName] = [];
    acc[rankName].push(athlete);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Atletas</h1>
          <p className="text-zinc-400 mt-2">Gerencie os atletas cadastrados</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              variant="secondary"
              onClick={handleRecalcularXPs}
              disabled={recalculating}
              className="flex items-center gap-2 text-sm"
            >
              <Trophy className="w-4 h-4" />
              {recalculating ? 'Calculando...' : 'Recalcular XPs'}
            </Button>
          )}
          {isAdmin && (
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Atleta
            </Button>
          )}
        </div>
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
            <p className="text-zinc-400 mb-4">Nenhum atleta cadastrado ainda.</p>
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
                className={`rounded-xl border p-3 ${rankSectionStyles[rankName] || 'bg-zinc-800/40 border-zinc-700'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-zinc-100">{rankName}</h2>
                  <span className="text-sm font-semibold text-zinc-400">
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
                        <Card className="relative cursor-pointer hover:shadow-lg hover:bg-zinc-800 transition-all !p-4">
                          <div className="flex flex-col items-center">
                            <Avatar
                              name={athlete.name}
                              photoUrl={athlete.photoUrl}
                              size="lg"
                              className="mb-3"
                            />
                            <h3 className="text-lg font-bold text-zinc-100 mb-1">
                              {athlete.name}
                            </h3>
                            <p className="text-xs text-zinc-400 mb-3">
                              {athleteRanks[athlete.id] ? formatRankWithXP(athleteRanks[athlete.id]) : recalculating ? 'Calculando...' : '—'}
                            </p>

                            {athleteTitles[athlete.id] && athleteTitles[athlete.id].length > 0 && (
                              <div className="w-full mb-1 space-y-1">
                                {athleteTitles[athlete.id].map((title, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded text-[11px] ${
                                      title.type === 'champion'
                                        ? 'bg-amber-400/10 text-amber-400'
                                        : 'bg-zinc-700 text-zinc-400'
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
          {/* Atletas desativados */}
          {deactivatedAthletes.length > 0 && (
            <section className="rounded-xl border border-zinc-800 p-3 opacity-50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-zinc-500 flex items-center gap-2">
                  <PowerOff className="w-4 h-4" /> Desativados
                </h2>
                <span className="text-sm text-zinc-600">{deactivatedAthletes.length} atleta(s)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deactivatedAthletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenStatsModal(athlete)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenStatsModal(athlete); } }}
                  >
                    <Card className="relative cursor-pointer !p-4 grayscale">
                      <div className="flex flex-col items-center">
                        <Avatar name={athlete.name} photoUrl={athlete.photoUrl} size="lg" className="mb-3" />
                        <h3 className="text-base font-bold text-zinc-400 mb-1">{athlete.name}</h3>
                        <p className="text-xs text-zinc-600">Desativado</p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </section>
          )}
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
                  <h3 className="text-xl font-bold text-zinc-100">{selectedStatsAthlete.name}</h3>
                  <p className="text-sm text-zinc-400">
                    {athleteGlobalStats?.rankData ? formatRankWithXP(athleteGlobalStats.rankData) : 'Carregando...'}
                  </p>
                </div>
              </div>
            )}

            {athleteGlobalStats && athleteGlobalStats.total > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {statsSummary.map((item) => (
                    <div key={item.label} className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                      <p className="text-xs text-zinc-400">{item.label}</p>
                      <p className="text-xl font-bold text-zinc-100">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 space-y-1">
                  <p className="text-sm text-zinc-400">Total de registros</p>
                  <p className="text-2xl font-bold text-zinc-100">{athleteGlobalStats.total}</p>
                  <p className="text-sm text-zinc-400">
                    Temporadas com registro: {athleteGlobalStats.seasonsWithRecords}
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <p className="text-zinc-400">Este atleta ainda não possui registros de check-in em temporadas.</p>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              {isAdmin && selectedStatsAthlete && (
                <>
                  <Button
                    variant={selectedStatsAthlete.deactivated ? 'success' : 'secondary'}
                    onClick={() => handleToggleDeactivate(selectedStatsAthlete)}
                    className="flex items-center gap-2"
                  >
                    {selectedStatsAthlete.deactivated
                      ? <><Power className="w-4 h-4" /> Reativar Atleta</>
                      : <><PowerOff className="w-4 h-4" /> Desativar Atleta</>
                    }
                  </Button>
                  <Button onClick={handleEditFromStatsModal} className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Editar Atleta
                  </Button>
                </>
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

          <Input
            label="Título do Atleta"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ex: O Rei da Maromba, A Lenda..."
          />

          {/* Foto completa */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Foto Completa <span className="text-zinc-500 font-normal">(corpo inteiro — usada para recorte e montagens)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFullPhotoChange}
              className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-zinc-100"
            />
            {selectedAthlete?.fullPhotoUrl && !formData.fullPhotoFile && (
              <p className="text-sm text-zinc-500 mt-1">Foto completa já cadastrada — deixe em branco para manter.</p>
            )}

            {/* Prévia + botão recortar */}
            {cropSource && (
              <div className="mt-3 flex items-start gap-3">
                <img src={cropSource} alt="Foto completa" className="w-20 h-28 object-cover rounded-lg border border-zinc-700 flex-shrink-0" />
                <div className="flex flex-col gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setIsCropperOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-sm font-medium"
                  >
                    <Crop className="w-4 h-4" />
                    Recortar como Perfil
                  </button>
                  {formData.croppedProfileUrl && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">✓ Recorte definido</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Foto de perfil direta (opcional se já recortou) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Foto de Perfil <span className="text-zinc-500 font-normal">(ou envie direto, sem recortar)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-zinc-100"
            />
            {/* Prévia do perfil atual */}
            {(formData.croppedProfileUrl || selectedAthlete?.photoUrl) && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={formData.croppedProfileUrl || selectedAthlete.photoUrl}
                  alt="Perfil"
                  className="w-14 h-14 rounded-full object-cover border-2 border-zinc-600"
                />
                <span className="text-xs text-zinc-500">
                  {formData.croppedProfileUrl ? 'Recorte definido como perfil' : 'Foto de perfil atual'}
                </span>
              </div>
            )}
          </div>

          {selectedAthlete && (
            <div className="border-t border-zinc-700 pt-6 mt-6">
              <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Zona de Perigo
                </h4>
                <p className="text-sm text-red-400/80 mb-3">
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

      {/* Modal do Recortador */}
      <Modal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        title="Recortar Foto de Perfil"
        size="lg"
      >
        {cropSource && (
          <ImageCropper
            imageSrc={cropSource}
            onCrop={(dataUrl) => {
              setFormData(prev => ({ ...prev, croppedProfileUrl: dataUrl, photoFile: null }));
              setIsCropperOpen(false);
            }}
            onCancel={() => setIsCropperOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
