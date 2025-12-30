import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  Plus,
  Save,
  X,
  Trash2,
  GripVertical,
  ChevronLeft,
} from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useStore';
import { addRoutine, updateRoutine } from '../../store/slices/routineSlice';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Routine, RoutineExercise, Exercise } from '../../types';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../../constants/theme';
import { v4 as uuidv4 } from 'uuid';

type RootStackParamList = {
  MainTabs: undefined;
  RoutineDetail: { routineId?: string };
  ExerciseSelectForRoutine: { onSelect: (exerciseId: string) => void };
};

type RoutineDetailRouteProp = RouteProp<RootStackParamList, 'RoutineDetail'>;

export function RoutineDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RoutineDetailRouteProp>();
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();

  const { routines } = useAppSelector(state => state.routines);
  const { exercises: allExercises } = useAppSelector(state => state.exercises);

  const routineId = route.params?.routineId;
  const existingRoutine = routineId
    ? routines.find(r => r.id === routineId)
    : undefined;

  const [name, setName] = useState(existingRoutine?.name || '');
  const [description, setDescription] = useState(existingRoutine?.description || '');
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>(
    existingRoutine?.exercises || []
  );
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(footerOpacity, {
        toValue: 1,
        delay: 200,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isEditing = !!existingRoutine;

  const handleAddExercise = useCallback((exerciseId: string) => {
    const newRoutineExercise: RoutineExercise = {
      id: uuidv4(),
      exerciseId,
      orderIndex: routineExercises.length,
      targetSets: 3,
    };
    setRoutineExercises(prev => [...prev, newRoutineExercise]);
    setShowExercisePicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [routineExercises.length]);

  const handleRemoveExercise = useCallback((exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRoutineExercises(prev =>
      prev
        .filter(e => e.id !== exerciseId)
        .map((e, index) => ({ ...e, orderIndex: index }))
    );
  }, []);

  const handleUpdateTargetSets = useCallback((exerciseId: string, targetSets: number) => {
    setRoutineExercises(prev =>
      prev.map(e =>
        e.id === exerciseId ? { ...e, targetSets: Math.max(1, targetSets) } : e
      )
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your routine.');
      return;
    }

    if (routineExercises.length === 0) {
      Alert.alert('Add Exercises', 'Please add at least one exercise to your routine.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const now = new Date().toISOString();

    if (isEditing && existingRoutine) {
      const updatedRoutine: Routine = {
        ...existingRoutine,
        name: name.trim(),
        description: description.trim() || undefined,
        exercises: routineExercises,
        updatedAt: now,
      };
      dispatch(updateRoutine(updatedRoutine));
    } else {
      const newRoutine: Routine = {
        id: uuidv4(),
        name: name.trim(),
        description: description.trim() || undefined,
        exercises: routineExercises,
        isTemplate: false,
        createdAt: now,
        updatedAt: now,
      };
      dispatch(addRoutine(newRoutine));
    }

    navigation.goBack();
  }, [name, description, routineExercises, isEditing, existingRoutine, dispatch, navigation]);

  const handleCancel = useCallback(() => {
    if (name || description || routineExercises.length > 0) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [name, description, routineExercises, navigation]);

  const getExercise = (exerciseId: string): Exercise | undefined => {
    return allExercises.find(e => e.id === exerciseId);
  };

  const availableExercises = allExercises.filter(
    e => !routineExercises.some(re => re.exerciseId === e.id)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        style={[styles.header, { backgroundColor: colors.surface, opacity: headerOpacity }]}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.headerRow}>
            <Button
              title=""
              onPress={handleCancel}
              variant="ghost"
              icon={<ChevronLeft size={24} color={colors.text} />}
              style={styles.backButton}
            />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isEditing ? 'Edit Routine' : 'New Routine'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name Input */}
        <Card variant="elevated" style={styles.inputCard}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Routine Name
          </Text>
          <TextInput
            style={[styles.nameInput, { color: colors.text }]}
            placeholder="e.g., Push Day, Upper Body"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
        </Card>

        {/* Description Input */}
        <Card variant="elevated" style={styles.inputCard}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Description (optional)
          </Text>
          <TextInput
            style={[styles.descriptionInput, { color: colors.text }]}
            placeholder="Add a brief description..."
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
            maxLength={200}
          />
        </Card>

        {/* Exercises Section */}
        <View style={styles.exercisesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Exercises ({routineExercises.length})
          </Text>

          {routineExercises.map((routineExercise, index) => {
            const exercise = getExercise(routineExercise.exerciseId);
            if (!exercise) return null;

            return (
              <Card
                key={routineExercise.id}
                variant="elevated"
                animated
                animationDelay={index * 50}
                style={styles.exerciseCard}
              >
                <View style={styles.exerciseRow}>
                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, { color: colors.text }]}>
                      {exercise.name}
                    </Text>
                    <Text style={[styles.exerciseCategory, { color: colors.textSecondary }]}>
                      {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
                    </Text>
                  </View>

                  <View style={styles.setsControl}>
                    <Button
                      title=""
                      onPress={() =>
                        handleUpdateTargetSets(routineExercise.id, routineExercise.targetSets - 1)
                      }
                      variant="outline"
                      icon={<Text style={[styles.setsButtonText, { color: colors.primary }]}>−</Text>}
                      style={styles.setsButton}
                    />
                    <Text style={[styles.setsValue, { color: colors.text }]}>
                      {routineExercise.targetSets}
                    </Text>
                    <Button
                      title=""
                      onPress={() =>
                        handleUpdateTargetSets(routineExercise.id, routineExercise.targetSets + 1)
                      }
                      variant="outline"
                      icon={<Text style={[styles.setsButtonText, { color: colors.primary }]}>+</Text>}
                      style={styles.setsButton}
                    />
                    <Text style={[styles.setsLabel, { color: colors.textTertiary }]}>sets</Text>
                  </View>

                  <Button
                    title=""
                    onPress={() => handleRemoveExercise(routineExercise.id)}
                    variant="ghost"
                    icon={<Trash2 size={18} color={colors.error} />}
                    style={styles.deleteButton}
                  />
                </View>
              </Card>
            );
          })}

          {/* Add Exercise Button */}
          <Button
            title="Add Exercise"
            onPress={() => setShowExercisePicker(true)}
            variant="outline"
            icon={<Plus size={18} color={colors.primary} strokeWidth={2.5} />}
            style={styles.addExerciseButton}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Footer */}
      <Animated.View
        style={[styles.footer, { backgroundColor: colors.glass, opacity: footerOpacity }]}
      >
        <BlurView
          intensity={isDark ? 40 : 80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['bottom']} style={styles.footerContent}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="ghost"
            icon={<X size={18} color={colors.textSecondary} strokeWidth={2.5} />}
            style={styles.footerButton}
          />
          <Button
            title={isEditing ? 'Update Routine' : 'Save Routine'}
            onPress={handleSave}
            variant="primary"
            gradient
            icon={<Save size={18} color="#FFFFFF" strokeWidth={2.5} />}
            style={[styles.footerButton, styles.saveButton]}
          />
        </SafeAreaView>
      </Animated.View>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <View style={[styles.pickerOverlay, { backgroundColor: colors.overlay }]}>
          <Card variant="elevated" style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>
                Select Exercise
              </Text>
              <Button
                title=""
                onPress={() => setShowExercisePicker(false)}
                variant="ghost"
                icon={<X size={24} color={colors.textSecondary} />}
              />
            </View>
            <ScrollView style={styles.pickerList}>
              {availableExercises.map(exercise => (
                <Card
                  key={exercise.id}
                  variant="default"
                  onPress={() => handleAddExercise(exercise.id)}
                  pressable
                  haptic
                  style={styles.pickerItem}
                >
                  <Text style={[styles.pickerItemName, { color: colors.text }]}>
                    {exercise.name}
                  </Text>
                  <Text style={[styles.pickerItemCategory, { color: colors.textSecondary }]}>
                    {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)}
                  </Text>
                </Card>
              ))}
              {availableExercises.length === 0 && (
                <Text style={[styles.noExercises, { color: colors.textSecondary }]}>
                  All exercises have been added
                </Text>
              )}
            </ScrollView>
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerSafeArea: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    minWidth: 44,
    paddingHorizontal: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  inputCard: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameInput: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    padding: 0,
  },
  descriptionInput: {
    fontSize: fontSize.md,
    padding: 0,
    minHeight: 40,
  },
  exercisesSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  exerciseCard: {
    marginBottom: spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  exerciseCategory: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  setsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  setsButton: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 0,
  },
  setsButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  setsValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    minWidth: 30,
    textAlign: 'center',
  },
  setsLabel: {
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
  },
  deleteButton: {
    minWidth: 40,
    paddingHorizontal: spacing.xs,
  },
  addExerciseButton: {
    marginTop: spacing.sm,
  },
  bottomPadding: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  footerContent: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  pickerCard: {
    width: '100%',
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pickerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  pickerList: {
    maxHeight: 400,
  },
  pickerItem: {
    marginBottom: spacing.xs,
  },
  pickerItemName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  pickerItemCategory: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  noExercises: {
    fontSize: fontSize.md,
    textAlign: 'center',
    padding: spacing.lg,
  },
});
