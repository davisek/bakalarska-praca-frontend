import {Component, Ref} from "vue";

// Base sensor interface
export interface Sensor {
    sensor_name: string;
    type: string;
    display_name: string;
    icon_path?: string;
    image_path?: string;
}

// Sensor group interface
export interface SensorGroup {
    group_name: string;
    group_value: string;
    image_path: string;
    sensors: Sensor[];
}

// Sensor reading interface
export interface SensorReading {
    id: number;
    value: number;
    symbol: string;
    recorded_at: string;
    created_at: string;
    percentageChange?: number | null;
}

// Current sensor data interface
export interface CurrentSensorData {
    value: number | null;
    symbol: string;
    recordedAt: string;
    error: string | null;
}

// Statistics interface
export interface SensorStatistics {
    avg: number | null;
    min: number | null;
    max: number | null;
}

// Pagination metadata interface
export interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
}

// MQTT Sensor payload interface
export interface MqttSensorPayload {
    value: number;
    created_at: string;
    [key: string]: any;
}

// Time range option interface
export interface TimeRangeOption {
    label: string;
    value: number | string;
}

// API response with pagination
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export interface SectionConfig {
    label: string;
    component: Component;
    visible: Ref<boolean>;
}

// Chart configuration

export interface ChartContext {
    chart: any;
    dataIndex: number;
    dataset: {
        data: number[];
        label: string;
    };
    datasetIndex: number;
    raw: number | null;
    formattedValue: string;
    parsed: {
        x: number;
        y: number;
    };
}

export interface ChartOptions {
    responsive: boolean;
    plugins: {
        legend: {
            display: boolean;
            onClick: any;
        };
        crosshair?: {
            line: {
                color: string;
                width: number;
            };
            snap: {
                enabled: boolean;
            };
            zoom: {
                enabled: boolean;
            };
        };
        tooltip?: {
            enabled: boolean;
            callbacks?: {
                label: (context: any) => string;
            };
            backgroundColor?: string;
            bodyFont?: {
                size: number;
                weight: string;
            };
            titleFont?: {
                size: number;
                weight: string;
            };
            padding?: number;
            cornerRadius?: number;
            boxPadding?: number;
        };
    };
    scales?: {
        x?: {
            grid?: {
                display: boolean;
            };
            ticks?: {
                maxTicksLimit?: number;
                autoSkip?: boolean;
                font?: {
                    size: number;
                };
            };
        };
        y?: {
            ticks?: {
                font?: {
                    size: number;
                };
            };
        };
    };
    interaction?: {
        mode: string;
        intersect: boolean;
    };
}