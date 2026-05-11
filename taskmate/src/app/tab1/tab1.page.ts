import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonListHeader, IonIcon, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonBadge, IonProgressBar } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { add, checkmarkCircle, ellipseOutline, timeOutline, alertCircle } from 'ionicons/icons';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { CommonModule } from '@angular/common';

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
  highPriorityTasks: Task[] = [];
  stats = { total: 0, completed: 0, pending: 0, completionRate: 0 };

  constructor() {
    addIcons({ add, checkmarkCircle, ellipseOutline, timeOutline, alertCircle });
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    this.highPriorityTasks = this.taskService.getTasksByPriority('alta');
    this.stats = this.taskService.getStats();
  }
}
