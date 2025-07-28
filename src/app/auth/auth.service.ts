import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

export interface Usuario {
  id: number;
  login: string;
  nome?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080';
  private readonly TOKEN_KEY = 'auth_token';
  
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verificar se já existe um token armazenado ao inicializar o serviço
    const token = this.getToken();
    if (token) {
      // Aqui você poderia fazer uma chamada para validar o token
      // Por enquanto, vamos apenas indicar que o usuário está logado
    }
  }

  login(login: string, senha: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { login, senha };
    
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, loginRequest)
      .pipe(
        tap(response => {
          // Armazenar o token no localStorage
          localStorage.setItem(this.TOKEN_KEY, response.token);
        })
      );
  }

  logout(): void {
    // Remover o token do localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    // Limpar o usuário atual
    this.currentUserSubject.next(null);
    // Redirecionar para a página inicial
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Verificar se o token não está expirado (implementação básica)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Método para buscar dados do usuário logado
  getCurrentUser(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/auth/me`);
  }

  // Método para buscar usuário por ID (caso necessário)
  getUserById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/usuarios/${id}`);
  }

  // Método para definir o usuário atual
  setCurrentUser(user: Usuario): void {
    this.currentUserSubject.next(user);
  }
}

