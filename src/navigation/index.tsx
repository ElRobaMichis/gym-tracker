import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Pressable, Animated, Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  Dumbbell,
  Library,
  TrendingUp,
  Settings,
  FolderOpen,
  LucideIcon,
} from 'lucide-react-native';

import { WorkoutListScreen } from '../screens/workout/WorkoutListScreen';
import { ActiveWorkoutScreen } from '../screens/workout/ActiveWorkoutScreen';
import { WorkoutDetailScreen } from '../screens/workout/WorkoutDetailScreen';
import { ExerciseSelectScreen } from '../screens/exercises/ExerciseSelectScreen';
import { ExerciseLibraryScreen } from '../screens/exercises/ExerciseLibraryScreen';
import { ProgressDashboardScreen } from '../screens/progress/ProgressDashboardScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { RoutinesScreen } from '../screens/routines/RoutinesScreen';
import { RoutineDetailScreen } from '../screens/routines/RoutineDetailScreen';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

export type RootStackParamList = {
  MainTabs: undefined;
  ActiveWorkout: undefined;
  ExerciseSelect: undefined;
  WorkoutDetail: { workoutId: string };
  RoutineDetail: { routineId?: string };
};

export type TabParamList = {
  WorkoutList: undefined;
  Routines: undefined;
  Exercises: undefined;
  Progress: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

interface TabIconProps {
  name: keyof TabParamList;
  focused: boolean;
}

const tabConfig: Record<keyof TabParamList, { icon: LucideIcon; label: string }> = {
  WorkoutList: { icon: Dumbbell, label: 'Workouts' },
  Routines: { icon: FolderOpen, label: 'Routines' },
  Exercises: { icon: Library, label: 'Exercises' },
  Progress: { icon: TrendingUp, label: 'Progress' },
  Settings: { icon: Settings, label: 'Settings' },
};

function AnimatedTabIcon({ name, focused }: TabIconProps) {
  const { colors } = useTheme();
  const config = tabConfig[name];
  const Icon = config.icon;

  const scale = useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.5)).current;
  const indicatorWidth = useRef(new Animated.Value(focused ? 24 : 0)).current;
  const indicatorOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    // Native driver animations (transform, opacity)
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.85,
        tension: 180,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // JS driver animations (width - can't use native driver)
    Animated.parallel([
      Animated.spring(indicatorWidth, {
        toValue: focused ? 24 : 0,
        tension: 200,
        friction: 15,
        useNativeDriver: false,
      }),
      Animated.timing(indicatorOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Icon
          size={22}
          color={focused ? colors.primary : colors.textTertiary}
          strokeWidth={focused ? 2.5 : 2}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            backgroundColor: colors.primary,
            width: indicatorWidth,
            opacity: indicatorOpacity,
          },
        ]}
      />
    </View>
  );
}

function AnimatedTabLabel({ name, focused }: TabIconProps) {
  const { colors } = useTheme();
  const config = tabConfig[name];

  const opacity = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: focused ? 1 : 0.6,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.Text
      style={[
        styles.tabLabel,
        { color: focused ? colors.primary : colors.textTertiary, opacity },
      ]}
    >
      {config.label}
    </Animated.Text>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.tabBarWrapper}>
      <BlurView
        intensity={isDark ? 60 : 90}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      />
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: isDark ? 'rgba(15, 15, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            borderTopColor: colors.border,
          },
        ]}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              onLongPress={onLongPress}
            >
              <View style={styles.tabContent}>
                <AnimatedTabIcon
                  name={route.name as keyof TabParamList}
                  focused={isFocused}
                />
                <AnimatedTabLabel
                  name={route.name as keyof TabParamList}
                  focused={isFocused}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="WorkoutList"
        component={WorkoutListScreen}
        options={{
          title: 'Workouts',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Routines"
        component={RoutinesScreen}
        options={{
          title: 'Routines',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExerciseLibraryScreen}
        options={{
          title: 'Exercises',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressDashboardScreen}
        options={{
          title: 'Progress',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { colors, isDark } = useTheme();

  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.error,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ActiveWorkout"
          component={ActiveWorkoutScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ExerciseSelect"
          component={ExerciseSelectScreen}
          options={{
            title: 'Add Exercise',
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTitleStyle: {
              fontWeight: fontWeight.semibold as any,
              fontSize: fontSize.lg,
            },
          }}
        />
        <Stack.Screen
          name="WorkoutDetail"
          component={WorkoutDetailScreen}
          options={{
            title: 'Workout Details',
            headerTitleStyle: {
              fontWeight: fontWeight.semibold as any,
              fontSize: fontSize.lg,
            },
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="RoutineDetail"
          component={RoutineDetailScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 28 : spacing.md,
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  tabIndicator: {
    height: 3,
    borderRadius: 1.5,
    marginTop: spacing.xxs,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium as any,
    marginTop: 2,
  },
});
