import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConnection } from '@/context/ConnectionContext';
import { Wifi, X, Send, RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ConnectScreen() {
  const { isConnected, deviceName, connectViaIP, disconnect, sendCommand, fetchAnalytics } = useConnection();
  const [ipAddress, setIpAddress] = useState('192.168.1.100');
  const [command, setCommand] = useState('');
  const [analytics, setAnalytics] = useState<{
    totalCommands: number;
    successfulCommands: number;
    averageLatencyMs: number;
    lastFiveCommands: { cmd: string; status: string; timestamp: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await connectViaIP(ipAddress);
      Alert.alert('Success', 'Connected to Raspberry Pi');
    } catch (error) {
      Alert.alert('Connection Error', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCommand = async () => {
    if (!command.trim()) {
      Alert.alert('Error', 'Please enter a command');
      return;
    }

    try {
      setIsLoading(true);
      const result = await sendCommand(command);
      Alert.alert('Command Result', result.result);
      setCommand('');
      // Refresh analytics after command
      await handleFetchAnalytics();
    } catch (error) {
      Alert.alert('Command Error', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (error) {
      Alert.alert('Analytics Error', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Connect Device</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!isConnected ? (
          <Animated.View entering={FadeIn.duration(500)} style={styles.connectForm}>
            <View style={styles.iconContainer}>
              <Wifi size={32} color="#2563EB" />
            </View>
            
            <Text style={styles.subtitle}>Connect to Raspberry Pi</Text>
            <Text style={styles.description}>
              Enter the IP address of your Raspberry Pi to connect and start sending voice commands
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={ipAddress}
                onChangeText={setIpAddress}
                placeholder="192.168.1.100"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleConnect}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Connecting...' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(500)}>
            <View style={styles.connectedCard}>
              <View style={styles.connectedHeader}>
                <View>
                  <Text style={styles.connectedTitle}>Connected to</Text>
                  <Text style={styles.connectedDeviceName}>{deviceName}</Text>
                </View>
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={disconnect}
                >
                  <X size={16} color="#FFFFFF" />
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.commandSection}>
              <Text style={styles.sectionTitle}>Send Command</Text>
              <View style={styles.commandInputContainer}>
                <TextInput
                  style={styles.commandInput}
                  value={command}
                  onChangeText={setCommand}
                  placeholder="Enter voice command..."
                  placeholderTextColor="#64748B"
                  multiline
                  numberOfLines={2}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendCommand}
                  disabled={isLoading}
                >
                  <Send size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.analyticsSection}>
              <View style={styles.analyticsHeader}>
                <Text style={styles.sectionTitle}>Analytics</Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleFetchAnalytics}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} color="#2563EB" />
                </TouchableOpacity>
              </View>

              {analytics ? (
                <View style={styles.analyticsContent}>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{analytics.totalCommands}</Text>
                      <Text style={styles.statLabel}>Total Commands</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{analytics.successfulCommands}</Text>
                      <Text style={styles.statLabel}>Successful</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{analytics.averageLatencyMs}ms</Text>
                      <Text style={styles.statLabel}>Avg. Latency</Text>
                    </View>
                  </View>

                  <Text style={styles.recentTitle}>Recent Commands</Text>
                  {analytics.lastFiveCommands.map((cmd, index) => (
                    <View key={index} style={styles.commandItem}>
                      <Text style={styles.commandText}>{cmd.cmd}</Text>
                      <View style={styles.commandMeta}>
                        <Text style={styles.commandTime}>
                          {new Date(cmd.timestamp).toLocaleTimeString()}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            cmd.status === 'success'
                              ? styles.successBadge
                              : styles.errorBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              cmd.status === 'success'
                                ? styles.successText
                                : styles.errorText,
                            ]}
                          >
                            {cmd.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.fetchButton}
                  onPress={handleFetchAnalytics}
                  disabled={isLoading}
                >
                  <Text style={styles.fetchButtonText}>
                    {isLoading ? 'Loading...' : 'Fetch Analytics'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  connectForm: {
    padding: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  connectedCard: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  connectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectedTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  connectedDeviceName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F43F5E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectText: {
    marginLeft: 4,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  commandSection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  commandInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commandInput: {
    flex: 1,
    minHeight: 80,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginRight: 12,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsSection: {
    margin: 20,
    marginTop: 0,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  recentTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  commandItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  commandText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginBottom: 4,
  },
  commandMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commandTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  successBadge: {
    backgroundColor: '#DCFCE7',
  },
  errorBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  successText: {
    color: '#10B981',
  },
  errorText: {
    color: '#F43F5E',
  },
  fetchButton: {
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fetchButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});