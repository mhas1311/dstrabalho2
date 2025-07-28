import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css']
})
export class WelcomeComponent {

  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToJogadores() {
    this.router.navigate(['/jogadores']);
  }

  navigateToTimes() {
    this.router.navigate(['/times']);
  }

  navigateToContratos() {
    this.router.navigate(['/contratos']);
  }

  navigateToJogadorRestricoes() {
    this.router.navigate(['/jogador-restricoes']);
  }

  navigateToTimeRestricoes() {
    this.router.navigate(['/time-restricoes']);
  }
}

