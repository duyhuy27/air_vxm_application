// Fallback Hanoi districts data for production
// This ensures the map works even if the JSON file fails to load

export interface District {
    name: string;
    level2_id: string;
    coordinates: number[][][];
}

export interface HanoiGeoData {
    level2s: District[];
}

// Simplified districts data as fallback
export const fallbackHanoiData: HanoiGeoData = {
    level2s: [
        {
            name: "Ba Đình",
            level2_id: "ba_dinh",
            coordinates: [[[105.8444, 21.0245]]]
        },
        {
            name: "Hoàn Kiếm", 
            level2_id: "hoan_kiem",
            coordinates: [[[105.8500, 21.0285]]]
        },
        {
            name: "Hai Bà Trưng",
            level2_id: "hai_ba_trung", 
            coordinates: [[[105.8600, 21.0165]]]
        },
        {
            name: "Đống Đa",
            level2_id: "dong_da",
            coordinates: [[[105.8300, 21.0185]]]
        },
        {
            name: "Tây Hồ",
            level2_id: "tay_ho",
            coordinates: [[[105.8200, 21.0785]]]
        }
    ]
};

// Function to get districts data with fallback
export const getHanoiDistrictsData = async (): Promise<HanoiGeoData> => {
    try {
        const response = await fetch('/hanoi-districts.json');
        
        if (!response.ok) {
            console.warn('🗺️ Districts JSON not found, using fallback data');
            return fallbackHanoiData;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('🗺️ Districts JSON has wrong content-type, using fallback data');
            return fallbackHanoiData;
        }
        
        const data = await response.json();
        
        // Validate data structure
        if (data && data.level2s && Array.isArray(data.level2s) && data.level2s.length > 0) {
            console.log('✅ Districts data loaded successfully');
            return data;
        } else {
            console.warn('🗺️ Districts JSON has invalid structure, using fallback data');
            return fallbackHanoiData;
        }
        
    } catch (error) {
        console.error('🗺️ Error loading districts data:', error);
        console.log('🗺️ Using fallback districts data');
        return fallbackHanoiData;
    }
};
