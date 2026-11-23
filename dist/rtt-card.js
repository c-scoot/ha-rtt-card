// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, g = h.trustedTypes, _ = g ? g.emptyScript : "", ee = h.reactiveElementPolyfillSupport, v = (e, t) => e, y = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? _ : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, te = (e, t) => !l(e, t), ne = {
	attribute: !0,
	type: String,
	converter: y,
	reflect: !1,
	useDefault: !1,
	hasChanged: te
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var b = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ne) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? ne;
	}
	static _$Ei() {
		if (this.hasOwnProperty(v("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(v("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(v("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? y : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? y : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? te)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
b.elementStyles = [], b.shadowRootOptions = { mode: "open" }, b[v("elementProperties")] = /* @__PURE__ */ new Map(), b[v("finalized")] = /* @__PURE__ */ new Map(), ee?.({ ReactiveElement: b }), (h.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var x = globalThis, re = (e) => e, S = x.trustedTypes, ie = S ? S.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, C = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, T = "?" + w, ae = `<${T}>`, E = document, D = () => E.createComment(""), O = (e) => e === null || typeof e != "object" && typeof e != "function", oe = Array.isArray, se = (e) => oe(e) || typeof e?.[Symbol.iterator] == "function", ce = "[ 	\n\f\r]", k = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, le = /-->/g, ue = />/g, A = RegExp(`>|${ce}(?:([^\\s"'>=/]+)(${ce}*=${ce}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), de = /'/g, fe = /"/g, pe = /^(?:script|style|textarea|title)$/i, j = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), M = Symbol.for("lit-noChange"), N = Symbol.for("lit-nothing"), me = /* @__PURE__ */ new WeakMap(), P = E.createTreeWalker(E, 129);
function he(e, t) {
	if (!oe(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ie === void 0 ? t : ie.createHTML(t);
}
var ge = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = k;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === k ? c[1] === "!--" ? o = le : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = A) : (pe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = A) : o = ue : o === A ? c[0] === ">" ? (o = i ?? k, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? A : c[3] === "\"" ? fe : de) : o === fe || o === de ? o = A : o === le || o === ue ? o = k : (o = A, i = void 0);
		let d = o === A && e[t + 1].startsWith("/>") ? " " : "";
		a += o === k ? n + ae : l >= 0 ? (r.push(s), n.slice(0, l) + C + n.slice(l) + w + d) : n + w + (l === -2 ? t : d);
	}
	return [he(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, F = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ge(t, n);
		if (this.el = e.createElement(l, r), P.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = P.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(C)) {
					let t = u[o++], n = i.getAttribute(e).split(w), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ve : r[1] === "?" ? ye : r[1] === "@" ? be : R
					}), i.removeAttribute(e);
				} else e.startsWith(w) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (pe.test(i.tagName)) {
					let e = i.textContent.split(w), t = e.length - 1;
					if (t > 0) {
						i.textContent = S ? S.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], D()), P.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], D());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === T) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(w, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += w.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = E.createElement("template");
		return n.innerHTML = e, n;
	}
};
function I(e, t, n = e, r) {
	if (t === M) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = O(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = I(e, i._$AS(e, t.values), i, r)), t;
}
var _e = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? E).importNode(t, !0);
		P.currentNode = r;
		let i = P.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new L(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new xe(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = P.nextNode(), a++);
		}
		return P.currentNode = E, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, L = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = N, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = I(this, e, t), O(e) ? e === N || e == null || e === "" ? (this._$AH !== N && this._$AR(), this._$AH = N) : e !== this._$AH && e !== M && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? se(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== N && O(this._$AH) ? this._$AA.nextSibling.data = e : this.T(E.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = F.createElement(he(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new _e(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = me.get(e.strings);
		return t === void 0 && me.set(e.strings, t = new F(e)), t;
	}
	k(t) {
		oe(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(D()), this.O(D()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = re(e).nextSibling;
			re(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, R = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = N, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = N;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = I(this, e, t, 0), a = !O(e) || e !== this._$AH && e !== M, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = I(this, r[n + o], t, o), s === M && (s = this._$AH[o]), a ||= !O(s) || s !== this._$AH[o], s === N ? e = N : e !== N && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === N ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ve = class extends R {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === N ? void 0 : e;
	}
}, ye = class extends R {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== N);
	}
}, be = class extends R {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = I(this, e, t, 0) ?? N) === M) return;
		let n = this._$AH, r = e === N && n !== N || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== N && (n === N || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, xe = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		I(this, e);
	}
}, Se = {
	M: C,
	P: w,
	A: T,
	C: 1,
	L: ge,
	R: _e,
	D: se,
	V: I,
	I: L,
	H: R,
	N: ye,
	U: be,
	B: ve,
	F: xe
}, Ce = x.litHtmlPolyfillSupport;
Ce?.(F, L), (x.litHtmlVersions ??= []).push("3.3.3");
var we = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new L(t.insertBefore(D(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, z = globalThis, B = class extends b {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = we(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return M;
	}
};
B._$litElement$ = !0, B.finalized = !0, z.litElementHydrateSupport?.({ LitElement: B });
var Te = z.litElementPolyfillSupport;
Te?.({ LitElement: B }), (z.litElementVersions ??= []).push("4.2.2");
// node_modules/lit-html/directive.js
var Ee = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, De = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Oe = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, { I: ke } = Se, Ae = (e) => e, je = () => document.createComment(""), V = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new ke(r.insertBefore(je(), i), r.insertBefore(je(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = Ae(e).nextSibling;
				Ae(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, H = (e, t, n = e) => (e._$AI(t, n), e), Me = {}, Ne = (e, t = Me) => e._$AH = t, Pe = (e) => e._$AH, U = (e) => {
	e._$AR(), e._$AA.remove();
}, Fe = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, Ie = De(class extends Oe {
	constructor(e) {
		if (super(e), e.type !== Ee.CHILD) throw Error("repeat() can only be used in text expressions");
	}
	dt(e, t, n) {
		let r;
		n === void 0 ? n = t : t !== void 0 && (r = t);
		let i = [], a = [], o = 0;
		for (let t of e) i[o] = r ? r(t, o) : o, a[o] = n(t, o), o++;
		return {
			values: a,
			keys: i
		};
	}
	render(e, t, n) {
		return this.dt(e, t, n).values;
	}
	update(e, [t, n, r]) {
		let i = Pe(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = H(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = H(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = H(i[d], a[m]), V(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = H(i[f], a[p]), V(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = Fe(o, p, m), u = Fe(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = V(e, i[d]);
					H(t, a[p]), c[p] = t;
				} else c[p] = H(n, a[p]), V(e, i[d], n), i[t] = null;
				p++;
			} else U(i[f]), f--;
		} else U(i[d]), d++;
		for (; p <= m;) {
			let t = V(e, c[m + 1]);
			H(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && U(e);
		}
		return this.ut = o, Ne(e, c), M;
	}
}), W = [
	"scheduled",
	"expected",
	"actual",
	"delay_minutes",
	"platform",
	"last_success"
];
// src/config.ts
function G(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Le(e, t) {
	if (typeof e != "string" || !/^sensor\.[a-z0-9_]+$/.test(e)) throw Error(`${t} must be a sensor entity ID.`);
	return e;
}
function Re(e, t) {
	if (e !== void 0) {
		if (typeof e != "string") throw Error(`${t} must be text.`);
		return e.trim() || void 0;
	}
}
function ze(e, t) {
	let n = `Train ${t + 1}`;
	if (!G(e)) throw Error(`${n} must specify a status entity.`);
	let r = Le(e.entity, `${n} entity`), i = Re(e.name, `${n} name`), a = { entity: r };
	if (i && (a.name = i), e.sensors === void 0) return a;
	if (!G(e.sensors)) throw Error(`${n} sensors must be a mapping.`);
	let o = {}, s = /* @__PURE__ */ new Set([r]);
	for (let [t, r] of Object.entries(e.sensors)) {
		if (!W.some((e) => e === t)) throw Error(`${n} has an unknown sensor role "${t}".`);
		let e = Le(r, `${n} ${t}`);
		if (s.has(e)) throw Error(`${n} repeats sensor ${e}.`);
		s.add(e), o[t] = e;
	}
	return a.sensors = o, a;
}
function K(e) {
	if (!G(e)) throw Error("Set trains to a list of tracked status entities.");
	if (typeof e.type != "string" || !e.type.trim()) throw Error("The card type is required.");
	let t = e.mode === void 0 ? "selected" : e.mode;
	if (t !== "all" && t !== "selected") throw Error("Mode must be \"all\" or \"selected\".");
	let n = e.trains === void 0 && t === "all" ? [] : e.trains;
	if (!Array.isArray(n)) throw Error("Set trains to a list of tracked status entities.");
	let r = Re(e.title, "Card title"), i = n.map(ze);
	if (new Set(i.map((e) => e.entity)).size !== i.length) throw Error("Each tracked status entity can appear only once.");
	let a = {
		...e,
		type: e.type,
		mode: t,
		trains: i
	};
	return r ? a.title = r : delete a.title, a;
}
// src/data.ts
var q = "realtime_trains", J;
function Be(e, t) {
	if (J && J.display === e.entities && J.full === t) return J.index;
	let n = /* @__PURE__ */ new Map();
	for (let e of t ?? []) n.set(e.entity_id, e);
	for (let t of Object.values(e.entities ?? {})) n.set(t.entity_id, {
		...n.get(t.entity_id),
		...t
	});
	let r = /* @__PURE__ */ new Map();
	for (let e of n.values()) {
		if (e.platform !== q || !e.device_id || e.disabled_by) continue;
		let t = r.get(e.device_id);
		t ? t.push(e) : r.set(e.device_id, [e]);
	}
	let i = {
		byId: n,
		byDevice: r
	};
	return J = {
		display: e.entities,
		full: t,
		index: i
	}, i;
}
function Ve(e) {
	return e.platform !== q || !e.entity_id.startsWith("sensor.") ? !1 : e.translation_key ? e.translation_key === "status" : e.unique_id?.endsWith("_status") === !0 && !e.unique_id.endsWith("_platform_status");
}
function Y(e, t) {
	let n = [];
	for (let r of Be(e, t).byId.values()) !r.disabled_by && Ve(r) && e.states[r.entity_id] && n.push({ entity: r.entity_id });
	return n.sort((e, t) => e.entity.localeCompare(t.entity));
}
function He(e, t) {
	if (t.mode !== "all") return t.trains;
	let n = new Map(t.trains.map((e) => [e.entity, e]));
	return Y(e).map((e) => n.get(e.entity) ?? e).map((t) => ({
		train: t,
		scheduled: Date.parse(Q(e, t).scheduled ?? "")
	})).sort((e, t) => {
		let n = Number.isFinite(e.scheduled) ? e.scheduled : Infinity, r = Number.isFinite(t.scheduled) ? t.scheduled : Infinity;
		return (n === r ? 0 : n - r) || e.train.entity.localeCompare(t.train.entity);
	}).map(({ train: e }) => e);
}
function Ue(e, t) {
	if (e.entity_id.startsWith("sensor.")) {
		if (e.translation_key) return W.find((t) => t === e.translation_key);
		if (t) return W.find((n) => e.unique_id === t + n);
	}
}
function We(e, t) {
	let n = t.byId.get(e.entity), r = {};
	if (n?.device_id && n.platform === q) {
		let e = n.unique_id?.endsWith("_status") ? n.unique_id.slice(0, -6) : void 0, i = /* @__PURE__ */ new Set();
		for (let a of t.byDevice.get(n.device_id) ?? []) {
			let t = Ue(a, e);
			t && (i.has(t) ? delete r[t] : r[t] = a.entity_id, i.add(t));
		}
	}
	for (let i of W) {
		let a = e.sensors?.[i];
		if (!a) continue;
		let o = t.byId.get(a);
		n?.device_id && o?.device_id && n.device_id !== o.device_id ? delete r[i] : r[i] = a;
	}
	return r;
}
function X(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t && t !== "unknown" && t !== "unavailable" ? t : null;
}
function Z(e) {
	let t = X(e);
	return !t || !/^\d{4}-\d\d-\d\dT\d\d:\d\d.*(?:Z|[+-]\d\d:\d\d)$/i.test(t) ? null : Number.isFinite(Date.parse(t)) ? t : null;
}
function Ge(e) {
	if (!e || !/^[+-]?\d+(?:\.\d+)?$/.test(e)) return null;
	let t = Number(e);
	return Number.isFinite(t) ? t : null;
}
function Q(e, t, n) {
	let r = Be(e, n), i = r.byId.get(t.entity), a = i?.device_id ? e.devices?.[i.device_id] : void 0, o = e.states[t.entity], s = o?.attributes ?? {}, c = We(t, r), l = (t) => {
		let n = c[t];
		return n ? X(e.states[n]?.state) : null;
	}, u = X(o?.state), d = s.direction === "arrival" || s.direction === "departure" ? s.direction : null, f = X(s.station), p = [d === "arrival" ? "Arrival" : d === "departure" ? "Departure" : "", f].filter(Boolean).join(" · "), m = l("platform"), h = c.platform ? e.states[c.platform]?.attributes : void 0, g = h && "platform_source" in h ? h.platform_source : s.platform_source, _ = h && "platform_status" in h ? h.platform_status : s.platform_status, ee = _ == null ? g === "actual" || g === "planned" ? g : null : _ === "confirmed" ? "actual" : _ === "planned" ? "planned" : null;
	return {
		entity: t.entity,
		title: t.name ?? X(a?.name_by_user) ?? X(a?.name) ?? (p || t.entity),
		direction: d,
		station: f,
		status: u,
		availability: o ? o.state === "unavailable" ? "unavailable" : u ? "available" : "unknown" : "missing",
		terminal: s.terminal === !0,
		repeatWeekly: s.repeat_weekly === !0,
		weeklyState: X(s.weekly_state),
		weeklyNextScheduled: Z(s.weekly_next_scheduled),
		stale: typeof s.stale == "boolean" ? s.stale : null,
		scheduled: Z(l("scheduled")),
		expected: Z(l("expected")),
		actual: Z(l("actual")),
		delayMinutes: Ge(l("delay_minutes")),
		platform: m,
		platformSource: m ? ee : null,
		lastSuccess: Z(l("last_success")),
		nextPoll: Z(s.next_poll),
		reason: X(s.reason),
		lastError: X(s.last_error)
	};
}
function Ke(e, t, n) {
	if (!Z(e) || !e) return "";
	let r = t.locale?.language || t.language || "en-GB", i = t.config?.time_zone || "Europe/London";
	try {
		return new Intl.DateTimeFormat(r, {
			...n,
			timeZone: i
		}).format(new Date(e));
	} catch {
		return "";
	}
}
function qe(e, t) {
	let n = {
		hour: "2-digit",
		minute: "2-digit"
	};
	return t.locale?.time_format === "24" && (n.hourCycle = "h23"), t.locale?.time_format === "12" && (n.hourCycle = "h12"), Ke(e, t, n);
}
function Je(e, t) {
	return Ke(e, t, {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
// src/editor.ts
var Ye = class extends B {
	static {
		this.properties = {
			hass: { attribute: !1 },
			config: { state: !0 },
			selectedEntity: { state: !0 }
		};
	}
	constructor() {
		super(), this.selectedEntity = "";
	}
	setConfig(e) {
		this.config = K(e);
	}
	render() {
		let { config: e } = this;
		return e ? j`
      <label>
        Card title
        <input type="text" placeholder="Realtime Trains" .value=${e.title ?? ""} @change=${this.changeTitle}>
      </label>
      <label>
        Trains to show
        <select name="mode" .value=${e.mode ?? "selected"} @change=${this.changeMode}>
          <option value="all">All monitored trains</option>
          <option value="selected">Selected trains</option>
        </select>
      </label>
      ${e.mode === "all" ? j`<p>${this.allTrainsSummary(e)}</p>` : this.renderSelectedTrains(e)}
    ` : N;
	}
	allTrainsSummary(e) {
		let { hass: t } = this;
		if (!t) return "Waiting for Home Assistant…";
		if (!t.entities) return "Train discovery is unavailable. Choose Selected trains and enter status entity IDs in YAML.";
		let n = He(t, e).length;
		return n ? `${n} monitored ${n === 1 ? "train" : "trains"}. Sorted by scheduled time. The card updates as you add or remove tracked trains.${e.trains.length ? " Switch back to Selected trains to edit your saved list and names." : ""}` : "No monitored trains found. Add a tracked train in the Realtime Trains integration.";
	}
	renderSelectedTrains(e) {
		let { hass: t } = this, n = new Set(e.trains.map((e) => e.entity)), r = t ? Y(t).filter((e) => !n.has(e.entity)).map((e) => ({
			entity: e.entity,
			title: Q(t, e).title
		})).sort((e, t) => e.title.localeCompare(t.title) || e.entity.localeCompare(t.entity)) : [];
		return j`
      <fieldset>
        <legend>Tracked trains</legend>
        ${e.trains.length ? j`
          <ol>
            ${Ie(e.trains, (e) => e.entity, (t, n) => this.renderTrain(t, n, e.trains.length))}
          </ol>
        ` : N}
        ${r.length ? j`
          <div class="add-train">
            <label>
              Train status sensor
              <select name="train" .value=${this.selectedEntity} @change=${this.selectEntity}>
                <option value="">Select a train</option>
                ${r.map(({ entity: e, title: t }) => j`<option value=${e}>${t} (${e})</option>`)}
              </select>
            </label>
            <button type="button" class="add-button" @click=${this.addTrain}
              ?disabled=${!r.some(({ entity: e }) => e === this.selectedEntity)}>Add train</button>
          </div>
        ` : j`
          <p>${e.trains.length ? "No other train status sensors found." : "No Realtime Trains status sensors found. Add a tracked train in the integration or enter its entity ID in YAML."}</p>
        `}
      </fieldset>
    `;
	}
	renderTrain(e, t, n) {
		let r = this.hass ? Q(this.hass, e).title : e.name ?? e.entity;
		return j`
      <li>
        <div class="train-title">${r}</div>
        <div class="entity-id">${e.entity}</div>
        <label>
          Display name
          <input type="text" placeholder="Optional" .value=${e.name ?? ""}
            @change=${(t) => this.changeName(e.entity, t)}>
        </label>
        <div class="actions">
          <button type="button" aria-label=${`Move ${r} up`} ?disabled=${t === 0}
            @click=${() => this.moveTrain(t, -1)}>Move up</button>
          <button type="button" aria-label=${`Move ${r} down`} ?disabled=${t === n - 1}
            @click=${() => this.moveTrain(t, 1)}>Move down</button>
          <button type="button" aria-label=${`Remove ${r}`}
            @click=${() => this.removeTrain(e.entity)}>Remove</button>
        </div>
      </li>
    `;
	}
	changeTitle(e) {
		if (!this.config) return;
		let t = e.currentTarget.value.trim();
		this.publish({
			...this.config,
			title: t || void 0
		});
	}
	changeMode(e) {
		if (!this.config) return;
		let t = e.currentTarget.value;
		(t === "all" || t === "selected") && (this.selectedEntity = "", this.publish({
			...this.config,
			mode: t
		}));
	}
	changeName(e, t) {
		if (!this.config) return;
		let n = t.currentTarget.value.trim(), r = this.config.trains.map((t) => t.entity === e ? {
			...t,
			name: n || void 0
		} : t);
		this.publish({
			...this.config,
			trains: r
		});
	}
	selectEntity(e) {
		this.selectedEntity = e.currentTarget.value;
	}
	addTrain() {
		if (!this.config || !this.selectedEntity || !this.hass || this.config.trains.some((e) => e.entity === this.selectedEntity)) return;
		let e = Y(this.hass).find(({ entity: e }) => e === this.selectedEntity);
		e && (this.selectedEntity = "", this.publish({
			...this.config,
			trains: [...this.config.trains, e]
		}));
	}
	moveTrain(e, t) {
		if (!this.config) return;
		let n = [...this.config.trains], r = e + t;
		if (r < 0 || r >= n.length) return;
		let [i] = n.splice(e, 1);
		i && (n.splice(r, 0, i), this.publish({
			...this.config,
			trains: n
		}));
	}
	removeTrain(e) {
		this.config && this.publish({
			...this.config,
			trains: this.config.trains.filter((t) => t.entity !== e)
		});
	}
	publish(e) {
		this.config = K(e), this.dispatchEvent(new CustomEvent("config-changed", {
			bubbles: !0,
			composed: !0,
			detail: { config: this.config }
		}));
	}
	static {
		this.styles = o`
    :host {
      display: grid;
      gap: 16px;
      min-width: 0;
      color: var(--primary-text-color, inherit);
    }

    label {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    fieldset {
      display: grid;
      min-width: 0;
      margin: 0;
      padding: 10px;
      border: 1px solid var(--divider-color, #dadce0);
      border-radius: 8px;
    }

    legend {
      padding-inline: 5px;
      font-weight: 600;
    }

    ol {
      display: grid;
      gap: 10px;
      margin: 0 0 10px;
      padding: 0 0 0 22px;
    }

    li {
      min-width: 0;
      padding: 10px;
      border: 1px solid var(--divider-color, #dadce0);
      border-radius: 6px;
    }

    .train-title {
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .entity-id {
      margin: 2px 0 8px;
      color: var(--secondary-text-color, inherit);
      font-size: 0.875rem;
      overflow-wrap: anywhere;
    }

    .actions,
    .add-train {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      gap: 6px;
    }

    .actions {
      margin-block-start: 7px;
    }

    .add-train label {
      flex: 1 1 220px;
    }

    input,
    select,
    button {
      box-sizing: border-box;
      min-height: 36px;
      padding: 5px 8px;
      border: 1px solid var(--divider-color, #dadce0);
      border-radius: 5px;
      background: var(--secondary-background-color, Canvas);
      color: var(--primary-text-color, CanvasText);
      font: inherit;
    }

    input,
    select {
      width: 100%;
    }

    button:not(:disabled) {
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.5;
    }

    .add-button {
      border-color: var(--primary-color, #006a9b);
      background: var(--primary-color, #006a9b);
      color: var(--text-primary-color, white);
    }

    :focus-visible {
      outline: 2px solid var(--primary-color, #0084bc);
      outline-offset: 1px;
    }

    p {
      margin: 4px 0;
      color: var(--secondary-text-color, inherit);
    }
  `;
	}
};
customElements.get("rtt-card-editor") || customElements.define("rtt-card-editor", Ye);
// src/rtt-card.ts
var Xe = "Realtime Trains", Ze = /* @__PURE__ */ new Map([
	["on_time", "success"],
	["early", "success"],
	["arrived", "success"],
	["departed", "success"],
	["scheduled", "info"],
	["delayed", "warning"],
	["unconfirmed", "warning"],
	["diverted", "warning"],
	["no_report", "warning"],
	["cancelled", "error"]
]), Qe = /* @__PURE__ */ new Map([
	["waiting", "Waiting for next train"],
	["no_match", "No matching weekly train"],
	["rate_limited", "Weekly lookup rate limited"],
	["request_failed", "Weekly lookup failed"],
	["invalid_auth", "Weekly lookup needs authentication"],
	["missing_match", "Weekly match details missing"]
]);
function $(e, t, n, r) {
	let i = qe(t, n);
	if (!t || !i) return N;
	let a = Je(t, n);
	return j`<span>${e} <time datetime=${t}>${a === r ? "" : `${a} `}${i}</time></span>`;
}
var $e = class extends B {
	static {
		this.properties = {
			hass: { attribute: !1 },
			config: { state: !0 }
		};
	}
	static getConfigElement() {
		return document.createElement("rtt-card-editor");
	}
	static getStubConfig() {
		return {
			mode: "all",
			trains: []
		};
	}
	setConfig(e) {
		this.config = K(e);
	}
	getGridOptions() {
		return {
			columns: 12,
			min_columns: 6,
			rows: "auto"
		};
	}
	getCardSize() {
		let { config: e, hass: t } = this, n = e && t ? He(t, e).length : e?.mode === "selected" ? e.trains.length : 0;
		return Math.ceil((56 + Math.max(n, 1) * 72) / 50);
	}
	render() {
		let { config: e, hass: t } = this;
		if (!e) return N;
		let n = t ? He(t, e) : [];
		return j`
      <ha-card>
        <h2>${e.title ?? Xe}</h2>
        ${n.length && t ? j`<ul role="list">
              ${Ie(n, (e) => e.entity, (e) => this.renderTrack(Q(t, e), t))}
            </ul>` : j`<p class="empty">${this.emptyMessage(e, t)}</p>`}
      </ha-card>
    `;
	}
	emptyMessage(e, t) {
		return e.mode === "all" ? t ? t.entities ? "No monitored trains found. Add a tracked train in the Realtime Trains integration." : "Train discovery is unavailable. Choose Selected trains and enter status entity IDs in YAML." : "Waiting for Home Assistant…" : e.trains.length ? "Waiting for Home Assistant…" : "Add a train status sensor in the card editor.";
	}
	renderTrack(e, t) {
		let n = Je(e.scheduled ?? e.actual ?? e.expected, t), r = e.stale && e.lastSuccess ? [Je(e.lastSuccess, t), qe(e.lastSuccess, t)].filter(Boolean).join(" ") : "", i = e.status?.toLowerCase().replaceAll(" ", "_"), a = e.status ? e.status.replaceAll("_", " ").replace(/^\p{Ll}/u, (e) => e.toUpperCase()) : {
			missing: "Status sensor missing",
			unavailable: "Status unavailable",
			unknown: "Status unknown",
			available: "Status unknown"
		}[e.availability], o = i ? Ze.get(i) ?? "neutral" : "neutral", s = e.platformSource === "actual" ? "Confirmed" : e.platformSource === "planned" ? "Planned" : "Unverified", c = e.platform ? `Platform ${e.platform} · ${s}` : "Platform unavailable", l = e.station?.replace(/^GB-NR:(?=[A-Z0-9]+$)/i, ""), u = l && !e.title.toLowerCase().includes(l.toLowerCase()) ? l : null, d = !i || i === "no_report" || i === "cancelled" ? null : e.delayMinutes;
		return j`
      <li>
        <button type="button" class="journey" @click=${() => this.openMoreInfo(e.entity)}
          ?disabled=${e.availability === "missing"}>
          <span class="summary">
            <span class="name">${e.title}</span>
            <span class="status-group">
              <span class="status" data-tone=${o}>${a}</span>
              ${e.stale ? j`<span class="stale">Update stale</span>` : N}
            </span>
          </span>
          <span class="details">
            ${e.direction ? j`<span>${e.direction === "arrival" ? "Arrival" : "Departure"}</span>` : N}
            ${u ? j`<span>${u}</span>` : N}
            ${$("Scheduled", e.scheduled, t, n)}
            ${e.expected === e.scheduled ? N : $("Expected", e.expected, t, n)}
            ${$("Actual", e.actual, t, n)}
            ${d ? j`<span>${Math.abs(d)} min ${d > 0 ? "late" : "early"}</span>` : N}
            <span>${c}</span>
            ${n ? j`<span>${n}</span>` : N}
            ${r ? j`<span>Last updated <time datetime=${e.lastSuccess}>${r}</time></span>` : N}
          </span>
          ${this.renderWeeklyHint(e, t)}
        </button>
      </li>
    `;
	}
	renderWeeklyHint(e, t) {
		let n = e.weeklyState, r = n && n !== "off" && n !== "tracking";
		return !e.repeatWeekly || !e.terminal && !r ? N : j`
      <span class="details weekly">
        <span>${n && Qe.get(n) || (e.terminal ? "Waiting for next train" : "Weekly repeat")}</span>
        ${$("Next weekly target", e.weeklyNextScheduled, t, "")}
      </span>
    `;
	}
	openMoreInfo(e) {
		this.dispatchEvent(new CustomEvent("hass-more-info", {
			bubbles: !0,
			composed: !0,
			detail: { entityId: e }
		}));
	}
	static {
		this.styles = o`
    :host {
      display: block;
      min-width: 0;
    }

    h2 {
      margin: 0;
      padding: 16px 16px 12px;
      font-size: var(--ha-font-size-l, 18px);
      font-weight: var(--ha-font-weight-semibold, 600);
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      border-block-start: 1px solid var(--divider-color, #dadce0);
    }

    .journey {
      display: grid;
      gap: 5px;
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      min-height: 48px;
      padding: 11px 16px;
      border: 0;
      background: transparent;
      color: var(--primary-text-color, inherit);
      text-align: start;
      font: inherit;
      cursor: pointer;
    }

    li:last-child .journey {
      border-end-start-radius: var(--ha-card-border-radius, 12px);
      border-end-end-radius: var(--ha-card-border-radius, 12px);
    }

    @media (hover: hover) {
      .journey:not(:disabled):hover {
        background: var(--secondary-background-color, #8881);
      }
    }

    .journey:focus-visible {
      outline: 2px solid var(--primary-color, #0084bc);
      outline-offset: -2px;
    }

    .journey:disabled {
      cursor: default;
      opacity: 1;
    }

    .summary,
    .status-group,
    .details {
      display: flex;
      flex-wrap: wrap;
      min-width: 0;
      overflow-wrap: anywhere;
      align-items: baseline;
      line-height: 1.4;
    }

    .weekly {
      padding-inline-start: 7px;
      border-inline-start: 2px solid var(--divider-color, #dadce0);
    }

    .summary {
      justify-content: space-between;
      gap: 3px 12px;
      font-size: var(--ha-font-size-m, 14px);
      font-weight: var(--ha-font-weight-semibold, 600);
    }

    .status {
      --status-accent: var(--divider-color, #dadce0);
      padding: 1px 7px;
      border-inline-start: 3px solid var(--status-accent);
      border-radius: 5px;
      background: var(--secondary-background-color, #8881);
      background: color-mix(in srgb, var(--status-accent) 14%, transparent);
    }

    .status[data-tone='success'] { --status-accent: var(--success-color, #288651); }
    .status[data-tone='info'] { --status-accent: var(--info-color, #287aa6); }
    .status[data-tone='warning'] { --status-accent: var(--warning-color, #d88c17); }
    .status[data-tone='error'] { --status-accent: var(--error-color, #c94440); }

    .status-group {
      gap: 3px 7px;
    }

    .details {
      gap: 3px 12px;
      color: var(--secondary-text-color, inherit);
      font-size: var(--ha-font-size-s, 12px);
    }

    time {
      color: var(--primary-text-color, inherit);
      font-variant-numeric: tabular-nums;
    }

    .stale {
      color: var(--secondary-text-color, inherit);
      font-size: var(--ha-font-size-s, 12px);
    }

    .empty {
      margin: 0;
      padding: 0 16px 16px;
      color: var(--secondary-text-color, inherit);
    }
  `;
	}
};
customElements.get("rtt-card") || customElements.define("rtt-card", $e);
var et = window.customCards ??= [];
et.some(({ type: e }) => e === "rtt-card") || et.push({
	type: "rtt-card",
	name: Xe,
	description: "Show the status, times, and platforms of tracked train journeys.",
	preview: !0
});
export { $e as RttCard };

//# sourceMappingURL=rtt-card.js.map