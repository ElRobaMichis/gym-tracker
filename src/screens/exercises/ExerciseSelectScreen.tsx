import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Search,
  Check,
  Dumbbell,
  X,
  Clock,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { addExerciseToWorkout } from '../../store/slices/workoutSlice';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/common/Card';
import { Badge, ProgressionBadge } from '../../components/common/Badge';
import { IconButton } from '../../components/common/IconButton';
import { Exercise, WorkoutExercise, WorkoutSet, ExerciseCategory } from '../../types';
import { spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { categoryLabels } from '../../constants/exercises';
import { v4 as uuidv4 } from 'uuid';

export function ExerciseSelectScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors, animationConfig } = useTheme();

  const { exercises } = useAppSelector(state => state.exercises);
  const { activeWorkout, workouts } = useAppSelector(state => state.workouts);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);

  // Fade animation values
  const searchFadeAnim = useRef(new Animated.Value(0)).current;
  const recentFadeAnim = useRef(new Animated.Value(0)).current;
  const emptyFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(searchFadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [searchFadeAnim]);

  useEffect(() => {
    Animated.timing(recentFadeAnim, {
      toValue: 1,
      duration: 200,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, [recentFadeAnim]);

  useEffect(() => {
    Animated.timing(emptyFadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [emptyFadeAnim]);

  const categories = Array.from(
    new Set(exercises.map(e => e.category))
  ) as ExerciseCategory[];

  // Get recently used exercises
  const recentExerciseIds = workouts
    .slice(0, 5)
    .flatMap(w => w.exercises.map(e => e.exerciseId))
    .filter((id, index, self) => self.indexOf(id) === index)
    .slice(0, 5);

  const recentExercises = exercises.filter(e => recentExerciseIds.includes(e.id));

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPreviousSetsForExercise = (exerciseId: string): WorkoutSet[] => {
    for (const workout of workouts) {
      const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
      if (exercise) {
        return exercise.sets.filter(s => !s.isWarmup);
      }
    }
    return [];
  };

  const handleSelectExercise = (exercise: Exercise) => {
    if (!activeWorkout) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const previousSets = getPreviousSetsForExercise(exercise.id);

    const initialSet: WorkoutSet = {
      id: uuidv4(),
      workoutExerciseId: '',
      setNumber: 1,
      weight: previousSets[0]?.weight || 0,
      reps: previousSets[0]?.reps || exercise.targetRepMin,
      isWarmup: false,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const workoutExercise: WorkoutExercise = {
      id: uuidv4(),
      workoutId: activeWorkout.id,
      exerciseId: exercise.id,
      orderIndex: activeWorkout.exercises.length,
      sets: [],
    };

    initialSet.workoutExerciseId = workoutExercise.id;
    workoutExercise.sets.push(initialSet);

    dispatch(addExerciseToWorkout(workoutExercise));
    navigation.goBack();
  };

  const CategoryChip = useCallback(({ category, isAll = false }: { category: ExerciseCategory | null; isAll?: boolean }) => {
    const isSelected = selectedCategory === category;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          speed: animationConfig.spring.snappy?.stiffness || 400,
          bounciness: animationConfig.spring.snappy?.damping || 10,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: animationConfig.spring.default?.stiffness || 300,
          bounciness: animationConfig.spring.default?.damping || 15,
        }),
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedCategory(category);
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View
          style={[
            styles.categoryChip,
            {
              backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
              borderColor: isSelected ? colors.primary : colors.border,
            },
          ]}
          onTouchEnd={handlePress}
        >
          <Text
            style={[
              styles.categoryChipText,
              { color: isSelected ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {isAll ? 'All' : (category ? categoryLabels[category] : 'All')}
          </Text>
        </View>
      </Animated.View>
    );
  }, [selectedCategory, colors, animationConfig]);

  const ExerciseItem = useCallback(({ item, index }: { item: Exercise; index: number }) => {
    const isAlreadyAdded = activeWorkout?.exercises.some(
      e => e.exerciseId === item.id
    );

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      const delay = index * 30;
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          delay,
          useNativeDriver: true,
          speed: 12,
          bounciness: 6,
        }),
      ]).start();
    }, [fadeAnim, translateYAnim, index]);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        }}
      >
        <Card
          variant="elevated"
          style={[styles.exerciseItem, isAlreadyAdded && styles.exerciseItemDisabled]}
          pressable={!isAlreadyAdded}
          onPress={() => !isAlreadyAdded && handleSelectExercise(item)}
          haptic
        >
          <View style={styles.exerciseRow}>
            <View style={[styles.exerciseIcon, { backgroundColor: colors.primaryMuted }]}>
              <Dumbbell size={18} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.exerciseInfo}>
              <Text
                style={[
                  styles.exerciseName,
                  { color: isAlreadyAdded ? colors.textTertiary : colors.text },
                ]}
              >
                {item.name}
              </Text>
              <View style={styles.exerciseMeta}>
                <Text
                  style={[
                    styles.categoryText,
                    { color: isAlreadyAdded ? colors.textDisabled : colors.textSecondary },
                  ]}
                >
                  {categoryLabels[item.category] || item.category}
                </Text>
                <ProgressionBadge type={item.progressionType} />
              </View>
            </View>
            {isAlreadyAdded ? (
              <View style={[styles.addedBadge, { backgroundColor: colors.secondaryMuted }]}>
                <Check size={14} color={colors.secondary} strokeWidth={2.5} />
                <Text style={[styles.addedText, { color: colors.secondary }]}>
                  Added
                </Text>
              </View>
            ) : (
              <View style={[styles.addButton, { backgroundColor: colors.primaryMuted }]}>
                <Text style={[styles.addButtonText, { color: colors.primary }]}>
                  Add
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Animated.View>
    );
  }, [activeWorkout, colors, handleSelectExercise]);

  const renderExerciseItem = useCallback(({ item, index }: { item: Exercise; index: number }) => {
    return <ExerciseItem item={item} index={index} />;
  }, [ExerciseItem]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <Animated.View style={[styles.searchContainer, { opacity: searchFadeAnim }]}>
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
            autoFocus
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
      </Animated.View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={[null, ...categories]}
          renderItem={({ item }) => (
            <CategoryChip category={item} isAll={item === null} />
          )}
          keyExtractor={item => item || 'all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Recent Section */}
      {searchQuery === '' && selectedCategory === null && recentExercises.length > 0 && (
        <Animated.View style={[styles.recentSection, { opacity: recentFadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Clock size={14} color={colors.textTertiary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Recently Used
            </Text>
          </View>
          <FlatList
            horizontal
            data={recentExercises}
            renderItem={({ item }) => {
              const isAlreadyAdded = activeWorkout?.exercises.some(
                e => e.exerciseId === item.id
              );
              return (
                <Card
                  variant="default"
                  style={[
                    styles.recentChip,
                    isAlreadyAdded && { opacity: 0.5 },
                  ]}
                  pressable={!isAlreadyAdded}
                  onPress={() => !isAlreadyAdded && handleSelectExercise(item)}
                  haptic
                >
                  <Text
                    style={[
                      styles.recentChipText,
                      { color: isAlreadyAdded ? colors.textTertiary : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {isAlreadyAdded && (
                    <Check size={12} color={colors.secondary} strokeWidth={2.5} />
                  )}
                </Card>
              );
            }}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
          />
        </Animated.View>
      )}

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.exerciseList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View style={[styles.emptyState, { opacity: emptyFadeAnim }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <Dumbbell size={28} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No exercises found
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Try a different search term or category
            </Text>
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
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
  categoriesList: {
    paddingHorizontal: spacing.md,
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
  recentSection: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentList: {
    paddingHorizontal: spacing.md,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  recentChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    maxWidth: 120,
  },
  exerciseList: {
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: 100,
  },
  exerciseItem: {
    marginBottom: spacing.sm,
  },
  exerciseItemDisabled: {
    opacity: 0.6,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xxs,
    letterSpacing: -0.2,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryText: {
    fontSize: fontSize.sm,
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xxs,
  },
  addedText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
