import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConnection } from '@/context/ConnectionContext';
import { useAuth } from '@/context/AuthContext';
import {
  Mic,
  ChevronRight,
  Thermometer,
  Droplets,
  Wifi,
  Clock,
  Signal,
  Battery,
  Lightbulb,
  Volume2,
  Cloud,
  Settings,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';

const screenWidth = Dimensions.get('window').width;
const horizontalPadding = 15;

const sliderImages = [
  {
    id: 1,
    image: require('@/assets/images/placeholder1.png'),
    title: 'Control your Smart Lights',
  },
  {
    id: 2,
    image: require('@/assets/images/placeholder2.png'),
    title: 'Adjust Thermostat Settings',
  },
  {
    id: 3,
    image: require('@/assets/images/placeholder3.png'),
    title: 'Get Weather Updates',
  },
];

const features = [
  {
    id: 'voice',
    name: 'Voice Commands',
    icon: <Mic size={30} color="#2563EB" />,
    nav: '/voice',
  },
  {
    id: 'lights',
    name: 'Smart Lights',
    icon: <Lightbulb size={30} color="#F97316" />,
    nav: '/lights',
  },
  {
    id: 'thermostat',
    name: 'Thermostat',
    icon: <Thermometer size={30} color="#EF4444" />,
    nav: '/thermostat',
  },
  {
    id: 'speakers',
    name: 'Smart Speakers',
    icon: <Volume2 size={30} color="#10B981" />,
    nav: '/speakers',
  },
  {
    id: 'weather',
    name: 'Weather Info',
    icon: <Cloud size={30} color="#0EA5E9" />,
    nav: '/weather',
  },
  {
    id: 'analytics',
    name: 'View Analytics',
    icon: <Settings size={30} color="#64748B" />,
    nav: '/analytics',
  },
];

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

const _renderItem = ({ item }: { item: typeof sliderImages[0] }) => (
  <View style={styles.sliderItem}>
    <Image source={item.image} style={styles.sliderImage} resizeMode="cover" />
    <View style={styles.sliderTextContainer}>
      <Text style={styles.sliderTitle}>{item.title}</Text>
    </View>
  </View>
);

export default function HomeScreen() {
  const { user } = useAuth();
  const { isConnected, deviceName, deviceIp } = useConnection();
  const router = useRouter();

  const [status, setStatus] = useState({
    uptime: 0,
    signal: 0,
    battery: 0,
    temperature: 0,
    humidity: 0,
    noise: 0,
    accuracy: 0,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchStatus = async () => {
      if (!deviceIp) return;
      try {
        const res = await fetch(`http://${deviceIp}:5000/api/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus({
            uptime: data.uptime || 0,
            signal: data.signal || 0,
            battery: data.battery || 0,
            temperature: data.temperature || 0,
            humidity: data.humidity || 0,
            noise: data.noise || 0,
            accuracy: data.accuracy || 0,
          });
        } else {
          console.error('Status fetch failed:', res.status);
        }
      } catch (e) {
        console.error('Error fetching status:', e);
      }
    };

    if (isConnected && deviceIp) {
      fetchStatus();
      interval = setInterval(fetchStatus, 1000) as unknown as NodeJS.Timeout;
    }
    return () => interval && clearInterval(interval);
  }, [isConnected, deviceIp]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeIn.delay(300).duration(800)}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
            <Text style={styles.subtitle}>Welcome to Sheila assistant</Text>
          </View>
          <View
            style={[
              styles.statusIndicator,
              isConnected ? styles.connected : styles.disconnected,
            ]}
          >
            <Wifi size={12} color={isConnected ? '#10B981' : '#F43F5E'} />
            <Text
              style={[
                styles.statusText,
                isConnected ? styles.connectedText : styles.disconnectedText,
              ]}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </Animated.View>

        {isConnected ? (
          <Animated.View
            entering={FadeInDown.delay(400).duration(800)}
            style={styles.deviceCard}
          >
            <View style={styles.deviceHeader}>
              <View style={styles.deviceInfo}>
                <Wifi size={24} color="#10B981" />
                <View style={styles.deviceNameContainer}>
                  <Text style={styles.deviceName}>
                    {deviceName || deviceIp || 'Sheila Device'}
                  </Text>
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
                <Text style={styles.statValue}>
                  {formatUptime(status.uptime)}
                </Text>
                <Text style={styles.statLabel}>Uptime</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Signal size={16} color="#64748B" />
                <Text style={styles.statValue}>{status.signal} dBm</Text>
                <Text style={styles.statLabel}>Signal</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Thermometer size={16} color="#64748B" />
                <Text style={styles.statValue}>{status.temperature}°C</Text>
                <Text style={styles.statLabel}>Temperature</Text>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.delay(400).duration(800)}
            style={styles.connectPrompt}
          >
            <Wifi size={48} color="#64748B" />
            <Text style={styles.connectTitle}>No Device Connected</Text>
            <Text style={styles.connectSubtitle}>
              Connect to your Sheila device to start using voice commands and
              view sensor data
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

        <View style={styles.sliderContainer}>
          <Carousel
            data={sliderImages}
            renderItem={_renderItem}
            width={screenWidth - horizontalPadding * 2}
            height={180}
            loop
            autoPlay
            autoPlayInterval={5000}
          />
        </View>

        <Animated.View entering={FadeInDown.delay(600).duration(800)}>
          <Text style={styles.sectionTitle}>Explore Features & Devices</Text>
          <View style={styles.gridContainer}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.gridItem}
                onPress={() => router.push(feature.nav as any)}
              >
                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    {feature.icon}
                  </View>
                  <Text style={styles.featureName}>{feature.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#1E293B' },
  subtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#64748B', marginTop: 4 },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connected: { backgroundColor: '#DCFCE7' },
  disconnected: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 12, fontFamily: 'Inter-Medium', marginLeft: 4 },
  connectedText: { color: '#10B981' },
  disconnectedText: { color: '#F43F5E' },
  deviceCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, elevation: 3 },
  deviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deviceInfo: { flexDirection: 'row', alignItems: 'center' },
  deviceNameContainer: { marginLeft: 8 },
  deviceName: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1E293B' },
  deviceStatus: { fontSize: 12, color: '#10B981' },
  refreshButton: { padding: 8 },
  deviceStats: { flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontFamily: 'Inter-Bold', color: '#1E293B', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#64748B' },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },
  connectPrompt: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 24 },
  connectTitle: { fontSize: 16, fontFamily: 'Inter-Bold', color: '#1E293B', marginTop: 12 },
  connectSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginVertical: 8 },
  connectButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginTop: 8 },
  connectButtonText: { color: '#FFFFFF', fontFamily: 'Inter-SemiBold', marginRight: 4 },
  sliderContainer: { marginBottom: 24 },
  sliderItem: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  sliderImage: { width: '100%', height: 180 },
  sliderTextContainer: { position: 'absolute', bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, width: '100%' },
  sliderTitle: { color: '#fff', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#1E293B', marginBottom: 12 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: 12 },
  featureCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', elevation: 2 },
  featureIconContainer: { marginBottom: 8 },
  featureName: { fontSize: 14, color: '#1E293B', textAlign: 'center' },
});

