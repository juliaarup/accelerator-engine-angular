import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QuizzPage } from '../pages';
import { ConfigService } from '../../providers/providers';
import { ConfigSettings, ConfigData } from '../../providers/configs/configs'


@IonicPage(
{
	name: "IntroPage"
})

@Component({
	selector: 'page-intro',
	templateUrl: 'intro.html',
})

export class IntroPage {

	modulePath: string;
	moduleName: string;
	configData: ConfigData = {} as ConfigData;
	configSettings: ConfigSettings = {} as ConfigSettings;

	constructor(public navCtrl: NavController, public navParams: NavParams, public configService: ConfigService) {

	}

	ionViewWillLoad() {
		this.moduleName = this.navParams.get("moduleName");
		if (! this.moduleName) {
			this.moduleName = "welcomeme";
		}
		this.modulePath = "assets/modules/" + this.moduleName + "/";
		this.configService.initConfigs(this.modulePath);

		this.initStyles();
	}

	/**
	 * Settings the styles based on received options
	 */
	private initStyles() {

	}

	// pass moduleSettings and moduleData to quizz page
	chooseModule(moduleName) {
		this.navCtrl.push(QuizzPage, {moduleName: moduleName});
	}


}

