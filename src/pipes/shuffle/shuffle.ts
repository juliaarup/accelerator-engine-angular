import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
	name: 'shuffle',
})
export class ShufflePipe implements PipeTransform {

	transform(input: any) {
		return shuffle(input);
	}
}


export function shuffle (input: any): any {

	if (!Array.isArray(input)) {
		return input;
	}

	const copy = [...input];

	for (let i = copy.length; i; --i) {
		const j = Math.floor(Math.random() * i);
		const x = copy[i - 1];
		copy[i - 1] = copy[j];
		copy[j] = x;
	}

	return copy;
}