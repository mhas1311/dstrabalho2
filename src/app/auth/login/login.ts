import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginData = {
    login: '',
    senha: ''
  };
  
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.loginData.login || !this.loginData.senha) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData.login, this.loginData.senha)
      .subscribe({
        next: (response) => {
          console.log('Login realizado com sucesso:', response);
          this.isLoading = false;
          // Redirecionar para a página home
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Erro no login:', error);
          this.isLoading = false;
          if (error.status === 401) {
            this.errorMessage = 'Credenciais inválidas. Verifique seu login e senha.';
          } else {
            this.errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          }
        }
      });
  }
}

