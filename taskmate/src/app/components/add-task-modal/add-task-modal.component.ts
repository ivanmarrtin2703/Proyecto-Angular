import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

/** YYYY-MM-DD en calendario local (evita el desfase UTC de `new Date('YYYY-MM-DD')`). */
function toLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  /** Mínimo seleccionable en el calendario (hoy, hora local). */
  minDueDate = toLocalYmd(new Date());
  /**
   * Fuera del FormGroup: `ion-datetime` + `formControlName` suele dejar el grupo en INVALID
   * y el botón Guardar queda deshabilitado aunque título y prioridad estén bien.
   */
  selectedDueDate: string | null = null;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.minDueDate = toLocalYmd(new Date());
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      priority: ['media', Validators.required],
      category: ['personal']
    });
  }

  get titleError(): string {
    const ctrl = this.taskForm.get('title');
    if (ctrl?.hasError('required')) return 'El título es obligatorio';
    if (ctrl?.hasError('minlength')) return 'Mínimo 3 caracteres';
    if (ctrl?.hasError('maxlength')) return 'Máximo 100 caracteres';
    return '';
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  clearDueDate(): void {
    this.selectedDueDate = null;
  }

  onDueDateChange(ev: Event): void {
    const v = (ev as CustomEvent<{ value?: string | string[] | null }>).detail?.value;
    if (v == null || v === '') {
      this.selectedDueDate = null;
      return;
    }
    this.selectedDueDate = Array.isArray(v) ? (v[0] ?? null) : v;
  }

  save() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const raw = this.taskForm.getRawValue() as {
      title: string;
      description: string;
      priority: string;
      category: string;
    };
    const payload = {
      title: raw.title.trim(),
      description: (raw.description ?? '').trim(),
      priority: raw.priority,
      category: raw.category,
      dueDate: this.selectedDueDate
    };
    void this.modalCtrl.dismiss(payload, 'saved');
  }
}
