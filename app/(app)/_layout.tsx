import React from 'react';
import { Tabs } from 'expo-router';
import { Chrome as Home, ChartBar as BarChart3, Mic, Settings, Bluetooth } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';
import { BluetoothProvider } from '@/context/BluetoothContext';
import { VoiceProvider } from '@/context/VoiceContext';

export default function AppLayout() {
  return (
    <BluetoothProvider>
      <VoiceProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: '#64748B',
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: 'Analytics',
              tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="voice"
            options={{
              title: 'Voice',
              tabBarIcon: ({ color, size }) => <Mic size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="connect"
            options={{
              title: 'Connect',
              tabBarIcon: ({ color, size }) => <Bluetooth size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
            }}
          />
        </Tabs>
      </VoiceProvider>
    </BluetoothProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 2,
  },
});