import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useConnection } from '@/context/ConnectionContext';
import { Settings, Bell, Volume2, ChevronRight, LifeBuoy, LogOut, Wifi, Info } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { isConnected, deviceName, deviceIp } = useConnection();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [wakeWordEnabled, setWakeWordEnabled] = React.useState(true);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = React.useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: signOut,
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(500)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <View style={styles.profileItem}>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                  <Text style={styles.profileEmail}>{user?.email || user?.kitNumber || 'No account details'}</Text>
                </View>
                <TouchableOpacity style={styles.profileAction}>
                  <ChevronRight size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device</Text>
            <View style={styles.card}>
              <View style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Wifi size={20} color="#2563EB" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Connected Device</Text>
                  <Text style={styles.settingValue}>
                    {isConnected ? (deviceName || deviceIp || 'Sheila Device') : 'Not connected'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.settingAction}>
                  <ChevronRight size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Bell size={20} color="#F97316" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingDescription}>Receive alerts from Sheila</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                  thumbColor={notificationsEnabled ? '#2563EB' : '#F1F5F9'}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Settings size={20} color="#8B5CF6" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Wake Word Detection</Text>
                  <Text style={styles.settingDescription}>Launch app when "Sheila" is spoken</Text>
                </View>
                <Switch
                  value={wakeWordEnabled}
                  onValueChange={setWakeWordEnabled}
                  trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                  thumbColor={wakeWordEnabled ? '#2563EB' : '#F1F5F9'}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Volume2 size={20} color="#10B981" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Voice Feedback</Text>
                  <Text style={styles.settingDescription}>Enable spoken responses</Text>
                </View>
                <Switch
                  value={voiceFeedbackEnabled}
                  onValueChange={setVoiceFeedbackEnabled}
                  trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                  thumbColor={voiceFeedbackEnabled ? '#2563EB' : '#F1F5F9'}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <LifeBuoy size={20} color="#0EA5E9" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Help & Support</Text>
                  <Text style={styles.settingDescription}>Get help with Sheila</Text>
                </View>
                <View style={styles.settingAction}>
                  <ChevronRight size={20} color="#64748B" />
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Info size={20} color="#64748B" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>About</Text>
                  <Text style={styles.settingDescription}>App version 1.0.0</Text>
                </View>
                <View style={styles.settingAction}>
                  <ChevronRight size={20} color="#64748B" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#F43F5E" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
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
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#64748B',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  profileAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  settingAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: 68,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  signOutText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F43F5E',
  },
});