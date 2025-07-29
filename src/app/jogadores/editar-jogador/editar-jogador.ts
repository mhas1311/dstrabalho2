import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Cidade {
  id: number;
  nome: string;
  estado?: string;
}

export interface Jogador {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  cidade?: Cidade;
}

export interface JogadorAtualizado {
  nome: string;
  cpf: string;
  dataNascimento: string;
  cidade?: {
    id: number;
  };
}

@Component({
  selector: 'app-editar-jogador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-jogador.html',
  styleUrls: ['./editar-jogador.css']
})
export class EditarJogadorComponent implements OnInit {
  jogadorForm: FormGroup;
  jogadorId: number = 0;
  jogador: Jogador | null = null;
  cidades: Cidade[] = [];
  isLoading = false;
  isLoadingJogador = true;
  isLoadingCidades = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.jogadorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      dataNascimento: ['', [Validators.required]],
      cidadeId: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.jogadorId = +params['id'];
      this.loadJogador();
      this.loadCidades();
    });
  }

  loadJogador() {
    this.http.get<Jogador>(`https://liga-de-futebol-backend.onrender.com/pessoas/${this.jogadorId}`)
      .subscribe({
        next: (jogador) => {
          this.jogador = jogador;
          this.preencherFormulario(jogador);
          this.isLoadingJogador = false;
        },
        error: (error) => {
          console.error('Erro ao carregar jogador:', error);
          this.errorMessage = 'Erro ao carregar dados do jogador.';
          this.isLoadingJogador = false;
        }
      });
  }

  loadCidades() {
    this.http.get<Cidade[]>('https://liga-de-futebol-backend.onrender.com/cidades')
      .subscribe({
        next: (cidades) => {
          this.cidades = cidades;
          this.isLoadingCidades = false;
        },
        error: (error) => {
          console.error('Erro ao carregar cidades:', error);
          this.isLoadingCidades = false;
        }
      });
  }

  preencherFormulario(jogador: Jogador) {
    this.jogadorForm.patchValue({
      nome: jogador.nome,
      cpf: jogador.cpf,
      dataNascimento: jogador.dataNascimento,
      cidadeId: jogador.cidade?.id || ''
    });
  }

  onSubmit() {
    if (this.jogadorForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.jogadorForm.value;
      const jogadorAtualizado: JogadorAtualizado = {
        nome: formData.nome,
        cpf: formData.cpf,
        dataNascimento: formData.dataNascimento,
      };

      // Adicionar cidade se selecionada
      if (formData.cidadeId) {
        jogadorAtualizado.cidade = { id: parseInt(formData.cidadeId) };
      }

      this.http.put<any>(`https://liga-de-futebol-backend.onrender.com/pessoas/${this.jogadorId}`, jogadorAtualizado)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = 'Jogador atualizado com sucesso!';
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
              this.router.navigate(['/jogadores']);
            }, 2000);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Erro ao atualizar jogador:', error);
            this.errorMessage = 'Erro ao atualizar jogador. Verifique os dados e tente novamente.';
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.jogadorForm.controls).forEach(key => {
      const control = this.jogadorForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.jogadorForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.jogadorForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} é obrigatório`;
      if (field.errors['minlength']) return `${fieldName} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return `${fieldName} deve ter formato válido`;
    }
    return '';
  }

  goBack() {
    this.router.navigate(['/jogadores']);
  }
}

