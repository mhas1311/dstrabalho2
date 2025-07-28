import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

export interface Cidade {
  id: number;
  nome: string;
  estado?: string;
}

export interface Estadio {
  id: number;
  nome: string;
}

export interface Time {
  id: number;
  nome: string;
  cidade?: Cidade;
  estadio?: Estadio;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  usuario: Usuario | null = null;
  times: Time[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadTimes();
  }

  loadUserData() {
    // Como não temos o endpoint /auth/me no back-end, vamos simular
    // ou usar os dados do token se disponível
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.usuario = {
          id: payload.sub || 1,
          login: payload.sub || 'admin',
          nome: 'Administrador do Sistema'
        };
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        this.usuario = {
          id: 1,
          login: 'admin',
          nome: 'Administrador do Sistema'
        };
      }
    }
  }

  loadTimes() {
    this.http.get<Time[]>('http://localhost:8080/times')
      .subscribe({
        next: (times) => {
          this.times = times;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar times:', error);
          this.errorMessage = 'Erro ao carregar a lista de times.';
          this.isLoading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
  }
}

