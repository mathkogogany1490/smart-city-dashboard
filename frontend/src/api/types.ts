export type Area = {
  id: number;
  code: string;
  name: string;
  svg_path: string;
  label_x: number;
  label_y: number;
  primary_district_id: number;
  district_ids: number[];
  population: number;
};

export type District = {
  id: number;
  name: string;
  area_id: number;
  area_code: string;
  area_name: string;
  population: number;
  population_change_pct: number;
  density: number;
  focus_issues: string;
  is_priority: boolean;
  show_in_chart: boolean;
  chart_order: number;
};

export type RankedDistrict = {
  rank: number;
  id: number;
  name: string;
  population: number;
  area_code: string;
};

export type DistrictPart = {
  id: number;
  name: string;
  population: number;
};

export type DistrictSummary = {
  id: number;
  name: string;
  area_name: string;
  area_code: string;
  population: number;
  population_change_pct: number;
  density: number;
  complaint_count: number;
  complaint_change_pct: number;
  focus_issues: string;
  is_priority: boolean;
  parts: DistrictPart[];
};

export type ComplaintBar = {
  department_id: number;
  name: string;
  count: number;
};

export type ComplaintSummary = {
  days: number;
  total: number;
  items: ComplaintBar[];
};

export type ComplaintItem = {
  id: number;
  title: string;
  department: string;
  department_id: number;
  district: string;
  district_id: number;
  created_at: string;
};

export type PopulationItem = {
  district_id: number;
  name: string;
  age_0_14: number;
  age_15_64: number;
  age_65_plus: number;
};

export type PopulationResponse = {
  year: number;
  years: number[];
  items: PopulationItem[];
};

export type JobGoal = {
  id: number;
  name: string;
  achievement_rate: number;
  year: number;
};

export type Pledge = {
  id: number;
  category: string;
  achievement_rate: number;
  year: number;
  icon: string;
};

export type SnsPost = {
  id: number;
  channel: string;
  title: string;
  duration: string | null;
  views_label: string;
  published_label: string;
  accent: string;
  video_id: string | null;
  thumbnail_url: string | null;
};

export type NewsItem = {
  id: number;
  title: string;
  published_on: string;
  accent: string;
};

export type CityStatus = {
  name: string;
  weather: string;
  temperature_c: number;
  observed_at: string;
  source: string;
};

export type DongTrade = {
  name: string;
  count: number;
  average_manwon: number;
};

export type TradeDeal = {
  apartment: string;
  district: string;
  amount_manwon: number;
  area_m2: number;
  floor: string;
  contract_date: string;
};

export type RealEstate = {
  connected: boolean;
  message: string;
  month: string | null;
  total: number;
  districts: DongTrade[];
  trades: TradeDeal[];
  items: { id: number; name: string; density: number; population: number }[];
};
