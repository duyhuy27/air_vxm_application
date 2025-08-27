// Type declaration for Hanoi districts GeoJSON data
declare module '../../assets/01.json' {
    interface District {
        name: string;
        level2_id: string;
        coordinates: number[][][];
    }

    interface HanoiGeoData {
        level2s: District[];
    }

    const value: HanoiGeoData;
    export default value;
}
