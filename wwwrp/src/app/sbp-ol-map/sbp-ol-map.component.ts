import {Component, OnInit, NgZone, AfterViewInit, Output, EventEmitter } from '@angular/core';
import {View, Feature, Map } from 'ol';
import { MultiPoint} from 'ol/geom';
import {Style, Circle, Fill, Stroke, RegularShape, Text} from 'ol/style';
import {Vector, Cluster} from 'ol/source';
import {WFS} from 'ol/format';
import { Control,ScaleLine, defaults as DefaultControls} from 'ol/control';
import {ColorLike} from 'ol/colorlike';
import {Coordinate} from 'ol/coordinate';
import proj4 from 'proj4';
import VectorLayer from 'ol/layer/Vector';
import OSM, {ATTRIBUTION} from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Projection from 'ol/proj/Projection';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import {toSize} from 'ol/size';

import {register}  from 'ol/proj/proj4';
import {get as GetProjection} from 'ol/proj'
import {Extent} from 'ol/extent';
import {SbpCategoriesService} from '../sbp-categories.service'
import {MagDev} from './mag-dev';
import { format } from 'path';

@Component({
  selector: 'app-sbp-ol-map',
  templateUrl: './sbp-ol-map.component.html',
  styleUrls: ['./sbp-ol-map.component.scss']
})
export class SbpOlMapComponent implements OnInit, AfterViewInit {

  center: Coordinate = [-483281,6904172];
  view: View;
  Map: Map;
  @Output() mapReady = new EventEmitter;

  constructor(private zone: NgZone, public categories: SbpCategoriesService, private compass: MagDev) { }

  ngOnInit(): void {

  }

  ngAfterViewInit():void {
    if (! this.Map) {
      this.zone.runOutsideAngular(() => this.initMap())
    } else {
      //this.Map.setTarget('map');
    }
    setTimeout(()=>this.mapReady.emit(this.Map));
  }

  private initMap(): void{
    let size: number = screen.width;
    let pixelRatio: number = 1;
    if (size <= 768) {
      pixelRatio = 1
    }
    proj4.defs("EPSG:900913","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
    proj4.defs("EPSG:3857","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
    register(proj4)
    let projection = GetProjection('EPSG:3857');

    this.view = new View({
      center: this.center,
      zoom: 9.5,
      projection: projection
    });

    const osm = new TileLayer({
      source: new OSM({
      })
    });
    const seamarks = new TileLayer({
      source: new XYZ({
        url: 'http://t1.openseamap.org/seamark/{z}/{x}/{y}.png',
      })
    });
    const marineTraffic = new TileLayer({
      source: new XYZ({
        url: "https://tiles.marinetraffic.com/ais_helpers/shiptilesingle.aspx?output=png&sat=1&grouping=shiptype&tile_size=256&legends=1&zoom={z}&X={x}&Y={y}",
        tileSize: toSize(256), 
      })
    });
    const contours = new TileLayer({
      source: new TileWMS({
        url: "http://osm.franken.de:8080/geoserver/gwc/service/wms",
        params:{
          layers: ["gebco_2014"],
          'VERSION': '1.1.0',
        },
      }),
      opacity: 0.8,
    });
    const gebco = new TileLayer({
      source: new TileWMS({
        url: "http://wwwrp.swbayproject.com/qgisserver?MAP=/var/qgis/wwrp.qgs",
        params:{
          layers: ["gebco"],
          'VERSION': "1.3.0",
          format: "image/png",
        }
      }),
      opacity: 0.8
    });
    const layers=[
      osm,
      contours,   
      gebco,
      seamarks,
      marineTraffic,
    ];
    this.Map = new Map({
      layers: layers,
      target: 'map',
      pixelRatio: pixelRatio,
      view: this.view,
      controls: DefaultControls().extend([
        new ScaleLine({}),
        new OpenSpaceLogoControl({ className: 'openspaceol6-openspace-logo' })
      ]),
    });
    this.compass.map = this.Map;
    this.compass.refreshMagdev();
    this.Map.on('moveend', e =>{
      this.compass.refreshMagdev();
    })
  };

  private circleStyle(feature, resolution) {
    let text = "",
      radius = 10;
    if ( resolution <= 5.0 ) {
      text = feature.get('sb_no');
      radius = 5;
    };
    return new Style({
      image: new Circle({
        radius: radius,
        stroke: new Stroke({
          width: 2,
          color: '#ff0000'
        }),
        fill: new Fill({
          color: '#ff9191'
        })
      }),
      text: new Text({
        text: text,
        fill: new Fill({
          color: '#ff0000',
        }),
        offsetY:-10,
        stroke: new Stroke({
          color:'#ffffff',
          width:3
        }),
      })
    });
  };

  private wreckStyle(feature, resolution) {
    let name = feature.get('name');
    let text = name && ! name['xsi:nil'] ? feature.get('name') : '';
    let radius = 10;
    if ( resolution <= 5.0 ) {

      if (text === "") text = feature.get('wk_idn');
      radius = 4;
    }
    return new Style({
      image: new RegularShape({
        radius: radius,
        points: 3,
        stroke: new Stroke({
          width: 2,
          color: '#0000ff'
        }),
        fill: new Fill({
          color: '#0099ff',
        }),
      }),
      text: new Text({
        text: text,
        fill: new Fill({
          color: '#0000ff',
        }),
        offsetY:-10,
        stroke: new Stroke({
          color:'#ffffff',
          width:3
        }),
      })
    });
  };

  private  detailStyle(feature, resolution) {
    let desc = feature.get('desc_').toLowerCase();
    let color: ColorLike;
    if (desc.includes('stake') || desc.includes('post')) {
      color= "#fcba03";
    } else if (desc.includes('outline') || desc.includes('wreck')) {
      color= "#949494";
    } else if (desc.includes('timber')) {
      color="#019401"
    } else {
      color="#a8a000"
    }
    return new Style({
      image: new Circle({
        radius: 2,
        fill: new Fill({
          color: color,
        }),
      })
    })
  }
}

class OpenSpaceLogoControl extends Control{
  constructor(opt_options) {
      let options = opt_options || {};
      super(options);
      let image = document.createElement('img');
      image.src = 'https://openspace.ordnancesurvey.co.uk/osmapapi/img_versions/img_4.0.0/OS/poweredby_free.png';
      var element = document.createElement('div');
      // by default, the logo's position on the map is set by the OpenSpaceOL6-openspace-logo css in your .html/.css file
      element.className = options.className || 'OpenSpaceOL6-openspace-logo';
      element.className += ' ol-unselectable ol-control';
      element.appendChild(image);

      Control.call(this, {
      element: element,
      target: options.target
      });
  }
}
