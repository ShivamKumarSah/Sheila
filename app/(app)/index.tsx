import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBluetooth } from '@/context/BluetoothContext';
import { useVoice } from '@/context/VoiceContext';
import { useAuth } from '@/context/AuthContext';
import { Mic, ChevronRight, Activity, Thermometer, Droplets, Bluetooth } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { WaveformDisplay } from '@/components/WaveformDisplay';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const { isConnected, deviceName, deviceInfo } = useBluetooth();
  const { isListening, startListening, lastResponse } = useVoice();
  const router = useRouter();

  // Demo sensor data for UI display
  const sensorData = deviceInfo?.sensors || {
    temperature: 24.5,
    humidity: 45,
    noise: 38,
    motion: 'None',
  };

  const modelMetrics = deviceInfo?.model || {
    accuracy: 92,
    inferenceTime: 320,
    lastCommand: lastResponse ? lastResponse.command : 'N/A',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.delay(300).duration(800)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
            <Text style={styles.subtitle}>Welcome to Sheila assistant</Text>
          </View>
          <View style={[styles.statusIndicator, isConnected ? styles.connected : styles.disconnected]}>
            <Bluetooth size={12} color={isConnected ? '#10B981' : '#F43F5E'} />
            <Text style={[styles.statusText, isConnected ? styles.connectedText : styles.disconnectedText]}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </Animated.View>

        {isConnected ? (
          <>
            <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.actionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Voice Command</Text>
                <TouchableOpacity 
                  style={styles.micButton}
                  onPress={() => router.push('/voice')}
                >
                  <Mic size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.waveformContainer}>
                <WaveformDisplay isActive={isListening} />
              </View>
              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>Last Response:</Text>
                <Text style={styles.responseText}>
                  {lastResponse ? lastResponse.response : "No recent commands"}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.fullButton}
                onPress={() => startListening()}
              >
                <Text style={styles.fullButtonText}>
                  {isListening ? "Listening..." : "Start New Command"}
                </Text>
                <ChevronRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(800)}>
              <Text style={styles.sectionTitle}>Device Status</Text>
              <View style={styles.gridContainer}>
                <View style={styles.gridItem}>
                  <View style={styles.iconWrapper}>
                    <Activity size={24} color="#2563EB" />
                  </View>
                  <Text style={styles.gridLabel}>Model Accuracy</Text>
                  <Text style={styles.gridValue}>{modelMetrics.accuracy}%</Text>
                </View>
                <View style={styles.gridItem}>
                  <View style={styles.iconWrapper}>
                    <Thermometer size={24} color="#F97316" />
                  </View>
                  <Text style={styles.gridLabel}>Temperature</Text>
                  <Text style={styles.gridValue}>{sensorData.temperature}°C</Text>
                </View>
                <View style={styles.gridItem}>
                  <View style={styles.iconWrapper}>
                    <Droplets size={24} color="#0EA5E9" />
                  </View>
                  <Text style={styles.gridLabel}>Humidity</Text>
                  <Text style={styles.gridValue}>{sensorData.humidity}%</Text>
                </View>
                <View style={styles.gridItem}>
                  <View style={styles.iconWrapper}>
                    <Mic size={24} color="#8B5CF6" />
                  </View>
                  <Text style={styles.gridLabel}>Noise Level</Text>
                  <Text style={styles.gridValue}>{sensorData.noise} dB</Text>
                </View>
              </View>
            </Animated.View>
          </>
        ) : (
          <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.connectPrompt}>
            <Bluetooth size={48} color="#64748B" />
            <Text style={styles.connectTitle}>No Device Connected</Text>
            <Text style={styles.connectSubtitle}>
              Connect to your Sheila device to start using voice commands and view sensor data
            </Text>
            <TouchableOpacity 
              style={styles.connectButton}
              onPress={() => router.push('/connect')}
            >
              <Text style={styles.connectButtonText}>Connect Device</Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connected: {
    backgroundColor: '#DCFCE7',
  },
  disconnected: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  connectedText: {
    color: '#10B981',
  },
  disconnectedText: {
    color: '#F43F5E',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformContainer: {
    height: 60,
    marginBottom: 16,
  },
  responseContainer: {
    marginBottom: 16,
  },
  responseLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    lineHeight: 24,
  },
  fullButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  connectPrompt: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  connectTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  connectSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  connectButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginRight: 8,
  },
});