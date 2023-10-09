export interface IGeoJson {
    type: string;
}

export interface IFeature extends IGeoJson {
    type: 'Feature'
    properties?: {
        name?: string
        source?: {
            filename?: string
        }
    }
    geometry: any
}

export interface IFeatureCollection extends IGeoJson {
    type: 'FeatureCollection'
    features: IFeature[]
}
