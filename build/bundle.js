
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/components/Button.svelte generated by Svelte v3.43.1 */
    const file$l = "src/components/Button.svelte";

    function create_fragment$n(ctx) {
    	let div;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(div, "class", "container-element svelte-1hvdsj3");
    			attr_dev(div, "style", /*createStyle*/ ctx[2]());
    			add_location(div, file$l, 40, 0, 1041);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleClick*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	let { text = "" } = $$props;
    	let { backgroundColor = "rgb(193,147,94)" } = $$props;
    	let { borderColor = "transparent" } = $$props;
    	let { borderWidth = "2px" } = $$props;
    	let { borderRadius = "40px" } = $$props;
    	let { width = null } = $$props;
    	let { fontSize = null } = $$props;
    	const dispatch = createEventDispatcher();

    	function handleClick() {
    		dispatch("click");
    	}

    	function createStyle() {
    		let style = `
            
            border-style: solid;
            border-color: ${borderColor};
            border-width: ${borderWidth};
            background-color: ${backgroundColor};
            border-radius: ${borderRadius};
        `;

    		if (width) style += `width:${width};`;
    		if (fontSize) style += `font-size: ${fontSize};`; else style += `font-size: calc(10px + 1em);`;
    		return style;
    	}

    	const writable_props = [
    		'text',
    		'backgroundColor',
    		'borderColor',
    		'borderWidth',
    		'borderRadius',
    		'width',
    		'fontSize'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('backgroundColor' in $$props) $$invalidate(3, backgroundColor = $$props.backgroundColor);
    		if ('borderColor' in $$props) $$invalidate(4, borderColor = $$props.borderColor);
    		if ('borderWidth' in $$props) $$invalidate(5, borderWidth = $$props.borderWidth);
    		if ('borderRadius' in $$props) $$invalidate(6, borderRadius = $$props.borderRadius);
    		if ('width' in $$props) $$invalidate(7, width = $$props.width);
    		if ('fontSize' in $$props) $$invalidate(8, fontSize = $$props.fontSize);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		text,
    		backgroundColor,
    		borderColor,
    		borderWidth,
    		borderRadius,
    		width,
    		fontSize,
    		dispatch,
    		handleClick,
    		createStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('backgroundColor' in $$props) $$invalidate(3, backgroundColor = $$props.backgroundColor);
    		if ('borderColor' in $$props) $$invalidate(4, borderColor = $$props.borderColor);
    		if ('borderWidth' in $$props) $$invalidate(5, borderWidth = $$props.borderWidth);
    		if ('borderRadius' in $$props) $$invalidate(6, borderRadius = $$props.borderRadius);
    		if ('width' in $$props) $$invalidate(7, width = $$props.width);
    		if ('fontSize' in $$props) $$invalidate(8, fontSize = $$props.fontSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		text,
    		handleClick,
    		createStyle,
    		backgroundColor,
    		borderColor,
    		borderWidth,
    		borderRadius,
    		width,
    		fontSize
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			text: 0,
    			backgroundColor: 3,
    			borderColor: 4,
    			borderWidth: 5,
    			borderRadius: 6,
    			width: 7,
    			fontSize: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderWidth() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderWidth(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderRadius() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderRadius(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontSize() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontSize(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/RoundButton.svelte generated by Svelte v3.43.1 */
    const file$k = "src/components/RoundButton.svelte";
    const get_default_slot_changes = dirty => ({});
    const get_default_slot_context = ctx => ({ class: "slot svelte-1eomu64" });

    function create_fragment$m(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "container svelte-1eomu64");
    			attr_dev(div, "style", /*createStyle*/ ctx[1]());
    			add_location(div, file$k, 26, 0, 658);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleClick*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RoundButton', slots, ['default']);
    	let { size = { width: 100, height: 100 } } = $$props;
    	let { backgroundColor = "#aaaaaa" } = $$props;
    	let { borderColor = "transparent" } = $$props;
    	let { borderWidth = "2px" } = $$props;
    	const dispatch = createEventDispatcher();

    	function handleClick() {
    		dispatch("click");
    	}

    	function createStyle() {
    		return `
            width: ${size.width}px;
            height: ${size.height}px;
            border-style: solid;
            border-color: ${borderColor};
            brder-width: ${borderWidth}px;
            background-color: ${backgroundColor};
        `;
    	}

    	const writable_props = ['size', 'backgroundColor', 'borderColor', 'borderWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RoundButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    		if ('backgroundColor' in $$props) $$invalidate(3, backgroundColor = $$props.backgroundColor);
    		if ('borderColor' in $$props) $$invalidate(4, borderColor = $$props.borderColor);
    		if ('borderWidth' in $$props) $$invalidate(5, borderWidth = $$props.borderWidth);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		size,
    		backgroundColor,
    		borderColor,
    		borderWidth,
    		dispatch,
    		handleClick,
    		createStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    		if ('backgroundColor' in $$props) $$invalidate(3, backgroundColor = $$props.backgroundColor);
    		if ('borderColor' in $$props) $$invalidate(4, borderColor = $$props.borderColor);
    		if ('borderWidth' in $$props) $$invalidate(5, borderWidth = $$props.borderWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		handleClick,
    		createStyle,
    		size,
    		backgroundColor,
    		borderColor,
    		borderWidth,
    		$$scope,
    		slots
    	];
    }

    class RoundButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			size: 2,
    			backgroundColor: 3,
    			borderColor: 4,
    			borderWidth: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RoundButton",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get size() {
    		throw new Error("<RoundButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<RoundButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<RoundButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<RoundButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderColor() {
    		throw new Error("<RoundButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderColor(value) {
    		throw new Error("<RoundButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderWidth() {
    		throw new Error("<RoundButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderWidth(value) {
    		throw new Error("<RoundButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/svg_icons/MitadDobleIcon.svelte generated by Svelte v3.43.1 */

    const file$j = "src/components/svg_icons/MitadDobleIcon.svelte";

    // (26:4) {#if withMainText}
    function create_if_block_1$1(ctx) {
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			set_style(path0, "stroke", "none");
    			set_style(path0, "fill-rule", "nonzero");
    			set_style(path0, "fill", /*borderColor*/ ctx[0]);
    			set_style(path0, "fill-opacity", "1");
    			attr_dev(path0, "d", "M 163.34375 275.023438 L 168.199219 275.023438 L 213.101563 339.644531 L 257.847656 275.023438 L 262.703125 275.023438 L 262.703125 381.210938 L 257.546875 381.210938 L 257.546875 283.972656 L 213.101563 347.6875 L 212.796875 347.6875 L 168.351563 283.972656 L 168.351563 381.210938 L 163.34375 381.210938 ");
    			add_location(path0, file$j, 26, 8, 753);
    			set_style(path1, "stroke", "none");
    			set_style(path1, "fill-rule", "nonzero");
    			set_style(path1, "fill", /*borderColor*/ ctx[0]);
    			set_style(path1, "fill-opacity", "1");
    			attr_dev(path1, "d", "M 310.507813 381.210938 L 315.664063 381.210938 L 315.664063 275.023438 L 310.507813 275.023438 Z M 310.507813 381.210938 ");
    			add_location(path1, file$j, 27, 8, 1154);
    			set_style(path2, "stroke", "none");
    			set_style(path2, "fill-rule", "nonzero");
    			set_style(path2, "fill", /*borderColor*/ ctx[0]);
    			set_style(path2, "fill-opacity", "1");
    			attr_dev(path2, "d", "M 391.210938 279.730469 L 353.441406 279.730469 L 353.441406 275.023438 L 434.292969 275.023438 L 434.292969 279.730469 L 396.371094 279.730469 L 396.371094 381.210938 L 391.210938 381.210938 ");
    			add_location(path2, file$j, 28, 8, 1371);
    			set_style(path3, "stroke", "none");
    			set_style(path3, "fill-rule", "nonzero");
    			set_style(path3, "fill", /*borderColor*/ ctx[0]);
    			set_style(path3, "fill-opacity", "1");
    			attr_dev(path3, "d", "M 530.78125 345.5625 L 500.140625 280.335938 L 469.648438 345.5625 Z M 497.863281 274.265625 L 502.71875 274.265625 L 553.078125 381.210938 L 547.464844 381.210938 L 533.054688 350.265625 L 467.375 350.265625 L 452.8125 381.210938 L 447.5 381.210938 ");
    			add_location(path3, file$j, 29, 8, 1658);
    			set_style(path4, "stroke", "none");
    			set_style(path4, "fill-rule", "nonzero");
    			set_style(path4, "fill", /*borderColor*/ ctx[0]);
    			set_style(path4, "fill-opacity", "1");
    			attr_dev(path4, "d", "M 624.847656 376.507813 C 655.339844 376.507813 675.8125 355.269531 675.8125 328.421875 L 675.8125 328.117188 C 675.8125 301.269531 655.339844 279.730469 624.691406 279.730469 L 595.265625 279.730469 L 595.265625 376.507813 Z M 590.109375 275.023438 L 624.691406 275.023438 C 658.066406 275.023438 681.121094 298.082031 681.121094 327.96875 L 681.121094 328.269531 C 681.121094 358.152344 658.066406 381.210938 624.691406 381.210938 L 590.109375 381.210938 ");
    			add_location(path4, file$j, 30, 8, 2003);
    			set_style(path5, "stroke", "none");
    			set_style(path5, "fill-rule", "nonzero");
    			set_style(path5, "fill", /*borderColor*/ ctx[0]);
    			set_style(path5, "fill-opacity", "1");
    			attr_dev(path5, "d", "M 224.378906 447.304688 C 224.378906 431.003906 213.207031 419.574219 196.644531 419.574219 L 181.007813 419.574219 L 181.007813 475.035156 L 196.644531 475.035156 C 213.207031 475.035156 224.378906 463.863281 224.378906 447.566406 Z M 196.644531 493.300781 L 160.765625 493.300781 L 160.765625 401.304688 L 196.644531 401.304688 C 225.558594 401.304688 245.535156 421.152344 245.535156 447.039063 L 245.535156 447.304688 C 245.535156 473.195313 225.558594 493.300781 196.644531 493.300781 ");
    			add_location(path5, file$j, 31, 8, 2555);
    			set_style(path6, "stroke", "none");
    			set_style(path6, "fill-rule", "nonzero");
    			set_style(path6, "fill", /*borderColor*/ ctx[0]);
    			set_style(path6, "fill-opacity", "1");
    			attr_dev(path6, "d", "M 349.238281 447.304688 C 349.238281 431.535156 337.675781 418.386719 321.378906 418.386719 C 305.082031 418.386719 293.777344 431.269531 293.777344 447.039063 L 293.777344 447.304688 C 293.777344 463.074219 305.34375 476.214844 321.640625 476.214844 C 337.933594 476.214844 349.238281 463.335938 349.238281 447.566406 Z M 321.378906 494.878906 C 292.988281 494.878906 272.617188 473.722656 272.617188 447.566406 L 272.617188 447.304688 C 272.617188 421.152344 293.253906 399.726563 321.640625 399.726563 C 350.03125 399.726563 370.398438 420.886719 370.398438 447.039063 L 370.398438 447.304688 C 370.398438 473.457031 349.765625 494.878906 321.378906 494.878906 ");
    			add_location(path6, file$j, 32, 8, 3140);
    			set_style(path7, "stroke", "none");
    			set_style(path7, "fill-rule", "nonzero");
    			set_style(path7, "fill", /*borderColor*/ ctx[0]);
    			set_style(path7, "fill-opacity", "1");
    			attr_dev(path7, "d", "M 459.652344 465.308594 C 459.652344 459.132813 455.050781 455.320313 444.667969 455.320313 L 421.273438 455.320313 L 421.273438 475.558594 L 445.324219 475.558594 C 454.261719 475.558594 459.652344 472.40625 459.652344 465.570313 Z M 454.527344 428.511719 C 454.527344 422.464844 449.796875 419.046875 441.25 419.046875 L 421.273438 419.046875 L 421.273438 438.5 L 439.9375 438.5 C 448.875 438.5 454.527344 435.605469 454.527344 428.773438 Z M 445.324219 493.300781 L 401.5625 493.300781 L 401.5625 401.304688 L 444.273438 401.304688 C 463.066406 401.304688 474.632813 410.636719 474.632813 425.09375 L 474.632813 425.355469 C 474.632813 435.738281 469.117188 441.519531 462.542969 445.203125 C 473.1875 449.273438 479.761719 455.453125 479.761719 467.804688 L 479.761719 468.070313 C 479.761719 484.890625 466.089844 493.300781 445.324219 493.300781 ");
    			add_location(path7, file$j, 33, 8, 3899);
    			set_style(path8, "stroke", "none");
    			set_style(path8, "fill-rule", "nonzero");
    			set_style(path8, "fill", /*borderColor*/ ctx[0]);
    			set_style(path8, "fill-opacity", "1");
    			attr_dev(path8, "d", "M 509.601563 493.300781 L 509.601563 401.304688 L 529.84375 401.304688 L 529.84375 474.902344 L 575.710938 474.902344 L 575.710938 493.300781 ");
    			add_location(path8, file$j, 34, 8, 4846);
    			set_style(path9, "stroke", "none");
    			set_style(path9, "fill-rule", "nonzero");
    			set_style(path9, "fill", /*borderColor*/ ctx[0]);
    			set_style(path9, "fill-opacity", "1");
    			attr_dev(path9, "d", "M 604.105469 493.300781 L 604.105469 401.304688 L 673.5 401.304688 L 673.5 419.308594 L 624.214844 419.308594 L 624.214844 437.972656 L 667.585938 437.972656 L 667.585938 455.976563 L 624.214844 455.976563 L 624.214844 475.296875 L 674.15625 475.296875 L 674.15625 493.300781 ");
    			add_location(path9, file$j, 35, 8, 5083);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    			insert_dev(target, path2, anchor);
    			insert_dev(target, path3, anchor);
    			insert_dev(target, path4, anchor);
    			insert_dev(target, path5, anchor);
    			insert_dev(target, path6, anchor);
    			insert_dev(target, path7, anchor);
    			insert_dev(target, path8, anchor);
    			insert_dev(target, path9, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*borderColor*/ 1) {
    				set_style(path0, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path1, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path2, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path3, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path4, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path5, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path6, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path7, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path8, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path9, "fill", /*borderColor*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    			if (detaching) detach_dev(path2);
    			if (detaching) detach_dev(path3);
    			if (detaching) detach_dev(path4);
    			if (detaching) detach_dev(path5);
    			if (detaching) detach_dev(path6);
    			if (detaching) detach_dev(path7);
    			if (detaching) detach_dev(path8);
    			if (detaching) detach_dev(path9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(26:4) {#if withMainText}",
    		ctx
    	});

    	return block;
    }

    // (40:4) {#if withBottomText}
    function create_if_block$1(ctx) {
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let path17;

    	const block = {
    		c: function create() {
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			path17 = svg_element("path");
    			set_style(path0, "stroke", "none");
    			set_style(path0, "fill-rule", "nonzero");
    			set_style(path0, "fill", /*borderColor*/ ctx[0]);
    			set_style(path0, "fill-opacity", "1");
    			attr_dev(path0, "d", "M 211.726563 554.269531 C 211.726563 547.167969 217.632813 540.605469 224.925781 540.605469 C 229.007813 540.605469 231.738281 542.582031 233.21875 545.316406 L 231.078125 546.636719 C 229.730469 544.34375 227.941406 542.894531 224.703125 542.894531 C 218.984375 542.894531 214.332031 548.363281 214.332031 554.171875 C 214.332031 558.414063 217.226563 561.058594 221.21875 561.058594 C 224.167969 561.058594 226.148438 559.894531 228.03125 558.070313 L 229.699219 559.707031 C 227.65625 561.746094 225.046875 563.378906 221.089844 563.378906 C 215.90625 563.378906 211.726563 559.925781 211.726563 554.269531 ");
    			add_location(path0, file$j, 40, 8, 5537);
    			set_style(path1, "stroke", "none");
    			set_style(path1, "fill-rule", "nonzero");
    			set_style(path1, "fill", /*borderColor*/ ctx[0]);
    			set_style(path1, "fill-opacity", "1");
    			attr_dev(path1, "d", "M 247.589844 552.195313 C 250.792969 552.195313 253.117188 551.191406 254.09375 549.585938 C 254.78125 548.675781 255.097656 547.671875 254.972656 546.507813 C 254.8125 544.5 253.152344 543.269531 249.945313 543.269531 L 244.039063 543.269531 L 241.621094 552.195313 Z M 242.152344 540.980469 L 250.070313 540.980469 C 254.28125 540.980469 256.859375 542.675781 257.265625 545.59375 C 257.550781 547.230469 257.203125 548.769531 256.289063 550.152344 C 255.253906 552.289063 252.867188 553.675781 249.664063 554.171875 L 254.1875 562.96875 L 251.328125 562.96875 L 246.992188 554.425781 L 241.023438 554.425781 L 238.726563 562.96875 L 236.25 562.96875 ");
    			add_location(path1, file$j, 41, 8, 6242);
    			set_style(path2, "stroke", "none");
    			set_style(path2, "fill-rule", "nonzero");
    			set_style(path2, "fill", /*borderColor*/ ctx[0]);
    			set_style(path2, "fill-opacity", "1");
    			attr_dev(path2, "d", "M 267.835938 540.980469 L 283.578125 540.980469 L 282.949219 543.242188 L 269.691406 543.242188 L 267.679688 550.75 L 279.523438 550.75 L 278.898438 553.015625 L 267.082031 553.015625 L 265.007813 560.710938 L 278.425781 560.710938 L 277.824219 562.972656 L 261.933594 562.972656 ");
    			add_location(path2, file$j, 42, 8, 6990);
    			set_style(path3, "stroke", "none");
    			set_style(path3, "fill-rule", "nonzero");
    			set_style(path3, "fill", /*borderColor*/ ctx[0]);
    			set_style(path3, "fill-opacity", "1");
    			attr_dev(path3, "d", "M 301.878906 554.929688 L 299.898438 543.652344 L 291.855469 554.929688 Z M 299.363281 540.824219 L 301.75 540.824219 L 305.835938 562.972656 L 303.289063 562.972656 L 302.285156 557.15625 L 290.285156 557.15625 L 286.136719 562.972656 L 283.40625 562.972656 ");
    			add_location(path3, file$j, 43, 8, 7365);
    			set_style(path4, "stroke", "none");
    			set_style(path4, "fill-rule", "nonzero");
    			set_style(path4, "fill", /*borderColor*/ ctx[0]);
    			set_style(path4, "fill-opacity", "1");
    			attr_dev(path4, "d", "M 320.644531 543.269531 L 313.230469 543.269531 L 313.859375 540.980469 L 331.171875 540.980469 L 330.539063 543.269531 L 323.128906 543.269531 L 317.851563 562.972656 L 315.367188 562.972656 ");
    			add_location(path4, file$j, 44, 8, 7719);
    			set_style(path5, "stroke", "none");
    			set_style(path5, "fill-rule", "nonzero");
    			set_style(path5, "fill", /*borderColor*/ ctx[0]);
    			set_style(path5, "fill-opacity", "1");
    			attr_dev(path5, "d", "M 338.785156 540.980469 L 341.265625 540.980469 L 335.359375 562.972656 L 332.878906 562.972656 Z M 338.785156 540.980469 ");
    			add_location(path5, file$j, 45, 8, 8006);
    			set_style(path6, "stroke", "none");
    			set_style(path6, "fill-rule", "nonzero");
    			set_style(path6, "fill", /*borderColor*/ ctx[0]);
    			set_style(path6, "fill-opacity", "1");
    			attr_dev(path6, "d", "M 348.3125 540.980469 L 350.949219 540.980469 L 353.652344 559.894531 L 366.5 540.980469 L 369.328125 540.980469 L 353.996094 563.128906 L 351.765625 563.128906 ");
    			add_location(path6, file$j, 46, 8, 8223);
    			set_style(path7, "stroke", "none");
    			set_style(path7, "fill-rule", "nonzero");
    			set_style(path7, "fill", /*borderColor*/ ctx[0]);
    			set_style(path7, "fill-opacity", "1");
    			attr_dev(path7, "d", "M 376.757813 540.980469 L 379.238281 540.980469 L 373.335938 562.972656 L 370.851563 562.972656 Z M 376.757813 540.980469 ");
    			add_location(path7, file$j, 47, 8, 8479);
    			set_style(path8, "stroke", "none");
    			set_style(path8, "fill-rule", "nonzero");
    			set_style(path8, "fill", /*borderColor*/ ctx[0]);
    			set_style(path8, "fill-opacity", "1");
    			attr_dev(path8, "d", "M 390.683594 560.675781 C 394.359375 560.675781 397.53125 559.453125 399.761719 557.222656 C 401.523438 555.460938 402.527344 553.074219 402.527344 550.375 C 402.527344 548.296875 401.867188 546.667969 400.675781 545.503906 C 399.230469 544.058594 396.902344 543.269531 393.980469 543.269531 L 390.714844 543.269531 L 386.03125 560.675781 Z M 388.828125 540.980469 L 394.140625 540.980469 C 397.78125 540.980469 400.796875 542.015625 402.714844 543.902344 C 404.285156 545.472656 405.105469 547.546875 405.105469 550.214844 C 405.105469 553.578125 403.878906 556.53125 401.644531 558.792969 C 399.007813 561.433594 395.050781 562.972656 390.367188 562.972656 L 382.921875 562.972656 ");
    			add_location(path8, file$j, 48, 8, 8696);
    			set_style(path9, "stroke", "none");
    			set_style(path9, "fill-rule", "nonzero");
    			set_style(path9, "fill", /*borderColor*/ ctx[0]);
    			set_style(path9, "fill-opacity", "1");
    			attr_dev(path9, "d", "M 425.976563 554.929688 L 423.996094 543.652344 L 415.953125 554.929688 Z M 423.464844 540.824219 L 425.851563 540.824219 L 429.933594 562.972656 L 427.390625 562.972656 L 426.382813 557.15625 L 414.386719 557.15625 L 410.238281 562.972656 L 407.5 562.972656 ");
    			add_location(path9, file$j, 49, 8, 9474);
    			set_style(path10, "stroke", "none");
    			set_style(path10, "fill-rule", "nonzero");
    			set_style(path10, "fill", /*borderColor*/ ctx[0]);
    			set_style(path10, "fill-opacity", "1");
    			attr_dev(path10, "d", "M 444.53125 560.675781 C 448.207031 560.675781 451.378906 559.453125 453.609375 557.222656 C 455.371094 555.460938 456.375 553.074219 456.375 550.375 C 456.375 548.296875 455.714844 546.667969 454.523438 545.503906 C 453.074219 544.058594 450.75 543.269531 447.832031 543.269531 L 444.5625 543.269531 L 439.878906 560.675781 Z M 442.675781 540.980469 L 447.988281 540.980469 C 451.628906 540.980469 454.644531 542.015625 456.5625 543.902344 C 458.132813 545.472656 458.949219 547.546875 458.949219 550.214844 C 458.949219 553.578125 457.726563 556.53125 455.492188 558.792969 C 452.855469 561.433594 448.898438 562.972656 444.214844 562.972656 L 436.769531 562.972656 ");
    			add_location(path10, file$j, 50, 8, 9828);
    			set_style(path11, "stroke", "none");
    			set_style(path11, "fill-rule", "nonzero");
    			set_style(path11, "fill", /*borderColor*/ ctx[0]);
    			set_style(path11, "fill-opacity", "1");
    			attr_dev(path11, "d", "M 484.546875 560.675781 C 488.222656 560.675781 491.394531 559.453125 493.625 557.222656 C 495.386719 555.460938 496.390625 553.074219 496.390625 550.375 C 496.390625 548.296875 495.730469 546.667969 494.539063 545.503906 C 493.089844 544.058594 490.765625 543.269531 487.847656 543.269531 L 484.574219 543.269531 L 479.894531 560.675781 Z M 482.691406 540.980469 L 488.003906 540.980469 C 491.644531 540.980469 494.660156 542.015625 496.578125 543.902344 C 498.148438 545.472656 498.964844 547.546875 498.964844 550.214844 C 498.964844 553.578125 497.742188 556.53125 495.507813 558.792969 C 492.871094 561.433594 488.910156 562.972656 484.230469 562.972656 L 476.785156 562.972656 ");
    			add_location(path11, file$j, 51, 8, 10591);
    			set_style(path12, "stroke", "none");
    			set_style(path12, "fill-rule", "nonzero");
    			set_style(path12, "fill", /*borderColor*/ ctx[0]);
    			set_style(path12, "fill-opacity", "1");
    			attr_dev(path12, "d", "M 510.351563 540.980469 L 512.832031 540.980469 L 506.925781 562.972656 L 504.445313 562.972656 Z M 510.351563 540.980469 ");
    			add_location(path12, file$j, 52, 8, 11369);
    			set_style(path13, "stroke", "none");
    			set_style(path13, "fill-rule", "nonzero");
    			set_style(path13, "fill", /*borderColor*/ ctx[0]);
    			set_style(path13, "fill-opacity", "1");
    			attr_dev(path13, "d", "M 518.273438 554.019531 C 518.273438 547.230469 524.058594 540.605469 531.785156 540.605469 C 536.308594 540.605469 538.695313 542.550781 540.078125 544.625 L 538.195313 546.097656 C 536.902344 544.3125 535.148438 542.863281 531.5625 542.863281 C 525.46875 542.863281 520.882813 548.363281 520.882813 553.921875 C 520.882813 558.449219 523.898438 561.085938 528.171875 561.085938 C 530.558594 561.085938 532.445313 560.425781 533.859375 559.550781 L 535.585938 553.453125 L 528.957031 553.453125 L 529.550781 551.222656 L 538.636719 551.222656 L 535.835938 561.085938 C 533.511719 562.53125 531.058594 563.378906 528.011719 563.378906 C 522.671875 563.378906 518.273438 559.925781 518.273438 554.019531 ");
    			add_location(path13, file$j, 53, 8, 11586);
    			set_style(path14, "stroke", "none");
    			set_style(path14, "fill-rule", "nonzero");
    			set_style(path14, "fill", /*borderColor*/ ctx[0]);
    			set_style(path14, "fill-opacity", "1");
    			attr_dev(path14, "d", "M 550.429688 540.980469 L 552.914063 540.980469 L 547.007813 562.972656 L 544.523438 562.972656 Z M 550.429688 540.980469 ");
    			add_location(path14, file$j, 54, 8, 12384);
    			set_style(path15, "stroke", "none");
    			set_style(path15, "fill-rule", "nonzero");
    			set_style(path15, "fill", /*borderColor*/ ctx[0]);
    			set_style(path15, "fill-opacity", "1");
    			attr_dev(path15, "d", "M 567.089844 543.269531 L 559.675781 543.269531 L 560.304688 540.980469 L 577.613281 540.980469 L 576.984375 543.269531 L 569.570313 543.269531 L 564.296875 562.972656 L 561.8125 562.972656 ");
    			add_location(path15, file$j, 55, 8, 12601);
    			set_style(path16, "stroke", "none");
    			set_style(path16, "fill-rule", "nonzero");
    			set_style(path16, "fill", /*borderColor*/ ctx[0]);
    			set_style(path16, "fill-opacity", "1");
    			attr_dev(path16, "d", "M 592.863281 554.929688 L 590.882813 543.652344 L 582.839844 554.929688 Z M 590.347656 540.824219 L 592.734375 540.824219 L 596.820313 562.972656 L 594.273438 562.972656 L 593.269531 557.15625 L 581.269531 557.15625 L 577.121094 562.972656 L 574.390625 562.972656 ");
    			add_location(path16, file$j, 56, 8, 12886);
    			set_style(path17, "stroke", "none");
    			set_style(path17, "fill-rule", "nonzero");
    			set_style(path17, "fill", /*borderColor*/ ctx[0]);
    			set_style(path17, "fill-opacity", "1");
    			attr_dev(path17, "d", "M 609.558594 540.980469 L 612.039063 540.980469 L 606.761719 560.675781 L 619.140625 560.675781 L 618.511719 562.972656 L 603.652344 562.972656 ");
    			add_location(path17, file$j, 57, 8, 13245);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path0, anchor);
    			insert_dev(target, path1, anchor);
    			insert_dev(target, path2, anchor);
    			insert_dev(target, path3, anchor);
    			insert_dev(target, path4, anchor);
    			insert_dev(target, path5, anchor);
    			insert_dev(target, path6, anchor);
    			insert_dev(target, path7, anchor);
    			insert_dev(target, path8, anchor);
    			insert_dev(target, path9, anchor);
    			insert_dev(target, path10, anchor);
    			insert_dev(target, path11, anchor);
    			insert_dev(target, path12, anchor);
    			insert_dev(target, path13, anchor);
    			insert_dev(target, path14, anchor);
    			insert_dev(target, path15, anchor);
    			insert_dev(target, path16, anchor);
    			insert_dev(target, path17, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*borderColor*/ 1) {
    				set_style(path0, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path1, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path2, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path3, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path4, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path5, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path6, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path7, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path8, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path9, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path10, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path11, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path12, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path13, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path14, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path15, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path16, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path17, "fill", /*borderColor*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path0);
    			if (detaching) detach_dev(path1);
    			if (detaching) detach_dev(path2);
    			if (detaching) detach_dev(path3);
    			if (detaching) detach_dev(path4);
    			if (detaching) detach_dev(path5);
    			if (detaching) detach_dev(path6);
    			if (detaching) detach_dev(path7);
    			if (detaching) detach_dev(path8);
    			if (detaching) detach_dev(path9);
    			if (detaching) detach_dev(path10);
    			if (detaching) detach_dev(path11);
    			if (detaching) detach_dev(path12);
    			if (detaching) detach_dev(path13);
    			if (detaching) detach_dev(path14);
    			if (detaching) detach_dev(path15);
    			if (detaching) detach_dev(path16);
    			if (detaching) detach_dev(path17);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(40:4) {#if withBottomText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let svg;
    	let g;
    	let if_block0_anchor;
    	let path0;
    	let path1;
    	let svg_width_value;
    	let svg_height_value;
    	let if_block0 = /*withMainText*/ ctx[2] && create_if_block_1$1(ctx);
    	let if_block1 = /*withBottomText*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			set_style(path0, "stroke", "none");
    			set_style(path0, "fill-rule", "nonzero");
    			set_style(path0, "fill", /*fillColor*/ ctx[1]);
    			set_style(path0, "fill-opacity", "1");
    			attr_dev(path0, "d", "M 365.882813 114.050781 L 384.589844 208.066406 C 385.960938 214.953125 390.878906 219.761719 396.550781 219.761719 L 464.199219 219.761719 C 470.023438 219.761719 475.121094 214.839844 476.601563 207.785156 L 495.855469 115.925781 ");
    			add_location(path0, file$j, 62, 4, 13547);
    			set_style(path1, "stroke", "none");
    			set_style(path1, "fill-rule", "nonzero");
    			set_style(path1, "fill", /*borderColor*/ ctx[0]);
    			set_style(path1, "fill-opacity", "1");
    			attr_dev(path1, "d", "M 545.917969 97.621094 C 545.917969 106.691406 538.542969 114.066406 529.472656 114.066406 L 512.398438 114.066406 L 526.824219 57.929688 L 529.472656 57.929688 C 538.542969 57.929688 545.917969 65.308594 545.917969 74.378906 Z M 529.472656 41.714844 L 529.074219 41.714844 C 528.222656 33.84375 525.378906 27.609375 520.527344 23.199219 C 513.746094 17.03125 505.636719 16.925781 503.265625 17.015625 L 327.332031 17.015625 C 324.941406 16.929688 316.855469 17.03125 310.070313 23.199219 C 304.199219 28.535156 301.222656 36.496094 301.222656 46.863281 L 301.222656 48.011719 L 326.996094 148.300781 C 328.242188 153.144531 333.171875 156.074219 338.03125 154.820313 C 342.878906 153.574219 345.800781 148.632813 344.554688 143.785156 L 319.367188 45.785156 C 319.507813 41.515625 320.488281 38.3125 322.164063 36.707031 C 323.898438 35.039063 326.328125 35.117188 326.214844 35.105469 L 503.523438 35.144531 L 503.734375 35.160156 L 504.167969 35.121094 C 504.269531 35.121094 506.691406 35.03125 508.433594 36.707031 C 510.109375 38.3125 511.089844 41.515625 511.230469 45.785156 L 493.6875 114.050781 L 364.863281 114.050781 C 359.867188 114.050781 355.8125 117.683594 355.8125 122.164063 C 355.8125 126.648438 359.867188 130.285156 364.863281 130.285156 L 489.515625 130.285156 L 471.371094 200.875 C 470.199219 203.175781 464.945313 211.660156 451.164063 211.660156 L 379.433594 211.660156 C 365.523438 211.660156 360.300781 203.019531 359.234375 200.914063 L 352.804688 175.902344 C 351.5625 171.054688 346.632813 168.125 341.769531 169.382813 C 336.925781 170.628906 334.003906 175.566406 335.25 180.417969 L 341.878906 206.195313 L 342.253906 207.339844 C 342.621094 208.257813 351.660156 229.789063 379.433594 229.789063 L 451.164063 229.789063 C 478.9375 229.789063 487.972656 208.257813 488.347656 207.339844 L 488.570313 206.78125 L 508.230469 130.285156 L 529.472656 130.285156 C 547.484375 130.285156 562.136719 115.632813 562.136719 97.621094 L 562.136719 74.378906 C 562.136719 56.367188 547.484375 41.714844 529.472656 41.714844 ");
    			add_location(path1, file$j, 65, 4, 13907);
    			attr_dev(g, "id", "surface1");
    			add_location(g, file$j, 23, 4, 660);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", svg_width_value = /*width*/ ctx[4] + "px");
    			attr_dev(svg, "height", svg_height_value = /*width*/ ctx[4] * /*getRatio*/ ctx[5]() + "px");
    			attr_dev(svg, "viewBox", "0 0 841.89 595.276");
    			attr_dev(svg, "version", "1.1");
    			add_location(svg, file$j, 17, 0, 450);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, path0);
    			append_dev(g, path1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*withMainText*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*withBottomText*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(g, path0);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*fillColor*/ 2) {
    				set_style(path0, "fill", /*fillColor*/ ctx[1]);
    			}

    			if (dirty & /*borderColor*/ 1) {
    				set_style(path1, "fill", /*borderColor*/ ctx[0]);
    			}

    			if (dirty & /*width*/ 16 && svg_width_value !== (svg_width_value = /*width*/ ctx[4] + "px")) {
    				attr_dev(svg, "width", svg_width_value);
    			}

    			if (dirty & /*width*/ 16 && svg_height_value !== (svg_height_value = /*width*/ ctx[4] * /*getRatio*/ ctx[5]() + "px")) {
    				attr_dev(svg, "height", svg_height_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MitadDobleIcon', slots, []);
    	let { borderColor = "#414042" } = $$props;
    	let { fillColor = "#C69D64" } = $$props;
    	let { withMainText = true } = $$props;
    	let { withBottomText = true } = $$props;
    	let { width = 841 } = $$props;

    	// Ratio of height/width in several configurations of the logo
    	function getRatio() {
    		if (withMainText && withBottomText) return 0.707070;
    		if (withMainText && !withBottomText) return 1.0; else return 1.0;
    	}

    	const writable_props = ['borderColor', 'fillColor', 'withMainText', 'withBottomText', 'width'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MitadDobleIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('borderColor' in $$props) $$invalidate(0, borderColor = $$props.borderColor);
    		if ('fillColor' in $$props) $$invalidate(1, fillColor = $$props.fillColor);
    		if ('withMainText' in $$props) $$invalidate(2, withMainText = $$props.withMainText);
    		if ('withBottomText' in $$props) $$invalidate(3, withBottomText = $$props.withBottomText);
    		if ('width' in $$props) $$invalidate(4, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({
    		borderColor,
    		fillColor,
    		withMainText,
    		withBottomText,
    		width,
    		getRatio
    	});

    	$$self.$inject_state = $$props => {
    		if ('borderColor' in $$props) $$invalidate(0, borderColor = $$props.borderColor);
    		if ('fillColor' in $$props) $$invalidate(1, fillColor = $$props.fillColor);
    		if ('withMainText' in $$props) $$invalidate(2, withMainText = $$props.withMainText);
    		if ('withBottomText' in $$props) $$invalidate(3, withBottomText = $$props.withBottomText);
    		if ('width' in $$props) $$invalidate(4, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [borderColor, fillColor, withMainText, withBottomText, width, getRatio];
    }

    class MitadDobleIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			borderColor: 0,
    			fillColor: 1,
    			withMainText: 2,
    			withBottomText: 3,
    			width: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MitadDobleIcon",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get borderColor() {
    		throw new Error("<MitadDobleIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderColor(value) {
    		throw new Error("<MitadDobleIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fillColor() {
    		throw new Error("<MitadDobleIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<MitadDobleIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withMainText() {
    		throw new Error("<MitadDobleIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withMainText(value) {
    		throw new Error("<MitadDobleIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withBottomText() {
    		throw new Error("<MitadDobleIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withBottomText(value) {
    		throw new Error("<MitadDobleIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<MitadDobleIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<MitadDobleIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/svg_icons/PlayIcon.svelte generated by Svelte v3.43.1 */

    const file$i = "src/components/svg_icons/PlayIcon.svelte";

    function create_fragment$k(ctx) {
    	let svg;
    	let g15;
    	let path0;
    	let path1;
    	let g0;
    	let g1;
    	let g2;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g16;
    	let g17;
    	let g18;
    	let g19;
    	let g20;
    	let g21;
    	let g22;
    	let g23;
    	let g24;
    	let g25;
    	let g26;
    	let g27;
    	let g28;
    	let g29;
    	let g30;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g15 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g0 = svg_element("g");
    			g1 = svg_element("g");
    			g2 = svg_element("g");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g16 = svg_element("g");
    			g17 = svg_element("g");
    			g18 = svg_element("g");
    			g19 = svg_element("g");
    			g20 = svg_element("g");
    			g21 = svg_element("g");
    			g22 = svg_element("g");
    			g23 = svg_element("g");
    			g24 = svg_element("g");
    			g25 = svg_element("g");
    			g26 = svg_element("g");
    			g27 = svg_element("g");
    			g28 = svg_element("g");
    			g29 = svg_element("g");
    			g30 = svg_element("g");
    			attr_dev(path0, "d", "M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069\n\t\tc0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532\n\t\tc0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z");
    			add_location(path0, file$i, 6, 1, 292);
    			attr_dev(path1, "d", "M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021\n\t\tC30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518\n\t\tc6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z");
    			add_location(path1, file$i, 9, 1, 606);
    			add_location(g0, file$i, 12, 1, 941);
    			add_location(g1, file$i, 14, 1, 952);
    			add_location(g2, file$i, 16, 1, 963);
    			add_location(g3, file$i, 18, 1, 974);
    			add_location(g4, file$i, 20, 1, 985);
    			add_location(g5, file$i, 22, 1, 996);
    			add_location(g6, file$i, 24, 1, 1007);
    			add_location(g7, file$i, 26, 1, 1018);
    			add_location(g8, file$i, 28, 1, 1029);
    			add_location(g9, file$i, 30, 1, 1040);
    			add_location(g10, file$i, 32, 1, 1051);
    			add_location(g11, file$i, 34, 1, 1062);
    			add_location(g12, file$i, 36, 1, 1073);
    			add_location(g13, file$i, 38, 1, 1084);
    			add_location(g14, file$i, 40, 1, 1095);
    			add_location(g15, file$i, 5, 0, 287);
    			add_location(g16, file$i, 43, 0, 1110);
    			add_location(g17, file$i, 45, 0, 1119);
    			add_location(g18, file$i, 47, 0, 1128);
    			add_location(g19, file$i, 49, 0, 1137);
    			add_location(g20, file$i, 51, 0, 1146);
    			add_location(g21, file$i, 53, 0, 1155);
    			add_location(g22, file$i, 55, 0, 1164);
    			add_location(g23, file$i, 57, 0, 1173);
    			add_location(g24, file$i, 59, 0, 1182);
    			add_location(g25, file$i, 61, 0, 1191);
    			add_location(g26, file$i, 63, 0, 1200);
    			add_location(g27, file$i, 65, 0, 1209);
    			add_location(g28, file$i, 67, 0, 1218);
    			add_location(g29, file$i, 69, 0, 1227);
    			add_location(g30, file$i, 71, 0, 1236);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 30.051 30.051");
    			set_style(svg, "enable-background", "new 0 0 30.051 30.051");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$i, 3, 0, 49);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g15);
    			append_dev(g15, path0);
    			append_dev(g15, path1);
    			append_dev(g15, g0);
    			append_dev(g15, g1);
    			append_dev(g15, g2);
    			append_dev(g15, g3);
    			append_dev(g15, g4);
    			append_dev(g15, g5);
    			append_dev(g15, g6);
    			append_dev(g15, g7);
    			append_dev(g15, g8);
    			append_dev(g15, g9);
    			append_dev(g15, g10);
    			append_dev(g15, g11);
    			append_dev(g15, g12);
    			append_dev(g15, g13);
    			append_dev(g15, g14);
    			append_dev(svg, g16);
    			append_dev(svg, g17);
    			append_dev(svg, g18);
    			append_dev(svg, g19);
    			append_dev(svg, g20);
    			append_dev(svg, g21);
    			append_dev(svg, g22);
    			append_dev(svg, g23);
    			append_dev(svg, g24);
    			append_dev(svg, g25);
    			append_dev(svg, g26);
    			append_dev(svg, g27);
    			append_dev(svg, g28);
    			append_dev(svg, g29);
    			append_dev(svg, g30);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PlayIcon', slots, []);
    	let { fill = "#000" } = $$props;
    	const writable_props = ['fill'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PlayIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    	};

    	$$self.$capture_state = () => ({ fill });

    	$$self.$inject_state = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill];
    }

    class PlayIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { fill: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayIcon",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get fill() {
    		throw new Error("<PlayIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<PlayIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/svg_icons/PauseIcon.svelte generated by Svelte v3.43.1 */

    const file$h = "src/components/svg_icons/PauseIcon.svelte";

    function create_fragment$j(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "d", "m436.508 74.94c-99.913-99.913-261.64-99.928-361.567 0-99.913 99.913-99.928 261.64 0 361.567 99.913 99.913 261.64 99.928 361.567 0 99.912-99.912 99.927-261.639 0-361.567zm-180.784 394.45c-117.816 0-213.667-95.851-213.667-213.667s95.851-213.666 213.667-213.666 213.666 95.851 213.666 213.667-95.85 213.666-213.666 213.666z");
    			add_location(path0, file$h, 4, 164, 214);
    			attr_dev(path1, "d", "m298.39 160.057c-11.598 0-21 9.402-21 21v149.333c0 11.598 9.402 21 21 21s21-9.402 21-21v-149.333c0-11.598-9.401-21-21-21z");
    			add_location(path1, file$h, 4, 496, 546);
    			attr_dev(path2, "d", "m213.057 160.057c-11.598 0-21 9.402-21 21v149.333c0 11.598 9.402 21 21 21s21-9.402 21-21v-149.333c0-11.598-9.401-21-21-21z");
    			add_location(path2, file$h, 4, 629, 679);
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			attr_dev(svg, "enable-background", "new 0 0 511.448 511.448");
    			attr_dev(svg, "height", "512");
    			attr_dev(svg, "viewBox", "0 0 511.448 511.448");
    			attr_dev(svg, "width", "512");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$h, 4, 0, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PauseIcon', slots, []);
    	let { fill = "#000" } = $$props;
    	const writable_props = ['fill'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PauseIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    	};

    	$$self.$capture_state = () => ({ fill });

    	$$self.$inject_state = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill];
    }

    class PauseIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { fill: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PauseIcon",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get fill() {
    		throw new Error("<PauseIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<PauseIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/svg_icons/MuteIcon.svelte generated by Svelte v3.43.1 */

    const file$g = "src/components/svg_icons/MuteIcon.svelte";

    function create_fragment$i(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path0;
    	let g3;
    	let g2;
    	let path1;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g15;
    	let g16;
    	let g17;
    	let g18;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			path1 = svg_element("path");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g15 = svg_element("g");
    			g16 = svg_element("g");
    			g17 = svg_element("g");
    			g18 = svg_element("g");
    			attr_dev(path0, "d", "M262.781,57.853c-5.043-2.556-11.093-2.058-15.652,1.284L130.59,144.6H15c-8.285,0-15,6.716-15,15v192.801\n\t\t\tc0,8.284,6.715,15,15,15h115.59l116.54,85.461c2.622,1.924,5.737,2.904,8.872,2.904c2.312,0,4.636-0.535,6.779-1.62\n\t\t\tc5.041-2.555,8.219-7.728,8.219-13.38V71.233C271,65.581,267.822,60.408,262.781,57.853z");
    			add_location(path0, file$g, 8, 2, 303);
    			add_location(g0, file$g, 7, 1, 297);
    			add_location(g1, file$g, 6, 0, 292);
    			attr_dev(path1, "d", "M445.912,256.004l61.693-61.693c5.859-5.857,5.859-15.355,0-21.213c-5.857-5.857-15.353-5.857-21.213,0l-61.693,61.693\n\t\t\tl-61.693-61.693c-5.858-5.857-15.354-5.857-21.213,0c-5.857,5.857-5.857,15.355,0,21.213l61.693,61.693l-61.693,61.693\n\t\t\tc-5.857,5.857-5.857,15.355,0,21.213c2.93,2.929,6.768,4.393,10.607,4.393c3.838,0,7.678-1.465,10.605-4.393l61.693-61.693\n\t\t\tl61.693,61.693c2.93,2.929,6.768,4.393,10.607,4.393c3.838,0,7.678-1.465,10.605-4.393c5.859-5.858,5.859-15.355,0-21.213\n\t\t\tL445.912,256.004z");
    			add_location(path1, file$g, 15, 2, 644);
    			add_location(g2, file$g, 14, 1, 638);
    			add_location(g3, file$g, 13, 0, 633);
    			add_location(g4, file$g, 22, 0, 1164);
    			add_location(g5, file$g, 24, 0, 1173);
    			add_location(g6, file$g, 26, 0, 1182);
    			add_location(g7, file$g, 28, 0, 1191);
    			add_location(g8, file$g, 30, 0, 1200);
    			add_location(g9, file$g, 32, 0, 1209);
    			add_location(g10, file$g, 34, 0, 1218);
    			add_location(g11, file$g, 36, 0, 1227);
    			add_location(g12, file$g, 38, 0, 1236);
    			add_location(g13, file$g, 40, 0, 1245);
    			add_location(g14, file$g, 42, 0, 1254);
    			add_location(g15, file$g, 44, 0, 1263);
    			add_location(g16, file$g, 46, 0, 1272);
    			add_location(g17, file$g, 48, 0, 1281);
    			add_location(g18, file$g, 50, 0, 1290);
    			attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 511.999 511.999");
    			set_style(svg, "enable-background", "new 0 0 511.999 511.999");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$g, 4, 0, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(svg, g3);
    			append_dev(g3, g2);
    			append_dev(g2, path1);
    			append_dev(svg, g4);
    			append_dev(svg, g5);
    			append_dev(svg, g6);
    			append_dev(svg, g7);
    			append_dev(svg, g8);
    			append_dev(svg, g9);
    			append_dev(svg, g10);
    			append_dev(svg, g11);
    			append_dev(svg, g12);
    			append_dev(svg, g13);
    			append_dev(svg, g14);
    			append_dev(svg, g15);
    			append_dev(svg, g16);
    			append_dev(svg, g17);
    			append_dev(svg, g18);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MuteIcon', slots, []);
    	let { fill = "#000" } = $$props;
    	const writable_props = ['fill'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MuteIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    	};

    	$$self.$capture_state = () => ({ fill });

    	$$self.$inject_state = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill];
    }

    class MuteIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { fill: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MuteIcon",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get fill() {
    		throw new Error("<MuteIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<MuteIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/svg_icons/VolumeIcon.svelte generated by Svelte v3.43.1 */

    const file$f = "src/components/svg_icons/VolumeIcon.svelte";

    function create_fragment$h(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let g0;
    	let g1;
    	let g2;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			g0 = svg_element("g");
    			g1 = svg_element("g");
    			g2 = svg_element("g");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			attr_dev(path0, "d", "M278.944,17.577c-5.568-2.656-12.128-1.952-16.928,1.92L106.368,144.009H32c-17.632,0-32,14.368-32,32v128\n\tc0,17.664,14.368,32,32,32h74.368l155.616,124.512c2.912,2.304,6.464,3.488,10.016,3.488c2.368,0,4.736-0.544,6.944-1.6\n\tc5.536-2.656,9.056-8.256,9.056-14.4v-416C288,25.865,284.48,20.265,278.944,17.577z");
    			add_location(path0, file$f, 6, 0, 276);
    			attr_dev(path1, "d", "M368.992,126.857c-6.304-6.208-16.416-6.112-22.624,0.128c-6.208,6.304-6.144,16.416,0.128,22.656\n\tC370.688,173.513,384,205.609,384,240.009s-13.312,66.496-37.504,90.368c-6.272,6.176-6.336,16.32-0.128,22.624\n\tc3.136,3.168,7.264,4.736,11.36,4.736c4.064,0,8.128-1.536,11.264-4.64C399.328,323.241,416,283.049,416,240.009\n\tS399.328,156.777,368.992,126.857z");
    			add_location(path1, file$f, 9, 0, 591);
    			attr_dev(path2, "d", "M414.144,81.769c-6.304-6.24-16.416-6.176-22.656,0.096c-6.208,6.272-6.144,16.416,0.096,22.624\n\tC427.968,140.553,448,188.681,448,240.009s-20.032,99.424-56.416,135.488c-6.24,6.24-6.304,16.384-0.096,22.656\n\tc3.168,3.136,7.264,4.704,11.36,4.704c4.064,0,8.16-1.536,11.296-4.64C456.64,356.137,480,299.945,480,240.009\n\tS456.64,123.881,414.144,81.769z");
    			add_location(path2, file$f, 13, 0, 952);
    			add_location(g0, file$f, 17, 0, 1307);
    			add_location(g1, file$f, 19, 0, 1316);
    			add_location(g2, file$f, 21, 0, 1325);
    			add_location(g3, file$f, 23, 0, 1334);
    			add_location(g4, file$f, 25, 0, 1343);
    			add_location(g5, file$f, 27, 0, 1352);
    			add_location(g6, file$f, 29, 0, 1361);
    			add_location(g7, file$f, 31, 0, 1370);
    			add_location(g8, file$f, 33, 0, 1379);
    			add_location(g9, file$f, 35, 0, 1388);
    			add_location(g10, file$f, 37, 0, 1397);
    			add_location(g11, file$f, 39, 0, 1406);
    			add_location(g12, file$f, 41, 0, 1415);
    			add_location(g13, file$f, 43, 0, 1424);
    			add_location(g14, file$f, 45, 0, 1433);
    			attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 480 480");
    			set_style(svg, "enable-background", "new 0 0 480 480");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$f, 4, 0, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, g0);
    			append_dev(svg, g1);
    			append_dev(svg, g2);
    			append_dev(svg, g3);
    			append_dev(svg, g4);
    			append_dev(svg, g5);
    			append_dev(svg, g6);
    			append_dev(svg, g7);
    			append_dev(svg, g8);
    			append_dev(svg, g9);
    			append_dev(svg, g10);
    			append_dev(svg, g11);
    			append_dev(svg, g12);
    			append_dev(svg, g13);
    			append_dev(svg, g14);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fill*/ 1) {
    				attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('VolumeIcon', slots, []);
    	let { fill = "#000" } = $$props;
    	const writable_props = ['fill'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<VolumeIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    	};

    	$$self.$capture_state = () => ({ fill });

    	$$self.$inject_state = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill];
    }

    class VolumeIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { fill: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VolumeIcon",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get fill() {
    		throw new Error("<VolumeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<VolumeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/svg_icons/ArrowDown.svelte generated by Svelte v3.43.1 */

    const file$e = "src/components/svg_icons/ArrowDown.svelte";

    function create_fragment$g(ctx) {
    	let svg;
    	let g0;
    	let path;
    	let g1;
    	let g2;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g15;
    	let svg_width_value;
    	let svg_height_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			g1 = svg_element("g");
    			g2 = svg_element("g");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g15 = svg_element("g");
    			attr_dev(path, "d", "M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751\n\t\tc12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0\n\t\tc12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z");
    			add_location(path, file$e, 9, 1, 378);
    			add_location(g0, file$e, 8, 0, 373);
    			add_location(g1, file$e, 13, 0, 712);
    			add_location(g2, file$e, 15, 0, 721);
    			add_location(g3, file$e, 17, 0, 730);
    			add_location(g4, file$e, 19, 0, 739);
    			add_location(g5, file$e, 21, 0, 748);
    			add_location(g6, file$e, 23, 0, 757);
    			add_location(g7, file$e, 25, 0, 766);
    			add_location(g8, file$e, 27, 0, 775);
    			add_location(g9, file$e, 29, 0, 784);
    			add_location(g10, file$e, 31, 0, 793);
    			add_location(g11, file$e, 33, 0, 802);
    			add_location(g12, file$e, 35, 0, 811);
    			add_location(g13, file$e, 37, 0, 820);
    			add_location(g14, file$e, 39, 0, 829);
    			add_location(g15, file$e, 41, 0, 838);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "width", svg_width_value = "" + (/*width*/ ctx[2] + "px"));
    			attr_dev(svg, "height", svg_height_value = "" + (/*height*/ ctx[1] + "px"));
    			attr_dev(svg, "viewBox", "0 0 451.847 451.847");
    			set_style(svg, "enable-background", "new 0 0 451.847 451.847");
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			add_location(svg, file$e, 5, 0, 91);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g0);
    			append_dev(g0, path);
    			append_dev(svg, g1);
    			append_dev(svg, g2);
    			append_dev(svg, g3);
    			append_dev(svg, g4);
    			append_dev(svg, g5);
    			append_dev(svg, g6);
    			append_dev(svg, g7);
    			append_dev(svg, g8);
    			append_dev(svg, g9);
    			append_dev(svg, g10);
    			append_dev(svg, g11);
    			append_dev(svg, g12);
    			append_dev(svg, g13);
    			append_dev(svg, g14);
    			append_dev(svg, g15);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width*/ 4 && svg_width_value !== (svg_width_value = "" + (/*width*/ ctx[2] + "px"))) {
    				attr_dev(svg, "width", svg_width_value);
    			}

    			if (dirty & /*height*/ 2 && svg_height_value !== (svg_height_value = "" + (/*height*/ ctx[1] + "px"))) {
    				attr_dev(svg, "height", svg_height_value);
    			}

    			if (dirty & /*fill*/ 1) {
    				attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ArrowDown', slots, []);
    	let { fill = "#000" } = $$props;
    	let { height = 20 } = $$props;
    	let { width = 20 } = $$props;
    	const writable_props = ['fill', 'height', 'width'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ArrowDown> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('width' in $$props) $$invalidate(2, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({ fill, height, width });

    	$$self.$inject_state = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('width' in $$props) $$invalidate(2, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, height, width];
    }

    class ArrowDown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { fill: 0, height: 1, width: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArrowDown",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get fill() {
    		throw new Error("<ArrowDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<ArrowDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<ArrowDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<ArrowDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<ArrowDown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<ArrowDown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/home/HeroVideo.svelte generated by Svelte v3.43.1 */
    const file$d = "src/pages/home/HeroVideo.svelte";

    // (50:50) {:else}
    function create_else_block_1(ctx) {
    	let playicon;
    	let current;
    	playicon = new PlayIcon({ props: { fill: "#fff" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(playicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(playicon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(playicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(50:50) {:else}",
    		ctx
    	});

    	return block;
    }

    // (50:12) {#if paused}
    function create_if_block_1(ctx) {
    	let pauseicon;
    	let current;
    	pauseicon = new PauseIcon({ props: { fill: "#fff" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(pauseicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pauseicon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pauseicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pauseicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pauseicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(50:12) {#if paused}",
    		ctx
    	});

    	return block;
    }

    // (45:8) <RoundButton         size={iconSize}         backgroundColor="transparent"         on:click={handlePlayPauseButton}         >
    function create_default_slot_1$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*paused*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(45:8) <RoundButton         size={iconSize}         backgroundColor=\\\"transparent\\\"         on:click={handlePlayPauseButton}         >",
    		ctx
    	});

    	return block;
    }

    // (57:48) {:else}
    function create_else_block(ctx) {
    	let volumeicon;
    	let current;
    	volumeicon = new VolumeIcon({ props: { fill: "#fff" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(volumeicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(volumeicon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(volumeicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(volumeicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(volumeicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(57:48) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:12) {#if muted}
    function create_if_block(ctx) {
    	let muteicon;
    	let current;
    	muteicon = new MuteIcon({ props: { fill: "#fff" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(muteicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(muteicon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(muteicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(muteicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(muteicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(57:12) {#if muted}",
    		ctx
    	});

    	return block;
    }

    // (52:8) <RoundButton         size={iconSize}         backgroundColor="transparent"         on:click={handleMuteButton}         >
    function create_default_slot$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*muted*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(52:8) <RoundButton         size={iconSize}         backgroundColor=\\\"transparent\\\"         on:click={handleMuteButton}         >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div4;
    	let div0;
    	let roundbutton0;
    	let t0;
    	let roundbutton1;
    	let t1;
    	let div1;
    	let t2;
    	let mitaddobleicon;
    	let t3;
    	let video;
    	let track;
    	let video_src_value;
    	let video_is_paused = true;
    	let t4;
    	let div3;
    	let button;
    	let t5;
    	let div2;
    	let t6;
    	let arrowdown;
    	let current;
    	let mounted;
    	let dispose;

    	roundbutton0 = new RoundButton({
    			props: {
    				size: /*iconSize*/ ctx[6],
    				backgroundColor: "transparent",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	roundbutton0.$on("click", /*handlePlayPauseButton*/ ctx[7]);

    	roundbutton1 = new RoundButton({
    			props: {
    				size: /*iconSize*/ ctx[6],
    				backgroundColor: "transparent",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	roundbutton1.$on("click", /*handleMuteButton*/ ctx[8]);

    	mitaddobleicon = new MitadDobleIcon({
    			props: {
    				borderColor: "#fff",
    				width: /*logoWidth*/ ctx[5]
    			},
    			$$inline: true
    		});

    	button = new Button({
    			props: {
    				text: "Ver más",
    				backgroundColor: "transparent",
    				borderColor: "white"
    			},
    			$$inline: true
    		});

    	arrowdown = new ArrowDown({ props: { fill: "#fff" }, $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			create_component(roundbutton0.$$.fragment);
    			t0 = space();
    			create_component(roundbutton1.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			create_component(mitaddobleicon.$$.fragment);
    			t3 = space();
    			video = element("video");
    			track = element("track");
    			t4 = space();
    			div3 = element("div");
    			create_component(button.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			t6 = space();
    			create_component(arrowdown.$$.fragment);
    			attr_dev(div0, "class", "button-container svelte-motuan");
    			add_location(div0, file$d, 43, 4, 1257);
    			attr_dev(div1, "class", "backdrop svelte-motuan");
    			set_style(div1, "background-color", /*backdropColor*/ ctx[1]);
    			add_location(div1, file$d, 59, 4, 1788);
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$d, 69, 8, 2024);
    			if (!src_url_equal(video.src, video_src_value = /*videoSrc*/ ctx[0])) attr_dev(video, "src", video_src_value);
    			video.loop = /*loop*/ ctx[2];
    			video.autoplay = true;
    			attr_dev(video, "class", "svelte-motuan");
    			add_location(video, file$d, 62, 4, 1924);
    			set_style(div2, "height", "10px");
    			add_location(div2, file$d, 73, 8, 2234);
    			attr_dev(div3, "id", "see-more");
    			attr_dev(div3, "class", "bounce-animation svelte-motuan");
    			add_location(div3, file$d, 71, 4, 2065);
    			attr_dev(div4, "class", "container-element svelte-motuan");
    			add_location(div4, file$d, 42, 0, 1221);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			mount_component(roundbutton0, div0, null);
    			append_dev(div0, t0);
    			mount_component(roundbutton1, div0, null);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div4, t2);
    			mount_component(mitaddobleicon, div4, null);
    			append_dev(div4, t3);
    			append_dev(div4, video);
    			append_dev(video, track);
    			video.muted = /*muted*/ ctx[4];
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			mount_component(button, div3, null);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div3, t6);
    			mount_component(arrowdown, div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(video, "play", /*video_play_pause_handler*/ ctx[11]),
    					listen_dev(video, "pause", /*video_play_pause_handler*/ ctx[11]),
    					listen_dev(video, "volumechange", /*video_volumechange_handler*/ ctx[12]),
    					listen_dev(div3, "click", /*handleSeeMore*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const roundbutton0_changes = {};

    			if (dirty & /*$$scope, paused*/ 8200) {
    				roundbutton0_changes.$$scope = { dirty, ctx };
    			}

    			roundbutton0.$set(roundbutton0_changes);
    			const roundbutton1_changes = {};

    			if (dirty & /*$$scope, muted*/ 8208) {
    				roundbutton1_changes.$$scope = { dirty, ctx };
    			}

    			roundbutton1.$set(roundbutton1_changes);

    			if (!current || dirty & /*backdropColor*/ 2) {
    				set_style(div1, "background-color", /*backdropColor*/ ctx[1]);
    			}

    			const mitaddobleicon_changes = {};
    			if (dirty & /*logoWidth*/ 32) mitaddobleicon_changes.width = /*logoWidth*/ ctx[5];
    			mitaddobleicon.$set(mitaddobleicon_changes);

    			if (!current || dirty & /*videoSrc*/ 1 && !src_url_equal(video.src, video_src_value = /*videoSrc*/ ctx[0])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (!current || dirty & /*loop*/ 4) {
    				prop_dev(video, "loop", /*loop*/ ctx[2]);
    			}

    			if (dirty & /*paused*/ 8 && video_is_paused !== (video_is_paused = /*paused*/ ctx[3])) {
    				video[video_is_paused ? "pause" : "play"]();
    			}

    			if (dirty & /*muted*/ 16) {
    				video.muted = /*muted*/ ctx[4];
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(roundbutton0.$$.fragment, local);
    			transition_in(roundbutton1.$$.fragment, local);
    			transition_in(mitaddobleicon.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			transition_in(arrowdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(roundbutton0.$$.fragment, local);
    			transition_out(roundbutton1.$$.fragment, local);
    			transition_out(mitaddobleicon.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			transition_out(arrowdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(roundbutton0);
    			destroy_component(roundbutton1);
    			destroy_component(mitaddobleicon);
    			destroy_component(button);
    			destroy_component(arrowdown);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HeroVideo', slots, []);
    	let { videoSrc = null } = $$props;
    	let { backdropColor = "transparent" } = $$props;
    	let { loop = true } = $$props;
    	let { onSeeMore = null } = $$props;
    	const iconSize = { width: 80, height: 80 };
    	let paused = true;
    	let muted = true;
    	let logoWidth = window.innerWidth * 0.55;

    	function handlePlayPauseButton() {
    		$$invalidate(3, paused = !paused);
    	}

    	function handleMuteButton() {
    		$$invalidate(4, muted = !muted);
    	}

    	function handleSeeMore() {
    		if (onSeeMore) onSeeMore();
    	}

    	window.addEventListener("resize", () => {
    		$$invalidate(5, logoWidth = window.innerWidth * 0.8);
    		if (logoWidth > 1100) $$invalidate(5, logoWidth = 900);
    	});

    	const writable_props = ['videoSrc', 'backdropColor', 'loop', 'onSeeMore'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HeroVideo> was created with unknown prop '${key}'`);
    	});

    	function video_play_pause_handler() {
    		paused = this.paused;
    		$$invalidate(3, paused);
    	}

    	function video_volumechange_handler() {
    		muted = this.muted;
    		$$invalidate(4, muted);
    	}

    	$$self.$$set = $$props => {
    		if ('videoSrc' in $$props) $$invalidate(0, videoSrc = $$props.videoSrc);
    		if ('backdropColor' in $$props) $$invalidate(1, backdropColor = $$props.backdropColor);
    		if ('loop' in $$props) $$invalidate(2, loop = $$props.loop);
    		if ('onSeeMore' in $$props) $$invalidate(10, onSeeMore = $$props.onSeeMore);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		RoundButton,
    		MitadDobleIcon,
    		PlayIcon,
    		PauseIcon,
    		MuteIcon,
    		VolumeIcon,
    		ArrowDown,
    		videoSrc,
    		backdropColor,
    		loop,
    		onSeeMore,
    		iconSize,
    		paused,
    		muted,
    		logoWidth,
    		handlePlayPauseButton,
    		handleMuteButton,
    		handleSeeMore
    	});

    	$$self.$inject_state = $$props => {
    		if ('videoSrc' in $$props) $$invalidate(0, videoSrc = $$props.videoSrc);
    		if ('backdropColor' in $$props) $$invalidate(1, backdropColor = $$props.backdropColor);
    		if ('loop' in $$props) $$invalidate(2, loop = $$props.loop);
    		if ('onSeeMore' in $$props) $$invalidate(10, onSeeMore = $$props.onSeeMore);
    		if ('paused' in $$props) $$invalidate(3, paused = $$props.paused);
    		if ('muted' in $$props) $$invalidate(4, muted = $$props.muted);
    		if ('logoWidth' in $$props) $$invalidate(5, logoWidth = $$props.logoWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		videoSrc,
    		backdropColor,
    		loop,
    		paused,
    		muted,
    		logoWidth,
    		iconSize,
    		handlePlayPauseButton,
    		handleMuteButton,
    		handleSeeMore,
    		onSeeMore,
    		video_play_pause_handler,
    		video_volumechange_handler
    	];
    }

    class HeroVideo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			videoSrc: 0,
    			backdropColor: 1,
    			loop: 2,
    			onSeeMore: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeroVideo",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get videoSrc() {
    		throw new Error("<HeroVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoSrc(value) {
    		throw new Error("<HeroVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdropColor() {
    		throw new Error("<HeroVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdropColor(value) {
    		throw new Error("<HeroVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loop() {
    		throw new Error("<HeroVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loop(value) {
    		throw new Error("<HeroVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSeeMore() {
    		throw new Error("<HeroVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSeeMore(value) {
    		throw new Error("<HeroVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isObject(value) {
      const type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    function getColumnSizeClass(isXs, colWidth, colSize) {
      if (colSize === true || colSize === '') {
        return isXs ? 'col' : `col-${colWidth}`;
      } else if (colSize === 'auto') {
        return isXs ? 'col-auto' : `col-${colWidth}-auto`;
      }

      return isXs ? `col-${colSize}` : `col-${colWidth}-${colSize}`;
    }

    function toClassName(value) {
      let result = '';

      if (typeof value === 'string' || typeof value === 'number') {
        result += value;
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          result = value.map(toClassName).filter(Boolean).join(' ');
        } else {
          for (let key in value) {
            if (value[key]) {
              result && (result += ' ');
              result += key;
            }
          }
        }
      }

      return result;
    }

    function classnames(...args) {
      return args.map(toClassName).filter(Boolean).join(' ');
    }

    /* node_modules/sveltestrap/src/Col.svelte generated by Svelte v3.43.1 */
    const file$c = "node_modules/sveltestrap/src/Col.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	let div_levels = [
    		/*$$restProps*/ ctx[1],
    		{
    			class: div_class_value = /*colClasses*/ ctx[0].join(' ')
    		}
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$c, 60, 0, 1427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1],
    				{ class: div_class_value }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	const omit_props_names = ["class","xs","sm","md","lg","xl","xxl"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Col', slots, ['default']);
    	let { class: className = '' } = $$props;
    	let { xs = undefined } = $$props;
    	let { sm = undefined } = $$props;
    	let { md = undefined } = $$props;
    	let { lg = undefined } = $$props;
    	let { xl = undefined } = $$props;
    	let { xxl = undefined } = $$props;
    	const colClasses = [];
    	const lookup = { xs, sm, md, lg, xl, xxl };

    	Object.keys(lookup).forEach(colWidth => {
    		const columnProp = lookup[colWidth];

    		if (!columnProp && columnProp !== '') {
    			return; //no value for this width
    		}

    		const isXs = colWidth === 'xs';

    		if (isObject(columnProp)) {
    			const colSizeInterfix = isXs ? '-' : `-${colWidth}-`;
    			const colClass = getColumnSizeClass(isXs, colWidth, columnProp.size);

    			if (columnProp.size || columnProp.size === '') {
    				colClasses.push(colClass);
    			}

    			if (columnProp.push) {
    				colClasses.push(`push${colSizeInterfix}${columnProp.push}`);
    			}

    			if (columnProp.pull) {
    				colClasses.push(`pull${colSizeInterfix}${columnProp.pull}`);
    			}

    			if (columnProp.offset) {
    				colClasses.push(`offset${colSizeInterfix}${columnProp.offset}`);
    			}
    		} else {
    			colClasses.push(getColumnSizeClass(isXs, colWidth, columnProp));
    		}
    	});

    	if (!colClasses.length) {
    		colClasses.push('col');
    	}

    	if (className) {
    		colClasses.push(className);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('xs' in $$new_props) $$invalidate(3, xs = $$new_props.xs);
    		if ('sm' in $$new_props) $$invalidate(4, sm = $$new_props.sm);
    		if ('md' in $$new_props) $$invalidate(5, md = $$new_props.md);
    		if ('lg' in $$new_props) $$invalidate(6, lg = $$new_props.lg);
    		if ('xl' in $$new_props) $$invalidate(7, xl = $$new_props.xl);
    		if ('xxl' in $$new_props) $$invalidate(8, xxl = $$new_props.xxl);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getColumnSizeClass,
    		isObject,
    		className,
    		xs,
    		sm,
    		md,
    		lg,
    		xl,
    		xxl,
    		colClasses,
    		lookup
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('xs' in $$props) $$invalidate(3, xs = $$new_props.xs);
    		if ('sm' in $$props) $$invalidate(4, sm = $$new_props.sm);
    		if ('md' in $$props) $$invalidate(5, md = $$new_props.md);
    		if ('lg' in $$props) $$invalidate(6, lg = $$new_props.lg);
    		if ('xl' in $$props) $$invalidate(7, xl = $$new_props.xl);
    		if ('xxl' in $$props) $$invalidate(8, xxl = $$new_props.xxl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [colClasses, $$restProps, className, xs, sm, md, lg, xl, xxl, $$scope, slots];
    }

    class Col extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			class: 2,
    			xs: 3,
    			sm: 4,
    			md: 5,
    			lg: 6,
    			xl: 7,
    			xxl: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Col",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get class() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xs() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xs(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sm() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sm(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get md() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set md(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lg() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lg(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xl() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xl(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xxl() {
    		throw new Error("<Col>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xxl(value) {
    		throw new Error("<Col>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/Container.svelte generated by Svelte v3.43.1 */
    const file$b = "node_modules/sveltestrap/src/Container.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);
    	let div_levels = [/*$$restProps*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$b, 23, 0, 542);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1],
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class","sm","md","lg","xl","xxl","fluid"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Container', slots, ['default']);
    	let { class: className = '' } = $$props;
    	let { sm = undefined } = $$props;
    	let { md = undefined } = $$props;
    	let { lg = undefined } = $$props;
    	let { xl = undefined } = $$props;
    	let { xxl = undefined } = $$props;
    	let { fluid = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('sm' in $$new_props) $$invalidate(3, sm = $$new_props.sm);
    		if ('md' in $$new_props) $$invalidate(4, md = $$new_props.md);
    		if ('lg' in $$new_props) $$invalidate(5, lg = $$new_props.lg);
    		if ('xl' in $$new_props) $$invalidate(6, xl = $$new_props.xl);
    		if ('xxl' in $$new_props) $$invalidate(7, xxl = $$new_props.xxl);
    		if ('fluid' in $$new_props) $$invalidate(8, fluid = $$new_props.fluid);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		className,
    		sm,
    		md,
    		lg,
    		xl,
    		xxl,
    		fluid,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('sm' in $$props) $$invalidate(3, sm = $$new_props.sm);
    		if ('md' in $$props) $$invalidate(4, md = $$new_props.md);
    		if ('lg' in $$props) $$invalidate(5, lg = $$new_props.lg);
    		if ('xl' in $$props) $$invalidate(6, xl = $$new_props.xl);
    		if ('xxl' in $$props) $$invalidate(7, xxl = $$new_props.xxl);
    		if ('fluid' in $$props) $$invalidate(8, fluid = $$new_props.fluid);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, sm, md, lg, xl, xxl, fluid*/ 508) {
    			$$invalidate(0, classes = classnames(className, {
    				'container-sm': sm,
    				'container-md': md,
    				'container-lg': lg,
    				'container-xl': xl,
    				'container-xxl': xxl,
    				'container-fluid': fluid,
    				container: !sm && !md && !lg && !xl && !xxl && !fluid
    			}));
    		}
    	};

    	return [classes, $$restProps, className, sm, md, lg, xl, xxl, fluid, $$scope, slots];
    }

    class Container extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			class: 2,
    			sm: 3,
    			md: 4,
    			lg: 5,
    			xl: 6,
    			xxl: 7,
    			fluid: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Container",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get class() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sm() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sm(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get md() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set md(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lg() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lg(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xl() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xl(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xxl() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xxl(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fluid() {
    		throw new Error("<Container>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fluid(value) {
    		throw new Error("<Container>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/Icon.svelte generated by Svelte v3.43.1 */
    const file$a = "node_modules/sveltestrap/src/Icon.svelte";

    function create_fragment$c(ctx) {
    	let i;
    	let i_levels = [/*$$restProps*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let i_data = {};

    	for (let i = 0; i < i_levels.length; i += 1) {
    		i_data = assign(i_data, i_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			i = element("i");
    			set_attributes(i, i_data);
    			add_location(i, file$a, 10, 0, 189);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(i, i_data = get_spread_update(i_levels, [
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1],
    				dirty & /*classes*/ 1 && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class","name"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);
    	let { class: className = '' } = $$props;
    	let { name = '' } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('name' in $$new_props) $$invalidate(3, name = $$new_props.name);
    	};

    	$$self.$capture_state = () => ({ classnames, className, name, classes });

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('name' in $$props) $$invalidate(3, name = $$new_props.name);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, name*/ 12) {
    			$$invalidate(0, classes = classnames(className, `bi-${name}`));
    		}
    	};

    	return [classes, $$restProps, className, name];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { class: 2, name: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sveltestrap/src/Row.svelte generated by Svelte v3.43.1 */
    const file$9 = "node_modules/sveltestrap/src/Row.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	let div_levels = [/*$$restProps*/ ctx[1], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$9, 39, 0, 980);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1],
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getCols(cols) {
    	const colsValue = parseInt(cols);

    	if (!isNaN(colsValue)) {
    		if (colsValue > 0) {
    			return [`row-cols-${colsValue}`];
    		}
    	} else if (typeof cols === 'object') {
    		return ['xs', 'sm', 'md', 'lg', 'xl'].map(colWidth => {
    			const isXs = colWidth === 'xs';
    			const colSizeInterfix = isXs ? '-' : `-${colWidth}-`;
    			const value = cols[colWidth];

    			if (typeof value === 'number' && value > 0) {
    				return `row-cols${colSizeInterfix}${value}`;
    			}

    			return null;
    		}).filter(value => !!value);
    	}

    	return [];
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let classes;
    	const omit_props_names = ["class","noGutters","form","cols"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Row', slots, ['default']);
    	let { class: className = '' } = $$props;
    	let { noGutters = false } = $$props;
    	let { form = false } = $$props;
    	let { cols = 0 } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('noGutters' in $$new_props) $$invalidate(3, noGutters = $$new_props.noGutters);
    		if ('form' in $$new_props) $$invalidate(4, form = $$new_props.form);
    		if ('cols' in $$new_props) $$invalidate(5, cols = $$new_props.cols);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		className,
    		noGutters,
    		form,
    		cols,
    		getCols,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('noGutters' in $$props) $$invalidate(3, noGutters = $$new_props.noGutters);
    		if ('form' in $$props) $$invalidate(4, form = $$new_props.form);
    		if ('cols' in $$props) $$invalidate(5, cols = $$new_props.cols);
    		if ('classes' in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className, noGutters, form, cols*/ 60) {
    			$$invalidate(0, classes = classnames(className, noGutters ? 'gx-0' : null, form ? 'form-row' : 'row', ...getCols(cols)));
    		}
    	};

    	return [classes, $$restProps, className, noGutters, form, cols, $$scope, slots];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { class: 2, noGutters: 3, form: 4, cols: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGutters() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGutters(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get form() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set form(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cols() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cols(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/VideoCard.svelte generated by Svelte v3.43.1 */
    const file$8 = "src/components/VideoCard.svelte";

    function create_fragment$a(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let p;
    	let t0_value = /*category*/ ctx[1].toUpperCase() + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let h1;
    	let t3_value = /*title*/ ctx[0].toUpperCase() + "";
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			h1 = element("h1");
    			t3 = text(t3_value);
    			add_location(p, file$8, 20, 39, 470);
    			attr_dev(div0, "class", "category-box svelte-ujr684");
    			add_location(div0, file$8, 20, 12, 443);
    			if (!src_url_equal(img.src, img_src_value = /*imgSrc*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-ujr684");
    			add_location(img, file$8, 21, 12, 520);
    			attr_dev(div1, "class", "card-component svelte-ujr684");
    			add_location(div1, file$8, 17, 4, 361);
    			attr_dev(h1, "class", "title svelte-ujr684");
    			add_location(h1, file$8, 23, 4, 561);
    			attr_dev(div2, "class", "container-element svelte-ujr684");
    			add_location(div2, file$8, 16, 0, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(div1, t1);
    			append_dev(div1, img);
    			append_dev(div2, t2);
    			append_dev(div2, h1);
    			append_dev(h1, t3);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*handleClick*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*category*/ 2 && t0_value !== (t0_value = /*category*/ ctx[1].toUpperCase() + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*imgSrc*/ 4 && !src_url_equal(img.src, img_src_value = /*imgSrc*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*title*/ 1 && t3_value !== (t3_value = /*title*/ ctx[0].toUpperCase() + "")) set_data_dev(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let height;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('VideoCard', slots, []);
    	let { title = "" } = $$props;
    	let { category = "" } = $$props;
    	let { imgSrc = "" } = $$props;
    	let { width = 650 } = $$props;
    	const dispatch = createEventDispatcher();

    	function handleClick() {
    		dispatch("click");
    	}

    	const writable_props = ['title', 'category', 'imgSrc', 'width'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<VideoCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('category' in $$props) $$invalidate(1, category = $$props.category);
    		if ('imgSrc' in $$props) $$invalidate(2, imgSrc = $$props.imgSrc);
    		if ('width' in $$props) $$invalidate(4, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		title,
    		category,
    		imgSrc,
    		width,
    		dispatch,
    		handleClick,
    		height
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('category' in $$props) $$invalidate(1, category = $$props.category);
    		if ('imgSrc' in $$props) $$invalidate(2, imgSrc = $$props.imgSrc);
    		if ('width' in $$props) $$invalidate(4, width = $$props.width);
    		if ('height' in $$props) height = $$props.height;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 16) {
    			height = width * 16 / 9;
    		}
    	};

    	return [title, category, imgSrc, handleClick, width];
    }

    class VideoCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			title: 0,
    			category: 1,
    			imgSrc: 2,
    			width: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VideoCard",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get title() {
    		throw new Error("<VideoCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<VideoCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get category() {
    		throw new Error("<VideoCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<VideoCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgSrc() {
    		throw new Error("<VideoCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgSrc(value) {
    		throw new Error("<VideoCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<VideoCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<VideoCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/home/WorkShowcase.svelte generated by Svelte v3.43.1 */
    const file$7 = "src/pages/home/WorkShowcase.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i].title;
    	child_ctx[4] = list[i].category;
    	child_ctx[5] = list[i].imgSrc;
    	return child_ctx;
    }

    // (59:16) <Col>
    function create_default_slot_1$2(ctx) {
    	let videocard;
    	let current;

    	videocard = new VideoCard({
    			props: {
    				title: /*title*/ ctx[3],
    				category: /*category*/ ctx[4],
    				imgSrc: /*imgSrc*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(videocard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(videocard, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(videocard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(videocard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(videocard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(59:16) <Col>",
    		ctx
    	});

    	return block;
    }

    // (57:12) {#each data as {title, category, imgSrc}}
    function create_each_block$1(ctx) {
    	let div;
    	let col;
    	let t;
    	let current;

    	col = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(col.$$.fragment);
    			t = space();
    			set_style(div, "padding", "10px");
    			add_location(div, file$7, 57, 12, 1604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(col, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(col);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(57:12) {#each data as {title, category, imgSrc}}",
    		ctx
    	});

    	return block;
    }

    // (56:8) <Row cols={{lg:3, md:2, sm:1}}>
    function create_default_slot$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(56:8) <Row cols={{lg:3, md:2, sm:1}}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div5;
    	let div4;
    	let div1;
    	let div0;
    	let t0;
    	let h1;
    	let t2;
    	let row;
    	let t3;
    	let div2;
    	let t4;
    	let div3;
    	let button;
    	let current;

    	row = new Row({
    			props: {
    				cols: { lg: 3, md: 2, sm: 1 },
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button = new Button({
    			props: { text: "Ver todos" },
    			$$inline: true
    		});

    	button.$on("click", /*handleSeeMore*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Algunos de nuestros últimos proyectos...";
    			t2 = space();
    			create_component(row.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "class", "header-second-layer svelte-1neujp1");
    			add_location(div0, file$7, 51, 12, 1357);
    			attr_dev(h1, "class", "header svelte-1neujp1");
    			add_location(h1, file$7, 52, 12, 1409);
    			attr_dev(div1, "class", "header-container svelte-1neujp1");
    			add_location(div1, file$7, 50, 8, 1314);
    			set_style(div2, "height", "20px");
    			add_location(div2, file$7, 68, 8, 1905);
    			attr_dev(div3, "id", "see-more");
    			attr_dev(div3, "class", "bounce-animation svelte-1neujp1");
    			add_location(div3, file$7, 70, 8, 1994);
    			attr_dev(div4, "class", "container-element svelte-1neujp1");
    			add_location(div4, file$7, 49, 4, 1274);
    			attr_dev(div5, "class", "background-image svelte-1neujp1");
    			add_location(div5, file$7, 48, 0, 1239);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, h1);
    			append_dev(div4, t2);
    			mount_component(row, div4, null);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			mount_component(button, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const row_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(row);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WorkShowcase', slots, []);
    	let { didTapSeeMore } = $$props;

    	const data = [
    		{
    			title: "Baile wapo",
    			category: "Baile",
    			imgSrc: "./assets/pictures/perfil_marcos.png"
    		},
    		{
    			title: "Baile crema",
    			category: "Baile",
    			imgSrc: "./assets/pictures/perfil_marcos.png"
    		},
    		{
    			title: "Baile cremisima",
    			category: "Baile",
    			imgSrc: "./assets/pictures/perfil_marcos.png"
    		},
    		{
    			title: "Baile normalito",
    			category: "Baile",
    			imgSrc: "./assets/pictures/perfil_marcos.png"
    		},
    		{
    			title: "Baile regulero",
    			category: "Baile",
    			imgSrc: "./assets/pictures/perfil_marcos.png"
    		},
    		{
    			title: "Baile pro",
    			category: "Baile",
    			imgSrc: "./assets/pictures/perfil_marcos.png"
    		}
    	];

    	function handleSeeMore() {
    		if (didTapSeeMore) didTapSeeMore();
    	}

    	const writable_props = ['didTapSeeMore'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WorkShowcase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('didTapSeeMore' in $$props) $$invalidate(2, didTapSeeMore = $$props.didTapSeeMore);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Col,
    		Row,
    		VideoCard,
    		Button,
    		didTapSeeMore,
    		data,
    		handleSeeMore
    	});

    	$$self.$inject_state = $$props => {
    		if ('didTapSeeMore' in $$props) $$invalidate(2, didTapSeeMore = $$props.didTapSeeMore);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, handleSeeMore, didTapSeeMore];
    }

    class WorkShowcase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { didTapSeeMore: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WorkShowcase",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*didTapSeeMore*/ ctx[2] === undefined && !('didTapSeeMore' in props)) {
    			console.warn("<WorkShowcase> was created without expected prop 'didTapSeeMore'");
    		}
    	}

    	get didTapSeeMore() {
    		throw new Error("<WorkShowcase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set didTapSeeMore(value) {
    		throw new Error("<WorkShowcase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/svg_icons/AdIcon.svelte generated by Svelte v3.43.1 */

    const file$6 = "src/components/svg_icons/AdIcon.svelte";

    function create_fragment$8(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			attr_dev(path0, "d", "m89.929688 108.378906c-1.859376 1.859375-2.929688 4.441406-2.929688 7.070313 0 2.640625 1.070312 5.210937 2.929688 7.070312 1.859374 1.859375 4.441406 2.929688 7.070312 2.929688 2.640625 0 5.210938-1.070313 7.070312-2.929688 1.859376-1.859375 2.929688-4.429687 2.929688-7.070312 0-2.628907-1.070312-5.210938-2.929688-7.070313-1.859374-1.859375-4.429687-2.929687-7.070312-2.929687-2.628906 0-5.210938 1.070312-7.070312 2.929687zm0 0");
    			add_location(path0, file$6, 4, 104, 179);
    			attr_dev(path1, "d", "m368.683594 105.453125h-231.683594c-5.523438 0-10 4.476563-10 10s4.476562 10 10 10h231.683594c8.445312 0 15.316406 6.867187 15.316406 15.3125v205.234375h-66.460938c-5.523437 0-10 4.476562-10 10s4.476563 10 10 10h66.460938v4.683594c0 8.445312-6.871094 15.316406-15.316406 15.316406h-292.054688c-2.355468 0-4.636718.832031-6.441406 2.351562l-50.1875 42.261719v-289.847656c0-8.445313 6.871094-15.3125 15.316406-15.3125h21.6875c5.519532 0 10-4.476563 10-10s-4.480468-10-10-10h-21.6875c-19.472656 0-35.316406 15.839844-35.316406 35.3125v311.34375c0 3.890625 2.253906 7.425781 5.78125 9.066406 1.347656.625 2.785156.933594 4.214844.933594 2.316406 0 4.605468-.804687 6.445312-2.351563l63.835938-53.757812h288.40625c19.472656 0 35.316406-15.84375 35.316406-35.316406v-229.917969c0-19.472656-15.84375-35.3125-35.316406-35.3125zm0 0");
    			add_location(path1, file$6, 4, 547, 622);
    			attr_dev(path2, "d", "m202 69.96875c5.523438 0 10-4.476562 10-10v-49.96875c0-5.523438-4.476562-10-10-10s-10 4.476562-10 10v49.96875c0 5.523438 4.476562 10 10 10zm0 0");
    			add_location(path2, file$6, 4, 1382, 1457);
    			attr_dev(path3, "d", "m277.371094 74.027344c2.5625 0 5.117187-.976563 7.070312-2.929688l34.960938-34.957031c3.90625-3.90625 3.90625-10.238281 0-14.144531s-10.238282-3.90625-14.144532 0l-34.957031 34.957031c-3.90625 3.90625-3.90625 10.238281 0 14.144531 1.953125 1.953125 4.511719 2.929688 7.070313 2.929688zm0 0");
    			add_location(path3, file$6, 4, 1537, 1612);
    			attr_dev(path4, "d", "m119.558594 71.03125c1.953125 1.953125 4.511718 2.929688 7.070312 2.929688s5.117188-.976563 7.070313-2.929688c3.90625-3.90625 3.90625-10.238281 0-14.144531l-34.960938-34.957031c-3.902343-3.90625-10.234375-3.90625-14.140625 0s-3.90625 10.234374 0 14.140624zm0 0");
    			add_location(path4, file$6, 4, 1838, 1913);
    			attr_dev(path5, "d", "m202 442.03125c-5.523438 0-10 4.476562-10 10v49.96875c0 5.523438 4.476562 10 10 10s10-4.476562 10-10v-49.96875c0-5.523438-4.476562-10-10-10zm0 0");
    			add_location(path5, file$6, 4, 2110, 2185);
    			attr_dev(path6, "d", "m284.441406 440.902344c-3.90625-3.90625-10.234375-3.90625-14.140625 0s-3.90625 10.238281 0 14.144531l34.957031 34.957031c1.953126 1.953125 4.511719 2.929688 7.070313 2.929688 2.5625 0 5.121094-.976563 7.074219-2.929688 3.902344-3.90625 3.902344-10.238281 0-14.144531zm0 0");
    			add_location(path6, file$6, 4, 2266, 2341);
    			attr_dev(path7, "d", "m119.558594 440.96875-34.960938 34.960938c-3.90625 3.90625-3.90625 10.234374 0 14.140624 1.953125 1.953126 4.511719 2.929688 7.070313 2.929688 2.558593 0 5.117187-.976562 7.070312-2.929688l34.960938-34.957031c3.90625-3.90625 3.90625-10.238281 0-14.144531s-10.234375-3.90625-14.140625 0zm0 0");
    			add_location(path7, file$6, 4, 2549, 2624);
    			attr_dev(path8, "d", "m293.917969 249.652344c0-26.207032-21.316407-47.523438-47.523438-47.523438h-21.695312c-5.519531 0-10 4.476563-10 10v88c0 5.519532 4.480469 10 10 10h21.695312c26.203125 0 47.523438-21.320312 47.523438-47.527344zm-20 12.949218c0 15.179688-12.347657 27.527344-27.523438 27.527344h-11.695312v-68h11.695312c15.175781 0 27.523438 12.34375 27.523438 27.523438zm0 0");
    			add_location(path8, file$6, 4, 2851, 2926);
    			attr_dev(path9, "d", "m119.0625 271.796875-8.457031 25.140625c-1.761719 5.234375 1.050781 10.90625 6.285156 12.667969 5.242187 1.761719 10.90625-1.054688 12.667969-6.289063l6.242187-18.550781h27.78125l6.242188 18.550781c1.402343 4.175782 5.296875 6.8125 9.476562 6.8125 1.058594 0 2.132813-.167968 3.1875-.523437 5.234375-1.761719 8.050781-7.433594 6.289063-12.667969l-29.609375-88c-1.367188-4.070312-5.183594-6.808594-9.476563-6.808594-4.292968 0-8.109375 2.738282-9.476562 6.808594l-21.144532 62.839844c-.003906.007812-.007812.011718-.007812.019531zm30.628906-28.3125 7.160156 21.28125h-14.320312zm0 0");
    			add_location(path9, file$6, 4, 3220, 3295);
    			attr_dev(path10, "d", "m270.96875 348.929688c-1.859375 1.859374-2.929688 4.441406-2.929688 7.070312 0 2.640625 1.070313 5.210938 2.929688 7.070312 1.863281 1.859376 4.441406 2.929688 7.070312 2.929688 2.632813 0 5.210938-1.070312 7.070313-2.929688 1.859375-1.859374 2.929687-4.441406 2.929687-7.070312s-1.070312-5.210938-2.929687-7.070312c-1.859375-1.859376-4.4375-2.929688-7.070313-2.929688-2.628906 0-5.210937 1.070312-7.070312 2.929688zm0 0");
    			add_location(path10, file$6, 4, 3813, 3888);
    			attr_dev(svg, "viewBox", "-54 0 512 512");
    			attr_dev(svg, "width", /*size*/ ctx[1]);
    			attr_dev(svg, "height", /*size*/ ctx[1]);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			add_location(svg, file$6, 4, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(svg, path8);
    			append_dev(svg, path9);
    			append_dev(svg, path10);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "width", /*size*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "height", /*size*/ ctx[1]);
    			}

    			if (dirty & /*fill*/ 1) {
    				attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AdIcon', slots, []);
    	let { fill = "#000" } = $$props;
    	let { size = 70 } = $$props;
    	const writable_props = ['fill', 'size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AdIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ fill, size });

    	$$self.$inject_state = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, size];
    }

    class AdIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { fill: 0, size: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AdIcon",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get fill() {
    		throw new Error("<AdIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<AdIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<AdIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<AdIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/svg_icons/MusicVideoIcon.svelte generated by Svelte v3.43.1 */

    const file$5 = "src/components/svg_icons/MusicVideoIcon.svelte";

    function create_fragment$7(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "d", "m176 264c17.671875 0 32-14.328125 32-32v-97.96875l96-27.421875v65.839844c-4.84375-2.878907-10.367188-4.417969-16-4.449219-17.671875 0-32 14.328125-32 32s14.328125 32 32 32 32-14.328125 32-32v-136c0-2.507812-1.179688-4.871094-3.183594-6.382812-2-1.507813-4.597656-1.992188-7.007812-1.304688l-112 32c-3.4375.976562-5.804688 4.117188-5.808594 7.6875v108.449219c-4.84375-2.878907-10.367188-4.417969-16-4.449219-17.671875 0-32 14.328125-32 32s14.328125 32 32 32zm112-48c-8.835938 0-16-7.164062-16-16s7.164062-16 16-16 16 7.164062 16 16-7.164062 16-16 16zm-80-113.96875 96-27.421875v15.359375l-96 27.421875zm-32 113.96875c8.835938 0 16 7.164062 16 16s-7.164062 16-16 16-16-7.164062-16-16 7.164062-16 16-16zm0 0");
    			add_location(path0, file$5, 4, 103, 178);
    			attr_dev(path1, "d", "m440 288v-256c0-4.417969-3.582031-8-8-8h-384c-4.417969 0-8 3.582031-8 8v256c0 4.417969 3.582031 8 8 8h384c4.417969 0 8-3.582031 8-8zm-16-8h-368v-240h368zm0 0");
    			add_location(path1, file$5, 4, 819, 894);
    			attr_dev(path2, "d", "m472 320h-8v-296c0-13.253906-10.746094-24-24-24h-400c-13.253906 0-24 10.746094-24 24v296h-8c-4.417969 0-8 3.582031-8 8v32c.0273438 22.082031 17.917969 39.972656 40 40h400c22.082031-.027344 39.972656-17.917969 40-40v-32c0-4.417969-3.582031-8-8-8zm-440-296c0-4.417969 3.582031-8 8-8h400c4.417969 0 8 3.582031 8 8v296h-130.945312c-5.230469.007812-10.316407 1.71875-14.488282 4.871094l-23.101562 17.527344c-1.386719 1.035156-3.070313 1.597656-4.800782 1.601562h-69.328124c-1.730469-.003906-3.414063-.566406-4.800782-1.601562l-23.457031-17.597657c-4.15625-3.109375-9.207031-4.792969-14.398437-4.800781h-130.679688zm432 336c0 13.253906-10.746094 24-24 24h-400c-13.253906 0-24-10.746094-24-24v-24h146.664062c1.730469.003906 3.414063.566406 4.800782 1.601562l23.457031 17.597657c4.15625 3.109375 9.207031 4.792969 14.398437 4.800781h69.289063c5.230469-.007812 10.320313-1.71875 14.496094-4.871094l23.125-17.527344c1.386719-1.035156 3.070312-1.597656 4.800781-1.601562h146.96875zm0 0");
    			add_location(path2, file$5, 4, 988, 1063);
    			attr_dev(svg, "width", /*size*/ ctx[1]);
    			attr_dev(svg, "height", /*size*/ ctx[1]);
    			attr_dev(svg, "viewBox", "0 -40 480 480");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			add_location(svg, file$5, 4, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "width", /*size*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "height", /*size*/ ctx[1]);
    			}

    			if (dirty & /*fill*/ 1) {
    				attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MusicVideoIcon', slots, []);
    	let { fill = "#000" } = $$props;
    	let { size = 70 } = $$props;
    	const writable_props = ['fill', 'size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MusicVideoIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ fill, size });

    	$$self.$inject_state = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, size];
    }

    class MusicVideoIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { fill: 0, size: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MusicVideoIcon",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get fill() {
    		throw new Error("<MusicVideoIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<MusicVideoIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<MusicVideoIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<MusicVideoIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/svg_icons/PuzzleIcon.svelte generated by Svelte v3.43.1 */

    const file$4 = "src/components/svg_icons/PuzzleIcon.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path0;
    	let g3;
    	let g2;
    	let path1;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g15;
    	let g16;
    	let g17;
    	let g18;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			path1 = svg_element("path");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g15 = svg_element("g");
    			g16 = svg_element("g");
    			g17 = svg_element("g");
    			g18 = svg_element("g");
    			attr_dev(path0, "d", "M472,80H280c-4.418,0-8,3.582-8,8v72c0.003,4.418,3.588,7.997,8.006,7.994c0.857-0.001,1.709-0.139,2.522-0.41\n\t\t\tl10.056-3.352c10.918-3.574,22.665,2.38,26.238,13.298c3.573,10.918-2.38,22.665-13.298,26.238c-4.204,1.376-8.737,1.376-12.941,0\n\t\t\tl-10.056-3.352c-4.192-1.396-8.722,0.87-10.118,5.062c-0.271,0.813-0.409,1.665-0.41,2.522v64h-64\n\t\t\tc-4.418,0.003-7.997,3.588-7.994,8.006c0.001,0.857,0.139,1.709,0.41,2.522l3.352,10.056c3.574,10.918-2.38,22.665-13.298,26.238\n\t\t\tc-10.918,3.574-22.665-2.38-26.238-13.298c-1.376-4.204-1.376-8.737,0-12.941l3.352-10.056c1.396-4.192-0.87-8.722-5.062-10.118\n\t\t\tc-0.813-0.271-1.665-0.409-2.522-0.41H88c-4.418,0-8,3.582-8,8v192c0,4.418,3.582,8,8,8h384c4.418,0,8-3.582,8-8V88\n\t\t\tC480,83.582,476.418,80,472,80z M272.41,397.478c-0.271,0.813-0.409,1.665-0.41,2.522v64H96V288h52.904\n\t\t\tc-6.113,19.383,4.645,40.052,24.028,46.164c19.383,6.113,40.052-4.645,46.164-24.028c2.272-7.204,2.272-14.933,0-22.137H272v64\n\t\t\tc0.003,4.418,3.588,7.997,8.006,7.994c0.857-0.001,1.709-0.139,2.522-0.41l10.056-3.352c10.918-3.573,22.665,2.38,26.238,13.298\n\t\t\tc3.573,10.918-2.38,22.665-13.298,26.238c-4.204,1.376-8.737,1.376-12.941,0l-10.056-3.352\n\t\t\tC278.336,391.02,273.806,393.286,272.41,397.478z M464,464H288v-52.904c19.383,6.113,40.052-4.645,46.164-24.028\n\t\t\tc6.113-19.383-4.645-40.052-24.028-46.164c-7.204-2.272-14.933-2.272-22.137,0V288h64c4.418-0.003,7.997-3.588,7.994-8.006\n\t\t\tc-0.001-0.857-0.139-1.709-0.41-2.522l-3.352-10.056c-3.573-10.918,2.38-22.665,13.298-26.238\n\t\t\tc10.918-3.573,22.665,2.38,26.238,13.298c1.376,4.204,1.376,8.737,0,12.941l-3.352,10.056c-1.396,4.192,0.87,8.722,5.062,10.118\n\t\t\tc0.813,0.271,1.665,0.409,2.522,0.41h64V464z M464,272h-52.904c6.113-19.383-4.645-40.052-24.028-46.164\n\t\t\tc-19.383-6.113-40.052,4.645-46.164,24.028c-2.272,7.204-2.272,14.933,0,22.137H288v-52.904\n\t\t\tc11.111,3.601,23.275,1.658,32.712-5.224c16.546-11.802,20.392-34.783,8.59-51.329c-9.32-13.066-26.033-18.585-41.302-13.639V96\n\t\t\th176V272z");
    			add_location(path0, file$4, 9, 2, 337);
    			add_location(g0, file$4, 8, 1, 331);
    			add_location(g1, file$4, 7, 0, 326);
    			attr_dev(path1, "d", "M230.137,68.904c-7.204-2.272-14.933-2.272-22.137,0V8c0-4.418-3.582-8-8-8H8C3.582,0,0,3.582,0,8v192\n\t\t\tc0,4.418,3.582,8,8,8h60.904c-6.113,19.383,4.645,40.052,24.028,46.164s40.052-4.645,46.164-24.028\n\t\t\tc2.272-7.204,2.272-14.933,0-22.137H200c4.418,0,8-3.582,8-8v-60.904c19.383,6.113,40.052-4.645,46.164-24.028\n\t\t\tC260.277,95.685,249.52,75.017,230.137,68.904z M225.525,123.768c-4.204,1.376-8.737,1.376-12.941,0l-10.056-3.352\n\t\t\tc-4.192-1.396-8.722,0.87-10.118,5.062c-0.271,0.813-0.409,1.665-0.41,2.522v64h-64c-4.418,0.003-7.997,3.588-7.994,8.006\n\t\t\tc0.001,0.857,0.139,1.709,0.41,2.522l3.352,10.056c3.574,10.918-2.38,22.665-13.298,26.238\n\t\t\tc-10.918,3.573-22.665-2.38-26.238-13.298c-1.376-4.204-1.376-8.737,0-12.941l3.352-10.056c1.396-4.192-0.87-8.722-5.062-10.118\n\t\t\tc-0.813-0.271-1.665-0.409-2.522-0.41H16V16h176v64c0.003,4.418,3.588,7.997,8.006,7.994c0.857-0.001,1.709-0.139,2.522-0.41\n\t\t\tl10.056-3.352c10.918-3.573,22.665,2.38,26.238,13.298C242.396,108.447,236.442,120.195,225.525,123.768z");
    			add_location(path1, file$4, 31, 2, 2313);
    			add_location(g2, file$4, 30, 1, 2307);
    			add_location(g3, file$4, 29, 0, 2302);
    			add_location(g4, file$4, 42, 0, 3326);
    			add_location(g5, file$4, 44, 0, 3335);
    			add_location(g6, file$4, 46, 0, 3344);
    			add_location(g7, file$4, 48, 0, 3353);
    			add_location(g8, file$4, 50, 0, 3362);
    			add_location(g9, file$4, 52, 0, 3371);
    			add_location(g10, file$4, 54, 0, 3380);
    			add_location(g11, file$4, 56, 0, 3389);
    			add_location(g12, file$4, 58, 0, 3398);
    			add_location(g13, file$4, 60, 0, 3407);
    			add_location(g14, file$4, 62, 0, 3416);
    			add_location(g15, file$4, 64, 0, 3425);
    			add_location(g16, file$4, 66, 0, 3434);
    			add_location(g17, file$4, 68, 0, 3443);
    			add_location(g18, file$4, 70, 0, 3452);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 480 480");
    			attr_dev(svg, "width", /*size*/ ctx[1]);
    			attr_dev(svg, "height", /*size*/ ctx[1]);
    			set_style(svg, "enable-background", "new 0 0 480 480");
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			add_location(svg, file$4, 5, 0, 73);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(svg, g3);
    			append_dev(g3, g2);
    			append_dev(g2, path1);
    			append_dev(svg, g4);
    			append_dev(svg, g5);
    			append_dev(svg, g6);
    			append_dev(svg, g7);
    			append_dev(svg, g8);
    			append_dev(svg, g9);
    			append_dev(svg, g10);
    			append_dev(svg, g11);
    			append_dev(svg, g12);
    			append_dev(svg, g13);
    			append_dev(svg, g14);
    			append_dev(svg, g15);
    			append_dev(svg, g16);
    			append_dev(svg, g17);
    			append_dev(svg, g18);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "width", /*size*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "height", /*size*/ ctx[1]);
    			}

    			if (dirty & /*fill*/ 1) {
    				attr_dev(svg, "fill", /*fill*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PuzzleIcon', slots, []);
    	let { fill = "#000" } = $$props;
    	let { size = 70 } = $$props;
    	const writable_props = ['fill', 'size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PuzzleIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ fill, size });

    	$$self.$inject_state = $$props => {
    		if ('fill' in $$props) $$invalidate(0, fill = $$props.fill);
    		if ('size' in $$props) $$invalidate(1, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fill, size];
    }

    class PuzzleIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { fill: 0, size: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PuzzleIcon",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get fill() {
    		throw new Error("<PuzzleIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<PuzzleIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<PuzzleIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<PuzzleIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/home/Contact.svelte generated by Svelte v3.43.1 */
    const file$3 = "src/pages/home/Contact.svelte";

    // (27:12) <Col >
    function create_default_slot_4(ctx) {
    	let div1;
    	let adicon;
    	let t0;
    	let div0;
    	let h3;
    	let t2;
    	let p;
    	let current;

    	adicon = new AdIcon({
    			props: { fill: "#C69D64", size: iconSize },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(adicon.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Publicidad";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Una de nuestras especialidades. Nuestros servicios te ayudarán a dar a conocer tú marca y producto.";
    			attr_dev(h3, "class", "svelte-1pb0ory");
    			add_location(h3, file$3, 30, 24, 1025);
    			attr_dev(p, "class", "svelte-1pb0ory");
    			add_location(p, file$3, 31, 24, 1069);
    			attr_dev(div0, "class", "text-container svelte-1pb0ory");
    			add_location(div0, file$3, 29, 20, 972);
    			attr_dev(div1, "class", "card-element svelte-1pb0ory");
    			add_location(div1, file$3, 27, 16, 862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(adicon, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(adicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(adicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(adicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(27:12) <Col >",
    		ctx
    	});

    	return block;
    }

    // (36:12) <Col>
    function create_default_slot_3(ctx) {
    	let div1;
    	let musicvideoicon;
    	let t0;
    	let div0;
    	let h3;
    	let t2;
    	let p;
    	let current;

    	musicvideoicon = new MusicVideoIcon({
    			props: { fill: "#C69D64", size: iconSize },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(musicvideoicon.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Videoclips";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Llevamos tanto colaborando con grandes artistas que al final nos hemos enamorado del género.";
    			attr_dev(h3, "class", "svelte-1pb0ory");
    			add_location(h3, file$3, 39, 24, 1450);
    			attr_dev(p, "class", "svelte-1pb0ory");
    			add_location(p, file$3, 40, 24, 1494);
    			attr_dev(div0, "class", "text-container svelte-1pb0ory");
    			add_location(div0, file$3, 38, 20, 1397);
    			attr_dev(div1, "class", "card-element svelte-1pb0ory");
    			add_location(div1, file$3, 36, 16, 1279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(musicvideoicon, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(musicvideoicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(musicvideoicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(musicvideoicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(36:12) <Col>",
    		ctx
    	});

    	return block;
    }

    // (45:12) <Col>
    function create_default_slot_2$1(ctx) {
    	let div1;
    	let puzzleicon;
    	let t0;
    	let div0;
    	let h3;
    	let t2;
    	let p;
    	let current;

    	puzzleicon = new PuzzleIcon({
    			props: { fill: "#C69D64", size: iconSize },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(puzzleicon.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Otros";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Podcast, entrevistas,  fashion films, conferencias... si es audiovisual, lo hacemos. Pregúntanos.";
    			attr_dev(h3, "class", "svelte-1pb0ory");
    			add_location(h3, file$3, 48, 24, 1864);
    			attr_dev(p, "class", "svelte-1pb0ory");
    			add_location(p, file$3, 49, 24, 1903);
    			attr_dev(div0, "class", "text-container svelte-1pb0ory");
    			add_location(div0, file$3, 47, 20, 1811);
    			attr_dev(div1, "class", "card-element svelte-1pb0ory");
    			add_location(div1, file$3, 45, 16, 1697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(puzzleicon, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(puzzleicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(puzzleicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(puzzleicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(45:12) <Col>",
    		ctx
    	});

    	return block;
    }

    // (26:8) <Row cols={{lg:3, md:1}} >
    function create_default_slot_1$1(ctx) {
    	let col0;
    	let t0;
    	let col1;
    	let t1;
    	let col2;
    	let current;

    	col0 = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col1 = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	col2 = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col0.$$.fragment);
    			t0 = space();
    			create_component(col1.$$.fragment);
    			t1 = space();
    			create_component(col2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(col1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(col2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				col0_changes.$$scope = { dirty, ctx };
    			}

    			col0.$set(col0_changes);
    			const col1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				col1_changes.$$scope = { dirty, ctx };
    			}

    			col1.$set(col1_changes);
    			const col2_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				col2_changes.$$scope = { dirty, ctx };
    			}

    			col2.$set(col2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col0.$$.fragment, local);
    			transition_in(col1.$$.fragment, local);
    			transition_in(col2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col0.$$.fragment, local);
    			transition_out(col1.$$.fragment, local);
    			transition_out(col2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(col1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(col2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(26:8) <Row cols={{lg:3, md:1}} >",
    		ctx
    	});

    	return block;
    }

    // (25:4) <Container>
    function create_default_slot$1(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				cols: { lg: 3, md: 1 },
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(25:4) <Container>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div3;
    	let h10;
    	let t1;
    	let p0;
    	let t3;
    	let div0;
    	let t4;
    	let h4;
    	let t6;
    	let container;
    	let t7;
    	let div1;
    	let t8;
    	let div2;
    	let t9;
    	let h11;
    	let t11;
    	let p1;
    	let t13;
    	let h3;
    	let current;

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h10 = element("h1");
    			h10.textContent = "¿Qué es Mitad Doble?";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Somos una productora joven y con personalidad propia. Nuestra calidad es consecuencia del amor por nuestro trabajo.";
    			t3 = space();
    			div0 = element("div");
    			t4 = space();
    			h4 = element("h4");
    			h4.textContent = "¿Y qué hacemos?";
    			t6 = space();
    			create_component(container.$$.fragment);
    			t7 = space();
    			div1 = element("div");
    			t8 = space();
    			div2 = element("div");
    			t9 = space();
    			h11 = element("h1");
    			h11.textContent = "Contacta";
    			t11 = space();
    			p1 = element("p");
    			p1.textContent = "Si tienes cualquier pregunta o duda sobre si somos lo que buscas, no dudes en escribirnos para hablar del proyecto";
    			t13 = space();
    			h3 = element("h3");
    			h3.textContent = "ventas@mitaddoble.es";
    			attr_dev(h10, "class", "svelte-1pb0ory");
    			add_location(h10, file$3, 20, 4, 553);
    			attr_dev(p0, "class", "svelte-1pb0ory");
    			add_location(p0, file$3, 21, 4, 587);
    			set_style(div0, "height", "30px");
    			add_location(div0, file$3, 22, 4, 714);
    			attr_dev(h4, "class", "svelte-1pb0ory");
    			add_location(h4, file$3, 23, 4, 751);
    			set_style(div1, "height", "30px");
    			add_location(div1, file$3, 55, 4, 2113);
    			set_style(div2, "height", "30px");
    			add_location(div2, file$3, 57, 4, 2315);
    			attr_dev(h11, "class", "svelte-1pb0ory");
    			add_location(h11, file$3, 58, 4, 2352);
    			attr_dev(p1, "class", "svelte-1pb0ory");
    			add_location(p1, file$3, 59, 4, 2376);
    			add_location(h3, file$3, 60, 4, 2504);
    			attr_dev(div3, "class", "container-element svelte-1pb0ory");
    			add_location(div3, file$3, 19, 0, 517);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h10);
    			append_dev(div3, t1);
    			append_dev(div3, p0);
    			append_dev(div3, t3);
    			append_dev(div3, div0);
    			append_dev(div3, t4);
    			append_dev(div3, h4);
    			append_dev(div3, t6);
    			mount_component(container, div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, div1);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div3, t9);
    			append_dev(div3, h11);
    			append_dev(div3, t11);
    			append_dev(div3, p1);
    			append_dev(div3, t13);
    			append_dev(div3, h3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(container);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const iconSize = 70;

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	let { didTapSeePortfolio = null } = $$props;

    	function handleSeeMore() {
    		if (didTapSeePortfolio) didTapSeePortfolio();
    	}

    	const writable_props = ['didTapSeePortfolio'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('didTapSeePortfolio' in $$props) $$invalidate(0, didTapSeePortfolio = $$props.didTapSeePortfolio);
    	};

    	$$self.$capture_state = () => ({
    		Col,
    		Container,
    		Row,
    		AdIcon,
    		MusicVideoIcon,
    		PuzzleIcon,
    		Button,
    		didTapSeePortfolio,
    		iconSize,
    		handleSeeMore
    	});

    	$$self.$inject_state = $$props => {
    		if ('didTapSeePortfolio' in $$props) $$invalidate(0, didTapSeePortfolio = $$props.didTapSeePortfolio);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [didTapSeePortfolio];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { didTapSeePortfolio: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get didTapSeePortfolio() {
    		throw new Error("<Contact>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set didTapSeePortfolio(value) {
    		throw new Error("<Contact>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/home/HomePage.svelte generated by Svelte v3.43.1 */
    const file$2 = "src/pages/home/HomePage.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let herovideo;
    	let t;
    	let contact;
    	let current;

    	herovideo = new HeroVideo({
    			props: {
    				videoSrc: "./reel.mp4",
    				backdropColor: "#414042",
    				onSeeMore: /*func*/ ctx[2]
    			},
    			$$inline: true
    		});

    	contact = new Contact({
    			props: {
    				didTapSeePortfolio: /*handleSeePortfolio*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(herovideo.$$.fragment);
    			t = space();
    			create_component(contact.$$.fragment);
    			attr_dev(main, "class", "svelte-mw2ahs");
    			add_location(main, file$2, 18, 0, 381);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(herovideo, main, null);
    			append_dev(main, t);
    			mount_component(contact, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(herovideo.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(herovideo.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(herovideo);
    			destroy_component(contact);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleHeroSeeMore() {
    	window.scroll(0, window.innerHeight);
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HomePage', slots, []);
    	let { didTapPortfolio } = $$props;

    	function handleSeePortfolio() {
    		if (didTapPortfolio) didTapPortfolio();
    	}

    	const writable_props = ['didTapPortfolio'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HomePage> was created with unknown prop '${key}'`);
    	});

    	const func = () => handleHeroSeeMore();

    	$$self.$$set = $$props => {
    		if ('didTapPortfolio' in $$props) $$invalidate(1, didTapPortfolio = $$props.didTapPortfolio);
    	};

    	$$self.$capture_state = () => ({
    		HeroVideo,
    		WorkShowcase,
    		Contact,
    		didTapPortfolio,
    		handleHeroSeeMore,
    		handleSeePortfolio
    	});

    	$$self.$inject_state = $$props => {
    		if ('didTapPortfolio' in $$props) $$invalidate(1, didTapPortfolio = $$props.didTapPortfolio);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [handleSeePortfolio, didTapPortfolio, func];
    }

    class HomePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { didTapPortfolio: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HomePage",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*didTapPortfolio*/ ctx[1] === undefined && !('didTapPortfolio' in props)) {
    			console.warn("<HomePage> was created without expected prop 'didTapPortfolio'");
    		}
    	}

    	get didTapPortfolio() {
    		throw new Error("<HomePage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set didTapPortfolio(value) {
    		throw new Error("<HomePage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/portfolio/PortfolioGrid.svelte generated by Svelte v3.43.1 */
    const file$1 = "src/pages/portfolio/PortfolioGrid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (12:12) <Container>
    function create_default_slot_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "portfolio-card svelte-1nmevv8");
    			add_location(div, file$1, 12, 16, 220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(12:12) <Container>",
    		ctx
    	});

    	return block;
    }

    // (11:8) <Col>
    function create_default_slot_1(ctx) {
    	let container;
    	let t;
    	let current;

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(container.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(container, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const container_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(container, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(11:8) <Col>",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#each data as data}
    function create_each_block(ctx) {
    	let col;
    	let current;

    	col = new Col({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(col.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(col, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const col_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				col_changes.$$scope = { dirty, ctx };
    			}

    			col.$set(col_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(col.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(col.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(col, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(10:4) {#each data as data}",
    		ctx
    	});

    	return block;
    }

    // (9:0) <Row cols={{lg:4, md:2, sm:1}}>
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(9:0) <Row cols={{lg:4, md:2, sm:1}}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				cols: { lg: 4, md: 2, sm: 1 },
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const row_changes = {};

    			if (dirty & /*$$scope, data*/ 9) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PortfolioGrid', slots, []);
    	let { data = [] } = $$props;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PortfolioGrid> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ Col, Container, Row, data });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class PortfolioGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PortfolioGrid",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get data() {
    		throw new Error("<PortfolioGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<PortfolioGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/portfolio/Portfolio.svelte generated by Svelte v3.43.1 */
    const file = "src/pages/portfolio/Portfolio.svelte";

    function create_fragment$2(ctx) {
    	let div3;
    	let header;
    	let div2;
    	let div0;
    	let icon;
    	let t0;
    	let div1;
    	let t1;
    	let h1;
    	let t3;
    	let mitaddobleicon;
    	let t4;
    	let portfoliogrid;
    	let current;
    	let mounted;
    	let dispose;

    	icon = new Icon({
    			props: { name: "arrow-left" },
    			$$inline: true
    		});

    	mitaddobleicon = new MitadDobleIcon({
    			props: {
    				withMainText: true,
    				withBottomText: false,
    				borderColor: "#fff",
    				width: 110
    			},
    			$$inline: true
    		});

    	portfoliogrid = new PortfolioGrid({
    			props: { data: [1, 2, 3, 4, 5, 6, 7, 8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			header = element("header");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(icon.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "PORTFOLIO";
    			t3 = space();
    			create_component(mitaddobleicon.$$.fragment);
    			t4 = space();
    			create_component(portfoliogrid.$$.fragment);
    			attr_dev(div0, "id", "icon-wrapper");
    			attr_dev(div0, "class", "svelte-1rwbzm2");
    			add_location(div0, file, 16, 12, 486);
    			set_style(div1, "width", "30px");
    			add_location(div1, file, 17, 12, 553);
    			attr_dev(h1, "class", "svelte-1rwbzm2");
    			add_location(h1, file, 18, 12, 598);
    			set_style(div2, "display", "flex");
    			set_style(div2, "justify-content", "center");
    			set_style(div2, "align-items", "center");
    			set_style(div2, "cursor", "pointer");
    			add_location(div2, file, 15, 8, 362);
    			attr_dev(header, "class", "svelte-1rwbzm2");
    			add_location(header, file, 14, 4, 345);
    			attr_dev(div3, "class", "container-element svelte-1rwbzm2");
    			add_location(div3, file, 13, 0, 308);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, header);
    			append_dev(header, div2);
    			append_dev(div2, div0);
    			mount_component(icon, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div2, t1);
    			append_dev(div2, h1);
    			append_dev(header, t3);
    			mount_component(mitaddobleicon, header, null);
    			append_dev(div3, t4);
    			mount_component(portfoliogrid, div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", /*handleBack*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			transition_in(mitaddobleicon.$$.fragment, local);
    			transition_in(portfoliogrid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			transition_out(mitaddobleicon.$$.fragment, local);
    			transition_out(portfoliogrid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(icon);
    			destroy_component(mitaddobleicon);
    			destroy_component(portfoliogrid);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Portfolio', slots, []);
    	let { didTapBack = null } = $$props;

    	function handleBack() {
    		if (didTapBack) didTapBack();
    	}

    	const writable_props = ['didTapBack'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('didTapBack' in $$props) $$invalidate(1, didTapBack = $$props.didTapBack);
    	};

    	$$self.$capture_state = () => ({
    		Icon,
    		MitadDobleIcon,
    		PortfolioGrid,
    		didTapBack,
    		handleBack
    	});

    	$$self.$inject_state = $$props => {
    		if ('didTapBack' in $$props) $$invalidate(1, didTapBack = $$props.didTapBack);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [handleBack, didTapBack];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { didTapBack: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get didTapBack() {
    		throw new Error("<Portfolio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set didTapBack(value) {
    		throw new Error("<Portfolio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/home/LatestProjects.svelte generated by Svelte v3.43.1 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const youtubeUrlParams = "?autoplay=0&showinfo=0&fs=0;&loop=0;&modestbranding=1;&rel=0;";

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LatestProjects', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LatestProjects> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ youtubeUrlParams });
    	return [];
    }

    class LatestProjects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LatestProjects",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/pages/Splash.svelte generated by Svelte v3.43.1 */

    function create_fragment(ctx) {
    	let homepage;
    	let current;
    	homepage = new HomePage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(homepage.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(homepage, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(homepage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(homepage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(homepage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let currentPage;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Splash', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Splash> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fade,
    		HomePage,
    		Portfolio,
    		LatestProjects,
    		currentPage
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentPage' in $$props) currentPage = $$props.currentPage;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	currentPage = "home";
    	return [];
    }

    class Splash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Splash",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    new Splash({target: document.body});

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL2ludGVybmFsL2luZGV4Lm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvdHJhbnNpdGlvbi9pbmRleC5tanMiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9CdXR0b24uc3ZlbHRlIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvUm91bmRCdXR0b24uc3ZlbHRlIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvc3ZnX2ljb25zL01pdGFkRG9ibGVJY29uLnN2ZWx0ZSIsIi4uLy4uL3NyYy9jb21wb25lbnRzL3N2Z19pY29ucy9QbGF5SWNvbi5zdmVsdGUiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9zdmdfaWNvbnMvUGF1c2VJY29uLnN2ZWx0ZSIsIi4uLy4uL3NyYy9jb21wb25lbnRzL3N2Z19pY29ucy9NdXRlSWNvbi5zdmVsdGUiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9zdmdfaWNvbnMvVm9sdW1lSWNvbi5zdmVsdGUiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9zdmdfaWNvbnMvQXJyb3dEb3duLnN2ZWx0ZSIsIi4uLy4uL3NyYy9wYWdlcy9ob21lL0hlcm9WaWRlby5zdmVsdGUiLCIuLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlc3RyYXAvc3JjL3V0aWxzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZXN0cmFwL3NyYy9Db2wuc3ZlbHRlIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZXN0cmFwL3NyYy9Db250YWluZXIuc3ZlbHRlIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3N2ZWx0ZXN0cmFwL3NyYy9JY29uLnN2ZWx0ZSIsIi4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGVzdHJhcC9zcmMvUm93LnN2ZWx0ZSIsIi4uLy4uL3NyYy9jb21wb25lbnRzL1ZpZGVvQ2FyZC5zdmVsdGUiLCIuLi8uLi9zcmMvcGFnZXMvaG9tZS9Xb3JrU2hvd2Nhc2Uuc3ZlbHRlIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvc3ZnX2ljb25zL0FkSWNvbi5zdmVsdGUiLCIuLi8uLi9zcmMvY29tcG9uZW50cy9zdmdfaWNvbnMvTXVzaWNWaWRlb0ljb24uc3ZlbHRlIiwiLi4vLi4vc3JjL2NvbXBvbmVudHMvc3ZnX2ljb25zL1B1enpsZUljb24uc3ZlbHRlIiwiLi4vLi4vc3JjL3BhZ2VzL2hvbWUvQ29udGFjdC5zdmVsdGUiLCIuLi8uLi9zcmMvcGFnZXMvaG9tZS9Ib21lUGFnZS5zdmVsdGUiLCIuLi8uLi9zcmMvcGFnZXMvcG9ydGZvbGlvL1BvcnRmb2xpb0dyaWQuc3ZlbHRlIiwiLi4vLi4vc3JjL3BhZ2VzL3BvcnRmb2xpby9Qb3J0Zm9saW8uc3ZlbHRlIiwiLi4vLi4vc3JjL3BhZ2VzL2hvbWUvTGF0ZXN0UHJvamVjdHMuc3ZlbHRlIiwiLi4vLi4vc3JjL3BhZ2VzL1NwbGFzaC5zdmVsdGUiLCIuLi8uLi9zcmMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBub29wKCkgeyB9XG5jb25zdCBpZGVudGl0eSA9IHggPT4geDtcbmZ1bmN0aW9uIGFzc2lnbih0YXIsIHNyYykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBmb3IgKGNvbnN0IGsgaW4gc3JjKVxuICAgICAgICB0YXJba10gPSBzcmNba107XG4gICAgcmV0dXJuIHRhcjtcbn1cbmZ1bmN0aW9uIGlzX3Byb21pc2UodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cbmZ1bmN0aW9uIGFkZF9sb2NhdGlvbihlbGVtZW50LCBmaWxlLCBsaW5lLCBjb2x1bW4sIGNoYXIpIHtcbiAgICBlbGVtZW50Ll9fc3ZlbHRlX21ldGEgPSB7XG4gICAgICAgIGxvYzogeyBmaWxlLCBsaW5lLCBjb2x1bW4sIGNoYXIgfVxuICAgIH07XG59XG5mdW5jdGlvbiBydW4oZm4pIHtcbiAgICByZXR1cm4gZm4oKTtcbn1cbmZ1bmN0aW9uIGJsYW5rX29iamVjdCgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsKTtcbn1cbmZ1bmN0aW9uIHJ1bl9hbGwoZm5zKSB7XG4gICAgZm5zLmZvckVhY2gocnVuKTtcbn1cbmZ1bmN0aW9uIGlzX2Z1bmN0aW9uKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmZ1bmN0aW9uIHNhZmVfbm90X2VxdWFsKGEsIGIpIHtcbiAgICByZXR1cm4gYSAhPSBhID8gYiA9PSBiIDogYSAhPT0gYiB8fCAoKGEgJiYgdHlwZW9mIGEgPT09ICdvYmplY3QnKSB8fCB0eXBlb2YgYSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5sZXQgc3JjX3VybF9lcXVhbF9hbmNob3I7XG5mdW5jdGlvbiBzcmNfdXJsX2VxdWFsKGVsZW1lbnRfc3JjLCB1cmwpIHtcbiAgICBpZiAoIXNyY191cmxfZXF1YWxfYW5jaG9yKSB7XG4gICAgICAgIHNyY191cmxfZXF1YWxfYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIH1cbiAgICBzcmNfdXJsX2VxdWFsX2FuY2hvci5ocmVmID0gdXJsO1xuICAgIHJldHVybiBlbGVtZW50X3NyYyA9PT0gc3JjX3VybF9lcXVhbF9hbmNob3IuaHJlZjtcbn1cbmZ1bmN0aW9uIG5vdF9lcXVhbChhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT0gYSA/IGIgPT0gYiA6IGEgIT09IGI7XG59XG5mdW5jdGlvbiBpc19lbXB0eShvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9zdG9yZShzdG9yZSwgbmFtZSkge1xuICAgIGlmIChzdG9yZSAhPSBudWxsICYmIHR5cGVvZiBzdG9yZS5zdWJzY3JpYmUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnJHtuYW1lfScgaXMgbm90IGEgc3RvcmUgd2l0aCBhICdzdWJzY3JpYmUnIG1ldGhvZGApO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHN1YnNjcmliZShzdG9yZSwgLi4uY2FsbGJhY2tzKSB7XG4gICAgaWYgKHN0b3JlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgfVxuICAgIGNvbnN0IHVuc3ViID0gc3RvcmUuc3Vic2NyaWJlKC4uLmNhbGxiYWNrcyk7XG4gICAgcmV0dXJuIHVuc3ViLnVuc3Vic2NyaWJlID8gKCkgPT4gdW5zdWIudW5zdWJzY3JpYmUoKSA6IHVuc3ViO1xufVxuZnVuY3Rpb24gZ2V0X3N0b3JlX3ZhbHVlKHN0b3JlKSB7XG4gICAgbGV0IHZhbHVlO1xuICAgIHN1YnNjcmliZShzdG9yZSwgXyA9PiB2YWx1ZSA9IF8pKCk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gY29tcG9uZW50X3N1YnNjcmliZShjb21wb25lbnQsIHN0b3JlLCBjYWxsYmFjaykge1xuICAgIGNvbXBvbmVudC4kJC5vbl9kZXN0cm95LnB1c2goc3Vic2NyaWJlKHN0b3JlLCBjYWxsYmFjaykpO1xufVxuZnVuY3Rpb24gY3JlYXRlX3Nsb3QoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbikge1xuICAgIGlmIChkZWZpbml0aW9uKSB7XG4gICAgICAgIGNvbnN0IHNsb3RfY3R4ID0gZ2V0X3Nsb3RfY29udGV4dChkZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGZuKTtcbiAgICAgICAgcmV0dXJuIGRlZmluaXRpb25bMF0oc2xvdF9jdHgpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldF9zbG90X2NvbnRleHQoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbikge1xuICAgIHJldHVybiBkZWZpbml0aW9uWzFdICYmIGZuXG4gICAgICAgID8gYXNzaWduKCQkc2NvcGUuY3R4LnNsaWNlKCksIGRlZmluaXRpb25bMV0oZm4oY3R4KSkpXG4gICAgICAgIDogJCRzY29wZS5jdHg7XG59XG5mdW5jdGlvbiBnZXRfc2xvdF9jaGFuZ2VzKGRlZmluaXRpb24sICQkc2NvcGUsIGRpcnR5LCBmbikge1xuICAgIGlmIChkZWZpbml0aW9uWzJdICYmIGZuKSB7XG4gICAgICAgIGNvbnN0IGxldHMgPSBkZWZpbml0aW9uWzJdKGZuKGRpcnR5KSk7XG4gICAgICAgIGlmICgkJHNjb3BlLmRpcnR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBsZXRzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgbGV0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IFtdO1xuICAgICAgICAgICAgY29uc3QgbGVuID0gTWF0aC5tYXgoJCRzY29wZS5kaXJ0eS5sZW5ndGgsIGxldHMubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBtZXJnZWRbaV0gPSAkJHNjb3BlLmRpcnR5W2ldIHwgbGV0c1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZXJnZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICQkc2NvcGUuZGlydHkgfCBsZXRzO1xuICAgIH1cbiAgICByZXR1cm4gJCRzY29wZS5kaXJ0eTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZV9zbG90X2Jhc2Uoc2xvdCwgc2xvdF9kZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIHNsb3RfY2hhbmdlcywgZ2V0X3Nsb3RfY29udGV4dF9mbikge1xuICAgIGlmIChzbG90X2NoYW5nZXMpIHtcbiAgICAgICAgY29uc3Qgc2xvdF9jb250ZXh0ID0gZ2V0X3Nsb3RfY29udGV4dChzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZ2V0X3Nsb3RfY29udGV4dF9mbik7XG4gICAgICAgIHNsb3QucChzbG90X2NvbnRleHQsIHNsb3RfY2hhbmdlcyk7XG4gICAgfVxufVxuZnVuY3Rpb24gdXBkYXRlX3Nsb3Qoc2xvdCwgc2xvdF9kZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGRpcnR5LCBnZXRfc2xvdF9jaGFuZ2VzX2ZuLCBnZXRfc2xvdF9jb250ZXh0X2ZuKSB7XG4gICAgY29uc3Qgc2xvdF9jaGFuZ2VzID0gZ2V0X3Nsb3RfY2hhbmdlcyhzbG90X2RlZmluaXRpb24sICQkc2NvcGUsIGRpcnR5LCBnZXRfc2xvdF9jaGFuZ2VzX2ZuKTtcbiAgICB1cGRhdGVfc2xvdF9iYXNlKHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBzbG90X2NoYW5nZXMsIGdldF9zbG90X2NvbnRleHRfZm4pO1xufVxuZnVuY3Rpb24gZ2V0X2FsbF9kaXJ0eV9mcm9tX3Njb3BlKCQkc2NvcGUpIHtcbiAgICBpZiAoJCRzY29wZS5jdHgubGVuZ3RoID4gMzIpIHtcbiAgICAgICAgY29uc3QgZGlydHkgPSBbXTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gJCRzY29wZS5jdHgubGVuZ3RoIC8gMzI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRpcnR5W2ldID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRpcnR5O1xuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5mdW5jdGlvbiBleGNsdWRlX2ludGVybmFsX3Byb3BzKHByb3BzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBrIGluIHByb3BzKVxuICAgICAgICBpZiAoa1swXSAhPT0gJyQnKVxuICAgICAgICAgICAgcmVzdWx0W2tdID0gcHJvcHNba107XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVfcmVzdF9wcm9wcyhwcm9wcywga2V5cykge1xuICAgIGNvbnN0IHJlc3QgPSB7fTtcbiAgICBrZXlzID0gbmV3IFNldChrZXlzKTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gcHJvcHMpXG4gICAgICAgIGlmICgha2V5cy5oYXMoaykgJiYga1swXSAhPT0gJyQnKVxuICAgICAgICAgICAgcmVzdFtrXSA9IHByb3BzW2tdO1xuICAgIHJldHVybiByZXN0O1xufVxuZnVuY3Rpb24gY29tcHV0ZV9zbG90cyhzbG90cykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIHNsb3RzKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG9uY2UoZm4pIHtcbiAgICBsZXQgcmFuID0gZmFsc2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIGlmIChyYW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHJhbiA9IHRydWU7XG4gICAgICAgIGZuLmNhbGwodGhpcywgLi4uYXJncyk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIG51bGxfdG9fZW1wdHkodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWU7XG59XG5mdW5jdGlvbiBzZXRfc3RvcmVfdmFsdWUoc3RvcmUsIHJldCwgdmFsdWUpIHtcbiAgICBzdG9yZS5zZXQodmFsdWUpO1xuICAgIHJldHVybiByZXQ7XG59XG5jb25zdCBoYXNfcHJvcCA9IChvYmosIHByb3ApID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xuZnVuY3Rpb24gYWN0aW9uX2Rlc3Ryb3llcihhY3Rpb25fcmVzdWx0KSB7XG4gICAgcmV0dXJuIGFjdGlvbl9yZXN1bHQgJiYgaXNfZnVuY3Rpb24oYWN0aW9uX3Jlc3VsdC5kZXN0cm95KSA/IGFjdGlvbl9yZXN1bHQuZGVzdHJveSA6IG5vb3A7XG59XG5cbmNvbnN0IGlzX2NsaWVudCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xubGV0IG5vdyA9IGlzX2NsaWVudFxuICAgID8gKCkgPT4gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXG4gICAgOiAoKSA9PiBEYXRlLm5vdygpO1xubGV0IHJhZiA9IGlzX2NsaWVudCA/IGNiID0+IHJlcXVlc3RBbmltYXRpb25GcmFtZShjYikgOiBub29wO1xuLy8gdXNlZCBpbnRlcm5hbGx5IGZvciB0ZXN0aW5nXG5mdW5jdGlvbiBzZXRfbm93KGZuKSB7XG4gICAgbm93ID0gZm47XG59XG5mdW5jdGlvbiBzZXRfcmFmKGZuKSB7XG4gICAgcmFmID0gZm47XG59XG5cbmNvbnN0IHRhc2tzID0gbmV3IFNldCgpO1xuZnVuY3Rpb24gcnVuX3Rhc2tzKG5vdykge1xuICAgIHRhc2tzLmZvckVhY2godGFzayA9PiB7XG4gICAgICAgIGlmICghdGFzay5jKG5vdykpIHtcbiAgICAgICAgICAgIHRhc2tzLmRlbGV0ZSh0YXNrKTtcbiAgICAgICAgICAgIHRhc2suZigpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHRhc2tzLnNpemUgIT09IDApXG4gICAgICAgIHJhZihydW5fdGFza3MpO1xufVxuLyoqXG4gKiBGb3IgdGVzdGluZyBwdXJwb3NlcyBvbmx5IVxuICovXG5mdW5jdGlvbiBjbGVhcl9sb29wcygpIHtcbiAgICB0YXNrcy5jbGVhcigpO1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHRhc2sgdGhhdCBydW5zIG9uIGVhY2ggcmFmIGZyYW1lXG4gKiB1bnRpbCBpdCByZXR1cm5zIGEgZmFsc3kgdmFsdWUgb3IgaXMgYWJvcnRlZFxuICovXG5mdW5jdGlvbiBsb29wKGNhbGxiYWNrKSB7XG4gICAgbGV0IHRhc2s7XG4gICAgaWYgKHRhc2tzLnNpemUgPT09IDApXG4gICAgICAgIHJhZihydW5fdGFza3MpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHByb21pc2U6IG5ldyBQcm9taXNlKGZ1bGZpbGwgPT4ge1xuICAgICAgICAgICAgdGFza3MuYWRkKHRhc2sgPSB7IGM6IGNhbGxiYWNrLCBmOiBmdWxmaWxsIH0pO1xuICAgICAgICB9KSxcbiAgICAgICAgYWJvcnQoKSB7XG4gICAgICAgICAgICB0YXNrcy5kZWxldGUodGFzayk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG4vLyBUcmFjayB3aGljaCBub2RlcyBhcmUgY2xhaW1lZCBkdXJpbmcgaHlkcmF0aW9uLiBVbmNsYWltZWQgbm9kZXMgY2FuIHRoZW4gYmUgcmVtb3ZlZCBmcm9tIHRoZSBET01cbi8vIGF0IHRoZSBlbmQgb2YgaHlkcmF0aW9uIHdpdGhvdXQgdG91Y2hpbmcgdGhlIHJlbWFpbmluZyBub2Rlcy5cbmxldCBpc19oeWRyYXRpbmcgPSBmYWxzZTtcbmZ1bmN0aW9uIHN0YXJ0X2h5ZHJhdGluZygpIHtcbiAgICBpc19oeWRyYXRpbmcgPSB0cnVlO1xufVxuZnVuY3Rpb24gZW5kX2h5ZHJhdGluZygpIHtcbiAgICBpc19oeWRyYXRpbmcgPSBmYWxzZTtcbn1cbmZ1bmN0aW9uIHVwcGVyX2JvdW5kKGxvdywgaGlnaCwga2V5LCB2YWx1ZSkge1xuICAgIC8vIFJldHVybiBmaXJzdCBpbmRleCBvZiB2YWx1ZSBsYXJnZXIgdGhhbiBpbnB1dCB2YWx1ZSBpbiB0aGUgcmFuZ2UgW2xvdywgaGlnaClcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgICBjb25zdCBtaWQgPSBsb3cgKyAoKGhpZ2ggLSBsb3cpID4+IDEpO1xuICAgICAgICBpZiAoa2V5KG1pZCkgPD0gdmFsdWUpIHtcbiAgICAgICAgICAgIGxvdyA9IG1pZCArIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoaWdoID0gbWlkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsb3c7XG59XG5mdW5jdGlvbiBpbml0X2h5ZHJhdGUodGFyZ2V0KSB7XG4gICAgaWYgKHRhcmdldC5oeWRyYXRlX2luaXQpXG4gICAgICAgIHJldHVybjtcbiAgICB0YXJnZXQuaHlkcmF0ZV9pbml0ID0gdHJ1ZTtcbiAgICAvLyBXZSBrbm93IHRoYXQgYWxsIGNoaWxkcmVuIGhhdmUgY2xhaW1fb3JkZXIgdmFsdWVzIHNpbmNlIHRoZSB1bmNsYWltZWQgaGF2ZSBiZWVuIGRldGFjaGVkIGlmIHRhcmdldCBpcyBub3QgPGhlYWQ+XG4gICAgbGV0IGNoaWxkcmVuID0gdGFyZ2V0LmNoaWxkTm9kZXM7XG4gICAgLy8gSWYgdGFyZ2V0IGlzIDxoZWFkPiwgdGhlcmUgbWF5IGJlIGNoaWxkcmVuIHdpdGhvdXQgY2xhaW1fb3JkZXJcbiAgICBpZiAodGFyZ2V0Lm5vZGVOYW1lID09PSAnSEVBRCcpIHtcbiAgICAgICAgY29uc3QgbXlDaGlsZHJlbiA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICBpZiAobm9kZS5jbGFpbV9vcmRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbXlDaGlsZHJlbi5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoaWxkcmVuID0gbXlDaGlsZHJlbjtcbiAgICB9XG4gICAgLypcbiAgICAqIFJlb3JkZXIgY2xhaW1lZCBjaGlsZHJlbiBvcHRpbWFsbHkuXG4gICAgKiBXZSBjYW4gcmVvcmRlciBjbGFpbWVkIGNoaWxkcmVuIG9wdGltYWxseSBieSBmaW5kaW5nIHRoZSBsb25nZXN0IHN1YnNlcXVlbmNlIG9mXG4gICAgKiBub2RlcyB0aGF0IGFyZSBhbHJlYWR5IGNsYWltZWQgaW4gb3JkZXIgYW5kIG9ubHkgbW92aW5nIHRoZSByZXN0LiBUaGUgbG9uZ2VzdFxuICAgICogc3Vic2VxdWVuY2Ugc3Vic2VxdWVuY2Ugb2Ygbm9kZXMgdGhhdCBhcmUgY2xhaW1lZCBpbiBvcmRlciBjYW4gYmUgZm91bmQgYnlcbiAgICAqIGNvbXB1dGluZyB0aGUgbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlIG9mIC5jbGFpbV9vcmRlciB2YWx1ZXMuXG4gICAgKlxuICAgICogVGhpcyBhbGdvcml0aG0gaXMgb3B0aW1hbCBpbiBnZW5lcmF0aW5nIHRoZSBsZWFzdCBhbW91bnQgb2YgcmVvcmRlciBvcGVyYXRpb25zXG4gICAgKiBwb3NzaWJsZS5cbiAgICAqXG4gICAgKiBQcm9vZjpcbiAgICAqIFdlIGtub3cgdGhhdCwgZ2l2ZW4gYSBzZXQgb2YgcmVvcmRlcmluZyBvcGVyYXRpb25zLCB0aGUgbm9kZXMgdGhhdCBkbyBub3QgbW92ZVxuICAgICogYWx3YXlzIGZvcm0gYW4gaW5jcmVhc2luZyBzdWJzZXF1ZW5jZSwgc2luY2UgdGhleSBkbyBub3QgbW92ZSBhbW9uZyBlYWNoIG90aGVyXG4gICAgKiBtZWFuaW5nIHRoYXQgdGhleSBtdXN0IGJlIGFscmVhZHkgb3JkZXJlZCBhbW9uZyBlYWNoIG90aGVyLiBUaHVzLCB0aGUgbWF4aW1hbFxuICAgICogc2V0IG9mIG5vZGVzIHRoYXQgZG8gbm90IG1vdmUgZm9ybSBhIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZS5cbiAgICAqL1xuICAgIC8vIENvbXB1dGUgbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlXG4gICAgLy8gbTogc3Vic2VxdWVuY2UgbGVuZ3RoIGogPT4gaW5kZXggayBvZiBzbWFsbGVzdCB2YWx1ZSB0aGF0IGVuZHMgYW4gaW5jcmVhc2luZyBzdWJzZXF1ZW5jZSBvZiBsZW5ndGggalxuICAgIGNvbnN0IG0gPSBuZXcgSW50MzJBcnJheShjaGlsZHJlbi5sZW5ndGggKyAxKTtcbiAgICAvLyBQcmVkZWNlc3NvciBpbmRpY2VzICsgMVxuICAgIGNvbnN0IHAgPSBuZXcgSW50MzJBcnJheShjaGlsZHJlbi5sZW5ndGgpO1xuICAgIG1bMF0gPSAtMTtcbiAgICBsZXQgbG9uZ2VzdCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjdXJyZW50ID0gY2hpbGRyZW5baV0uY2xhaW1fb3JkZXI7XG4gICAgICAgIC8vIEZpbmQgdGhlIGxhcmdlc3Qgc3Vic2VxdWVuY2UgbGVuZ3RoIHN1Y2ggdGhhdCBpdCBlbmRzIGluIGEgdmFsdWUgbGVzcyB0aGFuIG91ciBjdXJyZW50IHZhbHVlXG4gICAgICAgIC8vIHVwcGVyX2JvdW5kIHJldHVybnMgZmlyc3QgZ3JlYXRlciB2YWx1ZSwgc28gd2Ugc3VidHJhY3Qgb25lXG4gICAgICAgIC8vIHdpdGggZmFzdCBwYXRoIGZvciB3aGVuIHdlIGFyZSBvbiB0aGUgY3VycmVudCBsb25nZXN0IHN1YnNlcXVlbmNlXG4gICAgICAgIGNvbnN0IHNlcUxlbiA9ICgobG9uZ2VzdCA+IDAgJiYgY2hpbGRyZW5bbVtsb25nZXN0XV0uY2xhaW1fb3JkZXIgPD0gY3VycmVudCkgPyBsb25nZXN0ICsgMSA6IHVwcGVyX2JvdW5kKDEsIGxvbmdlc3QsIGlkeCA9PiBjaGlsZHJlblttW2lkeF1dLmNsYWltX29yZGVyLCBjdXJyZW50KSkgLSAxO1xuICAgICAgICBwW2ldID0gbVtzZXFMZW5dICsgMTtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gc2VxTGVuICsgMTtcbiAgICAgICAgLy8gV2UgY2FuIGd1YXJhbnRlZSB0aGF0IGN1cnJlbnQgaXMgdGhlIHNtYWxsZXN0IHZhbHVlLiBPdGhlcndpc2UsIHdlIHdvdWxkIGhhdmUgZ2VuZXJhdGVkIGEgbG9uZ2VyIHNlcXVlbmNlLlxuICAgICAgICBtW25ld0xlbl0gPSBpO1xuICAgICAgICBsb25nZXN0ID0gTWF0aC5tYXgobmV3TGVuLCBsb25nZXN0KTtcbiAgICB9XG4gICAgLy8gVGhlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZSBvZiBub2RlcyAoaW5pdGlhbGx5IHJldmVyc2VkKVxuICAgIGNvbnN0IGxpcyA9IFtdO1xuICAgIC8vIFRoZSByZXN0IG9mIHRoZSBub2Rlcywgbm9kZXMgdGhhdCB3aWxsIGJlIG1vdmVkXG4gICAgY29uc3QgdG9Nb3ZlID0gW107XG4gICAgbGV0IGxhc3QgPSBjaGlsZHJlbi5sZW5ndGggLSAxO1xuICAgIGZvciAobGV0IGN1ciA9IG1bbG9uZ2VzdF0gKyAxOyBjdXIgIT0gMDsgY3VyID0gcFtjdXIgLSAxXSkge1xuICAgICAgICBsaXMucHVzaChjaGlsZHJlbltjdXIgLSAxXSk7XG4gICAgICAgIGZvciAoOyBsYXN0ID49IGN1cjsgbGFzdC0tKSB7XG4gICAgICAgICAgICB0b01vdmUucHVzaChjaGlsZHJlbltsYXN0XSk7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdC0tO1xuICAgIH1cbiAgICBmb3IgKDsgbGFzdCA+PSAwOyBsYXN0LS0pIHtcbiAgICAgICAgdG9Nb3ZlLnB1c2goY2hpbGRyZW5bbGFzdF0pO1xuICAgIH1cbiAgICBsaXMucmV2ZXJzZSgpO1xuICAgIC8vIFdlIHNvcnQgdGhlIG5vZGVzIGJlaW5nIG1vdmVkIHRvIGd1YXJhbnRlZSB0aGF0IHRoZWlyIGluc2VydGlvbiBvcmRlciBtYXRjaGVzIHRoZSBjbGFpbSBvcmRlclxuICAgIHRvTW92ZS5zb3J0KChhLCBiKSA9PiBhLmNsYWltX29yZGVyIC0gYi5jbGFpbV9vcmRlcik7XG4gICAgLy8gRmluYWxseSwgd2UgbW92ZSB0aGUgbm9kZXNcbiAgICBmb3IgKGxldCBpID0gMCwgaiA9IDA7IGkgPCB0b01vdmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgd2hpbGUgKGogPCBsaXMubGVuZ3RoICYmIHRvTW92ZVtpXS5jbGFpbV9vcmRlciA+PSBsaXNbal0uY2xhaW1fb3JkZXIpIHtcbiAgICAgICAgICAgIGorKztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhbmNob3IgPSBqIDwgbGlzLmxlbmd0aCA/IGxpc1tqXSA6IG51bGw7XG4gICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUodG9Nb3ZlW2ldLCBhbmNob3IpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFwcGVuZCh0YXJnZXQsIG5vZGUpIHtcbiAgICB0YXJnZXQuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5mdW5jdGlvbiBhcHBlbmRfc3R5bGVzKHRhcmdldCwgc3R5bGVfc2hlZXRfaWQsIHN0eWxlcykge1xuICAgIGNvbnN0IGFwcGVuZF9zdHlsZXNfdG8gPSBnZXRfcm9vdF9mb3Jfc3R5bGUodGFyZ2V0KTtcbiAgICBpZiAoIWFwcGVuZF9zdHlsZXNfdG8uZ2V0RWxlbWVudEJ5SWQoc3R5bGVfc2hlZXRfaWQpKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gZWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgc3R5bGUuaWQgPSBzdHlsZV9zaGVldF9pZDtcbiAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSBzdHlsZXM7XG4gICAgICAgIGFwcGVuZF9zdHlsZXNoZWV0KGFwcGVuZF9zdHlsZXNfdG8sIHN0eWxlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRfcm9vdF9mb3Jfc3R5bGUobm9kZSkge1xuICAgIGlmICghbm9kZSlcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50O1xuICAgIGNvbnN0IHJvb3QgPSBub2RlLmdldFJvb3ROb2RlID8gbm9kZS5nZXRSb290Tm9kZSgpIDogbm9kZS5vd25lckRvY3VtZW50O1xuICAgIGlmIChyb290ICYmIHJvb3QuaG9zdCkge1xuICAgICAgICByZXR1cm4gcm9vdDtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGUub3duZXJEb2N1bWVudDtcbn1cbmZ1bmN0aW9uIGFwcGVuZF9lbXB0eV9zdHlsZXNoZWV0KG5vZGUpIHtcbiAgICBjb25zdCBzdHlsZV9lbGVtZW50ID0gZWxlbWVudCgnc3R5bGUnKTtcbiAgICBhcHBlbmRfc3R5bGVzaGVldChnZXRfcm9vdF9mb3Jfc3R5bGUobm9kZSksIHN0eWxlX2VsZW1lbnQpO1xuICAgIHJldHVybiBzdHlsZV9lbGVtZW50O1xufVxuZnVuY3Rpb24gYXBwZW5kX3N0eWxlc2hlZXQobm9kZSwgc3R5bGUpIHtcbiAgICBhcHBlbmQobm9kZS5oZWFkIHx8IG5vZGUsIHN0eWxlKTtcbn1cbmZ1bmN0aW9uIGFwcGVuZF9oeWRyYXRpb24odGFyZ2V0LCBub2RlKSB7XG4gICAgaWYgKGlzX2h5ZHJhdGluZykge1xuICAgICAgICBpbml0X2h5ZHJhdGUodGFyZ2V0KTtcbiAgICAgICAgaWYgKCh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9PT0gdW5kZWZpbmVkKSB8fCAoKHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkICE9PSBudWxsKSAmJiAodGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQucGFyZW50RWxlbWVudCAhPT0gdGFyZ2V0KSkpIHtcbiAgICAgICAgICAgIHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkID0gdGFyZ2V0LmZpcnN0Q2hpbGQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2tpcCBub2RlcyBvZiB1bmRlZmluZWQgb3JkZXJpbmdcbiAgICAgICAgd2hpbGUgKCh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCAhPT0gbnVsbCkgJiYgKHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkLmNsYWltX29yZGVyID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9IHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlICE9PSB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCkge1xuICAgICAgICAgICAgLy8gV2Ugb25seSBpbnNlcnQgaWYgdGhlIG9yZGVyaW5nIG9mIHRoaXMgbm9kZSBzaG91bGQgYmUgbW9kaWZpZWQgb3IgdGhlIHBhcmVudCBub2RlIGlzIG5vdCB0YXJnZXRcbiAgICAgICAgICAgIGlmIChub2RlLmNsYWltX29yZGVyICE9PSB1bmRlZmluZWQgfHwgbm9kZS5wYXJlbnROb2RlICE9PSB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKG5vZGUsIHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkID0gbm9kZS5uZXh0U2libGluZztcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChub2RlLnBhcmVudE5vZGUgIT09IHRhcmdldCB8fCBub2RlLm5leHRTaWJsaW5nICE9PSBudWxsKSB7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpbnNlcnQodGFyZ2V0LCBub2RlLCBhbmNob3IpIHtcbiAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKG5vZGUsIGFuY2hvciB8fCBudWxsKTtcbn1cbmZ1bmN0aW9uIGluc2VydF9oeWRyYXRpb24odGFyZ2V0LCBub2RlLCBhbmNob3IpIHtcbiAgICBpZiAoaXNfaHlkcmF0aW5nICYmICFhbmNob3IpIHtcbiAgICAgICAgYXBwZW5kX2h5ZHJhdGlvbih0YXJnZXQsIG5vZGUpO1xuICAgIH1cbiAgICBlbHNlIGlmIChub2RlLnBhcmVudE5vZGUgIT09IHRhcmdldCB8fCBub2RlLm5leHRTaWJsaW5nICE9IGFuY2hvcikge1xuICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKG5vZGUsIGFuY2hvciB8fCBudWxsKTtcbiAgICB9XG59XG5mdW5jdGlvbiBkZXRhY2gobm9kZSkge1xuICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbn1cbmZ1bmN0aW9uIGRlc3Ryb3lfZWFjaChpdGVyYXRpb25zLCBkZXRhY2hpbmcpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKGl0ZXJhdGlvbnNbaV0pXG4gICAgICAgICAgICBpdGVyYXRpb25zW2ldLmQoZGV0YWNoaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBlbGVtZW50KG5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcbn1cbmZ1bmN0aW9uIGVsZW1lbnRfaXMobmFtZSwgaXMpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lLCB7IGlzIH0pO1xufVxuZnVuY3Rpb24gb2JqZWN0X3dpdGhvdXRfcHJvcGVydGllcyhvYmosIGV4Y2x1ZGUpIHtcbiAgICBjb25zdCB0YXJnZXQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gb2JqKSB7XG4gICAgICAgIGlmIChoYXNfcHJvcChvYmosIGspXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAmJiBleGNsdWRlLmluZGV4T2YoaykgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICB0YXJnZXRba10gPSBvYmpba107XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cbmZ1bmN0aW9uIHN2Z19lbGVtZW50KG5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5hbWUpO1xufVxuZnVuY3Rpb24gdGV4dChkYXRhKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpO1xufVxuZnVuY3Rpb24gc3BhY2UoKSB7XG4gICAgcmV0dXJuIHRleHQoJyAnKTtcbn1cbmZ1bmN0aW9uIGVtcHR5KCkge1xuICAgIHJldHVybiB0ZXh0KCcnKTtcbn1cbmZ1bmN0aW9uIGxpc3Rlbihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgcmV0dXJuICgpID0+IG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG59XG5mdW5jdGlvbiBwcmV2ZW50X2RlZmF1bHQoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBzdG9wX3Byb3BhZ2F0aW9uKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHNlbGYoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gdGhpcylcbiAgICAgICAgICAgIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0cnVzdGVkKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChldmVudC5pc1RydXN0ZWQpXG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpXG4gICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgZWxzZSBpZiAobm9kZS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSAhPT0gdmFsdWUpXG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xufVxuZnVuY3Rpb24gc2V0X2F0dHJpYnV0ZXMobm9kZSwgYXR0cmlidXRlcykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBkZXNjcmlwdG9ycyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG5vZGUuX19wcm90b19fKTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzW2tleV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuY3NzVGV4dCA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICdfX3ZhbHVlJykge1xuICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG5vZGVba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkZXNjcmlwdG9yc1trZXldICYmIGRlc2NyaXB0b3JzW2tleV0uc2V0KSB7XG4gICAgICAgICAgICBub2RlW2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhdHRyKG5vZGUsIGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9zdmdfYXR0cmlidXRlcyhub2RlLCBhdHRyaWJ1dGVzKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBhdHRyKG5vZGUsIGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YShub2RlLCBwcm9wLCB2YWx1ZSkge1xuICAgIGlmIChwcm9wIGluIG5vZGUpIHtcbiAgICAgICAgbm9kZVtwcm9wXSA9IHR5cGVvZiBub2RlW3Byb3BdID09PSAnYm9vbGVhbicgJiYgdmFsdWUgPT09ICcnID8gdHJ1ZSA6IHZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgYXR0cihub2RlLCBwcm9wLCB2YWx1ZSk7XG4gICAgfVxufVxuZnVuY3Rpb24geGxpbmtfYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgbm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIGF0dHJpYnV0ZSwgdmFsdWUpO1xufVxuZnVuY3Rpb24gZ2V0X2JpbmRpbmdfZ3JvdXBfdmFsdWUoZ3JvdXAsIF9fdmFsdWUsIGNoZWNrZWQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdyb3VwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChncm91cFtpXS5jaGVja2VkKVxuICAgICAgICAgICAgdmFsdWUuYWRkKGdyb3VwW2ldLl9fdmFsdWUpO1xuICAgIH1cbiAgICBpZiAoIWNoZWNrZWQpIHtcbiAgICAgICAgdmFsdWUuZGVsZXRlKF9fdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZSk7XG59XG5mdW5jdGlvbiB0b19udW1iZXIodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09ICcnID8gbnVsbCA6ICt2YWx1ZTtcbn1cbmZ1bmN0aW9uIHRpbWVfcmFuZ2VzX3RvX2FycmF5KHJhbmdlcykge1xuICAgIGNvbnN0IGFycmF5ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYXJyYXkucHVzaCh7IHN0YXJ0OiByYW5nZXMuc3RhcnQoaSksIGVuZDogcmFuZ2VzLmVuZChpKSB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xufVxuZnVuY3Rpb24gY2hpbGRyZW4oZWxlbWVudCkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2hpbGROb2Rlcyk7XG59XG5mdW5jdGlvbiBpbml0X2NsYWltX2luZm8obm9kZXMpIHtcbiAgICBpZiAobm9kZXMuY2xhaW1faW5mbyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG5vZGVzLmNsYWltX2luZm8gPSB7IGxhc3RfaW5kZXg6IDAsIHRvdGFsX2NsYWltZWQ6IDAgfTtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGFpbV9ub2RlKG5vZGVzLCBwcmVkaWNhdGUsIHByb2Nlc3NOb2RlLCBjcmVhdGVOb2RlLCBkb250VXBkYXRlTGFzdEluZGV4ID0gZmFsc2UpIHtcbiAgICAvLyBUcnkgdG8gZmluZCBub2RlcyBpbiBhbiBvcmRlciBzdWNoIHRoYXQgd2UgbGVuZ3RoZW4gdGhlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZVxuICAgIGluaXRfY2xhaW1faW5mbyhub2Rlcyk7XG4gICAgY29uc3QgcmVzdWx0Tm9kZSA9ICgoKSA9PiB7XG4gICAgICAgIC8vIFdlIGZpcnN0IHRyeSB0byBmaW5kIGFuIGVsZW1lbnQgYWZ0ZXIgdGhlIHByZXZpb3VzIG9uZVxuICAgICAgICBmb3IgKGxldCBpID0gbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4OyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IHByb2Nlc3NOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChyZXBsYWNlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldID0gcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghZG9udFVwZGF0ZUxhc3RJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5jbGFpbV9pbmZvLmxhc3RfaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIHdlIHRyeSB0byBmaW5kIG9uZSBiZWZvcmVcbiAgICAgICAgLy8gV2UgaXRlcmF0ZSBpbiByZXZlcnNlIHNvIHRoYXQgd2UgZG9uJ3QgZ28gdG9vIGZhciBiYWNrXG4gICAgICAgIGZvciAobGV0IGkgPSBub2Rlcy5jbGFpbV9pbmZvLmxhc3RfaW5kZXggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgaWYgKHByZWRpY2F0ZShub2RlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gcHJvY2Vzc05vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0gPSByZXBsYWNlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFkb250VXBkYXRlTGFzdEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlcGxhY2VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2Ugd2Ugc3BsaWNlZCBiZWZvcmUgdGhlIGxhc3RfaW5kZXgsIHdlIGRlY3JlYXNlIGl0XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleC0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSBjYW4ndCBmaW5kIGFueSBtYXRjaGluZyBub2RlLCB3ZSBjcmVhdGUgYSBuZXcgb25lXG4gICAgICAgIHJldHVybiBjcmVhdGVOb2RlKCk7XG4gICAgfSkoKTtcbiAgICByZXN1bHROb2RlLmNsYWltX29yZGVyID0gbm9kZXMuY2xhaW1faW5mby50b3RhbF9jbGFpbWVkO1xuICAgIG5vZGVzLmNsYWltX2luZm8udG90YWxfY2xhaW1lZCArPSAxO1xuICAgIHJldHVybiByZXN1bHROb2RlO1xufVxuZnVuY3Rpb24gY2xhaW1fZWxlbWVudF9iYXNlKG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBjcmVhdGVfZWxlbWVudCkge1xuICAgIHJldHVybiBjbGFpbV9ub2RlKG5vZGVzLCAobm9kZSkgPT4gbm9kZS5ub2RlTmFtZSA9PT0gbmFtZSwgKG5vZGUpID0+IHtcbiAgICAgICAgY29uc3QgcmVtb3ZlID0gW107XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBub2RlLmF0dHJpYnV0ZXNbal07XG4gICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXNbYXR0cmlidXRlLm5hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlLnB1c2goYXR0cmlidXRlLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlbW92ZS5mb3JFYWNoKHYgPT4gbm9kZS5yZW1vdmVBdHRyaWJ1dGUodikpO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0sICgpID0+IGNyZWF0ZV9lbGVtZW50KG5hbWUpKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2VsZW1lbnQobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgICByZXR1cm4gY2xhaW1fZWxlbWVudF9iYXNlKG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBlbGVtZW50KTtcbn1cbmZ1bmN0aW9uIGNsYWltX3N2Z19lbGVtZW50KG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgcmV0dXJuIGNsYWltX2VsZW1lbnRfYmFzZShub2RlcywgbmFtZSwgYXR0cmlidXRlcywgc3ZnX2VsZW1lbnQpO1xufVxuZnVuY3Rpb24gY2xhaW1fdGV4dChub2RlcywgZGF0YSkge1xuICAgIHJldHVybiBjbGFpbV9ub2RlKG5vZGVzLCAobm9kZSkgPT4gbm9kZS5ub2RlVHlwZSA9PT0gMywgKG5vZGUpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YVN0ciA9ICcnICsgZGF0YTtcbiAgICAgICAgaWYgKG5vZGUuZGF0YS5zdGFydHNXaXRoKGRhdGFTdHIpKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5kYXRhLmxlbmd0aCAhPT0gZGF0YVN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5zcGxpdFRleHQoZGF0YVN0ci5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbm9kZS5kYXRhID0gZGF0YVN0cjtcbiAgICAgICAgfVxuICAgIH0sICgpID0+IHRleHQoZGF0YSksIHRydWUgLy8gVGV4dCBub2RlcyBzaG91bGQgbm90IHVwZGF0ZSBsYXN0IGluZGV4IHNpbmNlIGl0IGlzIGxpa2VseSBub3Qgd29ydGggaXQgdG8gZWxpbWluYXRlIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2YgYWN0dWFsIGVsZW1lbnRzXG4gICAgKTtcbn1cbmZ1bmN0aW9uIGNsYWltX3NwYWNlKG5vZGVzKSB7XG4gICAgcmV0dXJuIGNsYWltX3RleHQobm9kZXMsICcgJyk7XG59XG5mdW5jdGlvbiBmaW5kX2NvbW1lbnQobm9kZXMsIHRleHQsIHN0YXJ0KSB7XG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgbm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCAvKiBjb21tZW50IG5vZGUgKi8gJiYgbm9kZS50ZXh0Q29udGVudC50cmltKCkgPT09IHRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2Rlcy5sZW5ndGg7XG59XG5mdW5jdGlvbiBjbGFpbV9odG1sX3RhZyhub2Rlcykge1xuICAgIC8vIGZpbmQgaHRtbCBvcGVuaW5nIHRhZ1xuICAgIGNvbnN0IHN0YXJ0X2luZGV4ID0gZmluZF9jb21tZW50KG5vZGVzLCAnSFRNTF9UQUdfU1RBUlQnLCAwKTtcbiAgICBjb25zdCBlbmRfaW5kZXggPSBmaW5kX2NvbW1lbnQobm9kZXMsICdIVE1MX1RBR19FTkQnLCBzdGFydF9pbmRleCk7XG4gICAgaWYgKHN0YXJ0X2luZGV4ID09PSBlbmRfaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBIdG1sVGFnSHlkcmF0aW9uKCk7XG4gICAgfVxuICAgIGluaXRfY2xhaW1faW5mbyhub2Rlcyk7XG4gICAgY29uc3QgaHRtbF90YWdfbm9kZXMgPSBub2Rlcy5zcGxpY2Uoc3RhcnRfaW5kZXgsIGVuZF9pbmRleCArIDEpO1xuICAgIGRldGFjaChodG1sX3RhZ19ub2Rlc1swXSk7XG4gICAgZGV0YWNoKGh0bWxfdGFnX25vZGVzW2h0bWxfdGFnX25vZGVzLmxlbmd0aCAtIDFdKTtcbiAgICBjb25zdCBjbGFpbWVkX25vZGVzID0gaHRtbF90YWdfbm9kZXMuc2xpY2UoMSwgaHRtbF90YWdfbm9kZXMubGVuZ3RoIC0gMSk7XG4gICAgZm9yIChjb25zdCBuIG9mIGNsYWltZWRfbm9kZXMpIHtcbiAgICAgICAgbi5jbGFpbV9vcmRlciA9IG5vZGVzLmNsYWltX2luZm8udG90YWxfY2xhaW1lZDtcbiAgICAgICAgbm9kZXMuY2xhaW1faW5mby50b3RhbF9jbGFpbWVkICs9IDE7XG4gICAgfVxuICAgIHJldHVybiBuZXcgSHRtbFRhZ0h5ZHJhdGlvbihjbGFpbWVkX25vZGVzKTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhKHRleHQsIGRhdGEpIHtcbiAgICBkYXRhID0gJycgKyBkYXRhO1xuICAgIGlmICh0ZXh0Lndob2xlVGV4dCAhPT0gZGF0YSlcbiAgICAgICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF92YWx1ZShpbnB1dCwgdmFsdWUpIHtcbiAgICBpbnB1dC52YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X2lucHV0X3R5cGUoaW5wdXQsIHR5cGUpIHtcbiAgICB0cnkge1xuICAgICAgICBpbnB1dC50eXBlID0gdHlwZTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9zdHlsZShub2RlLCBrZXksIHZhbHVlLCBpbXBvcnRhbnQpIHtcbiAgICBub2RlLnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIGltcG9ydGFudCA/ICdpbXBvcnRhbnQnIDogJycpO1xufVxuZnVuY3Rpb24gc2VsZWN0X29wdGlvbihzZWxlY3QsIHZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Qub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcbiAgICAgICAgaWYgKG9wdGlvbi5fX3ZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZWxlY3Quc2VsZWN0ZWRJbmRleCA9IC0xOyAvLyBubyBvcHRpb24gc2hvdWxkIGJlIHNlbGVjdGVkXG59XG5mdW5jdGlvbiBzZWxlY3Rfb3B0aW9ucyhzZWxlY3QsIHZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Qub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gfnZhbHVlLmluZGV4T2Yob3B0aW9uLl9fdmFsdWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNlbGVjdF92YWx1ZShzZWxlY3QpIHtcbiAgICBjb25zdCBzZWxlY3RlZF9vcHRpb24gPSBzZWxlY3QucXVlcnlTZWxlY3RvcignOmNoZWNrZWQnKSB8fCBzZWxlY3Qub3B0aW9uc1swXTtcbiAgICByZXR1cm4gc2VsZWN0ZWRfb3B0aW9uICYmIHNlbGVjdGVkX29wdGlvbi5fX3ZhbHVlO1xufVxuZnVuY3Rpb24gc2VsZWN0X211bHRpcGxlX3ZhbHVlKHNlbGVjdCkge1xuICAgIHJldHVybiBbXS5tYXAuY2FsbChzZWxlY3QucXVlcnlTZWxlY3RvckFsbCgnOmNoZWNrZWQnKSwgb3B0aW9uID0+IG9wdGlvbi5fX3ZhbHVlKTtcbn1cbi8vIHVuZm9ydHVuYXRlbHkgdGhpcyBjYW4ndCBiZSBhIGNvbnN0YW50IGFzIHRoYXQgd291bGRuJ3QgYmUgdHJlZS1zaGFrZWFibGVcbi8vIHNvIHdlIGNhY2hlIHRoZSByZXN1bHQgaW5zdGVhZFxubGV0IGNyb3Nzb3JpZ2luO1xuZnVuY3Rpb24gaXNfY3Jvc3NvcmlnaW4oKSB7XG4gICAgaWYgKGNyb3Nzb3JpZ2luID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY3Jvc3NvcmlnaW4gPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdm9pZCB3aW5kb3cucGFyZW50LmRvY3VtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY3Jvc3NvcmlnaW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcm9zc29yaWdpbjtcbn1cbmZ1bmN0aW9uIGFkZF9yZXNpemVfbGlzdGVuZXIobm9kZSwgZm4pIHtcbiAgICBjb25zdCBjb21wdXRlZF9zdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgaWYgKGNvbXB1dGVkX3N0eWxlLnBvc2l0aW9uID09PSAnc3RhdGljJykge1xuICAgICAgICBub2RlLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcbiAgICB9XG4gICAgY29uc3QgaWZyYW1lID0gZWxlbWVudCgnaWZyYW1lJyk7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnZGlzcGxheTogYmxvY2s7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAwOyBsZWZ0OiAwOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlOyAnICtcbiAgICAgICAgJ292ZXJmbG93OiBoaWRkZW47IGJvcmRlcjogMDsgb3BhY2l0eTogMDsgcG9pbnRlci1ldmVudHM6IG5vbmU7IHotaW5kZXg6IC0xOycpO1xuICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICBpZnJhbWUudGFiSW5kZXggPSAtMTtcbiAgICBjb25zdCBjcm9zc29yaWdpbiA9IGlzX2Nyb3Nzb3JpZ2luKCk7XG4gICAgbGV0IHVuc3Vic2NyaWJlO1xuICAgIGlmIChjcm9zc29yaWdpbikge1xuICAgICAgICBpZnJhbWUuc3JjID0gXCJkYXRhOnRleHQvaHRtbCw8c2NyaXB0Pm9ucmVzaXplPWZ1bmN0aW9uKCl7cGFyZW50LnBvc3RNZXNzYWdlKDAsJyonKX08L3NjcmlwdD5cIjtcbiAgICAgICAgdW5zdWJzY3JpYmUgPSBsaXN0ZW4od2luZG93LCAnbWVzc2FnZScsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnNvdXJjZSA9PT0gaWZyYW1lLmNvbnRlbnRXaW5kb3cpXG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZnJhbWUuc3JjID0gJ2Fib3V0OmJsYW5rJztcbiAgICAgICAgaWZyYW1lLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlID0gbGlzdGVuKGlmcmFtZS5jb250ZW50V2luZG93LCAncmVzaXplJywgZm4pO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBhcHBlbmQobm9kZSwgaWZyYW1lKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZiAoY3Jvc3NvcmlnaW4pIHtcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodW5zdWJzY3JpYmUgJiYgaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGV0YWNoKGlmcmFtZSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRvZ2dsZV9jbGFzcyhlbGVtZW50LCBuYW1lLCB0b2dnbGUpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdFt0b2dnbGUgPyAnYWRkJyA6ICdyZW1vdmUnXShuYW1lKTtcbn1cbmZ1bmN0aW9uIGN1c3RvbV9ldmVudCh0eXBlLCBkZXRhaWwsIGJ1YmJsZXMgPSBmYWxzZSkge1xuICAgIGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBidWJibGVzLCBmYWxzZSwgZGV0YWlsKTtcbiAgICByZXR1cm4gZTtcbn1cbmZ1bmN0aW9uIHF1ZXJ5X3NlbGVjdG9yX2FsbChzZWxlY3RvciwgcGFyZW50ID0gZG9jdW1lbnQuYm9keSkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG59XG5jbGFzcyBIdG1sVGFnIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5lID0gdGhpcy5uID0gbnVsbDtcbiAgICB9XG4gICAgYyhodG1sKSB7XG4gICAgICAgIHRoaXMuaChodG1sKTtcbiAgICB9XG4gICAgbShodG1sLCB0YXJnZXQsIGFuY2hvciA9IG51bGwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmUpIHtcbiAgICAgICAgICAgIHRoaXMuZSA9IGVsZW1lbnQodGFyZ2V0Lm5vZGVOYW1lKTtcbiAgICAgICAgICAgIHRoaXMudCA9IHRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuYyhodG1sKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmkoYW5jaG9yKTtcbiAgICB9XG4gICAgaChodG1sKSB7XG4gICAgICAgIHRoaXMuZS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICB0aGlzLm4gPSBBcnJheS5mcm9tKHRoaXMuZS5jaGlsZE5vZGVzKTtcbiAgICB9XG4gICAgaShhbmNob3IpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGluc2VydCh0aGlzLnQsIHRoaXMubltpXSwgYW5jaG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwKGh0bWwpIHtcbiAgICAgICAgdGhpcy5kKCk7XG4gICAgICAgIHRoaXMuaChodG1sKTtcbiAgICAgICAgdGhpcy5pKHRoaXMuYSk7XG4gICAgfVxuICAgIGQoKSB7XG4gICAgICAgIHRoaXMubi5mb3JFYWNoKGRldGFjaCk7XG4gICAgfVxufVxuY2xhc3MgSHRtbFRhZ0h5ZHJhdGlvbiBleHRlbmRzIEh0bWxUYWcge1xuICAgIGNvbnN0cnVjdG9yKGNsYWltZWRfbm9kZXMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5lID0gdGhpcy5uID0gbnVsbDtcbiAgICAgICAgdGhpcy5sID0gY2xhaW1lZF9ub2RlcztcbiAgICB9XG4gICAgYyhodG1sKSB7XG4gICAgICAgIGlmICh0aGlzLmwpIHtcbiAgICAgICAgICAgIHRoaXMubiA9IHRoaXMubDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLmMoaHRtbCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaShhbmNob3IpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGluc2VydF9oeWRyYXRpb24odGhpcy50LCB0aGlzLm5baV0sIGFuY2hvcik7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBhdHRyaWJ1dGVfdG9fb2JqZWN0KGF0dHJpYnV0ZXMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHJlc3VsdFthdHRyaWJ1dGUubmFtZV0gPSBhdHRyaWJ1dGUudmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBnZXRfY3VzdG9tX2VsZW1lbnRzX3Nsb3RzKGVsZW1lbnQpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBlbGVtZW50LmNoaWxkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICByZXN1bHRbbm9kZS5zbG90IHx8ICdkZWZhdWx0J10gPSB0cnVlO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmNvbnN0IGFjdGl2ZV9kb2NzID0gbmV3IFNldCgpO1xubGV0IGFjdGl2ZSA9IDA7XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZGFya3NreWFwcC9zdHJpbmctaGFzaC9ibG9iL21hc3Rlci9pbmRleC5qc1xuZnVuY3Rpb24gaGFzaChzdHIpIHtcbiAgICBsZXQgaGFzaCA9IDUzODE7XG4gICAgbGV0IGkgPSBzdHIubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pXG4gICAgICAgIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSBeIHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBoYXNoID4+PiAwO1xufVxuZnVuY3Rpb24gY3JlYXRlX3J1bGUobm9kZSwgYSwgYiwgZHVyYXRpb24sIGRlbGF5LCBlYXNlLCBmbiwgdWlkID0gMCkge1xuICAgIGNvbnN0IHN0ZXAgPSAxNi42NjYgLyBkdXJhdGlvbjtcbiAgICBsZXQga2V5ZnJhbWVzID0gJ3tcXG4nO1xuICAgIGZvciAobGV0IHAgPSAwOyBwIDw9IDE7IHAgKz0gc3RlcCkge1xuICAgICAgICBjb25zdCB0ID0gYSArIChiIC0gYSkgKiBlYXNlKHApO1xuICAgICAgICBrZXlmcmFtZXMgKz0gcCAqIDEwMCArIGAleyR7Zm4odCwgMSAtIHQpfX1cXG5gO1xuICAgIH1cbiAgICBjb25zdCBydWxlID0ga2V5ZnJhbWVzICsgYDEwMCUgeyR7Zm4oYiwgMSAtIGIpfX1cXG59YDtcbiAgICBjb25zdCBuYW1lID0gYF9fc3ZlbHRlXyR7aGFzaChydWxlKX1fJHt1aWR9YDtcbiAgICBjb25zdCBkb2MgPSBnZXRfcm9vdF9mb3Jfc3R5bGUobm9kZSk7XG4gICAgYWN0aXZlX2RvY3MuYWRkKGRvYyk7XG4gICAgY29uc3Qgc3R5bGVzaGVldCA9IGRvYy5fX3N2ZWx0ZV9zdHlsZXNoZWV0IHx8IChkb2MuX19zdmVsdGVfc3R5bGVzaGVldCA9IGFwcGVuZF9lbXB0eV9zdHlsZXNoZWV0KG5vZGUpLnNoZWV0KTtcbiAgICBjb25zdCBjdXJyZW50X3J1bGVzID0gZG9jLl9fc3ZlbHRlX3J1bGVzIHx8IChkb2MuX19zdmVsdGVfcnVsZXMgPSB7fSk7XG4gICAgaWYgKCFjdXJyZW50X3J1bGVzW25hbWVdKSB7XG4gICAgICAgIGN1cnJlbnRfcnVsZXNbbmFtZV0gPSB0cnVlO1xuICAgICAgICBzdHlsZXNoZWV0Lmluc2VydFJ1bGUoYEBrZXlmcmFtZXMgJHtuYW1lfSAke3J1bGV9YCwgc3R5bGVzaGVldC5jc3NSdWxlcy5sZW5ndGgpO1xuICAgIH1cbiAgICBjb25zdCBhbmltYXRpb24gPSBub2RlLnN0eWxlLmFuaW1hdGlvbiB8fCAnJztcbiAgICBub2RlLnN0eWxlLmFuaW1hdGlvbiA9IGAke2FuaW1hdGlvbiA/IGAke2FuaW1hdGlvbn0sIGAgOiAnJ30ke25hbWV9ICR7ZHVyYXRpb259bXMgbGluZWFyICR7ZGVsYXl9bXMgMSBib3RoYDtcbiAgICBhY3RpdmUgKz0gMTtcbiAgICByZXR1cm4gbmFtZTtcbn1cbmZ1bmN0aW9uIGRlbGV0ZV9ydWxlKG5vZGUsIG5hbWUpIHtcbiAgICBjb25zdCBwcmV2aW91cyA9IChub2RlLnN0eWxlLmFuaW1hdGlvbiB8fCAnJykuc3BsaXQoJywgJyk7XG4gICAgY29uc3QgbmV4dCA9IHByZXZpb3VzLmZpbHRlcihuYW1lXG4gICAgICAgID8gYW5pbSA9PiBhbmltLmluZGV4T2YobmFtZSkgPCAwIC8vIHJlbW92ZSBzcGVjaWZpYyBhbmltYXRpb25cbiAgICAgICAgOiBhbmltID0+IGFuaW0uaW5kZXhPZignX19zdmVsdGUnKSA9PT0gLTEgLy8gcmVtb3ZlIGFsbCBTdmVsdGUgYW5pbWF0aW9uc1xuICAgICk7XG4gICAgY29uc3QgZGVsZXRlZCA9IHByZXZpb3VzLmxlbmd0aCAtIG5leHQubGVuZ3RoO1xuICAgIGlmIChkZWxldGVkKSB7XG4gICAgICAgIG5vZGUuc3R5bGUuYW5pbWF0aW9uID0gbmV4dC5qb2luKCcsICcpO1xuICAgICAgICBhY3RpdmUgLT0gZGVsZXRlZDtcbiAgICAgICAgaWYgKCFhY3RpdmUpXG4gICAgICAgICAgICBjbGVhcl9ydWxlcygpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNsZWFyX3J1bGVzKCkge1xuICAgIHJhZigoKSA9PiB7XG4gICAgICAgIGlmIChhY3RpdmUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGFjdGl2ZV9kb2NzLmZvckVhY2goZG9jID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlc2hlZXQgPSBkb2MuX19zdmVsdGVfc3R5bGVzaGVldDtcbiAgICAgICAgICAgIGxldCBpID0gc3R5bGVzaGVldC5jc3NSdWxlcy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKVxuICAgICAgICAgICAgICAgIHN0eWxlc2hlZXQuZGVsZXRlUnVsZShpKTtcbiAgICAgICAgICAgIGRvYy5fX3N2ZWx0ZV9ydWxlcyA9IHt9O1xuICAgICAgICB9KTtcbiAgICAgICAgYWN0aXZlX2RvY3MuY2xlYXIoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlX2FuaW1hdGlvbihub2RlLCBmcm9tLCBmbiwgcGFyYW1zKSB7XG4gICAgaWYgKCFmcm9tKVxuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICBjb25zdCB0byA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKGZyb20ubGVmdCA9PT0gdG8ubGVmdCAmJiBmcm9tLnJpZ2h0ID09PSB0by5yaWdodCAmJiBmcm9tLnRvcCA9PT0gdG8udG9wICYmIGZyb20uYm90dG9tID09PSB0by5ib3R0b20pXG4gICAgICAgIHJldHVybiBub29wO1xuICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIFxuICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogc2hvdWxkIHRoaXMgYmUgc2VwYXJhdGVkIGZyb20gZGVzdHJ1Y3R1cmluZz8gT3Igc3RhcnQvZW5kIGFkZGVkIHRvIHB1YmxpYyBhcGkgYW5kIGRvY3VtZW50YXRpb24/XG4gICAgc3RhcnQ6IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5LCBcbiAgICAvLyBAdHMtaWdub3JlIHRvZG86XG4gICAgZW5kID0gc3RhcnRfdGltZSArIGR1cmF0aW9uLCB0aWNrID0gbm9vcCwgY3NzIH0gPSBmbihub2RlLCB7IGZyb20sIHRvIH0sIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XG4gICAgbGV0IG5hbWU7XG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgIG5hbWUgPSBjcmVhdGVfcnVsZShub2RlLCAwLCAxLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRlbGF5KSB7XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICBpZiAoY3NzKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgbmFtZSk7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgbG9vcChub3cgPT4ge1xuICAgICAgICBpZiAoIXN0YXJ0ZWQgJiYgbm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydGVkICYmIG5vdyA+PSBlbmQpIHtcbiAgICAgICAgICAgIHRpY2soMSwgMCk7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFydW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBub3cgLSBzdGFydF90aW1lO1xuICAgICAgICAgICAgY29uc3QgdCA9IDAgKyAxICogZWFzaW5nKHAgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgICBzdGFydCgpO1xuICAgIHRpY2soMCwgMSk7XG4gICAgcmV0dXJuIHN0b3A7XG59XG5mdW5jdGlvbiBmaXhfcG9zaXRpb24obm9kZSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBpZiAoc3R5bGUucG9zaXRpb24gIT09ICdhYnNvbHV0ZScgJiYgc3R5bGUucG9zaXRpb24gIT09ICdmaXhlZCcpIHtcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBzdHlsZTtcbiAgICAgICAgY29uc3QgYSA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBub2RlLnN0eWxlLndpZHRoID0gd2lkdGg7XG4gICAgICAgIG5vZGUuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBhZGRfdHJhbnNmb3JtKG5vZGUsIGEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFkZF90cmFuc2Zvcm0obm9kZSwgYSkge1xuICAgIGNvbnN0IGIgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGlmIChhLmxlZnQgIT09IGIubGVmdCB8fCBhLnRvcCAhPT0gYi50b3ApIHtcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSBzdHlsZS50cmFuc2Zvcm0gPT09ICdub25lJyA/ICcnIDogc3R5bGUudHJhbnNmb3JtO1xuICAgICAgICBub2RlLnN0eWxlLnRyYW5zZm9ybSA9IGAke3RyYW5zZm9ybX0gdHJhbnNsYXRlKCR7YS5sZWZ0IC0gYi5sZWZ0fXB4LCAke2EudG9wIC0gYi50b3B9cHgpYDtcbiAgICB9XG59XG5cbmxldCBjdXJyZW50X2NvbXBvbmVudDtcbmZ1bmN0aW9uIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICBjdXJyZW50X2NvbXBvbmVudCA9IGNvbXBvbmVudDtcbn1cbmZ1bmN0aW9uIGdldF9jdXJyZW50X2NvbXBvbmVudCgpIHtcbiAgICBpZiAoIWN1cnJlbnRfY29tcG9uZW50KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Z1bmN0aW9uIGNhbGxlZCBvdXRzaWRlIGNvbXBvbmVudCBpbml0aWFsaXphdGlvbicpO1xuICAgIHJldHVybiBjdXJyZW50X2NvbXBvbmVudDtcbn1cbmZ1bmN0aW9uIGJlZm9yZVVwZGF0ZShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmJlZm9yZV91cGRhdGUucHVzaChmbik7XG59XG5mdW5jdGlvbiBvbk1vdW50KGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQub25fbW91bnQucHVzaChmbik7XG59XG5mdW5jdGlvbiBhZnRlclVwZGF0ZShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmFmdGVyX3VwZGF0ZS5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIG9uRGVzdHJveShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLm9uX2Rlc3Ryb3kucHVzaChmbik7XG59XG5mdW5jdGlvbiBjcmVhdGVFdmVudERpc3BhdGNoZXIoKSB7XG4gICAgY29uc3QgY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgcmV0dXJuICh0eXBlLCBkZXRhaWwpID0+IHtcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gY29tcG9uZW50LiQkLmNhbGxiYWNrc1t0eXBlXTtcbiAgICAgICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgICAgICAgLy8gVE9ETyBhcmUgdGhlcmUgc2l0dWF0aW9ucyB3aGVyZSBldmVudHMgY291bGQgYmUgZGlzcGF0Y2hlZFxuICAgICAgICAgICAgLy8gaW4gYSBzZXJ2ZXIgKG5vbi1ET00pIGVudmlyb25tZW50P1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBjdXN0b21fZXZlbnQodHlwZSwgZGV0YWlsKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4ge1xuICAgICAgICAgICAgICAgIGZuLmNhbGwoY29tcG9uZW50LCBldmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBzZXRDb250ZXh0KGtleSwgY29udGV4dCkge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQuc2V0KGtleSwgY29udGV4dCk7XG59XG5mdW5jdGlvbiBnZXRDb250ZXh0KGtleSkge1xuICAgIHJldHVybiBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LmdldChrZXkpO1xufVxuZnVuY3Rpb24gZ2V0QWxsQ29udGV4dHMoKSB7XG4gICAgcmV0dXJuIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQ7XG59XG5mdW5jdGlvbiBoYXNDb250ZXh0KGtleSkge1xuICAgIHJldHVybiBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LmhhcyhrZXkpO1xufVxuLy8gVE9ETyBmaWd1cmUgb3V0IGlmIHdlIHN0aWxsIHdhbnQgdG8gc3VwcG9ydFxuLy8gc2hvcnRoYW5kIGV2ZW50cywgb3IgaWYgd2Ugd2FudCB0byBpbXBsZW1lbnRcbi8vIGEgcmVhbCBidWJibGluZyBtZWNoYW5pc21cbmZ1bmN0aW9uIGJ1YmJsZShjb21wb25lbnQsIGV2ZW50KSB7XG4gICAgY29uc3QgY2FsbGJhY2tzID0gY29tcG9uZW50LiQkLmNhbGxiYWNrc1tldmVudC50eXBlXTtcbiAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY2FsbGJhY2tzLnNsaWNlKCkuZm9yRWFjaChmbiA9PiBmbi5jYWxsKHRoaXMsIGV2ZW50KSk7XG4gICAgfVxufVxuXG5jb25zdCBkaXJ0eV9jb21wb25lbnRzID0gW107XG5jb25zdCBpbnRyb3MgPSB7IGVuYWJsZWQ6IGZhbHNlIH07XG5jb25zdCBiaW5kaW5nX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgcmVuZGVyX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgZmx1c2hfY2FsbGJhY2tzID0gW107XG5jb25zdCByZXNvbHZlZF9wcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5sZXQgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuZnVuY3Rpb24gc2NoZWR1bGVfdXBkYXRlKCkge1xuICAgIGlmICghdXBkYXRlX3NjaGVkdWxlZCkge1xuICAgICAgICB1cGRhdGVfc2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZWRfcHJvbWlzZS50aGVuKGZsdXNoKTtcbiAgICB9XG59XG5mdW5jdGlvbiB0aWNrKCkge1xuICAgIHNjaGVkdWxlX3VwZGF0ZSgpO1xuICAgIHJldHVybiByZXNvbHZlZF9wcm9taXNlO1xufVxuZnVuY3Rpb24gYWRkX3JlbmRlcl9jYWxsYmFjayhmbikge1xuICAgIHJlbmRlcl9jYWxsYmFja3MucHVzaChmbik7XG59XG5mdW5jdGlvbiBhZGRfZmx1c2hfY2FsbGJhY2soZm4pIHtcbiAgICBmbHVzaF9jYWxsYmFja3MucHVzaChmbik7XG59XG5sZXQgZmx1c2hpbmcgPSBmYWxzZTtcbmNvbnN0IHNlZW5fY2FsbGJhY2tzID0gbmV3IFNldCgpO1xuZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgaWYgKGZsdXNoaW5nKVxuICAgICAgICByZXR1cm47XG4gICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgIGRvIHtcbiAgICAgICAgLy8gZmlyc3QsIGNhbGwgYmVmb3JlVXBkYXRlIGZ1bmN0aW9uc1xuICAgICAgICAvLyBhbmQgdXBkYXRlIGNvbXBvbmVudHNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaXJ0eV9jb21wb25lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBkaXJ0eV9jb21wb25lbnRzW2ldO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICAgICAgICB1cGRhdGUoY29tcG9uZW50LiQkKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQobnVsbCk7XG4gICAgICAgIGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoID0gMDtcbiAgICAgICAgd2hpbGUgKGJpbmRpbmdfY2FsbGJhY2tzLmxlbmd0aClcbiAgICAgICAgICAgIGJpbmRpbmdfY2FsbGJhY2tzLnBvcCgpKCk7XG4gICAgICAgIC8vIHRoZW4sIG9uY2UgY29tcG9uZW50cyBhcmUgdXBkYXRlZCwgY2FsbFxuICAgICAgICAvLyBhZnRlclVwZGF0ZSBmdW5jdGlvbnMuIFRoaXMgbWF5IGNhdXNlXG4gICAgICAgIC8vIHN1YnNlcXVlbnQgdXBkYXRlcy4uLlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbmRlcl9jYWxsYmFja3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gcmVuZGVyX2NhbGxiYWNrc1tpXTtcbiAgICAgICAgICAgIGlmICghc2Vlbl9jYWxsYmFja3MuaGFzKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIC8vIC4uLnNvIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgbG9vcHNcbiAgICAgICAgICAgICAgICBzZWVuX2NhbGxiYWNrcy5hZGQoY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGggPSAwO1xuICAgIH0gd2hpbGUgKGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoKTtcbiAgICB3aGlsZSAoZmx1c2hfY2FsbGJhY2tzLmxlbmd0aCkge1xuICAgICAgICBmbHVzaF9jYWxsYmFja3MucG9wKCkoKTtcbiAgICB9XG4gICAgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgc2Vlbl9jYWxsYmFja3MuY2xlYXIoKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZSgkJCkge1xuICAgIGlmICgkJC5mcmFnbWVudCAhPT0gbnVsbCkge1xuICAgICAgICAkJC51cGRhdGUoKTtcbiAgICAgICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAgICAgY29uc3QgZGlydHkgPSAkJC5kaXJ0eTtcbiAgICAgICAgJCQuZGlydHkgPSBbLTFdO1xuICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5wKCQkLmN0eCwgZGlydHkpO1xuICAgICAgICAkJC5hZnRlcl91cGRhdGUuZm9yRWFjaChhZGRfcmVuZGVyX2NhbGxiYWNrKTtcbiAgICB9XG59XG5cbmxldCBwcm9taXNlO1xuZnVuY3Rpb24gd2FpdCgpIHtcbiAgICBpZiAoIXByb21pc2UpIHtcbiAgICAgICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcHJvbWlzZSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGRpc3BhdGNoKG5vZGUsIGRpcmVjdGlvbiwga2luZCkge1xuICAgIG5vZGUuZGlzcGF0Y2hFdmVudChjdXN0b21fZXZlbnQoYCR7ZGlyZWN0aW9uID8gJ2ludHJvJyA6ICdvdXRybyd9JHtraW5kfWApKTtcbn1cbmNvbnN0IG91dHJvaW5nID0gbmV3IFNldCgpO1xubGV0IG91dHJvcztcbmZ1bmN0aW9uIGdyb3VwX291dHJvcygpIHtcbiAgICBvdXRyb3MgPSB7XG4gICAgICAgIHI6IDAsXG4gICAgICAgIGM6IFtdLFxuICAgICAgICBwOiBvdXRyb3MgLy8gcGFyZW50IGdyb3VwXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNoZWNrX291dHJvcygpIHtcbiAgICBpZiAoIW91dHJvcy5yKSB7XG4gICAgICAgIHJ1bl9hbGwob3V0cm9zLmMpO1xuICAgIH1cbiAgICBvdXRyb3MgPSBvdXRyb3MucDtcbn1cbmZ1bmN0aW9uIHRyYW5zaXRpb25faW4oYmxvY2ssIGxvY2FsKSB7XG4gICAgaWYgKGJsb2NrICYmIGJsb2NrLmkpIHtcbiAgICAgICAgb3V0cm9pbmcuZGVsZXRlKGJsb2NrKTtcbiAgICAgICAgYmxvY2suaShsb2NhbCk7XG4gICAgfVxufVxuZnVuY3Rpb24gdHJhbnNpdGlvbl9vdXQoYmxvY2ssIGxvY2FsLCBkZXRhY2gsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGJsb2NrICYmIGJsb2NrLm8pIHtcbiAgICAgICAgaWYgKG91dHJvaW5nLmhhcyhibG9jaykpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIG91dHJvaW5nLmFkZChibG9jayk7XG4gICAgICAgIG91dHJvcy5jLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgb3V0cm9pbmcuZGVsZXRlKGJsb2NrKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChkZXRhY2gpXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLmQoMSk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGJsb2NrLm8obG9jYWwpO1xuICAgIH1cbn1cbmNvbnN0IG51bGxfdHJhbnNpdGlvbiA9IHsgZHVyYXRpb246IDAgfTtcbmZ1bmN0aW9uIGNyZWF0ZV9pbl90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMpIHtcbiAgICBsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IGZhbHNlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBsZXQgdGFzaztcbiAgICBsZXQgdWlkID0gMDtcbiAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdvKCkge1xuICAgICAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCB0aWNrID0gbm9vcCwgY3NzIH0gPSBjb25maWcgfHwgbnVsbF90cmFuc2l0aW9uO1xuICAgICAgICBpZiAoY3NzKVxuICAgICAgICAgICAgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCAwLCAxLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzLCB1aWQrKyk7XG4gICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5O1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcbiAgICAgICAgaWYgKHRhc2spXG4gICAgICAgICAgICB0YXNrLmFib3J0KCk7XG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IGRpc3BhdGNoKG5vZGUsIHRydWUsICdzdGFydCcpKTtcbiAgICAgICAgdGFzayA9IGxvb3Aobm93ID0+IHtcbiAgICAgICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBlbmRfdGltZSkge1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEsIDApO1xuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChub2RlLCB0cnVlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQoKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRlZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUpO1xuICAgICAgICAgICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICBjb25maWcgPSBjb25maWcoKTtcbiAgICAgICAgICAgICAgICB3YWl0KCkudGhlbihnbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbnZhbGlkYXRlKCkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX291dF90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMpIHtcbiAgICBsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zKTtcbiAgICBsZXQgcnVubmluZyA9IHRydWU7XG4gICAgbGV0IGFuaW1hdGlvbl9uYW1lO1xuICAgIGNvbnN0IGdyb3VwID0gb3V0cm9zO1xuICAgIGdyb3VwLnIgKz0gMTtcbiAgICBmdW5jdGlvbiBnbygpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMSwgMCwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5O1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBmYWxzZSwgJ3N0YXJ0JykpO1xuICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gZW5kX3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEtLWdyb3VwLnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCByZXN1bHQgaW4gYGVuZCgpYCBiZWluZyBjYWxsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyB3ZSBkb24ndCBuZWVkIHRvIGNsZWFuIHVwIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwoZ3JvdXAuYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IGVhc2luZygobm93IC0gc3RhcnRfdGltZSkgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMSAtIHQsIHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICBnbygpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdvKCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGVuZChyZXNldCkge1xuICAgICAgICAgICAgaWYgKHJlc2V0ICYmIGNvbmZpZy50aWNrKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLnRpY2soMSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25fbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgICAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBjcmVhdGVfYmlkaXJlY3Rpb25hbF90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMsIGludHJvKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHQgPSBpbnRybyA/IDAgOiAxO1xuICAgIGxldCBydW5uaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgIGxldCBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgIGxldCBhbmltYXRpb25fbmFtZSA9IG51bGw7XG4gICAgZnVuY3Rpb24gY2xlYXJfYW5pbWF0aW9uKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGluaXQocHJvZ3JhbSwgZHVyYXRpb24pIHtcbiAgICAgICAgY29uc3QgZCA9IChwcm9ncmFtLmIgLSB0KTtcbiAgICAgICAgZHVyYXRpb24gKj0gTWF0aC5hYnMoZCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhOiB0LFxuICAgICAgICAgICAgYjogcHJvZ3JhbS5iLFxuICAgICAgICAgICAgZCxcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgc3RhcnQ6IHByb2dyYW0uc3RhcnQsXG4gICAgICAgICAgICBlbmQ6IHByb2dyYW0uc3RhcnQgKyBkdXJhdGlvbixcbiAgICAgICAgICAgIGdyb3VwOiBwcm9ncmFtLmdyb3VwXG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdvKGIpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IHtcbiAgICAgICAgICAgIHN0YXJ0OiBub3coKSArIGRlbGF5LFxuICAgICAgICAgICAgYlxuICAgICAgICB9O1xuICAgICAgICBpZiAoIWIpIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG4gICAgICAgICAgICBwcm9ncmFtLmdyb3VwID0gb3V0cm9zO1xuICAgICAgICAgICAgb3V0cm9zLnIgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtIHx8IHBlbmRpbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgcGVuZGluZ19wcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHRoaXMgaXMgYW4gaW50cm8sIGFuZCB0aGVyZSdzIGEgZGVsYXksIHdlIG5lZWQgdG8gZG9cbiAgICAgICAgICAgIC8vIGFuIGluaXRpYWwgdGljayBhbmQvb3IgYXBwbHkgQ1NTIGFuaW1hdGlvbiBpbW1lZGlhdGVseVxuICAgICAgICAgICAgaWYgKGNzcykge1xuICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgdCwgYiwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYilcbiAgICAgICAgICAgICAgICB0aWNrKDAsIDEpO1xuICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gaW5pdChwcm9ncmFtLCBkdXJhdGlvbik7XG4gICAgICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IGRpc3BhdGNoKG5vZGUsIGIsICdzdGFydCcpKTtcbiAgICAgICAgICAgIGxvb3Aobm93ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocGVuZGluZ19wcm9ncmFtICYmIG5vdyA+IHBlbmRpbmdfcHJvZ3JhbS5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBydW5uaW5nX3Byb2dyYW0gPSBpbml0KHBlbmRpbmdfcHJvZ3JhbSwgZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChub2RlLCBydW5uaW5nX3Byb2dyYW0uYiwgJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCB0LCBydW5uaW5nX3Byb2dyYW0uYiwgcnVubmluZ19wcm9ncmFtLmR1cmF0aW9uLCAwLCBlYXNpbmcsIGNvbmZpZy5jc3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChydW5uaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBydW5uaW5nX3Byb2dyYW0uZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrKHQgPSBydW5uaW5nX3Byb2dyYW0uYiwgMSAtIHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgcnVubmluZ19wcm9ncmFtLmIsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGVuZGluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5uaW5nX3Byb2dyYW0uYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnRybyDigJQgd2UgY2FuIHRpZHkgdXAgaW1tZWRpYXRlbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJfYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvdXRybyDigJQgbmVlZHMgdG8gYmUgY29vcmRpbmF0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEtLXJ1bm5pbmdfcHJvZ3JhbS5ncm91cC5yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuX2FsbChydW5uaW5nX3Byb2dyYW0uZ3JvdXAuYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChub3cgPj0gcnVubmluZ19wcm9ncmFtLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwID0gbm93IC0gcnVubmluZ19wcm9ncmFtLnN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdCA9IHJ1bm5pbmdfcHJvZ3JhbS5hICsgcnVubmluZ19wcm9ncmFtLmQgKiBlYXNpbmcocCAvIHJ1bm5pbmdfcHJvZ3JhbS5kdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gISEocnVubmluZ19wcm9ncmFtIHx8IHBlbmRpbmdfcHJvZ3JhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBydW4oYikge1xuICAgICAgICAgICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICB3YWl0KCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICAgICAgICAgIGdvKGIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ28oYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVuZCgpIHtcbiAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGhhbmRsZV9wcm9taXNlKHByb21pc2UsIGluZm8pIHtcbiAgICBjb25zdCB0b2tlbiA9IGluZm8udG9rZW4gPSB7fTtcbiAgICBmdW5jdGlvbiB1cGRhdGUodHlwZSwgaW5kZXgsIGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGluZm8udG9rZW4gIT09IHRva2VuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBpbmZvLnJlc29sdmVkID0gdmFsdWU7XG4gICAgICAgIGxldCBjaGlsZF9jdHggPSBpbmZvLmN0eDtcbiAgICAgICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjaGlsZF9jdHggPSBjaGlsZF9jdHguc2xpY2UoKTtcbiAgICAgICAgICAgIGNoaWxkX2N0eFtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmxvY2sgPSB0eXBlICYmIChpbmZvLmN1cnJlbnQgPSB0eXBlKShjaGlsZF9jdHgpO1xuICAgICAgICBsZXQgbmVlZHNfZmx1c2ggPSBmYWxzZTtcbiAgICAgICAgaWYgKGluZm8uYmxvY2spIHtcbiAgICAgICAgICAgIGlmIChpbmZvLmJsb2Nrcykge1xuICAgICAgICAgICAgICAgIGluZm8uYmxvY2tzLmZvckVhY2goKGJsb2NrLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpICE9PSBpbmRleCAmJiBibG9jaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBfb3V0cm9zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uX291dChibG9jaywgMSwgMSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvLmJsb2Nrc1tpXSA9PT0gYmxvY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5ibG9ja3NbaV0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tfb3V0cm9zKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGluZm8uYmxvY2suZCgxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJsb2NrLmMoKTtcbiAgICAgICAgICAgIHRyYW5zaXRpb25faW4oYmxvY2ssIDEpO1xuICAgICAgICAgICAgYmxvY2subShpbmZvLm1vdW50KCksIGluZm8uYW5jaG9yKTtcbiAgICAgICAgICAgIG5lZWRzX2ZsdXNoID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpbmZvLmJsb2NrID0gYmxvY2s7XG4gICAgICAgIGlmIChpbmZvLmJsb2NrcylcbiAgICAgICAgICAgIGluZm8uYmxvY2tzW2luZGV4XSA9IGJsb2NrO1xuICAgICAgICBpZiAobmVlZHNfZmx1c2gpIHtcbiAgICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzX3Byb21pc2UocHJvbWlzZSkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudF9jb21wb25lbnQgPSBnZXRfY3VycmVudF9jb21wb25lbnQoKTtcbiAgICAgICAgcHJvbWlzZS50aGVuKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjdXJyZW50X2NvbXBvbmVudCk7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby50aGVuLCAxLCBpbmZvLnZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQobnVsbCk7XG4gICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjdXJyZW50X2NvbXBvbmVudCk7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby5jYXRjaCwgMiwgaW5mby5lcnJvciwgZXJyb3IpO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICAgICAgaWYgKCFpbmZvLmhhc0NhdGNoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBpZiB3ZSBwcmV2aW91c2x5IGhhZCBhIHRoZW4vY2F0Y2ggYmxvY2ssIGRlc3Ryb3kgaXRcbiAgICAgICAgaWYgKGluZm8uY3VycmVudCAhPT0gaW5mby5wZW5kaW5nKSB7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby5wZW5kaW5nLCAwKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoaW5mby5jdXJyZW50ICE9PSBpbmZvLnRoZW4pIHtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLnRoZW4sIDEsIGluZm8udmFsdWUsIHByb21pc2UpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaW5mby5yZXNvbHZlZCA9IHByb21pc2U7XG4gICAgfVxufVxuZnVuY3Rpb24gdXBkYXRlX2F3YWl0X2Jsb2NrX2JyYW5jaChpbmZvLCBjdHgsIGRpcnR5KSB7XG4gICAgY29uc3QgY2hpbGRfY3R4ID0gY3R4LnNsaWNlKCk7XG4gICAgY29uc3QgeyByZXNvbHZlZCB9ID0gaW5mbztcbiAgICBpZiAoaW5mby5jdXJyZW50ID09PSBpbmZvLnRoZW4pIHtcbiAgICAgICAgY2hpbGRfY3R4W2luZm8udmFsdWVdID0gcmVzb2x2ZWQ7XG4gICAgfVxuICAgIGlmIChpbmZvLmN1cnJlbnQgPT09IGluZm8uY2F0Y2gpIHtcbiAgICAgICAgY2hpbGRfY3R4W2luZm8uZXJyb3JdID0gcmVzb2x2ZWQ7XG4gICAgfVxuICAgIGluZm8uYmxvY2sucChjaGlsZF9jdHgsIGRpcnR5KTtcbn1cblxuY29uc3QgZ2xvYmFscyA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgID8gd2luZG93XG4gICAgOiB0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyBnbG9iYWxUaGlzXG4gICAgICAgIDogZ2xvYmFsKTtcblxuZnVuY3Rpb24gZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZCgxKTtcbiAgICBsb29rdXAuZGVsZXRlKGJsb2NrLmtleSk7XG59XG5mdW5jdGlvbiBvdXRyb19hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgdHJhbnNpdGlvbl9vdXQoYmxvY2ssIDEsIDEsICgpID0+IHtcbiAgICAgICAgbG9va3VwLmRlbGV0ZShibG9jay5rZXkpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gZml4X2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5mKCk7XG4gICAgZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKTtcbn1cbmZ1bmN0aW9uIGZpeF9hbmRfb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmYoKTtcbiAgICBvdXRyb19hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZV9rZXllZF9lYWNoKG9sZF9ibG9ja3MsIGRpcnR5LCBnZXRfa2V5LCBkeW5hbWljLCBjdHgsIGxpc3QsIGxvb2t1cCwgbm9kZSwgZGVzdHJveSwgY3JlYXRlX2VhY2hfYmxvY2ssIG5leHQsIGdldF9jb250ZXh0KSB7XG4gICAgbGV0IG8gPSBvbGRfYmxvY2tzLmxlbmd0aDtcbiAgICBsZXQgbiA9IGxpc3QubGVuZ3RoO1xuICAgIGxldCBpID0gbztcbiAgICBjb25zdCBvbGRfaW5kZXhlcyA9IHt9O1xuICAgIHdoaWxlIChpLS0pXG4gICAgICAgIG9sZF9pbmRleGVzW29sZF9ibG9ja3NbaV0ua2V5XSA9IGk7XG4gICAgY29uc3QgbmV3X2Jsb2NrcyA9IFtdO1xuICAgIGNvbnN0IG5ld19sb29rdXAgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgZGVsdGFzID0gbmV3IE1hcCgpO1xuICAgIGkgPSBuO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgY29uc3QgY2hpbGRfY3R4ID0gZ2V0X2NvbnRleHQoY3R4LCBsaXN0LCBpKTtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0X2tleShjaGlsZF9jdHgpO1xuICAgICAgICBsZXQgYmxvY2sgPSBsb29rdXAuZ2V0KGtleSk7XG4gICAgICAgIGlmICghYmxvY2spIHtcbiAgICAgICAgICAgIGJsb2NrID0gY3JlYXRlX2VhY2hfYmxvY2soa2V5LCBjaGlsZF9jdHgpO1xuICAgICAgICAgICAgYmxvY2suYygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGR5bmFtaWMpIHtcbiAgICAgICAgICAgIGJsb2NrLnAoY2hpbGRfY3R4LCBkaXJ0eSk7XG4gICAgICAgIH1cbiAgICAgICAgbmV3X2xvb2t1cC5zZXQoa2V5LCBuZXdfYmxvY2tzW2ldID0gYmxvY2spO1xuICAgICAgICBpZiAoa2V5IGluIG9sZF9pbmRleGVzKVxuICAgICAgICAgICAgZGVsdGFzLnNldChrZXksIE1hdGguYWJzKGkgLSBvbGRfaW5kZXhlc1trZXldKSk7XG4gICAgfVxuICAgIGNvbnN0IHdpbGxfbW92ZSA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBkaWRfbW92ZSA9IG5ldyBTZXQoKTtcbiAgICBmdW5jdGlvbiBpbnNlcnQoYmxvY2spIHtcbiAgICAgICAgdHJhbnNpdGlvbl9pbihibG9jaywgMSk7XG4gICAgICAgIGJsb2NrLm0obm9kZSwgbmV4dCk7XG4gICAgICAgIGxvb2t1cC5zZXQoYmxvY2sua2V5LCBibG9jayk7XG4gICAgICAgIG5leHQgPSBibG9jay5maXJzdDtcbiAgICAgICAgbi0tO1xuICAgIH1cbiAgICB3aGlsZSAobyAmJiBuKSB7XG4gICAgICAgIGNvbnN0IG5ld19ibG9jayA9IG5ld19ibG9ja3NbbiAtIDFdO1xuICAgICAgICBjb25zdCBvbGRfYmxvY2sgPSBvbGRfYmxvY2tzW28gLSAxXTtcbiAgICAgICAgY29uc3QgbmV3X2tleSA9IG5ld19ibG9jay5rZXk7XG4gICAgICAgIGNvbnN0IG9sZF9rZXkgPSBvbGRfYmxvY2sua2V5O1xuICAgICAgICBpZiAobmV3X2Jsb2NrID09PSBvbGRfYmxvY2spIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgICAgIG5leHQgPSBuZXdfYmxvY2suZmlyc3Q7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgICAgICBuLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIW5ld19sb29rdXAuaGFzKG9sZF9rZXkpKSB7XG4gICAgICAgICAgICAvLyByZW1vdmUgb2xkIGJsb2NrXG4gICAgICAgICAgICBkZXN0cm95KG9sZF9ibG9jaywgbG9va3VwKTtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghbG9va3VwLmhhcyhuZXdfa2V5KSB8fCB3aWxsX21vdmUuaGFzKG5ld19rZXkpKSB7XG4gICAgICAgICAgICBpbnNlcnQobmV3X2Jsb2NrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaWRfbW92ZS5oYXMob2xkX2tleSkpIHtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkZWx0YXMuZ2V0KG5ld19rZXkpID4gZGVsdGFzLmdldChvbGRfa2V5KSkge1xuICAgICAgICAgICAgZGlkX21vdmUuYWRkKG5ld19rZXkpO1xuICAgICAgICAgICAgaW5zZXJ0KG5ld19ibG9jayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3aWxsX21vdmUuYWRkKG9sZF9rZXkpO1xuICAgICAgICAgICAgby0tO1xuICAgICAgICB9XG4gICAgfVxuICAgIHdoaWxlIChvLS0pIHtcbiAgICAgICAgY29uc3Qgb2xkX2Jsb2NrID0gb2xkX2Jsb2Nrc1tvXTtcbiAgICAgICAgaWYgKCFuZXdfbG9va3VwLmhhcyhvbGRfYmxvY2sua2V5KSlcbiAgICAgICAgICAgIGRlc3Ryb3kob2xkX2Jsb2NrLCBsb29rdXApO1xuICAgIH1cbiAgICB3aGlsZSAobilcbiAgICAgICAgaW5zZXJ0KG5ld19ibG9ja3NbbiAtIDFdKTtcbiAgICByZXR1cm4gbmV3X2Jsb2Nrcztcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX2VhY2hfa2V5cyhjdHgsIGxpc3QsIGdldF9jb250ZXh0LCBnZXRfa2V5KSB7XG4gICAgY29uc3Qga2V5cyA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0X2tleShnZXRfY29udGV4dChjdHgsIGxpc3QsIGkpKTtcbiAgICAgICAgaWYgKGtleXMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGhhdmUgZHVwbGljYXRlIGtleXMgaW4gYSBrZXllZCBlYWNoJyk7XG4gICAgICAgIH1cbiAgICAgICAga2V5cy5hZGQoa2V5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldF9zcHJlYWRfdXBkYXRlKGxldmVscywgdXBkYXRlcykge1xuICAgIGNvbnN0IHVwZGF0ZSA9IHt9O1xuICAgIGNvbnN0IHRvX251bGxfb3V0ID0ge307XG4gICAgY29uc3QgYWNjb3VudGVkX2ZvciA9IHsgJCRzY29wZTogMSB9O1xuICAgIGxldCBpID0gbGV2ZWxzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNvbnN0IG8gPSBsZXZlbHNbaV07XG4gICAgICAgIGNvbnN0IG4gPSB1cGRhdGVzW2ldO1xuICAgICAgICBpZiAobikge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbykge1xuICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiBuKSlcbiAgICAgICAgICAgICAgICAgICAgdG9fbnVsbF9vdXRba2V5XSA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBuKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhY2NvdW50ZWRfZm9yW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlW2tleV0gPSBuW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRlZF9mb3Jba2V5XSA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV2ZWxzW2ldID0gbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG8pIHtcbiAgICAgICAgICAgICAgICBhY2NvdW50ZWRfZm9yW2tleV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IGluIHRvX251bGxfb3V0KSB7XG4gICAgICAgIGlmICghKGtleSBpbiB1cGRhdGUpKVxuICAgICAgICAgICAgdXBkYXRlW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiB1cGRhdGU7XG59XG5mdW5jdGlvbiBnZXRfc3ByZWFkX29iamVjdChzcHJlYWRfcHJvcHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHNwcmVhZF9wcm9wcyA9PT0gJ29iamVjdCcgJiYgc3ByZWFkX3Byb3BzICE9PSBudWxsID8gc3ByZWFkX3Byb3BzIDoge307XG59XG5cbi8vIHNvdXJjZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvaW5kaWNlcy5odG1sXG5jb25zdCBib29sZWFuX2F0dHJpYnV0ZXMgPSBuZXcgU2V0KFtcbiAgICAnYWxsb3dmdWxsc2NyZWVuJyxcbiAgICAnYWxsb3dwYXltZW50cmVxdWVzdCcsXG4gICAgJ2FzeW5jJyxcbiAgICAnYXV0b2ZvY3VzJyxcbiAgICAnYXV0b3BsYXknLFxuICAgICdjaGVja2VkJyxcbiAgICAnY29udHJvbHMnLFxuICAgICdkZWZhdWx0JyxcbiAgICAnZGVmZXInLFxuICAgICdkaXNhYmxlZCcsXG4gICAgJ2Zvcm1ub3ZhbGlkYXRlJyxcbiAgICAnaGlkZGVuJyxcbiAgICAnaXNtYXAnLFxuICAgICdsb29wJyxcbiAgICAnbXVsdGlwbGUnLFxuICAgICdtdXRlZCcsXG4gICAgJ25vbW9kdWxlJyxcbiAgICAnbm92YWxpZGF0ZScsXG4gICAgJ29wZW4nLFxuICAgICdwbGF5c2lubGluZScsXG4gICAgJ3JlYWRvbmx5JyxcbiAgICAncmVxdWlyZWQnLFxuICAgICdyZXZlcnNlZCcsXG4gICAgJ3NlbGVjdGVkJ1xuXSk7XG5cbmNvbnN0IGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyID0gL1tcXHMnXCI+Lz1cXHV7RkREMH0tXFx1e0ZERUZ9XFx1e0ZGRkV9XFx1e0ZGRkZ9XFx1ezFGRkZFfVxcdXsxRkZGRn1cXHV7MkZGRkV9XFx1ezJGRkZGfVxcdXszRkZGRX1cXHV7M0ZGRkZ9XFx1ezRGRkZFfVxcdXs0RkZGRn1cXHV7NUZGRkV9XFx1ezVGRkZGfVxcdXs2RkZGRX1cXHV7NkZGRkZ9XFx1ezdGRkZFfVxcdXs3RkZGRn1cXHV7OEZGRkV9XFx1ezhGRkZGfVxcdXs5RkZGRX1cXHV7OUZGRkZ9XFx1e0FGRkZFfVxcdXtBRkZGRn1cXHV7QkZGRkV9XFx1e0JGRkZGfVxcdXtDRkZGRX1cXHV7Q0ZGRkZ9XFx1e0RGRkZFfVxcdXtERkZGRn1cXHV7RUZGRkV9XFx1e0VGRkZGfVxcdXtGRkZGRX1cXHV7RkZGRkZ9XFx1ezEwRkZGRX1cXHV7MTBGRkZGfV0vdTtcbi8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZXMtMlxuLy8gaHR0cHM6Ly9pbmZyYS5zcGVjLndoYXR3Zy5vcmcvI25vbmNoYXJhY3RlclxuZnVuY3Rpb24gc3ByZWFkKGFyZ3MsIGNsYXNzZXNfdG9fYWRkKSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IE9iamVjdC5hc3NpZ24oe30sIC4uLmFyZ3MpO1xuICAgIGlmIChjbGFzc2VzX3RvX2FkZCkge1xuICAgICAgICBpZiAoYXR0cmlidXRlcy5jbGFzcyA9PSBudWxsKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzLmNsYXNzID0gY2xhc3Nlc190b19hZGQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzLmNsYXNzICs9ICcgJyArIGNsYXNzZXNfdG9fYWRkO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxldCBzdHIgPSAnJztcbiAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICBpZiAoaW52YWxpZF9hdHRyaWJ1dGVfbmFtZV9jaGFyYWN0ZXIudGVzdChuYW1lKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpXG4gICAgICAgICAgICBzdHIgKz0gJyAnICsgbmFtZTtcbiAgICAgICAgZWxzZSBpZiAoYm9vbGVhbl9hdHRyaWJ1dGVzLmhhcyhuYW1lLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpXG4gICAgICAgICAgICAgICAgc3RyICs9ICcgJyArIG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgc3RyICs9IGAgJHtuYW1lfT1cIiR7dmFsdWV9XCJgO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHN0cjtcbn1cbmNvbnN0IGVzY2FwZWQgPSB7XG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmIzM5OycsXG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnXG59O1xuZnVuY3Rpb24gZXNjYXBlKGh0bWwpIHtcbiAgICByZXR1cm4gU3RyaW5nKGh0bWwpLnJlcGxhY2UoL1tcIicmPD5dL2csIG1hdGNoID0+IGVzY2FwZWRbbWF0Y2hdKTtcbn1cbmZ1bmN0aW9uIGVzY2FwZV9hdHRyaWJ1dGVfdmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IGVzY2FwZSh2YWx1ZSkgOiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGVzY2FwZV9vYmplY3Qob2JqKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gZXNjYXBlX2F0dHJpYnV0ZV92YWx1ZShvYmpba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBlYWNoKGl0ZW1zLCBmbikge1xuICAgIGxldCBzdHIgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHN0ciArPSBmbihpdGVtc1tpXSwgaSk7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG59XG5jb25zdCBtaXNzaW5nX2NvbXBvbmVudCA9IHtcbiAgICAkJHJlbmRlcjogKCkgPT4gJydcbn07XG5mdW5jdGlvbiB2YWxpZGF0ZV9jb21wb25lbnQoY29tcG9uZW50LCBuYW1lKSB7XG4gICAgaWYgKCFjb21wb25lbnQgfHwgIWNvbXBvbmVudC4kJHJlbmRlcikge1xuICAgICAgICBpZiAobmFtZSA9PT0gJ3N2ZWx0ZTpjb21wb25lbnQnKVxuICAgICAgICAgICAgbmFtZSArPSAnIHRoaXM9ey4uLn0nO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYDwke25hbWV9PiBpcyBub3QgYSB2YWxpZCBTU1IgY29tcG9uZW50LiBZb3UgbWF5IG5lZWQgdG8gcmV2aWV3IHlvdXIgYnVpbGQgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGRlcGVuZGVuY2llcyBhcmUgY29tcGlsZWQsIHJhdGhlciB0aGFuIGltcG9ydGVkIGFzIHByZS1jb21waWxlZCBtb2R1bGVzYCk7XG4gICAgfVxuICAgIHJldHVybiBjb21wb25lbnQ7XG59XG5mdW5jdGlvbiBkZWJ1ZyhmaWxlLCBsaW5lLCBjb2x1bW4sIHZhbHVlcykge1xuICAgIGNvbnNvbGUubG9nKGB7QGRlYnVnfSAke2ZpbGUgPyBmaWxlICsgJyAnIDogJyd9KCR7bGluZX06JHtjb2x1bW59KWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyh2YWx1ZXMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICByZXR1cm4gJyc7XG59XG5sZXQgb25fZGVzdHJveTtcbmZ1bmN0aW9uIGNyZWF0ZV9zc3JfY29tcG9uZW50KGZuKSB7XG4gICAgZnVuY3Rpb24gJCRyZW5kZXIocmVzdWx0LCBwcm9wcywgYmluZGluZ3MsIHNsb3RzLCBjb250ZXh0KSB7XG4gICAgICAgIGNvbnN0IHBhcmVudF9jb21wb25lbnQgPSBjdXJyZW50X2NvbXBvbmVudDtcbiAgICAgICAgY29uc3QgJCQgPSB7XG4gICAgICAgICAgICBvbl9kZXN0cm95LFxuICAgICAgICAgICAgY29udGV4dDogbmV3IE1hcChjb250ZXh0IHx8IChwYXJlbnRfY29tcG9uZW50ID8gcGFyZW50X2NvbXBvbmVudC4kJC5jb250ZXh0IDogW10pKSxcbiAgICAgICAgICAgIC8vIHRoZXNlIHdpbGwgYmUgaW1tZWRpYXRlbHkgZGlzY2FyZGVkXG4gICAgICAgICAgICBvbl9tb3VudDogW10sXG4gICAgICAgICAgICBiZWZvcmVfdXBkYXRlOiBbXSxcbiAgICAgICAgICAgIGFmdGVyX3VwZGF0ZTogW10sXG4gICAgICAgICAgICBjYWxsYmFja3M6IGJsYW5rX29iamVjdCgpXG4gICAgICAgIH07XG4gICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudCh7ICQkIH0pO1xuICAgICAgICBjb25zdCBodG1sID0gZm4ocmVzdWx0LCBwcm9wcywgYmluZGluZ3MsIHNsb3RzKTtcbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHBhcmVudF9jb21wb25lbnQpO1xuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVuZGVyOiAocHJvcHMgPSB7fSwgeyAkJHNsb3RzID0ge30sIGNvbnRleHQgPSBuZXcgTWFwKCkgfSA9IHt9KSA9PiB7XG4gICAgICAgICAgICBvbl9kZXN0cm95ID0gW107XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7IHRpdGxlOiAnJywgaGVhZDogJycsIGNzczogbmV3IFNldCgpIH07XG4gICAgICAgICAgICBjb25zdCBodG1sID0gJCRyZW5kZXIocmVzdWx0LCBwcm9wcywge30sICQkc2xvdHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgcnVuX2FsbChvbl9kZXN0cm95KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaHRtbCxcbiAgICAgICAgICAgICAgICBjc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogQXJyYXkuZnJvbShyZXN1bHQuY3NzKS5tYXAoY3NzID0+IGNzcy5jb2RlKS5qb2luKCdcXG4nKSxcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBudWxsIC8vIFRPRE9cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGhlYWQ6IHJlc3VsdC50aXRsZSArIHJlc3VsdC5oZWFkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAkJHJlbmRlclxuICAgIH07XG59XG5mdW5jdGlvbiBhZGRfYXR0cmlidXRlKG5hbWUsIHZhbHVlLCBib29sZWFuKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwgfHwgKGJvb2xlYW4gJiYgIXZhbHVlKSlcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIHJldHVybiBgICR7bmFtZX0ke3ZhbHVlID09PSB0cnVlID8gJycgOiBgPSR7dHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IEpTT04uc3RyaW5naWZ5KGVzY2FwZSh2YWx1ZSkpIDogYFwiJHt2YWx1ZX1cImB9YH1gO1xufVxuZnVuY3Rpb24gYWRkX2NsYXNzZXMoY2xhc3Nlcykge1xuICAgIHJldHVybiBjbGFzc2VzID8gYCBjbGFzcz1cIiR7Y2xhc3Nlc31cImAgOiAnJztcbn1cblxuZnVuY3Rpb24gYmluZChjb21wb25lbnQsIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaW5kZXggPSBjb21wb25lbnQuJCQucHJvcHNbbmFtZV07XG4gICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29tcG9uZW50LiQkLmJvdW5kW2luZGV4XSA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayhjb21wb25lbnQuJCQuY3R4W2luZGV4XSk7XG4gICAgfVxufVxuZnVuY3Rpb24gY3JlYXRlX2NvbXBvbmVudChibG9jaykge1xuICAgIGJsb2NrICYmIGJsb2NrLmMoKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2NvbXBvbmVudChibG9jaywgcGFyZW50X25vZGVzKSB7XG4gICAgYmxvY2sgJiYgYmxvY2subChwYXJlbnRfbm9kZXMpO1xufVxuZnVuY3Rpb24gbW91bnRfY29tcG9uZW50KGNvbXBvbmVudCwgdGFyZ2V0LCBhbmNob3IsIGN1c3RvbUVsZW1lbnQpIHtcbiAgICBjb25zdCB7IGZyYWdtZW50LCBvbl9tb3VudCwgb25fZGVzdHJveSwgYWZ0ZXJfdXBkYXRlIH0gPSBjb21wb25lbnQuJCQ7XG4gICAgZnJhZ21lbnQgJiYgZnJhZ21lbnQubSh0YXJnZXQsIGFuY2hvcik7XG4gICAgaWYgKCFjdXN0b21FbGVtZW50KSB7XG4gICAgICAgIC8vIG9uTW91bnQgaGFwcGVucyBiZWZvcmUgdGhlIGluaXRpYWwgYWZ0ZXJVcGRhdGVcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdfb25fZGVzdHJveSA9IG9uX21vdW50Lm1hcChydW4pLmZpbHRlcihpc19mdW5jdGlvbik7XG4gICAgICAgICAgICBpZiAob25fZGVzdHJveSkge1xuICAgICAgICAgICAgICAgIG9uX2Rlc3Ryb3kucHVzaCguLi5uZXdfb25fZGVzdHJveSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBFZGdlIGNhc2UgLSBjb21wb25lbnQgd2FzIGRlc3Ryb3llZCBpbW1lZGlhdGVseSxcbiAgICAgICAgICAgICAgICAvLyBtb3N0IGxpa2VseSBhcyBhIHJlc3VsdCBvZiBhIGJpbmRpbmcgaW5pdGlhbGlzaW5nXG4gICAgICAgICAgICAgICAgcnVuX2FsbChuZXdfb25fZGVzdHJveSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuJCQub25fbW91bnQgPSBbXTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFmdGVyX3VwZGF0ZS5mb3JFYWNoKGFkZF9yZW5kZXJfY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gZGVzdHJveV9jb21wb25lbnQoY29tcG9uZW50LCBkZXRhY2hpbmcpIHtcbiAgICBjb25zdCAkJCA9IGNvbXBvbmVudC4kJDtcbiAgICBpZiAoJCQuZnJhZ21lbnQgIT09IG51bGwpIHtcbiAgICAgICAgcnVuX2FsbCgkJC5vbl9kZXN0cm95KTtcbiAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuZChkZXRhY2hpbmcpO1xuICAgICAgICAvLyBUT0RPIG51bGwgb3V0IG90aGVyIHJlZnMsIGluY2x1ZGluZyBjb21wb25lbnQuJCQgKGJ1dCBuZWVkIHRvXG4gICAgICAgIC8vIHByZXNlcnZlIGZpbmFsIHN0YXRlPylcbiAgICAgICAgJCQub25fZGVzdHJveSA9ICQkLmZyYWdtZW50ID0gbnVsbDtcbiAgICAgICAgJCQuY3R4ID0gW107XG4gICAgfVxufVxuZnVuY3Rpb24gbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpIHtcbiAgICBpZiAoY29tcG9uZW50LiQkLmRpcnR5WzBdID09PSAtMSkge1xuICAgICAgICBkaXJ0eV9jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgc2NoZWR1bGVfdXBkYXRlKCk7XG4gICAgICAgIGNvbXBvbmVudC4kJC5kaXJ0eS5maWxsKDApO1xuICAgIH1cbiAgICBjb21wb25lbnQuJCQuZGlydHlbKGkgLyAzMSkgfCAwXSB8PSAoMSA8PCAoaSAlIDMxKSk7XG59XG5mdW5jdGlvbiBpbml0KGNvbXBvbmVudCwgb3B0aW9ucywgaW5zdGFuY2UsIGNyZWF0ZV9mcmFnbWVudCwgbm90X2VxdWFsLCBwcm9wcywgYXBwZW5kX3N0eWxlcywgZGlydHkgPSBbLTFdKSB7XG4gICAgY29uc3QgcGFyZW50X2NvbXBvbmVudCA9IGN1cnJlbnRfY29tcG9uZW50O1xuICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpO1xuICAgIGNvbnN0ICQkID0gY29tcG9uZW50LiQkID0ge1xuICAgICAgICBmcmFnbWVudDogbnVsbCxcbiAgICAgICAgY3R4OiBudWxsLFxuICAgICAgICAvLyBzdGF0ZVxuICAgICAgICBwcm9wcyxcbiAgICAgICAgdXBkYXRlOiBub29wLFxuICAgICAgICBub3RfZXF1YWwsXG4gICAgICAgIGJvdW5kOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgLy8gbGlmZWN5Y2xlXG4gICAgICAgIG9uX21vdW50OiBbXSxcbiAgICAgICAgb25fZGVzdHJveTogW10sXG4gICAgICAgIG9uX2Rpc2Nvbm5lY3Q6IFtdLFxuICAgICAgICBiZWZvcmVfdXBkYXRlOiBbXSxcbiAgICAgICAgYWZ0ZXJfdXBkYXRlOiBbXSxcbiAgICAgICAgY29udGV4dDogbmV3IE1hcChvcHRpb25zLmNvbnRleHQgfHwgKHBhcmVudF9jb21wb25lbnQgPyBwYXJlbnRfY29tcG9uZW50LiQkLmNvbnRleHQgOiBbXSkpLFxuICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2VcbiAgICAgICAgY2FsbGJhY2tzOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgZGlydHksXG4gICAgICAgIHNraXBfYm91bmQ6IGZhbHNlLFxuICAgICAgICByb290OiBvcHRpb25zLnRhcmdldCB8fCBwYXJlbnRfY29tcG9uZW50LiQkLnJvb3RcbiAgICB9O1xuICAgIGFwcGVuZF9zdHlsZXMgJiYgYXBwZW5kX3N0eWxlcygkJC5yb290KTtcbiAgICBsZXQgcmVhZHkgPSBmYWxzZTtcbiAgICAkJC5jdHggPSBpbnN0YW5jZVxuICAgICAgICA/IGluc3RhbmNlKGNvbXBvbmVudCwgb3B0aW9ucy5wcm9wcyB8fCB7fSwgKGksIHJldCwgLi4ucmVzdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZXN0Lmxlbmd0aCA/IHJlc3RbMF0gOiByZXQ7XG4gICAgICAgICAgICBpZiAoJCQuY3R4ICYmIG5vdF9lcXVhbCgkJC5jdHhbaV0sICQkLmN0eFtpXSA9IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghJCQuc2tpcF9ib3VuZCAmJiAkJC5ib3VuZFtpXSlcbiAgICAgICAgICAgICAgICAgICAgJCQuYm91bmRbaV0odmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSlcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfSlcbiAgICAgICAgOiBbXTtcbiAgICAkJC51cGRhdGUoKTtcbiAgICByZWFkeSA9IHRydWU7XG4gICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAvLyBgZmFsc2VgIGFzIGEgc3BlY2lhbCBjYXNlIG9mIG5vIERPTSBjb21wb25lbnRcbiAgICAkJC5mcmFnbWVudCA9IGNyZWF0ZV9mcmFnbWVudCA/IGNyZWF0ZV9mcmFnbWVudCgkJC5jdHgpIDogZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmh5ZHJhdGUpIHtcbiAgICAgICAgICAgIHN0YXJ0X2h5ZHJhdGluZygpO1xuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjaGlsZHJlbihvcHRpb25zLnRhcmdldCk7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQubChub2Rlcyk7XG4gICAgICAgICAgICBub2Rlcy5mb3JFYWNoKGRldGFjaCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuYygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmludHJvKVxuICAgICAgICAgICAgdHJhbnNpdGlvbl9pbihjb21wb25lbnQuJCQuZnJhZ21lbnQpO1xuICAgICAgICBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zLnRhcmdldCwgb3B0aW9ucy5hbmNob3IsIG9wdGlvbnMuY3VzdG9tRWxlbWVudCk7XG4gICAgICAgIGVuZF9oeWRyYXRpbmcoKTtcbiAgICAgICAgZmx1c2goKTtcbiAgICB9XG4gICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHBhcmVudF9jb21wb25lbnQpO1xufVxubGV0IFN2ZWx0ZUVsZW1lbnQ7XG5pZiAodHlwZW9mIEhUTUxFbGVtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgU3ZlbHRlRWxlbWVudCA9IGNsYXNzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgb25fbW91bnQgfSA9IHRoaXMuJCQ7XG4gICAgICAgICAgICB0aGlzLiQkLm9uX2Rpc2Nvbm5lY3QgPSBvbl9tb3VudC5tYXAocnVuKS5maWx0ZXIoaXNfZnVuY3Rpb24pO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuJCQuc2xvdHRlZCkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLiQkLnNsb3R0ZWRba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHIsIF9vbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXNbYXR0cl0gPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgIHJ1bl9hbGwodGhpcy4kJC5vbl9kaXNjb25uZWN0KTtcbiAgICAgICAgfVxuICAgICAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICAgICAgdGhpcy4kZGVzdHJveSA9IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBUT0RPIHNob3VsZCB0aGlzIGRlbGVnYXRlIHRvIGFkZEV2ZW50TGlzdGVuZXI/XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuJCRzZXQgJiYgIWlzX2VtcHR5KCQkcHJvcHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgU3ZlbHRlIGNvbXBvbmVudHMuIFVzZWQgd2hlbiBkZXY9ZmFsc2UuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgJGRlc3Ryb3koKSB7XG4gICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICB9XG4gICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSB8fCAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gPSBbXSkpO1xuICAgICAgICBjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICBpZiAodGhpcy4kJHNldCAmJiAhaXNfZW1wdHkoJCRwcm9wcykpIHtcbiAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoX2Rldih0eXBlLCBkZXRhaWwpIHtcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGN1c3RvbV9ldmVudCh0eXBlLCBPYmplY3QuYXNzaWduKHsgdmVyc2lvbjogJzMuNDMuMScgfSwgZGV0YWlsKSwgdHJ1ZSkpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2Rldih0YXJnZXQsIG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUluc2VydCcsIHsgdGFyZ2V0LCBub2RlIH0pO1xuICAgIGFwcGVuZCh0YXJnZXQsIG5vZGUpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2h5ZHJhdGlvbl9kZXYodGFyZ2V0LCBub2RlKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSB9KTtcbiAgICBhcHBlbmRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSk7XG59XG5mdW5jdGlvbiBpbnNlcnRfZGV2KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSwgYW5jaG9yIH0pO1xuICAgIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcik7XG59XG5mdW5jdGlvbiBpbnNlcnRfaHlkcmF0aW9uX2Rldih0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NSW5zZXJ0JywgeyB0YXJnZXQsIG5vZGUsIGFuY2hvciB9KTtcbiAgICBpbnNlcnRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSwgYW5jaG9yKTtcbn1cbmZ1bmN0aW9uIGRldGFjaF9kZXYobm9kZSkge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NUmVtb3ZlJywgeyBub2RlIH0pO1xuICAgIGRldGFjaChub2RlKTtcbn1cbmZ1bmN0aW9uIGRldGFjaF9iZXR3ZWVuX2RldihiZWZvcmUsIGFmdGVyKSB7XG4gICAgd2hpbGUgKGJlZm9yZS5uZXh0U2libGluZyAmJiBiZWZvcmUubmV4dFNpYmxpbmcgIT09IGFmdGVyKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYmVmb3JlLm5leHRTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBkZXRhY2hfYmVmb3JlX2RldihhZnRlcikge1xuICAgIHdoaWxlIChhZnRlci5wcmV2aW91c1NpYmxpbmcpIHtcbiAgICAgICAgZGV0YWNoX2RldihhZnRlci5wcmV2aW91c1NpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaF9hZnRlcl9kZXYoYmVmb3JlKSB7XG4gICAgd2hpbGUgKGJlZm9yZS5uZXh0U2libGluZykge1xuICAgICAgICBkZXRhY2hfZGV2KGJlZm9yZS5uZXh0U2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gbGlzdGVuX2Rldihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucywgaGFzX3ByZXZlbnRfZGVmYXVsdCwgaGFzX3N0b3BfcHJvcGFnYXRpb24pIHtcbiAgICBjb25zdCBtb2RpZmllcnMgPSBvcHRpb25zID09PSB0cnVlID8gWydjYXB0dXJlJ10gOiBvcHRpb25zID8gQXJyYXkuZnJvbShPYmplY3Qua2V5cyhvcHRpb25zKSkgOiBbXTtcbiAgICBpZiAoaGFzX3ByZXZlbnRfZGVmYXVsdClcbiAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3ByZXZlbnREZWZhdWx0Jyk7XG4gICAgaWYgKGhhc19zdG9wX3Byb3BhZ2F0aW9uKVxuICAgICAgICBtb2RpZmllcnMucHVzaCgnc3RvcFByb3BhZ2F0aW9uJyk7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01BZGRFdmVudExpc3RlbmVyJywgeyBub2RlLCBldmVudCwgaGFuZGxlciwgbW9kaWZpZXJzIH0pO1xuICAgIGNvbnN0IGRpc3Bvc2UgPSBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NUmVtb3ZlRXZlbnRMaXN0ZW5lcicsIHsgbm9kZSwgZXZlbnQsIGhhbmRsZXIsIG1vZGlmaWVycyB9KTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgIH07XG59XG5mdW5jdGlvbiBhdHRyX2Rldihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICBpZiAodmFsdWUgPT0gbnVsbClcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmVBdHRyaWJ1dGUnLCB7IG5vZGUsIGF0dHJpYnV0ZSB9KTtcbiAgICBlbHNlXG4gICAgICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0QXR0cmlidXRlJywgeyBub2RlLCBhdHRyaWJ1dGUsIHZhbHVlIH0pO1xufVxuZnVuY3Rpb24gcHJvcF9kZXYobm9kZSwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgbm9kZVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldFByb3BlcnR5JywgeyBub2RlLCBwcm9wZXJ0eSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBkYXRhc2V0X2Rldihub2RlLCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICBub2RlLmRhdGFzZXRbcHJvcGVydHldID0gdmFsdWU7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXREYXRhc2V0JywgeyBub2RlLCBwcm9wZXJ0eSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBzZXRfZGF0YV9kZXYodGV4dCwgZGF0YSkge1xuICAgIGRhdGEgPSAnJyArIGRhdGE7XG4gICAgaWYgKHRleHQud2hvbGVUZXh0ID09PSBkYXRhKVxuICAgICAgICByZXR1cm47XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXREYXRhJywgeyBub2RlOiB0ZXh0LCBkYXRhIH0pO1xuICAgIHRleHQuZGF0YSA9IGRhdGE7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9lYWNoX2FyZ3VtZW50KGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnICE9PSAnc3RyaW5nJyAmJiAhKGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiAnbGVuZ3RoJyBpbiBhcmcpKSB7XG4gICAgICAgIGxldCBtc2cgPSAneyNlYWNofSBvbmx5IGl0ZXJhdGVzIG92ZXIgYXJyYXktbGlrZSBvYmplY3RzLic7XG4gICAgICAgIGlmICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIGFyZyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gYXJnKSB7XG4gICAgICAgICAgICBtc2cgKz0gJyBZb3UgY2FuIHVzZSBhIHNwcmVhZCB0byBjb252ZXJ0IHRoaXMgaXRlcmFibGUgaW50byBhbiBhcnJheS4nO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX3Nsb3RzKG5hbWUsIHNsb3QsIGtleXMpIHtcbiAgICBmb3IgKGNvbnN0IHNsb3Rfa2V5IG9mIE9iamVjdC5rZXlzKHNsb3QpKSB7XG4gICAgICAgIGlmICghfmtleXMuaW5kZXhPZihzbG90X2tleSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgPCR7bmFtZX0+IHJlY2VpdmVkIGFuIHVuZXhwZWN0ZWQgc2xvdCBcIiR7c2xvdF9rZXl9XCIuYCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIFN2ZWx0ZSBjb21wb25lbnRzIHdpdGggc29tZSBtaW5vciBkZXYtZW5oYW5jZW1lbnRzLiBVc2VkIHdoZW4gZGV2PXRydWUuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudERldiBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBpZiAoIW9wdGlvbnMgfHwgKCFvcHRpb25zLnRhcmdldCAmJiAhb3B0aW9ucy4kJGlubGluZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIid0YXJnZXQnIGlzIGEgcmVxdWlyZWQgb3B0aW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuICAgICRkZXN0cm95KCkge1xuICAgICAgICBzdXBlci4kZGVzdHJveSgpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDb21wb25lbnQgd2FzIGFscmVhZHkgZGVzdHJveWVkJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICB9O1xuICAgIH1cbiAgICAkY2FwdHVyZV9zdGF0ZSgpIHsgfVxuICAgICRpbmplY3Rfc3RhdGUoKSB7IH1cbn1cbi8qKlxuICogQmFzZSBjbGFzcyB0byBjcmVhdGUgc3Ryb25nbHkgdHlwZWQgU3ZlbHRlIGNvbXBvbmVudHMuXG4gKiBUaGlzIG9ubHkgZXhpc3RzIGZvciB0eXBpbmcgcHVycG9zZXMgYW5kIHNob3VsZCBiZSB1c2VkIGluIGAuZC50c2AgZmlsZXMuXG4gKlxuICogIyMjIEV4YW1wbGU6XG4gKlxuICogWW91IGhhdmUgY29tcG9uZW50IGxpYnJhcnkgb24gbnBtIGNhbGxlZCBgY29tcG9uZW50LWxpYnJhcnlgLCBmcm9tIHdoaWNoXG4gKiB5b3UgZXhwb3J0IGEgY29tcG9uZW50IGNhbGxlZCBgTXlDb21wb25lbnRgLiBGb3IgU3ZlbHRlK1R5cGVTY3JpcHQgdXNlcnMsXG4gKiB5b3Ugd2FudCB0byBwcm92aWRlIHR5cGluZ3MuIFRoZXJlZm9yZSB5b3UgY3JlYXRlIGEgYGluZGV4LmQudHNgOlxuICogYGBgdHNcbiAqIGltcG9ydCB7IFN2ZWx0ZUNvbXBvbmVudFR5cGVkIH0gZnJvbSBcInN2ZWx0ZVwiO1xuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50VHlwZWQ8e2Zvbzogc3RyaW5nfT4ge31cbiAqIGBgYFxuICogVHlwaW5nIHRoaXMgbWFrZXMgaXQgcG9zc2libGUgZm9yIElERXMgbGlrZSBWUyBDb2RlIHdpdGggdGhlIFN2ZWx0ZSBleHRlbnNpb25cbiAqIHRvIHByb3ZpZGUgaW50ZWxsaXNlbnNlIGFuZCB0byB1c2UgdGhlIGNvbXBvbmVudCBsaWtlIHRoaXMgaW4gYSBTdmVsdGUgZmlsZVxuICogd2l0aCBUeXBlU2NyaXB0OlxuICogYGBgc3ZlbHRlXG4gKiA8c2NyaXB0IGxhbmc9XCJ0c1wiPlxuICogXHRpbXBvcnQgeyBNeUNvbXBvbmVudCB9IGZyb20gXCJjb21wb25lbnQtbGlicmFyeVwiO1xuICogPC9zY3JpcHQ+XG4gKiA8TXlDb21wb25lbnQgZm9vPXsnYmFyJ30gLz5cbiAqIGBgYFxuICpcbiAqICMjIyMgV2h5IG5vdCBtYWtlIHRoaXMgcGFydCBvZiBgU3ZlbHRlQ29tcG9uZW50KERldilgP1xuICogQmVjYXVzZVxuICogYGBgdHNcbiAqIGNsYXNzIEFTdWJjbGFzc09mU3ZlbHRlQ29tcG9uZW50IGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50PHtmb286IHN0cmluZ30+IHt9XG4gKiBjb25zdCBjb21wb25lbnQ6IHR5cGVvZiBTdmVsdGVDb21wb25lbnQgPSBBU3ViY2xhc3NPZlN2ZWx0ZUNvbXBvbmVudDtcbiAqIGBgYFxuICogd2lsbCB0aHJvdyBhIHR5cGUgZXJyb3IsIHNvIHdlIG5lZWQgdG8gc2VwYXJhdGUgdGhlIG1vcmUgc3RyaWN0bHkgdHlwZWQgY2xhc3MuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudFR5cGVkIGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50RGV2IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG9wdGlvbnMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGxvb3BfZ3VhcmQodGltZW91dCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0ID4gdGltZW91dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZpbml0ZSBsb29wIGRldGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgeyBIdG1sVGFnLCBIdG1sVGFnSHlkcmF0aW9uLCBTdmVsdGVDb21wb25lbnQsIFN2ZWx0ZUNvbXBvbmVudERldiwgU3ZlbHRlQ29tcG9uZW50VHlwZWQsIFN2ZWx0ZUVsZW1lbnQsIGFjdGlvbl9kZXN0cm95ZXIsIGFkZF9hdHRyaWJ1dGUsIGFkZF9jbGFzc2VzLCBhZGRfZmx1c2hfY2FsbGJhY2ssIGFkZF9sb2NhdGlvbiwgYWRkX3JlbmRlcl9jYWxsYmFjaywgYWRkX3Jlc2l6ZV9saXN0ZW5lciwgYWRkX3RyYW5zZm9ybSwgYWZ0ZXJVcGRhdGUsIGFwcGVuZCwgYXBwZW5kX2RldiwgYXBwZW5kX2VtcHR5X3N0eWxlc2hlZXQsIGFwcGVuZF9oeWRyYXRpb24sIGFwcGVuZF9oeWRyYXRpb25fZGV2LCBhcHBlbmRfc3R5bGVzLCBhc3NpZ24sIGF0dHIsIGF0dHJfZGV2LCBhdHRyaWJ1dGVfdG9fb2JqZWN0LCBiZWZvcmVVcGRhdGUsIGJpbmQsIGJpbmRpbmdfY2FsbGJhY2tzLCBibGFua19vYmplY3QsIGJ1YmJsZSwgY2hlY2tfb3V0cm9zLCBjaGlsZHJlbiwgY2xhaW1fY29tcG9uZW50LCBjbGFpbV9lbGVtZW50LCBjbGFpbV9odG1sX3RhZywgY2xhaW1fc3BhY2UsIGNsYWltX3N2Z19lbGVtZW50LCBjbGFpbV90ZXh0LCBjbGVhcl9sb29wcywgY29tcG9uZW50X3N1YnNjcmliZSwgY29tcHV0ZV9yZXN0X3Byb3BzLCBjb21wdXRlX3Nsb3RzLCBjcmVhdGVFdmVudERpc3BhdGNoZXIsIGNyZWF0ZV9hbmltYXRpb24sIGNyZWF0ZV9iaWRpcmVjdGlvbmFsX3RyYW5zaXRpb24sIGNyZWF0ZV9jb21wb25lbnQsIGNyZWF0ZV9pbl90cmFuc2l0aW9uLCBjcmVhdGVfb3V0X3RyYW5zaXRpb24sIGNyZWF0ZV9zbG90LCBjcmVhdGVfc3NyX2NvbXBvbmVudCwgY3VycmVudF9jb21wb25lbnQsIGN1c3RvbV9ldmVudCwgZGF0YXNldF9kZXYsIGRlYnVnLCBkZXN0cm95X2Jsb2NrLCBkZXN0cm95X2NvbXBvbmVudCwgZGVzdHJveV9lYWNoLCBkZXRhY2gsIGRldGFjaF9hZnRlcl9kZXYsIGRldGFjaF9iZWZvcmVfZGV2LCBkZXRhY2hfYmV0d2Vlbl9kZXYsIGRldGFjaF9kZXYsIGRpcnR5X2NvbXBvbmVudHMsIGRpc3BhdGNoX2RldiwgZWFjaCwgZWxlbWVudCwgZWxlbWVudF9pcywgZW1wdHksIGVuZF9oeWRyYXRpbmcsIGVzY2FwZSwgZXNjYXBlX2F0dHJpYnV0ZV92YWx1ZSwgZXNjYXBlX29iamVjdCwgZXNjYXBlZCwgZXhjbHVkZV9pbnRlcm5hbF9wcm9wcywgZml4X2FuZF9kZXN0cm95X2Jsb2NrLCBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrLCBmaXhfcG9zaXRpb24sIGZsdXNoLCBnZXRBbGxDb250ZXh0cywgZ2V0Q29udGV4dCwgZ2V0X2FsbF9kaXJ0eV9mcm9tX3Njb3BlLCBnZXRfYmluZGluZ19ncm91cF92YWx1ZSwgZ2V0X2N1cnJlbnRfY29tcG9uZW50LCBnZXRfY3VzdG9tX2VsZW1lbnRzX3Nsb3RzLCBnZXRfcm9vdF9mb3Jfc3R5bGUsIGdldF9zbG90X2NoYW5nZXMsIGdldF9zcHJlYWRfb2JqZWN0LCBnZXRfc3ByZWFkX3VwZGF0ZSwgZ2V0X3N0b3JlX3ZhbHVlLCBnbG9iYWxzLCBncm91cF9vdXRyb3MsIGhhbmRsZV9wcm9taXNlLCBoYXNDb250ZXh0LCBoYXNfcHJvcCwgaWRlbnRpdHksIGluaXQsIGluc2VydCwgaW5zZXJ0X2RldiwgaW5zZXJ0X2h5ZHJhdGlvbiwgaW5zZXJ0X2h5ZHJhdGlvbl9kZXYsIGludHJvcywgaW52YWxpZF9hdHRyaWJ1dGVfbmFtZV9jaGFyYWN0ZXIsIGlzX2NsaWVudCwgaXNfY3Jvc3NvcmlnaW4sIGlzX2VtcHR5LCBpc19mdW5jdGlvbiwgaXNfcHJvbWlzZSwgbGlzdGVuLCBsaXN0ZW5fZGV2LCBsb29wLCBsb29wX2d1YXJkLCBtaXNzaW5nX2NvbXBvbmVudCwgbW91bnRfY29tcG9uZW50LCBub29wLCBub3RfZXF1YWwsIG5vdywgbnVsbF90b19lbXB0eSwgb2JqZWN0X3dpdGhvdXRfcHJvcGVydGllcywgb25EZXN0cm95LCBvbk1vdW50LCBvbmNlLCBvdXRyb19hbmRfZGVzdHJveV9ibG9jaywgcHJldmVudF9kZWZhdWx0LCBwcm9wX2RldiwgcXVlcnlfc2VsZWN0b3JfYWxsLCByYWYsIHJ1biwgcnVuX2FsbCwgc2FmZV9ub3RfZXF1YWwsIHNjaGVkdWxlX3VwZGF0ZSwgc2VsZWN0X211bHRpcGxlX3ZhbHVlLCBzZWxlY3Rfb3B0aW9uLCBzZWxlY3Rfb3B0aW9ucywgc2VsZWN0X3ZhbHVlLCBzZWxmLCBzZXRDb250ZXh0LCBzZXRfYXR0cmlidXRlcywgc2V0X2N1cnJlbnRfY29tcG9uZW50LCBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YSwgc2V0X2RhdGEsIHNldF9kYXRhX2Rldiwgc2V0X2lucHV0X3R5cGUsIHNldF9pbnB1dF92YWx1ZSwgc2V0X25vdywgc2V0X3JhZiwgc2V0X3N0b3JlX3ZhbHVlLCBzZXRfc3R5bGUsIHNldF9zdmdfYXR0cmlidXRlcywgc3BhY2UsIHNwcmVhZCwgc3JjX3VybF9lcXVhbCwgc3RhcnRfaHlkcmF0aW5nLCBzdG9wX3Byb3BhZ2F0aW9uLCBzdWJzY3JpYmUsIHN2Z19lbGVtZW50LCB0ZXh0LCB0aWNrLCB0aW1lX3Jhbmdlc190b19hcnJheSwgdG9fbnVtYmVyLCB0b2dnbGVfY2xhc3MsIHRyYW5zaXRpb25faW4sIHRyYW5zaXRpb25fb3V0LCB0cnVzdGVkLCB1cGRhdGVfYXdhaXRfYmxvY2tfYnJhbmNoLCB1cGRhdGVfa2V5ZWRfZWFjaCwgdXBkYXRlX3Nsb3QsIHVwZGF0ZV9zbG90X2Jhc2UsIHZhbGlkYXRlX2NvbXBvbmVudCwgdmFsaWRhdGVfZWFjaF9hcmd1bWVudCwgdmFsaWRhdGVfZWFjaF9rZXlzLCB2YWxpZGF0ZV9zbG90cywgdmFsaWRhdGVfc3RvcmUsIHhsaW5rX2F0dHIgfTtcbiIsImltcG9ydCB7IGN1YmljSW5PdXQsIGxpbmVhciwgY3ViaWNPdXQgfSBmcm9tICcuLi9lYXNpbmcvaW5kZXgubWpzJztcbmltcG9ydCB7IGlzX2Z1bmN0aW9uLCBhc3NpZ24gfSBmcm9tICcuLi9pbnRlcm5hbC9pbmRleC5tanMnO1xuXG4vKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG5cclxuZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XG5cbmZ1bmN0aW9uIGJsdXIobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBjdWJpY0luT3V0LCBhbW91bnQgPSA1LCBvcGFjaXR5ID0gMCB9ID0ge30pIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgY29uc3QgdGFyZ2V0X29wYWNpdHkgPSArc3R5bGUub3BhY2l0eTtcbiAgICBjb25zdCBmID0gc3R5bGUuZmlsdGVyID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLmZpbHRlcjtcbiAgICBjb25zdCBvZCA9IHRhcmdldF9vcGFjaXR5ICogKDEgLSBvcGFjaXR5KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgY3NzOiAoX3QsIHUpID0+IGBvcGFjaXR5OiAke3RhcmdldF9vcGFjaXR5IC0gKG9kICogdSl9OyBmaWx0ZXI6ICR7Zn0gYmx1cigke3UgKiBhbW91bnR9cHgpO2BcbiAgICB9O1xufVxuZnVuY3Rpb24gZmFkZShub2RlLCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSA0MDAsIGVhc2luZyA9IGxpbmVhciB9ID0ge30pIHtcbiAgICBjb25zdCBvID0gK2dldENvbXB1dGVkU3R5bGUobm9kZSkub3BhY2l0eTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgY3NzOiB0ID0+IGBvcGFjaXR5OiAke3QgKiBvfWBcbiAgICB9O1xufVxuZnVuY3Rpb24gZmx5KG5vZGUsIHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDQwMCwgZWFzaW5nID0gY3ViaWNPdXQsIHggPSAwLCB5ID0gMCwgb3BhY2l0eSA9IDAgfSA9IHt9KSB7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGNvbnN0IHRhcmdldF9vcGFjaXR5ID0gK3N0eWxlLm9wYWNpdHk7XG4gICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICBjb25zdCBvZCA9IHRhcmdldF9vcGFjaXR5ICogKDEgLSBvcGFjaXR5KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgY3NzOiAodCwgdSkgPT4gYFxuXHRcdFx0dHJhbnNmb3JtOiAke3RyYW5zZm9ybX0gdHJhbnNsYXRlKCR7KDEgLSB0KSAqIHh9cHgsICR7KDEgLSB0KSAqIHl9cHgpO1xuXHRcdFx0b3BhY2l0eTogJHt0YXJnZXRfb3BhY2l0eSAtIChvZCAqIHUpfWBcbiAgICB9O1xufVxuZnVuY3Rpb24gc2xpZGUobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBjdWJpY091dCB9ID0ge30pIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgY29uc3Qgb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICAgIGNvbnN0IGhlaWdodCA9IHBhcnNlRmxvYXQoc3R5bGUuaGVpZ2h0KTtcbiAgICBjb25zdCBwYWRkaW5nX3RvcCA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1RvcCk7XG4gICAgY29uc3QgcGFkZGluZ19ib3R0b20gPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdCb3R0b20pO1xuICAgIGNvbnN0IG1hcmdpbl90b3AgPSBwYXJzZUZsb2F0KHN0eWxlLm1hcmdpblRvcCk7XG4gICAgY29uc3QgbWFyZ2luX2JvdHRvbSA9IHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luQm90dG9tKTtcbiAgICBjb25zdCBib3JkZXJfdG9wX3dpZHRoID0gcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJUb3BXaWR0aCk7XG4gICAgY29uc3QgYm9yZGVyX2JvdHRvbV93aWR0aCA9IHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyQm90dG9tV2lkdGgpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRlbGF5LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZWFzaW5nLFxuICAgICAgICBjc3M6IHQgPT4gJ292ZXJmbG93OiBoaWRkZW47JyArXG4gICAgICAgICAgICBgb3BhY2l0eTogJHtNYXRoLm1pbih0ICogMjAsIDEpICogb3BhY2l0eX07YCArXG4gICAgICAgICAgICBgaGVpZ2h0OiAke3QgKiBoZWlnaHR9cHg7YCArXG4gICAgICAgICAgICBgcGFkZGluZy10b3A6ICR7dCAqIHBhZGRpbmdfdG9wfXB4O2AgK1xuICAgICAgICAgICAgYHBhZGRpbmctYm90dG9tOiAke3QgKiBwYWRkaW5nX2JvdHRvbX1weDtgICtcbiAgICAgICAgICAgIGBtYXJnaW4tdG9wOiAke3QgKiBtYXJnaW5fdG9wfXB4O2AgK1xuICAgICAgICAgICAgYG1hcmdpbi1ib3R0b206ICR7dCAqIG1hcmdpbl9ib3R0b219cHg7YCArXG4gICAgICAgICAgICBgYm9yZGVyLXRvcC13aWR0aDogJHt0ICogYm9yZGVyX3RvcF93aWR0aH1weDtgICtcbiAgICAgICAgICAgIGBib3JkZXItYm90dG9tLXdpZHRoOiAke3QgKiBib3JkZXJfYm90dG9tX3dpZHRofXB4O2BcbiAgICB9O1xufVxuZnVuY3Rpb24gc2NhbGUobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBjdWJpY091dCwgc3RhcnQgPSAwLCBvcGFjaXR5ID0gMCB9ID0ge30pIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgY29uc3QgdGFyZ2V0X29wYWNpdHkgPSArc3R5bGUub3BhY2l0eTtcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBzdHlsZS50cmFuc2Zvcm0gPT09ICdub25lJyA/ICcnIDogc3R5bGUudHJhbnNmb3JtO1xuICAgIGNvbnN0IHNkID0gMSAtIHN0YXJ0O1xuICAgIGNvbnN0IG9kID0gdGFyZ2V0X29wYWNpdHkgKiAoMSAtIG9wYWNpdHkpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRlbGF5LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZWFzaW5nLFxuICAgICAgICBjc3M6IChfdCwgdSkgPT4gYFxuXHRcdFx0dHJhbnNmb3JtOiAke3RyYW5zZm9ybX0gc2NhbGUoJHsxIC0gKHNkICogdSl9KTtcblx0XHRcdG9wYWNpdHk6ICR7dGFyZ2V0X29wYWNpdHkgLSAob2QgKiB1KX1cblx0XHRgXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGRyYXcobm9kZSwgeyBkZWxheSA9IDAsIHNwZWVkLCBkdXJhdGlvbiwgZWFzaW5nID0gY3ViaWNJbk91dCB9ID0ge30pIHtcbiAgICBsZXQgbGVuID0gbm9kZS5nZXRUb3RhbExlbmd0aCgpO1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBpZiAoc3R5bGUuc3Ryb2tlTGluZWNhcCAhPT0gJ2J1dHQnKSB7XG4gICAgICAgIGxlbiArPSBwYXJzZUludChzdHlsZS5zdHJva2VXaWR0aCk7XG4gICAgfVxuICAgIGlmIChkdXJhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChzcGVlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IDgwMDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGR1cmF0aW9uID0gbGVuIC8gc3BlZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGR1cmF0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGR1cmF0aW9uID0gZHVyYXRpb24obGVuKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogKHQsIHUpID0+IGBzdHJva2UtZGFzaGFycmF5OiAke3QgKiBsZW59ICR7dSAqIGxlbn1gXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNyb3NzZmFkZShfYSkge1xuICAgIHZhciB7IGZhbGxiYWNrIH0gPSBfYSwgZGVmYXVsdHMgPSBfX3Jlc3QoX2EsIFtcImZhbGxiYWNrXCJdKTtcbiAgICBjb25zdCB0b19yZWNlaXZlID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHRvX3NlbmQgPSBuZXcgTWFwKCk7XG4gICAgZnVuY3Rpb24gY3Jvc3NmYWRlKGZyb20sIG5vZGUsIHBhcmFtcykge1xuICAgICAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSBkID0+IE1hdGguc3FydChkKSAqIDMwLCBlYXNpbmcgPSBjdWJpY091dCB9ID0gYXNzaWduKGFzc2lnbih7fSwgZGVmYXVsdHMpLCBwYXJhbXMpO1xuICAgICAgICBjb25zdCB0byA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IGR4ID0gZnJvbS5sZWZ0IC0gdG8ubGVmdDtcbiAgICAgICAgY29uc3QgZHkgPSBmcm9tLnRvcCAtIHRvLnRvcDtcbiAgICAgICAgY29uc3QgZHcgPSBmcm9tLndpZHRoIC8gdG8ud2lkdGg7XG4gICAgICAgIGNvbnN0IGRoID0gZnJvbS5oZWlnaHQgLyB0by5oZWlnaHQ7XG4gICAgICAgIGNvbnN0IGQgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHN0eWxlLnRyYW5zZm9ybSA9PT0gJ25vbmUnID8gJycgOiBzdHlsZS50cmFuc2Zvcm07XG4gICAgICAgIGNvbnN0IG9wYWNpdHkgPSArc3R5bGUub3BhY2l0eTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlbGF5LFxuICAgICAgICAgICAgZHVyYXRpb246IGlzX2Z1bmN0aW9uKGR1cmF0aW9uKSA/IGR1cmF0aW9uKGQpIDogZHVyYXRpb24sXG4gICAgICAgICAgICBlYXNpbmcsXG4gICAgICAgICAgICBjc3M6ICh0LCB1KSA9PiBgXG5cdFx0XHRcdG9wYWNpdHk6ICR7dCAqIG9wYWNpdHl9O1xuXHRcdFx0XHR0cmFuc2Zvcm0tb3JpZ2luOiB0b3AgbGVmdDtcblx0XHRcdFx0dHJhbnNmb3JtOiAke3RyYW5zZm9ybX0gdHJhbnNsYXRlKCR7dSAqIGR4fXB4LCR7dSAqIGR5fXB4KSBzY2FsZSgke3QgKyAoMSAtIHQpICogZHd9LCAke3QgKyAoMSAtIHQpICogZGh9KTtcblx0XHRcdGBcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdHJhbnNpdGlvbihpdGVtcywgY291bnRlcnBhcnRzLCBpbnRybykge1xuICAgICAgICByZXR1cm4gKG5vZGUsIHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgaXRlbXMuc2V0KHBhcmFtcy5rZXksIHtcbiAgICAgICAgICAgICAgICByZWN0OiBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ZXJwYXJ0cy5oYXMocGFyYW1zLmtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyByZWN0IH0gPSBjb3VudGVycGFydHMuZ2V0KHBhcmFtcy5rZXkpO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVycGFydHMuZGVsZXRlKHBhcmFtcy5rZXkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3Jvc3NmYWRlKHJlY3QsIG5vZGUsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBub2RlIGlzIGRpc2FwcGVhcmluZyBhbHRvZ2V0aGVyXG4gICAgICAgICAgICAgICAgLy8gKGkuZS4gd2Fzbid0IGNsYWltZWQgYnkgdGhlIG90aGVyIGxpc3QpXG4gICAgICAgICAgICAgICAgLy8gdGhlbiB3ZSBuZWVkIHRvIHN1cHBseSBhbiBvdXRyb1xuICAgICAgICAgICAgICAgIGl0ZW1zLmRlbGV0ZShwYXJhbXMua2V5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsbGJhY2sgJiYgZmFsbGJhY2sobm9kZSwgcGFyYW1zLCBpbnRybyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgICB0cmFuc2l0aW9uKHRvX3NlbmQsIHRvX3JlY2VpdmUsIGZhbHNlKSxcbiAgICAgICAgdHJhbnNpdGlvbih0b19yZWNlaXZlLCB0b19zZW5kLCB0cnVlKVxuICAgIF07XG59XG5cbmV4cG9ydCB7IGJsdXIsIGNyb3NzZmFkZSwgZHJhdywgZmFkZSwgZmx5LCBzY2FsZSwgc2xpZGUgfTtcbiIsIjxzY3JpcHQ+XG4gICAgaW1wb3J0IHtjcmVhdGVFdmVudERpc3BhdGNoZXJ9IGZyb20gXCJzdmVsdGVcIjtcbiAgICBleHBvcnQgbGV0IHRleHQgPSBcIlwiO1xuICAgIC8vZXhwb3J0IGxldCBzaXplID0ge3dpZHRoOiAyMDAsIGhlaWdodDogNTB9O1xuICAgIGV4cG9ydCBsZXQgYmFja2dyb3VuZENvbG9yID0gXCJyZ2IoMTkzLDE0Nyw5NClcIjtcbiAgICBleHBvcnQgbGV0IGJvcmRlckNvbG9yID0gXCJ0cmFuc3BhcmVudFwiO1xuICAgIGV4cG9ydCBsZXQgYm9yZGVyV2lkdGggPSBcIjJweFwiO1xuICAgIGV4cG9ydCBsZXQgYm9yZGVyUmFkaXVzID0gXCI0MHB4XCI7XG4gICAgLyoqXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBleHBvcnQgbGV0IHdpZHRoID0gbnVsbDtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIGV4cG9ydCBsZXQgZm9udFNpemUgPSBudWxsO1xuXG4gICAgY29uc3QgZGlzcGF0Y2ggPSBjcmVhdGVFdmVudERpc3BhdGNoZXIoKTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZUNsaWNrKCl7XG4gICAgICAgIGRpc3BhdGNoKFwiY2xpY2tcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZVN0eWxlKCl7XG4gICAgICAgIGxldCBzdHlsZSA9IGBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgICAgICAgICAgIGJvcmRlci1jb2xvcjogJHtib3JkZXJDb2xvcn07XG4gICAgICAgICAgICBib3JkZXItd2lkdGg6ICR7Ym9yZGVyV2lkdGh9O1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtiYWNrZ3JvdW5kQ29sb3J9O1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogJHtib3JkZXJSYWRpdXN9O1xuICAgICAgICBgO1xuICAgICAgICBpZih3aWR0aCkgc3R5bGUgKz0gYHdpZHRoOiR7d2lkdGh9O2A7XG4gICAgICAgIFxuICAgICAgICBpZihmb250U2l6ZSkgc3R5bGUgKz0gYGZvbnQtc2l6ZTogJHtmb250U2l6ZX07YFxuICAgICAgICBlbHNlIHN0eWxlICs9IGBmb250LXNpemU6IGNhbGMoMTBweCArIDFlbSk7YDtcblxuICAgICAgICByZXR1cm4gc3R5bGU7XG4gICAgfVxuPC9zY3JpcHQ+XG5cbjxkaXYgY2xhc3M9XCJjb250YWluZXItZWxlbWVudFwiIHN0eWxlPXtjcmVhdGVTdHlsZSgpfSBvbjpjbGljaz17aGFuZGxlQ2xpY2t9PlxuICAgIHt0ZXh0fVxuPC9kaXY+XG5cbjxzdHlsZT5cbiAgICAuY29udGFpbmVyLWVsZW1lbnR7XG4gICAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgICAgdHJhbnNpdGlvbjogMjAwbXMgZWFzZS1pbi1vdXQ7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICBwYWRkaW5nLXJpZ2h0OiBjYWxjKDIwcHggKyAwLjh2dyk7XG4gICAgICAgIHBhZGRpbmctbGVmdDogY2FsYygyMHB4ICsgMC44dncpO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgfVxuICAgIC5jb250YWluZXItZWxlbWVudDpob3ZlcntcbiAgICAgICAgZmlsdGVyOiBicmlnaHRuZXNzKDAuODUpO1xuICAgICAgICAtd2Via2l0LWZpbHRlcjogYnJpZ2h0bmVzcygwLjg1KTtcbiAgICAgICAgZmlsdGVyOiBkcm9wLXNoYWRvdygycHggMnB4IDVweCByZ2IoMCAwIDAgLyAwLjUpKTtcbiAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjEsMS4xKTtcbiAgICB9XG4gICAgLmNvbnRhaW5lci1lbGVtZW50OmFjdGl2ZXtcbiAgICAgICAgZmlsdGVyOiBicmlnaHRuZXNzKDAuODUpO1xuICAgICAgICAtd2Via2l0LWZpbHRlcjogYnJpZ2h0bmVzcygwLjg1KTtcbiAgICB9XG5cbjwvc3R5bGU+IiwiPHNjcmlwdD5cbiAgICBpbXBvcnQge2NyZWF0ZUV2ZW50RGlzcGF0Y2hlcn0gZnJvbSBcInN2ZWx0ZVwiO1xuICAgIGV4cG9ydCBsZXQgc2l6ZSA9IHt3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMH07XG4gICAgZXhwb3J0IGxldCBiYWNrZ3JvdW5kQ29sb3IgPSBcIiNhYWFhYWFcIjtcbiAgICBleHBvcnQgbGV0IGJvcmRlckNvbG9yID0gXCJ0cmFuc3BhcmVudFwiO1xuICAgIGV4cG9ydCBsZXQgYm9yZGVyV2lkdGggPSBcIjJweFwiO1xuXG5cbiAgICBjb25zdCBkaXNwYXRjaCA9IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpO1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlQ2xpY2soKXtcbiAgICAgICAgZGlzcGF0Y2goXCJjbGlja1wiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTdHlsZSgpe1xuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgd2lkdGg6ICR7c2l6ZS53aWR0aH1weDtcbiAgICAgICAgICAgIGhlaWdodDogJHtzaXplLmhlaWdodH1weDtcbiAgICAgICAgICAgIGJvcmRlci1zdHlsZTogc29saWQ7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6ICR7Ym9yZGVyQ29sb3J9O1xuICAgICAgICAgICAgYnJkZXItd2lkdGg6ICR7Ym9yZGVyV2lkdGh9cHg7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke2JhY2tncm91bmRDb2xvcn07XG4gICAgICAgIGA7XG4gICAgfVxuPC9zY3JpcHQ+XG5cbjxkaXYgY2xhc3M9XCJjb250YWluZXJcIiBzdHlsZT17Y3JlYXRlU3R5bGUoKX0gb246Y2xpY2s9e2hhbmRsZUNsaWNrfT5cbiAgICA8c2xvdCBjbGFzcz1cInNsb3RcIj48L3Nsb3Q+XG48L2Rpdj5cblxuPHN0eWxlPlxuICAgIC5jb250YWluZXJ7XG4gICAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICB0cmFuc2l0aW9uOiAyMDBtcyBlYXNlLWluLW91dDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgfVxuICAgIC5zbG90e1xuICAgICAgICBwYWRkaW5nOiAxMHB4O1xuICAgIH1cbiAgICAuY29udGFpbmVyOmhvdmVye1xuICAgICAgICBmaWx0ZXI6IGJyaWdodG5lc3MoMC44NSk7XG4gICAgICAgIC13ZWJraXQtZmlsdGVyOiBicmlnaHRuZXNzKDAuODUpO1xuICAgICAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KDJweCAycHggNXB4IHJnYigwIDAgMCAvIDAuNSkpO1xuICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMiwxLjIpO1xuICAgIH1cbiAgICAuY29udGFpbmVyOmFjdGl2ZXtcbiAgICAgICAgZmlsdGVyOiBicmlnaHRuZXNzKDAuODUpO1xuICAgIH1cblxuPC9zdHlsZT4iLCI8c2NyaXB0PlxuICAgIGV4cG9ydCBsZXQgYm9yZGVyQ29sb3IgPSBcIiM0MTQwNDJcIjtcbiAgICBleHBvcnQgbGV0IGZpbGxDb2xvciA9IFwiI0M2OUQ2NFwiO1xuICAgIGV4cG9ydCBsZXQgd2l0aE1haW5UZXh0ID0gdHJ1ZTtcbiAgICBleHBvcnQgbGV0IHdpdGhCb3R0b21UZXh0ID0gdHJ1ZTtcbiAgICBleHBvcnQgbGV0IHdpZHRoID0gODQxO1xuXG5cbiAgICAvLyBSYXRpbyBvZiBoZWlnaHQvd2lkdGggaW4gc2V2ZXJhbCBjb25maWd1cmF0aW9ucyBvZiB0aGUgbG9nb1xuICAgIGZ1bmN0aW9uIGdldFJhdGlvKCkge1xuICAgICAgICBpZih3aXRoTWFpblRleHQgJiYgd2l0aEJvdHRvbVRleHQpIHJldHVybiAwLjcwNzA3MDtcbiAgICAgICAgaWYod2l0aE1haW5UZXh0ICYmICF3aXRoQm90dG9tVGV4dCkgcmV0dXJuIDEuMDtcbiAgICAgICAgZWxzZSByZXR1cm4gMS4wO1xuICAgIH1cbiAgICAvLyBcbjwvc2NyaXB0PlxuXG48c3ZnIFxuICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiBcbiAgICB3aWR0aD17d2lkdGggKyBcInB4XCJ9IGhlaWdodD17d2lkdGgqZ2V0UmF0aW8oKSArIFwicHhcIn0gXG4gICAgdmlld0JveD1cIjAgMCA4NDEuODkgNTk1LjI3NlwiIFxuICAgIHZlcnNpb249XCIxLjFcIj5cbiAgICBcbiAgICA8ZyBpZD1cInN1cmZhY2UxXCI+XG4gICAgPCEtLSBUaGlzIGlzIHRoZSBzdGFydCBvZiB0aGUgdGl0bGUgLS0+XG4gICAgeyNpZiB3aXRoTWFpblRleHR9XG4gICAgICAgIDxwYXRoIHN0eWxlPVwiIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6e2JvcmRlckNvbG9yfTtmaWxsLW9wYWNpdHk6MTtcIiBkPVwiTSAxNjMuMzQzNzUgMjc1LjAyMzQzOCBMIDE2OC4xOTkyMTkgMjc1LjAyMzQzOCBMIDIxMy4xMDE1NjMgMzM5LjY0NDUzMSBMIDI1Ny44NDc2NTYgMjc1LjAyMzQzOCBMIDI2Mi43MDMxMjUgMjc1LjAyMzQzOCBMIDI2Mi43MDMxMjUgMzgxLjIxMDkzOCBMIDI1Ny41NDY4NzUgMzgxLjIxMDkzOCBMIDI1Ny41NDY4NzUgMjgzLjk3MjY1NiBMIDIxMy4xMDE1NjMgMzQ3LjY4NzUgTCAyMTIuNzk2ODc1IDM0Ny42ODc1IEwgMTY4LjM1MTU2MyAyODMuOTcyNjU2IEwgMTY4LjM1MTU2MyAzODEuMjEwOTM4IEwgMTYzLjM0Mzc1IDM4MS4yMTA5MzggXCIvPlxuICAgICAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gMzEwLjUwNzgxMyAzODEuMjEwOTM4IEwgMzE1LjY2NDA2MyAzODEuMjEwOTM4IEwgMzE1LjY2NDA2MyAyNzUuMDIzNDM4IEwgMzEwLjUwNzgxMyAyNzUuMDIzNDM4IFogTSAzMTAuNTA3ODEzIDM4MS4yMTA5MzggXCIvPlxuICAgICAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gMzkxLjIxMDkzOCAyNzkuNzMwNDY5IEwgMzUzLjQ0MTQwNiAyNzkuNzMwNDY5IEwgMzUzLjQ0MTQwNiAyNzUuMDIzNDM4IEwgNDM0LjI5Mjk2OSAyNzUuMDIzNDM4IEwgNDM0LjI5Mjk2OSAyNzkuNzMwNDY5IEwgMzk2LjM3MTA5NCAyNzkuNzMwNDY5IEwgMzk2LjM3MTA5NCAzODEuMjEwOTM4IEwgMzkxLjIxMDkzOCAzODEuMjEwOTM4IFwiLz5cbiAgICAgICAgPHBhdGggc3R5bGU9XCIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDp7Ym9yZGVyQ29sb3J9O2ZpbGwtb3BhY2l0eToxO1wiIGQ9XCJNIDUzMC43ODEyNSAzNDUuNTYyNSBMIDUwMC4xNDA2MjUgMjgwLjMzNTkzOCBMIDQ2OS42NDg0MzggMzQ1LjU2MjUgWiBNIDQ5Ny44NjMyODEgMjc0LjI2NTYyNSBMIDUwMi43MTg3NSAyNzQuMjY1NjI1IEwgNTUzLjA3ODEyNSAzODEuMjEwOTM4IEwgNTQ3LjQ2NDg0NCAzODEuMjEwOTM4IEwgNTMzLjA1NDY4OCAzNTAuMjY1NjI1IEwgNDY3LjM3NSAzNTAuMjY1NjI1IEwgNDUyLjgxMjUgMzgxLjIxMDkzOCBMIDQ0Ny41IDM4MS4yMTA5MzggXCIvPlxuICAgICAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gNjI0Ljg0NzY1NiAzNzYuNTA3ODEzIEMgNjU1LjMzOTg0NCAzNzYuNTA3ODEzIDY3NS44MTI1IDM1NS4yNjk1MzEgNjc1LjgxMjUgMzI4LjQyMTg3NSBMIDY3NS44MTI1IDMyOC4xMTcxODggQyA2NzUuODEyNSAzMDEuMjY5NTMxIDY1NS4zMzk4NDQgMjc5LjczMDQ2OSA2MjQuNjkxNDA2IDI3OS43MzA0NjkgTCA1OTUuMjY1NjI1IDI3OS43MzA0NjkgTCA1OTUuMjY1NjI1IDM3Ni41MDc4MTMgWiBNIDU5MC4xMDkzNzUgMjc1LjAyMzQzOCBMIDYyNC42OTE0MDYgMjc1LjAyMzQzOCBDIDY1OC4wNjY0MDYgMjc1LjAyMzQzOCA2ODEuMTIxMDk0IDI5OC4wODIwMzEgNjgxLjEyMTA5NCAzMjcuOTY4NzUgTCA2ODEuMTIxMDk0IDMyOC4yNjk1MzEgQyA2ODEuMTIxMDk0IDM1OC4xNTIzNDQgNjU4LjA2NjQwNiAzODEuMjEwOTM4IDYyNC42OTE0MDYgMzgxLjIxMDkzOCBMIDU5MC4xMDkzNzUgMzgxLjIxMDkzOCBcIi8+XG4gICAgICAgIDxwYXRoIHN0eWxlPVwiIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6e2JvcmRlckNvbG9yfTtmaWxsLW9wYWNpdHk6MTtcIiBkPVwiTSAyMjQuMzc4OTA2IDQ0Ny4zMDQ2ODggQyAyMjQuMzc4OTA2IDQzMS4wMDM5MDYgMjEzLjIwNzAzMSA0MTkuNTc0MjE5IDE5Ni42NDQ1MzEgNDE5LjU3NDIxOSBMIDE4MS4wMDc4MTMgNDE5LjU3NDIxOSBMIDE4MS4wMDc4MTMgNDc1LjAzNTE1NiBMIDE5Ni42NDQ1MzEgNDc1LjAzNTE1NiBDIDIxMy4yMDcwMzEgNDc1LjAzNTE1NiAyMjQuMzc4OTA2IDQ2My44NjMyODEgMjI0LjM3ODkwNiA0NDcuNTY2NDA2IFogTSAxOTYuNjQ0NTMxIDQ5My4zMDA3ODEgTCAxNjAuNzY1NjI1IDQ5My4zMDA3ODEgTCAxNjAuNzY1NjI1IDQwMS4zMDQ2ODggTCAxOTYuNjQ0NTMxIDQwMS4zMDQ2ODggQyAyMjUuNTU4NTk0IDQwMS4zMDQ2ODggMjQ1LjUzNTE1NiA0MjEuMTUyMzQ0IDI0NS41MzUxNTYgNDQ3LjAzOTA2MyBMIDI0NS41MzUxNTYgNDQ3LjMwNDY4OCBDIDI0NS41MzUxNTYgNDczLjE5NTMxMyAyMjUuNTU4NTk0IDQ5My4zMDA3ODEgMTk2LjY0NDUzMSA0OTMuMzAwNzgxIFwiLz5cbiAgICAgICAgPHBhdGggc3R5bGU9XCIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDp7Ym9yZGVyQ29sb3J9O2ZpbGwtb3BhY2l0eToxO1wiIGQ9XCJNIDM0OS4yMzgyODEgNDQ3LjMwNDY4OCBDIDM0OS4yMzgyODEgNDMxLjUzNTE1NiAzMzcuNjc1NzgxIDQxOC4zODY3MTkgMzIxLjM3ODkwNiA0MTguMzg2NzE5IEMgMzA1LjA4MjAzMSA0MTguMzg2NzE5IDI5My43NzczNDQgNDMxLjI2OTUzMSAyOTMuNzc3MzQ0IDQ0Ny4wMzkwNjMgTCAyOTMuNzc3MzQ0IDQ0Ny4zMDQ2ODggQyAyOTMuNzc3MzQ0IDQ2My4wNzQyMTkgMzA1LjM0Mzc1IDQ3Ni4yMTQ4NDQgMzIxLjY0MDYyNSA0NzYuMjE0ODQ0IEMgMzM3LjkzMzU5NCA0NzYuMjE0ODQ0IDM0OS4yMzgyODEgNDYzLjMzNTkzOCAzNDkuMjM4MjgxIDQ0Ny41NjY0MDYgWiBNIDMyMS4zNzg5MDYgNDk0Ljg3ODkwNiBDIDI5Mi45ODgyODEgNDk0Ljg3ODkwNiAyNzIuNjE3MTg4IDQ3My43MjI2NTYgMjcyLjYxNzE4OCA0NDcuNTY2NDA2IEwgMjcyLjYxNzE4OCA0NDcuMzA0Njg4IEMgMjcyLjYxNzE4OCA0MjEuMTUyMzQ0IDI5My4yNTM5MDYgMzk5LjcyNjU2MyAzMjEuNjQwNjI1IDM5OS43MjY1NjMgQyAzNTAuMDMxMjUgMzk5LjcyNjU2MyAzNzAuMzk4NDM4IDQyMC44ODY3MTkgMzcwLjM5ODQzOCA0NDcuMDM5MDYzIEwgMzcwLjM5ODQzOCA0NDcuMzA0Njg4IEMgMzcwLjM5ODQzOCA0NzMuNDU3MDMxIDM0OS43NjU2MjUgNDk0Ljg3ODkwNiAzMjEuMzc4OTA2IDQ5NC44Nzg5MDYgXCIvPlxuICAgICAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gNDU5LjY1MjM0NCA0NjUuMzA4NTk0IEMgNDU5LjY1MjM0NCA0NTkuMTMyODEzIDQ1NS4wNTA3ODEgNDU1LjMyMDMxMyA0NDQuNjY3OTY5IDQ1NS4zMjAzMTMgTCA0MjEuMjczNDM4IDQ1NS4zMjAzMTMgTCA0MjEuMjczNDM4IDQ3NS41NTg1OTQgTCA0NDUuMzI0MjE5IDQ3NS41NTg1OTQgQyA0NTQuMjYxNzE5IDQ3NS41NTg1OTQgNDU5LjY1MjM0NCA0NzIuNDA2MjUgNDU5LjY1MjM0NCA0NjUuNTcwMzEzIFogTSA0NTQuNTI3MzQ0IDQyOC41MTE3MTkgQyA0NTQuNTI3MzQ0IDQyMi40NjQ4NDQgNDQ5Ljc5Njg3NSA0MTkuMDQ2ODc1IDQ0MS4yNSA0MTkuMDQ2ODc1IEwgNDIxLjI3MzQzOCA0MTkuMDQ2ODc1IEwgNDIxLjI3MzQzOCA0MzguNSBMIDQzOS45Mzc1IDQzOC41IEMgNDQ4Ljg3NSA0MzguNSA0NTQuNTI3MzQ0IDQzNS42MDU0NjkgNDU0LjUyNzM0NCA0MjguNzczNDM4IFogTSA0NDUuMzI0MjE5IDQ5My4zMDA3ODEgTCA0MDEuNTYyNSA0OTMuMzAwNzgxIEwgNDAxLjU2MjUgNDAxLjMwNDY4OCBMIDQ0NC4yNzM0MzggNDAxLjMwNDY4OCBDIDQ2My4wNjY0MDYgNDAxLjMwNDY4OCA0NzQuNjMyODEzIDQxMC42MzY3MTkgNDc0LjYzMjgxMyA0MjUuMDkzNzUgTCA0NzQuNjMyODEzIDQyNS4zNTU0NjkgQyA0NzQuNjMyODEzIDQzNS43MzgyODEgNDY5LjExNzE4OCA0NDEuNTE5NTMxIDQ2Mi41NDI5NjkgNDQ1LjIwMzEyNSBDIDQ3My4xODc1IDQ0OS4yNzM0MzggNDc5Ljc2MTcxOSA0NTUuNDUzMTI1IDQ3OS43NjE3MTkgNDY3LjgwNDY4OCBMIDQ3OS43NjE3MTkgNDY4LjA3MDMxMyBDIDQ3OS43NjE3MTkgNDg0Ljg5MDYyNSA0NjYuMDg5ODQ0IDQ5My4zMDA3ODEgNDQ1LjMyNDIxOSA0OTMuMzAwNzgxIFwiLz5cbiAgICAgICAgPHBhdGggc3R5bGU9XCIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDp7Ym9yZGVyQ29sb3J9O2ZpbGwtb3BhY2l0eToxO1wiIGQ9XCJNIDUwOS42MDE1NjMgNDkzLjMwMDc4MSBMIDUwOS42MDE1NjMgNDAxLjMwNDY4OCBMIDUyOS44NDM3NSA0MDEuMzA0Njg4IEwgNTI5Ljg0Mzc1IDQ3NC45MDIzNDQgTCA1NzUuNzEwOTM4IDQ3NC45MDIzNDQgTCA1NzUuNzEwOTM4IDQ5My4zMDA3ODEgXCIvPlxuICAgICAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gNjA0LjEwNTQ2OSA0OTMuMzAwNzgxIEwgNjA0LjEwNTQ2OSA0MDEuMzA0Njg4IEwgNjczLjUgNDAxLjMwNDY4OCBMIDY3My41IDQxOS4zMDg1OTQgTCA2MjQuMjE0ODQ0IDQxOS4zMDg1OTQgTCA2MjQuMjE0ODQ0IDQzNy45NzI2NTYgTCA2NjcuNTg1OTM4IDQzNy45NzI2NTYgTCA2NjcuNTg1OTM4IDQ1NS45NzY1NjMgTCA2MjQuMjE0ODQ0IDQ1NS45NzY1NjMgTCA2MjQuMjE0ODQ0IDQ3NS4yOTY4NzUgTCA2NzQuMTU2MjUgNDc1LjI5Njg3NSBMIDY3NC4xNTYyNSA0OTMuMzAwNzgxIFwiLz5cbiAgICB7L2lmfVxuXG4gICAgPCEtLSBUaGlzIGlzIHRoZSBzdGFydCBvZiB0aGUgc3VidGl0bGUgLS0+XG4gICAgeyNpZiB3aXRoQm90dG9tVGV4dH1cbiAgICAgICAgPHBhdGggc3R5bGU9XCIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDp7Ym9yZGVyQ29sb3J9O2ZpbGwtb3BhY2l0eToxO1wiIGQ9XCJNIDIxMS43MjY1NjMgNTU0LjI2OTUzMSBDIDIxMS43MjY1NjMgNTQ3LjE2Nzk2OSAyMTcuNjMyODEzIDU0MC42MDU0NjkgMjI0LjkyNTc4MSA1NDAuNjA1NDY5IEMgMjI5LjAwNzgxMyA1NDAuNjA1NDY5IDIzMS43MzgyODEgNTQyLjU4MjAzMSAyMzMuMjE4NzUgNTQ1LjMxNjQwNiBMIDIzMS4wNzgxMjUgNTQ2LjYzNjcxOSBDIDIyOS43MzA0NjkgNTQ0LjM0Mzc1IDIyNy45NDE0MDYgNTQyLjg5NDUzMSAyMjQuNzAzMTI1IDU0Mi44OTQ1MzEgQyAyMTguOTg0Mzc1IDU0Mi44OTQ1MzEgMjE0LjMzMjAzMSA1NDguMzYzMjgxIDIxNC4zMzIwMzEgNTU0LjE3MTg3NSBDIDIxNC4zMzIwMzEgNTU4LjQxNDA2MyAyMTcuMjI2NTYzIDU2MS4wNTg1OTQgMjIxLjIxODc1IDU2MS4wNTg1OTQgQyAyMjQuMTY3OTY5IDU2MS4wNTg1OTQgMjI2LjE0ODQzOCA1NTkuODk0NTMxIDIyOC4wMzEyNSA1NTguMDcwMzEzIEwgMjI5LjY5OTIxOSA1NTkuNzA3MDMxIEMgMjI3LjY1NjI1IDU2MS43NDYwOTQgMjI1LjA0Njg3NSA1NjMuMzc4OTA2IDIyMS4wODk4NDQgNTYzLjM3ODkwNiBDIDIxNS45MDYyNSA1NjMuMzc4OTA2IDIxMS43MjY1NjMgNTU5LjkyNTc4MSAyMTEuNzI2NTYzIDU1NC4yNjk1MzEgXCIvPlxuICAgICAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gMjQ3LjU4OTg0NCA1NTIuMTk1MzEzIEMgMjUwLjc5Mjk2OSA1NTIuMTk1MzEzIDI1My4xMTcxODggNTUxLjE5MTQwNiAyNTQuMDkzNzUgNTQ5LjU4NTkzOCBDIDI1NC43ODEyNSA1NDguNjc1NzgxIDI1NS4wOTc2NTYgNTQ3LjY3MTg3NSAyNTQuOTcyNjU2IDU0Ni41MDc4MTMgQyAyNTQuODEyNSA1NDQuNSAyNTMuMTUyMzQ0IDU0My4yNjk1MzEgMjQ5Ljk0NTMxMyA1NDMuMjY5NTMxIEwgMjQ0LjAzOTA2MyA1NDMuMjY5NTMxIEwgMjQxLjYyMTA5NCA1NTIuMTk1MzEzIFogTSAyNDIuMTUyMzQ0IDU0MC45ODA0NjkgTCAyNTAuMDcwMzEzIDU0MC45ODA0NjkgQyAyNTQuMjgxMjUgNTQwLjk4MDQ2OSAyNTYuODU5Mzc1IDU0Mi42NzU3ODEgMjU3LjI2NTYyNSA1NDUuNTkzNzUgQyAyNTcuNTUwNzgxIDU0Ny4yMzA0NjkgMjU3LjIwMzEyNSA1NDguNzY5NTMxIDI1Ni4yODkwNjMgNTUwLjE1MjM0NCBDIDI1NS4yNTM5MDYgNTUyLjI4OTA2MyAyNTIuODY3MTg4IDU1My42NzU3ODEgMjQ5LjY2NDA2MyA1NTQuMTcxODc1IEwgMjU0LjE4NzUgNTYyLjk2ODc1IEwgMjUxLjMyODEyNSA1NjIuOTY4NzUgTCAyNDYuOTkyMTg4IDU1NC40MjU3ODEgTCAyNDEuMDIzNDM4IDU1NC40MjU3ODEgTCAyMzguNzI2NTYzIDU2Mi45Njg3NSBMIDIzNi4yNSA1NjIuOTY4NzUgXCIvPlxuICAgICAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gMjY3LjgzNTkzOCA1NDAuOTgwNDY5IEwgMjgzLjU3ODEyNSA1NDAuOTgwNDY5IEwgMjgyLjk0OTIxOSA1NDMuMjQyMTg4IEwgMjY5LjY5MTQwNiA1NDMuMjQyMTg4IEwgMjY3LjY3OTY4OCA1NTAuNzUgTCAyNzkuNTIzNDM4IDU1MC43NSBMIDI3OC44OTg0MzggNTUzLjAxNTYyNSBMIDI2Ny4wODIwMzEgNTUzLjAxNTYyNSBMIDI2NS4wMDc4MTMgNTYwLjcxMDkzOCBMIDI3OC40MjU3ODEgNTYwLjcxMDkzOCBMIDI3Ny44MjQyMTkgNTYyLjk3MjY1NiBMIDI2MS45MzM1OTQgNTYyLjk3MjY1NiBcIi8+XG4gICAgICAgIDxwYXRoIHN0eWxlPVwiIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6e2JvcmRlckNvbG9yfTtmaWxsLW9wYWNpdHk6MTtcIiBkPVwiTSAzMDEuODc4OTA2IDU1NC45Mjk2ODggTCAyOTkuODk4NDM4IDU0My42NTIzNDQgTCAyOTEuODU1NDY5IDU1NC45Mjk2ODggWiBNIDI5OS4zNjMyODEgNTQwLjgyNDIxOSBMIDMwMS43NSA1NDAuODI0MjE5IEwgMzA1LjgzNTkzOCA1NjIuOTcyNjU2IEwgMzAzLjI4OTA2MyA1NjIuOTcyNjU2IEwgMzAyLjI4NTE1NiA1NTcuMTU2MjUgTCAyOTAuMjg1MTU2IDU1Ny4xNTYyNSBMIDI4Ni4xMzY3MTkgNTYyLjk3MjY1NiBMIDI4My40MDYyNSA1NjIuOTcyNjU2IFwiLz5cbiAgICAgICAgPHBhdGggc3R5bGU9XCIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDp7Ym9yZGVyQ29sb3J9O2ZpbGwtb3BhY2l0eToxO1wiIGQ9XCJNIDMyMC42NDQ1MzEgNTQzLjI2OTUzMSBMIDMxMy4yMzA0NjkgNTQzLjI2OTUzMSBMIDMxMy44NTkzNzUgNTQwLjk4MDQ2OSBMIDMzMS4xNzE4NzUgNTQwLjk4MDQ2OSBMIDMzMC41MzkwNjMgNTQzLjI2OTUzMSBMIDMyMy4xMjg5MDYgNTQzLjI2OTUzMSBMIDMxNy44NTE1NjMgNTYyLjk3MjY1NiBMIDMxNS4zNjcxODggNTYyLjk3MjY1NiBcIi8+XG4gICAgICAgIDxwYXRoIHN0eWxlPVwiIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6e2JvcmRlckNvbG9yfTtmaWxsLW9wYWNpdHk6MTtcIiBkPVwiTSAzMzguNzg1MTU2IDU0MC45ODA0NjkgTCAzNDEuMjY1NjI1IDU0MC45ODA0NjkgTCAzMzUuMzU5Mzc1IDU2Mi45NzI2NTYgTCAzMzIuODc4OTA2IDU2Mi45NzI2NTYgWiBNIDMzOC43ODUxNTYgNTQwLjk4MDQ2OSBcIi8+XG4gICAgICAgIDxwYXRoIHN0eWxlPVwiIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6e2JvcmRlckNvbG9yfTtmaWxsLW9wYWNpdHk6MTtcIiBkPVwiTSAzNDguMzEyNSA1NDAuOTgwNDY5IEwgMzUwLjk0OTIxOSA1NDAuOTgwNDY5IEwgMzUzLjY1MjM0NCA1NTkuODk0NTMxIEwgMzY2LjUgNTQwLjk4MDQ2OSBMIDM2OS4zMjgxMjUgNTQwLjk4MDQ2OSBMIDM1My45OTYwOTQgNTYzLjEyODkwNiBMIDM1MS43NjU2MjUgNTYzLjEyODkwNiBcIi8+XG4gICAgICAgIDxwYXRoIHN0eWxlPVwiIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6e2JvcmRlckNvbG9yfTtmaWxsLW9wYWNpdHk6MTtcIiBkPVwiTSAzNzYuNzU3ODEzIDU0MC45ODA0NjkgTCAzNzkuMjM4MjgxIDU0MC45ODA0NjkgTCAzNzMuMzM1OTM4IDU2Mi45NzI2NTYgTCAzNzAuODUxNTYzIDU2Mi45NzI2NTYgWiBNIDM3Ni43NTc4MTMgNTQwLjk4MDQ2OSBcIi8+XG4gICAgICAgIDxwYXRoIHN0eWxlPVwiIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6e2JvcmRlckNvbG9yfTtmaWxsLW9wYWNpdHk6MTtcIiBkPVwiTSAzOTAuNjgzNTk0IDU2MC42NzU3ODEgQyAzOTQuMzU5Mzc1IDU2MC42NzU3ODEgMzk3LjUzMTI1IDU1OS40NTMxMjUgMzk5Ljc2MTcxOSA1NTcuMjIyNjU2IEMgNDAxLjUyMzQzOCA1NTUuNDYwOTM4IDQwMi41MjczNDQgNTUzLjA3NDIxOSA0MDIuNTI3MzQ0IDU1MC4zNzUgQyA0MDIuNTI3MzQ0IDU0OC4yOTY4NzUgNDAxLjg2NzE4OCA1NDYuNjY3OTY5IDQwMC42NzU3ODEgNTQ1LjUwMzkwNiBDIDM5OS4yMzA0NjkgNTQ0LjA1ODU5NCAzOTYuOTAyMzQ0IDU0My4yNjk1MzEgMzkzLjk4MDQ2OSA1NDMuMjY5NTMxIEwgMzkwLjcxNDg0NCA1NDMuMjY5NTMxIEwgMzg2LjAzMTI1IDU2MC42NzU3ODEgWiBNIDM4OC44MjgxMjUgNTQwLjk4MDQ2OSBMIDM5NC4xNDA2MjUgNTQwLjk4MDQ2OSBDIDM5Ny43ODEyNSA1NDAuOTgwNDY5IDQwMC43OTY4NzUgNTQyLjAxNTYyNSA0MDIuNzE0ODQ0IDU0My45MDIzNDQgQyA0MDQuMjg1MTU2IDU0NS40NzI2NTYgNDA1LjEwNTQ2OSA1NDcuNTQ2ODc1IDQwNS4xMDU0NjkgNTUwLjIxNDg0NCBDIDQwNS4xMDU0NjkgNTUzLjU3ODEyNSA0MDMuODc4OTA2IDU1Ni41MzEyNSA0MDEuNjQ0NTMxIDU1OC43OTI5NjkgQyAzOTkuMDA3ODEzIDU2MS40MzM1OTQgMzk1LjA1MDc4MSA1NjIuOTcyNjU2IDM5MC4zNjcxODggNTYyLjk3MjY1NiBMIDM4Mi45MjE4NzUgNTYyLjk3MjY1NiBcIi8+XG4gICAgICAgIDxwYXRoIHN0eWxlPVwiIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6e2JvcmRlckNvbG9yfTtmaWxsLW9wYWNpdHk6MTtcIiBkPVwiTSA0MjUuOTc2NTYzIDU1NC45Mjk2ODggTCA0MjMuOTk2MDk0IDU0My42NTIzNDQgTCA0MTUuOTUzMTI1IDU1NC45Mjk2ODggWiBNIDQyMy40NjQ4NDQgNTQwLjgyNDIxOSBMIDQyNS44NTE1NjMgNTQwLjgyNDIxOSBMIDQyOS45MzM1OTQgNTYyLjk3MjY1NiBMIDQyNy4zOTA2MjUgNTYyLjk3MjY1NiBMIDQyNi4zODI4MTMgNTU3LjE1NjI1IEwgNDE0LjM4NjcxOSA1NTcuMTU2MjUgTCA0MTAuMjM4MjgxIDU2Mi45NzI2NTYgTCA0MDcuNSA1NjIuOTcyNjU2IFwiLz5cbiAgICAgICAgPHBhdGggc3R5bGU9XCIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDp7Ym9yZGVyQ29sb3J9O2ZpbGwtb3BhY2l0eToxO1wiIGQ9XCJNIDQ0NC41MzEyNSA1NjAuNjc1NzgxIEMgNDQ4LjIwNzAzMSA1NjAuNjc1NzgxIDQ1MS4zNzg5MDYgNTU5LjQ1MzEyNSA0NTMuNjA5Mzc1IDU1Ny4yMjI2NTYgQyA0NTUuMzcxMDk0IDU1NS40NjA5MzggNDU2LjM3NSA1NTMuMDc0MjE5IDQ1Ni4zNzUgNTUwLjM3NSBDIDQ1Ni4zNzUgNTQ4LjI5Njg3NSA0NTUuNzE0ODQ0IDU0Ni42Njc5NjkgNDU0LjUyMzQzOCA1NDUuNTAzOTA2IEMgNDUzLjA3NDIxOSA1NDQuMDU4NTk0IDQ1MC43NSA1NDMuMjY5NTMxIDQ0Ny44MzIwMzEgNTQzLjI2OTUzMSBMIDQ0NC41NjI1IDU0My4yNjk1MzEgTCA0MzkuODc4OTA2IDU2MC42NzU3ODEgWiBNIDQ0Mi42NzU3ODEgNTQwLjk4MDQ2OSBMIDQ0Ny45ODgyODEgNTQwLjk4MDQ2OSBDIDQ1MS42Mjg5MDYgNTQwLjk4MDQ2OSA0NTQuNjQ0NTMxIDU0Mi4wMTU2MjUgNDU2LjU2MjUgNTQzLjkwMjM0NCBDIDQ1OC4xMzI4MTMgNTQ1LjQ3MjY1NiA0NTguOTQ5MjE5IDU0Ny41NDY4NzUgNDU4Ljk0OTIxOSA1NTAuMjE0ODQ0IEMgNDU4Ljk0OTIxOSA1NTMuNTc4MTI1IDQ1Ny43MjY1NjMgNTU2LjUzMTI1IDQ1NS40OTIxODggNTU4Ljc5Mjk2OSBDIDQ1Mi44NTU0NjkgNTYxLjQzMzU5NCA0NDguODk4NDM4IDU2Mi45NzI2NTYgNDQ0LjIxNDg0NCA1NjIuOTcyNjU2IEwgNDM2Ljc2OTUzMSA1NjIuOTcyNjU2IFwiLz5cbiAgICAgICAgPHBhdGggc3R5bGU9XCIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDp7Ym9yZGVyQ29sb3J9O2ZpbGwtb3BhY2l0eToxO1wiIGQ9XCJNIDQ4NC41NDY4NzUgNTYwLjY3NTc4MSBDIDQ4OC4yMjI2NTYgNTYwLjY3NTc4MSA0OTEuMzk0NTMxIDU1OS40NTMxMjUgNDkzLjYyNSA1NTcuMjIyNjU2IEMgNDk1LjM4NjcxOSA1NTUuNDYwOTM4IDQ5Ni4zOTA2MjUgNTUzLjA3NDIxOSA0OTYuMzkwNjI1IDU1MC4zNzUgQyA0OTYuMzkwNjI1IDU0OC4yOTY4NzUgNDk1LjczMDQ2OSA1NDYuNjY3OTY5IDQ5NC41MzkwNjMgNTQ1LjUwMzkwNiBDIDQ5My4wODk4NDQgNTQ0LjA1ODU5NCA0OTAuNzY1NjI1IDU0My4yNjk1MzEgNDg3Ljg0NzY1NiA1NDMuMjY5NTMxIEwgNDg0LjU3NDIxOSA1NDMuMjY5NTMxIEwgNDc5Ljg5NDUzMSA1NjAuNjc1NzgxIFogTSA0ODIuNjkxNDA2IDU0MC45ODA0NjkgTCA0ODguMDAzOTA2IDU0MC45ODA0NjkgQyA0OTEuNjQ0NTMxIDU0MC45ODA0NjkgNDk0LjY2MDE1NiA1NDIuMDE1NjI1IDQ5Ni41NzgxMjUgNTQzLjkwMjM0NCBDIDQ5OC4xNDg0MzggNTQ1LjQ3MjY1NiA0OTguOTY0ODQ0IDU0Ny41NDY4NzUgNDk4Ljk2NDg0NCA1NTAuMjE0ODQ0IEMgNDk4Ljk2NDg0NCA1NTMuNTc4MTI1IDQ5Ny43NDIxODggNTU2LjUzMTI1IDQ5NS41MDc4MTMgNTU4Ljc5Mjk2OSBDIDQ5Mi44NzEwOTQgNTYxLjQzMzU5NCA0ODguOTEwMTU2IDU2Mi45NzI2NTYgNDg0LjIzMDQ2OSA1NjIuOTcyNjU2IEwgNDc2Ljc4NTE1NiA1NjIuOTcyNjU2IFwiLz5cbiAgICAgICAgPHBhdGggc3R5bGU9XCIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDp7Ym9yZGVyQ29sb3J9O2ZpbGwtb3BhY2l0eToxO1wiIGQ9XCJNIDUxMC4zNTE1NjMgNTQwLjk4MDQ2OSBMIDUxMi44MzIwMzEgNTQwLjk4MDQ2OSBMIDUwNi45MjU3ODEgNTYyLjk3MjY1NiBMIDUwNC40NDUzMTMgNTYyLjk3MjY1NiBaIE0gNTEwLjM1MTU2MyA1NDAuOTgwNDY5IFwiLz5cbiAgICAgICAgPHBhdGggc3R5bGU9XCIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDp7Ym9yZGVyQ29sb3J9O2ZpbGwtb3BhY2l0eToxO1wiIGQ9XCJNIDUxOC4yNzM0MzggNTU0LjAxOTUzMSBDIDUxOC4yNzM0MzggNTQ3LjIzMDQ2OSA1MjQuMDU4NTk0IDU0MC42MDU0NjkgNTMxLjc4NTE1NiA1NDAuNjA1NDY5IEMgNTM2LjMwODU5NCA1NDAuNjA1NDY5IDUzOC42OTUzMTMgNTQyLjU1MDc4MSA1NDAuMDc4MTI1IDU0NC42MjUgTCA1MzguMTk1MzEzIDU0Ni4wOTc2NTYgQyA1MzYuOTAyMzQ0IDU0NC4zMTI1IDUzNS4xNDg0MzggNTQyLjg2MzI4MSA1MzEuNTYyNSA1NDIuODYzMjgxIEMgNTI1LjQ2ODc1IDU0Mi44NjMyODEgNTIwLjg4MjgxMyA1NDguMzYzMjgxIDUyMC44ODI4MTMgNTUzLjkyMTg3NSBDIDUyMC44ODI4MTMgNTU4LjQ0OTIxOSA1MjMuODk4NDM4IDU2MS4wODU5MzggNTI4LjE3MTg3NSA1NjEuMDg1OTM4IEMgNTMwLjU1ODU5NCA1NjEuMDg1OTM4IDUzMi40NDUzMTMgNTYwLjQyNTc4MSA1MzMuODU5Mzc1IDU1OS41NTA3ODEgTCA1MzUuNTg1OTM4IDU1My40NTMxMjUgTCA1MjguOTU3MDMxIDU1My40NTMxMjUgTCA1MjkuNTUwNzgxIDU1MS4yMjI2NTYgTCA1MzguNjM2NzE5IDU1MS4yMjI2NTYgTCA1MzUuODM1OTM4IDU2MS4wODU5MzggQyA1MzMuNTExNzE5IDU2Mi41MzEyNSA1MzEuMDU4NTk0IDU2My4zNzg5MDYgNTI4LjAxMTcxOSA1NjMuMzc4OTA2IEMgNTIyLjY3MTg3NSA1NjMuMzc4OTA2IDUxOC4yNzM0MzggNTU5LjkyNTc4MSA1MTguMjczNDM4IDU1NC4wMTk1MzEgXCIvPlxuICAgICAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gNTUwLjQyOTY4OCA1NDAuOTgwNDY5IEwgNTUyLjkxNDA2MyA1NDAuOTgwNDY5IEwgNTQ3LjAwNzgxMyA1NjIuOTcyNjU2IEwgNTQ0LjUyMzQzOCA1NjIuOTcyNjU2IFogTSA1NTAuNDI5Njg4IDU0MC45ODA0NjkgXCIvPlxuICAgICAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gNTY3LjA4OTg0NCA1NDMuMjY5NTMxIEwgNTU5LjY3NTc4MSA1NDMuMjY5NTMxIEwgNTYwLjMwNDY4OCA1NDAuOTgwNDY5IEwgNTc3LjYxMzI4MSA1NDAuOTgwNDY5IEwgNTc2Ljk4NDM3NSA1NDMuMjY5NTMxIEwgNTY5LjU3MDMxMyA1NDMuMjY5NTMxIEwgNTY0LjI5Njg3NSA1NjIuOTcyNjU2IEwgNTYxLjgxMjUgNTYyLjk3MjY1NiBcIi8+XG4gICAgICAgIDxwYXRoIHN0eWxlPVwiIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6e2JvcmRlckNvbG9yfTtmaWxsLW9wYWNpdHk6MTtcIiBkPVwiTSA1OTIuODYzMjgxIDU1NC45Mjk2ODggTCA1OTAuODgyODEzIDU0My42NTIzNDQgTCA1ODIuODM5ODQ0IDU1NC45Mjk2ODggWiBNIDU5MC4zNDc2NTYgNTQwLjgyNDIxOSBMIDU5Mi43MzQzNzUgNTQwLjgyNDIxOSBMIDU5Ni44MjAzMTMgNTYyLjk3MjY1NiBMIDU5NC4yNzM0MzggNTYyLjk3MjY1NiBMIDU5My4yNjk1MzEgNTU3LjE1NjI1IEwgNTgxLjI2OTUzMSA1NTcuMTU2MjUgTCA1NzcuMTIxMDk0IDU2Mi45NzI2NTYgTCA1NzQuMzkwNjI1IDU2Mi45NzI2NTYgXCIvPlxuICAgICAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gNjA5LjU1ODU5NCA1NDAuOTgwNDY5IEwgNjEyLjAzOTA2MyA1NDAuOTgwNDY5IEwgNjA2Ljc2MTcxOSA1NjAuNjc1NzgxIEwgNjE5LjE0MDYyNSA1NjAuNjc1NzgxIEwgNjE4LjUxMTcxOSA1NjIuOTcyNjU2IEwgNjAzLjY1MjM0NCA1NjIuOTcyNjU2IFwiLz5cbiAgICB7L2lmfVxuICAgIFxuXG4gICAgPCEtLSBUaGlzIGlzIHRoZSBmaWxsIGZvciB0aGUgbWFpbiBvdXRsaW5lIC0tPlxuICAgIDxwYXRoIHN0eWxlPVwiIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6e2ZpbGxDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gMzY1Ljg4MjgxMyAxMTQuMDUwNzgxIEwgMzg0LjU4OTg0NCAyMDguMDY2NDA2IEMgMzg1Ljk2MDkzOCAyMTQuOTUzMTI1IDM5MC44Nzg5MDYgMjE5Ljc2MTcxOSAzOTYuNTUwNzgxIDIxOS43NjE3MTkgTCA0NjQuMTk5MjE5IDIxOS43NjE3MTkgQyA0NzAuMDIzNDM4IDIxOS43NjE3MTkgNDc1LjEyMTA5NCAyMTQuODM5ODQ0IDQ3Ni42MDE1NjMgMjA3Ljc4NTE1NiBMIDQ5NS44NTU0NjkgMTE1LjkyNTc4MSBcIi8+XG5cbiAgICA8IS0tIFRoaXMgaXMgdGhlIG1haW4gb3V0bGluZSAtLT5cbiAgICA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOntib3JkZXJDb2xvcn07ZmlsbC1vcGFjaXR5OjE7XCIgZD1cIk0gNTQ1LjkxNzk2OSA5Ny42MjEwOTQgQyA1NDUuOTE3OTY5IDEwNi42OTE0MDYgNTM4LjU0Mjk2OSAxMTQuMDY2NDA2IDUyOS40NzI2NTYgMTE0LjA2NjQwNiBMIDUxMi4zOTg0MzggMTE0LjA2NjQwNiBMIDUyNi44MjQyMTkgNTcuOTI5Njg4IEwgNTI5LjQ3MjY1NiA1Ny45Mjk2ODggQyA1MzguNTQyOTY5IDU3LjkyOTY4OCA1NDUuOTE3OTY5IDY1LjMwODU5NCA1NDUuOTE3OTY5IDc0LjM3ODkwNiBaIE0gNTI5LjQ3MjY1NiA0MS43MTQ4NDQgTCA1MjkuMDc0MjE5IDQxLjcxNDg0NCBDIDUyOC4yMjI2NTYgMzMuODQzNzUgNTI1LjM3ODkwNiAyNy42MDkzNzUgNTIwLjUyNzM0NCAyMy4xOTkyMTkgQyA1MTMuNzQ2MDk0IDE3LjAzMTI1IDUwNS42MzY3MTkgMTYuOTI1NzgxIDUwMy4yNjU2MjUgMTcuMDE1NjI1IEwgMzI3LjMzMjAzMSAxNy4wMTU2MjUgQyAzMjQuOTQxNDA2IDE2LjkyOTY4OCAzMTYuODU1NDY5IDE3LjAzMTI1IDMxMC4wNzAzMTMgMjMuMTk5MjE5IEMgMzA0LjE5OTIxOSAyOC41MzUxNTYgMzAxLjIyMjY1NiAzNi40OTYwOTQgMzAxLjIyMjY1NiA0Ni44NjMyODEgTCAzMDEuMjIyNjU2IDQ4LjAxMTcxOSBMIDMyNi45OTYwOTQgMTQ4LjMwMDc4MSBDIDMyOC4yNDIxODggMTUzLjE0NDUzMSAzMzMuMTcxODc1IDE1Ni4wNzQyMTkgMzM4LjAzMTI1IDE1NC44MjAzMTMgQyAzNDIuODc4OTA2IDE1My41NzQyMTkgMzQ1LjgwMDc4MSAxNDguNjMyODEzIDM0NC41NTQ2ODggMTQzLjc4NTE1NiBMIDMxOS4zNjcxODggNDUuNzg1MTU2IEMgMzE5LjUwNzgxMyA0MS41MTU2MjUgMzIwLjQ4ODI4MSAzOC4zMTI1IDMyMi4xNjQwNjMgMzYuNzA3MDMxIEMgMzIzLjg5ODQzOCAzNS4wMzkwNjMgMzI2LjMyODEyNSAzNS4xMTcxODggMzI2LjIxNDg0NCAzNS4xMDU0NjkgTCA1MDMuNTIzNDM4IDM1LjE0NDUzMSBMIDUwMy43MzQzNzUgMzUuMTYwMTU2IEwgNTA0LjE2Nzk2OSAzNS4xMjEwOTQgQyA1MDQuMjY5NTMxIDM1LjEyMTA5NCA1MDYuNjkxNDA2IDM1LjAzMTI1IDUwOC40MzM1OTQgMzYuNzA3MDMxIEMgNTEwLjEwOTM3NSAzOC4zMTI1IDUxMS4wODk4NDQgNDEuNTE1NjI1IDUxMS4yMzA0NjkgNDUuNzg1MTU2IEwgNDkzLjY4NzUgMTE0LjA1MDc4MSBMIDM2NC44NjMyODEgMTE0LjA1MDc4MSBDIDM1OS44NjcxODggMTE0LjA1MDc4MSAzNTUuODEyNSAxMTcuNjgzNTk0IDM1NS44MTI1IDEyMi4xNjQwNjMgQyAzNTUuODEyNSAxMjYuNjQ4NDM4IDM1OS44NjcxODggMTMwLjI4NTE1NiAzNjQuODYzMjgxIDEzMC4yODUxNTYgTCA0ODkuNTE1NjI1IDEzMC4yODUxNTYgTCA0NzEuMzcxMDk0IDIwMC44NzUgQyA0NzAuMTk5MjE5IDIwMy4xNzU3ODEgNDY0Ljk0NTMxMyAyMTEuNjYwMTU2IDQ1MS4xNjQwNjMgMjExLjY2MDE1NiBMIDM3OS40MzM1OTQgMjExLjY2MDE1NiBDIDM2NS41MjM0MzggMjExLjY2MDE1NiAzNjAuMzAwNzgxIDIwMy4wMTk1MzEgMzU5LjIzNDM3NSAyMDAuOTE0MDYzIEwgMzUyLjgwNDY4OCAxNzUuOTAyMzQ0IEMgMzUxLjU2MjUgMTcxLjA1NDY4OCAzNDYuNjMyODEzIDE2OC4xMjUgMzQxLjc2OTUzMSAxNjkuMzgyODEzIEMgMzM2LjkyNTc4MSAxNzAuNjI4OTA2IDMzNC4wMDM5MDYgMTc1LjU2NjQwNiAzMzUuMjUgMTgwLjQxNzk2OSBMIDM0MS44Nzg5MDYgMjA2LjE5NTMxMyBMIDM0Mi4yNTM5MDYgMjA3LjMzOTg0NCBDIDM0Mi42MjEwOTQgMjA4LjI1NzgxMyAzNTEuNjYwMTU2IDIyOS43ODkwNjMgMzc5LjQzMzU5NCAyMjkuNzg5MDYzIEwgNDUxLjE2NDA2MyAyMjkuNzg5MDYzIEMgNDc4LjkzNzUgMjI5Ljc4OTA2MyA0ODcuOTcyNjU2IDIwOC4yNTc4MTMgNDg4LjM0NzY1NiAyMDcuMzM5ODQ0IEwgNDg4LjU3MDMxMyAyMDYuNzgxMjUgTCA1MDguMjMwNDY5IDEzMC4yODUxNTYgTCA1MjkuNDcyNjU2IDEzMC4yODUxNTYgQyA1NDcuNDg0Mzc1IDEzMC4yODUxNTYgNTYyLjEzNjcxOSAxMTUuNjMyODEzIDU2Mi4xMzY3MTkgOTcuNjIxMDk0IEwgNTYyLjEzNjcxOSA3NC4zNzg5MDYgQyA1NjIuMTM2NzE5IDU2LjM2NzE4OCA1NDcuNDg0Mzc1IDQxLjcxNDg0NCA1MjkuNDcyNjU2IDQxLjcxNDg0NCBcIi8+XG4gICAgPC9nPlxuICAgIDwvc3ZnPlxuXG48c3R5bGU+PC9zdHlsZT4iLCI8c2NyaXB0PlxuICAgIGV4cG9ydCBsZXQgZmlsbCA9IFwiIzAwMFwiO1xuPC9zY3JpcHQ+XG48c3ZnIHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiBmaWxsPXtmaWxsfSB4PVwiMHB4XCIgeT1cIjBweFwiXG5cdCB2aWV3Qm94PVwiMCAwIDMwLjA1MSAzMC4wNTFcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzAuMDUxIDMwLjA1MTtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuPGc+XG5cdDxwYXRoIGQ9XCJNMTkuOTgyLDE0LjQzOGwtNi4yNC00LjUzNmMtMC4yMjktMC4xNjYtMC41MzMtMC4xOTEtMC43ODQtMC4wNjJjLTAuMjUzLDAuMTI4LTAuNDExLDAuMzg4LTAuNDExLDAuNjY5djkuMDY5XG5cdFx0YzAsMC4yODQsMC4xNTgsMC41NDMsMC40MTEsMC42NzFjMC4xMDcsMC4wNTQsMC4yMjQsMC4wODEsMC4zNDIsMC4wODFjMC4xNTQsMCwwLjMxLTAuMDQ5LDAuNDQyLTAuMTQ2bDYuMjQtNC41MzJcblx0XHRjMC4xOTctMC4xNDUsMC4zMTItMC4zNjksMC4zMTItMC42MDdDMjAuMjk1LDE0LjgwMywyMC4xNzcsMTQuNTgsMTkuOTgyLDE0LjQzOHpcIi8+XG5cdDxwYXRoIGQ9XCJNMTUuMDI2LDAuMDAyQzYuNzI2LDAuMDAyLDAsNi43MjgsMCwxNS4wMjhjMCw4LjI5Nyw2LjcyNiwxNS4wMjEsMTUuMDI2LDE1LjAyMWM4LjI5OCwwLDE1LjAyNS02LjcyNSwxNS4wMjUtMTUuMDIxXG5cdFx0QzMwLjA1Miw2LjcyOCwyMy4zMjQsMC4wMDIsMTUuMDI2LDAuMDAyeiBNMTUuMDI2LDI3LjU0MmMtNi45MTIsMC0xMi41MTYtNS42MDEtMTIuNTE2LTEyLjUxNGMwLTYuOTEsNS42MDQtMTIuNTE4LDEyLjUxNi0xMi41MThcblx0XHRjNi45MTEsMCwxMi41MTQsNS42MDcsMTIuNTE0LDEyLjUxOEMyNy41NDEsMjEuOTQxLDIxLjkzNywyNy41NDIsMTUuMDI2LDI3LjU0MnpcIi8+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG5cdDxnPlxuXHQ8L2c+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48L3N2Zz5cblxuXG48c3R5bGU+PC9zdHlsZT4iLCI8c2NyaXB0PlxuICAgIGV4cG9ydCBsZXQgZmlsbCA9IFwiIzAwMFwiO1xuPC9zY3JpcHQ+XG5cbjxzdmcgaWQ9XCJMYXllcl8xXCIgZmlsbD17ZmlsbH0gZW5hYmxlLWJhY2tncm91bmQ9XCJuZXcgMCAwIDUxMS40NDggNTExLjQ0OFwiIGhlaWdodD1cIjUxMlwiIHZpZXdCb3g9XCIwIDAgNTExLjQ0OCA1MTEuNDQ4XCIgd2lkdGg9XCI1MTJcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+PHBhdGggZD1cIm00MzYuNTA4IDc0Ljk0Yy05OS45MTMtOTkuOTEzLTI2MS42NC05OS45MjgtMzYxLjU2NyAwLTk5LjkxMyA5OS45MTMtOTkuOTI4IDI2MS42NCAwIDM2MS41NjcgOTkuOTEzIDk5LjkxMyAyNjEuNjQgOTkuOTI4IDM2MS41NjcgMCA5OS45MTItOTkuOTEyIDk5LjkyNy0yNjEuNjM5IDAtMzYxLjU2N3ptLTE4MC43ODQgMzk0LjQ1Yy0xMTcuODE2IDAtMjEzLjY2Ny05NS44NTEtMjEzLjY2Ny0yMTMuNjY3czk1Ljg1MS0yMTMuNjY2IDIxMy42NjctMjEzLjY2NiAyMTMuNjY2IDk1Ljg1MSAyMTMuNjY2IDIxMy42NjctOTUuODUgMjEzLjY2Ni0yMTMuNjY2IDIxMy42NjZ6XCIvPjxwYXRoIGQ9XCJtMjk4LjM5IDE2MC4wNTdjLTExLjU5OCAwLTIxIDkuNDAyLTIxIDIxdjE0OS4zMzNjMCAxMS41OTggOS40MDIgMjEgMjEgMjFzMjEtOS40MDIgMjEtMjF2LTE0OS4zMzNjMC0xMS41OTgtOS40MDEtMjEtMjEtMjF6XCIvPjxwYXRoIGQ9XCJtMjEzLjA1NyAxNjAuMDU3Yy0xMS41OTggMC0yMSA5LjQwMi0yMSAyMXYxNDkuMzMzYzAgMTEuNTk4IDkuNDAyIDIxIDIxIDIxczIxLTkuNDAyIDIxLTIxdi0xNDkuMzMzYzAtMTEuNTk4LTkuNDAxLTIxLTIxLTIxelwiLz48L3N2Zz4iLCI8c2NyaXB0PlxuICAgIGV4cG9ydCBsZXQgZmlsbCA9IFwiIzAwMFwiO1xuPC9zY3JpcHQ+XG5cbjxzdmcgZmlsbD17ZmlsbH0gdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcblx0IHZpZXdCb3g9XCIwIDAgNTExLjk5OSA1MTEuOTk5XCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMS45OTkgNTExLjk5OTtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuPGc+XG5cdDxnPlxuXHRcdDxwYXRoIGQ9XCJNMjYyLjc4MSw1Ny44NTNjLTUuMDQzLTIuNTU2LTExLjA5My0yLjA1OC0xNS42NTIsMS4yODRMMTMwLjU5LDE0NC42SDE1Yy04LjI4NSwwLTE1LDYuNzE2LTE1LDE1djE5Mi44MDFcblx0XHRcdGMwLDguMjg0LDYuNzE1LDE1LDE1LDE1aDExNS41OWwxMTYuNTQsODUuNDYxYzIuNjIyLDEuOTI0LDUuNzM3LDIuOTA0LDguODcyLDIuOTA0YzIuMzEyLDAsNC42MzYtMC41MzUsNi43NzktMS42MlxuXHRcdFx0YzUuMDQxLTIuNTU1LDguMjE5LTcuNzI4LDguMjE5LTEzLjM4VjcxLjIzM0MyNzEsNjUuNTgxLDI2Ny44MjIsNjAuNDA4LDI2Mi43ODEsNTcuODUzelwiLz5cblx0PC9nPlxuPC9nPlxuPGc+XG5cdDxnPlxuXHRcdDxwYXRoIGQ9XCJNNDQ1LjkxMiwyNTYuMDA0bDYxLjY5My02MS42OTNjNS44NTktNS44NTcsNS44NTktMTUuMzU1LDAtMjEuMjEzYy01Ljg1Ny01Ljg1Ny0xNS4zNTMtNS44NTctMjEuMjEzLDBsLTYxLjY5Myw2MS42OTNcblx0XHRcdGwtNjEuNjkzLTYxLjY5M2MtNS44NTgtNS44NTctMTUuMzU0LTUuODU3LTIxLjIxMywwYy01Ljg1Nyw1Ljg1Ny01Ljg1NywxNS4zNTUsMCwyMS4yMTNsNjEuNjkzLDYxLjY5M2wtNjEuNjkzLDYxLjY5M1xuXHRcdFx0Yy01Ljg1Nyw1Ljg1Ny01Ljg1NywxNS4zNTUsMCwyMS4yMTNjMi45MywyLjkyOSw2Ljc2OCw0LjM5MywxMC42MDcsNC4zOTNjMy44MzgsMCw3LjY3OC0xLjQ2NSwxMC42MDUtNC4zOTNsNjEuNjkzLTYxLjY5M1xuXHRcdFx0bDYxLjY5Myw2MS42OTNjMi45MywyLjkyOSw2Ljc2OCw0LjM5MywxMC42MDcsNC4zOTNjMy44MzgsMCw3LjY3OC0xLjQ2NSwxMC42MDUtNC4zOTNjNS44NTktNS44NTgsNS44NTktMTUuMzU1LDAtMjEuMjEzXG5cdFx0XHRMNDQ1LjkxMiwyNTYuMDA0elwiLz5cblx0PC9nPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPC9zdmc+IiwiPHNjcmlwdD5cbiAgICBleHBvcnQgbGV0IGZpbGwgPSBcIiMwMDBcIjtcbjwvc2NyaXB0PlxuXG48c3ZnIGZpbGw9e2ZpbGx9IHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiXG5cdCB2aWV3Qm94PVwiMCAwIDQ4MCA0ODBcIiBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDgwIDQ4MDtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuPHBhdGggZD1cIk0yNzguOTQ0LDE3LjU3N2MtNS41NjgtMi42NTYtMTIuMTI4LTEuOTUyLTE2LjkyOCwxLjkyTDEwNi4zNjgsMTQ0LjAwOUgzMmMtMTcuNjMyLDAtMzIsMTQuMzY4LTMyLDMydjEyOFxuXHRjMCwxNy42NjQsMTQuMzY4LDMyLDMyLDMyaDc0LjM2OGwxNTUuNjE2LDEyNC41MTJjMi45MTIsMi4zMDQsNi40NjQsMy40ODgsMTAuMDE2LDMuNDg4YzIuMzY4LDAsNC43MzYtMC41NDQsNi45NDQtMS42XG5cdGM1LjUzNi0yLjY1Niw5LjA1Ni04LjI1Niw5LjA1Ni0xNC40di00MTZDMjg4LDI1Ljg2NSwyODQuNDgsMjAuMjY1LDI3OC45NDQsMTcuNTc3elwiLz5cbjxwYXRoIGQ9XCJNMzY4Ljk5MiwxMjYuODU3Yy02LjMwNC02LjIwOC0xNi40MTYtNi4xMTItMjIuNjI0LDAuMTI4Yy02LjIwOCw2LjMwNC02LjE0NCwxNi40MTYsMC4xMjgsMjIuNjU2XG5cdEMzNzAuNjg4LDE3My41MTMsMzg0LDIwNS42MDksMzg0LDI0MC4wMDlzLTEzLjMxMiw2Ni40OTYtMzcuNTA0LDkwLjM2OGMtNi4yNzIsNi4xNzYtNi4zMzYsMTYuMzItMC4xMjgsMjIuNjI0XG5cdGMzLjEzNiwzLjE2OCw3LjI2NCw0LjczNiwxMS4zNiw0LjczNmM0LjA2NCwwLDguMTI4LTEuNTM2LDExLjI2NC00LjY0QzM5OS4zMjgsMzIzLjI0MSw0MTYsMjgzLjA0OSw0MTYsMjQwLjAwOVxuXHRTMzk5LjMyOCwxNTYuNzc3LDM2OC45OTIsMTI2Ljg1N3pcIi8+XG48cGF0aCBkPVwiTTQxNC4xNDQsODEuNzY5Yy02LjMwNC02LjI0LTE2LjQxNi02LjE3Ni0yMi42NTYsMC4wOTZjLTYuMjA4LDYuMjcyLTYuMTQ0LDE2LjQxNiwwLjA5NiwyMi42MjRcblx0QzQyNy45NjgsMTQwLjU1Myw0NDgsMTg4LjY4MSw0NDgsMjQwLjAwOXMtMjAuMDMyLDk5LjQyNC01Ni40MTYsMTM1LjQ4OGMtNi4yNCw2LjI0LTYuMzA0LDE2LjM4NC0wLjA5NiwyMi42NTZcblx0YzMuMTY4LDMuMTM2LDcuMjY0LDQuNzA0LDExLjM2LDQuNzA0YzQuMDY0LDAsOC4xNi0xLjUzNiwxMS4yOTYtNC42NEM0NTYuNjQsMzU2LjEzNyw0ODAsMjk5Ljk0NSw0ODAsMjQwLjAwOVxuXHRTNDU2LjY0LDEyMy44ODEsNDE0LjE0NCw4MS43Njl6XCIvPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPC9zdmc+XG4iLCI8c2NyaXB0PlxuZXhwb3J0IGxldCBmaWxsID1cIiMwMDBcIjtcbmV4cG9ydCBsZXQgaGVpZ2h0ID0gMjA7XG5leHBvcnQgbGV0IHdpZHRoID0gMjA7XG48L3NjcmlwdD5cbjxzdmcgdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcblx0IHdpZHRoPVwie3dpZHRofXB4XCIgaGVpZ2h0PVwie2hlaWdodH1weFwiIHZpZXdCb3g9XCIwIDAgNDUxLjg0NyA0NTEuODQ3XCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ1MS44NDcgNDUxLjg0NztcIlxuXHQgeG1sOnNwYWNlPVwicHJlc2VydmVcIiBmaWxsPXtmaWxsfT5cbjxnPlxuXHQ8cGF0aCBkPVwiTTIyNS45MjMsMzU0LjcwNmMtOC4wOTgsMC0xNi4xOTUtMy4wOTItMjIuMzY5LTkuMjYzTDkuMjcsMTUxLjE1N2MtMTIuMzU5LTEyLjM1OS0xMi4zNTktMzIuMzk3LDAtNDQuNzUxXG5cdFx0YzEyLjM1NC0xMi4zNTQsMzIuMzg4LTEyLjM1NCw0NC43NDgsMGwxNzEuOTA1LDE3MS45MTVsMTcxLjkwNi0xNzEuOTA5YzEyLjM1OS0xMi4zNTQsMzIuMzkxLTEyLjM1NCw0NC43NDQsMFxuXHRcdGMxMi4zNjUsMTIuMzU0LDEyLjM2NSwzMi4zOTIsMCw0NC43NTFMMjQ4LjI5MiwzNDUuNDQ5QzI0Mi4xMTUsMzUxLjYyMSwyMzQuMDE4LDM1NC43MDYsMjI1LjkyMywzNTQuNzA2elwiLz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjwvc3ZnPlxuXG48c3R5bGU+PC9zdHlsZT4iLCI8c2NyaXB0PlxuICAgIGltcG9ydCBCdXR0b24gZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvQnV0dG9uLnN2ZWx0ZVwiO1xuICAgIGltcG9ydCBSb3VuZEJ1dHRvbiBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9Sb3VuZEJ1dHRvbi5zdmVsdGVcIjtcblxuICAgIGltcG9ydCBNaXRhZERvYmxlSWNvbiBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9zdmdfaWNvbnMvTWl0YWREb2JsZUljb24uc3ZlbHRlXCI7XG4gICAgaW1wb3J0IFBsYXlJY29uIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL3N2Z19pY29ucy9QbGF5SWNvbi5zdmVsdGVcIjtcbiAgICBpbXBvcnQgUGF1c2VJY29uIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL3N2Z19pY29ucy9QYXVzZUljb24uc3ZlbHRlXCI7XG4gICAgaW1wb3J0IE11dGVJY29uIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL3N2Z19pY29ucy9NdXRlSWNvbi5zdmVsdGVcIjtcbiAgICBpbXBvcnQgVm9sdW1lSWNvbiBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9zdmdfaWNvbnMvVm9sdW1lSWNvbi5zdmVsdGVcIjtcbiAgICBpbXBvcnQgQXJyb3dEb3duIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL3N2Z19pY29ucy9BcnJvd0Rvd24uc3ZlbHRlXCI7XG5cblxuICAgIGV4cG9ydCBsZXQgdmlkZW9TcmMgPSBudWxsO1xuICAgIGV4cG9ydCBsZXQgYmFja2Ryb3BDb2xvciA9IFwidHJhbnNwYXJlbnRcIjtcbiAgICBleHBvcnQgbGV0IGxvb3AgPSB0cnVlO1xuICAgIGV4cG9ydCBsZXQgb25TZWVNb3JlPSBudWxsO1xuXG4gICAgY29uc3QgaWNvblNpemUgPSB7d2lkdGg6IDgwLCBoZWlnaHQ6IDgwfTtcblxuICAgIGxldCBwYXVzZWQgPSB0cnVlO1xuICAgIGxldCBtdXRlZCA9IHRydWU7XG4gICAgbGV0IGxvZ29XaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICogMC41NTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVBsYXlQYXVzZUJ1dHRvbigpe1xuICAgICAgICBwYXVzZWQgPSAhcGF1c2VkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZU11dGVCdXR0b24oKXtcbiAgICAgICAgbXV0ZWQgPSAhbXV0ZWQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlU2VlTW9yZSgpe1xuICAgICAgICBpZihvblNlZU1vcmUpIG9uU2VlTW9yZSgpO1xuICAgIH1cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpPT57XG4gICAgICAgIGxvZ29XaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICogMC44O1xuICAgICAgICBpZihsb2dvV2lkdGggPiAxMTAwKSBsb2dvV2lkdGggPSA5MDA7XG4gICAgfSlcbjwvc2NyaXB0PlxuXG5cbjxkaXYgY2xhc3M9XCJjb250YWluZXItZWxlbWVudFwiPlxuICAgIDxkaXYgY2xhc3M9XCJidXR0b24tY29udGFpbmVyXCI+XG4gICAgICAgIDxSb3VuZEJ1dHRvblxuICAgICAgICBzaXplPXtpY29uU2l6ZX1cbiAgICAgICAgYmFja2dyb3VuZENvbG9yPVwidHJhbnNwYXJlbnRcIlxuICAgICAgICBvbjpjbGljaz17aGFuZGxlUGxheVBhdXNlQnV0dG9ufVxuICAgICAgICA+XG4gICAgICAgICAgICB7I2lmIHBhdXNlZH0gPFBhdXNlSWNvbiBmaWxsPVwiI2ZmZlwiLz4gezplbHNlfSA8UGxheUljb24gZmlsbD1cIiNmZmZcIi8+IHsvaWZ9XG4gICAgICAgIDwvUm91bmRCdXR0b24+XG4gICAgICAgIDxSb3VuZEJ1dHRvblxuICAgICAgICBzaXplPXtpY29uU2l6ZX1cbiAgICAgICAgYmFja2dyb3VuZENvbG9yPVwidHJhbnNwYXJlbnRcIlxuICAgICAgICBvbjpjbGljaz17aGFuZGxlTXV0ZUJ1dHRvbn1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyNpZiBtdXRlZH0gPE11dGVJY29uIGZpbGw9XCIjZmZmXCIvPiB7OmVsc2V9IDxWb2x1bWVJY29uIGZpbGw9XCIjZmZmXCIvPiB7L2lmfVxuICAgICAgICA8L1JvdW5kQnV0dG9uPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJiYWNrZHJvcFwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjoge2JhY2tkcm9wQ29sb3J9O1wiPjwvZGl2PlxuICAgIDxNaXRhZERvYmxlSWNvbiBib3JkZXJDb2xvcj1cIiNmZmZcIiB3aWR0aD17bG9nb1dpZHRofS8+XG5cbiAgICA8dmlkZW9cbiAgICBzcmM9e3ZpZGVvU3JjfVxuICAgIGJpbmQ6cGF1c2VkXG4gICAgYmluZDptdXRlZFxuICAgIGxvb3A9e2xvb3B9XG4gICAgYXV0b3BsYXlcbiAgICA+XG4gICAgICAgIDx0cmFjayBraW5kPVwiY2FwdGlvbnNcIj5cbiAgICA8L3ZpZGVvPlxuICAgIDxkaXYgaWQ9XCJzZWUtbW9yZVwiIGNsYXNzPVwiYm91bmNlLWFuaW1hdGlvblwiIG9uOmNsaWNrPXtoYW5kbGVTZWVNb3JlfT5cbiAgICAgICAgPEJ1dHRvbiB0ZXh0PVwiVmVyIG3DoXNcIiBiYWNrZ3JvdW5kQ29sb3I9XCJ0cmFuc3BhcmVudFwiIGJvcmRlckNvbG9yPVwid2hpdGVcIj48L0J1dHRvbj5cbiAgICAgICAgPGRpdiBzdHlsZT1cImhlaWdodDoxMHB4O1wiPjwvZGl2PlxuICAgICAgICA8QXJyb3dEb3duIGZpbGw9XCIjZmZmXCIvPlxuICAgIDwvZGl2PlxuPC9kaXY+XG5cblxuXG48c3R5bGU+XG4gICAgLmNvbnRhaW5lci1lbGVtZW50e1xuICAgICAgICB3aWR0aDogMTAwdnc7XG4gICAgICAgIGhlaWdodDogMTAwdmg7XG4gICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG5cbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgfVxuICAgICNzZWUtbW9yZXtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGhlaWdodDogMjB2aDtcbiAgICB9XG4gICAgLmJ1dHRvbi1jb250YWluZXJ7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgdG9wOiAxNXB4O1xuICAgICAgICBsZWZ0OiAxNXB4O1xuICAgICAgICBnYXA6IDEwcHg7XG4gICAgfVxuICAgIHZpZGVve1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIG9iamVjdC1maXQ6IGNvdmVyO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICB6LWluZGV4OiAtMjtcbiAgICAgICAgXG4gICAgfVxuICAgIC5iYWNrZHJvcHtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgb3BhY2l0eTogMC40OyBcbiAgICAgICAgIHotaW5kZXg6IC0xOyBcbiAgICAgICAgIHdpZHRoOiAxMDB2dzsgXG4gICAgICAgICBoZWlnaHQ6IDEwMHZoO1xuICAgIH1cblxuPC9zdHlsZT4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0T3JpZ2luYWxCb2R5UGFkZGluZygpIHtcbiAgY29uc3Qgc3R5bGUgPSB3aW5kb3cgPyB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5LCBudWxsKSA6IHt9O1xuXG4gIHJldHVybiBwYXJzZUludCgoc3R5bGUgJiYgc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpKSB8fCAwLCAxMCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY3JvbGxiYXJXaWR0aCgpIHtcbiAgbGV0IHNjcm9sbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAvLyAubW9kYWwtc2Nyb2xsYmFyLW1lYXN1cmUgc3R5bGVzIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL3Y0LjAuMC1hbHBoYS40L3Njc3MvX21vZGFsLnNjc3MjTDEwNi1MMTEzXG4gIHNjcm9sbERpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIHNjcm9sbERpdi5zdHlsZS50b3AgPSAnLTk5OTlweCc7XG4gIHNjcm9sbERpdi5zdHlsZS53aWR0aCA9ICc1MHB4JztcbiAgc2Nyb2xsRGl2LnN0eWxlLmhlaWdodCA9ICc1MHB4JztcbiAgc2Nyb2xsRGl2LnN0eWxlLm92ZXJmbG93ID0gJ3Njcm9sbCc7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2Nyb2xsRGl2KTtcbiAgY29uc3Qgc2Nyb2xsYmFyV2lkdGggPSBzY3JvbGxEaXYub2Zmc2V0V2lkdGggLSBzY3JvbGxEaXYuY2xpZW50V2lkdGg7XG4gIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoc2Nyb2xsRGl2KTtcbiAgcmV0dXJuIHNjcm9sbGJhcldpZHRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2Nyb2xsYmFyV2lkdGgocGFkZGluZykge1xuICBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9IHBhZGRpbmcgPiAwID8gYCR7cGFkZGluZ31weGAgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCb2R5T3ZlcmZsb3dpbmcoKSB7XG4gIHJldHVybiB3aW5kb3cgPyBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoIDwgd2luZG93LmlubmVyV2lkdGggOiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIGNvbnN0IHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25kaXRpb25hbGx5VXBkYXRlU2Nyb2xsYmFyKCkge1xuICBjb25zdCBzY3JvbGxiYXJXaWR0aCA9IGdldFNjcm9sbGJhcldpZHRoKCk7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL3Y0LjAuMC1hbHBoYS42L2pzL3NyYy9tb2RhbC5qcyNMNDMzXG4gIGNvbnN0IGZpeGVkQ29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgJy5maXhlZC10b3AsIC5maXhlZC1ib3R0b20sIC5pcy1maXhlZCwgLnN0aWNreS10b3AnXG4gIClbMF07XG4gIGNvbnN0IGJvZHlQYWRkaW5nID0gZml4ZWRDb250ZW50XG4gICAgPyBwYXJzZUludChmaXhlZENvbnRlbnQuc3R5bGUucGFkZGluZ1JpZ2h0IHx8IDAsIDEwKVxuICAgIDogMDtcblxuICBpZiAoaXNCb2R5T3ZlcmZsb3dpbmcoKSkge1xuICAgIHNldFNjcm9sbGJhcldpZHRoKGJvZHlQYWRkaW5nICsgc2Nyb2xsYmFyV2lkdGgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2x1bW5TaXplQ2xhc3MoaXNYcywgY29sV2lkdGgsIGNvbFNpemUpIHtcbiAgaWYgKGNvbFNpemUgPT09IHRydWUgfHwgY29sU2l6ZSA9PT0gJycpIHtcbiAgICByZXR1cm4gaXNYcyA/ICdjb2wnIDogYGNvbC0ke2NvbFdpZHRofWA7XG4gIH0gZWxzZSBpZiAoY29sU2l6ZSA9PT0gJ2F1dG8nKSB7XG4gICAgcmV0dXJuIGlzWHMgPyAnY29sLWF1dG8nIDogYGNvbC0ke2NvbFdpZHRofS1hdXRvYDtcbiAgfVxuXG4gIHJldHVybiBpc1hzID8gYGNvbC0ke2NvbFNpemV9YCA6IGBjb2wtJHtjb2xXaWR0aH0tJHtjb2xTaXplfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBicm93c2VyRXZlbnQodGFyZ2V0LCAuLi5hcmdzKSB7XG4gIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKC4uLmFyZ3MpO1xuXG4gIHJldHVybiAoKSA9PiB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lciguLi5hcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5ld0Nhcm91c2VsQWN0aXZlSW5kZXgoZGlyZWN0aW9uLCBpdGVtcywgYWN0aXZlSW5kZXgpIHtcbiAgaWYgKGRpcmVjdGlvbiA9PT0gJ3ByZXYnKSB7XG4gICAgcmV0dXJuIGFjdGl2ZUluZGV4ID09PSAwID8gaXRlbXMubGVuZ3RoIC0gMSA6IGFjdGl2ZUluZGV4IC0gMTtcbiAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICduZXh0Jykge1xuICAgIHJldHVybiBhY3RpdmVJbmRleCA9PT0gaXRlbXMubGVuZ3RoIC0gMSA/IDAgOiBhY3RpdmVJbmRleCArIDE7XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9DbGFzc05hbWUodmFsdWUpIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICByZXN1bHQgKz0gdmFsdWU7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgcmVzdWx0ID0gdmFsdWUubWFwKHRvQ2xhc3NOYW1lKS5maWx0ZXIoQm9vbGVhbikuam9pbignICcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gdmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlW2tleV0pIHtcbiAgICAgICAgICByZXN1bHQgJiYgKHJlc3VsdCArPSAnICcpO1xuICAgICAgICAgIHJlc3VsdCArPSBrZXk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjbGFzc25hbWVzKC4uLmFyZ3MpIHtcbiAgcmV0dXJuIGFyZ3MubWFwKHRvQ2xhc3NOYW1lKS5maWx0ZXIoQm9vbGVhbikuam9pbignICcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNpdGlvbkR1cmF0aW9uKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50KSByZXR1cm4gMDtcblxuICAvLyBHZXQgdHJhbnNpdGlvbi1kdXJhdGlvbiBvZiB0aGUgZWxlbWVudFxuICBsZXQgeyB0cmFuc2l0aW9uRHVyYXRpb24sIHRyYW5zaXRpb25EZWxheSB9ID1cbiAgICB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcblxuICBjb25zdCBmbG9hdFRyYW5zaXRpb25EdXJhdGlvbiA9IE51bWJlci5wYXJzZUZsb2F0KHRyYW5zaXRpb25EdXJhdGlvbik7XG4gIGNvbnN0IGZsb2F0VHJhbnNpdGlvbkRlbGF5ID0gTnVtYmVyLnBhcnNlRmxvYXQodHJhbnNpdGlvbkRlbGF5KTtcblxuICAvLyBSZXR1cm4gMCBpZiBlbGVtZW50IG9yIHRyYW5zaXRpb24gZHVyYXRpb24gaXMgbm90IGZvdW5kXG4gIGlmICghZmxvYXRUcmFuc2l0aW9uRHVyYXRpb24gJiYgIWZsb2F0VHJhbnNpdGlvbkRlbGF5KSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBJZiBtdWx0aXBsZSBkdXJhdGlvbnMgYXJlIGRlZmluZWQsIHRha2UgdGhlIGZpcnN0XG4gIHRyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbi5zcGxpdCgnLCcpWzBdO1xuICB0cmFuc2l0aW9uRGVsYXkgPSB0cmFuc2l0aW9uRGVsYXkuc3BsaXQoJywnKVswXTtcblxuICByZXR1cm4gKFxuICAgIChOdW1iZXIucGFyc2VGbG9hdCh0cmFuc2l0aW9uRHVyYXRpb24pICtcbiAgICAgIE51bWJlci5wYXJzZUZsb2F0KHRyYW5zaXRpb25EZWxheSkpICpcbiAgICAxMDAwXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1dWlkKCkge1xuICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCAoYykgPT4ge1xuICAgIGNvbnN0IHIgPSAoTWF0aC5yYW5kb20oKSAqIDE2KSB8IDA7XG4gICAgY29uc3QgdiA9IGMgPT0gJ3gnID8gciA6IChyICYgMHgzKSB8IDB4ODtcbiAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gIH0pO1xufVxuIiwiPHNjcmlwdD5cbiAgaW1wb3J0IHsgZ2V0Q29sdW1uU2l6ZUNsYXNzLCBpc09iamVjdCB9IGZyb20gJy4vdXRpbHMnO1xuXG4gIGxldCBjbGFzc05hbWUgPSAnJztcbiAgZXhwb3J0IHsgY2xhc3NOYW1lIGFzIGNsYXNzIH07XG4gIGV4cG9ydCBsZXQgeHMgPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgc20gPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgbWQgPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgbGcgPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgeGwgPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgeHhsID0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IGNvbENsYXNzZXMgPSBbXTtcbiAgY29uc3QgbG9va3VwID0ge1xuICAgIHhzLFxuICAgIHNtLFxuICAgIG1kLFxuICAgIGxnLFxuICAgIHhsLFxuICAgIHh4bFxuICB9O1xuXG4gIE9iamVjdC5rZXlzKGxvb2t1cCkuZm9yRWFjaCgoY29sV2lkdGgpID0+IHtcbiAgICBjb25zdCBjb2x1bW5Qcm9wID0gbG9va3VwW2NvbFdpZHRoXTtcbiAgICBpZiAoIWNvbHVtblByb3AgJiYgY29sdW1uUHJvcCAhPT0gJycpIHtcbiAgICAgIHJldHVybjsgLy9ubyB2YWx1ZSBmb3IgdGhpcyB3aWR0aFxuICAgIH1cblxuICAgIGNvbnN0IGlzWHMgPSBjb2xXaWR0aCA9PT0gJ3hzJztcblxuICAgIGlmIChpc09iamVjdChjb2x1bW5Qcm9wKSkge1xuICAgICAgY29uc3QgY29sU2l6ZUludGVyZml4ID0gaXNYcyA/ICctJyA6IGAtJHtjb2xXaWR0aH0tYDtcbiAgICAgIGNvbnN0IGNvbENsYXNzID0gZ2V0Q29sdW1uU2l6ZUNsYXNzKGlzWHMsIGNvbFdpZHRoLCBjb2x1bW5Qcm9wLnNpemUpO1xuXG4gICAgICBpZiAoY29sdW1uUHJvcC5zaXplIHx8IGNvbHVtblByb3Auc2l6ZSA9PT0gJycpIHtcbiAgICAgICAgY29sQ2xhc3Nlcy5wdXNoKGNvbENsYXNzKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb2x1bW5Qcm9wLnB1c2gpIHtcbiAgICAgICAgY29sQ2xhc3Nlcy5wdXNoKGBwdXNoJHtjb2xTaXplSW50ZXJmaXh9JHtjb2x1bW5Qcm9wLnB1c2h9YCk7XG4gICAgICB9XG4gICAgICBpZiAoY29sdW1uUHJvcC5wdWxsKSB7XG4gICAgICAgIGNvbENsYXNzZXMucHVzaChgcHVsbCR7Y29sU2l6ZUludGVyZml4fSR7Y29sdW1uUHJvcC5wdWxsfWApO1xuICAgICAgfVxuICAgICAgaWYgKGNvbHVtblByb3Aub2Zmc2V0KSB7XG4gICAgICAgIGNvbENsYXNzZXMucHVzaChgb2Zmc2V0JHtjb2xTaXplSW50ZXJmaXh9JHtjb2x1bW5Qcm9wLm9mZnNldH1gKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29sQ2xhc3Nlcy5wdXNoKGdldENvbHVtblNpemVDbGFzcyhpc1hzLCBjb2xXaWR0aCwgY29sdW1uUHJvcCkpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKCFjb2xDbGFzc2VzLmxlbmd0aCkge1xuICAgIGNvbENsYXNzZXMucHVzaCgnY29sJyk7XG4gIH1cblxuICBpZiAoY2xhc3NOYW1lKSB7XG4gICAgY29sQ2xhc3Nlcy5wdXNoKGNsYXNzTmFtZSk7XG4gIH1cbjwvc2NyaXB0PlxuXG48ZGl2IHsuLi4kJHJlc3RQcm9wc30gY2xhc3M9e2NvbENsYXNzZXMuam9pbignICcpfT5cbiAgPHNsb3QgLz5cbjwvZGl2PlxuIiwiPHNjcmlwdD5cbiAgaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnLi91dGlscyc7XG5cbiAgbGV0IGNsYXNzTmFtZSA9ICcnO1xuICBleHBvcnQgeyBjbGFzc05hbWUgYXMgY2xhc3MgfTtcbiAgZXhwb3J0IGxldCBzbSA9IHVuZGVmaW5lZDtcbiAgZXhwb3J0IGxldCBtZCA9IHVuZGVmaW5lZDtcbiAgZXhwb3J0IGxldCBsZyA9IHVuZGVmaW5lZDtcbiAgZXhwb3J0IGxldCB4bCA9IHVuZGVmaW5lZDtcbiAgZXhwb3J0IGxldCB4eGwgPSB1bmRlZmluZWQ7XG4gIGV4cG9ydCBsZXQgZmx1aWQgPSBmYWxzZTtcblxuICAkOiBjbGFzc2VzID0gY2xhc3NuYW1lcyhjbGFzc05hbWUsIHtcbiAgICAnY29udGFpbmVyLXNtJzogc20sXG4gICAgJ2NvbnRhaW5lci1tZCc6IG1kLFxuICAgICdjb250YWluZXItbGcnOiBsZyxcbiAgICAnY29udGFpbmVyLXhsJzogeGwsXG4gICAgJ2NvbnRhaW5lci14eGwnOiB4eGwsXG4gICAgJ2NvbnRhaW5lci1mbHVpZCc6IGZsdWlkLFxuICAgIGNvbnRhaW5lcjogIXNtICYmICFtZCAmJiAhbGcgJiYgIXhsICYmICF4eGwgJiYgIWZsdWlkXG4gIH0pO1xuPC9zY3JpcHQ+XG5cbjxkaXYgey4uLiQkcmVzdFByb3BzfSBjbGFzcz17Y2xhc3Nlc30+XG4gIDxzbG90IC8+XG48L2Rpdj5cbiIsIjxzY3JpcHQ+XG4gIGltcG9ydCBjbGFzc25hbWVzIGZyb20gJy4vdXRpbHMnO1xuXG4gIGxldCBjbGFzc05hbWUgPSAnJztcbiAgZXhwb3J0IHsgY2xhc3NOYW1lIGFzIGNsYXNzIH07XG4gIGV4cG9ydCBsZXQgbmFtZSA9ICcnO1xuXG4gICQ6IGNsYXNzZXMgPSBjbGFzc25hbWVzKGNsYXNzTmFtZSwgYGJpLSR7bmFtZX1gKTtcbjwvc2NyaXB0PlxuXG48aSB7Li4uJCRyZXN0UHJvcHN9IGNsYXNzPXtjbGFzc2VzfSAvPlxuIiwiPHNjcmlwdD5cbiAgaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnLi91dGlscyc7XG5cbiAgbGV0IGNsYXNzTmFtZSA9ICcnO1xuICBleHBvcnQgeyBjbGFzc05hbWUgYXMgY2xhc3MgfTtcbiAgZXhwb3J0IGxldCBub0d1dHRlcnMgPSBmYWxzZTtcbiAgZXhwb3J0IGxldCBmb3JtID0gZmFsc2U7XG4gIGV4cG9ydCBsZXQgY29scyA9IDA7XG5cbiAgZnVuY3Rpb24gZ2V0Q29scyhjb2xzKSB7XG4gICAgY29uc3QgY29sc1ZhbHVlID0gcGFyc2VJbnQoY29scyk7XG4gICAgaWYgKCFpc05hTihjb2xzVmFsdWUpKSB7XG4gICAgICBpZiAoY29sc1ZhbHVlID4gMCkge1xuICAgICAgICByZXR1cm4gW2Byb3ctY29scy0ke2NvbHNWYWx1ZX1gXTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb2xzID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIFsneHMnLCAnc20nLCAnbWQnLCAnbGcnLCAneGwnXVxuICAgICAgICAubWFwKChjb2xXaWR0aCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGlzWHMgPSBjb2xXaWR0aCA9PT0gJ3hzJztcbiAgICAgICAgICBjb25zdCBjb2xTaXplSW50ZXJmaXggPSBpc1hzID8gJy0nIDogYC0ke2NvbFdpZHRofS1gO1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gY29sc1tjb2xXaWR0aF07XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgdmFsdWUgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gYHJvdy1jb2xzJHtjb2xTaXplSW50ZXJmaXh9JHt2YWx1ZX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSlcbiAgICAgICAgLmZpbHRlcigodmFsdWUpID0+ICEhdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICAkOiBjbGFzc2VzID0gY2xhc3NuYW1lcyhcbiAgICBjbGFzc05hbWUsXG4gICAgbm9HdXR0ZXJzID8gJ2d4LTAnIDogbnVsbCxcbiAgICBmb3JtID8gJ2Zvcm0tcm93JyA6ICdyb3cnLFxuICAgIC4uLmdldENvbHMoY29scylcbiAgKTtcbjwvc2NyaXB0PlxuXG48ZGl2IHsuLi4kJHJlc3RQcm9wc30gY2xhc3M9e2NsYXNzZXN9PlxuICA8c2xvdCAvPlxuPC9kaXY+XG4iLCI8c2NyaXB0PlxuICAgIGltcG9ydCB7Y3JlYXRlRXZlbnREaXNwYXRjaGVyfSBmcm9tIFwic3ZlbHRlXCI7XG4gICAgZXhwb3J0IGxldCB0aXRsZSA9IFwiXCI7XG4gICAgZXhwb3J0IGxldCBjYXRlZ29yeSA9IFwiXCI7XG4gICAgZXhwb3J0IGxldCBpbWdTcmMgPSBcIlwiO1xuICAgIGV4cG9ydCBsZXQgd2lkdGggPSA2NTA7XG5cbiAgICAkOiBoZWlnaHQgPSB3aWR0aCAqIDE2LzkgO1xuXG4gICAgY29uc3QgZGlzcGF0Y2ggPSBjcmVhdGVFdmVudERpc3BhdGNoZXIoKTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZUNsaWNrKCl7XG4gICAgICAgIGRpc3BhdGNoKFwiY2xpY2tcIik7XG4gICAgfVxuXG48L3NjcmlwdD5cbjxkaXYgY2xhc3M9XCJjb250YWluZXItZWxlbWVudFwiID5cbiAgICA8ZGl2IFxuICAgICAgICBjbGFzcz1cImNhcmQtY29tcG9uZW50XCIgXG4gICAgICAgIG9uOmNsaWNrPXtoYW5kbGVDbGlja30+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2F0ZWdvcnktYm94XCIgPjxwPntjYXRlZ29yeS50b1VwcGVyQ2FzZSgpfTwvcD48L2Rpdj5cbiAgICAgICAgICAgIDxpbWcgc3JjPXtpbWdTcmN9IGFsdD1cIlwiPlxuICAgIDwvZGl2PlxuICAgIDxoMSBjbGFzcz1cInRpdGxlXCI+e3RpdGxlLnRvVXBwZXJDYXNlKCl9PC9oMT5cbjwvZGl2PlxuXG48c3R5bGU+XG4gICAgaDF7XG4gICAgICAgIGZvbnQtc2l6ZTogY2FsYygxMnB4ICsgMS41dncpO1xuICAgIH1cbiAgICAuY29udGFpbmVyLWVsZW1lbnR7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGNvbG9yOiAjNDE0MDQyO1xuXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgICAgICBib3JkZXItcmFkaXVzOiAxMHB4O1xuICAgICAgICBwYWRkaW5nLXRvcDogMTBweDtcblxuICAgICAgICBtYXgtaGVpZ2h0OiA2MHZoO1xuICAgICAgICBtYXgtd2lkdGg6IDg1dnc7XG4gICAgfVxuICAgIGltZ3tcbiAgICAgICAgb2JqZWN0LWZpdDogY292ZXI7XG4gICAgfVxuICAgIC5jYXJkLWNvbXBvbmVudHtcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjI0LCAyMjQsIDIyNCk7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICB0cmFuc2l0aW9uOiAyMDBtcyBlYXNlLWluLW91dDtcbiAgICB9XG4gICAgLmNhcmQtY29tcG9uZW50OmhvdmVye1xuICAgICAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KDJweCAycHggNXB4IHJnYigwIDAgMCAvIDAuNSkpO1xuICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMDUsMS4wNSk7XG4gICAgfVxuICAgIC5jYXJkLWNvbXBvbmVudDphY3RpdmV7XG4gICAgICAgIGZpbHRlcjogYnJpZ2h0bmVzcygwLjg1KTtcbiAgICB9XG4gICAgLmNhdGVnb3J5LWJveHtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICBmb250LXNpemU6IGNhbGMoOHB4ICsgMC4zdncpO1xuICAgICAgICByaWdodDogNXB4O1xuICAgICAgICB0b3A6IDVweDtcbiAgICAgICAgcGFkZGluZy1yaWdodDogMTBweDtcbiAgICAgICAgcGFkZGluZy1sZWZ0OiAxMHB4O1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTkzLDE0Nyw5NCk7XG4gICAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNTBweDtcbiAgICB9XG48L3N0eWxlPiIsIjxzY3JpcHQ+XG4gICAgaW1wb3J0IHtvbk1vdW50fSBmcm9tIFwic3ZlbHRlXCI7XG4gICAgaW1wb3J0IHtDb2wsIFJvd30gZnJvbSBcInN2ZWx0ZXN0cmFwXCI7XG4gICAgaW1wb3J0IFZpZGVvQ2FyZCBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9WaWRlb0NhcmQuc3ZlbHRlXCI7XG4gICAgaW1wb3J0IEJ1dHRvbiBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9CdXR0b24uc3ZlbHRlXCI7XG4gICAgXG5cbiAgICBleHBvcnQgbGV0IGRpZFRhcFNlZU1vcmU7XG5cbiAgICBjb25zdCBkYXRhID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICB0aXRsZTogXCJCYWlsZSB3YXBvXCIsXG4gICAgICAgICAgICBjYXRlZ29yeTogXCJCYWlsZVwiLFxuICAgICAgICAgICAgaW1nU3JjOiBcIi4vYXNzZXRzL3BpY3R1cmVzL3BlcmZpbF9tYXJjb3MucG5nXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkJhaWxlIGNyZW1hXCIsXG4gICAgICAgICAgICBjYXRlZ29yeTogXCJCYWlsZVwiLFxuICAgICAgICAgICAgaW1nU3JjOiBcIi4vYXNzZXRzL3BpY3R1cmVzL3BlcmZpbF9tYXJjb3MucG5nXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRpdGxlOiBcIkJhaWxlIGNyZW1pc2ltYVwiLFxuICAgICAgICAgICAgY2F0ZWdvcnk6IFwiQmFpbGVcIixcbiAgICAgICAgICAgIGltZ1NyYzogXCIuL2Fzc2V0cy9waWN0dXJlcy9wZXJmaWxfbWFyY29zLnBuZ1wiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICB0aXRsZTogXCJCYWlsZSBub3JtYWxpdG9cIixcbiAgICAgICAgICAgIGNhdGVnb3J5OiBcIkJhaWxlXCIsXG4gICAgICAgICAgICBpbWdTcmM6IFwiLi9hc3NldHMvcGljdHVyZXMvcGVyZmlsX21hcmNvcy5wbmdcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgdGl0bGU6IFwiQmFpbGUgcmVndWxlcm9cIixcbiAgICAgICAgICAgIGNhdGVnb3J5OiBcIkJhaWxlXCIsXG4gICAgICAgICAgICBpbWdTcmM6IFwiLi9hc3NldHMvcGljdHVyZXMvcGVyZmlsX21hcmNvcy5wbmdcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgdGl0bGU6IFwiQmFpbGUgcHJvXCIsXG4gICAgICAgICAgICBjYXRlZ29yeTogXCJCYWlsZVwiLFxuICAgICAgICAgICAgaW1nU3JjOiBcIi4vYXNzZXRzL3BpY3R1cmVzL3BlcmZpbF9tYXJjb3MucG5nXCIsXG4gICAgICAgIH0sXG4gICAgXVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlU2VlTW9yZSgpe1xuICAgICAgICBpZihkaWRUYXBTZWVNb3JlKSBkaWRUYXBTZWVNb3JlKCk7XG4gICAgfVxuXG5cbjwvc2NyaXB0PlxuPGRpdiBjbGFzcz1cImJhY2tncm91bmQtaW1hZ2VcIj5cbiAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyLWVsZW1lbnRcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImhlYWRlci1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXItc2Vjb25kLWxheWVyXCI+PC9kaXY+XG4gICAgICAgICAgICA8aDEgY2xhc3M9XCJoZWFkZXJcIj5BbGd1bm9zIGRlIG51ZXN0cm9zIMO6bHRpbW9zIHByb3llY3Rvcy4uLjwvaDE+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICAgICAgPFJvdyBjb2xzPXt7bGc6MywgbWQ6Miwgc206MX19PlxuICAgICAgICAgICAgeyNlYWNoIGRhdGEgYXMge3RpdGxlLCBjYXRlZ29yeSwgaW1nU3JjfX1cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9XCJwYWRkaW5nOiAxMHB4O1wiPlxuICAgICAgICAgICAgICAgIDxDb2w+XG4gICAgICAgICAgICAgICAgICAgIDxWaWRlb0NhcmQgXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk9e2NhdGVnb3J5fVxuICAgICAgICAgICAgICAgICAgICBpbWdTcmM9e2ltZ1NyY31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0NvbD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgey9lYWNofVxuICAgICAgICA8L1Jvdz5cbiAgICAgICAgPGRpdiBzdHlsZT1cImhlaWdodDoyMHB4O1wiPjwvZGl2PlxuICAgICAgICA8IS0tIDxoMj7Cv1F1aWVyZXMgdmVyIGHDum4gbcOhcz88L2gyPiAtLT5cbiAgICAgICAgPGRpdiBpZD1cInNlZS1tb3JlXCIgY2xhc3M9XCJib3VuY2UtYW5pbWF0aW9uXCI+PEJ1dHRvbiBvbjpjbGljaz17aGFuZGxlU2VlTW9yZX0gdGV4dD1cIlZlciB0b2Rvc1wiLz48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PlxuICAgIFxuPHN0eWxlPlxuICAgIC5iYWNrZ3JvdW5kLWltYWdle1xuICAgICAgICB3aWR0aDoxMDB2dztcblxuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIuLi9hc3NldHMvcGljdHVyZXMvY2luZW1hdG9ncmFwaGVyLmpwZWdcIik7XG4gICAgICAgIGJhY2tncm91bmQtYXR0YWNobWVudDogZml4ZWQ7XG4gICAgICAgIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XG4gICAgICAgIGRpc3BsYXk6ZmxleDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgfVxuICAgIC5jb250YWluZXItZWxlbWVudHtcblxuICAgICAgICBwYWRkaW5nLXJpZ2h0OiAyMHB4O1xuICAgICAgICBwYWRkaW5nLWxlZnQ6IDIwcHg7XG4gICAgICAgIHBhZGRpbmctdG9wOiAzMHB4O1xuICAgICAgICBcbiAgICAgICAgZGlzcGxheTpmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjpjb2x1bW47XG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuXG4gICAgICAgIC8qIHRoaXMgaXMgbWF4IGNhcmQgd2lkdGggKiAzICovXG4gICAgICAgIG1heC13aWR0aDogMTIwMHB4OyBcblxuICAgICAgICBjb2xvcjogd2hpdGU7XG4gICAgfVxuICAgIC5oZWFkZXItY29udGFpbmVye1xuICAgICAgICBwb3NpdGlvbjpyZWxhdGl2ZTtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDE5MywxNDcsOTQpO1xuICAgICAgICB3aWR0aDo5MHZ3O1xuICAgICAgICBoZWlnaHQ6IDEwMHB4O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAzMHB4O1xuICAgIH1cbiAgICAuaGVhZGVyLXNlY29uZC1sYXllcntcbiAgICAgICAgcG9zaXRpb246YWJzb2x1dGU7XG4gICAgICAgIHdpZHRoOjkzdnc7XG4gICAgICAgIGhlaWdodDogOTJweDtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQxNDA0MjtcbiAgICAgICAgdHJhbnNmb3JtOiBza2V3KDFkZWcsIDFkZWcpIHRyYW5zbGF0ZVgoLTIwcHgpO1xuICAgICAgICBcbiAgICB9XG4gICAgLmhlYWRlcntcbiAgICAgICAgLyogY29sb3I6cmdiKDU3LDU2LDU4KTsgKi9cbiAgICAgICAgcG9zaXRpb246YWJzb2x1dGU7XG4gICAgICAgIGNvbG9yOndoaXRlO1xuICAgICAgICB0b3A6MTBweDtcbiAgICAgICAgYm90dG9tOjEwcHg7XG4gICAgICAgIG1hcmdpbi1sZWZ0OiAzMHB4OyBcbiAgICAgICAgZm9udC1zaXplOiBjYWxjKDIycHggKyAxLjJ2dyk7XG4gICAgICAgIHdpZHRoOjEwMCU7XG4gICAgfVxuXG4gICAgI3NlZS1tb3Jle1xuICAgICAgICBkaXNwbGF5OmZsZXg7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuXG4gICAgICAgIG1hcmdpbi10b3A6IDMwcHg7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDMwcHg7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbjwvc3R5bGU+IiwiPHNjcmlwdD5cbiAgICBleHBvcnQgbGV0IGZpbGwgPSBcIiMwMDBcIjtcbiAgICBleHBvcnQgbGV0IHNpemUgPSA3MDtcbjwvc2NyaXB0PlxuPHN2ZyAgdmlld0JveD1cIi01NCAwIDUxMiA1MTJcIiB3aWR0aD17c2l6ZX0gaGVpZ2h0PXtzaXplfSB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZmlsbD17ZmlsbH0+PHBhdGggZD1cIm04OS45Mjk2ODggMTA4LjM3ODkwNmMtMS44NTkzNzYgMS44NTkzNzUtMi45Mjk2ODggNC40NDE0MDYtMi45Mjk2ODggNy4wNzAzMTMgMCAyLjY0MDYyNSAxLjA3MDMxMiA1LjIxMDkzNyAyLjkyOTY4OCA3LjA3MDMxMiAxLjg1OTM3NCAxLjg1OTM3NSA0LjQ0MTQwNiAyLjkyOTY4OCA3LjA3MDMxMiAyLjkyOTY4OCAyLjY0MDYyNSAwIDUuMjEwOTM4LTEuMDcwMzEzIDcuMDcwMzEyLTIuOTI5Njg4IDEuODU5Mzc2LTEuODU5Mzc1IDIuOTI5Njg4LTQuNDI5Njg3IDIuOTI5Njg4LTcuMDcwMzEyIDAtMi42Mjg5MDctMS4wNzAzMTItNS4yMTA5MzgtMi45Mjk2ODgtNy4wNzAzMTMtMS44NTkzNzQtMS44NTkzNzUtNC40Mjk2ODctMi45Mjk2ODctNy4wNzAzMTItMi45Mjk2ODctMi42Mjg5MDYgMC01LjIxMDkzOCAxLjA3MDMxMi03LjA3MDMxMiAyLjkyOTY4N3ptMCAwXCIvPjxwYXRoIGQ9XCJtMzY4LjY4MzU5NCAxMDUuNDUzMTI1aC0yMzEuNjgzNTk0Yy01LjUyMzQzOCAwLTEwIDQuNDc2NTYzLTEwIDEwczQuNDc2NTYyIDEwIDEwIDEwaDIzMS42ODM1OTRjOC40NDUzMTIgMCAxNS4zMTY0MDYgNi44NjcxODcgMTUuMzE2NDA2IDE1LjMxMjV2MjA1LjIzNDM3NWgtNjYuNDYwOTM4Yy01LjUyMzQzNyAwLTEwIDQuNDc2NTYyLTEwIDEwczQuNDc2NTYzIDEwIDEwIDEwaDY2LjQ2MDkzOHY0LjY4MzU5NGMwIDguNDQ1MzEyLTYuODcxMDk0IDE1LjMxNjQwNi0xNS4zMTY0MDYgMTUuMzE2NDA2aC0yOTIuMDU0Njg4Yy0yLjM1NTQ2OCAwLTQuNjM2NzE4LjgzMjAzMS02LjQ0MTQwNiAyLjM1MTU2MmwtNTAuMTg3NSA0Mi4yNjE3MTl2LTI4OS44NDc2NTZjMC04LjQ0NTMxMyA2Ljg3MTA5NC0xNS4zMTI1IDE1LjMxNjQwNi0xNS4zMTI1aDIxLjY4NzVjNS41MTk1MzIgMCAxMC00LjQ3NjU2MyAxMC0xMHMtNC40ODA0NjgtMTAtMTAtMTBoLTIxLjY4NzVjLTE5LjQ3MjY1NiAwLTM1LjMxNjQwNiAxNS44Mzk4NDQtMzUuMzE2NDA2IDM1LjMxMjV2MzExLjM0Mzc1YzAgMy44OTA2MjUgMi4yNTM5MDYgNy40MjU3ODEgNS43ODEyNSA5LjA2NjQwNiAxLjM0NzY1Ni42MjUgMi43ODUxNTYuOTMzNTk0IDQuMjE0ODQ0LjkzMzU5NCAyLjMxNjQwNiAwIDQuNjA1NDY4LS44MDQ2ODcgNi40NDUzMTItMi4zNTE1NjNsNjMuODM1OTM4LTUzLjc1NzgxMmgyODguNDA2MjVjMTkuNDcyNjU2IDAgMzUuMzE2NDA2LTE1Ljg0Mzc1IDM1LjMxNjQwNi0zNS4zMTY0MDZ2LTIyOS45MTc5NjljMC0xOS40NzI2NTYtMTUuODQzNzUtMzUuMzEyNS0zNS4zMTY0MDYtMzUuMzEyNXptMCAwXCIvPjxwYXRoIGQ9XCJtMjAyIDY5Ljk2ODc1YzUuNTIzNDM4IDAgMTAtNC40NzY1NjIgMTAtMTB2LTQ5Ljk2ODc1YzAtNS41MjM0MzgtNC40NzY1NjItMTAtMTAtMTBzLTEwIDQuNDc2NTYyLTEwIDEwdjQ5Ljk2ODc1YzAgNS41MjM0MzggNC40NzY1NjIgMTAgMTAgMTB6bTAgMFwiLz48cGF0aCBkPVwibTI3Ny4zNzEwOTQgNzQuMDI3MzQ0YzIuNTYyNSAwIDUuMTE3MTg3LS45NzY1NjMgNy4wNzAzMTItMi45Mjk2ODhsMzQuOTYwOTM4LTM0Ljk1NzAzMWMzLjkwNjI1LTMuOTA2MjUgMy45MDYyNS0xMC4yMzgyODEgMC0xNC4xNDQ1MzFzLTEwLjIzODI4Mi0zLjkwNjI1LTE0LjE0NDUzMiAwbC0zNC45NTcwMzEgMzQuOTU3MDMxYy0zLjkwNjI1IDMuOTA2MjUtMy45MDYyNSAxMC4yMzgyODEgMCAxNC4xNDQ1MzEgMS45NTMxMjUgMS45NTMxMjUgNC41MTE3MTkgMi45Mjk2ODggNy4wNzAzMTMgMi45Mjk2ODh6bTAgMFwiLz48cGF0aCBkPVwibTExOS41NTg1OTQgNzEuMDMxMjVjMS45NTMxMjUgMS45NTMxMjUgNC41MTE3MTggMi45Mjk2ODggNy4wNzAzMTIgMi45Mjk2ODhzNS4xMTcxODgtLjk3NjU2MyA3LjA3MDMxMy0yLjkyOTY4OGMzLjkwNjI1LTMuOTA2MjUgMy45MDYyNS0xMC4yMzgyODEgMC0xNC4xNDQ1MzFsLTM0Ljk2MDkzOC0zNC45NTcwMzFjLTMuOTAyMzQzLTMuOTA2MjUtMTAuMjM0Mzc1LTMuOTA2MjUtMTQuMTQwNjI1IDBzLTMuOTA2MjUgMTAuMjM0Mzc0IDAgMTQuMTQwNjI0em0wIDBcIi8+PHBhdGggZD1cIm0yMDIgNDQyLjAzMTI1Yy01LjUyMzQzOCAwLTEwIDQuNDc2NTYyLTEwIDEwdjQ5Ljk2ODc1YzAgNS41MjM0MzggNC40NzY1NjIgMTAgMTAgMTBzMTAtNC40NzY1NjIgMTAtMTB2LTQ5Ljk2ODc1YzAtNS41MjM0MzgtNC40NzY1NjItMTAtMTAtMTB6bTAgMFwiLz48cGF0aCBkPVwibTI4NC40NDE0MDYgNDQwLjkwMjM0NGMtMy45MDYyNS0zLjkwNjI1LTEwLjIzNDM3NS0zLjkwNjI1LTE0LjE0MDYyNSAwcy0zLjkwNjI1IDEwLjIzODI4MSAwIDE0LjE0NDUzMWwzNC45NTcwMzEgMzQuOTU3MDMxYzEuOTUzMTI2IDEuOTUzMTI1IDQuNTExNzE5IDIuOTI5Njg4IDcuMDcwMzEzIDIuOTI5Njg4IDIuNTYyNSAwIDUuMTIxMDk0LS45NzY1NjMgNy4wNzQyMTktMi45Mjk2ODggMy45MDIzNDQtMy45MDYyNSAzLjkwMjM0NC0xMC4yMzgyODEgMC0xNC4xNDQ1MzF6bTAgMFwiLz48cGF0aCBkPVwibTExOS41NTg1OTQgNDQwLjk2ODc1LTM0Ljk2MDkzOCAzNC45NjA5MzhjLTMuOTA2MjUgMy45MDYyNS0zLjkwNjI1IDEwLjIzNDM3NCAwIDE0LjE0MDYyNCAxLjk1MzEyNSAxLjk1MzEyNiA0LjUxMTcxOSAyLjkyOTY4OCA3LjA3MDMxMyAyLjkyOTY4OCAyLjU1ODU5MyAwIDUuMTE3MTg3LS45NzY1NjIgNy4wNzAzMTItMi45Mjk2ODhsMzQuOTYwOTM4LTM0Ljk1NzAzMWMzLjkwNjI1LTMuOTA2MjUgMy45MDYyNS0xMC4yMzgyODEgMC0xNC4xNDQ1MzFzLTEwLjIzNDM3NS0zLjkwNjI1LTE0LjE0MDYyNSAwem0wIDBcIi8+PHBhdGggZD1cIm0yOTMuOTE3OTY5IDI0OS42NTIzNDRjMC0yNi4yMDcwMzItMjEuMzE2NDA3LTQ3LjUyMzQzOC00Ny41MjM0MzgtNDcuNTIzNDM4aC0yMS42OTUzMTJjLTUuNTE5NTMxIDAtMTAgNC40NzY1NjMtMTAgMTB2ODhjMCA1LjUxOTUzMiA0LjQ4MDQ2OSAxMCAxMCAxMGgyMS42OTUzMTJjMjYuMjAzMTI1IDAgNDcuNTIzNDM4LTIxLjMyMDMxMiA0Ny41MjM0MzgtNDcuNTI3MzQ0em0tMjAgMTIuOTQ5MjE4YzAgMTUuMTc5Njg4LTEyLjM0NzY1NyAyNy41MjczNDQtMjcuNTIzNDM4IDI3LjUyNzM0NGgtMTEuNjk1MzEydi02OGgxMS42OTUzMTJjMTUuMTc1NzgxIDAgMjcuNTIzNDM4IDEyLjM0Mzc1IDI3LjUyMzQzOCAyNy41MjM0Mzh6bTAgMFwiLz48cGF0aCBkPVwibTExOS4wNjI1IDI3MS43OTY4NzUtOC40NTcwMzEgMjUuMTQwNjI1Yy0xLjc2MTcxOSA1LjIzNDM3NSAxLjA1MDc4MSAxMC45MDYyNSA2LjI4NTE1NiAxMi42Njc5NjkgNS4yNDIxODcgMS43NjE3MTkgMTAuOTA2MjUtMS4wNTQ2ODggMTIuNjY3OTY5LTYuMjg5MDYzbDYuMjQyMTg3LTE4LjU1MDc4MWgyNy43ODEyNWw2LjI0MjE4OCAxOC41NTA3ODFjMS40MDIzNDMgNC4xNzU3ODIgNS4yOTY4NzUgNi44MTI1IDkuNDc2NTYyIDYuODEyNSAxLjA1ODU5NCAwIDIuMTMyODEzLS4xNjc5NjggMy4xODc1LS41MjM0MzcgNS4yMzQzNzUtMS43NjE3MTkgOC4wNTA3ODEtNy40MzM1OTQgNi4yODkwNjMtMTIuNjY3OTY5bC0yOS42MDkzNzUtODhjLTEuMzY3MTg4LTQuMDcwMzEyLTUuMTgzNTk0LTYuODA4NTk0LTkuNDc2NTYzLTYuODA4NTk0LTQuMjkyOTY4IDAtOC4xMDkzNzUgMi43MzgyODItOS40NzY1NjIgNi44MDg1OTRsLTIxLjE0NDUzMiA2Mi44Mzk4NDRjLS4wMDM5MDYuMDA3ODEyLS4wMDc4MTIuMDExNzE4LS4wMDc4MTIuMDE5NTMxem0zMC42Mjg5MDYtMjguMzEyNSA3LjE2MDE1NiAyMS4yODEyNWgtMTQuMzIwMzEyem0wIDBcIi8+PHBhdGggZD1cIm0yNzAuOTY4NzUgMzQ4LjkyOTY4OGMtMS44NTkzNzUgMS44NTkzNzQtMi45Mjk2ODggNC40NDE0MDYtMi45Mjk2ODggNy4wNzAzMTIgMCAyLjY0MDYyNSAxLjA3MDMxMyA1LjIxMDkzOCAyLjkyOTY4OCA3LjA3MDMxMiAxLjg2MzI4MSAxLjg1OTM3NiA0LjQ0MTQwNiAyLjkyOTY4OCA3LjA3MDMxMiAyLjkyOTY4OCAyLjYzMjgxMyAwIDUuMjEwOTM4LTEuMDcwMzEyIDcuMDcwMzEzLTIuOTI5Njg4IDEuODU5Mzc1LTEuODU5Mzc0IDIuOTI5Njg3LTQuNDQxNDA2IDIuOTI5Njg3LTcuMDcwMzEycy0xLjA3MDMxMi01LjIxMDkzOC0yLjkyOTY4Ny03LjA3MDMxMmMtMS44NTkzNzUtMS44NTkzNzYtNC40Mzc1LTIuOTI5Njg4LTcuMDcwMzEzLTIuOTI5Njg4LTIuNjI4OTA2IDAtNS4yMTA5MzcgMS4wNzAzMTItNy4wNzAzMTIgMi45Mjk2ODh6bTAgMFwiLz48L3N2Zz5cblxuPHN0eWxlPjwvc3R5bGU+IiwiPHNjcmlwdD5cbiAgICBleHBvcnQgbGV0IGZpbGwgPSBcIiMwMDBcIjtcbiAgICBleHBvcnQgbGV0IHNpemUgPSA3MDtcbjwvc2NyaXB0PlxuPHN2ZyB3aWR0aD17c2l6ZX0gaGVpZ2h0PXtzaXplfSB2aWV3Qm94PVwiMCAtNDAgNDgwIDQ4MFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBmaWxsPXtmaWxsfT48cGF0aCBkPVwibTE3NiAyNjRjMTcuNjcxODc1IDAgMzItMTQuMzI4MTI1IDMyLTMydi05Ny45Njg3NWw5Ni0yNy40MjE4NzV2NjUuODM5ODQ0Yy00Ljg0Mzc1LTIuODc4OTA3LTEwLjM2NzE4OC00LjQxNzk2OS0xNi00LjQ0OTIxOS0xNy42NzE4NzUgMC0zMiAxNC4zMjgxMjUtMzIgMzJzMTQuMzI4MTI1IDMyIDMyIDMyIDMyLTE0LjMyODEyNSAzMi0zMnYtMTM2YzAtMi41MDc4MTItMS4xNzk2ODgtNC44NzEwOTQtMy4xODM1OTQtNi4zODI4MTItMi0xLjUwNzgxMy00LjU5NzY1Ni0xLjk5MjE4OC03LjAwNzgxMi0xLjMwNDY4OGwtMTEyIDMyYy0zLjQzNzUuOTc2NTYyLTUuODA0Njg4IDQuMTE3MTg4LTUuODA4NTk0IDcuNjg3NXYxMDguNDQ5MjE5Yy00Ljg0Mzc1LTIuODc4OTA3LTEwLjM2NzE4OC00LjQxNzk2OS0xNi00LjQ0OTIxOS0xNy42NzE4NzUgMC0zMiAxNC4zMjgxMjUtMzIgMzJzMTQuMzI4MTI1IDMyIDMyIDMyem0xMTItNDhjLTguODM1OTM4IDAtMTYtNy4xNjQwNjItMTYtMTZzNy4xNjQwNjItMTYgMTYtMTYgMTYgNy4xNjQwNjIgMTYgMTYtNy4xNjQwNjIgMTYtMTYgMTZ6bS04MC0xMTMuOTY4NzUgOTYtMjcuNDIxODc1djE1LjM1OTM3NWwtOTYgMjcuNDIxODc1em0tMzIgMTEzLjk2ODc1YzguODM1OTM4IDAgMTYgNy4xNjQwNjIgMTYgMTZzLTcuMTY0MDYyIDE2LTE2IDE2LTE2LTcuMTY0MDYyLTE2LTE2IDcuMTY0MDYyLTE2IDE2LTE2em0wIDBcIi8+PHBhdGggZD1cIm00NDAgMjg4di0yNTZjMC00LjQxNzk2OS0zLjU4MjAzMS04LTgtOGgtMzg0Yy00LjQxNzk2OSAwLTggMy41ODIwMzEtOCA4djI1NmMwIDQuNDE3OTY5IDMuNTgyMDMxIDggOCA4aDM4NGM0LjQxNzk2OSAwIDgtMy41ODIwMzEgOC04em0tMTYtOGgtMzY4di0yNDBoMzY4em0wIDBcIi8+PHBhdGggZD1cIm00NzIgMzIwaC04di0yOTZjMC0xMy4yNTM5MDYtMTAuNzQ2MDk0LTI0LTI0LTI0aC00MDBjLTEzLjI1MzkwNiAwLTI0IDEwLjc0NjA5NC0yNCAyNHYyOTZoLThjLTQuNDE3OTY5IDAtOCAzLjU4MjAzMS04IDh2MzJjLjAyNzM0MzggMjIuMDgyMDMxIDE3LjkxNzk2OSAzOS45NzI2NTYgNDAgNDBoNDAwYzIyLjA4MjAzMS0uMDI3MzQ0IDM5Ljk3MjY1Ni0xNy45MTc5NjkgNDAtNDB2LTMyYzAtNC40MTc5NjktMy41ODIwMzEtOC04LTh6bS00NDAtMjk2YzAtNC40MTc5NjkgMy41ODIwMzEtOCA4LThoNDAwYzQuNDE3OTY5IDAgOCAzLjU4MjAzMSA4IDh2Mjk2aC0xMzAuOTQ1MzEyYy01LjIzMDQ2OS4wMDc4MTItMTAuMzE2NDA3IDEuNzE4NzUtMTQuNDg4MjgyIDQuODcxMDk0bC0yMy4xMDE1NjIgMTcuNTI3MzQ0Yy0xLjM4NjcxOSAxLjAzNTE1Ni0zLjA3MDMxMyAxLjU5NzY1Ni00LjgwMDc4MiAxLjYwMTU2MmgtNjkuMzI4MTI0Yy0xLjczMDQ2OS0uMDAzOTA2LTMuNDE0MDYzLS41NjY0MDYtNC44MDA3ODItMS42MDE1NjJsLTIzLjQ1NzAzMS0xNy41OTc2NTdjLTQuMTU2MjUtMy4xMDkzNzUtOS4yMDcwMzEtNC43OTI5NjktMTQuMzk4NDM3LTQuODAwNzgxaC0xMzAuNjc5Njg4em00MzIgMzM2YzAgMTMuMjUzOTA2LTEwLjc0NjA5NCAyNC0yNCAyNGgtNDAwYy0xMy4yNTM5MDYgMC0yNC0xMC43NDYwOTQtMjQtMjR2LTI0aDE0Ni42NjQwNjJjMS43MzA0NjkuMDAzOTA2IDMuNDE0MDYzLjU2NjQwNiA0LjgwMDc4MiAxLjYwMTU2MmwyMy40NTcwMzEgMTcuNTk3NjU3YzQuMTU2MjUgMy4xMDkzNzUgOS4yMDcwMzEgNC43OTI5NjkgMTQuMzk4NDM3IDQuODAwNzgxaDY5LjI4OTA2M2M1LjIzMDQ2OS0uMDA3ODEyIDEwLjMyMDMxMy0xLjcxODc1IDE0LjQ5NjA5NC00Ljg3MTA5NGwyMy4xMjUtMTcuNTI3MzQ0YzEuMzg2NzE5LTEuMDM1MTU2IDMuMDcwMzEyLTEuNTk3NjU2IDQuODAwNzgxLTEuNjAxNTYyaDE0Ni45Njg3NXptMCAwXCIvPjwvc3ZnPlxuXG48c3R5bGU+PC9zdHlsZT4iLCI8c2NyaXB0PlxuICAgIGV4cG9ydCBsZXQgZmlsbCA9IFwiIzAwMFwiO1xuXHRleHBvcnQgbGV0IHNpemUgPSA3MDtcbjwvc2NyaXB0PlxuXG48c3ZnIHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiXG5cdCB2aWV3Qm94PVwiMCAwIDQ4MCA0ODBcIiB3aWR0aD17c2l6ZX0gaGVpZ2h0PXtzaXplfSBzdHlsZT1cImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDgwIDQ4MDtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiIGZpbGw9e2ZpbGx9PlxuPGc+XG5cdDxnPlxuXHRcdDxwYXRoIGQ9XCJNNDcyLDgwSDI4MGMtNC40MTgsMC04LDMuNTgyLTgsOHY3MmMwLjAwMyw0LjQxOCwzLjU4OCw3Ljk5Nyw4LjAwNiw3Ljk5NGMwLjg1Ny0wLjAwMSwxLjcwOS0wLjEzOSwyLjUyMi0wLjQxXG5cdFx0XHRsMTAuMDU2LTMuMzUyYzEwLjkxOC0zLjU3NCwyMi42NjUsMi4zOCwyNi4yMzgsMTMuMjk4YzMuNTczLDEwLjkxOC0yLjM4LDIyLjY2NS0xMy4yOTgsMjYuMjM4Yy00LjIwNCwxLjM3Ni04LjczNywxLjM3Ni0xMi45NDEsMFxuXHRcdFx0bC0xMC4wNTYtMy4zNTJjLTQuMTkyLTEuMzk2LTguNzIyLDAuODctMTAuMTE4LDUuMDYyYy0wLjI3MSwwLjgxMy0wLjQwOSwxLjY2NS0wLjQxLDIuNTIydjY0aC02NFxuXHRcdFx0Yy00LjQxOCwwLjAwMy03Ljk5NywzLjU4OC03Ljk5NCw4LjAwNmMwLjAwMSwwLjg1NywwLjEzOSwxLjcwOSwwLjQxLDIuNTIybDMuMzUyLDEwLjA1NmMzLjU3NCwxMC45MTgtMi4zOCwyMi42NjUtMTMuMjk4LDI2LjIzOFxuXHRcdFx0Yy0xMC45MTgsMy41NzQtMjIuNjY1LTIuMzgtMjYuMjM4LTEzLjI5OGMtMS4zNzYtNC4yMDQtMS4zNzYtOC43MzcsMC0xMi45NDFsMy4zNTItMTAuMDU2YzEuMzk2LTQuMTkyLTAuODctOC43MjItNS4wNjItMTAuMTE4XG5cdFx0XHRjLTAuODEzLTAuMjcxLTEuNjY1LTAuNDA5LTIuNTIyLTAuNDFIODhjLTQuNDE4LDAtOCwzLjU4Mi04LDh2MTkyYzAsNC40MTgsMy41ODIsOCw4LDhoMzg0YzQuNDE4LDAsOC0zLjU4Miw4LThWODhcblx0XHRcdEM0ODAsODMuNTgyLDQ3Ni40MTgsODAsNDcyLDgweiBNMjcyLjQxLDM5Ny40NzhjLTAuMjcxLDAuODEzLTAuNDA5LDEuNjY1LTAuNDEsMi41MjJ2NjRIOTZWMjg4aDUyLjkwNFxuXHRcdFx0Yy02LjExMywxOS4zODMsNC42NDUsNDAuMDUyLDI0LjAyOCw0Ni4xNjRjMTkuMzgzLDYuMTEzLDQwLjA1Mi00LjY0NSw0Ni4xNjQtMjQuMDI4YzIuMjcyLTcuMjA0LDIuMjcyLTE0LjkzMywwLTIyLjEzN0gyNzJ2NjRcblx0XHRcdGMwLjAwMyw0LjQxOCwzLjU4OCw3Ljk5Nyw4LjAwNiw3Ljk5NGMwLjg1Ny0wLjAwMSwxLjcwOS0wLjEzOSwyLjUyMi0wLjQxbDEwLjA1Ni0zLjM1MmMxMC45MTgtMy41NzMsMjIuNjY1LDIuMzgsMjYuMjM4LDEzLjI5OFxuXHRcdFx0YzMuNTczLDEwLjkxOC0yLjM4LDIyLjY2NS0xMy4yOTgsMjYuMjM4Yy00LjIwNCwxLjM3Ni04LjczNywxLjM3Ni0xMi45NDEsMGwtMTAuMDU2LTMuMzUyXG5cdFx0XHRDMjc4LjMzNiwzOTEuMDIsMjczLjgwNiwzOTMuMjg2LDI3Mi40MSwzOTcuNDc4eiBNNDY0LDQ2NEgyODh2LTUyLjkwNGMxOS4zODMsNi4xMTMsNDAuMDUyLTQuNjQ1LDQ2LjE2NC0yNC4wMjhcblx0XHRcdGM2LjExMy0xOS4zODMtNC42NDUtNDAuMDUyLTI0LjAyOC00Ni4xNjRjLTcuMjA0LTIuMjcyLTE0LjkzMy0yLjI3Mi0yMi4xMzcsMFYyODhoNjRjNC40MTgtMC4wMDMsNy45OTctMy41ODgsNy45OTQtOC4wMDZcblx0XHRcdGMtMC4wMDEtMC44NTctMC4xMzktMS43MDktMC40MS0yLjUyMmwtMy4zNTItMTAuMDU2Yy0zLjU3My0xMC45MTgsMi4zOC0yMi42NjUsMTMuMjk4LTI2LjIzOFxuXHRcdFx0YzEwLjkxOC0zLjU3MywyMi42NjUsMi4zOCwyNi4yMzgsMTMuMjk4YzEuMzc2LDQuMjA0LDEuMzc2LDguNzM3LDAsMTIuOTQxbC0zLjM1MiwxMC4wNTZjLTEuMzk2LDQuMTkyLDAuODcsOC43MjIsNS4wNjIsMTAuMTE4XG5cdFx0XHRjMC44MTMsMC4yNzEsMS42NjUsMC40MDksMi41MjIsMC40MWg2NFY0NjR6IE00NjQsMjcyaC01Mi45MDRjNi4xMTMtMTkuMzgzLTQuNjQ1LTQwLjA1Mi0yNC4wMjgtNDYuMTY0XG5cdFx0XHRjLTE5LjM4My02LjExMy00MC4wNTIsNC42NDUtNDYuMTY0LDI0LjAyOGMtMi4yNzIsNy4yMDQtMi4yNzIsMTQuOTMzLDAsMjIuMTM3SDI4OHYtNTIuOTA0XG5cdFx0XHRjMTEuMTExLDMuNjAxLDIzLjI3NSwxLjY1OCwzMi43MTItNS4yMjRjMTYuNTQ2LTExLjgwMiwyMC4zOTItMzQuNzgzLDguNTktNTEuMzI5Yy05LjMyLTEzLjA2Ni0yNi4wMzMtMTguNTg1LTQxLjMwMi0xMy42MzlWOTZcblx0XHRcdGgxNzZWMjcyelwiLz5cblx0PC9nPlxuPC9nPlxuPGc+XG5cdDxnPlxuXHRcdDxwYXRoIGQ9XCJNMjMwLjEzNyw2OC45MDRjLTcuMjA0LTIuMjcyLTE0LjkzMy0yLjI3Mi0yMi4xMzcsMFY4YzAtNC40MTgtMy41ODItOC04LThIOEMzLjU4MiwwLDAsMy41ODIsMCw4djE5MlxuXHRcdFx0YzAsNC40MTgsMy41ODIsOCw4LDhoNjAuOTA0Yy02LjExMywxOS4zODMsNC42NDUsNDAuMDUyLDI0LjAyOCw0Ni4xNjRzNDAuMDUyLTQuNjQ1LDQ2LjE2NC0yNC4wMjhcblx0XHRcdGMyLjI3Mi03LjIwNCwyLjI3Mi0xNC45MzMsMC0yMi4xMzdIMjAwYzQuNDE4LDAsOC0zLjU4Miw4LTh2LTYwLjkwNGMxOS4zODMsNi4xMTMsNDAuMDUyLTQuNjQ1LDQ2LjE2NC0yNC4wMjhcblx0XHRcdEMyNjAuMjc3LDk1LjY4NSwyNDkuNTIsNzUuMDE3LDIzMC4xMzcsNjguOTA0eiBNMjI1LjUyNSwxMjMuNzY4Yy00LjIwNCwxLjM3Ni04LjczNywxLjM3Ni0xMi45NDEsMGwtMTAuMDU2LTMuMzUyXG5cdFx0XHRjLTQuMTkyLTEuMzk2LTguNzIyLDAuODctMTAuMTE4LDUuMDYyYy0wLjI3MSwwLjgxMy0wLjQwOSwxLjY2NS0wLjQxLDIuNTIydjY0aC02NGMtNC40MTgsMC4wMDMtNy45OTcsMy41ODgtNy45OTQsOC4wMDZcblx0XHRcdGMwLjAwMSwwLjg1NywwLjEzOSwxLjcwOSwwLjQxLDIuNTIybDMuMzUyLDEwLjA1NmMzLjU3NCwxMC45MTgtMi4zOCwyMi42NjUtMTMuMjk4LDI2LjIzOFxuXHRcdFx0Yy0xMC45MTgsMy41NzMtMjIuNjY1LTIuMzgtMjYuMjM4LTEzLjI5OGMtMS4zNzYtNC4yMDQtMS4zNzYtOC43MzcsMC0xMi45NDFsMy4zNTItMTAuMDU2YzEuMzk2LTQuMTkyLTAuODctOC43MjItNS4wNjItMTAuMTE4XG5cdFx0XHRjLTAuODEzLTAuMjcxLTEuNjY1LTAuNDA5LTIuNTIyLTAuNDFIMTZWMTZoMTc2djY0YzAuMDAzLDQuNDE4LDMuNTg4LDcuOTk3LDguMDA2LDcuOTk0YzAuODU3LTAuMDAxLDEuNzA5LTAuMTM5LDIuNTIyLTAuNDFcblx0XHRcdGwxMC4wNTYtMy4zNTJjMTAuOTE4LTMuNTczLDIyLjY2NSwyLjM4LDI2LjIzOCwxMy4yOThDMjQyLjM5NiwxMDguNDQ3LDIzNi40NDIsMTIwLjE5NSwyMjUuNTI1LDEyMy43Njh6XCIvPlxuXHQ8L2c+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48Zz5cbjwvZz5cbjxnPlxuPC9nPlxuPGc+XG48L2c+XG48L3N2Zz4iLCI8c2NyaXB0PlxuICAgIGltcG9ydCB7Q29sLENvbnRhaW5lciwgUm93fSBmcm9tIFwic3ZlbHRlc3RyYXBcIjtcblxuICAgIGltcG9ydCBBZEljb24gZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvc3ZnX2ljb25zL0FkSWNvbi5zdmVsdGVcIjtcbiAgICBpbXBvcnQgTXVzaWNWaWRlb0ljb24gZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvc3ZnX2ljb25zL011c2ljVmlkZW9JY29uLnN2ZWx0ZVwiO1xuICAgIGltcG9ydCBQdXp6bGVJY29uIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL3N2Z19pY29ucy9QdXp6bGVJY29uLnN2ZWx0ZVwiO1xuICAgIGltcG9ydCBCdXR0b24gZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvQnV0dG9uLnN2ZWx0ZVwiO1xuXG4gICAgZXhwb3J0IGxldCBkaWRUYXBTZWVQb3J0Zm9saW8gPSBudWxsO1xuXG4gICAgY29uc3QgaWNvblNpemUgPSA3MDtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNlZU1vcmUoKSB7XG4gICAgICAgIGlmKGRpZFRhcFNlZVBvcnRmb2xpbykgZGlkVGFwU2VlUG9ydGZvbGlvKCk7XG4gICAgfVxuXG48L3NjcmlwdD5cblxuXG48ZGl2IGNsYXNzPVwiY29udGFpbmVyLWVsZW1lbnRcIj5cbiAgICA8aDE+wr9RdcOpIGVzIE1pdGFkIERvYmxlPzwvaDE+XG4gICAgPHA+U29tb3MgdW5hIHByb2R1Y3RvcmEgam92ZW4geSBjb24gcGVyc29uYWxpZGFkIHByb3BpYS4gTnVlc3RyYSBjYWxpZGFkIGVzIGNvbnNlY3VlbmNpYSBkZWwgYW1vciBwb3IgbnVlc3RybyB0cmFiYWpvLjwvcD5cbiAgICA8ZGl2IHN0eWxlPVwiaGVpZ2h0OjMwcHg7XCI+PC9kaXY+XG4gICAgPGg0PsK/WSBxdcOpIGhhY2Vtb3M/PC9oND5cbiAgICA8Q29udGFpbmVyPlxuICAgICAgICA8Um93IGNvbHM9e3tsZzozLCBtZDoxfX0gPlxuICAgICAgICAgICAgPENvbCA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtZWxlbWVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8QWRJY29uIGZpbGw9e1wiI0M2OUQ2NFwifSBzaXplPXtpY29uU2l6ZX0vPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMz5QdWJsaWNpZGFkPC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlVuYSBkZSBudWVzdHJhcyBlc3BlY2lhbGlkYWRlcy4gTnVlc3Ryb3Mgc2VydmljaW9zIHRlIGF5dWRhcsOhbiBhIGRhciBhIGNvbm9jZXIgdMO6IG1hcmNhIHkgcHJvZHVjdG8uPC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQ29sPlxuICAgICAgICAgICAgPENvbD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1lbGVtZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxNdXNpY1ZpZGVvSWNvbiBmaWxsPXtcIiNDNjlENjRcIn0gc2l6ZT17aWNvblNpemV9Lz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDM+VmlkZW9jbGlwczwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD5MbGV2YW1vcyB0YW50byBjb2xhYm9yYW5kbyBjb24gZ3JhbmRlcyBhcnRpc3RhcyBxdWUgYWwgZmluYWwgbm9zIGhlbW9zIGVuYW1vcmFkbyBkZWwgZ8OpbmVyby48L3A+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9Db2w+XG4gICAgICAgICAgICA8Q29sPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWVsZW1lbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPFB1enpsZUljb24gZmlsbD17XCIjQzY5RDY0XCJ9IHNpemU9e2ljb25TaXplfS8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGgzPk90cm9zPC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlBvZGNhc3QsIGVudHJldmlzdGFzLCAgZmFzaGlvbiBmaWxtcywgY29uZmVyZW5jaWFzLi4uIHNpIGVzIGF1ZGlvdmlzdWFsLCBsbyBoYWNlbW9zLiBQcmVnw7pudGFub3MuPC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQ29sPlxuICAgICAgICA8L1Jvdz5cbiAgICA8L0NvbnRhaW5lcj5cbiAgICA8ZGl2IHN0eWxlPVwiaGVpZ2h0OjMwcHg7XCI+PC9kaXY+XG4gICAgPCEtLSA8QnV0dG9uIHRleHQ9XCJBbnRlIGxhIGR1ZGEsIMOpY2hhbGUgdW4gb2pvIGEgbnVlc3RybyBwb3J0Zm9saW9cIiB3aWR0aD17XCI1MHZ3XCJ9IGJhY2tncm91bmRDb2xvcj1cInRyYW5zcGFyZW50XCIgZm9udFNpemU9XCIxLjZ2d1wiIG9uOmNsaWNrPXtoYW5kbGVTZWVNb3JlfS8+IC0tPlxuICAgIDxkaXYgc3R5bGU9XCJoZWlnaHQ6MzBweDtcIj48L2Rpdj5cbiAgICA8aDE+IENvbnRhY3RhIDwvaDE+XG4gICAgPHA+IFNpIHRpZW5lcyBjdWFscXVpZXIgcHJlZ3VudGEgbyBkdWRhIHNvYnJlIHNpIHNvbW9zIGxvIHF1ZSBidXNjYXMsIG5vIGR1ZGVzIGVuIGVzY3JpYmlybm9zIHBhcmEgaGFibGFyIGRlbCBwcm95ZWN0byA8L3A+XG4gICAgPGgzPiB2ZW50YXNAbWl0YWRkb2JsZS5lczwvaDM+XG48L2Rpdj5cblxuPHN0eWxlPlxuICAgIC5jb250YWluZXItZWxlbWVudHtcbiAgICAgICAgZGlzcGxheTpmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjpjb2x1bW47XG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICBhbGlnbi1pdGVtczpjZW50ZXI7XG5cbiAgICAgICAgcGFkZGluZzogY2FsYygyMHB4ICsgMmVtKTtcbiAgICAgICAgXG4gICAgICAgIGNvbG9yOndoaXRlO1xuICAgIH1cblxuICAgIGgxe1xuICAgICAgICBjb2xvcjojQzY5RDY0O1xuICAgICAgICBmb250LXNpemU6IGNhbGMoMjJweCArIDEuMWVtKTtcbiAgICAgICAgcGFkZGluZzogMTBweDtcbiAgICB9XG4gICAgcHtcbiAgICAgICAgZm9udC1zaXplOiAxLjJlbTtcbiAgICAgICAgcGFkZGluZzogMTBweDtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIH1cblxuICAgIGg0e1xuICAgICAgICBjb2xvcjojQzY5RDY0O1xuICAgICAgICBmb250LXNpemU6IGNhbGMoOXB4ICsgMC44ZW0pO1xuICAgICAgICBwYWRkaW5nOiAxMHB4O1xuICAgIH1cblxuXG4gICAgLmNhcmQtZWxlbWVudHtcbiAgICAgICAgY29sb3I6d2hpdGU7XG4gICAgICAgIHBhZGRpbmc6IDEwcHg7XG4gICAgICAgIG1hcmdpbjogNXB4O1xuXG4gICAgICAgIGRpc3BsYXk6ZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgICAgYWxpZ24taXRlbXM6Y2VudGVyO1xuICAgICAgICBqdXN0aWZ5LWl0ZW1zOmNlbnRlcjtcbiAgICAgICAgXG4gICAgfVxuICAgIC50ZXh0LWNvbnRhaW5lcntcbiAgICAgICAgcGFkZGluZy10b3A6IDVweDtcblxuICAgICAgICBkaXNwbGF5OmZsZXg7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICAgIGFsaWduLWl0ZW1zOmNlbnRlcjtcbiAgICAgICAganVzdGlmeS1pdGVtczpjZW50ZXI7XG4gICAgfVxuICAgIC50ZXh0LWNvbnRhaW5lciA+IGgze1xuICAgICAgICBmb250LXNpemU6IGNhbGMoMTBweCArIDFlbSk7XG4gICAgfVxuXG4gICAgLmNhcmQtZWxlbWVudCA+IC50ZXh0LWNvbnRhaW5lciA+IHB7XG4gICAgICAgIGZvbnQtc2l6ZTogY2FsYygxMHB4ICsgMC41ZW0pO1xuICAgICAgICBwYWRkaW5nOiAxMHB4O1xuICAgICAgICBmb250LWZhbWlseTogTGF0by1MaWdodDtcbiAgICAgICAgY29sb3I6d2hpdGU7XG4gICAgICAgICBcbiAgICB9XG5cbiAgICBAbWVkaWEgKG1heC13aWR0aDogOTkycHgpe1xuICAgICAgICAuY2FyZC1lbGVtZW50e1xuICAgICAgICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcbiAgICAgICAgfVxuICAgICAgICAudGV4dC1jb250YWluZXIgPiBwe1xuICAgICAgICAgICAgZm9udC1zaXplOiAxLjJlbTtcbiAgICAgICAgfVxuICAgICAgICBwe1xuICAgICAgICAgICAgZm9udC1zaXplOiBjYWxjKDEwcHggKyAxZW0pXG4gICAgICAgIH1cbiAgICB9XG5cblxuPC9zdHlsZT4iLCI8c2NyaXB0PlxuICAgIGltcG9ydCBIZXJvVmlkZW8gZnJvbSBcIi4vSGVyb1ZpZGVvLnN2ZWx0ZVwiO1xuICAgIGltcG9ydCBXb3JrU2hvd2Nhc2UgZnJvbSBcIi4vV29ya1Nob3djYXNlLnN2ZWx0ZVwiO1xuICAgIGltcG9ydCBDb250YWN0IGZyb20gXCIuL0NvbnRhY3Quc3ZlbHRlXCI7XG4gICAgXG5cbiAgICBleHBvcnQgbGV0IGRpZFRhcFBvcnRmb2xpbztcblxuICAgIGZ1bmN0aW9uIGhhbmRsZUhlcm9TZWVNb3JlKCl7XG4gICAgICAgIHdpbmRvdy5zY3JvbGwoMCx3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNlZVBvcnRmb2xpbygpIHtcbiAgICAgICAgaWYoZGlkVGFwUG9ydGZvbGlvKSBkaWRUYXBQb3J0Zm9saW8oKTtcbiAgICB9XG5cbjwvc2NyaXB0PlxuXG48bWFpbj5cbiAgICA8SGVyb1ZpZGVvIHZpZGVvU3JjPVwiLi9yZWVsLm1wNFwiIGJhY2tkcm9wQ29sb3I9XCIjNDE0MDQyXCIgb25TZWVNb3JlPXsoKT0+aGFuZGxlSGVyb1NlZU1vcmUoKX0vPlxuICAgIDwhLS0gPFdvcmtTaG93Y2FzZSBkaWRUYXBTZWVNb3JlPXtoYW5kbGVTZWVQb3J0Zm9saW99PjwvV29ya1Nob3djYXNlPiAtLT5cbiAgICA8Q29udGFjdCBkaWRUYXBTZWVQb3J0Zm9saW89e2hhbmRsZVNlZVBvcnRmb2xpb30vPlxuICAgIFxuICAgIFxuPC9tYWluPlxuXG48c3R5bGU+XG4gICAgbWFpbntcbiAgICAgICAgb3ZlcmZsb3cteDogaGlkZGVuO1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICB9XG48L3N0eWxlPiAiLCI8c2NyaXB0PlxuICAgIGltcG9ydCB7Q29sLENvbnRhaW5lciwgUm93fSBmcm9tIFwic3ZlbHRlc3RyYXBcIjtcbiAgICBleHBvcnQgbGV0IGRhdGEgPSBbXTtcblxuICAgIFxuICAgIFxuPC9zY3JpcHQ+XG5cbjxSb3cgY29scz17e2xnOjQsIG1kOjIsIHNtOjF9fT5cbiAgICB7I2VhY2ggZGF0YSBhcyBkYXRhfVxuICAgICAgICA8Q29sPlxuICAgICAgICAgICAgPENvbnRhaW5lcj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicG9ydGZvbGlvLWNhcmRcIj48L2Rpdj5cbiAgICAgICAgICAgIDwvQ29udGFpbmVyPlxuICAgICAgICA8L0NvbD5cbiAgICB7L2VhY2h9XG48L1Jvdz5cblxuXG48c3R5bGU+XG5cbiAgICAucG9ydGZvbGlvLWNhcmR7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6MTBweDtcbiAgICAgICAgLyogYmFja2dyb3VuZDogcmdiKDI1NSwyNTUsMjU1KTsgKi9cbiAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE1MWRlZywgcmdiYSgyNTUsMjU1LDI1NSwxKSAwJSwgcmdiYSgyMzgsMjM4LDIzOCwxKSAxMDAlKTtcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICB9XG48L3N0eWxlPiIsIjxzY3JpcHQ+XG4gICAgaW1wb3J0IHtJY29ufSBmcm9tIFwic3ZlbHRlc3RyYXBcIjtcblxuICAgIGltcG9ydCBNaXRhZERvYmxlSWNvbiBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9zdmdfaWNvbnMvTWl0YWREb2JsZUljb24uc3ZlbHRlXCJcbiAgICBpbXBvcnQgUG9ydGZvbGlvR3JpZCBmcm9tIFwiLi9Qb3J0Zm9saW9HcmlkLnN2ZWx0ZVwiO1xuXG4gICAgZXhwb3J0IGxldCBkaWRUYXBCYWNrID0gbnVsbDtcbiAgICBcbiAgICBmdW5jdGlvbiBoYW5kbGVCYWNrKCkge1xuICAgICAgICBpZihkaWRUYXBCYWNrKSBkaWRUYXBCYWNrKCk7XG4gICAgfVxuPC9zY3JpcHQ+XG5cbjxkaXYgY2xhc3MgPVwiY29udGFpbmVyLWVsZW1lbnRcIj5cbiAgICA8aGVhZGVyPlxuICAgICAgICA8ZGl2IG9uOmNsaWNrPXtoYW5kbGVCYWNrfSBzdHlsZT1cImRpc3BsYXk6ZmxleDsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGFsaWduLWl0ZW1zOiBjZW50ZXI7Y3Vyc29yOiBwb2ludGVyO1wiPlxuICAgICAgICAgICAgPGRpdiBpZD1cImljb24td3JhcHBlclwiPjxJY29uIG5hbWU9XCJhcnJvdy1sZWZ0XCIvPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT1cIndpZHRoOiAzMHB4O1wiPjwvZGl2PlxuICAgICAgICAgICAgPGgxPiBQT1JURk9MSU8gPC9oMT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxNaXRhZERvYmxlSWNvbiB3aXRoTWFpblRleHQ9e3RydWV9IHdpdGhCb3R0b21UZXh0PXtmYWxzZX0gYm9yZGVyQ29sb3I9e1wiI2ZmZlwifSB3aWR0aD17MTEwfS8+XG4gICAgPC9oZWFkZXI+XG4gICAgPFBvcnRmb2xpb0dyaWQgZGF0YT17WzEsMiwzLDQsNSw2LDcsOF19Lz5cbjwvZGl2PlxuPHN0eWxlPlxuXG4gICAgLmNvbnRhaW5lci1lbGVtZW50e1xuICAgICAgICBjb2xvcjp3aGl0ZTtcbiAgICAgICAgcGFkZGluZzogY2FsYygxMHB4ICsgMXZ3KTtcbiAgICAgICAgaGVpZ2h0OjEwMHZoO1xuICAgICAgICB3aWR0aDogMTAwdnc7XG4gICAgICAgIG92ZXJmbG93OmhpZGRlbjtcblxuICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIuLi9hc3NldHMvcGljdHVyZXMvY29vbC1iYWNrZ3JvdW5kLnBuZ1wiKTtcbiAgICAgICAgYmFja2dyb3VuZC1zaXplOmNvdmVyO1xuICAgIH1cbiAgICAjaWNvbi13cmFwcGVye1xuICAgICAgICBmb250LXNpemU6IGNhbGMoMzVweCArIDF2dyk7XG4gICAgfVxuICAgIGhlYWRlcntcbiAgICAgICAgZGlzcGxheTpmbGV4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIFxuICAgICAgICBoZWlnaHQ6IDEydmg7XG4gICAgfVxuICAgIGgxe1xuICAgICAgICBmb250LWZhbWlseTogR290aGFtUm91bmRlZDtcbiAgICAgICAgZm9udC1zaXplOiBjYWxjKDM0cHggKyAxLjJ2dyk7XG4gICAgfVxuPC9zdHlsZT4iLCI8c2NyaXB0PlxuICAgIGNvbnN0IHlvdXR1YmVVcmxQYXJhbXMgPSBcIj9hdXRvcGxheT0wJnNob3dpbmZvPTAmZnM9MDsmbG9vcD0wOyZtb2Rlc3RicmFuZGluZz0xOyZyZWw9MDtcIjtcbjwvc2NyaXB0PlxuXG48IS0tIDxpZnJhbWUgd2lkdGg9XCI0MjBcIiBoZWlnaHQ9XCIzMTVcIiB0aXRsZT1cIlwiXG5zcmM9e1wiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvdGdiTnltWjd2cVlcIit5b3V0dWJlVXJsUGFyYW1zfT5cbjwvaWZyYW1lPiAtLT5cblxuXG48c3R5bGU+PC9zdHlsZT4iLCI8c2NyaXB0PlxuICAgIGltcG9ydCB7ZmFkZX0gZnJvbSBcInN2ZWx0ZS90cmFuc2l0aW9uXCI7XG4gICAgaW1wb3J0IEhvbWVQYWdlIGZyb20gXCIuL2hvbWUvSG9tZVBhZ2Uuc3ZlbHRlXCI7XG4gICAgaW1wb3J0IFBvcnRmb2xpbyBmcm9tIFwiLi9wb3J0Zm9saW8vUG9ydGZvbGlvLnN2ZWx0ZVwiO1xuICAgIGltcG9ydCBMYXRlc3RQcm9qZWN0cyBmcm9tIFwiLi9ob21lL0xhdGVzdFByb2plY3RzLnN2ZWx0ZVwiO1xuXG4gICAgJDogY3VycmVudFBhZ2UgPSBcImhvbWVcIjtcblxuICAgIFxuPC9zY3JpcHQ+XG5cbjxIb21lUGFnZS8+XG48IS0tIDxMYXRlc3RQcm9qZWN0cy8+IC0tPlxuXG48IS0tIHsjaWYgY3VycmVudFBhZ2UgPT0gXCJob21lXCJ9XG4gICAgPGRpdiB0cmFuc2l0aW9uOmZhZGU+XG4gICAgPEhvbWVQYWdlIGRpZFRhcFBvcnRmb2xpbz17KCk9PntcbiAgICAgICAgY3VycmVudFBhZ2UgPSBcInBvcnRmb2xpb1wiO1xuICAgICAgICBjb25zb2xlLmxvZyhjdXJyZW50UGFnZSk7XG4gICAgICAgIH19Lz5cbiAgICA8L2Rpdj5cbns6ZWxzZSBpZiBjdXJyZW50UGFnZSA9PSBcInBvcnRmb2xpb1wifVxuICAgIDxkaXYgdHJhbnNpdGlvbjpmYWRlPlxuICAgIDxQb3J0Zm9saW8gZGlkVGFwQmFjaz17KCk9PiB7XG4gICAgICAgIGN1cnJlbnRQYWdlID0gXCJob21lXCI7XG4gICAgICAgIGNvbnNvbGUubG9nKGN1cnJlbnRQYWdlKTtcbiAgICB9fS8+XG4gICAgPC9kaXY+XG57L2lmfSAtLT5cblxuPHN0eWxlPjwvc3R5bGU+IiwiaW1wb3J0IFNwbGFzaCBmcm9tIFwiLi9wYWdlcy9TcGxhc2guc3ZlbHRlXCI7XG5cbmNvbnN0IGFwcCA9IG5ldyBTcGxhc2goe3RhcmdldDogZG9jdW1lbnQuYm9keX0pOyJdLCJuYW1lcyI6WyJsaW5lYXIiXSwibWFwcGluZ3MiOiI7Ozs7O0lBQUEsU0FBUyxJQUFJLEdBQUcsR0FBRztJQUNuQixNQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hCLFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7SUFDMUI7SUFDQSxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksR0FBRztJQUN2QixRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEIsSUFBSSxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFJRCxTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0lBQ3pELElBQUksT0FBTyxDQUFDLGFBQWEsR0FBRztJQUM1QixRQUFRLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtJQUN6QyxLQUFLLENBQUM7SUFDTixDQUFDO0lBQ0QsU0FBUyxHQUFHLENBQUMsRUFBRSxFQUFFO0lBQ2pCLElBQUksT0FBTyxFQUFFLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBQ0QsU0FBUyxZQUFZLEdBQUc7SUFDeEIsSUFBSSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNELFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRTtJQUN0QixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUNELFNBQVMsV0FBVyxDQUFDLEtBQUss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
