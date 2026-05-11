import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonBadge, IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonChip, IonLabel, IonList, IonItem, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { school, calendar, trashOutline } from 'ionicons/icons';
import { TaskService } from '../services/task.service';
import { AlertController, ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonBadge, 
    IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonChip, 
    IonLabel, IonList, IonItem, IonIcon, IonButton
  ],
})
export class Tab3Page {
  private taskService = inject(TaskService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ school, calendar, trashOutline });
  }

  async clearAllTasks() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar borrado',
      message: '¿Estás seguro de que quieres eliminar todas las tareas? Esta acción es irreversible.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, borrar todo',
          role: 'destructive',
          handler: () => {
            this.taskService.clearAll();
            this.showToast();
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast() {
    const toast = await this.toastCtrl.create({
      message: '🗑️ Datos borrados correctamente',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
}
