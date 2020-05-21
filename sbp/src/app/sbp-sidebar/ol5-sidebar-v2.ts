import {Map} from 'ol';
import {Control} from 'ol/control';
import {Options} from 'ol/control/Control'

export interface SidebarOptions extends Options {
        position: 'left' | 'right';
}

export class SBElement extends Element {
    _sidebar: Sidebar;
}

export class Sidebar extends Control {

    private _container: Element;
    private _tabitems: NodeListOf<SBElement>;
    private _panes: Element[];
    private _closeButtons: Element[];
    private classList;
    private _sidebar;
    private querySelector;


    constructor(opt_options: SidebarOptions) {

        let defaults: SidebarOptions = {
            element: null,
            position: 'left'
        };
        let i: number; 
        let child: Element;

        let options = Object.assign({}, defaults, opt_options);

        let element = options.element;

        super({
            element: element,
            target: options.target
        });

        // Attach .sidebar-left/right class
        element.classList.add('sidebar-' + options.position);

        // Find sidebar > div.sidebar-content
        for (i = element.children.length - 1; i >= 0; i--) {
            child = element.children[i];
            if (child.tagName === 'DIV' &&
                    child.classList.contains('sidebar-content')) {
                this._container = child;
            }
        }

        // Find sidebar ul.sidebar-tabs > li, sidebar .sidebar-tabs > ul > li
        this._tabitems = element.querySelectorAll('ul.sidebar-tabs > li, .sidebar-tabs > ul > li');
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            this._tabitems[i]._sidebar = this;
        }

        // Find sidebar > div.sidebar-content > div.sidebar-pane
        this._panes = [];
        this._closeButtons = [];
        for (i = this._container.children.length - 1; i >= 0; i--) {
            child = this._container.children[i];
            if (child.tagName == 'DIV' &&
                    child.classList.contains('sidebar-pane')) {
                this._panes.push(child);

                var closeButtons = child.querySelectorAll('.sidebar-close');
                for (var j = 0, len = closeButtons.length; j < len; j++) {
                    this._closeButtons.push(closeButtons[j]);
                }
            }
        }
    }

    /**
    * Set the map instance the control is associated with.
    * @param {ol.Map} map The map instance.
    */
    public setMap(map: Map): void {
        var i, child;

        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            var sub = child.querySelector('a');
            if (sub.hasAttribute('href') && sub.getAttribute('href').slice(0,1) == '#') {
                sub.onclick = this._onClick.bind(child);
            }
        }

        for (i = this._closeButtons.length - 1; i >= 0; i--) {
            child = this._closeButtons[i];
            child.onclick = this._onCloseClick.bind(this);
        }
    };

    public open(id: string): this {
        var i, child;

        // hide old active contents and show new content
        for (i = this._panes.length - 1; i >= 0; i--) {
            child = this._panes[i];
            if (child.id == id)
                child.classList.add('active');
            else if (child.classList.contains('active'))
                child.classList.remove('active');
        }

        // remove old active highlights and set new highlight
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            if (child.querySelector('a').hash == '#' + id)
                child.classList.add('active');
            else if (child.classList.contains('active'))
                child.classList.remove('active');
        }

        // open sidebar (if necessary)
        if (this.element.classList.contains('collapsed')) {
            this.element.classList.remove('collapsed');
        }

        return this;
    };

    public close(): this {
        // remove old active highlights
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            if (child.classList.contains('active'))
                child.classList.remove('active');
        }

        // close sidebar
        if (!this.element.classList.contains('collapsed')) {
            this.element.classList.add('collapsed');
        }

        return this;
    };

    public _onClick(evt: MouseEvent): void {
        evt.preventDefault();
        if (this.classList.contains('active')) {
            this._sidebar.close();
        } else if (!this.classList.contains('disabled')) {
            this._sidebar.open(this.querySelector('a').hash.slice(1));
        }
    };

    public _onCloseClick(): void {
        this.close();
    };
}