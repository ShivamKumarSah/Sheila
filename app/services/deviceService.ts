import { API_URL } from '../config';

export interface Device {
    id: string;
    name: string;
    type: 'bulb' | 'fan';
    room: string;
    isOn: boolean;
    speed?: number;
    color?: string;
    lastUpdated: string;
}

class DeviceService {
    private static instance: DeviceService;
    private devices: Device[] = [];
    private listeners: ((devices: Device[]) => void)[] = [];
    private retryCount = 0;
    private maxRetries = 3;

    private constructor() { }

    static getInstance(): DeviceService {
        if (!DeviceService.instance) {
            DeviceService.instance = new DeviceService();
        }
        return DeviceService.instance;
    }

    // Subscribe to device updates
    subscribe(listener: (devices: Device[]) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // Notify all listeners of device updates
    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.devices));
    }

    private async fetchWithRetry(url: string, options?: RequestInit): Promise<Response> {
        try {
            console.log(`Fetching from: ${url}`);
            const response = await fetch(url, options);
            console.log(`Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.retryCount = 0; // Reset retry count on success
            return response;
        } catch (error) {
            console.error(`Fetch error: ${error}`);
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying request (${this.retryCount}/${this.maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
                return this.fetchWithRetry(url, options);
            }
            throw error;
        }
    }

    // Fetch all devices
    async fetchDevices(): Promise<Device[]> {
        try {
            console.log('Fetching devices...');
            const response = await this.fetchWithRetry(`${API_URL}/devices`);
            const devices = await response.json();
            console.log('Fetched devices:', devices);

            this.devices = devices;
            this.notifyListeners();
            return this.devices;
        } catch (error) {
            console.error('Error fetching devices:', error);
            return [];
        }
    }

    // Add a new device
    async addDevice(device: Omit<Device, 'id' | 'lastUpdated'>): Promise<Device> {
        try {
            const response = await this.fetchWithRetry(`${API_URL}/devices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(device),
            });

            const newDevice = await response.json();
            this.devices.push(newDevice);
            this.notifyListeners();
            return newDevice;
        } catch (error) {
            console.error('Error adding device:', error);
            throw error;
        }
    }

    // Remove a device
    async removeDevice(deviceId: string): Promise<void> {
        try {
            await this.fetchWithRetry(`${API_URL}/devices/${deviceId}`, {
                method: 'DELETE',
            });

            this.devices = this.devices.filter(d => d.id !== deviceId);
            this.notifyListeners();
        } catch (error) {
            console.error('Error removing device:', error);
            throw error;
        }
    }

    // Update device state
    async updateDeviceState(deviceId: string, updates: Partial<Device>): Promise<Device> {
        try {
            const response = await this.fetchWithRetry(`${API_URL}/devices/${deviceId}/state`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            const updatedDevice = await response.json();
            this.devices = this.devices.map(d =>
                d.id === deviceId ? updatedDevice : d
            );
            this.notifyListeners();
            return updatedDevice;
        } catch (error) {
            console.error('Error updating device state:', error);
            throw error;
        }
    }

    // Start polling for device updates
    startPolling(interval: number = 5000) {
        console.log('Starting device polling...');
        this.fetchDevices();
        return setInterval(() => this.fetchDevices(), interval);
    }
}

export default DeviceService.getInstance(); 