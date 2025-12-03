import axios from 'axios';

export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        }
    });
};

export const getCoordinatesFromAddress = async (address) => {
    try {
        const query = address.includes('India') ? address : `${address}, India`;
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lng: parseFloat(response.data[0].lon)
            };
        }
        throw new Error('Location not found');
    } catch (error) {
        console.error("Geocoding error:", error);
        throw error;
    }
};

export const getPincodeFromCoordinates = async (lat, lng) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);

        if (response.data && response.data.address) {
            const pincode = response.data.address.postcode || response.data.address.postal_code || '';
            const address = response.data.display_name || '';

            return {
                pincode,
                address
            };
        }
        return { pincode: '', address: '' };
    } catch (error) {
        console.error('Error getting pincode:', error);
        return { pincode: '', address: '' };
    }
};

export const searchAddresses = async (query) => {
    try {
        if (!query || query.length < 3) {
            return [];
        }

        // Search with countrycodes=in to limit to India
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&countrycodes=in`
        );

        if (response.data && response.data.length > 0) {
            return response.data.map(item => ({
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                postcode: item.address?.postcode || item.address?.postal_code || ''
            }));
        }
        return [];
    } catch (error) {
        console.error('Error searching addresses:', error);
        return [];
    }
};

// Haversine formula to calculate distance between two points in km
export const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};
