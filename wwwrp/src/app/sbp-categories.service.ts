import { Injectable } from '@angular/core';
import VectorSource  from 'ol/source/Vector';
import {Coordinate} from 'ol/coordinate';
import {getDistance} from 'ol/sphere';
import { DriveFile } from 'src/typings';
import {fromLonLat, toLonLat} from 'ol/proj';

interface Nearest{
  category: string;
  distance: number;
}

@Injectable({
  providedIn: 'root'
})
export class SbpCategoriesService {

  layer: VectorSource;
  categories: DriveFile[];


  constructor() { }

  setLayer(layer: VectorSource) {
    this.layer = layer;
  }

  getNearest(coord:Coordinate): Nearest{
    if (this.layer) {
    let feature = this.layer.getClosestFeatureToCoordinate(fromLonLat(coord, 'EPSG:27700'));
    return {
      category: feature.get('sb_no'),
      distance: getDistance(coord,toLonLat(feature.getGeometry().getClosestPoint(coord),'EPSG:27700'))
    };
  } else {
    return null;
  }
  }
}
