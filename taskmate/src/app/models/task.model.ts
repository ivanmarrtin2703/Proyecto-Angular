export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'alta' | 'media' | 'baja';
  completed: boolean;
  created_at: string;
  category?: string;
  dueDate?: string;
}