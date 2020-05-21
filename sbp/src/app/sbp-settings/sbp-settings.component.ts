import { Component, OnInit } from '@angular/core';
import { NavigatorExtended, WakeLockSentinel } from 'src/typings';

@Component({
  selector: 'app-sbp-settings',
  templateUrl: './sbp-settings.component.html',
  styleUrls: ['./sbp-settings.component.scss']
})
export class SbpSettingsComponent implements OnInit {

  wlStatus: string = 'Off';

  constructor() { }

  wakeSentinel: WakeLockSentinel = null;

  ngOnInit(): void {
  }

  public async wakelock()  {
    if (! this.wakeSentinel) {
      try {
        this.wakeSentinel = await (navigator as NavigatorExtended).wakeLock.request('screen');
        this.wakeSentinel.addEventListener('release', () => {
          console.info('Wake Lock was released');
          this.wlStatus = "Off";
          this.wakeSentinel = null;
        });
        console.info('Wake Lock is active');
        this.wlStatus = "Active"
      } catch (err) {
        console.info(`Wake Loke not available : ${err.name}, ${err.message}`);
        this.wlStatus = err.message;
      }
    } else {
      await this.wakeSentinel.release();
      this.wakeSentinel = null;
    }
  };

    // const handleVisibilityChange = () => {
    //   let element = document.fullscreenElement;
    //   if (this.preferences.wakeLock && element) {requestWakeLock()}
    // };
    // document.addEventListener('fullscreenchange', handleVisibilityChange);
    // };

}
