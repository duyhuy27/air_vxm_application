declare module 'leaflet.heat' {

    interface HeatLatLngTuple extends Array<number> {
        0: number; // latitude
        1: number; // longitude  
        2?: number; // intensity
    }

    interface HeatMapOptions {
        minOpacity?: number;
        maxZoom?: number;
        max?: number;
        radius?: number;
        blur?: number;
        gradient?: { [key: string]: string };
    }

    declare module 'leaflet' {
        interface HeatLayer extends Layer {
            setLatLngs(latlngs: HeatLatLngTuple[]): this;
            addLatLng(latlng: HeatLatLngTuple): this;
            setOptions(options: HeatMapOptions): this;
        }

        function heatLayer(
            latlngs: HeatLatLngTuple[],
            options?: HeatMapOptions
        ): HeatLayer;

        namespace heatLayer {
            function heat(
                latlngs: HeatLatLngTuple[],
                options?: HeatMapOptions
            ): HeatLayer;
        }
    }
}
