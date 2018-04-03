import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuizzPage } from './quizz';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    QuizzPage,
  ],
  imports: [
    IonicPageModule.forChild(QuizzPage),
    PipesModule
  ],
})
export class QuizzPageModule {}
