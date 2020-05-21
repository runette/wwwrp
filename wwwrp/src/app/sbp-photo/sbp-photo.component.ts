
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {UserService} from '../auth-service.service';
import {GoogleDriveService} from '../google-drive.service';
import {DomSanitizer} from '@angular/platform-browser';
import exifr from 'exifr';
import {SbpCategoriesService} from '../sbp-categories.service';
import {map, catchError} from 'rxjs/operators';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {BasicProfile, uFile, GoogleUser, DriveFile} from 'src/typings';

@Component({
  selector: 'app-sbp-photo',
  templateUrl: './sbp-photo.component.html',
  styleUrls: ['./sbp-photo.component.scss']
})
export class SbpPhotoComponent implements OnInit {

  profile: BasicProfile;
  files: uFile[]= [];
  filelist: FileList;
  columns = 4;
  size: 'xs' | 's' | 'm' | 'l';

  constructor(private user: UserService, 
              public drive : GoogleDriveService, 
              private sanitizer: DomSanitizer,
              public categories: SbpCategoriesService,
              private cd : ChangeDetectorRef,
              breakpointObserver: BreakpointObserver
              ) {
    user.user$.subscribe( user => this.onLogin(user))
    drive.init$.subscribe( () => this.onInit())
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
    ]).subscribe(result => {
      if (result.matches) {
        if (result.breakpoints["(max-width: 599.99px)"]) {this.columns = 2; this.size="xs"}
        if (result.breakpoints["(min-width: 600px) and (max-width: 959.99px)"]) {this.columns = 3;this.size = "s"}
        if(result.breakpoints["(min-width: 960px) and (max-width: 1279.99px)"]) {this.columns = 4; this.size = "m"}
        if (result.breakpoints["(min-width: 1280px) and (max-width: 1919.99px)"]) {this.columns = 4;this.size = 'l'}
      }
    });
   }

  ngOnInit(): void {
    if (! this.user.isSignedIn) {
      this.user.signIn();
    } else {
      this.profile = this.user.user.getBasicProfile();
    }
  }


  onLogin(user: GoogleUser) {
    this.profile = user.getBasicProfile();
    this.drive.init()
  };

  onInit() {
    if (this.drive.apiReady) {
      this.drive.listFolders();
      this.drive.listSharedFolder();
    }
  }

  async onFileChanged(event) {
    this.filelist = event.target.files;
    for (let i=0; i<event.target.files.length; i++) {
      let thisFile: uFile = {
        file: event.target.files[i] as File,
        inProgress: false,
        progress: 0,
        progressMode: 'indeterminate',
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(event.target.files[i])),
      }
      await this.processFile(thisFile);
      this.files.push(thisFile);
    };
  };

  onClick(){
    this.files.forEach( file => {
      file.inProgress = true;
      this.uploadFile(file);
    })
  }

  imgClick(index: number) {
    this.files.splice(index, 1);
    this.filelist = new FileList();
  }

  onCategoryRemove(fileIndex: number, categoryIndex: number) {
    this.files[fileIndex].categories.splice(categoryIndex, 1);
  }

  addCat(fileIndex: number, category: DriveFile) {
    this.files[fileIndex].categories.push(category.name);
  }

  uploadFile(file: uFile) {
    file.description =`Photo taken : ${file.createDate?file.createDate.toUTCString():""}. Uploaded by ${this.user.user.getBasicProfile().getName()} on ${new Date(Date.now()).toUTCString()}. Licensed by ${this.user.user.getBasicProfile().getName()} under CC BY-NC 4.0 terms.`;
    this.drive.upload(file).pipe(  
      map(event => {
        switch (event.status) {
        case  "Uploading" :
          file.progressMode = 'determinate';
          file.progress = Math.round((event.progressNumber.current / event.progressNumber.end) * 100);
          this.cd.detectChanges();
          break;
        case "Done":
          let i = this.files.findIndex(item => item == file);
          this.files.splice(i, 1);
          this.cd.detectChanges();
          this.filelist = new FileList();
          break;
        };
        return `${file.file.name} : ${event.status}`
      },
      catchError(error => {
        console.log(error);
        return `${file.file.name} upload failed. ${error}`
      })
      )
    ).subscribe(msg => {
      if (msg) console.log(msg);
    });
  };


  async processFile(file: uFile){
    file.categories = [];
    //let latlng= await exifr.gps(file.file);
    let data = await exifr.parse(file.file, {pick:['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal']})
    if (data.latitude) {
      file.location = [data.longitude, data.latitude];
      let nearest = this.categories.getNearest(file.location);
      if (nearest && nearest.distance < 30) 
      {
        file.categories.push(nearest.category)
      } else {
        file.categories.push('Loose Finds');
      };
    } else {
      file.categories.push('Loose Finds');
    };
    file.createDate = new Date(data.DateTimeOriginal)
  }
}


