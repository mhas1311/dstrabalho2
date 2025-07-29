import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Pessoa {
  id: number;
  nome: string;
}

export interface Time {
  id: number;
  nome: string;
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

export interface ContratoAtualizado {
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
  selector: 'app-editar-contrato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-contrato.html',
  styleUrls: ['./editar-contrato.css']
})
export class EditarContratoComponent implements OnInit {
  contratoForm: FormGroup;
  contratoId: number = 0;
  contrato: Contrato | null = null;
  pessoas: Pessoa[] = [];
  times: Time[] = [];
  isLoading = false;
  isLoadingContrato = true;
  isLoadingPessoas = true;
  isLoadingTimes = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
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
    this.route.params.subscribe(params => {
      this.contratoId = +params['id'];
      this.loadContrato();
      this.loadPessoas();
      this.loadTimes();
    });
  }

  loadContrato() {
    this.http.get<Contrato>(`https://liga-de-futebol-backend.onrender.com/contratos/${this.contratoId}`)
      .subscribe({
        next: (contrato) => {
          this.contrato = contrato;
          this.preencherFormulario(contrato);
          this.isLoadingContrato = false;
        },
        error: (error) => {
          console.error('Erro ao carregar contrato:', error);
          this.errorMessage = 'Erro ao carregar dados do contrato.';
          this.isLoadingContrato = false;
        }
      });
  }

  loadPessoas() {
    this.http.get<Pessoa[]>('https://liga-de-futebol-backend.onrender.com/pessoas')
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
    this.http.get<Time[]>('https://liga-de-futebol-backend.onrender.com/times')
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

  preencherFormulario(contrato: Contrato) {
    this.contratoForm.patchValue({
      tipo: contrato.tipo,
      funcao: contrato.funcao,
      dataInicio: contrato.dataInicio,
      dataFim: contrato.dataFim,
      situacao: contrato.situacao,
      observacao: contrato.observacao,
      pessoaId: contrato.pessoa?.id || '',
      timeId: contrato.time?.id || ''
    });
  }

  onSubmit() {
    if (this.contratoForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.contratoForm.value;
      const contratoAtualizado: ContratoAtualizado = {
        tipo: formData.tipo,
        funcao: formData.funcao,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        situacao: formData.situacao,
        observacao: formData.observacao,
      };

      if (formData.pessoaId) {
        contratoAtualizado.pessoa = { id: parseInt(formData.pessoaId) };
      }

      if (formData.timeId) {
        contratoAtualizado.time = { id: parseInt(formData.timeId) };
      }

      this.http.put<any>(`https://liga-de-futebol-backend.onrender.com/contratos/${this.contratoId}`, contratoAtualizado)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = 'Contrato atualizado com sucesso!';
            
            setTimeout(() => {
              this.router.navigate(['/contratos']);
            }, 2000);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Erro ao atualizar contrato:', error);
            this.errorMessage = 'Erro ao atualizar contrato. Verifique os dados e tente novamente.';
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

