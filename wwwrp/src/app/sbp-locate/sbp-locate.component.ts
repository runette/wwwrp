import { Component, OnInit, Input } from '@angular/core';
import { Geolocation, Map, Feature} from 'ol';
import {Point} from 'ol/geom';
import Control from 'ol/control/Control';
import {Options} from 'ol/control/Control';
import VectorLayer from 'ol/layer/Vector';
import {Vector} from 'ol/source';
import {Style, Circle, Fill, Stroke} from 'ol/style';



@Component({
  selector: 'app-sbp-locate',
  templateUrl: './sbp-locate.component.html',
  styleUrls: ['./sbp-locate.component.scss']
})
export class SbpLocateComponent implements OnInit {

  options: LocateOptions = {
      zoomTo: 14,
      moveBehaviour: 'change'
  }

  _map: Map;
  @Input() set Map(map: Map){
    if (map) {
      this._map = map;
      this.locate = new locateControl(this.options, map)
    }
  }
  get Map() { return this._map};

  locate: locateControl;


  constructor() { }

  ngOnInit(): void {
  }

}

export interface LocateOptions extends Options{
  zoomTo?: number;
  moveBehaviour?: 'none' | 'change'
}

export type LocateControlStatus = 'off' |  "on" | 'moved'

export class locateControl extends Control {
  button: HTMLInputElement;
  geolocation: Geolocation;
  geoLayer: VectorLayer;
  accuracyFeature: Feature;
  positionFeature: Feature;
  map: Map;
  options: LocateOptions;
  status: LocateControlStatus;

  
  constructor(options: LocateOptions, map: Map) {
    let button = document.createElement('input');
    button.type= "checkbox";
    button.id= "locate";
    button.classList.add("control-button");
    let label = document.createElement('label');
    label.htmlFor="locate";
    label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" style="fill:#ffffff" /></svg>';

    let element = document.createElement('div');
    element.className = 'locate ol-unselectable ol-control';
    element.appendChild(button);
    element.appendChild(label);
    options.element = element;
    super(options);
    button.addEventListener('click', e => this.handleLocate(e));
    this.options = options;
    this.button = button;
    this.status = 'off';
    this.geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true
      },
      projection: map.getView().getProjection()
    });

    this.accuracyFeature = new Feature();
    this.geolocation.on('change:accuracyGeometry', e => {
      this.accuracyFeature.setGeometry(e.target.getAccuracyGeometry());
    });
    this.accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
    this.positionFeature = new Feature();
    this.geolocation.on('change:position', e => {
      let coordinates = e.target.getPosition();
      this.positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
      let view = this.map.getView();
      if (this.status === 'on' && this.options.moveBehaviour == "change") {
        view.setCenter(coordinates);
        view.setZoom(this.options.zoomTo);
      }
    });
    this.geoLayer = new VectorLayer({
      source: new Vector({
        features: [this.accuracyFeature, this.positionFeature]
      })
    });
    map.addControl(this);
    map.addLayer(this.geoLayer);
    this.map =map;
    this.map.getView().addEventListener('change', e => {
      if (this.status == "on") {
        options.element.classList.add('locate-moved')
        this.status = 'moved';
      }
    })
  }

  public handleLocate(event): void{
    if (this.status == 'off') {
      this.status = 'on';
      this.geolocation.setTracking(true);
      this.positionFeature.setStyle(
        new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({
              color: '#3b33cc'
            }),
            stroke: new Stroke({
              color:'#ffffff',
              width: 2
            })
          })
        })
      )
    }
    else if (this.status == 'on') {
      this.status = 'off';
      this.geolocation.setTracking(false);
      this.positionFeature.setStyle(
        null
      );
      this.options.element.classList.remove('locate-moved');
    }
    else {
      this.status = 'on';
      this.options.element.classList.remove('locate-moved');
      this.button.checked = true;
      let view = this.map.getView();
      if (this.options.moveBehaviour == "change") {
        view.setCenter(this.geolocation.getPosition());
        view.setZoom(this.options.zoomTo);
        this.accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
      }
    }
  };
}

