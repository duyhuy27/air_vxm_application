// Type declaration for Hanoi districts GeoJSON data
export interface District {
    name: string;
    level2_id: string;
    coordinates: number[][][];
}

export interface HanoiGeoData {
    level2s: District[];
}

declare const hanoiGeoData: HanoiGeoData;
export default hanoiGeoData;
