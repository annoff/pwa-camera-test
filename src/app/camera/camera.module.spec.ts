import { CameraModule } from './camera.module';

describe('CameraModule', () => {
  let camModule: CameraModule;

  beforeEach(() => {
    camModule = new CameraModule();
  });

  it('should create an instance', () => {
    expect(camModule).toBeTruthy();
  });
});
