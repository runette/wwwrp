import { Injectable, EventEmitter } from '@angular/core';
import {Observable, Observer} from 'rxjs';
import { GoogleUser, GoogleAuth } from 'src/typings';
declare var gapi: any;

let gapiClientConfig = {
  client_id: "848973070966-fo8mp6j9olhvd1kkkalqgaufipuk80ft.apps.googleusercontent.com",
  discoveryDocs: ["https://content.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
  ].join(" ")
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
    public user: GoogleUser;
    user$: EventEmitter<GoogleUser> = new EventEmitter<GoogleUser>();
    googleAuth: GoogleAuth;
    
    constructor(){ 
    }

    public getToken(): string {
      return this.user.getAuthResponse().access_token
    }

    get isSignedIn() :boolean { return this.user && this.user.isSignedIn()}
    
    public signIn(): void {
        this.loadGapiAuth()
            .subscribe((auth) => {
                auth.signIn().then(res => this.signInSuccessHandler(res));
            });
    }
    
    private signInSuccessHandler(res: GoogleUser) {
            this.user = res;
            this.user$.emit(res);
        }

      //   public getAuth(newInstance = false): Observable<GoogleAuth> {
      //     if (!this.googleAuth || newInstance) {
      //         return this.googleApi.onLoad()
      //             .pipe(mergeMap(() => this.loadGapiAuth()));
      //     }
      //     return of(this.googleAuth);
      // }
  
      private loadGapiAuth(): Observable<GoogleAuth> {
          return new Observable((observer: Observer<GoogleAuth>) => {
              gapi.load('auth2', () => {
                  gapi.auth2.init(gapiClientConfig).then((auth: GoogleAuth) => {
                      this.googleAuth = auth;
                      observer.next(auth);
                      observer.complete();
                  }).catch((err: any) => observer.error(err));
              });
          });
      }

}


