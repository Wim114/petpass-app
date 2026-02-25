import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PawPrint,
  Plus,
  Pencil,
  Trash2,
  X,
  Dog,
  Cat,
  Bird,
  Fish,
  Rabbit,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { Spinner } from '@/components/ui/Spinner';
import type { Pet, PetType, HealthCondition } from '@/types';

const PET_TYPES: PetType[] = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'other'];

const HEALTH_CONDITIONS: HealthCondition[] = [
  'allergies',
  'arthritis',
  'diabetes',
  'heart_disease',
  'kidney_disease',
  'epilepsy',
  'obesity',
  'dental_disease',
  'skin_conditions',
  'anxiety',
];

const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  type: z.string().min(1, 'Pet type is required'),
  breed: z.string().optional(),
  birthday: z.string().optional(),
  weight_kg: z.coerce.number().min(0).optional().or(z.literal('')),
  health_conditions: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type PetFormData = z.infer<typeof petSchema>;

const PetTypeIcon = ({ type }: { type: string }) => {
  const iconClass = 'w-5 h-5';
  switch (type) {
    case 'dog':
      return <Dog className={iconClass} />;
    case 'cat':
      return <Cat className={iconClass} />;
    case 'bird':
      return <Bird className={iconClass} />;
    case 'fish':
      return <Fish className={iconClass} />;
    case 'rabbit':
      return <Rabbit className={iconClass} />;
    default:
      return <PawPrint className={iconClass} />;
  }
};

export default function PetManager() {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      health_conditions: [],
    },
  });

  const watchedConditions = watch('health_conditions') || [];

  const { data: pets = [], isLoading } = useQuery<Pet[]>({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: PetFormData) => {
      const { error } = await supabase.from('pets').insert({
        owner_id: user!.id,
        name: data.name,
        type: data.type,
        breed: data.breed || null,
        birthday: data.birthday || null,
        weight_kg: data.weight_kg || null,
        health_conditions: data.health_conditions || [],
        notes: data.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PetFormData }) => {
      const { error } = await supabase
        .from('pets')
        .update({
          name: data.name,
          type: data.type,
          breed: data.breed || null,
          birthday: data.birthday || null,
          weight_kg: data.weight_kg || null,
          health_conditions: data.health_conditions || [],
          notes: data.notes || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
      setDeleteConfirm(null);
    },
  });

  const openAddModal = () => {
    setEditingPet(null);
    reset({
      name: '',
      type: '',
      breed: '',
      birthday: '',
      weight_kg: '' as any,
      health_conditions: [],
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (pet: Pet) => {
    setEditingPet(pet);
    reset({
      name: pet.name,
      type: pet.type,
      breed: pet.breed || '',
      birthday: pet.birthday || '',
      weight_kg: pet.weight_kg ?? ('' as any),
      health_conditions: pet.health_conditions || [],
      notes: pet.notes || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPet(null);
    reset();
  };

  const onSubmit = (data: PetFormData) => {
    if (editingPet) {
      updateMutation.mutate({ id: editingPet.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleCondition = (condition: string) => {
    const current = watchedConditions;
    const updated = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition];
    setValue('health_conditions', updated, { shouldDirty: true });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t.pets?.title ?? 'My Pets'}
          </h1>
          <p className="text-slate-500 mt-1">
            {t.pets?.subtitle ?? 'Manage your registered pets'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          {t.pets?.addPet ?? 'Add Pet'}
        </button>
      </div>

      {/* Pet Cards */}
      {pets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            {t.pets?.noPets ?? 'No pets yet'}
          </h3>
          <p className="text-slate-500 mb-4">
            {t.pets?.noPetsDesc ?? 'Add your first pet to get started.'}
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            {t.pets?.addPet ?? 'Add Pet'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <PetTypeIcon type={pet.type} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{pet.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">
                      {pet.type}
                      {pet.breed ? ` - ${pet.breed}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(pet)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(pet.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {pet.birthday && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">
                    {t.pets?.birthday ?? 'Birthday'}:
                  </span>{' '}
                  {new Date(pet.birthday).toLocaleDateString()}
                </p>
              )}
              {pet.weight_kg && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">
                    {t.pets?.weight ?? 'Weight'}:
                  </span>{' '}
                  {pet.weight_kg} kg
                </p>
              )}
              {pet.health_conditions && pet.health_conditions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {pet.health_conditions.map((condition) => (
                    <span
                      key={condition}
                      className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full"
                    >
                      {condition.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Delete Confirmation */}
              {deleteConfirm === pet.id && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-sm text-red-600 mb-2">
                    {t.pets?.deleteConfirm ?? 'Delete this pet?'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteMutation.mutate(pet.id)}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? (
                        <Spinner size="sm" />
                      ) : (
                        t.pets?.confirmDelete ?? 'Delete'
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition"
                    >
                      {t.pets?.cancel ?? 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingPet
                  ? t.pets?.editPet ?? 'Edit Pet'
                  : t.pets?.addPet ?? 'Add Pet'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.pets?.name ?? 'Name'} *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Buddy"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.pets?.type ?? 'Type'} *
                </label>
                <select
                  {...register('type')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
                >
                  <option value="">{t.pets?.selectType ?? 'Select type'}</option>
                  {PET_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.pets?.breed ?? 'Breed'}
                </label>
                <input
                  type="text"
                  {...register('breed')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Golden Retriever"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.pets?.birthday ?? 'Birthday'}
                  </label>
                  <input
                    type="date"
                    {...register('birthday')}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.pets?.weight ?? 'Weight'} (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('weight_kg')}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    placeholder="12.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.pets?.healthConditions ?? 'Health Conditions'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {HEALTH_CONDITIONS.map((condition) => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => toggleCondition(condition)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition ${
                        watchedConditions.includes(condition)
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {condition.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.pets?.notes ?? 'Notes'}
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                  placeholder={
                    t.pets?.notesPlaceholder ??
                    'Any additional notes about your pet...'
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Spinner size="sm" />
                  ) : editingPet ? (
                    t.pets?.save ?? 'Save Changes'
                  ) : (
                    t.pets?.addPet ?? 'Add Pet'
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                >
                  {t.pets?.cancel ?? 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
