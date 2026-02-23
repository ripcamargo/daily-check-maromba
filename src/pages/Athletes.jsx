import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Trophy, Award } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
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
import { getAthleteTitles } from '../services/seasons';
import { formatExperienceLevel } from '../utils/formatters';

export default function Athletes() {
  const { athletes, loading, refreshAthletes } = useAthletes();
  const { primary } = useThemeColor();
  const { isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [athleteTitles, setAthleteTitles] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    experienceLevel: '',
    photoFile: null
  });
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadAllTitles();
  }, [athletes]);

  const loadAllTitles = async () => {
    const titlesMap = {};
    for (const athlete of athletes) {
      const titles = await getAthleteTitles(athlete.id);
      if (titles.length > 0) {
        titlesMap[athlete.id] = titles;
      }
    }
    setAthleteTitles(titlesMap);
  };

  const experienceLevels = [
    { value: 'Iniciante', label: 'Iniciante' },
    { value: 'Intermediário', label: 'Intermediário' },
    { value: 'PRO', label: 'Profissional' }
  ];

  const handleOpenModal = (athlete = null) => {
    if (athlete) {
      setSelectedAthlete(athlete);
      setFormData({
        name: athlete.name,
        experienceLevel: athlete.experienceLevel,
        photoFile: null
      });
    } else {
      setSelectedAthlete(null);
      setFormData({
        name: '',
        experienceLevel: '',
        photoFile: null
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAthlete(null);
    setFormData({ name: '', experienceLevel: '', photoFile: null });
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
          name: formData.name,
          experienceLevel: formData.experienceLevel
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
          experienceLevel: formData.experienceLevel,
          photoUrl: ''
        });

        if (formData.photoFile) {
          photoUrl = await uploadAthletePhoto(formData.photoFile, newAthlete.id);
          await updateAthlete(newAthlete.id, { photoUrl });
        }

        setAlert({ type: 'success', message: 'Atleta cadastrado com sucesso!' });
      }

      await refreshAthletes();
      await loadAllTitles();
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
      await loadAllTitles();
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

  if (loading) {
    return <Loading text="Carregando atletas..." />;
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes
            .sort((a, b) => {
              const titlesCountA = athleteTitles[a.id]?.length || 0;
              const titlesCountB = athleteTitles[b.id]?.length || 0;
              
              // Ordena por número de títulos (decrescente)
              if (titlesCountB !== titlesCountA) {
                return titlesCountB - titlesCountA;
              }
              
              // Desempate por ordem alfabética
              return a.name.localeCompare(b.name, 'pt-BR');
            })
            .map((athlete) => (
            <Card key={athlete.id} className="relative">
              <div className="flex flex-col items-center">
                <Avatar
                  name={athlete.name}
                  photoUrl={athlete.photoUrl}
                  size="xl"
                  className="mb-4"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {athlete.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {formatExperienceLevel(athlete.experienceLevel)}
                </p>

                {/* Títulos do Atleta */}
                {athleteTitles[athlete.id] && athleteTitles[athlete.id].length > 0 && (
                  <div className="w-full mb-4 space-y-1.5">
                    {athleteTitles[athlete.id].map((title, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded text-xs ${
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

                {isAdmin && (
                  <button
                    onClick={() => handleOpenModal(athlete)}
                    className="absolute top-2 right-2 p-2 hover:bg-opacity-10 rounded-lg transition-colors"
                    style={{ color: primary }}
                    title="Editar atleta"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

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

          <Select
            label="Nível de Experiência"
            value={formData.experienceLevel}
            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
            options={experienceLevels}
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
