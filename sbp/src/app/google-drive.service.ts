import { Injectable, NgZone,EventEmitter, ApplicationRef } from '@angular/core';
import {UserService} from './auth-service.service';
import {HttpClient} from '@angular/common/http'
import { Observable, Subscriber } from 'rxjs';
import {mergeMap, merge} from 'rxjs/operators';
import {ResumableUploadToGoogleDrive} from './resumableupload_js.js';
import {SbpCategoriesService} from './sbp-categories.service';
import { DriveFile, DriveFileList, FilesResource, GapiRequest, uFile } from 'src/typings';
declare var gapi;

export interface ResumableUploadStatus{
  status?: string;
  progressNumber?: { current: number, end: number },
  progressByte?: {
              current: number,
              end: number,
              total: number
            }
}


const GAPI_CLIENT_CONFIG = {
  client_id: "848973070966-fo8mp6j9olhvd1kkkalqgaufipuk80ft.apps.googleusercontent.com",
  discoveryDocs: ["https://content.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
  ].join(" ")
};

const SHARED_FOLDER = "1A2nxI5JJFZeGEz_AsUsxaCOX1g49v3s3";


const API_URL: string = "https://www.googleapis.com/drive/v3/";
const UPLOAD_URL: string = "https://www.googleapis.com/upload/drive/v3/files"

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {

  folders: DriveFile[];
  apiReady: boolean =false;
  sharedFolder: boolean = true;
  NasFolder: DriveFile[];

  init$: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private user: UserService,
              private zone: NgZone, 
              private ref: ApplicationRef,
              private http: HttpClient,
              private categories: SbpCategoriesService,
              ) {}

  init(): void {
    this.loadClient().then(
      result => {
        return this.initClient()
      },
      err => this.apiReady = false
    ).then(
      result => {
        this.apiReady = true;
        this.init$.emit(true);
      }, 
      err => this.apiReady = false
    )
  }

  list(query: string): GapiRequest<any> {
    let drive: FilesResource = gapi.client.drive.files;
    return drive.list({
          oauth_token: this.user.getToken(),
          q: query 
        })
      }

  listFolders() {
    return this.zone.run(() =>this.list("mimeType = 'application/vnd.google-apps.folder'").then(res => {
      this.folders = (res.result as DriveFileList).files;
      this.sharedFolder = false;
      this.folders.forEach( item => {
        if ((item as DriveFile).id == SHARED_FOLDER) this.sharedFolder = true;
      });
      this.ref.tick();
    }))
  }

  listSharedFolder() {
    return this.zone.run( () => {
      this.list(`'${SHARED_FOLDER}' in parents and mimeType = 'application/vnd.google-apps.folder'`).then( res => {
        this.NasFolder = (res.result as DriveFileList).files;
        this.ref.tick();
        this.categories.categories = []
        this.NasFolder.forEach(item => {
          this.categories.categories.push(item)
        })
      })
    })

  }

  public upload2(file: File): Observable<any>{
    let body = {}
    return this.http
      .post(UPLOAD_URL, body, {
        headers: {
          'X-Upload-Content-Type': file.type,
          'X-Upload-Content-Length': file.size.toString(),
          'content-type': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${this.user.getToken()}`
        },
        params: {
          'uploadType':'resumable'
        },
        observe: 'response',
      })
      .pipe(mergeMap(response => 
        this.http.put(response.headers.get('location'), {}, {
          headers: {
            'content-type': file.type
          },
          params: {
            'uploadType':'resumable'
          },
          reportProgress: true,  
          observe: 'events'  
        } )
      )); 
    }

  upload(fileref: uFile): Observable<ResumableUploadStatus>{{
    const file: File = fileref.file;
    let parents = [];
    for (let category of fileref.categories) {
      parents.push((this.categories.categories.find(item => item.name == category)as DriveFile).id);
    }
    const description = fileref.description;
    return Observable.create(
      (sub: Subscriber<ArrayBuffer>): void => {
        const r = new FileReader;
        // if success
        r.onload = ev => {
            sub.next((ev.target.result as ArrayBuffer));
        };
        // if failed
        r.onerror = (ev): void => {
            sub.error(ev);
        };
        r.readAsArrayBuffer(file);
      })
      .pipe(mergeMap(f => {
        const resource = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileBuffer: f,
          accessToken: this.user.getToken(),
          chunkSize: 512 * 1024,
          folderId: parents,
          description: description
          };
          return Observable.create((observer: Subscriber<ResumableUploadStatus>): void => new ResumableUploadToGoogleDrive().Do(resource, (res, err) => {
            if (err) observer.error(err)
            else observer.next(res);
          }));
      }));
    }
  }


  loadClient(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.zone.run(() => {
        gapi.load('client', {
          callback: resolve,
          onerror: reject,
          timeout: 1000, // 5 seconds.
          ontimeout: reject
        });
      });
    });
  }

  initClient(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.zone.run(() => {
          gapi.client.init(GAPI_CLIENT_CONFIG).then(resolve, reject);
      });
  });
}
}
