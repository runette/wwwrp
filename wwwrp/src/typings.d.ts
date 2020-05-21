///<reference types = 'gapi.auth2' />
///<reference types= 'gapi' />
///<reference types="gapi.client.drive" />

import {Coordinate} from 'ol/coordinate';
import {SafeUrl} from '@angular/platform-browser';

interface WakeLock {
    request(type: string): Promise<WakeLockSentinel>;
}

interface WakeLockSentinel {
    release(): Promise<void>;
    readonly onrelease: EventHandlerNonNull;
    readonly WakeLocktype: WakeLockType;
    addEventListener(event:string, callback: EventListenerOrEventListenerObject, options? : any );
    removeEventListener(event:string, callback: EventListenerOrEventListenerObject, options? : any );
}

type WakeLockType = 'screen' | null;

interface NavigatorExtended extends Navigator {
    // Only available in a secure context.
    readonly wakeLock: WakeLock;
}

type GoogleUser = gapi.auth2.GoogleUser;
type BasicProfile = gapi.auth2.BasicProfile;
type DriveFileList = gapi.client.drive.FileList;
type DriveFile = gapi.client.drive.File;
type GapiRequest<T> = gapi.client.Request<T>;
type GoogleAuth = gapi.auth2.GoogleAuth
type FilesResource = gapi.client.drive.FilesResource

interface uFile {
    file: File;
    inProgress: boolean;
    progress: number;
    location?: Coordinate;
    categories?: string[];
    url: SafeUrl;
    exif?: {}
    progressMode: 'determinate' | 'indeterminate';
    description?: string;
    createDate?: Date;
}