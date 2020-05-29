
/******************************************************************************
 Copyright 2019 Wolfgang Schildbach

 This file is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This file is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this file.  If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/

/******************************************************************************
 This file implements the client-side of the magnetic compass display.
 ******************************************************************************/
import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Map} from 'ol';

// the geomagnetic model. This gets set up at application start

@Injectable({
    providedIn: 'root'
  })
export class MagDev { 
    geoMag;
    map: Map;

    constructor (private http: HttpClient) {
        http.get("WMM.txt", {
            responseType: "text"
        }).subscribe( res => {
            let wmm = cof2Obj(res);
            this.geoMag = geoMagFactory(wmm);
            if (this.map) this.refreshMagdev();
        })
    }
    
    setMagdev(p) {
    // pick the right bottom corner of the map to avoid problems with interpolating
    // across the date boundary
    let latitude = (p.b+p.t)/2;
    let longitude = (p.l+p.r)/2;

    // get two dates exactly one year apart
    const msInYear = 1000*60*60*24*365.25;
    let now  = new Date();
    let then = new Date(); then.setTime(now.getTime() + msInYear);

    let myGeoMagNow = this.geoMag(latitude, longitude, 0, now);
    let myGeoMagThen = this.geoMag(latitude, longitude, 0, then);
    let nextyear = (then.getTime()-now.getTime())/msInYear;
    let deviation = myGeoMagNow.dec;
    let change = (myGeoMagThen.dec-myGeoMagNow.dec) / nextyear;

    document.getElementById('magCompassRose').style.transform = 'rotate('+deviation.toFixed(1)+'deg)';
    // EXAMPLE
    // VAR 3.5°5'E (2015)
    // ANNUAL DECREASE 8'
    document.getElementById('magCompassTextTop').innerText = "VAR "+deviation.toFixed(1)+(deviation>=0 ? "E":"W")+" ("+now.getFullYear()+")";
    document.getElementById('magCompassTextBottom').innerText = "ANNUAL "+(change >= 0 ? "INCREASE ":"DECREASE ")+(60*change).toFixed(0)+"'";
}

// Downloads new magnetic deviation(s) from the server. This is called when the map moves.
public refreshMagdev(): void {
    let bounds = this.map.getView().calculateExtent(this.map.getSize());
    let params = { "b": y2lat(bounds[1]), "t": y2lat(bounds[3]), "l": x2lon(bounds[0]), "r": x2lon(bounds[2])};
    if (this.geoMag) this.setMagdev(params);
}
}

function y2lat(a) {
    return 180/Math.PI * (2 * Math.atan(Math.exp(moinsfacteur(a)*Math.PI/180)) - Math.PI/2);
}

function x2lon(a) {
    return moinsfacteur(a);
}


function moinsfacteur(a) {
    return a / (20037508.34 / 180);
}

function cof2Obj(cof) {
	'use strict';
	var modelLines = cof.split('\n'),
		wmm = [],
		i, vals, epoch, model, modelDate;
	for (i in modelLines) {
		if (modelLines.hasOwnProperty(i)) {
			vals = modelLines[i].replace(/^\s+|\s+$/g, "").split(/\s+/);
			if (vals.length === 3) {
				epoch = parseFloat(vals[0]);
				model = vals[1];
				modelDate = vals[2];
			} else if (vals.length === 6) {
				wmm.push({
					n: parseInt(vals[0], 10),
					m: parseInt(vals[1], 10),
					gnm: parseFloat(vals[2]),
					hnm: parseFloat(vals[3]),
					dgnm: parseFloat(vals[4]),
					dhnm: parseFloat(vals[5])
				});
			}
		}
	}

	return {epoch: epoch, model: model, modelDate: modelDate, wmm: wmm};
}

