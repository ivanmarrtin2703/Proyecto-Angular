import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonListHeader, IonIcon, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonBadge, IonProgressBar } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { add, checkmarkCircle, ellipseOutline, timeOutline, alertCircle, close } from 'ionicons/icons';
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
    IonCardContent, IonGrid, IonRow, IonCol, IonBadge, IonProgressBar, ExploreContainerComponent,
    CommonModule
  ],
})
export class Tab1Page {
  private taskService = inject(TaskService);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);

  urgentTasks: Task[] = [];
  stats = { total: 0, completed: 0, pending: 0, completionRate: 0 };

  constructor() {
    addIcons({ add, checkmarkCircle, ellipseOutline, timeOutline, alertCircle, close });
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    // Reto Bonus: Tareas urgentes (Alta prioridad y pendientes)
    this.urgentTasks = this.taskService.getTasks()
      .filter(t => t.priority === 'alta' && !t.completed)
      .slice(0, 3);
    
    this.stats = this.taskService.getStats();
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddTaskModalComponent
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.taskService.addTask({ ...data, completed: false });
      this.loadData();

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
