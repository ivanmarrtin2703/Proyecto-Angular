import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { AlertController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class TaskDetailPage implements OnInit {
  task: Task | undefined;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    this.task = this.taskService.getTaskById(id);
    
    if (!this.task) {
      this.router.navigate(['/tabs/tab2']);
    }
  }

  toggleComplete() {
    if (this.task) {
      this.taskService.toggleComplete(this.task.id);
      this.refreshTask();
    }
  }

  private refreshTask() {
    if (this.task) {
      this.task = this.taskService.getTaskById(this.task.id);
    }
  }

  async editTitle() {
    if (!this.task) return;

    const alert = await this.alertCtrl.create({
      header: 'Editar Título',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Nuevo título',
          value: this.task.title
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.title && data.title.trim() !== '') {
              this.taskService.updateTask(this.task!.id, { title: data.title });
              this.refreshTask();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteTask() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarea',
      message: '¿Estás seguro? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (this.task) {
              this.taskService.deleteTask(this.task.id);
              this.router.navigate(['/tabs/tab2']);
            }
          }
        }
      ]
    });
    await alert.present();
  }
}