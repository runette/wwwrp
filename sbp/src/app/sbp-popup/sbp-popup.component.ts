import { Component, OnInit, Input, Output, ChangeDetectorRef, SecurityContext, EventEmitter } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Map, Overlay, Feature } from 'ol';
import {Options} from 'ol/Overlay';
import OverlayPositioning from 'ol/OverlayPositioning';
import {Select} from 'ol/interaction';
import {Layer} from 'ol/layer';
import {Style, Circle, Fill, Stroke, Text} from 'ol/style';
import {Coordinate} from 'ol/coordinate';
import {Point, MultiPoint} from 'ol/geom';


@Component({
  selector: 'app-sbp-popup',
  templateUrl: './sbp-popup.component.html',
  styleUrls: ['./sbp-popup.component.scss']
})
export class SbpPopupComponent implements OnInit {

  Options: Options = {
    positioning: OverlayPositioning.TOP_CENTER,
  };

  safeContent: string;
  safeTitle: string;
  disabled: boolean;
  private inventoryUrl: string;

  private _map: Map;
  private popupOverlay: Overlay;
  private select: Select;

  @Output() Url: EventEmitter<string> = new EventEmitter<string>();

  @Input() set Map(map: Map){
    if (map) {
      this._map = map;
      this.Options.element = document.getElementById('popup');
      this.popupOverlay = new Overlay(this.Options)
      let layers: Layer[] = [];
      map.getLayers().forEach(layer => {
        if (layer.get('clickable')) layers.push(layer as Layer)
      })
      this.select = new Select({
        style: this.selectStyle,
        hitTolerance: 5,
        layers: layers
      });
      this.select.on('select', e => this.makePopup(e));
      map.addOverlay(this.popupOverlay);   
      map.addInteraction(this.select);
    }
  }
  get Map() { return this._map};


  constructor(private cd: ChangeDetectorRef,  private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  private selectStyle(feature, resolution) {
    return new Style({
      image: new Circle({
        radius: 10,
        stroke: new Stroke({
          width: 2,
          color: '#ff0000'
        }),
        fill: new Fill({
          color: '#ff0000'
        })
      }),
    });
  };

  private makePopup(e) {
    let feature: Feature = e.selected[0];
    let content: string;
    let title: string;
    let coords: Coordinate;
    if (feature) {
      let geo = feature.getGeometry();
      let geotype = geo.getType();
      if (geotype === 'MultiPoint') {
        coords=(geo as MultiPoint).getPoint(0).getCoordinates();
      } else {
        coords=(geo as Point).getCoordinates();
      }
      if (feature.get('sb_no') && ! feature.get('sb_no')['xsi:nil']) {
        let d_text = feature.get('dimensions') && !feature.get('dimensions')['xsi:nil']  ? `Details: ${feature.get('dimensions')}` : "";
        let length = feature.get('length') && ! feature.get('length')['xsi:nil'] ? `Length: ${feature.get('length')}m`: 'Length: ?m';
        let width = feature.get('width') && ! feature.get('width')['xsi:nil'] ? `: Width: ${feature.get('width')}m` : ': Width: ?m';
        let type = feature.get('type') && ! feature.get('type')['xsi:nil']? feature.get('type') : '';
        title= `<p>${feature.get('sb_no')}</p>`;
        content = `<p>Type : ${type['xsi:nil'] ? "" : type }</p><p>${length}${width}</p><p>${d_text['xsi:nil'] ? "" : d_text } </p>`;
      } else if (feature.get('wk_idn')) {
        let name = feature.get('name') && ! feature.get('name')['xsi:nil'] ?  `Wreck Name : ${feature.get('name')}` : '' ;
        let d_text = feature.get('description') ? feature.get('description') : '';
        title = `<p>${feature.get('wk_idn')}</p>`;
        content = `<p>${ name}</p><p>${d_text['xsi:nil'] ? "" : d_text }</p> `;
      } else {
        title = `<p>${feature.get('name')}</p>`
        content = `<p> Type : ${feature.get('description')}`;
      }
      if (feature.get('url') && ! feature.get('url')['xsi:nil']){
        this.inventoryUrl = feature.get('url');
        this.disabled = false;
      } else {
        this.disabled = true;
      }
      this.safeTitle = this.sanitizer.sanitize(SecurityContext.HTML, title);
      this.safeContent = this.sanitizer.sanitize(SecurityContext.HTML, content);
      this.popupOverlay.setPosition(coords);
      this.cd.detectChanges();
    }
  }

  closePopup(){
    this.popupOverlay.setPosition(undefined)
  }

  callInventory() {
    this.Url.emit(this.inventoryUrl);
  }
}
