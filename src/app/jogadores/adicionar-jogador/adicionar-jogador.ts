import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Cidade {
  id: number;
  nome: string;
  estado?: string;
}

export interface NovoJogador {
  nome: string;
  cpf: string;
  dataNascimento: string;
  cidade?: {
    id: number;
  };
}

@Component({
  selector: 'app-adicionar-jogador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adicionar-jogador.html',
  styleUrls: ['./adicionar-jogador.css']
})
export class AdicionarJogadorComponent implements OnInit {
  jogadorForm: FormGroup;
  cidades: Cidade[] = [];
  isLoading = false;
  isLoadingCidades = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
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
    this.loadCidades();
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
          // Continua sem as cidades se não conseguir carregar
        }
      });
  }

  onSubmit() {
    if (this.jogadorForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.jogadorForm.value;
      const novoJogador: NovoJogador = {
        nome: formData.nome,
        cpf: formData.cpf,
        dataNascimento: formData.dataNascimento,
      };

      // Adicionar cidade se selecionada
      if (formData.cidadeId) {
        novoJogador.cidade = { id: parseInt(formData.cidadeId) };
      }

      this.http.post<any>('https://liga-de-futebol-backend.onrender.com/pessoas', novoJogador)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = 'Jogador adicionado com sucesso!';
            this.jogadorForm.reset();
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
              this.router.navigate(['/jogadores']);
            }, 2000);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Erro ao adicionar jogador:', error);
            this.errorMessage = 'Erro ao adicionar jogador. Verifique os dados e tente novamente.';
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

