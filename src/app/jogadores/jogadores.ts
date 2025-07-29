import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Cidade {
  id: number;
  nome: string;
  estado?: string;
}

export interface Jogador {
  id: number;
  nome: string;
  cpf?: string;
  dataNascimento?: string;
  cidade?: Cidade;
}

@Component({
  selector: 'app-jogadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jogadores.html',
  styleUrls: ['./jogadores.css']
})
export class JogadoresComponent implements OnInit {
  jogadores: Jogador[] = [];
  isLoading = true;
  errorMessage = '';
  jogadorParaExcluir: Jogador | null = null;
  isExcluindo = false;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadJogadores();
  }

  loadJogadores() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get<Jogador[]>('https://liga-de-futebol-backend.onrender.com/pessoas')
      .subscribe({
        next: (jogadores) => {
          this.jogadores = jogadores;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar jogadores:', error);
          this.errorMessage = 'Erro ao carregar a lista de jogadores. Verifique se o back-end está rodando.';
          this.isLoading = false;
        }
      });
  }

  adicionarJogador() {
    this.router.navigate(['/jogadores/adicionar']);
  }

  editarJogador(id: number) {
    this.router.navigate(['/jogadores/editar', id]);
  }

  confirmarExclusao(jogador: Jogador) {
    this.jogadorParaExcluir = jogador;
  }

  cancelarExclusao() {
    this.jogadorParaExcluir = null;
    this.isExcluindo = false;
  }

  excluirJogador() {
    if (!this.jogadorParaExcluir) return;

    this.isExcluindo = true;
    
    this.http.delete(`https://liga-de-futebol-backend.onrender.com/pessoas/${this.jogadorParaExcluir.id}`)
      .subscribe({
        next: () => {
          // Remover o jogador da lista local
          this.jogadores = this.jogadores.filter(j => j.id !== this.jogadorParaExcluir!.id);
          this.cancelarExclusao();
          
          // Mostrar mensagem de sucesso (opcional)
          console.log('Jogador excluído com sucesso');
        },
        error: (error) => {
          console.error('Erro ao excluir jogador:', error);
          this.isExcluindo = false;
          // Aqui você pode mostrar uma mensagem de erro
          alert('Erro ao excluir jogador. Tente novamente.');
        }
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  formatarData(data?: string): string {
    if (!data) return 'Não informado';
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  }

  calcularIdade(dataNascimento?: string): number {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  }
}

