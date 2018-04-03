import { NgModule } from '@angular/core';
import { KeysPipe } from './keys/keys';
import { ShufflePipe } from './shuffle/shuffle';
@NgModule({
	declarations: [KeysPipe,
    ShufflePipe],
	imports: [],
	exports: [KeysPipe,
    ShufflePipe]
})
export class PipesModule {}
