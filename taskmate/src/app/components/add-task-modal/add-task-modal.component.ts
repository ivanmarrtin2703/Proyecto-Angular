import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Validador personalizado para fechas futuras
export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(control.value);
    return selectedDate < today ? { pastDate: true } : null;
  };
}

@Component({
  selector: 'app-add-task-modal',
  templateUrl: './add-task-modal.component.html',
  styleUrls: ['./add-task-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule]
})
export class AddTaskModalComponent implements OnInit {
  taskForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      priority: ['media', Validators.required],
      category: ['personal'],
      dueDate: [null, [futureDateValidator()]]
    });
  }

  get titleError(): string {
    const ctrl = this.taskForm.get('title');
    if (ctrl?.hasError('required')) return 'El título es obligatorio';
    if (ctrl?.hasError('minlength')) return 'Mínimo 3 caracteres';
    if (ctrl?.hasError('maxlength')) return 'Máximo 100 caracteres';
    return '';
  }

  get dateError(): string {
    const ctrl = this.taskForm.get('dueDate');
    if (ctrl?.hasError('pastDate')) return 'La fecha no puede ser anterior a hoy';
    return '';
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.modalCtrl.dismiss(this.taskForm.value);
  }
}
