import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Loading } from '../components/Loading';
import { Alert } from '../components/Alert';
import { useAthletes } from '../context/AthletesContext';
import { 
  createAthlete, 
  updateAthlete, 
  deleteAthlete, 
  uploadAthletePhoto 
} from '../services/athletes';
import { formatExperienceLevel } from '../utils/formatters';

export default function Athletes() {
  const { athletes, loading, refreshAthletes } = useAthletes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    experienceLevel: '',
    photoFile: null
  });
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);

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
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Atleta
        </Button>
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
          {athletes.map((athlete) => (
            <Card key={athlete.id}>
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

                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenModal(athlete)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(athlete.id, athlete.name)}
                    className="flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {selectedAthlete?.photoUrl && !formData.photoFile && (
              <p className="text-sm text-gray-500 mt-2">
                Deixe em branco para manter a foto atual
              </p>
            )}
          </div>

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
