import { useState, useEffect } from 'react';
import { DollarSign, Plus, Calendar, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { Avatar } from '../components/Avatar';
import { useSeason } from '../context/SeasonContext';
import { useThemeColor } from '../context/ThemeColorContext';
import { useAthletes } from '../context/AthletesContext';
import { useAuth } from '../context/AuthContext';
import { addPayment, getAllPayments, deletePayment } from '../services/payments';
import { formatDate, formatCurrency } from '../utils/formatters';

export default function Payments() {
  const { currentSeason } = useSeason();
  const { primary } = useThemeColor();
  const { athletes, getAthleteById } = useAthletes();
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    athleteId: '',
    date: new Date().toISOString().split('T')[0],
    value: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentSeason) {
      loadPayments();
    }
  }, [currentSeason]);

  const loadPayments = async () => {
    if (!currentSeason) return;

    setLoading(true);
    try {
      const paymentsList = await getAllPayments(currentSeason.id);
      setPayments(paymentsList);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao carregar pagamentos' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      athleteId: '',
      date: new Date().toISOString().split('T')[0],
      value: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    try {
      await addPayment(currentSeason.id, {
        athleteId: formData.athleteId,
        date: formData.date,
        value: parseFloat(formData.value)
      });

      setAlert({ type: 'success', message: 'Pagamento registrado com sucesso!' });
      await loadPayments();
      setIsModalOpen(false);
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao registrar pagamento: ${error.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm('Deseja realmente excluir este pagamento?')) return;

    try {
      await deletePayment(currentSeason.id, paymentId);
      setAlert({ type: 'success', message: 'Pagamento excluído com sucesso!' });
      await loadPayments();
    } catch (error) {
      setAlert({ type: 'error', message: `Erro ao excluir pagamento: ${error.message}` });
    }
  };

  if (!currentSeason) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">
              Nenhuma temporada ativa. Crie uma temporada para começar.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const participantOptions = (currentSeason.participants || [])
    .map(athleteId => {
      const athlete = getAthleteById(athleteId);
      return athlete ? { value: athlete.id, label: athlete.name } : null;
    })
    .filter(Boolean);

  // Calcula total de pagamentos
  const totalPaid = payments.reduce((sum, payment) => sum + payment.value, 0);

  // Agrupa pagamentos por atleta
  const paymentsByAthlete = payments.reduce((acc, payment) => {
    if (!acc[payment.athleteId]) {
      acc[payment.athleteId] = [];
    }
    acc[payment.athleteId].push(payment);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Pagamentos</h1>
          <p className="text-zinc-400 mt-2">Registre os pagamentos de multas</p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenModal} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Registrar Pagamento
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-emerald-400/10 to-emerald-400/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DollarSign className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total em Caixa</p>
              <p className="text-2xl font-bold text-zinc-100">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${primary}30` }}>
              <Calendar className="w-8 h-8" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total de Pagamentos</p>
              <p className="text-2xl font-bold text-zinc-100">
                {payments.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-400/10 to-blue-400/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Ticket Médio</p>
              <p className="text-2xl font-bold text-zinc-100">
                {formatCurrency(payments.length > 0 ? totalPaid / payments.length : 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Histórico de Pagamentos">
        {loading ? (
          <Loading text="Carregando pagamentos..." />
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 mb-4">Nenhum pagamento registrado ainda.</p>
            {isAdmin && (
              <Button onClick={handleOpenModal}>Registrar Primeiro Pagamento</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-zinc-700">
                  <th className="text-left py-3 px-4 font-semibold text-zinc-300">Atleta</th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-300">Data</th>
                  <th className="text-right py-3 px-4 font-semibold text-zinc-300">Valor</th>
                  {isAdmin && <th className="text-center py-3 px-4 font-semibold text-zinc-300 w-16"></th>}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const athlete = getAthleteById(payment.athleteId);
                  return (
                    <tr key={payment.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={athlete?.name || 'Atleta'}
                            photoUrl={athlete?.photoUrl}
                            size="sm"
                          />
                          <span className="font-medium text-zinc-100">
                            {athlete?.name || 'Atleta não encontrado'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {formatDate(payment.date)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {formatCurrency(payment.value)}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDelete(payment.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10"
                            title="Excluir pagamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-700 bg-zinc-800/50">
                  <td colSpan="2" className="py-3 px-4 font-bold text-zinc-100">
                    TOTAL
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400 text-lg">
                    {formatCurrency(totalPaid)}
                  </td>
                  {isAdmin && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Resumo por Atleta */}
      {Object.keys(paymentsByAthlete).length > 0 && (
        <Card title="Resumo por Atleta" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(paymentsByAthlete).map(([athleteId, athletePayments]) => {
              const athlete = getAthleteById(athleteId);
              const total = athletePayments.reduce((sum, p) => sum + p.value, 0);
              return (
                <div key={athleteId} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar
                      name={athlete?.name || 'Atleta'}
                      photoUrl={athlete?.photoUrl}
                      size="md"
                    />
                    <div>
                      <p className="font-bold text-zinc-100">{athlete?.name}</p>
                      <p className="text-sm text-zinc-400">{athletePayments.length} pagamentos</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-emerald-400 mt-2">
                    {formatCurrency(total)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Pagamento"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Select
            label="Atleta"
            value={formData.athleteId}
            onChange={(e) => setFormData({ ...formData, athleteId: e.target.value })}
            options={participantOptions}
            required
          />

          <Input
            label="Data do Pagamento"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="0.00"
            required
          />

          <div className="flex gap-3 justify-end mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Registrando...' : 'Registrar Pagamento'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
