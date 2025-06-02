import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lightbulb, Fan, Power, ChevronUp, ChevronDown, Plus, Sun, Moon, Trash2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import deviceService, { Device } from '../services/deviceService';

const { width } = Dimensions.get('window');

export default function DevicesScreen() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial fetch
        loadDevices();

        // Subscribe to device updates
        const unsubscribe = deviceService.subscribe(setDevices);

        // Start polling for updates
        const pollInterval = deviceService.startPolling();

        return () => {
            unsubscribe();
            clearInterval(pollInterval);
        };
    }, []);

    const loadDevices = async () => {
        try {
            setLoading(true);
            await deviceService.fetchDevices();
        } catch (error) {
            Alert.alert('Error', 'Failed to load devices');
        } finally {
            setLoading(false);
        }
    };

    const toggleDevice = async (device: Device) => {
        try {
            await deviceService.updateDeviceState(device.id, {
                isOn: !device.isOn
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to toggle device');
        }
    };

    const adjustFanSpeed = async (device: Device, increment: boolean) => {
        if (!device.speed) return;

        try {
            const newSpeed = increment
                ? Math.min(device.speed + 1, 3)
                : Math.max(device.speed - 1, 1);

            await deviceService.updateDeviceState(device.id, {
                speed: newSpeed
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to adjust fan speed');
        }
    };

    const removeDevice = async (device: Device) => {
        Alert.alert(
            'Remove Device',
            `Are you sure you want to remove ${device.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deviceService.removeDevice(device.id);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove device');
                        }
                    }
                }
            ]
        );
    };

    const addNewDevice = () => {
        // TODO: Implement add device modal/form
        Alert.alert('Coming Soon', 'Device addition will be implemented soon!');
    };

    const getDeviceGradient = (device: Device): [string, string] => {
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
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={addNewDevice}
                >
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
                                                    <TouchableOpacity
                                                        style={styles.removeButton}
                                                        onPress={() => removeDevice(device)}
                                                    >
                                                        <Trash2 size={18} color={device.isOn ? '#FFFFFF' : '#64748B'} />
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={styles.controlsContainer}>
                                                    {device.type === 'fan' && device.isOn && (
                                                        <View style={styles.speedControls}>
                                                            <TouchableOpacity
                                                                style={[
                                                                    styles.speedButton,
                                                                    device.speed === 1 && styles.speedButtonDisabled
                                                                ]}
                                                                onPress={() => adjustFanSpeed(device, false)}
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
                                                                onPress={() => adjustFanSpeed(device, true)}
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
                                                        onPress={() => toggleDevice(device)}
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
    removeButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
}); 