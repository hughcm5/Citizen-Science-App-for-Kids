import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="project"
        options={{
          title: 'Project',
          tabBarIcon: ({ color }) => <Ionicons name="document-text" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="observation"
        options={{
          title: 'About',
          tabBarIcon: ({ color }) => <Ionicons name="help-circle" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="viewobservation"
        options={{
          title: 'Observations',
          tabBarIcon: ({ color }) => <Ionicons name="eye-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="addobservation"
        options={{
          title: 'Add Obser.',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
