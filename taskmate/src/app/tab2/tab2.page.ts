import { Component } from '@angular/core';
import { TaskService } from '../services/task.service';
import { Router } from '@angular/router';
import { Task } from '../models/task.model';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab2Page {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedFilter = 'all';
  searchQuery = '';
  isLoading = false;
  hasError = false;
  private isToggling = false;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    this.hasError = false;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tasks', err);
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }


  filterTasks(event: any) {
    this.searchQuery = event.target.value?.toLowerCase() || '';
    this.applyFilter();
  }

  doRefresh(event: any) {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.applyFilter();
      event.target.complete();
    });
  }

  applyFilter() {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(this.searchQuery) ||
        (task.description && task.description.toLowerCase().includes(this.searchQuery));

      const matchesStatus =
        this.selectedFilter === 'all' ||
        (this.selectedFilter === 'pending' && !task.completed) ||
        (this.selectedFilter === 'done' && task.completed);

      return matchesSearch && matchesStatus;
    });
  }

  onToggle(event: Event, task: Task) {
    // Parar la propagación para que no se abra el detalle
    event.stopPropagation();

    // Evitar bucle infinito: ionChange se dispara al renderizar Y al hacer click
    if (this.isToggling) return;
    this.isToggling = true;

    this.taskService.toggleComplete(task).subscribe({
      next: () => {
        this.loadTasks();
        setTimeout(() => { this.isToggling = false; }, 500);
      },
      error: () => {
        this.isToggling = false;
      }
    });
  }

  async deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe(async () => {
      this.loadTasks();
      const toast = await this.toastCtrl.create({
        message: '🗑️ Tarea eliminada',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    });
  }

  goToDetail(id: number) {
    this.router.navigate(['/task-detail', id]);
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({ component: AddTaskModalComponent });
    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (role !== 'saved' || !data || !(String(data.title ?? '').trim())) {
      return;
    }
    this.taskService.addTask({ ...data, completed: false }).subscribe({
      next: async () => {
        this.loadTasks();
        const toast = await this.toastCtrl.create({
          message: '✅ Tarea creada correctamente',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
      },
      error: async (err) => {
        const msg =
          err?.error?.message ||
          (err?.status === 0
            ? `No hay conexión con el API (${environment.apiBase}). Arranca taskmate-api en el puerto 3000.`
            : 'No se pudo crear la tarea.');
        const toast = await this.toastCtrl.create({
          message: msg,
          duration: 4000,
          position: 'bottom',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
