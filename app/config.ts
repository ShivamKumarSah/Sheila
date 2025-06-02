// API Configuration
export const getApiUrl = (deviceIp: string | null) => {
    if (!deviceIp) {
        throw new Error('No device IP address provided');
    }
    return `http://${deviceIp}:5000/api`;
};

// You can add more configuration variables here 