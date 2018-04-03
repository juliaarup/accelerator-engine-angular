import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@IonicPage()
@Component({
	selector: 'page-quizz',
	templateUrl: 'quizz.html',
})
export class QuizzPage {
	@ViewChild('mainVideo') mainVideoElement;
	@ViewChild('naratorVideo') naratorVideoElement;
	@ViewChild('answerAudio') answerAudioElement;
	@ViewChild('guideAudio') guideAudioElement;
	filesLoaded: boolean = false;
	moduleName: string;
	moduleSettings: any = {};
	moduleData: any;
	modulePath: string;
	stage: string = "INTRO";
	currentStep: any;
	quizzLevel: number; // The level where the quizz is (number of questions answer up to the point)
	quizzPoints: number; // Total number of points accumulated
	streamLevel: number; // the level of the stream; 0 - displaying worst answers;
	stepsLength: number; // How many steps in length
	quizzResultsPercentage: number;
	waiting: boolean = true;
	waitingVideoSrc: string;
	answerIndex: number = -1;
	satisfactoryLevel: number = 2;
	backgroundImagePath: string;
	displayAnswerIndex: number = -1; // the index of the current answer to be displayed
	readingAloud: boolean = false;
	audioSource: string;
	repeating: boolean = false;
	narating: boolean = false;
	guideAudioIndex: number = 0;
	smileyColourEnabled: string;
	subtitlesEnabled: boolean = true;
	currentSubtitleText: string;
	currentSubtitles: any;
	currentSubtitleIndex: number;
	constructor(public navCtrl: NavController, public navParams: NavParams, public http:HttpClient) {
	}

	ionViewWillLoad() {
		this.moduleName = this.navParams.get("moduleName");
		if (! this.moduleName) {
			this.moduleName = "welcomeme";
		}
		this.modulePath = "assets/modules/" + this.moduleName + "/";
		this.loadModuleFiles();
	}

	/**
	 * Loading module files;
	 */
	private loadModuleFiles() {
		this.http.get(this.modulePath + "moduleSettings.json")
		.subscribe(json => {
			this.moduleSettings = json;
			this.http.get(this.modulePath + "moduleData.json")
			.subscribe(json => {
				this.moduleData = json;
				this.filesLoaded = true;
				this.initStyles();
			});
		});
	}

	/**
	 * Settings the styles based on received options
	 */
	private initStyles() {
		this.backgroundImagePath = this.modulePath + "images/" + this.moduleSettings.moduleBackgroundImage;
		if (this.moduleSettings.useColourSmiley) {
			this.smileyColourEnabled = "_colour";
		}
	}

	/**
	 * Starting the quizz;
	 * Setting the initial streamLevel (the index from which to display answers);
	 * Setting the quizzLevel (which step of the quizz is the user at)
	 * Setting the stage of the app ("QUIZZ")
	 */
	startQuizz() {
		this.streamLevel = this.moduleSettings.answersAvailable - this.moduleSettings.answersDisplayed;
		this.quizzLevel = -1;
		this.quizzPoints = 0;
		this.stage = "QUIZZ";
		this.stepsLength = Object.keys(this.moduleData.steps).length;
		this.displayAnswerIndex = this.streamLevel - 1;
		this.setWaitingVideo();
		this.nextGuideAudio();
	}

	/**
	 * Plays the nextGuideAudio, if the index within appropriate range
	 * Calls initateNextStep, otherwise
	 */
	nextGuideAudio() {
		this.guideAudioIndex++;
		if (this.guideAudioIndex <= 4) {
			var source = "assets/generic/audio/narrator/en-gb/" + this.moduleSettings.narrator + "/Module_Guide_B" + this.guideAudioIndex;
			if (this.guideAudioIndex == 1) {
				source += "_" + this.moduleSettings.characterType;
			}
			source += ".mp3";
			this.guideAudioElement.nativeElement.src = source;
			this.guideAudioElement.nativeElement.play();
		} else {
			this.initiateNextStep();
		}
	}

	/**
	 * Handler for when the guide audio is ending;
	 * Calls nextGuideAudio, if the stage is not results
	 */
	guideAudioEnded() {
		if (this.stage == "RESULTS") {
			return;
		}
		this.nextGuideAudio();
	}

	/**
	 * Initiates the next step by:
	 	* calling displayResults(), if dropping answer or if final of quizz
	 	* calling loadNaratorVideo(), if it's the case
	 	* calling calculateSatisfactoryLevel(), before initiating the new step
	 	* calling setWaitingVideo(), to set the correct waiting video
	 	* calling disableQuizz(), to disable interaction with the quizz until answers are displayed
	 	* calling displayNextAnswer(), to start displaying answers
	 	* setting the correspondent variables to their default stage at the beggining of a step
	 */
	private initiateNextStep() {
		if (this.quizzLevel == this.stepsLength - 1 || (this.answerIndex == 0)) {
			this.displayResults();
			return;
		}

		if (this.narating == false && this.repeating == false) {
			this.quizzLevel++;
		}

		if (this.narating == false && this.moduleSettings.narratorBeforeSteps.indexOf (this.quizzLevel) > -1 ) {
			this.loadNaratorVideo();
			this.narating = true;
			return;
		}

		if (this.moduleSettings.immediateFeedback == false) {
			this.calculateSatisfactoryLevel();
		}

		this.setWaitingVideo();
		this.narating = false;
		this.waiting = true;
		this.disableQuizz();
		if (this.repeating) {
			this.repeating = false;
			return;
		}
		this.displayAnswerIndex = this.streamLevel - 1;
		this.currentStep = this.moduleData.steps['step' + this.quizzLevel];
		this.displayNextAnswer();
	}

