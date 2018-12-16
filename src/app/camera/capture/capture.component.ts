import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';

import adapter from 'webrtc-adapter';

@Component({
    selector: 'cc-capture',
    templateUrl: './capture.component.html',
    styleUrls: ['./capture.component.scss']
})

export class CaptureComponent implements OnInit, AfterViewInit {

    @ViewChild('video')
    public videoRef: any;

    @ViewChild('canvas')
    public canvasRef: any;

    public captures: Array<any>;

    public captureDetails: string;

    private cameraDeviceIds: Array<string>;

    private currentMediaStream: MediaStream;

    private currentDeviceId: string;

    private captureWidth: number;

    private captureHeight: number;

    private streaming: boolean;

    public constructor() {
        this.captures = [];
        this.currentMediaStream = null;
    }

    public ngOnInit() { }

    public ngAfterViewInit() {

        navigator.mediaDevices.enumerateDevices()
            .then((di) => this.gotDevices(di)).then((r) => this.startCapture());
    }

    public startCapture() {

        if (!this.currentDeviceId) {
            this.currentDeviceId = this.getNextDeviceId();
        }

        console.log('Current Device Id:' + this.currentDeviceId);

        const constraints = {
            audio: false,
            video: {
                width: { min: 640, ideal: 1920, max: 3840 },
                height: { min: 480, ideal: 1080 , max: 2160 },
                // width: { exact: 3840 }, height: { exact: 2160 },
                deviceId: this.currentDeviceId ? { exact: this.currentDeviceId } : undefined
            }
        };

        // console.log(adapter.browserDetails.browser);
        // console.log(adapter.browserDetails.version);

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const pMediaStream = navigator.mediaDevices.getUserMedia(constraints);

            pMediaStream.then(stream => {
                const video = this.videoRef.nativeElement;
                const canvas = this.canvasRef.nativeElement;

                this.currentMediaStream = stream;

                video.addEventListener('canplay', () => {
                    if (!this.streaming) {
                      this.captureWidth = video.videoWidth;
                      this.captureHeight = video.videoHeight;

                      canvas.width = this.captureWidth;
                      canvas.height = this.captureHeight;

                      this.captureDetails = 'Resolution: ' + this.captureWidth + 'x' + this.captureHeight;
                      this.streaming = true;
                    }
                  }, false);

                video.srcObject = stream;
                video.play();
            }).catch((er) => {
                console.log(er);

                this.cameraDeviceIds = this.cameraDeviceIds.filter(el => el !== this.currentDeviceId);
                this.currentDeviceId = this.getNextDeviceId();

                this.startNextCamera();
            });
        }
    }

    public capture() {
        const video = this.videoRef.nativeElement;
        const canvas = this.canvasRef.nativeElement;

        console.log('Canvas dimensions:' + this.captureWidth + 'x' + this.captureHeight);

        const context = canvas.getContext('2d').drawImage(video, 0, 0, this.captureWidth, this.captureHeight);
        this.captures.push(canvas.toDataURL('image/png'));
    }

    public stopCapture() {
        const video = this.videoRef.nativeElement;

        this.captureDetails = null;
        this.streaming = false;

        if (this.currentMediaStream) {
            this.currentMediaStream.getVideoTracks().forEach(track => {
                track.stop();
            });

            this.currentMediaStream = null;
            video.srcObject = null;
        }
    }

    public startNextCamera() {
        if (this.currentMediaStream) {
            this.stopCapture();
        }

        this.currentDeviceId = this.getNextDeviceId();
        this.startCapture();
    }

    private gotDevices(deviceInfos) {
        this.cameraDeviceIds = [];

        for (let i = 0; i !== deviceInfos.length; ++i) {
            const deviceInfo = deviceInfos[i];
            const deviceId: string = deviceInfo.deviceId;
            const deviceLabel: string = deviceInfo.label;

            if (deviceInfo.kind === 'videoinput') {
                console.log('Device: ' + deviceLabel + '(' + deviceId + ')');

                this.currentDeviceId = deviceId;
                this.cameraDeviceIds.push(deviceId);
            }
        }
    }

    private getNextDeviceId(): string {

        let currentIndex = -1;

        if (this.cameraDeviceIds && this.cameraDeviceIds.length > 0) {
            if (this.currentDeviceId) {
                currentIndex = this.cameraDeviceIds.indexOf(this.currentDeviceId);
                if (currentIndex >= 0) {
                    if (currentIndex < this.cameraDeviceIds.length - 1) {
                        return this.cameraDeviceIds[currentIndex + 1];
                    }
                }
            }

            return this.cameraDeviceIds[0];
        }

        return null;
    }

    private handleError(error) {
        console.log('navigator.getUserMedia error: ', error);
    }
}

