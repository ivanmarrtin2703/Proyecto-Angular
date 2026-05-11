import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Task } from '../models/task.model';
import { ApiService } from './api.service';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: any;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiService = inject(ApiService);

  /**
   * Obtiene todas las tareas desde el backend.
   */
  getTasks(): Observable<Task[]> {
    return this.apiService.get<ApiResponse<Task[]>>('tasks').pipe(
      map(res => res.data)
    );
  }

  /**
   * Busca una tarea por su ID.
   */
  getTaskById(id: number): Observable<Task> {
    return this.apiService.get<ApiResponse<Task>>(`tasks/${id}`).pipe(
      map(res => res.data)
    );
  }

  /**
   * Agrega una nueva tarea.
   */
  addTask(data: Partial<Task>): Observable<Task> {
    return this.apiService.post<ApiResponse<Task>>('tasks', {
      title: data.title,
      description: data.description || '',
      priority: data.priority || 'media',
      category: data.category || null,
      dueDate: data.dueDate || null
    }).pipe(
      map(res => res.data)
    );
  }


  /**
   * Cambia el estado de completado de una tarea.
   * Solo envía el campo completed al backend.
   */
  toggleComplete(task: Task): Observable<Task> {
    return this.apiService.put<ApiResponse<Task>>(`tasks/${task.id}`, {
      completed: !task.completed
    }).pipe(
      map(res => res.data)
    );
  }

  /**
   * Elimina una tarea por ID.
   */
  deleteTask(id: number): Observable<any> {
    return this.apiService.delete(`tasks/${id}`);
  }

  /**
   * Elimina TODAS las tareas.
   */
  clearAllTasks(): Observable<any> {
    return this.apiService.delete('tasks');
  }


  /**
   * Actualiza una tarea existente (parcial).
   */
  updateTask(id: number, data: Partial<Task>): Observable<Task> {
    return this.apiService.put<ApiResponse<Task>>(`tasks/${id}`, data).pipe(
      map(res => res.data)
    );
  }

  /**
   * Obtiene estadísticas desde el backend.
   */
  getStats(): Observable<any> {
    return this.apiService.get<ApiResponse<any>>('tasks/stats').pipe(
      map(res => res.data)
    );
  }
}

