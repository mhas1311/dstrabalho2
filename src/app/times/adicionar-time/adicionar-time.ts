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

export interface Estadio {
  id: number;
  nome: string;
  capacidade?: number;
  cidade?: Cidade;
}

export interface NovoTime {
  nome: string;
  cidade?: {
    id: number;
  };
  estadio?: {
    id: number;
  };
}

@Component({
  selector: 'app-adicionar-time',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adicionar-time.html',
  styleUrls: ['./adicionar-time.css']
})
export class AdicionarTimeComponent implements OnInit {
  timeForm: FormGroup;
  cidades: Cidade[] = [];
  estadios: Estadio[] = [];
  isLoading = false;
  isLoadingCidades = true;
  isLoadingEstadios = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.timeForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      cidadeId: [''],
      estadioId: ['']
    });
  }

  ngOnInit() {
    this.loadCidades();
    this.loadEstadios();
  }

  loadCidades() {
    this.http.get<Cidade[]>('http://localhost:8080/cidades')
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

  loadEstadios() {
    this.http.get<Estadio[]>('http://localhost:8080/estadios')
      .subscribe({
        next: (estadios) => {
          this.estadios = estadios;
          this.isLoadingEstadios = false;
        },
        error: (error) => {
          console.error('Erro ao carregar estádios:', error);
          this.isLoadingEstadios = false;
        }
      });
  }

  onSubmit() {
    if (this.timeForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.timeForm.value;
      const novoTime: NovoTime = {
        nome: formData.nome,
      };

      if (formData.cidadeId) {
        novoTime.cidade = { id: parseInt(formData.cidadeId) };
      }

      if (formData.estadioId) {
        novoTime.estadio = { id: parseInt(formData.estadioId) };
      }

      this.http.post<any>('http://localhost:8080/times', novoTime)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = 'Time adicionado com sucesso!';
            this.timeForm.reset();
            
            setTimeout(() => {
              this.router.navigate(['/times']);
            }, 2000);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Erro ao adicionar time:', error);
            this.errorMessage = 'Erro ao adicionar time. Verifique os dados e tente novamente.';
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.timeForm.controls).forEach(key => {
      const control = this.timeForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.timeForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.timeForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} é obrigatório`;
      if (field.errors['minlength']) return `${fieldName} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  goBack() {
    this.router.navigate(['/times']);
  }
}

