import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Time {
  id: number;
  nome: string;
}

export interface TimeRestricao {
  id: number;
  descricao: string;
  dataInicio: string;
  dataFim?: string;
  time?: Time;
}

@Component({
  selector: 'app-time-restricoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-restricoes.html',
  styleUrls: ['./time-restricoes.css']
})
export class TimeRestricoesComponent implements OnInit {
  restricoes: TimeRestricao[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadRestricoes();
  }

  loadRestricoes() {
    // Usando o endpoint correto do back-end
    this.http.get<TimeRestricao[]>('http://localhost:8080/timerestricoes')
      .subscribe({
        next: (restricoes) => {
          this.restricoes = restricoes;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar restrições de times:', error);
          this.errorMessage = 'Erro ao carregar restrições de times. Verifique se o back-end está rodando.';
          this.isLoading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  formatarData(data: string): string {
    if (!data) return 'Não informado';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  }

  isRestricaoAtiva(dataFim?: string): boolean {
    if (!dataFim) return true; // Sem data fim = ativa
    const hoje = new Date();
    const fim = new Date(dataFim);
    return fim >= hoje;
  }
}

