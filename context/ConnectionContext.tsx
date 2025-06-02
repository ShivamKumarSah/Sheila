import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import DeviceService from './deviceService';

type AnalyticsType = {
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

type ConnectionContextType = {
  isConnected: boolean;
  deviceName: string | null;
  deviceIp: string | null;
  connectViaIP: (ipAddress: string) => Promise<void>;
  sendCommand: (cmd: string) => Promise<{ status: string; result: string }>;
  fetchAnalytics: () => Promise<AnalyticsType>;
  disconnect: () => void;
};

const ConnectionContext = createContext<ConnectionContextType>({
  isConnected: false,
  deviceName: null,
  deviceIp: null,
  connectViaIP: async () => { },
  sendCommand: async () => ({ status: '', result: '' }),
  fetchAnalytics: async () => ({
    totalCommands: 0,
    successfulCommands: 0,
    averageLatencyMs: 0,
    lastFiveCommands: [],
    commandFrequency: [],
    historicalLatency: [],
  }),
  disconnect: () => { },
});

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceIp, setDeviceIp] = useState<string | null>(null);

  useEffect(() => {
    DeviceService.setDeviceIp(deviceIp);
  }, [deviceIp]);

  const connectViaIP = async (ipAddress: string) => {
    try {
      const response = await fetch(`http://${ipAddress}:5000/api/ping`);
      if (response.ok) {
        setIsConnected(true);
        setDeviceName(`Pi (${ipAddress})`);
        setDeviceIp(ipAddress);
        DeviceService.startPolling();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      throw new Error(`Failed to connect: ${(error as Error).message}`);
    }
  };

  const sendCommand = async (cmd: string) => {
    if (!isConnected || !deviceIp) {
      throw new Error('Not connected to any device');
    }

    try {
      const response = await fetch(`http://${deviceIp}:5000/api/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cmd }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Command error:', error);
      throw new Error(`Failed to send command: ${(error as Error).message}`);
    }
  };

  const fetchAnalytics = async () => {
    if (!isConnected || !deviceIp) {
      throw new Error('Not connected to any device');
    }

    try {
      const response = await fetch(`http://${deviceIp}:5000/api/analytics`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched analytics data:', data);
      return data;
    } catch (error) {
      console.error('Analytics error:', error);
      throw new Error(`Failed to fetch analytics: ${(error as Error).message}`);
    }
  };

  const disconnect = () => {
    DeviceService.stopPolling();
    DeviceService.setDeviceIp(null);
    setIsConnected(false);
    setDeviceName(null);
    setDeviceIp(null);
  };

  return (
    <ConnectionContext.Provider
      value={{
        isConnected,
        deviceName,
        deviceIp,
        connectViaIP,
        sendCommand,
        fetchAnalytics,
        disconnect,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export const useConnection = () => useContext(ConnectionContext);