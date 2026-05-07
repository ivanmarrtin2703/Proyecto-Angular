import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonIcon, IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonCardTitle } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { list, statsChart, checkmarkCircle, ellipseOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, 
    IonLabel, IonList, IonItem, IonIcon, IonCard, IonCardHeader, IonCardSubtitle, 
    IonCardContent, IonCardTitle, CommonModule
  ]
})
export class Tab2Page {
  selectedSegment: string = 'tareas';

  constructor() {
    addIcons({ list, statsChart, checkmarkCircle, ellipseOutline });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }
}
