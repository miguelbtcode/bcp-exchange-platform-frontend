import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss'
})
export class ConfigurationComponent {
  darkMode = false;
  baseCurrency = 'PEN';
  notifications = true;
  language = 'es';

  saveConfiguration() {
    alert('Configuración guardada exitosamente');
  }
}
