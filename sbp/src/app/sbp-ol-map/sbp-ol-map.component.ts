import {Component, OnInit, NgZone, AfterViewInit, Output, EventEmitter } from '@angular/core';
import {View, Feature, Map } from 'ol';
import { MultiPoint} from 'ol/geom';
import {Style, Circle, Fill, Stroke, RegularShape, Text} from 'ol/style';
import {Vector, Cluster} from 'ol/source';
import {WFS} from 'ol/format';
import { ScaleLine, defaults as DefaultControls} from 'ol/control';
import {OpenSpaceOL6, DEFAULT_LAYERS, OpenSpaceLogoControl} from './openspace-ol6';
import {ColorLike} from 'ol/colorlike';
import {Coordinate} from 'ol/coordinate';
import proj4 from 'proj4';
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import {register}  from 'ol/proj/proj4';
import {get as GetProjection} from 'ol/proj'
import {Extent} from 'ol/extent';
import {SbpCategoriesService} from '../sbp-categories.service'

@Component({
  selector: 'app-sbp-ol-map',
  templateUrl: './sbp-ol-map.component.html',
  styleUrls: ['./sbp-ol-map.component.scss']
})
export class SbpOlMapComponent implements OnInit, AfterViewInit {

  center: Coordinate = [636000, 160000];
  view: View;
  projection: Projection;
  extent: Extent  = [0, 0, 700000, 1300000];
  Map: Map;
  @Output() mapReady = new EventEmitter;

  constructor(private zone: NgZone, public categories: SbpCategoriesService) { }

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
    proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
        '+x_0=400000 +y_0=-100000 +ellps=airy ' +
        '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
        '+units=m +no_defs');
    register(proj4)
    this.projection = GetProjection('EPSG:27700');
    this.projection.setExtent(this.extent);
    this.view = new View({
      center: this.center,
      zoom: 8.5,
      projection: this.projection,
    });

    const openSpaceOL6 = new OpenSpaceOL6('8F1133505AF96B41E0530C6CA40A53A6', document.URL, DEFAULT_LAYERS),
      swbayFeatures = new Vector({
        attributions:'Data &copy NAS <a href="privacy.html" target="_blank">End-User Agreement</a>',
        format: new WFS({
        }),
        url: 'https://swbayproject.com/qgisserver?MAP=/var/qgis/swbay_server.qgs&service=WFS&version=1.1.0&request=GetFeature&typename=wrecks_in_project_inventory'
      }),
      detailFeatures = new Vector({
        attributions:'Data &copy NAS <a href="privacy.html" target="_blank">End-User Agreement</a>',
        format: new WFS({
        }),
        url: 'https://swbayproject.com/qgisserver?MAP=/var/qgis/swbay_server.qgs&service=WFS&version=1.1.0&request=GetFeature&typename=all_data_points'
      }),
      wreckFeatures = new Vector({
        attributions:'Contains public sector information, licensed under the Open Government Licence v3.0,'+
        ' from UK Hydrographic Office 2019. Some data &copy <a href="wrecksite.eu” target="_blank">wrecksite.eu</a>',
        format: new WFS({
        }),
        url: 'https://swbayproject.com/qgisserver?MAP=/var/qgis/swbay_server.qgs&service=WFS&version=1.1.0&request=GetFeature&typename=wrecks_consolidated'
      }),
      restrictionFeatures = new Vector({
        attributions:'Contains public sector information, licensed under the Open Government Licence v3.0,'+
        ' from UK Hydrographic Office 2019. Some data &copy <a href="wrecksite.eu” target="_blank">wrecksite.eu</a>',
        format: new WFS({
        }),
        url: 'https://swbayproject.com/qgisserver?MAP=/var/qgis/swbay_server.qgs&service=WFS&version=1.1.0&request=GetFeature&typename=restriction'
      }),
      photoFeatures = new Vector({
        attributions:'Data &copy Contributor CC BY-NC 4.0</a>',
        format: new WFS({
        }),
        url: 'https://swbayproject.com/qgisserver?MAP=/var/qgis/swbay_server.qgs&service=WFS&version=1.1.0&request=GetFeature&typename=all_data_points'
      }),
      osLayer = openSpaceOL6.getLayer(),
      swbayLayer = new VectorLayer({
        source: swbayFeatures,
        style: this.circleStyle,
        maxResolution:25,
      }),
      wrecksLayer = new VectorLayer({
        source: wreckFeatures,
        style: this.wreckStyle,
        maxResolution:25,
      }),
      restrictionLayer = new VectorLayer({
        source: restrictionFeatures,
        style: new Style({
          stroke: new Stroke({
            color: 'blue',
            width: 3
          }),
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.1)'
          }),
          text: new Text({
            text: "Wildlife Protection Area",
            fill: new Fill({
              color: 'blue',
            }),
            offsetY:0,
            stroke: new Stroke({
              color:'#ffffff',
              width:3
            }),
          }),
        }),
        maxResolution:25,
      }),
      detailLayer= new VectorLayer({
        source: detailFeatures,
        style: this.detailStyle,
        maxResolution: 5,
      }),
      clusterLayer = new VectorLayer({
          source: new Cluster({
            distance:400,
            source: swbayFeatures,
            geometryFunction: function(feature) {
              let point = feature.getGeometry() as MultiPoint
              return point.getPoint(0);
            },
          }),
          style: this.circleStyle,
          minResolution:25,
      }),
      fixedLayer = new VectorLayer({
        source: new Vector({
          features: [new Feature({
            geometry : new MultiPoint([[635474, 157480]]),
            name: "sbbot",
            description: "Accomodation"
          })]
        }),
        style : new Style({
              image: new RegularShape({
                radius: 10,
                points: 3,
                angle: Math.PI,
                stroke: new Stroke({
                  width: 2,
                  color: '#ff0000'
                }),
                fill: new Fill({
                  color: '#ff9191',
                })
              }),
              text: new Text({
                text: "sbbot",
                fill: new Fill({
                  color: '#ff0000',
                }),
                offsetY:-15,
                stroke: new Stroke({
                  color:'#ffffff',
                  width:3
                }),
              }),
            }),
        maxResolution: 50,
      }),
      layers = [
        osLayer,
        detailLayer,
        swbayLayer,
        wrecksLayer,
        clusterLayer,
        fixedLayer,
        restrictionLayer,
      ];
      swbayLayer.set('clickable',true);
      wrecksLayer.set('clickable', true);
      fixedLayer.set('clickable', true);
      //restrictionLayer.set('clickable', true);
      this.categories.setLayer(swbayFeatures)
    this.Map = new Map({
      layers: layers,
      target: 'map',
      pixelRatio: pixelRatio,
      view: this.view,
      controls: DefaultControls().extend([
        new ScaleLine({}),
        new OpenSpaceLogoControl({ className: 'openspaceol6-openspace-logo' })
      ])
    });
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
