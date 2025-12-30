import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { X, Save, FolderHeart, Check } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { addRoutine } from '../../store/slices/routineSlice';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Workout, Routine, RoutineExercise } from '../../types';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../../constants/theme';
import { v4 as uuidv4 } from 'uuid';

interface SaveRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  workout: Workout;
}

const ROUTINE_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export function SaveRoutineModal({ visible, onClose, workout }: SaveRoutineModalProps) {
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { exercises: allExercises } = useAppSelector(state => state.exercises);
  const { user } = useAppSelector(state => state.user);

  const [name, setName] = useState(workout.name || 'My Routine');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(ROUTINE_COLORS[0]);

  const getExerciseName = (exerciseId: string) => {
    const exercise = allExercises.find(e => e.id === exerciseId);
    return exercise?.name || 'Unknown Exercise';
  };

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Convert workout exercises to routine exercises
    const routineExercises: RoutineExercise[] = workout.exercises.map((we, index) => {
      // Get average values from the workout sets
      const completedSets = we.sets.filter(s => s.completed && !s.isWarmup);
      const avgWeight = completedSets.length > 0
        ? Math.round(completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length)
        : 0;
      const avgReps = completedSets.length > 0
        ? Math.round(completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length)
        : 0;
      const weightUnit = completedSets[0]?.weightUnit || user.settings.units;

      return {
        id: uuidv4(),
        exerciseId: we.exerciseId,
        orderIndex: index,
        targetSets: completedSets.length || we.sets.length || 3,
        targetReps: avgReps || 10,
        targetWeight: avgWeight > 0 ? avgWeight : undefined,
        targetWeightUnit: avgWeight > 0 ? weightUnit : undefined,
        notes: we.notes,
      };
    });

    const newRoutine: Routine = {
      id: uuidv4(),
      userId: user.id,
      name: name.trim(),
      description: description.trim() || undefined,
      exercises: routineExercises,
      color: selectedColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timesUsed: 0,
    };

    dispatch(addRoutine(newRoutine));
    onClose();
  }, [name, description, selectedColor, workout, user, dispatch, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerIcon}>
              <FolderHeart size={24} color={colors.primary} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Save as Routine
            </Text>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.surfaceVariant }]}
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Routine Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surfaceVariant,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter routine name"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Description (optional)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    backgroundColor: colors.surfaceVariant,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description for this routine"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Color Selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Color
              </Text>
              <View style={styles.colorGrid}>
                {ROUTINE_COLORS.map(color => (
                  <Pressable
                    key={color}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedColor(color);
                    }}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                  >
                    {selectedColor === color && (
                      <Check size={18} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Exercises Preview */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Exercises ({workout.exercises.length})
              </Text>
              <Card variant="outlined" style={styles.exercisesList}>
                {workout.exercises.map((we, index) => {
                  const completedSets = we.sets.filter(s => s.completed && !s.isWarmup);
                  return (
                    <View
                      key={we.id}
                      style={[
                        styles.exerciseItem,
                        index < workout.exercises.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.exerciseInfo}>
                        <Text style={[styles.exerciseName, { color: colors.text }]}>
                          {getExerciseName(we.exerciseId)}
                        </Text>
                        <Text style={[styles.exerciseDetails, { color: colors.textTertiary }]}>
                          {completedSets.length || we.sets.length} sets
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </Card>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              size="lg"
              style={styles.cancelButton}
            />
            <Button
              title="Save Routine"
              onPress={handleSave}
              variant="primary"
              gradient
              size="lg"
              icon={<Save size={18} color="#FFFFFF" />}
              disabled={!name.trim()}
              style={styles.saveButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.sm + 2,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  exercisesList: {
    padding: 0,
    overflow: 'hidden',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  exerciseDetails: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
