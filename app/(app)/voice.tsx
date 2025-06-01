import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBluetooth } from '@/context/BluetoothContext';
import { useVoice } from '@/context/VoiceContext';
import { Mic, CircleStop as StopCircle, History, Lightbulb, Clock, Cloud, Volume2 } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, FadeIn } from 'react-native-reanimated';
import { WaveformDisplay } from '@/components/WaveformDisplay';

export default function VoiceScreen() {
  const { isConnected } = useBluetooth();
  const { 
    isListening, 
    startListening, 
    stopListening, 
    lastResponse, 
    responseHistory 
  } = useVoice();

  const scale = useSharedValue(1);

  useEffect(() => {
    if (isListening) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [isListening]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Suggested commands
  const suggestedCommands = [
    { id: 1, text: "What's the weather like today?", icon: <Cloud size={20} color="#0EA5E9" /> },
    { id: 2, text: "Turn on the living room lights", icon: <Lightbulb size={20} color="#F97316" /> },
    { id: 3, text: "What time is it?", icon: <Clock size={20} color="#8B5CF6" /> },
    { id: 4, text: "Play some music", icon: <Volume2 size={20} color="#10B981" /> },
  ];

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Voice Command</Text>
        </View>
        <View style={styles.notConnectedContainer}>
          <Mic size={48} color="#64748B" />
          <Text style={styles.notConnectedTitle}>No Device Connected</Text>
          <Text style={styles.notConnectedSubtitle}>
            Connect to your Sheila device to use voice commands
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Command</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(800)} style={styles.voiceContainer}>
          <View style={styles.waveformContainer}>
            <WaveformDisplay isActive={isListening} />
          </View>
          
          <View style={styles.micContainer}>
            <Animated.View style={[styles.micBackground, animatedStyles]} />
            <TouchableOpacity
              style={styles.micButton}
              onPress={isListening ? stopListening : startListening}
            >
              {isListening ? (
                <StopCircle size={32} color="#FFFFFF" />
              ) : (
                <Mic size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.statusText}>
            {isListening ? "Listening..." : "Tap to start speaking"}
          </Text>
        </Animated.View>

        {lastResponse && (
          <View style={styles.responseCard}>
            <Text style={styles.responseLabel}>Last Command:</Text>
            <Text style={styles.commandText}>{lastResponse.command}</Text>
            <View style={styles.responseDivider} />
            <Text style={styles.responseLabel}>Response:</Text>
            <Text style={styles.responseText}>{lastResponse.response}</Text>
          </View>
        )}

        <View style={styles.suggestedContainer}>
          <Text style={styles.suggestedTitle}>Suggested Commands</Text>
          
          {suggestedCommands.map((command) => (
            <TouchableOpacity 
              key={command.id} 
              style={styles.suggestedItem}
              onPress={() => {
                // In a real implementation, this would trigger the command
                // For demo purposes, we'll just start listening
                startListening();
              }}
            >
              <View style={styles.suggestedIcon}>
                {command.icon}
              </View>
              <Text style={styles.suggestedText}>{command.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {responseHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <History size={18} color="#64748B" />
              <Text style={styles.historyTitle}>Command History</Text>
            </View>
            
            {responseHistory.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyCommand}>{item.command}</Text>
                <Text style={styles.historyResponse}>{item.response}</Text>
                <Text style={styles.historyTime}>{item.timestamp}</Text>
              </View>
            ))}
          </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  voiceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  waveformContainer: {
    height: 60,
    width: '100%',
    marginBottom: 24,
  },
  micContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  micBackground: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  responseCard: {
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
  responseLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  commandText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginBottom: 12,
  },
  responseDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  responseText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    lineHeight: 24,
  },
  suggestedContainer: {
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
  suggestedTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  suggestedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  suggestedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  suggestedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestedText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginLeft: 8,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  historyCommand: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginBottom: 4,
  },
  historyResponse: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
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