import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [];
  private nextId = 1;
  private readonly STORAGE_KEY = 'taskmate_tasks';
  private readonly ID_KEY = 'taskmate_nextId';

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    localStorage.setItem(this.ID_KEY, String(this.nextId));
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const savedId = localStorage.getItem(this.ID_KEY);
    
    if (saved) {
      this.tasks = JSON.parse(saved).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      }));
    } else {
      // Tareas iniciales si no hay nada guardado
      this.tasks = [
        { id: 1, title: 'Aprender Ionic', description: 'Completar el Sprint 2', priority: 'alta', completed: false, createdAt: new Date() },
        { id: 2, title: 'Hacer ejercicio', description: '30 minutos de cardio', priority: 'media', completed: true, createdAt: new Date() },
        { id: 3, title: 'Leer libro', description: 'Clean Code - capítulo 3', priority: 'baja', completed: false, createdAt: new Date() },
      ];
      this.nextId = 4;
      this.saveToStorage();
    }
    
    if (savedId) this.nextId = parseInt(savedId);
  }

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
    this.saveToStorage();
    return task;
  }

  /**
   * Cambia el estado de completado de una tarea.
   */
  toggleComplete(id: number): void {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveToStorage();
    }
  }

  /**
   * Elimina una tarea por ID.
   */
  deleteTask(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveToStorage();
  }

  /**
   * Actualiza una tarea existente.
   */
  updateTask(id: number, data: Partial<Task>): void {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...data };
      this.saveToStorage();
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

  /**
   * Filtra las tareas por prioridad.
   */
  getTasksByPriority(priority: string): Task[] {
    return this.tasks.filter(t => t.priority === priority);
  }

  /**
   * Borra todas las tareas (Reto Bonus).
   */
  clearAll(): void {
    this.tasks = [];
    this.nextId = 1;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ID_KEY);
  }
}