	/**
	 * Recursive function in order to display answers step by step;
	 * If readingAloud is enabled, plays the specific audio and display next answer only after the audio has ended
	 */
	private displayNextAnswer() {
		if (this.displayAnswerIndex < this.moduleSettings.answersDisplayed) {
			this.displayAnswerIndex++;
			if (this.readingAloud == false) {
				setTimeout(() => {
					this.displayNextAnswer();
				}, 1000);
			} else {
				this.answerAudioElement.nativeElement.src = this.getAudioSource((this.quizzLevel+1) + String.fromCharCode(97 + this.displayAnswerIndex));
				this.answerAudioElement.nativeElement.play();
			}
		} else {
			this.enableQuizz();
		}
	}

	/**
	 * Returns the full path to the audio file
	 * @param {String} audioName - the name of the audio file
	 */
	private getAudioSource(audioName: string) : string {
		return this.modulePath + "/audio/" + audioName + ".mp3";
	}

	/**
	 * Returns if an answer should be displayed or not
	 * An answer is displayed if with the (streamLevel + number of answersDisplayed) range
	 * @param {any} answerIndex - can be string or number
	 */
	isAnswerDisplayed(answerIndex: any) : boolean {
		var display =  (answerIndex > this.streamLevel - 1) && (answerIndex < (this.streamLevel + this.moduleSettings.answersDisplayed));
		if (display && answerIndex <= this.displayAnswerIndex) {
			return true;
		}
		return false;
	}

	/**
	 * Handler for answer audio ended; calls the recursive function displayNextAnswer
	 */
	answerAudioEnded() {
		if (this.repeating) {
			this.repeating = false;
			this.enableQuizz();
		} else {
			this.displayNextAnswer();
		}
	}

	/**
	 * Handler for listen to answer button
	 * @param {any} answerIndex - the answer index to listen again to
	 */
	listenAnswer(answerIndex) {
		this.repeating = true;
		answerIndex = parseInt(answerIndex);
		this.answerAudioElement.nativeElement.src = this.getAudioSource((this.quizzLevel+1) + String.fromCharCode(97 + answerIndex));
		this.answerAudioElement.nativeElement.play();
	}

	/**
	 * Handler for choose answer
	 * @param {any} answerIndex - the index of the answer chosen (can be string or number)
	 * Will load the video based on the answer Index converted to letter
	 * Will call the satisfactoryLevel calculation
	 */
	chooseAnswer(answerIndex: any) {
		if (! this.waiting) {
			return;
		}
		this.disableQuizz();
		this.answerIndex = parseInt(answerIndex);
		this.quizzPoints+= this.answerIndex;
		this.currentSubtitleText = this.currentStep[this.answerIndex];
		this.loadVideo((this.quizzLevel+1) + String.fromCharCode(97 + this.answerIndex));
		if (this.moduleSettings.immediateFeedback) {
			this.calculateSatisfactoryLevel();
		}
	}

	/**
	 * Calculate the new satisfactory level based on the answer chosen;
	 * Decrease satisfactory level, if the chosen answer it's below half of the number of answers displayed
	 * Keep the same satisfactory level, if the answer it's at the half of the number of answers displayed
	 * Increase satisfactory level, if the chosen answer it's above the halft of the number of answerd displayed
	 */
	private calculateSatisfactoryLevel() {
		if (this.answerIndex == -1) {
			return;
		}
		var localAnswerIndex = this.answerIndex - this.streamLevel;
		var half = (this.moduleSettings.answersDisplayed - 1) / 2;
		if (localAnswerIndex < half) {
			this.satisfactoryLevel = 0;
		} else if (localAnswerIndex > half) {
			this.satisfactoryLevel = 2;
		}
		if (Math.floor(half) == localAnswerIndex) {
			this.satisfactoryLevel = 1;
		}
	}

	/**
	 * Will load the video based on the videoName received; and set the waiting variable to false
	 * @param {String} videoName - the name of the video
	 */
	private loadVideo(videoName: string) {
		this.resetSubtitles();
		this.currentSubtitles = this.moduleData.subtitles[videoName];
		this.mainVideoElement.nativeElement.src = this.getVideoSource(videoName);
		this.mainVideoElement.nativeElement.play();
		setTimeout(() => {
			this.waiting = false;
		}, 150);
	}

