import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Jogador {
  id: number;
  nome: string;
  cpf: string;
}

export interface JogadorRestricao {
  id: number;
  descricao: string;
  dataInicio: string;
  dataFim?: string;
  jogador?: Jogador;
}

@Component({
  selector: 'app-jogador-restricoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jogador-restricoes.html',
  styleUrls: ['./jogador-restricoes.css']
})
export class JogadorRestricoesComponent implements OnInit {
  restricoes: JogadorRestricao[] = [];
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
    this.http.get<JogadorRestricao[]>('http://localhost:8080/jogadorrestricoes')
      .subscribe({
        next: (restricoes) => {
          this.restricoes = restricoes;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar restrições de jogadores:', error);
          this.errorMessage = 'Erro ao carregar restrições de jogadores. Verifique se o back-end está rodando.';
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

