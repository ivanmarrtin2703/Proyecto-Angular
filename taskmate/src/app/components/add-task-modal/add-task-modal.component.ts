import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-task-modal',
  templateUrl: './add-task-modal.component.html',
  styleUrls: ['./add-task-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class AddTaskModalComponent {
  title = '';
  description = '';
  priority = 'media';
  // Reto Bonus: control de validación
  submitted = false;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.submitted = true;
    if (!this.title.trim()) return;
    this.modalCtrl.dismiss({
      title: this.title,
      description: this.description,
      priority: this.priority
    });
  }
}
