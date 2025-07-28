import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Pessoa {
  id: number;
  nome: string;
}

export interface Time {
  id: number;
  nome: string;
}

export interface NovoContrato {
  tipo: string;
  funcao: string;
  dataInicio: string;
  dataFim: string;
  situacao: string;
  observacao?: string;
  pessoa?: {
    id: number;
  };
  time?: {
    id: number;
  };
}

@Component({
  selector: 'app-adicionar-contrato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adicionar-contrato.html',
  styleUrls: ['./adicionar-contrato.css']
})
export class AdicionarContratoComponent implements OnInit {
  contratoForm: FormGroup;
  pessoas: Pessoa[] = [];
  times: Time[] = [];
  isLoading = false;
  isLoadingPessoas = true;
  isLoadingTimes = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.contratoForm = this.fb.group({
      tipo: ['', [Validators.required]],
      funcao: ['', [Validators.required]],
      dataInicio: ['', [Validators.required]],
      dataFim: ['', [Validators.required]],
      situacao: ['', [Validators.required]],
      observacao: [''],
      pessoaId: [''],
      timeId: ['']
    });
  }

  ngOnInit() {
    this.loadPessoas();
    this.loadTimes();
  }

  loadPessoas() {
    this.http.get<Pessoa[]>('http://localhost:8080/pessoas')
      .subscribe({
        next: (pessoas) => {
          this.pessoas = pessoas;
          this.isLoadingPessoas = false;
        },
        error: (error) => {
          console.error('Erro ao carregar pessoas:', error);
          this.isLoadingPessoas = false;
        }
      });
  }

  loadTimes() {
    this.http.get<Time[]>('http://localhost:8080/times')
      .subscribe({
        next: (times) => {
          this.times = times;
          this.isLoadingTimes = false;
        },
        error: (error) => {
          console.error('Erro ao carregar times:', error);
          this.isLoadingTimes = false;
        }
      });
  }

  onSubmit() {
    if (this.contratoForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.contratoForm.value;
      const novoContrato: NovoContrato = {
        tipo: formData.tipo,
        funcao: formData.funcao,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        situacao: formData.situacao,
        observacao: formData.observacao,
      };

      if (formData.pessoaId) {
        novoContrato.pessoa = { id: parseInt(formData.pessoaId) };
      }

      if (formData.timeId) {
        novoContrato.time = { id: parseInt(formData.timeId) };
      }

      this.http.post<any>('http://localhost:8080/contratos', novoContrato)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = 'Contrato adicionado com sucesso!';
            this.contratoForm.reset();
            
            setTimeout(() => {
              this.router.navigate(['/contratos']);
            }, 2000);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Erro ao adicionar contrato:', error);
            this.errorMessage = 'Erro ao adicionar contrato. Verifique os dados e tente novamente.';
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.contratoForm.controls).forEach(key => {
      const control = this.contratoForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contratoForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.contratoForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} é obrigatório`;
    }
    return '';
  }

  goBack() {
    this.router.navigate(['/contratos']);
  }
}

