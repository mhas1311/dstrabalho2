import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome';
import { LoginComponent } from './auth/login/login';
import { HomeComponent } from './home/home';
import { JogadoresComponent } from './jogadores/jogadores';
import { AdicionarJogadorComponent } from './jogadores/adicionar-jogador/adicionar-jogador';
import { EditarJogadorComponent } from './jogadores/editar-jogador/editar-jogador';
import { TimesComponent } from './times/times';
import { AdicionarTimeComponent } from './times/adicionar-time/adicionar-time';
import { EditarTimeComponent } from './times/editar-time/editar-time';
import { ContratosComponent } from './contratos/contratos';
import { AdicionarContratoComponent } from './contratos/adicionar-contrato/adicionar-contrato';
import { EditarContratoComponent } from './contratos/editar-contrato/editar-contrato';
import { JogadorRestricoesComponent } from './jogador-restricoes/jogador-restricoes';
import { TimeRestricoesComponent } from './time-restricoes/time-restricoes';
import { AuthGuard } from './shared/guard/auth.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'jogadores', component: JogadoresComponent },
  { path: 'jogadores/adicionar', component: AdicionarJogadorComponent },
  { path: 'jogadores/editar/:id', component: EditarJogadorComponent },
  { path: 'times', component: TimesComponent },
  { path: 'times/adicionar', component: AdicionarTimeComponent },
  { path: 'times/editar/:id', component: EditarTimeComponent },
  { path: 'contratos', component: ContratosComponent },
  { path: 'contratos/adicionar', component: AdicionarContratoComponent },
  { path: 'contratos/editar/:id', component: EditarContratoComponent },
  { path: 'jogador-restricoes', component: JogadorRestricoesComponent },
  { path: 'time-restricoes', component: TimeRestricoesComponent },
  { path: '**', redirectTo: '/' }
];

