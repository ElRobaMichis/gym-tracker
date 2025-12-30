import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  Search,
  Plus,
  Dumbbell,
  TrendingUp,
  Trash2,
  Edit3,
  Tag,
  Weight,
  X,
} from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { addExercise, updateExercise, deleteExercise } from '../../store/slices/exerciseSlice';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge, ProgressionBadge } from '../../components/common/Badge';
import { IconButton } from '../../components/common/IconButton';
import { Exercise, ExerciseCategory, ProgressionType } from '../../types';
import { spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { categoryLabels } from '../../constants/exercises';
import { getDisplayWeight } from '../../utils/unitConversion';
import { v4 as uuidv4 } from 'uuid';


export function ExerciseLibraryScreen() {
  const dispatch = useAppDispatch();
  const { colors, isDark, animationConfig } = useTheme();
  const { exercises } = useAppSelector(state => state.exercises);
  const { workouts } = useAppSelector(state => state.workouts);
  const { user } = useAppSelector(state => state.user);
  const units = user.settings.units;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ExerciseCategory>('chest');
  const [formProgressionType, setFormProgressionType] = useState<ProgressionType>('double');
  const [formWeightIncrement, setFormWeightIncrement] = useState('5');

  const filteredExercises = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getExerciseStats = useCallback((exerciseId: string) => {
    let count = 0;
    let totalVolume = 0;

    workouts.forEach(workout => {
      workout.exercises.forEach(we => {
        if (we.exerciseId === exerciseId) {
          count++;
          we.sets.forEach(set => {
            if (!set.isWarmup && set.completed) {
              const weight = getDisplayWeight(set.weight, set.weightUnit, units);
              totalVolume += weight * set.reps;
            }
          });
        }
      });
    });

    return { count, totalVolume: Math.round(totalVolume) };
  }, [workouts, units]);

  const handleOpenModal = (exercise?: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (exercise) {
      setEditingExercise(exercise);
      setFormName(exercise.name);
      setFormCategory(exercise.category);
      setFormProgressionType(exercise.progressionType);
      // Convert weight increment to current unit for editing
      const convertedIncrement = getDisplayWeight(
        exercise.weightIncrement,
        exercise.weightIncrementUnit,
        units
      );
      setFormWeightIncrement(convertedIncrement.toString());
    } else {
      setEditingExercise(null);
      setFormName('');
      setFormCategory('chest');
      setFormProgressionType('double');
      setFormWeightIncrement('5');
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const exerciseData: Exercise = {
      id: editingExercise?.id || uuidv4(),
      name: formName.trim(),
      category: formCategory,
      muscleGroups: [],
      progressionType: formProgressionType,
      weightIncrement: parseFloat(formWeightIncrement) || 5,
      weightIncrementUnit: units,
      targetRepMin: 8,
      targetRepMax: 12,
      targetSetsMin: formProgressionType === 'triple' ? 2 : 3,
      targetSetsMax: 4,
      isDefault: false,
      createdAt: editingExercise?.createdAt || new Date().toISOString(),
    };

    if (editingExercise) {
      dispatch(updateExercise(exerciseData));
    } else {
      dispatch(addExercise(exerciseData));
    }

    setModalVisible(false);
  };

  const handleDelete = (exercise: Exercise) => {
    if (exercise.isDefault) {
      Alert.alert('Cannot Delete', 'Default exercises cannot be deleted');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteExercise(exercise.id)),
        },
      ]
    );
  };

  const renderExerciseItem = useCallback(({ item, index }: { item: Exercise; index: number }) => {
    const stats = getExerciseStats(item.id);

    return (
      <View>
        <Card
          variant="elevated"
          style={styles.exerciseCard}
          pressable={!item.isDefault}
          onPress={() => !item.isDefault && handleOpenModal(item)}
          haptic
        >
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseNameRow}>
              <View style={[styles.exerciseIcon, { backgroundColor: colors.primaryMuted }]}>
                <Dumbbell size={18} color={colors.primary} strokeWidth={2.5} />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <View style={styles.badges}>
                  <ProgressionBadge type={item.progressionType} />
                  {item.isDefault && (
                    <Badge label="Default" variant="neutral" size="sm" />
                  )}
                </View>
              </View>
            </View>
            {!item.isDefault && (
              <View style={styles.exerciseActions}>
                <IconButton
                  icon={<Edit3 size={16} color={colors.textTertiary} />}
                  onPress={() => handleOpenModal(item)}
                  variant="ghost"
                  size="sm"
                />
                <IconButton
                  icon={<Trash2 size={16} color={colors.error} />}
                  onPress={() => handleDelete(item)}
                  variant="ghost"
                  size="sm"
                />
              </View>
            )}
          </View>

          <View style={styles.exerciseMeta}>
            <View style={styles.metaItem}>
              <Tag size={12} color={colors.textTertiary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {categoryLabels[item.category]}
              </Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metaItem}>
              <Weight size={12} color={colors.textTertiary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                +{getDisplayWeight(item.weightIncrement, item.weightIncrementUnit, units)}{units}
              </Text>
            </View>
          </View>

          {stats.count > 0 && (
            <View style={[styles.statsRow, { backgroundColor: colors.surfaceVariant }]}>
              <View style={styles.statItem}>
                <TrendingUp size={14} color={colors.secondary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.count}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                  workouts
                </Text>
              </View>
              <View style={styles.statItem}>
                <Weight size={14} color={colors.accent} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.totalVolume >= 1000
                    ? `${(stats.totalVolume / 1000).toFixed(1)}k`
                    : stats.totalVolume}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                  {units} volume
                </Text>
              </View>
            </View>
          )}
        </Card>
      </View>
    );
  }, [colors, getExerciseStats, units]);

  const categories: (ExerciseCategory | 'all')[] = [
    'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'
  ];

  const CategoryChip = ({ category }: { category: ExerciseCategory | 'all' }) => {
    const isSelected = selectedCategory === category;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }).start();
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedCategory(category);
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable onPress={handlePress}>
          <View
            style={[
              styles.categoryChip,
              {
                backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: isSelected ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {category === 'all' ? 'All' : categoryLabels[category]}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Exercises</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {exercises.length} exercises in library
          </Text>
        </View>
        <Button
          title="New"
          onPress={() => handleOpenModal()}
          variant="primary"
          size="sm"
          icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.5} />}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputWrapper,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={colors.primary}
          />
          {searchQuery.length > 0 && (
            <IconButton
              icon={<X size={16} color={colors.textTertiary} />}
              onPress={() => setSearchQuery('')}
              variant="ghost"
              size="sm"
            />
          )}
        </View>
      </View>

      {/* Category Chips */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map(cat => (
            <CategoryChip key={cat} category={cat} />
          ))}
        </ScrollView>
      </View>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <Dumbbell size={32} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No exercises found
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? 'Try a different search term' : 'Add your first custom exercise'}
            </Text>
          </View>
        }
      />

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              Keyboard.dismiss();
              setModalVisible(false);
            }}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <BlurView
              intensity={isDark ? 40 : 80}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingExercise ? 'Edit Exercise' : 'New Exercise'}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalBody}
            >
              <Input
                label="Exercise Name"
                value={formName}
                onChangeText={setFormName}
                placeholder="e.g., Bench Press"
                leftIcon={<Dumbbell size={18} color={colors.textTertiary} />}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Category
              </Text>
              <View style={styles.categorySelector}>
                {(['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'] as ExerciseCategory[]).map(cat => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor:
                          formCategory === cat ? colors.primary : colors.surfaceVariant,
                        borderColor:
                          formCategory === cat ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFormCategory(cat);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        { color: formCategory === cat ? '#FFF' : colors.text },
                      ]}
                    >
                      {categoryLabels[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Progression Type
              </Text>
              <View style={styles.progressionSelector}>
                <Pressable
                  style={[
                    styles.progressionOption,
                    {
                      backgroundColor:
                        formProgressionType === 'double'
                          ? colors.primaryMuted
                          : colors.surfaceVariant,
                      borderColor:
                        formProgressionType === 'double'
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFormProgressionType('double');
                  }}
                >
                  <View style={[
                    styles.progressionCheck,
                    {
                      backgroundColor: formProgressionType === 'double' ? colors.primary : 'transparent',
                      borderColor: formProgressionType === 'double' ? colors.primary : colors.border,
                    }
                  ]}>
                    {formProgressionType === 'double' && (
                      <View style={styles.checkInner} />
                    )}
                  </View>
                  <View style={styles.progressionInfo}>
                    <Text
                      style={[
                        styles.progressionTitle,
                        { color: colors.text },
                      ]}
                    >
                      Double Progression
                    </Text>
                    <Text
                      style={[
                        styles.progressionDesc,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Increase reps, then weight
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.progressionOption,
                    {
                      backgroundColor:
                        formProgressionType === 'triple'
                          ? colors.secondaryMuted
                          : colors.surfaceVariant,
                      borderColor:
                        formProgressionType === 'triple'
                          ? colors.secondary
                          : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFormProgressionType('triple');
                  }}
                >
                  <View style={[
                    styles.progressionCheck,
                    {
                      backgroundColor: formProgressionType === 'triple' ? colors.secondary : 'transparent',
                      borderColor: formProgressionType === 'triple' ? colors.secondary : colors.border,
                    }
                  ]}>
                    {formProgressionType === 'triple' && (
                      <View style={styles.checkInner} />
                    )}
                  </View>
                  <View style={styles.progressionInfo}>
                    <Text
                      style={[
                        styles.progressionTitle,
                        { color: colors.text },
                      ]}
                    >
                      Triple Progression
                    </Text>
                    <Text
                      style={[
                        styles.progressionDesc,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Increase reps, sets, then weight
                    </Text>
                  </View>
                </Pressable>
              </View>

              <Input
                label={`Weight Increment (${units})`}
                value={formWeightIncrement}
                onChangeText={setFormWeightIncrement}
                keyboardType="decimal-pad"
                placeholder="5"
                leftIcon={<Weight size={18} color={colors.textTertiary} />}
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Save"
                  onPress={handleSave}
                  variant="primary"
                  gradient
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
  },
  categoriesContainer: {
    marginBottom: spacing.sm,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 100,
  },
  exerciseCard: {
    marginBottom: spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.3,
    marginBottom: spacing.xxs,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
  },
  metaDivider: {
    width: 1,
    height: 12,
    marginHorizontal: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingBottom: spacing.lg,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  modalBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  categoryOptionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  progressionSelector: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  progressionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  progressionInfo: {
    flex: 1,
  },
  progressionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  progressionDesc: {
    fontSize: fontSize.sm,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});
