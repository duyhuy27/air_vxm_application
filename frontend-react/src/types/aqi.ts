// AQI Data Types
export interface AQIData {
    // Basic location info
    latitude: number;
    longitude: number;
    time: string;
    location_name?: string;
    district?: string;

    // Weather data
    temperature_2m?: number;
    relative_humidity_2m?: number;
    dew_point_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    rain?: number;
    snowfall?: number;
    weather_code?: number;
    pressure_msl?: number;
    surface_pressure?: number;

    // Cloud data
    cloud_cover?: number;
    cloud_cover_low?: number;
    cloud_cover_mid?: number;
    cloud_cover_high?: number;

    // Wind data
    wind_speed_10m?: number;
    wind_speed_80m?: number;
    wind_speed_120m?: number;
    wind_speed_180m?: number;
    wind_direction_10m?: number;
    wind_direction_80m?: number;
    wind_direction_120m?: number;
    wind_direction_180m?: number;

    // Radiation data
    shortwave_radiation?: number;
    direct_radiation?: number;
    diffuse_radiation?: number;
    is_day?: number;
    sunshine_duration?: number;
    uv_index?: number;
    uv_index_clear_sky?: number;

    // Air quality data
    pm10?: number;
    pm2_5?: number;
    carbon_monoxide?: number;
    nitrogen_dioxide?: number;
    sulphur_dioxide?: number;
    ozone?: number;
    aerosol_optical_depth?: number;
    dust?: number;
    ammonia?: number;

    // AQI values from database
    AQI_PM25?: number;
    AQI_PM10?: number;
    AQI_NO2?: number;
    AQI_SO2?: number;
    AQI_CO?: number;
    AQI_O3?: number;
    AQI_TOTAL?: number;

    // Calculated AQI for display (fallback)
    aqi?: number;
    quality_score?: number;
}

export interface AQIDetail extends AQIData {
    wind_direction_10m: number;
    pressure_msl: number;
}

export interface AQIStats {
    total_records: number;
    total_dates: number;
    total_locations: number;
    earliest_date: string;
    latest_date: string;
    averages: {
        pm2_5: number;
        pm10: number;
        no2: number;
        ozone: number;
    };
}

// Forecast Types
export interface ForecastData {
    timestamp: string;
    hour?: number;
    day?: number;
    pm2_5: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    confidence: number;
}

export interface ForecastResponse {
    data: ForecastData[];
}

export interface TrendsResponse {
    data: any[];
}

// Chatbot Types
export interface ChatbotQuery {
    query: string;
    user_location?: {
        latitude: number;
        longitude: number;
    };
}

export interface ChatbotIntent {
    type: string;
    confidence: number;
    entities: Record<string, any>;
    time_reference?: string;
    location?: string;
}

export interface ChatbotResponse {
    answer: string;
    data?: Record<string, any>;
    suggestions?: string[];
    error?: string;
}

export interface ChatbotQueryResponse {
    query: string;
    intent: ChatbotIntent;
    response: ChatbotResponse;
    timestamp: string;
    confidence: number;
}

export interface ChatbotSuggestions {
    current_status: string[];
    forecast: string[];
    comparison: string[];
    health_advice: string[];
}

export interface ChatbotSuggestionsResponse {
    suggestions: ChatbotSuggestions;
    total_categories: number;
    timestamp: string;
}

// AQI Level Types
export type AQILevel = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export interface AQILevelInfo {
    level: AQILevel;
    label: string;
    color: string;
    emoji: string;
    description: string;
    healthAdvice: string;
}