	/**
	 * Will load the narator video based on the videoName received;
	 * @param {String} videoName - the name of the video
	 */
	private loadNaratorVideo() {
		var videoName = (this.quizzLevel + 1) + "N";
		this.resetSubtitles();
		this.currentSubtitles = this.moduleData.subtitles[videoName];
		this.naratorVideoElement.nativeElement.src = this.getVideoSource(videoName);
		this.naratorVideoElement.nativeElement.play();
	}

	/**
	 * Handler for time update on narator video
	 */
	naratorVideoTimeUpdate() {
		var currentTime = this.formatSecondsAsTime(this.naratorVideoElement.nativeElement.currentTime);
		this.videoTimeUpdate(currentTime);
	}

	/**
	 * Handler for time update on main video
	 */
	mainVideoTimeUpdate() {
		var currentTime = this.formatSecondsAsTime(this.mainVideoElement.nativeElement.currentTime);
		this.videoTimeUpdate(currentTime);
	}

	/**
	 * Handler for time update on video;
	 * Will display the associated subtitle for the current time if subtitles are enabled;
	 * @param {String} currentTime - the current time of the video
	 */
	private videoTimeUpdate(currentTime) {
		if (this.subtitlesEnabled == false || (this.currentSubtitleIndex == this.currentSubtitles.length)) {
			return;
		}
		if (currentTime > this.currentSubtitles[this.currentSubtitleIndex].start) {
			if (this.currentSubtitleText == "") {
				this.currentSubtitleText = this.currentSubtitles[this.currentSubtitleIndex].text_1;
			}
			if (currentTime > this.currentSubtitles[this.currentSubtitleIndex].end) {
				this.currentSubtitleIndex++;
				this.currentSubtitleText = "";
			}
		}
	}

	/**
	 * Will reset the subtitle index and text
	 */
	private resetSubtitles() {
		this.currentSubtitleIndex  	= 0;
		this.currentSubtitleText 	= "";
	}

	/**
	 * Handler for when narator video ended;
	 */
	naratorVideoEnded() {
		this.initiateNextStep();
	}

	/**
	 * Will return the full path to a video;
	 * @param {String} videoName - the name of the video
	 */
	private getVideoSource(videoName: string) : string {
		var subtitlesOn = false;
		if (subtitlesOn) {
			videoName = videoName + "ST";
		}
		return this.modulePath + "/video/" + videoName + ".mp4";
	}

	/**
	 * Handler for when video has ended;
	 * Will calculate the new stream level;
	 * Will call the initiating of the next step
	 * Will set the waiting video
	 */
	mainVideoEnded() {
		this.calculateStreamLevel();
		this.initiateNextStep();
	}

	/**
	 * Setting the waiting video based on the setting
	 */
	private setWaitingVideo() {
		var videoName = this.moduleSettings.waitingVideoName;
		var waitingVideosArray = this.moduleSettings.waitingVideoOverrides;
		for (let waitingVideoObject of waitingVideosArray) {
			if (waitingVideoObject.steps.indexOf(this.quizzLevel) > - 1) {
				videoName = waitingVideoObject.filename;
			}
		}
		this.waitingVideoSrc = this.getVideoSource(videoName);
	}

	/**
	 * Will calculate the new stream level based on the answer chosen;
	 */
	private calculateStreamLevel() {
		var localAnswerIndex = this.answerIndex - this.streamLevel;
		var half = (this.moduleSettings.answersDisplayed - 1) / 2;
		if (localAnswerIndex < half) {
			if (this.streamLevel > 0) {
				this.streamLevel--;
			}
		} else if (localAnswerIndex > half) {
			if (this.streamLevel != (this.moduleSettings.answersAvailable - this.moduleSettings.answersDisplayed)) {
				this.streamLevel++;
			}
		}
	}

	/**
	 * Will repeat last step (playing last video + narator if it's the case)
	 */
	repeatLastStep() {
		if (this.quizzLevel > 0) {
			this.repeating = true;
			this.waiting = false;
			this.mainVideoElement.nativeElement.play();
		}
	}

	toggleReadingMode() {
		this.readingAloud = ! this.readingAloud;
	}

	/**
	 * Disables interaction with the quizz
	 */
	private disableQuizz() {

	}

	/**
	 * Enables interaction with the quizz
	 */
	private enableQuizz() {

	}

	/**
	 * Ends the quizz and displays the results;
	 * Called either when quizz steps ends, or if quizz was dropped (too low level)
	 */
	private displayResults() {
		if (this.moduleSettings.resultsAudio) {
			this.guideAudioElement.nativeElement.src = this.getAudioSource("narrator_conclusion");
			this.guideAudioElement.nativeElement.play();
		}
		this.stage = "RESULTS";
		this.quizzResultsPercentage = this.quizzPoints / ((this.moduleSettings.answersAvailable - 1) * this.stepsLength) * 100;
	}


	private formatSecondsAsTime(secs) : string {
		let hr  = Math.floor(secs / 3600);
		let min:any = Math.floor((secs - (hr * 3600))/60);
		let sec:any = Math.floor(secs - (hr * 3600) -  (min * 60));

		if (min < 10){
			min = "0" + min;
		}
		if (sec < 10){
			sec  = "0" + sec;
		}

		return min + ':' + sec;
	}
}