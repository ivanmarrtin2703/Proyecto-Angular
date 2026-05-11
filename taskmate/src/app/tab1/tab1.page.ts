import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonListHeader, IonIcon, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonBadge, IonProgressBar, IonSpinner } from '@ionic/angular/standalone';

import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { add, checkmarkCircle, ellipseOutline, timeOutline, alertCircle, alertCircleOutline, close } from 'ionicons/icons';

import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { CommonModule } from '@angular/common';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { AddTaskModalComponent } from '../components/add-task-modal/add-task-modal.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
    IonListHeader, IonIcon, IonButton, IonCard, IonCardHeader, IonCardTitle, 
    IonCardContent, IonGrid, IonRow, IonCol, IonBadge, IonProgressBar, IonSpinner, ExploreContainerComponent,
    CommonModule
  ],

})
export class Tab1Page {
  private taskService = inject(TaskService);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);

  urgentTasks: Task[] = [];
  stats = { total: 0, completed: 0, pending: 0, completionRate: 0 };
  isLoading = false;
  hasError = false;

  constructor() {
    addIcons({ add, checkmarkCircle, ellipseOutline, timeOutline, alertCircle, alertCircleOutline, close });

  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.hasError = false;
    
    // Cargar tareas para filtrar urgentes
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.urgentTasks = tasks
          .filter(t => t.priority === 'alta' && !t.completed)
          .slice(0, 3);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
      }
    });
    
    // Cargar estadísticas desde el backend
    this.taskService.getStats().subscribe({
      next: (res) => {
        this.stats = {
          ...res,
          completionRate: res.total > 0 ? res.completed / res.total : 0
        };
      },
      error: () => {
        this.hasError = true;
      }
    });
  }


  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddTaskModalComponent
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.taskService.addTask({ ...data, completed: false }).subscribe(async () => {
        this.loadData();

        const toast = await this.toastCtrl.create({
          message: '✅ Tarea creada correctamente',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
      });
    }
  }
}
