import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Pessoa {
  id: number;
  nome: string;
  cpf?: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

export interface Time {
  id: number;
  nome: string;
  cidade?: Cidade;
}

export interface Contrato {
  id: number;
  tipo: string;
  funcao: string;
  dataInicio: string;
  dataFim: string;
  situacao: string;
  observacao?: string;
  pessoa?: Pessoa;
  time?: Time;
}

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contratos.html',
  styleUrls: ['./contratos.css']
})
export class ContratosComponent implements OnInit {
  contratos: Contrato[] = [];
  isLoading = true;
  errorMessage = '';
  showDeleteConfirm = false;
  contratoToDelete: number | null = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadContratos();
  }

  loadContratos() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Contrato[]>('https://liga-de-futebol-backend.onrender.com/contratos')
      .subscribe({
        next: (contratos) => {
          this.contratos = contratos;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar contratos:', error);
          this.errorMessage = 'Erro ao carregar a lista de contratos. Verifique se o back-end está rodando.';
          this.isLoading = false;
        }
      });
  }

  formatarData(data: string): string {
    if (!data) return 'Não informado';
    
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  }

  isContratoVencido(dataFim: string): boolean {
    if (!dataFim) return false;
    
    try {
      const hoje = new Date();
      const fim = new Date(dataFim);
      return fim < hoje;
    } catch (error) {
      return false;
    }
  }

  getStatusClass(situacao: string): string {
    switch (situacao?.toUpperCase()) {
      case 'ATIVO':
        return 'status-ativo';
      case 'INATIVO':
        return 'status-inativo';
      case 'SUSPENSO':
        return 'status-suspenso';
      case 'RESCINDIDO':
        return 'status-rescindido';
      default:
        return 'status-default';
    }
  }

  adicionarContrato() {
    this.router.navigate(['/contratos/adicionar']);
  }

  editarContrato(id: number) {
    this.router.navigate(['/contratos/editar', id]);
  }

  confirmarExclusao(id: number) {
    this.contratoToDelete = id;
    this.showDeleteConfirm = true;
  }

  cancelarExclusao() {
    this.contratoToDelete = null;
    this.showDeleteConfirm = false;
  }

  excluirContrato() {
    if (this.contratoToDelete) {
      this.http.delete(`https://liga-de-futebol-backend.onrender.com/contratos/${this.contratoToDelete}`)
        .subscribe({
          next: () => {
            this.contratos = this.contratos.filter(c => c.id !== this.contratoToDelete);
            this.cancelarExclusao();
          },
          error: (error) => {
            console.error('Erro ao excluir contrato:', error);
            this.errorMessage = 'Erro ao excluir contrato. Tente novamente.';
            this.cancelarExclusao();
          }
        });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

