import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Cidade {
  id: number;
  nome: string;
  estado?: string;
}

export interface Estadio {
  id: number;
  nome: string;
  capacidade?: number;
  cidade?: Cidade;
}

export interface Time {
  id: number;
  nome: string;
  cidade?: Cidade;
  estadio?: Estadio;
}

@Component({
  selector: 'app-times',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './times.html',
  styleUrls: ['./times.css']
})
export class TimesComponent implements OnInit {
  times: Time[] = [];
  isLoading = true;
  errorMessage = '';
  timeParaExcluir: Time | null = null;
  isExcluindo = false;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadTimes();
  }

  loadTimes() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get<Time[]>('https://liga-de-futebol-backend.onrender.com/times')
      .subscribe({
        next: (times) => {
          this.times = times;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar times:', error);
          this.errorMessage = 'Erro ao carregar a lista de times. Verifique se o back-end está rodando.';
          this.isLoading = false;
        }
      });
  }

  adicionarTime() {
    this.router.navigate(['/times/adicionar']);
  }

  editarTime(id: number) {
    this.router.navigate(['/times/editar', id]);
  }

  confirmarExclusao(time: Time) {
    this.timeParaExcluir = time;
  }

  cancelarExclusao() {
    this.timeParaExcluir = null;
    this.isExcluindo = false;
  }

  excluirTime() {
    if (!this.timeParaExcluir) return;

    this.isExcluindo = true;
    
    this.http.delete(`https://liga-de-futebol-backend.onrender.com/times/${this.timeParaExcluir.id}`)
      .subscribe({
        next: () => {
          // Remover o time da lista local
          this.times = this.times.filter(t => t.id !== this.timeParaExcluir!.id);
          this.cancelarExclusao();
          
          console.log('Time excluído com sucesso');
        },
        error: (error) => {
          console.error('Erro ao excluir time:', error);
          this.isExcluindo = false;
          alert('Erro ao excluir time. Tente novamente.');
        }
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

