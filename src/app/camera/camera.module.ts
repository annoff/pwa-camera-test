import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptureComponent } from './capture/capture.component';

@NgModule({
  declarations: [CaptureComponent],
  imports: [
    CommonModule
  ],
  exports: [CaptureComponent]
})
export class CameraModule { }
