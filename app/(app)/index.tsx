import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConnection } from '@/context/ConnectionContext';
import { useVoice } from '@/context/VoiceContext';
import { useAuth } from '@/context/AuthContext';
import { Mic, ChevronRight, Activity, Thermometer, Droplets, Wifi, Clock, Signal, Battery } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { VictoryContainer, VictoryPie } from 'victory-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const { isConnected, deviceName, deviceIp } = useConnection();
  const router = useRouter();

  // Demo sensor data for UI display (replace with real fetch if needed)
  const sensorData = {
    temperature: 24.5,
    humidity: 45,
    noise: 38,
    motion: 'None',
  };

  const modelMetrics = {
    accuracy: 92,
    inferenceTime: 320,
    lastCommand: 'N/A',
  };

  // Calculate uptime (for demo, using a fixed value)
  const uptime = {
    days: 2,
    hours: 15,
    minutes: 30
  };

  // Data for the accuracy pie chart
  const accuracyData = [
    { x: "Accuracy", y: modelMetrics.accuracy },
    { x: "Remaining", y: 100 - modelMetrics.accuracy }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
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
            <Wifi size={12} color={isConnected ? '#10B981' : '#F43F5E'} />
            <Text style={[styles.statusText, isConnected ? styles.connectedText : styles.disconnectedText]}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </Animated.View>

        {isConnected ? (
          <>
            <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.deviceCard}>
              <View style={styles.deviceHeader}>
                <View style={styles.deviceInfo}>
                  <Wifi size={24} color="#10B981" />
                  <View style={styles.deviceNameContainer}>
                    <Text style={styles.deviceName}>{deviceName || deviceIp || 'Sheila Device'}</Text>
                    <Text style={styles.deviceStatus}>Online</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.refreshButton}>
                  <ChevronRight size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.deviceStats}>
                <View style={styles.statItem}>
                  <Clock size={16} color="#64748B" />
                  <Text style={styles.statValue}>{uptime.days}d {uptime.hours}h {uptime.minutes}m</Text>
                  <Text style={styles.statLabel}>Uptime</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Signal size={16} color="#64748B" />
                  <Text style={styles.statValue}>-65 dBm</Text>
                  <Text style={styles.statLabel}>Signal</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Battery size={16} color="#64748B" />
                  <Text style={styles.statValue}>85%</Text>
                  <Text style={styles.statLabel}>Battery</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(800)}>
              <Text style={styles.sectionTitle}>Device Status</Text>
              <View style={styles.gridContainer}>
                <View style={styles.gridItem}>
                  <View style={styles.chartContainer}>
                    <VictoryContainer>
                      <VictoryPie
                        data={accuracyData}
                        width={120}
                        height={120}
                        colorScale={["#2563EB", "#E2E8F0"]}
                        innerRadius={40}
                        labelRadius={({ innerRadius }) => (innerRadius as number) + 20}
                        style={{ labels: { fill: "#1E293B", fontSize: 12, fontFamily: 'Inter-Bold' } }}
                        labels={({ datum }) => `${datum.y}%`}
                      />
                    </VictoryContainer>
                  </View>
                  <Text style={styles.gridLabel}>Model Accuracy</Text>
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
            <Wifi size={48} color="#64748B" />
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
    paddingBottom: 100,
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
  deviceCard: {
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
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceNameContainer: {
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  deviceStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginTop: 2,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
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
  chartContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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