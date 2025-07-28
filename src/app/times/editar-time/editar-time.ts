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

export interface TimeAtualizado {
  nome: string;
  cidade?: {
    id: number;
  };
  estadio?: {
    id: number;
  };
}

@Component({
  selector: 'app-editar-time',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-time.html',
  styleUrls: ['./editar-time.css']
})
export class EditarTimeComponent implements OnInit {
  timeForm: FormGroup;
  timeId: number = 0;
  time: Time | null = null;
  cidades: Cidade[] = [];
  estadios: Estadio[] = [];
  isLoading = false;
  isLoadingTime = true;
  isLoadingCidades = true;
  isLoadingEstadios = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.timeForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      cidadeId: [''],
      estadioId: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.timeId = +params['id'];
      this.loadTime();
      this.loadCidades();
      this.loadEstadios();
    });
  }

  loadTime() {
    this.http.get<Time>(`http://localhost:8080/times/${this.timeId}`)
      .subscribe({
        next: (time) => {
          this.time = time;
          this.preencherFormulario(time);
          this.isLoadingTime = false;
        },
        error: (error) => {
          console.error('Erro ao carregar time:', error);
          this.errorMessage = 'Erro ao carregar dados do time.';
          this.isLoadingTime = false;
        }
      });
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

  preencherFormulario(time: Time) {
    this.timeForm.patchValue({
      nome: time.nome,
      cidadeId: time.cidade?.id || '',
      estadioId: time.estadio?.id || ''
    });
  }

  onSubmit() {
    if (this.timeForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.timeForm.value;
      const timeAtualizado: TimeAtualizado = {
        nome: formData.nome,
      };

      if (formData.cidadeId) {
        timeAtualizado.cidade = { id: parseInt(formData.cidadeId) };
      }

      if (formData.estadioId) {
        timeAtualizado.estadio = { id: parseInt(formData.estadioId) };
      }

      this.http.put<any>(`http://localhost:8080/times/${this.timeId}`, timeAtualizado)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = 'Time atualizado com sucesso!';
            
            setTimeout(() => {
              this.router.navigate(['/times']);
            }, 2000);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Erro ao atualizar time:', error);
            this.errorMessage = 'Erro ao atualizar time. Verifique os dados e tente novamente.';
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

