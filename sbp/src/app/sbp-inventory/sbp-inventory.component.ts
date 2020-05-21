import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { ActivatedRoute } from "@angular/router";



@Component({
  selector: 'app-sbp-inventory',
  templateUrl: './sbp-inventory.component.html',
  styleUrls: ['./sbp-inventory.component.scss']
})
export class SbpInventoryComponent implements OnInit {
  safeUrl: SafeResourceUrl ;
  fullscreen: boolean = false;

  @Input() set Url(url: string) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    this.cd.detectChanges();
  }

  constructor(private cd: ChangeDetectorRef,  private sanitizer: DomSanitizer, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://docs.google.com/document/d/e/2PACX-1vTdWsbN8T_3twIGgSHYavRHllyCHRF8d5h4eai5wjU97ODLBQKIdpKEB7AKkgoeHNs3qS6a7aV8CE4A/pub?embedded=true');
    if (this.route.snapshot.url.length != 0 && this.route.snapshot.url[0].path == 'inventory') this.fullscreen = true ;
  }

}
