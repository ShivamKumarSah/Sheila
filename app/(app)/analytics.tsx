import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConnection } from '@/context/ConnectionContext';
import { RefreshCw, Clock, Zap } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryTooltip, VictoryLine, VictoryVoronoiContainer } from 'victory-native';
import { format, parseISO } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

type TimeRange = '24h' | '7d' | '30d' | 'custom';

type AnalyticsData = {
  totalCommands: number;
  successfulCommands: number;
  averageLatencyMs: number;
  lastFiveCommands: {
    cmd: string;
    status: string;
    timestamp: string;
    responseTime?: number;
    user?: string;
    response?: string;
    result?: string;
  }[];
  commandFrequency: {
    command: string;
    count: number;
  }[];
  historicalLatency: {
    timestamp: string;
    latency: number;
  }[];
};

export default function AnalyticsScreen() {
  const { isConnected, fetchAnalytics } = useConnection();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAnalytics]);

  useEffect(() => {
    if (isConnected) {
      loadAnalytics();
      const interval = setInterval(loadAnalytics, 5000);
      setRefreshInterval(interval as unknown as NodeJS.Timeout);
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isConnected, loadAnalytics]);

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <View style={styles.notConnectedContainer}>
          <View style={styles.metricIconContainer}><Text style={{ fontSize: 30 }}>📊</Text></View>
          <Text style={styles.notConnectedTitle}>No Device Connected</Text>
          <Text style={styles.notConnectedSubtitle}>
            Connect to your Sheila device to view analytics data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadAnalytics}
          disabled={isLoading}
        >
          <RefreshCw size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {analyticsData && (
          <Animated.View entering={FadeIn.duration(500)}>
            {/* Time Range Selector */}
            <View style={styles.timeRangeContainer}>
              {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.timeRangeButton,
                    timeRange === range && styles.timeRangeButtonActive,
                  ]}
                  onPress={() => setTimeRange(range)}
                >
                  <Text
                    style={[
                      styles.timeRangeText,
                      timeRange === range && styles.timeRangeTextActive,
                    ]}
                  >
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Key Metrics */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricIconContainer}>
                  <Zap size={20} color="#2563EB" />
                </View>
                <Text style={styles.metricValue}>
                  {analyticsData.totalCommands.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>Total Commands</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={styles.metricIconContainer}>
                  <Clock size={20} color="#7C3AED" />
                </View>
                <Text style={styles.metricValue}>
                  {analyticsData.averageLatencyMs}ms
                </Text>
                <Text style={styles.metricLabel}>Avg Response Time</Text>
              </View>
            </View>

            {/* Command Frequency Bar Chart */}
            {analyticsData.commandFrequency && analyticsData.commandFrequency.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Command Frequency</Text>
                <VictoryChart
                  theme={VictoryTheme.material}
                  width={screenWidth - 40}
                  height={250}
                  domainPadding={{ x: 20 }}
                  padding={{ top: 20, bottom: 80, left: 80, right: 20 }}
                >
                  <VictoryBar
                    data={analyticsData.commandFrequency}
                    x="command"
                    y="count"
                    style={{
                      data: { fill: "#2563EB" },
                    }}
                    labels={({ datum }) => datum.count}
                    labelComponent={<VictoryTooltip />}
                  />
                  <VictoryAxis
                    style={{
                      tickLabels: { fontSize: 10, padding: 5, angle: -45, textAnchor: 'end' },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(t) => t}
                    style={{
                      tickLabels: { fontSize: 10, padding: 5 },
                    }}
                  />
                </VictoryChart>
              </View>
            )}

            {/* Historical Latency Line Graph */}
            {analyticsData.historicalLatency && analyticsData.historicalLatency.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Command Latency Over Time</Text>
                <VictoryChart
                  theme={VictoryTheme.material}
                  width={screenWidth - 40}
                  height={250}
                  padding={{ top: 20, bottom: 60, left: 60, right: 20 }}
                  containerComponent={
                    <VictoryVoronoiContainer
                      labels={({ datum }) => `Time: ${format(parseISO(datum.timestamp), 'HH:mm:ss')}\nLatency: ${datum.latency}ms`}
                      labelComponent={<VictoryTooltip />}
                    />
                  }
                >
                  <VictoryLine
                    data={analyticsData.historicalLatency}
                    x="timestamp"
                    y="latency"
                    style={{
                      data: { stroke: "#7C3AED" },
                    }}
                  />
                  <VictoryAxis
                    tickFormat={(timestamp) => format(parseISO(timestamp), 'HH:mm:ss')}
                    style={{
                      tickLabels: { fontSize: 10, padding: 5, angle: -45, textAnchor: 'end' },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(t) => `${t}ms`}
                    style={{
                      tickLabels: { fontSize: 10, padding: 5 },
                    }}
                  />
                </VictoryChart>
              </View>
            )}

            {/* Command Logs */}
            <View style={styles.logsCard}>
              <Text style={styles.chartTitle}>Recent Commands</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.logHeader}>
                    <Text style={[styles.logHeaderText, { width: 150 }]}>Timestamp</Text>
                    <Text style={[styles.logHeaderText, { width: 120 }]}>Command</Text>
                    <Text style={[styles.logHeaderText, { width: 80 }]}>Status</Text>
                    <Text style={[styles.logHeaderText, { width: 150 }]}>Response</Text>
                    <Text style={[styles.logHeaderText, { width: 100 }]}>Resp Time</Text>
                    <Text style={[styles.logHeaderText, { width: 80 }]}>User</Text>
                  </View>
                  {analyticsData.lastFiveCommands.map((log, index) => (
                    <View key={index} style={styles.logRow}>
                      <Text style={[styles.logText, { width: 150 }]}>{log.timestamp}</Text>
                      <Text style={[styles.logText, { width: 120 }]}>{log.cmd}</Text>
                      <View style={[
                        styles.statusBadge,
                        log.status === 'success' ? styles.successBadge : styles.errorBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          log.status === 'success' ? styles.successText : styles.errorText
                        ]}>
                          {log.status}
                        </Text>
                      </View>
                      <Text style={[styles.logText, { width: 150 }]}>{log.response || log.result || 'N/A'}</Text>
                      <Text style={[styles.logText, { width: 100 }]}>{log.responseTime}ms</Text>
                      <Text style={[styles.logText, { width: 80 }]}>{log.user || 'N/A'}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#2563EB',
  },
  timeRangeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 20,
  },
  metricCard: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  logsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logHeaderText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#64748B',
    marginRight: 16,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginRight: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    width: 80,
    marginRight: 16,
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
    textAlign: 'center',
  },
  successText: {
    color: '#10B981',
  },
  errorText: {
    color: '#F43F5E',
  },
  notConnectedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notConnectedTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  notConnectedSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});