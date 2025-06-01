import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lightbulb, Fan, Power, ChevronUp, ChevronDown, Plus, Sun, Moon } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Device {
    id: string;
    name: string;
    type: 'bulb' | 'fan';
    isOn: boolean;
    speed?: number;
    color?: string;
    room: string;
}

export default function DevicesScreen() {
    const [devices, setDevices] = useState<Device[]>([
        {
            id: '1',
            name: 'Main Light',
            type: 'bulb',
            isOn: false,
            color: '#FFB800',
            room: 'Living Room'
        },
        {
            id: '2',
            name: 'Bedside Lamp',
            type: 'bulb',
            isOn: false,
            color: '#FF6B6B',
            room: 'Bedroom'
        },
        {
            id: '3',
            name: 'Ceiling Fan',
            type: 'fan',
            isOn: false,
            speed: 1,
            color: '#4ECDC4',
            room: 'Living Room'
        },
        {
            id: '4',
            name: 'Table Fan',
            type: 'fan',
            isOn: false,
            speed: 1,
            color: '#45B7D1',
            room: 'Bedroom'
        },
    ]);

    const toggleDevice = (id: string) => {
        setDevices(devices.map(device =>
            device.id === id ? { ...device, isOn: !device.isOn } : device
        ));
    };

    const adjustFanSpeed = (id: string, increment: boolean) => {
        setDevices(devices.map(device => {
            if (device.id === id && device.type === 'fan') {
                const newSpeed = increment
                    ? Math.min((device.speed || 1) + 1, 3)
                    : Math.max((device.speed || 1) - 1, 1);
                return { ...device, speed: newSpeed };
            }
            return device;
        }));
    };

    const getDeviceGradient = (device: Device) => {
        if (!device.isOn) return ['#F8FAFC', '#F1F5F9'];

        switch (device.type) {
            case 'bulb':
                return [device.color || '#FFB800', '#FFD700'];
            case 'fan':
                return [device.color || '#4ECDC4', '#45B7D1'];
            default:
                return ['#F8FAFC', '#F1F5F9'];
        }
    };

    const rooms = Array.from(new Set(devices.map(device => device.room)));

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Devices</Text>
                    <Text style={styles.subtitle}>Control your smart home</Text>
                </View>
                <TouchableOpacity style={styles.addButton}>
                    <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeIn.duration(500)}>
                    {rooms.map((room, roomIndex) => (
                        <View key={room} style={styles.roomSection}>
                            <Text style={styles.roomTitle}>{room}</Text>
                            <View style={styles.devicesContainer}>
                                {devices
                                    .filter(device => device.room === room)
                                    .map((device, index) => (
                                        <Animated.View
                                            key={device.id}
                                            entering={FadeInDown.delay((roomIndex * 2 + index) * 100).duration(500)}
                                            style={styles.deviceCard}
                                        >
                                            <LinearGradient
                                                colors={getDeviceGradient(device)}
                                                style={styles.deviceContent}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <View style={styles.deviceInfo}>
                                                    <View style={[
                                                        styles.iconContainer,
                                                        device.isOn && styles.iconContainerActive
                                                    ]}>
                                                        {device.type === 'bulb' ? (
                                                            device.isOn ? (
                                                                <Sun size={24} color="#FFFFFF" />
                                                            ) : (
                                                                <Moon size={24} color="#64748B" />
                                                            )
                                                        ) : (
                                                            <Fan
                                                                size={24}
                                                                color={device.isOn ? '#FFFFFF' : '#64748B'}
                                                            />
                                                        )}
                                                    </View>
                                                    <View style={styles.deviceDetails}>
                                                        <Text style={[
                                                            styles.deviceName,
                                                            device.isOn && styles.deviceNameActive
                                                        ]}>
                                                            {device.name}
                                                        </Text>
                                                        <Text style={[
                                                            styles.deviceType,
                                                            device.isOn && styles.deviceTypeActive
                                                        ]}>
                                                            {device.type === 'bulb' ? 'Smart Bulb' : 'Smart Fan'}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View style={styles.controlsContainer}>
                                                    {device.type === 'fan' && device.isOn && (
                                                        <View style={styles.speedControls}>
                                                            <TouchableOpacity
                                                                style={[
                                                                    styles.speedButton,
                                                                    device.speed === 1 && styles.speedButtonDisabled
                                                                ]}
                                                                onPress={() => adjustFanSpeed(device.id, false)}
                                                                disabled={device.speed === 1}
                                                            >
                                                                <ChevronDown
                                                                    size={16}
                                                                    color={device.speed === 1 ? '#CBD5E1' : '#64748B'}
                                                                />
                                                            </TouchableOpacity>
                                                            <Text style={[
                                                                styles.speedText,
                                                                device.isOn && styles.speedTextActive
                                                            ]}>
                                                                Speed {device.speed}
                                                            </Text>
                                                            <TouchableOpacity
                                                                style={[
                                                                    styles.speedButton,
                                                                    device.speed === 3 && styles.speedButtonDisabled
                                                                ]}
                                                                onPress={() => adjustFanSpeed(device.id, true)}
                                                                disabled={device.speed === 3}
                                                            >
                                                                <ChevronUp
                                                                    size={16}
                                                                    color={device.speed === 3 ? '#CBD5E1' : '#64748B'}
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.powerButton,
                                                            device.isOn && styles.powerButtonActive
                                                        ]}
                                                        onPress={() => toggleDevice(device.id)}
                                                    >
                                                        <Power
                                                            size={20}
                                                            color={device.isOn ? '#FFFFFF' : '#64748B'}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </LinearGradient>
                                        </Animated.View>
                                    ))}
                            </View>
                        </View>
                    ))}
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
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#64748B',
        marginTop: 2,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    roomSection: {
        marginBottom: 24,
    },
    roomTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: '#1E293B',
        marginBottom: 12,
    },
    devicesContainer: {
        gap: 12,
    },
    deviceCard: {
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
    },
    deviceContent: {
        padding: 16,
    },
    deviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconContainerActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    deviceDetails: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        color: '#64748B',
        marginBottom: 2,
    },
    deviceNameActive: {
        color: '#FFFFFF',
    },
    deviceType: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        color: '#94A3B8',
    },
    deviceTypeActive: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    speedControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    speedButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    speedText: {
        fontSize: 13,
        fontFamily: 'Inter-Medium',
        color: '#64748B',
        marginHorizontal: 8,
    },
    speedTextActive: {
        color: '#FFFFFF',
    },
    powerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    powerButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
}); 