function geoMagFactory(wmm) {
	'use strict';
	function rad2deg(rad) {
		return rad * (180 / Math.PI);
	}
	function deg2rad(deg) {
		return deg * (Math.PI / 180);
	}

	var i, model, epoch = wmm.epoch,
		z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		maxord = 12,
		tc = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice()],
		sp = z.slice(),
		cp = z.slice(),
		pp = z.slice(),
		p = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice()],
		dp = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice()],
		a = 6378.137,
		b = 6356.7523142,
		re = 6371.2,
		a2 = a * a,
		b2 = b * b,
		c2 = a2 - b2,
		a4 = a2 * a2,
		b4 = b2 * b2,
		c4 = a4 - b4,
		c = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice()],
		cd = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice()],
		n, m,
		snorm = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice(), z.slice()],
		j,
		k = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
			z.slice()],
		flnmj,
		fn = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
		fm = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		D2;

	tc[0][0] = 0;
	sp[0] = 0.0;
	cp[0] = 1.0;
	pp[0] = 1.0;
	p[0][0] = 1;

	model = wmm.wmm;
	for (i in model) {
		if (model.hasOwnProperty(i)) {
			if (model[i].m <= model[i].n) {
				c[model[i].m][model[i].n] = model[i].gnm;
				cd[model[i].m][model[i].n] = model[i].dgnm;
				if (model[i].m !== 0) {
					c[model[i].n][model[i].m - 1] = model[i].hnm;
					cd[model[i].n][model[i].m - 1] = model[i].dhnm;
				}
			}
		}
	}
	wmm = null;
	model = null;

	/* CONVERT SCHMIDT NORMALIZED GAUSS COEFFICIENTS TO UNNORMALIZED */
	snorm[0][0] = 1;

	for (n = 1; n <= maxord; n++) {
		snorm[0][n] = snorm[0][n - 1] * (2 * n - 1) / n;
		j = 2;

		for (m = 0, D2 = (n - m + 1); D2 > 0; D2--, m++) {
			k[m][n] = (((n - 1) * (n - 1)) - (m * m)) /
				((2 * n - 1) * (2 * n - 3));
			if (m > 0) {
				flnmj = ((n - m + 1) * j) / (n + m);
				snorm[m][n] = snorm[m - 1][n] * Math.sqrt(flnmj);
				j = 1;
				c[n][m - 1] = snorm[m][n] * c[n][m - 1];
				cd[n][m - 1] = snorm[m][n] * cd[n][m - 1];
			}
			c[m][n] = snorm[m][n] * c[m][n];
			cd[m][n] = snorm[m][n] * cd[m][n];
		}
	}
	k[1][1] = 0.0;

	return function (glat, glon, h, date) {
		function decimalDate(date) {
			date = date || new Date();
			var year = date.getUTCFullYear(),
				daysInYear = 365 +
					(((year % 400 === 0) || (year % 4 === 0 && (year % 100 > 0))) ? 1 : 0),
				msInYear = daysInYear * 24 * 60 * 60 * 1000;

			return date.getUTCFullYear() + (date.valueOf() - Date.UTC(year, 0)) / msInYear;
		}

		var alt = (h / 3280.8399) || 0, // convert h (in feet) to kilometers or set default of 0
			time = decimalDate(date),
			dt = time - epoch,
			rlat = deg2rad(glat),
			rlon = deg2rad(glon),
			srlon = Math.sin(rlon),
			srlat = Math.sin(rlat),
			crlon = Math.cos(rlon),
			crlat = Math.cos(rlat),
			srlat2 = srlat * srlat,
			crlat2 = crlat * crlat,
			q,
			q1,
			q2,
			ct,
			st,
			r2,
			r,
			d,
			ca,
			sa,
			aor,
			ar,
			br = 0.0,
			bt = 0.0,
			bp = 0.0,
			bpp = 0.0,
			par,
			temp1,
			temp2,
			parp,
			D4,
			bx,
			by,
			bz,
			bh,
			ti,
			dec,
			dip,
			gv;
		sp[1] = srlon;
		cp[1] = crlon;

		/* CONVERT FROM GEODETIC COORDS. TO SPHERICAL COORDS. */
		q = Math.sqrt(a2 - c2 * srlat2);
		q1 = alt * q;
		q2 = ((q1 + a2) / (q1 + b2)) * ((q1 + a2) / (q1 + b2));
		ct = srlat / Math.sqrt(q2 * crlat2 + srlat2);
		st = Math.sqrt(1.0 - (ct * ct));
		r2 = (alt * alt) + 2.0 * q1 + (a4 - c4 * srlat2) / (q * q);
		r = Math.sqrt(r2);
		d = Math.sqrt(a2 * crlat2 + b2 * srlat2);
		ca = (alt + d) / r;
		sa = c2 * crlat * srlat / (r * d);

		for (m = 2; m <= maxord; m++) {
			sp[m] = sp[1] * cp[m - 1] + cp[1] * sp[m - 1];
			cp[m] = cp[1] * cp[m - 1] - sp[1] * sp[m - 1];
		}

		aor = re / r;
		ar = aor * aor;

		for (n = 1; n <= maxord; n++) {
			ar = ar * aor;
			for (m = 0, D4 = (n + m + 1); D4 > 0; D4--, m++) {

		/*
				COMPUTE UNNORMALIZED ASSOCIATED LEGENDRE POLYNOMIALS
				AND DERIVATIVES VIA RECURSION RELATIONS
		*/
				if (n === m) {
					p[m][n] = st * p[m - 1][n - 1];
					dp[m][n] = st * dp[m - 1][n - 1] + ct *
						p[m - 1][n - 1];
				} else if (n === 1 && m === 0) {
					p[m][n] = ct * p[m][n - 1];
					dp[m][n] = ct * dp[m][n - 1] - st * p[m][n - 1];
				} else if (n > 1 && n !== m) {
					if (m > n - 2) { p[m][n - 2] = 0; }
					if (m > n - 2) { dp[m][n - 2] = 0.0; }
					p[m][n] = ct * p[m][n - 1] - k[m][n] * p[m][n - 2];
					dp[m][n] = ct * dp[m][n - 1] - st * p[m][n - 1] -
						k[m][n] * dp[m][n - 2];
				}

		/*
				TIME ADJUST THE GAUSS COEFFICIENTS
		*/

				tc[m][n] = c[m][n] + dt * cd[m][n];
				if (m !== 0) {
					tc[n][m - 1] = c[n][m - 1] + dt * cd[n][m - 1];
				}

		/*
				ACCUMULATE TERMS OF THE SPHERICAL HARMONIC EXPANSIONS
		*/
				par = ar * p[m][n];
				if (m === 0) {
					temp1 = tc[m][n] * cp[m];
					temp2 = tc[m][n] * sp[m];
				} else {
					temp1 = tc[m][n] * cp[m] + tc[n][m - 1] * sp[m];
					temp2 = tc[m][n] * sp[m] - tc[n][m - 1] * cp[m];
				}
				bt = bt - ar * temp1 * dp[m][n];
				bp += (fm[m] * temp2 * par);
				br += (fn[n] * temp1 * par);
		/*
					SPECIAL CASE:  NORTH/SOUTH GEOGRAPHIC POLES
		*/
				if (st === 0.0 && m === 1) {
					if (n === 1) {
						pp[n] = pp[n - 1];
					} else {
						pp[n] = ct * pp[n - 1] - k[m][n] * pp[n - 2];
					}
					parp = ar * pp[n];
					bpp += (fm[m] * temp2 * parp);
				}
			}
		}

		bp = (st === 0.0 ? bpp : bp / st);
		/*
			ROTATE MAGNETIC VECTOR COMPONENTS FROM SPHERICAL TO
			GEODETIC COORDINATES
		*/
		bx = -bt * ca - br * sa;
		by = bp;
		bz = bt * sa - br * ca;

		/*
			COMPUTE DECLINATION (DEC), INCLINATION (DIP) AND
			TOTAL INTENSITY (TI)
		*/
		bh = Math.sqrt((bx * bx) + (by * by));
		ti = Math.sqrt((bh * bh) + (bz * bz));
		dec = rad2deg(Math.atan2(by, bx));
		dip = rad2deg(Math.atan2(bz, bh));

		/*
			COMPUTE MAGNETIC GRID VARIATION IF THE CURRENT
			GEODETIC POSITION IS IN THE ARCTIC OR ANTARCTIC
			(I.E. GLAT > +55 DEGREES OR GLAT < -55 DEGREES)
			OTHERWISE, SET MAGNETIC GRID VARIATION TO -999.0
		*/

		if (Math.abs(glat) >= 55.0) {
			if (glat > 0.0 && glon >= 0.0) {
				gv = dec - glon;
			} else if (glat > 0.0 && glon < 0.0) {
				gv = dec + Math.abs(glon);
			} else if (glat < 0.0 && glon >= 0.0) {
				gv = dec + glon;
			} else if (glat < 0.0 && glon < 0.0) {
				gv = dec - Math.abs(glon);
			}
			if (gv > 180.0) {
				gv -= 360.0;
			} else if (gv < -180.0) { gv += 360.0; }
		}

		return {dec: dec, dip: dip, ti: ti, bh: bh, bx: bx, by: by, bz: bz, lat: glat, lon: glon, gv: gv, epoch: epoch};
	};
}
