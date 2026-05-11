import { Component } from '@angular/core';
import { TaskService } from '../services/task.service';
import { Router } from '@angular/router';
import { Task } from '../models/task.model';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';

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

  constructor(
    private taskService: TaskService,
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    this.tasks = this.taskService.getTasks();
    this.applyFilter();
  }

  filterTasks(event: any) {
    this.searchQuery = event.target.value?.toLowerCase() || '';
    this.applyFilter();
  }

  doRefresh(event: any) {
    this.tasks = this.taskService.getTasks();
    this.applyFilter();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  /**
   * Reto Bonus: Filtrado combinado — searchbar + segment simultáneamente.
   */
  applyFilter() {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(this.searchQuery) ||
        task.description?.toLowerCase().includes(this.searchQuery);

      const matchesStatus =
        this.selectedFilter === 'all' ||
        (this.selectedFilter === 'pending' && !task.completed) ||
        (this.selectedFilter === 'done' && task.completed);

      return matchesSearch && matchesStatus;
    });
  }

  onToggle(task: Task) {
    this.taskService.toggleComplete(task.id);
    this.applyFilter();
  }

  goToDetail(id: number) {
    this.router.navigate(['/task-detail', id]);
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({ component: AddTaskModalComponent });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.taskService.addTask({ ...data, completed: false });
      this.tasks = this.taskService.getTasks();
      this.applyFilter();

      // Toast de confirmación
      const toast = await this.toastCtrl.create({
        message: '✅ Tarea creada correctamente',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    }
  }
}
