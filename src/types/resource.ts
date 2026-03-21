export interface Resource {
  id: string;
  url: string;
  title: string;
  type: 'link' | 'youtube' | 'pdf' | 'other';
  createdAt: number;
}
