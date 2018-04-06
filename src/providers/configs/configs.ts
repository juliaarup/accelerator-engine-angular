import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventEmitter } from '@angular/core';

/**
 * A Service Provider singleton to do initial load of 'moduleData.json' & 'moduleSettings.json'.
 * Loads them into their own interfaced objects, and stores a few calculated variables
 * which are necessary to configure the app from the component side.
*/
@Injectable()
export class ConfigService {

	configData: ConfigData = {} as ConfigData;
	configSettings: ConfigSettings = {} as ConfigSettings;
	moduleName: string = "";
	moduleSettings: any = {};
	moduleData: any = {};
	modulePath: string = "";
	backgroundImagePath: string = "";
	logoImagePath: string = "";
	smileyColourEnabled: string = "";

 	constructor(public http:HttpClient) {

	}

	initConfigs(currentModulePath: string) {
		this.modulePath = currentModulePath;
		this.http.get<ConfigSettings>(currentModulePath + "moduleSettings.json").subscribe(settings => {
			this.configSettings = settings;

			this.http.get<ConfigData>(currentModulePath + "moduleData.json").subscribe(data => {
				this.configData = data;
				this.backgroundImagePath = currentModulePath	+ "images/" + this.configSettings.moduleBackgroundImage;
				this.logoImagePath = currentModulePath	+ "images/" + this.configSettings.moduleLogoImage;
				if (this.configSettings.useColourSmiley) {
					this.smileyColourEnabled = "_colour";
				}
			});
		});
	}

	getConfigSettings() {
		return this.configSettings;
	}

	getConfigData() {
		return this.configData;
	}
}

export interface ConfigSettings {
  	moduleId: string;
	analyticsKey: string;
	answersDisplayed: number;
	answersAvailable: number;
	moduleLogoImage: string;
	moduleTitleImage: string;
	characterType: string;
	backgroundAudio: boolean;
	backgroundColour: string;
	stepsBackgroundColour: string;
	moduleBackgroundCss: {};
	moduleBackgroundImage: string;
	moduleBackgroundImageCss: {};
	moduleIntroImage: string;
	resultLevels: {};
	narratorBeforeSteps: any;
	resultsAudio: boolean;
	showAllResponses: boolean;
	narrator: string;
	waitingVideoName: string;
	waitingVideoOverrides: any;
	showSubtitleOption: boolean;
	useColourSmiley: boolean;
	immediateFeedback: boolean;
}


export interface ConfigData {
	pageDirection: string;
    moduleTitle: string;
    resultLevels: {};
    stages: any;
    instructions: {};
    introTitle: string;
    introBody: string;
    steps: {};
    subtitles: {};

}
