import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConnection } from '@/context/ConnectionContext';
import { VictoryLine, VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import { format, subDays, parseISO } from 'date-fns';
import { RefreshCw, Calendar, Clock, Users, Zap, ChartBar as BarChart3, TrendingUp } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

type TimeRange = '24h' | '7d' | '30d' | 'custom';

type AnalyticsData = {
  dailyStats: {
    date: string;
    commands: number;
    users: number;
    successRate: number;
  }[];
  topCommands: {
    command: string;
    count: number;
    category: string;
  }[];
  hourlyDistribution: {
    hour: number;
    count: number;
  }[];
  metrics: {
    totalCommands: number;
    avgResponseTime: number;
    userEngagement: number;
    monthlyGrowth: number;
  };
  commandLogs: {
    timestamp: string;
    command: string;
    status: string;
    responseTime: number;
    user: string;
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
      
      // Transform the data for our visualizations
      const mockData: AnalyticsData = {
        dailyStats: Array.from({ length: 30 }, (_, i) => ({
          date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
          commands: Math.floor(Math.random() * 100) + 50,
          users: Math.floor(Math.random() * 20) + 10,
          successRate: Math.random() * 20 + 80,
        })).reverse(),
        topCommands: [
          { command: "Weather Check", count: 156, category: "Weather" },
          { command: "Light Control", count: 143, category: "Home" },
          { command: "Music Play", count: 112, category: "Entertainment" },
          { command: "Timer Set", count: 98, category: "Utility" },
          { command: "News Update", count: 87, category: "Information" },
        ],
        hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 30) + 10,
        })),
        metrics: {
          totalCommands: 2547,
          avgResponseTime: 320,
          userEngagement: 78,
          monthlyGrowth: 23,
        },
        commandLogs: Array.from({ length: 20 }, (_, i) => ({
          timestamp: format(subDays(new Date(), i / 4), 'yyyy-MM-dd HH:mm:ss'),
          command: ["Check weather", "Turn on lights", "Play music", "Set timer", "News update"][Math.floor(Math.random() * 5)],
          status: Math.random() > 0.1 ? "Success" : "Failed",
          responseTime: Math.floor(Math.random() * 200) + 200,
          user: `User ${Math.floor(Math.random() * 5) + 1}`,
        })),
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAnalytics]);

  useEffect(() => {
    if (isConnected) {
      loadAnalytics();
      
      // Set up auto-refresh every 5 seconds
      const interval = setInterval(loadAnalytics, 5000);
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isConnected, loadAnalytics]);

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <View style={styles.notConnectedContainer}>
          <BarChart3 size={48} color="#64748B" />
          <Text style={styles.notConnectedTitle}>No Device Connected</Text>
          <Text style={styles.notConnectedSubtitle}>
            Connect to your Sheila device to view analytics data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
                  {analyticsData.metrics.totalCommands.toLocaleString()}
                </Text>
                <Text style={styles.metricLabel}>Total Commands</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={styles.metricIconContainer}>
                  <Clock size={20} color="#7C3AED" />
                </View>
                <Text style={styles.metricValue}>
                  {analyticsData.metrics.avgResponseTime}ms
                </Text>
                <Text style={styles.metricLabel}>Avg Response Time</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={styles.metricIconContainer}>
                  <Users size={20} color="#10B981" />
                </View>
                <Text style={styles.metricValue}>
                  {analyticsData.metrics.userEngagement}%
                </Text>
                <Text style={styles.metricLabel}>User Engagement</Text>
              </View>
              <View style={styles.metricCard}>
                <View style={styles.metricIconContainer}>
                  <TrendingUp size={20} color="#F97316" />
                </View>
                <Text style={styles.metricValue}>
                  +{analyticsData.metrics.monthlyGrowth}%
                </Text>
                <Text style={styles.metricLabel}>Monthly Growth</Text>
              </View>
            </View>

            {/* Command Usage Trend */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Command Usage Trend</Text>
              <VictoryChart
                theme={VictoryTheme.material}
                width={screenWidth - 40}
                height={220}
                padding={{ top: 10, bottom: 40, left: 50, right: 20 }}
                containerComponent={
                  <VictoryVoronoiContainer
                    labels={({ datum }) => 
                      `${datum.commands} commands\n${format(parseISO(datum.date), 'MMM d')}`
                    }
                    labelComponent={<VictoryTooltip />}
                  />
                }
              >
                <VictoryLine
                  data={analyticsData.dailyStats}
                  x="date"
                  y="commands"
                  style={{
                    data: { stroke: "#2563EB" },
                  }}
                />
                <VictoryAxis
                  tickFormat={(date) => format(parseISO(date), 'MMM d')}
                  style={{
                    tickLabels: { fontSize: 10, padding: 5 },
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

            {/* Top Commands */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Most Used Commands</Text>
              <VictoryChart
                theme={VictoryTheme.material}
                width={screenWidth - 40}
                height={220}
                domainPadding={20}
                padding={{ top: 10, bottom: 40, left: 100, right: 20 }}
              >
                <VictoryBar
                  horizontal
                  data={analyticsData.topCommands}
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
                    tickLabels: { fontSize: 10, padding: 5 },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    tickLabels: { fontSize: 10, padding: 5 },
                  }}
                />
              </VictoryChart>
            </View>

            {/* Command Logs */}
            <View style={styles.logsCard}>
              <Text style={styles.chartTitle}>Recent Commands</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.logHeader}>
                    <Text style={[styles.logHeaderText, { width: 150 }]}>Timestamp</Text>
                    <Text style={[styles.logHeaderText, { width: 120 }]}>Command</Text>
                    <Text style={[styles.logHeaderText, { width: 80 }]}>Status</Text>
                    <Text style={[styles.logHeaderText, { width: 100 }]}>Response</Text>
                    <Text style={[styles.logHeaderText, { width: 80 }]}>User</Text>
                  </View>
                  {analyticsData.commandLogs.map((log, index) => (
                    <View key={index} style={styles.logRow}>
                      <Text style={[styles.logText, { width: 150 }]}>{log.timestamp}</Text>
                      <Text style={[styles.logText, { width: 120 }]}>{log.command}</Text>
                      <View style={[
                        styles.statusBadge,
                        log.status === 'Success' ? styles.successBadge : styles.errorBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          log.status === 'Success' ? styles.successText : styles.errorText
                        ]}>
                          {log.status}
                        </Text>
                      </View>
                      <Text style={[styles.logText, { width: 100 }]}>{log.responseTime}ms</Text>
                      <Text style={[styles.logText, { width: 80 }]}>{log.user}</Text>
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