import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonListHeader, IonIcon, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonBadge, IonProgressBar } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { add, checkmarkCircle, ellipseOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
    IonListHeader, IonIcon, IonButton, IonCard, IonCardHeader, IonCardTitle, 
    IonCardContent, IonGrid, IonRow, IonCol, IonBadge, IonProgressBar, ExploreContainerComponent
  ],
})
export class Tab1Page {
  constructor() {
    addIcons({ add, checkmarkCircle, ellipseOutline, timeOutline });
  }
}
