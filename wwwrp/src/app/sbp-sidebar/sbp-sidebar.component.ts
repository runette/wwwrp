import { Component, OnInit, Input } from '@angular/core';
import {SidebarOptions, Sidebar} from './ol5-sidebar-v2'
import {Map} from 'ol';

@Component({
  selector: 'app-sbp-sidebar',
  templateUrl: './sbp-sidebar.component.html',
  styleUrls: ['./sbp-sidebar.component.scss']
})
export class SbpSidebarComponent implements OnInit {

  options: SidebarOptions = {
    element: null,
    position: 'right'
  }

  Sidebar: Sidebar;

  inventoryUrl: string;

  _map: Map;
  @Input() set Map(map: Map){
    this.options.element = document.getElementById('sidebar');
    this._map = map;
    this.Sidebar = new Sidebar(this.options);
    map.addControl(this.Sidebar);
  }
  get Map() { return this._map};
  

  constructor() { }

  ngOnInit(): void {
  }

  onMapReady(map: Map) {
    this.Map = map;
  }

  onUrl(url: string) {
    this.inventoryUrl = url;
    this.Sidebar.open('inventory');
  }

}
