// BluetoothContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { Alert, Platform } from 'react-native';

type DeviceInfo = {
  id: string;
  name: string;
  connected: boolean;
  sensors?: {
    temperature: number;
    humidity: number;
    noise: number;
    motion: string;
  };
  model?: {
    accuracy: number;
    inferenceTime: number;
    lastCommand: string;
  };
};

type BluetoothContextType = {
  isConnected: boolean;
  deviceName: string | null;
  deviceInfo: DeviceInfo | null;
  isScanning: boolean;
  devices: DeviceInfo[];
  startScan: () => void;
  stopScan: () => void;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnectFromDevice: () => Promise<void>;
  connectViaIP: (ipAddress: string) => Promise<void>;
};

const BluetoothContext = createContext<BluetoothContextType>({
  isConnected: false,
  deviceName: null,
  deviceInfo: null,
  isScanning: false,
  devices: [],
  startScan: () => {},
  stopScan: () => {},
  connectToDevice: async () => {},
  disconnectFromDevice: async () => {},
  connectViaIP: async () => {},
});

// These demo devices are only used by the Bluetooth‐scan UI
const DEMO_DEVICES: DeviceInfo[] = [
  {
    id: '00:11:22:33:44:55',
    name: 'Sheila-001',
    connected: false,
    sensors: {
      temperature: 24.5,
      humidity: 45,
      noise: 38,
      motion: 'None',
    },
    model: {
      accuracy: 92,
      inferenceTime: 320,
      lastCommand: 'N/A',
    },
  },
  {
    id: '11:22:33:44:55:66',
    name: 'Sheila-002',
    connected: false,
    sensors: {
      temperature: 22.0,
      humidity: 50,
      noise: 42,
      motion: 'Low',
    },
    model: {
      accuracy: 89,
      inferenceTime: 340,
      lastCommand: 'N/A',
    },
  },
  {
    id: '22:33:44:55:66:77',
    name: 'ESP32-DEV',
    connected: false,
    sensors: {
      temperature: 23.2,
      humidity: 48,
      noise: 35,
      motion: 'None',
    },
    model: {
      accuracy: 94,
      inferenceTime: 310,
      lastCommand: 'N/A',
    },
  },
];

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);

  // Simulate a BLE scan (leave as-is for now)
  const startScan = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Bluetooth scanning is not supported on web.');
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      setDevices(
        DEMO_DEVICES.map((device) => ({
          ...device,
          connected: device.id === deviceInfo?.id,
        }))
      );
      setIsScanning(false);
    }, 2000);
  };

  const stopScan = () => {
    setIsScanning(false);
  };

  const connectToDevice = async (deviceId: string) => {
    const device = DEMO_DEVICES.find((d) => d.id === deviceId);
    if (!device) {
      throw new Error('Device not found');
    }
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsConnected(true);
        setDeviceName(device.name);
        setDeviceInfo({ ...device, connected: true });
        setDevices(
          DEMO_DEVICES.map((d) => ({
            ...d,
            connected: d.id === deviceId,
          }))
        );
        resolve();
      }, 1500);
    });
  };

  const disconnectFromDevice = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsConnected(false);
        setDeviceName(null);
        if (deviceInfo) {
          setDeviceInfo({ ...deviceInfo, connected: false });
        }
        setDevices(
          devices.map((d) => ({
            ...d,
            connected: false,
          }))
        );
        resolve();
      }, 500);
    });
  };

  /**
   * Real HTTP-based ping to a local server (e.g., your PC’s Flask at port 5000).
   * Use "http://<PC_IP>:5000/ping" or "http://127.0.0.1:5000/ping".
   */
  const connectViaIP = async (ipAddress: string) => {
    if (!ipAddress) {
      Alert.alert('Invalid IP', 'Please enter a valid IP address.');
      return;
    }

    // If running on a real device, make sure it's on the same Wi-Fi as your PC.
    const url = `http://${ipAddress}:5000/ping`;
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        // Ping succeeded—mark as connected to a “Local Server”
        setIsConnected(true);
        setDeviceName(`Local Server (${ipAddress})`);
        setDeviceInfo({
          id: ipAddress,
          name: 'Local Server',
          connected: true,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      Alert.alert(
        'Connection Failed',
        `Could not connect to ${ipAddress}:5000.\n\nError: ${error.message}`
      );
    }
  };

  return (
    <BluetoothContext.Provider
      value={{
        isConnected,
        deviceName,
        deviceInfo,
        isScanning,
        devices,
        startScan,
        stopScan,
        connectToDevice,
        disconnectFromDevice,
        connectViaIP,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);
