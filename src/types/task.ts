export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type TimerTarget = 'A' | 'B';
