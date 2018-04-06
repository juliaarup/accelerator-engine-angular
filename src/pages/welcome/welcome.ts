import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QuizzPage } from '../pages';

@IonicPage(
{
	name: "WelcomePage"
})
@Component({
	selector: 'page-welcome',
	templateUrl: 'welcome.html'
})
export class WelcomePage {

	constructor(public navCtrl: NavController) {

	}

	chooseModule(moduleName) {
		this.navCtrl.push(QuizzPage, {moduleName: moduleName});
	}


}
