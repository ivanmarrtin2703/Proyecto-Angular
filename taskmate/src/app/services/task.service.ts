import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [
    { id: 1, title: 'Aprender Ionic', description: 'Completar el Sprint 2', priority: 'alta', completed: false, createdAt: new Date() },
    { id: 2, title: 'Hacer ejercicio', description: '30 minutos de cardio', priority: 'media', completed: true, createdAt: new Date() },
    { id: 3, title: 'Leer libro', description: 'Clean Code - capítulo 3', priority: 'baja', completed: false, createdAt: new Date() },
  ];
  private nextId = 4;

  /**
   * Retorna el array de tareas actual.
   */
  getTasks(): Task[] { 
    return [...this.tasks]; 
  }

  /**
   * Busca una tarea por su ID.
   */
  getTaskById(id: number): Task | undefined {
    return this.tasks.find(t => t.id === id);
  }

  /**
   * Agrega una nueva tarea.
   */
  addTask(data: Omit<Task, 'id' | 'createdAt'>): Task {
    const task: Task = { 
      ...data, 
      id: this.nextId++, 
      createdAt: new Date(),
      completed: data.completed ?? false
    };
    this.tasks.push(task);
    return task;
  }

  /**
   * Cambia el estado de completado de una tarea.
   */
  toggleComplete(id: number): void {
    const task = this.tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
  }

  /**
   * Elimina una tarea por ID.
   */
  deleteTask(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }

  /**
   * Actualiza una tarea existente.
   */
  updateTask(id: number, data: Partial<Task>): void {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...data };
    }
  }

  /**
   * Retorna estadísticas básicas.
   */
  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? completed / total : 0,
    };
  }

  // --- RETO BONUS ---
  /**
   * Filtra las tareas por prioridad.
   */
  getTasksByPriority(priority: string): Task[] {
    return this.tasks.filter(t => t.priority === priority);
  }
}
