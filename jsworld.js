
if(typeof(plt) == 'undefined') {   
    plt = {};
}

plt.Jsworld = {};



// Stuff here is copy-and-pasted from Chris's JSWorld.  We
// namespace-protect it, and add the Javascript <-> Moby wrapper
// functions here.

(function() {

    var Jsworld = plt.Jsworld;


    //
    // WORLD STUFFS
    //

    var world;
    var worldListeners = [];



    // changeWorld: (world -> world) -> void
    // Adjust the world, and notify all listeners.
    function changeWorld(updater) {
	world = updater(world);
	for(var i = 0; i < worldListeners.length; i++) {
	    worldListeners[i](world);
	}
    }


    function addWorldListener(listener) {
	worldListeners.push(listener);
    }



    // pc (profiling) stuff

    //    var pc_times = {}, pc_counts = {};
    //    var pc_time;









    //
    // STUFF THAT SHOULD REALLY BE IN ECMASCRIPT
    //

    function map(a, f) {
	var b = new Array(a.length);
	for (var i = 0; i < a.length; i++) b[i] = f(a[i]);
	return b;
    }
    Jsworld.map = map;


    function concat_map(a, f) {
	var b = [];
	for (var i = 0; i < a.length; i++) b = b.concat(f(a[i]));
	return b;
    }
    Jsworld.concat_map = concat_map;

    function mapi(a, f) {
	var b = new Array(a.length);
	for (var i = 0; i < a.length; i++) b[i] = f(a[i], i);
	return b;
    }
    Jsworld.mapi = mapi;


    function fold(a, x, f) {
	for (var i = 0; i < a.length; i++)
	    x = f(a[i], x);
	return x;

    }
    Jsworld.fold = fold;


    function augment(o, a) {
	var oo = {};
	for (var e in o)
	    oo[e] = o[e];
	for (var e in a)
	    oo[e] = a[e];
	return oo;
    }
    Jsworld.augment = augment;


    function assoc_cons(o, k, v) {
	var oo = {};
	for (var e in o)
	    oo[e] = o[e];
	oo[k] = v;
	return oo;
    }
    Jsworld.assoc_cons = assoc_cons;



    function cons(array, value) {
	return array.concat([value]);
    }
    Jsworld.cons = cons;


    function removeq(array, value) {
	for (var i = 0; i < array.length; i++)
	    if (array[i] === value)
		return array.slice(0, i).concat(array.slice(i+1));
	return array;
    }
    Jsworld.removeq = removeq;


    function removef(array, f) {
	for (var i = 0; i < array.length; i++)
	    if (f(array[i]))
		return array.slice(0, i).concat(array.slice(i+1));
	return array;
    }
    Jsworld.removef = removef;


    function without(obj, attrib) {
	var o = {};
	for (var a in obj)
	    if (a != attrib)
		o[a] = obj[a];
	return o;
    }
    Jsworld.without = without;



    function memberq(a, x) {
	for (var i = 0; i < a.length; i++)
	    if (a[i] === x) return true;
	return false;
    }
    Jsworld.memberq = memberq;
    


    //
    // DOM UPDATING STUFFS
    //

    // tree(N): { node: N, children: [tree(N)] }
    // relation(N): { relation: 'parent', parent: N, child: N } | { relation: 'neighbor', left: N, right: N }
    // relations(N): [relation(N)]
    // nodes(N): [N]
    // css(N): [css_node(N)]
    // css_node(N): { node: N, attribs: attribs } | { className: string, attribs: attribs }
    // attrib: { attrib: string, values: [string] }
    // attribs: [attrib]

    // treeable(nodes(N), relations(N)) = bool
    /*function treeable(nodes, relations) {
    // for all neighbor relations between x and y
    for (var i = 0; i < relations.length; i++)
    if (relations[i].relation == 'neighbor') {
    var x = relations[i].left, y = relations[i].right;
			
    // there does not exist a neighbor relation between x and z!=y or z!=x and y
    for (var j = 0; j < relations.length; j++)
    if (relations[j].relation === 'neighbor')
    if (relations[j].left === x && relations[j].right !== y ||
    relations[j].left !== x && relations[j].right === y)
    return false;
    }
	
    // for all parent relations between x and y
    for (var i = 0; i < relations.length; i++)
    if (relations[i].relation == 'parent') {
    var x = relations[i].parent, y = relations[i].child;
			
    // there does not exist a parent relation between z!=x and y
    for (var j = 0; j < relations.length; j++)
    if (relations[j].relation == 'parent')
    if (relations[j].parent !== x && relations[j].child === y)
    return false;
    }
	
    // for all neighbor relations between x and y
    for (var i = 0; i < relations.length; i++)
    if (relations[i].relation == 'neighbor') {
    var x = relations[i].left, y = relations[i].right;
			
    // all parent relations between z and x or y share the same z
    for (var j = 0; j < relations.length; j++)
    if (relations[j].relation == 'parent')
    for (var k = 0; k < relations.length; k++)
    if (relations[k].relation == 'parent')
    if (relations[j].child === x && relations[k].child === y &&
    relations[j].parent !== relations[k].parent)
    return false;
    }
	
    return true;
    }*/

    // nodes(tree(N)) = nodes(N)
    function nodes(tree) {
	var ret = [tree.node];
	
	for (var i = 0; i < tree.children.length; i++)
	    ret = ret.concat(nodes(tree.children[i]));
	
	return ret;
    }

    // relations(tree(N)) = relations(N)
    function relations(tree) {
	var ret = [];
	
	for (var i = 0; i < tree.children.length; i++)
	    ret.push({ relation: 'parent', parent: tree.node, child: tree.children[i].node });
	
	for (var i = 0; i < tree.children.length - 1; i++)
	    ret.push({ relation: 'neighbor', left: tree.children[i].node, right: tree.children[i + 1].node });
	
	for (var i = 0; i < tree.children.length; i++)
	    ret = ret.concat(relations(tree.children[i]));
	
	return ret;
    }


//     function pcClear() {
// 	pc_time = new Date().getTime();
//     }

//     function pcRead(label) {
// 	var then = pc_time;
// 	pc_time = new Date().getTime();
	
// 	if (label in pc_times) {
// 	    pc_times[label] += pc_time - then;
// 	    pc_counts[label]++;
// 	}
// 	else {
// 	    pc_times[label] = pc_time - then;
// 	    pc_counts[label] = 1;
// 	}
//     }

//     function pcDump() {
// 	var s = [];
	
// 	for (label in pc_times)
// 	    s.push(label + ": " + (pc_times[label] / pc_counts[label]));
	
// 	return s;
//     }

    // update_dom(nodes(Node), relations(Node)) = void
    function update_dom(toplevelNode, nodes, relations) {
	//	pcClear();
	
	// move all children to their proper parents
	for (var i = 0; i < relations.length; i++)
	    if (relations[i].relation == 'parent') {
		var parent = relations[i].parent, child = relations[i].child;
			
		if (child.parentNode === null || !parent.isSameNode(child.parentNode))
		    parent.appendChild(child);
	    }
	
	//      pcRead('move');
	
	// arrange siblings in proper order
	// truly terrible... BUBBLE SORT
	for (;;) {
	    var unsorted = false;
		
	    for (var i = 0; i < relations.length; i++)
		if (relations[i].relation == 'neighbor') {
		    var left = relations[i].left, right = relations[i].right;
				
		    if (left.nextSibling !== right) {
			left.parentNode.insertBefore(left, right)
			    unsorted = true;
		    }
		}
		
	    if (!unsorted) break;
	}
	
	//       pcRead('sort');
	
	// remove dead nodes
	var live_nodes;
	
	// it is my hope that by sorting the nodes we get the worse of
	// O(n*log n) or O(m) performance instead of O(n*m)
	// for all I know Node.compareDocumentPosition is O(m)
	// and now we get O(n*m*log n)
	function positionComparator(a, b) {
	    var rel = a.compareDocumentPosition(b);
	    // children first
	    if (rel & a.DOCUMENT_POSITION_CONTAINED_BY) return 1;
	    if (rel & a.DOCUMENT_POSITION_CONTAINS) return -1;
	    // otherwise use precedes/follows
	    if (rel & a.DOCUMENT_POSITION_FOLLOWING) return -1;
	    if (rel & a.DOCUMENT_POSITION_PRECEDING) return 1;
	    // otherwise same node or don't care, we'll skip it anyway
	    return 0;
	}
	
	try {
	    // don't take out concat, it doubles as a shallow copy
	    // (as well as ensuring we keep document.body)
	    live_nodes = nodes.concat(toplevelNode).sort(positionComparator);
	}
	catch (e) {
	    // probably doesn't implement Node.compareDocumentPosition
	    live_nodes = null;
	}
	
	//	pcRead('prune sort');
	
	var node = toplevelNode, stop = toplevelNode.parentNode;
	while (node !== stop) {
	    for (;;) {
		// process first
		// move down
		if (node.firstChild === null) break;
		node = node.firstChild;
	    }
		
	    while (node !== stop) {
		var next = node.nextSibling, parent = node.parentNode;
			
		// process last
		var found = false;
			
		if (live_nodes !== null)
		    while (live_nodes.length > 0 && node.isSameNode(live_nodes[0])) {
			var other_node = live_nodes.shift();
			found = true;
			break;
		    }
		else
		    for (var i = 0; i < nodes.length; i++)
			if (nodes[i] === node) {
			    found = true;
			    break;
			}
			
		if (!found) {
		    // reparent children, remove node
		    while (node.firstChild !== null)
			node.parentNode.appendChild(node.firstChild);
				
		    next = node.nextSibling; // HACKY
				
		    node.parentNode.removeChild(node);
		}
			
		// move sideways
		if (next === null) node = parent;
		else { node = next; break; }
	    }
	}
	
	//	pcRead('prune');
    }

    function set_css_attribs(node, attribs) {
	for (var j = 0; j < attribs.length; j++)
	    node.style.setProperty(attribs[j].attrib, attribs[j].values.join(" "), '');
    }

    function update_css(nodes, css) {
	// clear CSS
	for (var i = 0; i < nodes.length; i++)
	    if ('style' in nodes[i])
		nodes[i].style.cssText = "";
	
	// set CSS
	for (var i = 0; i < css.length; i++)
	    if ('className' in css[i]) {
		for (var j = 0; j < nodes.length; j++)
		    if (nodes[j].className == css[i].className)
			set_css_attribs(nodes[j], css[i].attribs);
	    }
	    else set_css_attribs(css[i].node, css[i].attribs);
    }



    function sexp2tree(sexp) {
	return { node: sexp[0], children: map(sexp.slice(1), sexp2tree) };
    }

    function sexp2attrib(sexp) {
	return { attrib: sexp[0], values: sexp.slice(1) };
    }

    function sexp2css_node(sexp) {
	var attribs = map(sexp.slice(1), sexp2attrib);
	if (typeof sexp[0] == 'string')
	    return { className: sexp[0], attribs: attribs };
	else if ('length' in sexp[0])
	    return map(sexp[0], function (node) { return { node: node, attribs: attribs } });
	else
	    return { node: sexp[0], attribs: attribs };
    }

    function sexp2css(sexp) {
	return concat_map(sexp, sexp2css_node);
    }

    function do_redraw(world, toplevelNode, redraw_func, redraw_css_func) {
	var t = sexp2tree(redraw_func(world));
	var ns = nodes(t);
	update_dom(toplevelNode, ns, relations(t));
	update_css(ns, sexp2css(redraw_css_func(world)));
    }



    Jsworld.big_bang = function(top, 
				init_world, 
				redraw, 
				redraw_css, 
				handlers,
				attribs) {

	addWorldListener(function(w) { 
		do_redraw(w, top, redraw, redraw_css); });
	for(var i = 0 ; i < handlers.length; i++) {
	    handlers[i].onRegister();
	}
	copy_attribs(top, attribs);
	changeWorld(function(w) { return init_world; });
    }


//     function onDraw(f) {
// 	// fill me in
//     }

//     function onDrawCss(f) {
//     }


    function on_tick(delay, tick) {
	var ticker = {
	    watchId: -1,
	    onRegister: function () { 
		ticker.watchId = setInterval(function() { changeWorld(tick); },
					     delay);
	    },

	    onUnregister: function () {
		clearInterval(ticker.watchId);
	    }
	};
	return ticker;
    }
    Jsworld.on_tick = on_tick;




    //
    // DOM CREATION STUFFS
    //

    // apparently add_event is taken...
    function add_ev(node, event, f) {
	node.addEventListener(event, 
			      function (e) { 
				  changeWorld(function(w) { return f(w, e); }) }, 
			      false);
    }

    function copy_attribs(node, attribs) {
	if (attribs)
	    for (a in attribs)
		if (typeof attribs[a] == 'function')
		    add_ev(node, a, attribs[a]);
		else
		    node[a] = attribs[a];
	return node;
    }

    Jsworld.p = function(attribs) {
	return copy_attribs(document.createElement('p'), attribs);
    }

    Jsworld.div = function(attribs) {
	return copy_attribs(document.createElement('div'), attribs);
    }

    Jsworld.button = function(f, attribs) {
	var n = document.createElement('button');
	add_ev(n, 'click', f);
	return copy_attribs(n, attribs);
    }

    Jsworld.input = function(type, attribs) {
	var n = document.createElement('input');
	n.type = type;
	return copy_attribs(n, attribs);
    }

    Jsworld.text = function(s, attribs) {
	return copy_attribs(document.createTextNode(s), attribs);
    }


})();