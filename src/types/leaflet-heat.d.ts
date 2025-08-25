declare module 'leaflet' {
    namespace L {
        function heatLayer(
            latlngs: Array<[number, number, number]>,
            options?: HeatMapOptions
        ): HeatLayer;

        interface HeatMapOptions {
            radius?: number;
            blur?: number;
            maxZoom?: number;
            max?: number;
            minOpacity?: number;
            gradient?: { [key: number]: string };
        }

        interface HeatLayer extends Layer {
            setLatLngs(latlngs: Array<[number, number, number]>): this;
            addLatLng(latlng: [number, number, number]): this;
            setOptions(options: HeatMapOptions): this;
        }
    }
}
