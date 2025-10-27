// 3D Model Tracking Types

export type TrackingStatus = 'not_started' | 'in_progress' | 'completed';

export type ComponentType = 'wall' | 'column' | 'slab' | 'beam' | 'foundation' | 'roof';

export interface BuildingElement {
  id: string;
  name: string;
  element_type: ComponentType;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  center: [number, number, number]; // x, y, z position
  volume_m3: number;
  floor_level: number;
  tracking_status: TrackingStatus;
  completion_percentage: number; // 0-100
  can_track: boolean;
}

export interface Project3DModel {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_size_mb: number;
  total_meshes: number;
  analysis_completed: boolean;
  uploaded_at: string;
  analyzed_at?: string;
}

export interface MeshGroup {
  id: string;
  model_id: string;
  component_type: ComponentType;
  mesh_indices: number[];
  color: string;
  volume_m3: number;
  unit: 'm3' | 'm2' | 'pcs';
  is_auto_detected: boolean;
}

export interface ComponentTracking {
  id: string;
  mesh_group_id: string;
  tracking_date: string;
  planned_quantity: number;
  actual_quantity: number;
  completion_percentage: number; // 0-100
  completed_mesh_indices: number[];
  status: TrackingStatus;
  photos: Array<{
    url: string;
    caption?: string;
    uploaded_at: string;
  }>;
  materials_used: {
    [key: string]: number; // e.g., { cement: 500, sand: 1000 }
  };
  notes?: string;
  recorded_by: string;
}

export type DeviationType = 'delay' | 'quality' | 'material' | 'specification' | 'other';

export interface DeviationReport {
  id: string;
  element_id: string;
  element_name: string;
  deviation_type: DeviationType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  photos: Array<{
    url: string;
    uploaded_at: string;
  }>;
  reported_by: string;
  reported_at: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  priority: number; // 1-5
}

export interface TrackingStatistics {
  total_elements: number;
  by_type: {
    walls: number;
    columns: number;
    slabs: number;
    beams: number;
  };
  total_volume: number;
  by_status: {
    completed: number;
    in_progress: number;
    not_started: number;
  };
  completion_percentage: number;
}

export interface ViewMode {
  mode: 'normal' | 'exploded' | 'section' | 'xray';
  explode_factor?: number;
  section_height?: number;
  xray_component?: ComponentType;
}

export interface ComponentFilter {
  show_foundation: boolean;
  show_walls: boolean;
  show_columns: boolean;
  show_slabs: boolean;
  show_beams: boolean;
  show_roof: boolean;
}
